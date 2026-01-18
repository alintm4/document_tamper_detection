import os
import torch
from torch import nn, optim
from torch.utils.data import DataLoader
from torchvision import transforms
from tqdm import tqdm

from ml_app.datasets.casia_classification import CASIAClassificationDataset
from ml_app.models.classifier import TamperClassifier

# ---------------- CONFIG ----------------
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
BATCH_SIZE = 16
EPOCHS = 10
LR = 1e-4

DATA_ROOT = "data/casia"
MODEL_OUT = "outputs/models/classifier_best.pth"
# --------------------------------------

os.makedirs("outputs/models", exist_ok=True)

# ---------------- TRANSFORMS ----------------
transform = transforms.Compose([
    transforms.Resize((512, 512)),
    transforms.ToTensor(),
])

# ---------------- DATA ----------------
train_ds = CASIAClassificationDataset(DATA_ROOT, "train", transform)
val_ds   = CASIAClassificationDataset(DATA_ROOT, "val", transform)

train_loader = DataLoader(
    train_ds, batch_size=BATCH_SIZE,
    shuffle=True, num_workers=4, pin_memory=True
)

val_loader = DataLoader(
    val_ds, batch_size=BATCH_SIZE,
    shuffle=False, num_workers=4, pin_memory=True
)

# ---------------- MODEL ----------------
model = TamperClassifier().to(DEVICE)
criterion = nn.CrossEntropyLoss()
optimizer = optim.AdamW(model.parameters(), lr=LR)

best_acc = 0.0

# ---------------- TRAIN ----------------
print(f"\n🚀 Classification training on {DEVICE}\n")

for epoch in range(EPOCHS):
    model.train()
    train_loss = 0.0

    train_bar = tqdm(train_loader, desc=f"Epoch {epoch+1}/{EPOCHS}")

    for imgs, labels in train_bar:
        imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)

        optimizer.zero_grad()
        outputs = model(imgs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        train_loss += loss.item()
        train_bar.set_postfix(loss=f"{loss.item():.4f}")

    train_loss /= len(train_loader)

    # -------- VALIDATION --------
    model.eval()
    correct = 0
    total = 0
    val_loss = 0.0

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
        f"📊 Epoch {epoch+1}/{EPOCHS} | "
        f"Train Loss: {train_loss:.4f} | "
        f"Val Loss: {val_loss:.4f} | "
        f"Val Acc: {val_acc:.4f}"
    )

    # -------- SAVE BEST --------
    if val_acc > best_acc:
        best_acc = val_acc
        torch.save(model.state_dict(), MODEL_OUT)
        print(f"💾 New best model saved (Acc={best_acc:.4f})")

print("\n✅ Classification training complete")
