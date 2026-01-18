import os
import torch
import numpy as np
import matplotlib.pyplot as plt

from PIL import Image
from tqdm import tqdm
from sklearn.metrics import (
    confusion_matrix,
    ConfusionMatrixDisplay,
    roc_curve,
    auc,
    classification_report
)

from torchvision import transforms
from ml_app.models.classifier import TamperClassifier


# ---------------- CONFIG ----------------
DATA_DIR = "data/casia/images"
MODEL_PATH = "outputs/models/classifier_casia.pth"
DEVICE = "cpu"          # Intel Iris Xe
IMG_SIZE = 224
CLASS_NAMES = ["Real", "Tampered"]
# --------------------------------------


# ---------------- TRANSFORMS ----------------
transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ---------------- LOAD MODEL ----------------
model = TamperClassifier()
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.to(DEVICE)
model.eval()


# ---------------- LOAD DATA ----------------
def load_images(folder, label):
    samples = []
    for fname in os.listdir(folder):
        if fname.lower().endswith((".jpg", ".png", ".jpeg")):
            samples.append((os.path.join(folder, fname), label))
    return samples

authentic = load_images(os.path.join(DATA_DIR, "real"), 0)
tampered  = load_images(os.path.join(DATA_DIR, "tampered"), 1)

dataset = authentic + tampered
print(f"Total samples: {len(dataset)}")


# ---------------- INFERENCE ----------------
y_true = []
y_pred = []
y_scores = []   # probability of "tampered"

with torch.no_grad():
    for path, label in tqdm(dataset):
        img = Image.open(path).convert("RGB")
        img = transform(img).unsqueeze(0).to(DEVICE)

        logits = model(img)
        probs = torch.softmax(logits, dim=1)

        pred = torch.argmax(probs, dim=1).item()
        tampered_prob = probs[0, 1].item()

        y_true.append(label)
        y_pred.append(pred)
        y_scores.append(tampered_prob)

y_true = np.array(y_true)
y_pred = np.array(y_pred)
y_scores = np.array(y_scores)


# ---------------- CONFUSION MATRIX ----------------
cm = confusion_matrix(y_true, y_pred)
disp = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=CLASS_NAMES
)

disp.plot(cmap="Blues")
plt.title("Confusion Matrix – CASIA Tamper Classifier")
plt.show()


# ---------------- ROC CURVE ----------------
fpr, tpr, _ = roc_curve(y_true, y_scores)
roc_auc = auc(fpr, tpr)

plt.figure()
plt.plot(fpr, tpr, label=f"AUC = {roc_auc:.3f}")
plt.plot([0, 1], [0, 1], linestyle="--")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC Curve – CASIA Tamper Classifier")
plt.legend()
plt.show()


# ---------------- METRICS ----------------
print("\nClassification Report:\n")
print(classification_report(
    y_true,
    y_pred,
    target_names=CLASS_NAMES
))

print(f"ROC-AUC Score: {roc_auc:.4f}")
