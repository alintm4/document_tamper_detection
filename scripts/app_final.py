import streamlit as st
import torch
import numpy as np
import cv2
from PIL import Image
from torchvision import transforms

from ml_app.models.classifier import TamperClassifier
from ml_app.models.segmenter import TamperSegmenter

# ================= CONFIG =================
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

CLASSIFIER_PATH = "outputs/models/classifier_casia_b4.pth"
SEGMENTER_PATH  = "outputs/models/deeplabv3_final.pth"

TAMPER_THRESHOLD = 0.35
# ==========================================

st.set_page_config(layout="wide")
st.title("📄 Document Tampering Detection System")

# ---------------- LOAD MODELS ----------------
@st.cache_resource
def load_models():
    clf = TamperClassifier().to(DEVICE)
    clf.load_state_dict(torch.load(CLASSIFIER_PATH, map_location=DEVICE))
    clf.eval()

    seg = TamperSegmenter().to(DEVICE)
    seg.load_state_dict(torch.load(SEGMENTER_PATH, map_location=DEVICE))
    seg.eval()

    return clf, seg

classifier, segmenter = load_models()

# ---------------- TRANSFORMS ----------------
clf_transform = transforms.Compose([
    transforms.Resize((512, 512)),
    transforms.ToTensor()
])

seg_transform = transforms.Compose([
    transforms.Resize((512, 512)),
    transforms.ToTensor()
])

# ---------------- GRAD-CAM ----------------
def grad_cam(model, image_tensor):
    activations = []
    gradients = []

    def forward_hook(_, __, output):
        activations.append(output)

    def backward_hook(_, grad_in, grad_out):
        gradients.append(grad_out[0])

    target_layer = model.backbone.features[-1]
    h1 = target_layer.register_forward_hook(forward_hook)
    h2 = target_layer.register_full_backward_hook(backward_hook)

    output = model(image_tensor)
    score = output[:, 1].sum()

    model.zero_grad()
    score.backward()

    act = activations[0]              # [B, C, H, W]
    grad = gradients[0]               # [B, C, H, W]

    weights = grad.mean(dim=(2, 3), keepdim=True)
    cam = (weights * act).sum(dim=1)
    cam = torch.relu(cam)

    cam = cam[0].detach().cpu().numpy()   # ✅ convert ONCE
    cam = cv2.resize(cam, (512, 512))
    cam = (cam - cam.min()) / (cam.max() + 1e-8)

    h1.remove()
    h2.remove()

    return cam


# ---------------- UI ----------------
uploaded = st.file_uploader("Upload Document Image", type=["jpg", "png", "jpeg"])

if uploaded:
    image = Image.open(uploaded).convert("RGB")

    col1, col2, col3 = st.columns(3)
    col1.image(image, caption="Original Image", use_container_width=True)

    # -------- CLASSIFICATION --------
    img_clf = clf_transform(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = classifier(img_clf)
        probs = torch.softmax(logits, dim=1)
        tampered_prob = probs[0, 1].item()

    col2.metric("Tampered Probability", f"{tampered_prob:.3f}")

    # -------- GRAD-CAM --------
    cam = grad_cam(classifier, img_clf)
    cam_img = cv2.applyColorMap((cam * 255).astype(np.uint8), cv2.COLORMAP_JET)
    cam_img = cv2.cvtColor(cam_img, cv2.COLOR_BGR2RGB)

    overlay_cam = cv2.addWeighted(
        np.array(image.resize((512, 512))),
        0.6,
        cam_img,
        0.4,
        0
    )

    col3.image(overlay_cam, caption="Grad-CAM (Classifier)", use_container_width=True)

    # -------- SEGMENTATION --------
    if tampered_prob > TAMPER_THRESHOLD:
        st.success("⚠️ Document classified as TAMPERED — Running segmentation")

        img_seg = seg_transform(image).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            logits = segmenter(img_seg)
            mask = torch.sigmoid(logits)[0, 0].cpu().numpy()
            mask = (mask > 0.5).astype(np.uint8)

        mask_color = np.zeros((512, 512, 3), dtype=np.uint8)
        mask_color[:, :, 0] = mask * 255

        overlay = cv2.addWeighted(
            np.array(image.resize((512, 512))),
            0.7,
            mask_color,
            0.3,
            0
        )

        c1, c2 = st.columns(2)
        c1.image(mask * 255, caption="Tampered Region Mask", use_container_width=True)
        c2.image(overlay, caption="Overlay (Tampered Area)", use_container_width=True)

    else:
        st.success("✅ Document classified as AUTHENTIC")
