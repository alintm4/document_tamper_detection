import torch
from PIL import Image
from torchvision import transforms
from ml_app.models.classifier import TamperClassifier

DEVICE = "cpu"
MODEL_PATH = "outputs/models/classifier_casia.pth"

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

model = TamperClassifier()
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.eval()

def predict(image_path):
    img = Image.open(image_path).convert("RGB")
    x = transform(img).unsqueeze(0)

    with torch.no_grad():
        logits = model(x)
        prob = torch.softmax(logits, dim=1)[0, 1].item()

    return prob

img = "documents/raman_marksheet.png"
score = predict(img)

print(f"Tampered probability: {score:.4f}")
print("Prediction:", "TAMPERED" if score > 0.55 else "AUTHENTIC")
