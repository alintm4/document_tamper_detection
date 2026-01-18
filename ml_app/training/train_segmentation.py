import os
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from tqdm import tqdm

from ml_app.datasets.casia_segmentation import CASIASegmentationDataset
from ml_app.models.unet import UNet

# ================= CONFIG =================
DEVICE = "cpu"                 # Intel Iris Xe safe
BATCH_SIZE = 10                 # CPU-friendly
EPOCHS = 2                    # Safe for overnight training
LR = 1e-4
NUM_WORKERS = 0                # VERY IMPORTANT on Arch Linux

DATA_ROOT = "data/casia"
MODEL_OUT = "outputs/models/unet_casia.pth"
# ==========================================

os.makedirs("outputs/models", exist_ok=True)

# ---------------- DATA ----------------
train_ds = CASIASegmentationDataset(DATA_ROOT, "train")
val_ds   = CASIASegmentationDataset(DATA_ROOT, "val")

train_loader = DataLoader(
    train_ds,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=NUM_WORKERS,
    pin_memory=False
)

val_loader = DataLoader(
    val_ds,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=NUM_WORKERS,
    pin_memory=False
)

# ---------------- MODEL ----------------
model = UNet()
model.to(DEVICE)

# IMPORTANT: assume UNet DOES NOT apply sigmoid at the end
criterion = nn.BCEWithLogitsLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=LR)

# ---------------- TRAIN ----------------
print("\n🚀 Starting segmentation training...\n")

for epoch in range(EPOCHS):
    model.train()
    train_loss = 0.0

    train_bar = tqdm(
        train_loader,
        desc=f"Epoch {epoch+1}/{EPOCHS} [TRAIN]",
        leave=False
    )

    for imgs, masks in train_bar:
        imgs = imgs.to(DEVICE)
        masks = masks.to(DEVICE)

        optimizer.zero_grad()
        logits = model(imgs)
        loss = criterion(logits, masks)
        loss.backward()
        optimizer.step()

        train_loss += loss.item()
        train_bar.set_postfix(loss=loss.item())

    train_loss /= len(train_loader)

    # -------- VALIDATION --------
    model.eval()
    val_loss = 0.0

    with torch.no_grad():
        for imgs, masks in val_loader:
            imgs = imgs.to(DEVICE)
            masks = masks.to(DEVICE)

            logits = model(imgs)
            loss = criterion(logits, masks)
            val_loss += loss.item()

    val_loss /= len(val_loader)

    print(
        f"Epoch {epoch+1}/{EPOCHS} | "
        f"Train Loss: {train_loss:.4f} | "
        f"Val Loss: {val_loss:.4f}"
    )

# ---------------- SAVE ----------------
torch.save(model.state_dict(), MODEL_OUT)

print("\n Segmentation training completed.")
print(f"Model saved to: {MODEL_OUT}")
