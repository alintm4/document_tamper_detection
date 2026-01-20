import sys
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image

MODEL_PATH = "outputs/models/classifier_casia.pth"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
IMG_SIZE = 224
CLASS_NAMES = ["authentic", "tampered"]

class DocumentClassifier(nn.Module):
    def __init__(self, num_classes=2):
        super().__init__()

        self.backbone = models.mobilenet_v3_small(weights=None)

        in_features = self.backbone.classifier[3].in_features
        self.backbone.classifier[3] = nn.Linear(in_features, num_classes)

    def forward(self, x):
        return self.backbone(x)

transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


def load_image(path):
    img = Image.open(path).convert("RGB")
    img = transform(img).unsqueeze(0)
    return img

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python test_classifier.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]

    model = DocumentClassifier().to(DEVICE)

    state_dict = torch.load(MODEL_PATH, map_location=DEVICE)
    model.load_state_dict(state_dict)
    model.eval()

    image = load_image(image_path).to(DEVICE)

    with torch.no_grad():
        logits = model(image)
        probs = F.softmax(logits, dim=1)
        conf, pred = torch.max(probs, dim=1)

    print("\n==============================")
    print(f"Image      : {image_path}")
    print(f"Prediction : {CLASS_NAMES[pred.item()].upper()}")
    print(f"Confidence : {conf.item():.4f}")
    print("==============================\n")
