import os
import torch
import torch.nn.functional as F
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
from torchvision import transforms

from ml_app.models.classifier import TamperClassifier
from ml_app.models.unet import UNet

# ---------------- CONFIG ----------------
DEVICE = "cpu"
CLASSIFIER_PATH = "outputs/models/classifier_casia.pth"
UNET_PATH = "outputs/models/unet_casia.pth"
THRESHOLD = 0.35
OUT_DIR = "outputs/results"
os.makedirs(OUT_DIR, exist_ok=True)
# ---------------------------------------


cls_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

seg_transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor(),
])


def load_image(path, transform):
    img = Image.open(path).convert("RGB")
    return transform(img).unsqueeze(0)


def compute_tampered_area(mask, threshold=0.5):
    binary = (mask > threshold).astype(np.uint8)
    return (binary.sum() / binary.size) * 100


def severity_level(area):
    if area < 2:
        return "LOW"
    elif area < 10:
        return "MEDIUM"
    else:
        return "HIGH"


# -------- LOAD MODELS --------
classifier = TamperClassifier().to(DEVICE)
classifier.load_state_dict(torch.load(CLASSIFIER_PATH, map_location=DEVICE))
classifier.eval()

segmenter = UNet().to(DEVICE)
segmenter.load_state_dict(torch.load(UNET_PATH, map_location=DEVICE))
segmenter.eval()


def run_pipeline(image_path):
    name = os.path.splitext(os.path.basename(image_path))[0]

    img_cls = load_image(image_path, cls_transform).to(DEVICE)

    with torch.no_grad():
        logits = classifier(img_cls)
        probs = F.softmax(logits, dim=1)
        tamper_prob = probs[0, 1].item()

    print(f"\nTampered Probability : {tamper_prob:.4f}")

    if tamper_prob < THRESHOLD:
        print("Result : AUTHENTIC DOCUMENT")
        return

    print("Result : TAMPERED DOCUMENT")

    img_seg = load_image(image_path, seg_transform).to(DEVICE)

    with torch.no_grad():
        mask = segmenter(img_seg)[0, 0].cpu().numpy()

    area = compute_tampered_area(mask)
    severity = severity_level(area)

    print(f"Tampered Area        : {area:.2f}%")
    print(f"Severity Level       : {severity}")

    original = Image.open(image_path).convert("RGB").resize((256, 256))

    plt.figure(figsize=(10, 4))
    plt.subplot(1, 3, 1)
    plt.imshow(original); plt.title("Original"); plt.axis("off")

    plt.subplot(1, 3, 2)
    plt.imshow(mask, cmap="gray"); plt.title("Mask"); plt.axis("off")

    plt.subplot(1, 3, 3)
    plt.imshow(original)
    plt.imshow(mask, cmap="jet", alpha=0.5)
    plt.title("Localization")
    plt.axis("off")

    out_path = os.path.join(OUT_DIR, f"{name}_analysis.png")
    plt.savefig(out_path, dpi=200, bbox_inches="tight")
    plt.close()

    print(f"Saved visualization  : {out_path}")


if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python run_full_pipeline.py <image>")
        exit(1)

    run_pipeline(sys.argv[1])
