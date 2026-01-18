import streamlit as st
import torch
import torch.nn.functional as F
import numpy as np
import cv2
from PIL import Image
from torchvision import transforms

from ml_app.models.classifier import TamperClassifier

# ---------------- CONFIG ----------------
DEVICE = "cpu"
MODEL_PATH = "outputs/models/classifier_casia.pth"
# --------------------------------------

st.set_page_config(page_title="Document Tampering Detection", layout="wide")
st.title("📄 Document Tampering Detection (Grad-CAM Explainability)")

# -------- Load model --------
@st.cache_resource
def load_model():
    model = TamperClassifier().to(DEVICE)
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    model.eval()
    return model

model = load_model()

# -------- Image transform --------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

# -------- Grad-CAM --------
def generate_gradcam(image_tensor, model):
    gradients = []
    activations = []

    def backward_hook(module, grad_input, grad_output):
        gradients.append(grad_output[0])

    def forward_hook(module, input, output):
        activations.append(output)

    target_layer = model.backbone.features[-1]

    # Register hooks (NEW & SAFE)
    target_layer.register_forward_hook(forward_hook)
    target_layer.register_full_backward_hook(backward_hook)

    # Forward
    output = model(image_tensor)
    score = output[:, 1]  # tampered class

    # Backward
    model.zero_grad()
    score.backward()

    # FIX: detach tensors before numpy
    grads = gradients[0].detach().cpu().numpy()
    acts = activations[0].detach().cpu().numpy()

    weights = np.mean(grads, axis=(2, 3))[0]
    cam = np.zeros(acts.shape[2:], dtype=np.float32)

    for i, w in enumerate(weights):
        cam += w * acts[0, i]

    cam = np.maximum(cam, 0)
    cam /= cam.max() + 1e-8
    cam = cv2.resize(cam, (224, 224))

    return cam


# -------- Upload --------
uploaded_file = st.file_uploader(
    "Upload a document image",
    type=["jpg", "jpeg", "png"]
)

if uploaded_file:
    image = Image.open(uploaded_file).convert("RGB")
    image_tensor = transform(image).unsqueeze(0).to(DEVICE)

    # Prediction
    with torch.no_grad():
        logits = model(image_tensor)
        probs = F.softmax(logits, dim=1)
        tampered_prob = probs[0, 1].item()

    label = "TAMPERED" if tampered_prob > 0.5 else "AUTHENTIC"

    st.subheader("📊 Prediction")
    st.markdown(f"""
    **Result:** `{label}`  
    **Tampered Probability:** `{tampered_prob:.4f}`
    """)

    # Grad-CAM
    cam = generate_gradcam(image_tensor, model)

    img_np = np.array(image.resize((224, 224)))
    heatmap = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(img_np, 0.6, heatmap, 0.4, 0)

    # Display
    col1, col2, col3 = st.columns(3)

    with col1:
        st.image(img_np, caption="Original", width=250)

    with col2:
        st.image(heatmap, caption="Grad-CAM Heatmap", width=250)

    with col3:
        st.image(overlay, caption="Overlay (Explainability)", width=250)
