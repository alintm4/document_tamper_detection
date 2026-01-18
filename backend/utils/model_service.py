"""
PyTorch Model Service for Image Forgery Detection
Uses two models:
1. classifier_casia_b4.pth (EfficientNet-B4) - Classifies if image is authentic or tampered
2. deeplabv3_final.pth (DeepLabV3 with ResNet50) - Segments tampered regions for visualization
"""
import os
import sys
import torch
import torch.nn as nn
from torchvision import transforms, models
from torchvision.models.segmentation import deeplabv3_resnet50
from PIL import Image
import numpy as np
import io
import uuid
import cv2

# Add backend to path to import models
BACKEND_PATH = os.path.dirname(os.path.dirname(__file__))
if BACKEND_PATH not in sys.path:
    sys.path.insert(0, BACKEND_PATH)

# Import the exact model classes used in Streamlit
from models.classifier import TamperClassifier
from models.segmenter import TamperSegmenter

# Configuration - Models are in the backend folder
CLASSIFIER_MODEL_PATH = os.path.join(BACKEND_PATH, 'classifier_casia_b4.pth')
SEGMENTATION_MODEL_PATH = os.path.join(BACKEND_PATH, 'deeplabv3_final.pth')
UPLOAD_FOLDER = os.path.join(BACKEND_PATH, 'uploads')

# Image sizes
CLASSIFIER_IMAGE_SIZE = 512  # Must match Streamlit training size
SEGMENTATION_IMAGE_SIZE = 512  # DeepLabV3 input size

# Tampering threshold (same as Streamlit)
TAMPER_THRESHOLD = 0.3

DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Global model instances (loaded once)
_classifier_model = None
_segmentation_model = None


# ============================================================================
# Model Loading Functions
# ============================================================================

def load_classifier_model():
    """Load the EfficientNet-B4 classifier model - EXACTLY like Streamlit"""
    global _classifier_model
    
    if _classifier_model is not None:
        return _classifier_model
    
    if not os.path.exists(CLASSIFIER_MODEL_PATH):
        raise FileNotFoundError(f"Classifier model not found at {CLASSIFIER_MODEL_PATH}")
    
    print(f"Loading classifier model from {CLASSIFIER_MODEL_PATH}...")
    print(f"Using device: {DEVICE}")
    
    # Use the EXACT same model class as Streamlit
    _classifier_model = TamperClassifier().to(DEVICE)
    _classifier_model.load_state_dict(torch.load(CLASSIFIER_MODEL_PATH, map_location=DEVICE))
    _classifier_model.eval()
    
    print("Classifier model loaded and ready for inference!")
    return _classifier_model


def load_segmentation_model():
    """Load the DeepLabV3 segmentation model - EXACTLY like Streamlit"""
    global _segmentation_model
    
    if _segmentation_model is not None:
        return _segmentation_model
    
    if not os.path.exists(SEGMENTATION_MODEL_PATH):
        raise FileNotFoundError(f"Segmentation model not found at {SEGMENTATION_MODEL_PATH}")
    
    print(f"Loading segmentation model from {SEGMENTATION_MODEL_PATH}...")
    print(f"Using device: {DEVICE}")
    
    # Use the EXACT same model class as Streamlit
    _segmentation_model = TamperSegmenter().to(DEVICE)
    _segmentation_model.load_state_dict(torch.load(SEGMENTATION_MODEL_PATH, map_location=DEVICE))
    _segmentation_model.eval()
    
    print("Segmentation model loaded and ready for inference!")
    return _segmentation_model


# Legacy function for backwards compatibility
def load_model():
    """Load the classifier model (legacy function)"""
    return load_classifier_model()


# ============================================================================
# Image Preprocessing
# ============================================================================

def get_classifier_transform():
    """Get the image transformation pipeline for classifier - matches Streamlit exactly"""
    return transforms.Compose([
        transforms.Resize((CLASSIFIER_IMAGE_SIZE, CLASSIFIER_IMAGE_SIZE)),
        transforms.ToTensor(),
        # Note: No normalization - Streamlit doesn't use it
    ])


def get_segmentation_transform():
    """Get the image transformation pipeline for segmentation - matches Streamlit exactly"""
    return transforms.Compose([
        transforms.Resize((SEGMENTATION_IMAGE_SIZE, SEGMENTATION_IMAGE_SIZE)),
        transforms.ToTensor(),
        # Note: No normalization - Streamlit doesn't use it
    ])


# Legacy alias
def get_transform():
    """Get the image transformation pipeline (legacy)"""
    return get_classifier_transform()


def load_image(image_data):
    """
    Load image from various sources
    
    Args:
        image_data: Can be bytes, file path, or PIL Image
        
    Returns:
        PIL Image in RGB format
    """
    if isinstance(image_data, bytes):
        image = Image.open(io.BytesIO(image_data))
    elif isinstance(image_data, str):
        image = Image.open(image_data)
    elif isinstance(image_data, Image.Image):
        image = image_data
    else:
        raise ValueError(f"Unsupported image data type: {type(image_data)}")
    
    # Convert to RGB if necessary
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    return image


def preprocess_for_classifier(image):
    """Preprocess image for classifier model"""
    transform = get_classifier_transform()
    tensor = transform(image)
    tensor = tensor.unsqueeze(0)  # Add batch dimension
    return tensor


def preprocess_for_segmentation(image):
    """Preprocess image for segmentation model"""
    transform = get_segmentation_transform()
    tensor = transform(image)
    tensor = tensor.unsqueeze(0)  # Add batch dimension
    return tensor


# Legacy alias
def preprocess_image(image_data):
    """Preprocess image data for model inference (legacy)"""
    image = load_image(image_data)
    return preprocess_for_classifier(image)


# ============================================================================
# Heatmap Generation
# ============================================================================

def generate_heatmap_overlay(original_image, mask, alpha=0.6):
    """
    Generate a GradCAM-style heatmap overlay on the original image
    
    This creates a visualization where:
    - Low suspicion areas appear blue/greenish
    - High suspicion areas appear yellow/red
    - The overlay highlights tampered regions clearly
    
    Args:
        original_image: PIL Image (original image)
        mask: numpy array (segmentation mask, values 0-1)
        alpha: float (transparency of the overlay, 0.6 works well for visibility)
    
    Returns:
        PIL Image with heatmap overlay
    """
    # Convert original image to numpy array
    orig_np = np.array(original_image)
    original_size = original_image.size  # (width, height)
    
    # Resize mask to match original image size
    mask_resized = cv2.resize(mask, original_size, interpolation=cv2.INTER_LINEAR)
    
    # Apply power scaling to enhance contrast and make high values more prominent
    # This makes the heatmap more like GradCAM - emphasizing the detection areas
    mask_enhanced = np.power(mask_resized, 0.5)  # Square root to boost mid-range values
    
    # Normalize to 0-255 range for colormap
    mask_normalized = (mask_enhanced * 255).astype(np.uint8)
    
    # Apply JET colormap (blue -> green -> yellow -> red) like GradCAM
    heatmap = cv2.applyColorMap(mask_normalized, cv2.COLORMAP_JET)
    heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
    
    # Blend heatmap with original image (full overlay like GradCAM)
    overlay = cv2.addWeighted(orig_np, 1 - alpha, heatmap, alpha, 0)
    
    return Image.fromarray(overlay)


def generate_mask_image(mask, original_size):
    """
    Generate a standalone mask image
    
    Args:
        mask: numpy array (segmentation mask, values 0-1)
        original_size: tuple (width, height) of original image
    
    Returns:
        PIL Image of the mask
    """
    # Resize mask to match original image size
    mask_resized = cv2.resize(mask, original_size, interpolation=cv2.INTER_LINEAR)
    
    # Normalize to 0-255
    mask_normalized = (mask_resized * 255).astype(np.uint8)
    
    return Image.fromarray(mask_normalized, mode='L')


# ============================================================================
# Main Analysis Functions
# ============================================================================

def classify_image(image_data):
    """
    Classify an image as authentic or tampered
    
    Args:
        image_data: Can be bytes, file path, or PIL Image
        
    Returns:
        dict with classification results
    """
    try:
        model = load_classifier_model()
        image = load_image(image_data)
        
        # Preprocess image
        input_tensor = preprocess_for_classifier(image)
        input_tensor = input_tensor.to(DEVICE)
        
        # Run inference
        with torch.no_grad():
            outputs = model(input_tensor)
            
            # Apply softmax to get probabilities
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            
            # Get prediction (class 0 = Authentic, class 1 = Tampered)
            # This matches Streamlit: tampered_prob = probs[0, 1].item()
            authentic_prob = probabilities[0][0].item()
            tampered_prob = probabilities[0][1].item()
            
            # Debug logging
            print(f"Raw model output: {outputs[0].tolist()}")
            print(f"Probabilities - Authentic: {authentic_prob:.4f}, Tampered: {tampered_prob:.4f}")
            
            # Determine prediction using threshold (same as Streamlit: TAMPER_THRESHOLD = 0.3)
            is_manipulated = tampered_prob > TAMPER_THRESHOLD
            confidence = tampered_prob * 100 if is_manipulated else authentic_prob * 100
            
            return {
                'is_manipulated': is_manipulated,
                'confidence_score': round(confidence, 2),
                'prediction': 'tampered' if is_manipulated else 'authentic',
                'raw_scores': {
                    'authentic': round(authentic_prob * 100, 2),
                    'tampered': round(tampered_prob * 100, 2)
                }
            }
            
    except Exception as e:
        print(f"Error classifying image: {e}")
        return {
            'is_manipulated': None,
            'confidence_score': 0,
            'prediction': 'error',
            'raw_scores': None,
            'error': str(e)
        }


def segment_tampered_regions(image_data):
    """
    Segment tampered regions in an image - EXACTLY like Streamlit
    
    Args:
        image_data: Can be bytes, file path, or PIL Image
        
    Returns:
        numpy array: segmentation mask (values 0-1)
    """
    try:
        model = load_segmentation_model()
        image = load_image(image_data)
        
        # Preprocess image - same as Streamlit: seg_transform(image).unsqueeze(0).to(DEVICE)
        input_tensor = preprocess_for_segmentation(image)
        input_tensor = input_tensor.to(DEVICE)
        
        # Run inference - EXACTLY like Streamlit
        with torch.no_grad():
            logits = model(input_tensor)
            # Streamlit: mask = torch.sigmoid(logits)[0, 0].cpu().numpy()
            mask = torch.sigmoid(logits)[0, 0].cpu().numpy()
            
            return mask
            
    except Exception as e:
        print(f"Error segmenting image: {e}")
        return None


def analyze_image(image_data):
    """
    Complete analysis pipeline:
    1. Classify image as authentic or tampered
    2. If tampered, segment the tampered regions and generate heatmap
    
    Args:
        image_data: Can be bytes, file path, or PIL Image
        
    Returns:
        dict with:
            - is_manipulated: bool
            - confidence_score: float (0-100)
            - prediction: str ('authentic' or 'tampered')
            - analysis_result: str (human-readable result)
            - raw_scores: dict with class probabilities
            - heatmap_filename: str (if tampered, filename of heatmap image)
            - mask_filename: str (if tampered, filename of mask image)
    """
    try:
        # Step 1: Classify the image
        classification = classify_image(image_data)
        
        if classification.get('error'):
            return {
                'is_manipulated': None,
                'confidence_score': 0,
                'prediction': 'error',
                'analysis_result': f"Analysis failed: {classification['error']}",
                'raw_scores': None,
                'error': classification['error']
            }
        
        is_manipulated = classification['is_manipulated']
        confidence = classification['confidence_score']
        
        result = {
            'is_manipulated': is_manipulated,
            'confidence_score': confidence,
            'prediction': classification['prediction'],
            'analysis_result': f"{'Tampered' if is_manipulated else 'Authentic'} ({confidence:.1f}% confidence)",
            'raw_scores': classification['raw_scores'],
            'heatmap_filename': None,
            'mask_filename': None
        }
        
        # Step 2: Generate segmentation heatmap (always generate for visualization)
        # Users can see what the model is looking at, even for authentic images
        try:
            image = load_image(image_data)
            mask = segment_tampered_regions(image_data)
            
            if mask is not None:
                # Generate unique filenames
                unique_id = uuid.uuid4().hex
                heatmap_filename = f"heatmap_{unique_id}.png"
                mask_filename = f"mask_{unique_id}.png"
                
                # Generate and save heatmap overlay
                heatmap_image = generate_heatmap_overlay(image, mask, alpha=0.6)
                heatmap_path = os.path.join(UPLOAD_FOLDER, heatmap_filename)
                heatmap_image.save(heatmap_path, 'PNG')
                
                # Generate and save mask
                mask_image = generate_mask_image(mask, image.size)
                mask_path = os.path.join(UPLOAD_FOLDER, mask_filename)
                mask_image.save(mask_path, 'PNG')
                
                result['heatmap_filename'] = heatmap_filename
                result['mask_filename'] = mask_filename
                result['heatmap'] = heatmap_image  # Return PIL Image for inline use
                
                print(f"Generated heatmap: {heatmap_filename}")
                print(f"Generated mask: {mask_filename}")
                
        except Exception as seg_error:
            print(f"Warning: Segmentation failed: {seg_error}")
            # Continue without segmentation - classification result is still valid
        
        return result
        
    except Exception as e:
        print(f"Error analyzing image: {e}")
        import traceback
        traceback.print_exc()
        return {
            'is_manipulated': None,
            'confidence_score': 0,
            'prediction': 'error',
            'analysis_result': f'Analysis failed: {str(e)}',
            'raw_scores': None,
            'error': str(e)
        }


# Legacy function
def analyze_image_binary(image_data):
    """Simplified binary analysis (legacy function)"""
    return classify_image(image_data)


# ============================================================================
# Initialization
# ============================================================================

def init_models():
    """Initialize all models at startup"""
    success = True
    
    try:
        load_classifier_model()
        print("✅ Classifier model initialized")
    except Exception as e:
        print(f"❌ Failed to initialize classifier model: {e}")
        success = False
    
    try:
        load_segmentation_model()
        print("✅ Segmentation model initialized")
    except Exception as e:
        print(f"❌ Failed to initialize segmentation model: {e}")
        success = False
    
    return success


# Backwards compatibility alias
def init_model():
    """Initialize models at startup (legacy function)"""
    return init_models()
