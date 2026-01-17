import torch
from torch import nn, optim
from torch.utils.data import DataLoader

from ml_app.models.classifier import TamperClassifier
from ml_app.datasets.casia import CASIAPatchDataset

# ---------------- CONFIG ----------------
DEVICE = "cpu"

BATCH_SIZE = 8          # ↓ reduced for CPU
EPOCHS = 2              # ↓ reduced for testing
LR = 1e-4

DATA_ROOT = "data/casia/patches_reduced/train"
MODEL_OUT = "outputs/classifier_cpu_test.pth"

MAX_SAMPLES = 1500      # ⬅️ IMPORTANT: limit dataset for testing
LOG_INTERVAL = 10       # print every N batches
# ----------------------------------------


# ---------------- DATA ----------------
dataset = CASIAPatchDataset(DATA_ROOT)

# Limit dataset size (VERY IMPORTANT for CPU)
if len(dataset) > MAX_SAMPLES:
    dataset.samples = dataset.samples[:MAX_SAMPLES]

loader = DataLoader(
    dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0,
    pin_memory=False
)

print(f"📦 Training samples: {len(dataset)}")
print(f"🧠 Device: {DEVICE}")

# ---------------- MODEL ----------------
model = TamperClassifier().to(DEVICE)

criterion = nn.CrossEntropyLoss()

optimizer = optim.AdamW(
    filter(lambda p: p.requires_grad, model.parameters()),
    lr=LR
)

# ---------------- TRAIN ----------------
for epoch in range(EPOCHS):
    model.train()
    running_loss = 0.0

    print(f"\n🚀 Epoch {epoch+1}/{EPOCHS}")

    for i, (imgs, labels) in enumerate(loader):
        imgs = imgs.to(DEVICE)
        labels = labels.to(DEVICE)

        optimizer.zero_grad()
        outputs = model(imgs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()

        if i % LOG_INTERVAL == 0:
            print(
                f"  Step [{i}/{len(loader)}] "
                f"Loss: {loss.item():.4f}"
            )

    avg_loss = running_loss / len(loader)
    print(f"✅ Epoch {epoch+1} completed | Avg Loss: {avg_loss:.4f}")

# ---------------- SAVE ----------------
torch.save(model.state_dict(), MODEL_OUT)
print(f"\n💾 Model saved to {MODEL_OUT}")
