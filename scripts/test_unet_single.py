import torch
import matplotlib.pyplot as plt
from PIL import Image
from torchvision import transforms
from ml_app.models.unet import UNet

DEVICE = "cpu"
MODEL_PATH = "outputs/models/unet_casia.pth"

transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor()
])

# ✅ correct constructor
model = UNet(n_classes=1)
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.eval()

# test image (tampered)
img_path = "data/casia/images/tampered/Tp_D_CNN_M_N_nat00041_nat10123_11439.jpg"
img = Image.open(img_path).convert("RGB")

x = transform(img).unsqueeze(0)

with torch.no_grad():
    logits = model(x)
    mask = torch.sigmoid(logits)[0, 0].numpy()

plt.figure(figsize=(12, 4))

plt.subplot(1, 3, 1)
plt.imshow(img)
plt.title("Input Image")
plt.axis("off")

plt.subplot(1, 3, 2)
plt.imshow(mask, cmap="hot")
plt.title("Predicted Tamper Mask")
plt.axis("off")

plt.subplot(1, 3, 3)
plt.imshow(img)
plt.imshow(mask > 0.5, alpha=0.5, cmap="Reds")
plt.title("Overlay")
plt.axis("off")

plt.savefig("unet_prediction.png", dpi=200, bbox_inches="tight")
print("Saved: unet_prediction.png")
