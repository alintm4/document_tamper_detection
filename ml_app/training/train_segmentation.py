import os
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from tqdm import tqdm

from ml_app.datasets.casia_segmentation import CASIASegmentationDataset
from ml_app.models.segmenter import TamperSegmenter

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
BATCH_SIZE = 8
EPOCHS = 10
LR = 1e-4
NUM_WORKERS = 4

DATA_ROOT = "data/casia"
MODEL_OUT = "outputs/models/deeplabv3_final.pth"
CKPT_DIR = "outputs/checkpoints/segmentation"

os.makedirs("outputs/models", exist_ok=True)
os.makedirs(CKPT_DIR, exist_ok=True)

def dice_score(logits, masks, eps=1e-6):
    preds = torch.sigmoid(logits)
    preds = (preds > 0.5).float()
    intersection = (preds * masks).sum()
    union = preds.sum() + masks.sum()
    return (2 * intersection + eps) / (union + eps)

train_ds = CASIASegmentationDataset(DATA_ROOT, "train")
val_ds   = CASIASegmentationDataset(DATA_ROOT, "val")

train_loader = DataLoader(
    train_ds, batch_size=BATCH_SIZE,
    shuffle=True, num_workers=NUM_WORKERS, pin_memory=True
)

val_loader = DataLoader(
    val_ds, batch_size=BATCH_SIZE,
    shuffle=False, num_workers=NUM_WORKERS, pin_memory=True
)

model = TamperSegmenter().to(DEVICE)
criterion = nn.BCEWithLogitsLoss()
optimizer = torch.optim.AdamW(model.parameters(), lr=LR)

print(f"\nSegmentation training on {DEVICE}\n")

for epoch in range(EPOCHS):
    model.train()
    train_loss = 0.0

    train_bar = tqdm(
        train_loader,
        desc=f"Epoch {epoch+1}/{EPOCHS}",
        leave=True
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
        train_bar.set_postfix(loss=f"{loss.item():.4f}")

    train_loss /= len(train_loader)

    model.eval()
    val_loss = 0.0
    val_dice = 0.0

    with torch.no_grad():
        for imgs, masks in val_loader:
            imgs = imgs.to(DEVICE)
            masks = masks.to(DEVICE)
            logits = model(imgs)
            loss = criterion(logits, masks)

            val_loss += loss.item()
            val_dice += dice_score(logits, masks).item()

    val_loss /= len(val_loader)
    val_dice /= len(val_loader)

    print(
        f"Epoch {epoch+1}/{EPOCHS} | "
        f"Train Loss: {train_loss:.4f} | "
        f"Val Loss: {val_loss:.4f} | "
        f"Dice: {val_dice:.4f}"
    )

    torch.save({
        "epoch": epoch + 1,
        "model": model.state_dict(),
        "optimizer": optimizer.state_dict()
    }, f"{CKPT_DIR}/epoch_{epoch+1}.pt")

torch.save(model.state_dict(), MODEL_OUT)
print(f"\nFinal segmentation model saved to {MODEL_OUT}")
