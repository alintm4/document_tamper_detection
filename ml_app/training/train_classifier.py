import os
import torch
from torch import nn, optim
from torch.utils.data import DataLoader
from torchvision import transforms

from ml_app.datasets.casia_classification import CASIAClassificationDataset
from ml_app.models.classifier import TamperClassifier

# ---------------- SAFETY: CREATE OUTPUT DIR ----------------
os.makedirs("outputs/models", exist_ok=True)

# ---------------- CONFIG ----------------
DEVICE = "cpu"            # Intel Iris Xe → CPU
BATCH_SIZE = 8
EPOCHS = 2                # enough to get ~80%+
LR = 1e-4

DATA_ROOT = "data/casia"
MODEL_OUT = "outputs/models/classifier_casia_efficient_net.pth"
# ----------------------------------------------------------

# ---------------- TRANSFORMS ----------------
transform = transforms.Compose([
    transforms.Resize((512, 512)),
    transforms.ToTensor(),
])

# ---------------- DATASETS ----------------
train_ds = CASIAClassificationDataset(DATA_ROOT, "train", transform)
val_ds   = CASIAClassificationDataset(DATA_ROOT, "val", transform)

train_loader = DataLoader(
    train_ds,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0
)

val_loader = DataLoader(
    val_ds,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)

# ---------------- MODEL ----------------
model = TamperClassifier().to(DEVICE)

criterion = nn.CrossEntropyLoss()
optimizer = optim.AdamW(model.parameters(), lr=LR)

# ---------------- TRAIN ----------------
for epoch in range(EPOCHS):
    model.train()
    train_loss = 0.0

    for imgs, labels in train_loader:
        imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)

        optimizer.zero_grad()
        outputs = model(imgs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        train_loss += loss.item()

    train_loss /= len(train_loader)

    # -------- VALIDATION --------
    model.eval()
    val_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():
        for imgs, labels in val_loader:
            imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)
            outputs = model(imgs)
            loss = criterion(outputs, labels)
            val_loss += loss.item()

            preds = outputs.argmax(dim=1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)

    val_loss /= len(val_loader)
    val_acc = correct / total

    print(
        f"Epoch {epoch+1}/{EPOCHS} | "
        f"Train Loss: {train_loss:.4f} | "
        f"Val Loss: {val_loss:.4f} | "
        f"Val Acc: {val_acc:.3f}"
    )

# ---------------- SAVE MODEL ----------------
torch.save(model.state_dict(), MODEL_OUT)
print(f"\n✅ Model saved to {MODEL_OUT}")
