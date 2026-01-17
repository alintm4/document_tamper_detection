"""
PyTorch Model Service for Image Forgery Detection
Uses the classifier_casia.pth model to detect if an image is authentic or tampered
"""
import os
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io

# Configuration
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'classifier_casia.pth')
IMAGE_SIZE = 224
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Global model instance (loaded once)
_model = None


class CASIAClassifier(nn.Module):
    """
    CASIA Image Forgery Detection Model
    Uses MobileNetV3 Small as backbone with custom classifier head
    Architecture matches the classifier_casia.pth state dict
    """
    def __init__(self, num_classes=2):
        super(CASIAClassifier, self).__init__()
        
        # Use MobileNetV3 Small as backbone (matches 16-channel first layer)
        mobilenet = models.mobilenet_v3_small(weights=None)
        
        # Create backbone structure matching the state dict
        self.backbone = nn.Module()
        self.backbone.features = mobilenet.features
        
        # Custom classifier matching the trained model structure
        # Input: 576 (MobileNetV3 Small last feature map channels after pooling)
        # Hidden: 1024
        # Output: 2 (authentic/tampered)
        self.backbone.classifier = nn.Sequential(
            nn.Linear(576, 1024),
            nn.Hardswish(inplace=True),
            nn.Dropout(p=0.2, inplace=True),
            nn.Linear(1024, num_classes)
        )
        
        self.avgpool = nn.AdaptiveAvgPool2d(1)
    
    def forward(self, x):
        x = self.backbone.features(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        x = self.backbone.classifier(x)
        return x


def build_classifier_model(num_classes=2):
    """
    Build the MobileNetV3-based classifier architecture.
    This matches the architecture of classifier_casia.pth
    """
    return CASIAClassifier(num_classes=num_classes)


def load_model():
    """Load the PyTorch model from disk (singleton pattern)"""
    global _model
    
    if _model is not None:
        return _model
    
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
    
    print(f"Loading model from {MODEL_PATH}...")
    print(f"Using device: {DEVICE}")
    
    # Build model architecture
    _model = build_classifier_model(num_classes=2)
    
    # Load trained weights
    try:
        state_dict = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=False)
        
        # Load state dict - the keys should match our model architecture
        _model.load_state_dict(state_dict, strict=True)
        print("Model weights loaded successfully!")
        
    except Exception as e:
        print(f"Warning: Strict loading failed: {e}")
        print("Attempting flexible loading...")
        
        # Try loading with strict=False for partial matches
        state_dict = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=False)
        _model.load_state_dict(state_dict, strict=False)
        print("Model weights loaded with strict=False")
    
    _model.to(DEVICE)
    _model.eval()
    
    print("Model loaded and ready for inference!")
    return _model


def get_transform():
    """Get the image transformation pipeline"""
    return transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],  # ImageNet normalization
            std=[0.229, 0.224, 0.225]
        )
    ])


def preprocess_image(image_data):
    """
    Preprocess image data for model inference
    
    Args:
        image_data: Can be bytes, file path, or PIL Image
        
    Returns:
        Preprocessed tensor ready for model input
    """
    transform = get_transform()
    
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
    
    # Apply transformations
    tensor = transform(image)
    
    # Add batch dimension
    tensor = tensor.unsqueeze(0)
    
    return tensor


def analyze_image(image_data):
    """
    Analyze an image to detect if it's authentic or tampered
    
    Args:
        image_data: Can be bytes, file path, or PIL Image
        
    Returns:
        dict with:
            - is_manipulated: bool (True if tampered/fake)
            - confidence_score: float (0-100)
            - prediction: str ('authentic' or 'tampered')
            - raw_scores: dict with class probabilities
    """
    try:
        model = load_model()
        
        # Preprocess image
        input_tensor = preprocess_image(image_data)
        input_tensor = input_tensor.to(DEVICE)
        
        # Run inference
        with torch.no_grad():
            outputs = model(input_tensor)
            
            # Apply softmax to get probabilities
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            
            # Get prediction
            # Assuming class 0 = Authentic, class 1 = Tampered/Fake
            authentic_prob = probabilities[0][0].item()
            tampered_prob = probabilities[0][1].item()
            
            # Determine prediction
            is_manipulated = tampered_prob > authentic_prob
            confidence = max(authentic_prob, tampered_prob) * 100
            
            return {
                'is_manipulated': is_manipulated,
                'confidence_score': round(confidence, 2),
                'prediction': 'tampered' if is_manipulated else 'authentic',
                'analysis_result': f"{'Tampered' if is_manipulated else 'Authentic'} ({confidence:.1f}% confidence)",
                'raw_scores': {
                    'authentic': round(authentic_prob * 100, 2),
                    'tampered': round(tampered_prob * 100, 2)
                }
            }
            
    except Exception as e:
        print(f"Error analyzing image: {e}")
        return {
            'is_manipulated': None,
            'confidence_score': 0,
            'prediction': 'error',
            'analysis_result': f'Analysis failed: {str(e)}',
            'raw_scores': None,
            'error': str(e)
        }


def analyze_image_binary(image_data):
    """
    Simplified binary analysis - returns just authentic/tampered
    Uses sigmoid for binary classification if model has single output
    
    Args:
        image_data: Can be bytes, file path, or PIL Image
        
    Returns:
        dict with analysis results
    """
    try:
        model = load_model()
        
        # Preprocess image
        input_tensor = preprocess_image(image_data)
        input_tensor = input_tensor.to(DEVICE)
        
        # Run inference
        with torch.no_grad():
            outputs = model(input_tensor)
            
            # Check output shape to determine classification type
            if outputs.shape[-1] == 1:
                # Binary classification with single sigmoid output
                prob = torch.sigmoid(outputs).item()
                is_manipulated = prob > 0.5
                confidence = abs(prob - 0.5) * 200  # Scale to 0-100
            else:
                # Multi-class (2 classes)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                authentic_prob = probabilities[0][0].item()
                tampered_prob = probabilities[0][1].item()
                is_manipulated = tampered_prob > authentic_prob
                confidence = max(authentic_prob, tampered_prob) * 100
            
            return {
                'is_manipulated': is_manipulated,
                'confidence_score': round(confidence, 2),
                'prediction': 'tampered' if is_manipulated else 'authentic',
                'analysis_result': f"{'Tampered' if is_manipulated else 'Authentic'} ({confidence:.1f}% confidence)"
            }
            
    except Exception as e:
        print(f"Error in binary analysis: {e}")
        return {
            'is_manipulated': None,
            'confidence_score': 0,
            'prediction': 'error',
            'analysis_result': f'Analysis failed: {str(e)}',
            'error': str(e)
        }


# Pre-load model on module import (optional, can be disabled for faster startup)
def init_model():
    """Initialize model at startup"""
    try:
        load_model()
        return True
    except Exception as e:
        print(f"Failed to initialize model: {e}")
        return False
