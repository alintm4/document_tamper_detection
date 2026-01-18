import streamlit as st
import torch
import torch.nn.functional as F
import numpy as np
from PIL import Image
from torchvision import transforms

from ml_app.models.classifier import TamperClassifier
from ml_app.models.unet import UNet

DEVICE = "cpu"

cls_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

seg_transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor(),
])

@st.cache_resource
def load_models():
    clf = TamperClassifier().to(DEVICE)
    clf.load_state_dict(torch.load("outputs/models/classifier_casia.pth", map_location=DEVICE))
    clf.eval()

    seg = UNet().to(DEVICE)
    seg.load_state_dict(torch.load("outputs/models/unet_casia.pth", map_location=DEVICE))
    seg.eval()

    return clf, seg


def compute_area(mask):
    binary = (mask > 0.5).astype(np.uint8)
    return (binary.sum() / binary.size) * 100


def severity(area):
    if area < 2:
        return "LOW"
    elif area < 10:
        return "MEDIUM"
    return "HIGH"


st.set_page_config(page_title="Document Tampering Detection", layout="wide")
st.title("AI-based Document Tampering Detection")

uploaded = st.file_uploader(
    "Upload document image",
    type=["png", "jpg", "jpeg"]
)

if uploaded:
    image = Image.open(uploaded).convert("RGB")

    st.image(
        image,
        caption="Uploaded Document",
        width=700
    )

    classifier, segmenter = load_models()

    img_cls = cls_transform(image).unsqueeze(0)

    with torch.no_grad():
        logits = classifier(img_cls)
        prob = F.softmax(logits, dim=1)[0, 1].item()

    st.metric("Tampered Probability", f"{prob:.3f}")

    if prob > 0.35:
        img_seg = seg_transform(image).unsqueeze(0)

        with torch.no_grad():
            mask = segmenter(img_seg)[0, 0].cpu().numpy()

        area = compute_area(mask)
        sev = severity(area)

        st.metric("Tampered Area (%)", f"{area:.2f}")
        st.metric("Severity Level", sev)

        st.subheader("Tampering Localization")
        st.image(mask, clamp=True, width=400)
    else:
        st.success("Document appears AUTHENTIC")
