import torch
import torch.nn.functional as F
import numpy as np
import cv2
from PIL import Image
from torchvision import transforms
import matplotlib.pyplot as plt

from ml_app.models.classifier import TamperClassifier

DEVICE = "cpu"
MODEL_PATH = "outputs/models/classifier_casia.pth"

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

model = TamperClassifier().to(DEVICE)
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.eval()

features = []
gradients = []

def forward_hook(module, input, output):
    features.append(output)

def backward_hook(module, grad_in, grad_out):
    gradients.append(grad_out[0])

target_layer = model.backbone.features[-1]
target_layer.register_forward_hook(forward_hook)
target_layer.register_backward_hook(backward_hook)


def gradcam(image_path):
    features.clear()
    gradients.clear()

    img = Image.open(image_path).convert("RGB")
    img_t = transform(img).unsqueeze(0).to(DEVICE)

    logits = model(img_t)
    class_idx = logits.argmax(dim=1).item()

    model.zero_grad()
    logits[0, class_idx].backward()

    fmap = features[0][0].detach()
    grad = gradients[0][0].detach()

    weights = grad.mean(dim=(1, 2))
    cam = torch.zeros(fmap.shape[1:], dtype=torch.float32)

    for i, w in enumerate(weights):
        cam += w * fmap[i]

    cam = F.relu(cam)
    cam = cam.numpy()
    cam = cv2.resize(cam, (224, 224))
    cam = cam / (cam.max() + 1e-8)

    img_np = np.array(img.resize((224, 224)))
    heatmap = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(img_np, 0.6, heatmap, 0.4, 0)

    plt.figure(figsize=(10, 4))
    plt.subplot(1, 3, 1); plt.title("Original"); plt.imshow(img_np); plt.axis("off")
    plt.subplot(1, 3, 2); plt.title("Grad-CAM"); plt.imshow(heatmap); plt.axis("off")
    plt.subplot(1, 3, 3); plt.title("Overlay"); plt.imshow(overlay); plt.axis("off")

    out = "outputs/metrics/gradcam_result.png"
    plt.savefig(out, dpi=200, bbox_inches="tight")
    plt.close()

    print(f"Grad-CAM saved to {out}")


if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python gradcam_classifier.py <image>")
        exit(1)

    gradcam(sys.argv[1])
