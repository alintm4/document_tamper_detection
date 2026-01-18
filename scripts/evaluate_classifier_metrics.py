import os
import torch
import torch.nn.functional as F
import numpy as np
from PIL import Image
from torchvision import transforms
from sklearn.metrics import confusion_matrix, roc_curve, auc
import matplotlib.pyplot as plt

from ml_app.models.classifier import TamperClassifier

# ---------------- CONFIG ----------------
DEVICE = "cpu"
MODEL_PATH = "outputs/models/classifier_casia.pth"
DATA_ROOT = "data/casia/images"
OUT_DIR = "outputs/metrics"
os.makedirs(OUT_DIR, exist_ok=True)
# ---------------------------------------

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

def load_images(folder, label):
    data = []
    for fname in os.listdir(folder):
        if fname.lower().endswith((".jpg", ".png", ".jpeg")):
            data.append((os.path.join(folder, fname), label))
    return data


# CASIA structure
authentic = load_images(os.path.join(DATA_ROOT, "real"), 0)
tampered  = load_images(os.path.join(DATA_ROOT, "tampered"), 1)
dataset = authentic + tampered

print(f"Total samples: {len(dataset)}")

model = TamperClassifier().to(DEVICE)
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.eval()

y_true = []
y_scores = []
y_pred = []

with torch.no_grad():
    for path, label in dataset:
        img = Image.open(path).convert("RGB")
        img = transform(img).unsqueeze(0).to(DEVICE)

        logits = model(img)
        probs = F.softmax(logits, dim=1)[0, 1].item()
        pred = int(probs > 0.5)

        y_true.append(label)
        y_scores.append(probs)
        y_pred.append(pred)

# -------- CONFUSION MATRIX --------
cm = confusion_matrix(y_true, y_pred)
plt.figure(figsize=(4, 4))
plt.imshow(cm, cmap="Blues")
plt.title("Confusion Matrix")
plt.xlabel("Predicted")
plt.ylabel("True")
plt.colorbar()

for i in range(2):
    for j in range(2):
        plt.text(j, i, cm[i, j], ha="center", va="center")

plt.savefig(f"{OUT_DIR}/confusion_matrix.png", dpi=200)
plt.close()

# -------- ROC CURVE --------
fpr, tpr, _ = roc_curve(y_true, y_scores)
roc_auc = auc(fpr, tpr)

plt.figure()
plt.plot(fpr, tpr, label=f"AUC = {roc_auc:.3f}")
plt.plot([0, 1], [0, 1], linestyle="--")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC Curve")
plt.legend()
plt.savefig(f"{OUT_DIR}/roc_curve.png", dpi=200)
plt.close()

print(f"ROC AUC Score: {roc_auc:.4f}")
print("Saved:")
print(" - outputs/metrics/confusion_matrix.png")
print(" - outputs/metrics/roc_curve.png")
