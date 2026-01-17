import torch
from torch.utils.data import DataLoader
from datasets.patch_dataset import PatchDataset
from models.classifier import TamperClassifier
from torch import nn, optim

device = "cuda" if torch.cuda.is_available() else "cpu"

ds = PatchDataset("data/doctamper/metadata.csv")
dl = DataLoader(ds, batch_size=32, shuffle=True, num_workers=4)

model = TamperClassifier().to(device)
criterion = nn.CrossEntropyLoss()
optimizer = optim.AdamW(model.parameters(), lr=1e-4)

for epoch in range(5):
    model.train()
    total_loss = 0

    for x, y in dl:
        x, y = x.to(device), y.to(device)
        optimizer.zero_grad()
        out = model(x)
        loss = criterion(out, y)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()

    print(f"Epoch {epoch+1} | Loss: {total_loss:.4f}")

torch.save(model.state_dict(), "tamper_classifier.pth")
print("Model saved")
