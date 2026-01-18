# ML Application - Model Training & Development

Machine learning pipeline for training document tampering detection models. Includes data preprocessing, model architecture implementation, training scripts, and evaluation tools for the ResNet50-based U-Net segmentation model.

## Overview

This module contains all machine learning components for developing and training deep learning models to detect document forgeries and tampering. The system uses a U-Net architecture with ResNet50 encoder for pixel-level segmentation of tampered regions.

## Features

- ResNet50 encoder with ImageNet pre-trained weights
- U-Net decoder for semantic segmentation
- Custom Dice Loss + Binary Crossentropy
- Multi-dataset training support
- Data augmentation pipeline
- Model evaluation and visualization
- Training progress tracking
- Model checkpointing
- GPU acceleration support
- Jupyter notebook interface

## Technology Stack

- TensorFlow 2.14+ / Keras
- Python 3.8+
- NumPy (Array operations)
- Matplotlib (Visualization)
- Scikit-learn (Data splitting)
- Jupyter Notebook (Interactive development)
- Pillow (Image processing)
- OpenCV (Image manipulation)

## Project Structure

```
ml-app/
├── dataset/                    # Training datasets
│   ├── Au/                    # Authentic images
│   ├── Tp/                    # Tampered images
│   ├── Mask/                  # Segmentation masks
│   ├── au_list.txt           # Authentic image list
│   └── tp_list.txt           # Tampered image list
├── invoices_dataset/          # Invoice tampering dataset
│   └── RealTextManipulation/
│       ├── JPEGImages/       # Original images
│       ├── SegmentationClass/ # Ground truth masks
│       ├── train.txt         # Training split
│       └── test.txt          # Test split
├── stamp_dataset/             # Stamp forgery dataset
│   └── genuine/
│       ├── 200dpi/
│       ├── 300dpi/
│       └── 600dpi/
│           ├── scans/        # Stamp images
│           └── ground-truth-maps/ # Tampering masks
├── organized_dataset/         # Processed dataset
│   ├── paired/               # Image-mask pairs
│   │   ├── Au/
│   │   ├── Tp/
│   │   └── Mask/
│   └── unknown/              # Unpaired images
├── split_dataset/             # Train/val/test split
│   ├── train/
│   ├── val/
│   └── test/
├── model-training/            # Training notebooks
│   ├── training.ipynb        # Initial training
│   ├── training2.ipynb       # Iterative training
│   ├── training3.ipynb       # Final training pipeline
│   ├── casia-version2.ipynb  # CASIA dataset training
│   └── 02_resnet50_unet_segmentation.ipynb
├── eda/                       # Exploratory data analysis
│   └── eda.ipynb
├── utils.py                   # Utility functions
├── segregate.py              # Dataset organization
├── train_test_split.py       # Data splitting
└── README.md                 # This file
```

## Installation

### Prerequisites

- Python 3.8 or higher
- CUDA-compatible GPU (recommended)
- 16GB+ RAM
- 50GB+ storage for datasets

### Setup Steps

1. Navigate to ml-app directory:
```bash
cd ml-app
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install tensorflow==2.14.0
pip install numpy matplotlib pillow opencv-python
pip install jupyter scikit-learn pandas
```

4. Install CUDA (for GPU support):
- Follow TensorFlow GPU installation guide
- Verify GPU availability:
```python
import tensorflow as tf
print(tf.config.list_physical_devices('GPU'))
```

## Datasets

### Invoice Dataset (RealTextManipulation)

Source: Document tampering detection dataset
- Total images: 9000+
- Format: JPEG images with PNG masks
- Tampering types: Text manipulation, region copy-paste
- Resolution: Variable (resized to 256x256)

Structure:
```
JPEGImages/        # Original tampered documents
SegmentationClass/ # Binary masks (white=tampered, black=authentic)
```

### Stamp Dataset

Source: Stamp forgery detection dataset
- Total images: 3000+
- Resolutions: 200dpi, 300dpi, 600dpi
- Format: PNG images with ground truth maps
- Tampering types: Stamp forgery, manipulation

Structure:
```
genuine/
  <resolution>/
    scans/              # Original stamp images
    ground-truth-maps/  # Tampering detection masks
```

### CASIA Dataset (Optional)

Additional dataset for training diversity:
- Authentic images: 7000+
- Tampered images: 5000+
- Various tampering techniques

## Data Preprocessing

### Dataset Organization

Run segregation script:
```bash
python segregate.py
```

This organizes images into:
- Paired authentic-tampered-mask triplets
- Separate authentic and tampered sets
- Organized by type and availability

### Train/Val/Test Split

Create data splits:
```bash
python train_test_split.py
```

Default split ratio:
- Training: 70%
- Validation: 20%
- Testing: 10%

### Data Augmentation

Applied transformations:
- Random horizontal flip
- Random rotation (±15 degrees)
- Random brightness adjustment
- Random contrast adjustment
- Gaussian noise addition

## Model Architecture

### ResNet50-UNet Architecture

```
Input (256x256x3)
    ↓
ResNet50 Encoder (Pre-trained on ImageNet)
    ↓
Skip Connections → [64x64, 32x32, 16x16, 8x8]
    ↓
Bridge Layer (512 filters)
    ↓
U-Net Decoder with Skip Connections
    ↓
Upsampling Blocks [16x16, 32x32, 64x64, 128x128, 256x256]
    ↓
Output (256x256x1) - Sigmoid activation
```

### Key Components

**Encoder:**
- ResNet50 backbone
- Pre-trained ImageNet weights
- Feature extraction at multiple scales
- Skip connections for U-Net

**Decoder:**
- Symmetric upsampling path
- Concatenation with encoder features
- Progressive resolution increase
- Final 1x1 convolution

**Loss Function:**
```python
Combined Loss = Dice Loss + Binary Crossentropy

Dice Loss = 1 - (2 * intersection) / (prediction + ground_truth)
BCE = -[y*log(ŷ) + (1-y)*log(1-ŷ)]
```

## Training

### Using Jupyter Notebook

1. Start Jupyter:
```bash
jupyter notebook
```

2. Open training notebook:
```
model-training/training3.ipynb
```

3. Execute cells sequentially:
   - Cell 1: Import libraries
   - Cell 2: Configure paths and hyperparameters
   - Cell 3: Load preprocessing functions
   - Cell 4: Load invoice dataset
   - Cell 5: Load stamp dataset
   - Cell 6: Balance and split data
   - Cell 7: Build/load model
   - Cell 8: Define loss functions
   - Cell 9: Compile model
   - Cell 10: Train model
   - Cell 11-14: Evaluate and visualize

### Training Configuration

Key hyperparameters in training3.ipynb:

```python
# Image dimensions
IMG_HEIGHT = 256
IMG_WIDTH = 256

# Training parameters
BATCH_SIZE = 16
EPOCHS = 10
LEARNING_RATE = 1e-4

# Data split
TRAIN_RATIO = 0.70
VAL_RATIO = 0.20
TEST_RATIO = 0.10

# Optimization
CPU_CORES = 10
USE_GPU = True
```

### Training Process

1. **Data Loading:**
   - Load invoice images and masks
   - Load stamp images and masks
   - Balance datasets (equal samples)

2. **Preprocessing:**
   - Resize to 256x256
   - Normalize pixel values (0-1)
   - Create binary masks (threshold 0.5)

3. **Model Training:**
   - Initialize ResNet50 encoder
   - Build U-Net decoder
   - Compile with custom loss
   - Train with callbacks

4. **Callbacks:**
   - ModelCheckpoint: Save best model
   - EarlyStopping: Prevent overfitting
   - ReduceLROnPlateau: Adjust learning rate

### GPU Optimization

Enable GPU acceleration:

```python
# Configure GPU memory growth
gpus = tf.config.list_physical_devices('GPU')
for gpu in gpus:
    tf.config.experimental.set_memory_growth(gpu, True)

# Set threading for multi-core CPU
tf.config.threading.set_inter_op_parallelism_threads(10)
tf.config.threading.set_intra_op_parallelism_threads(10)
```

## Model Evaluation

### Metrics

Primary metrics:
- **Loss**: Combined Dice + BCE
- **Accuracy**: Pixel-wise correctness
- **Precision**: True positive rate
- **Recall**: Sensitivity
- **F1-Score**: Harmonic mean of precision/recall
- **IoU**: Intersection over Union

### Evaluation Code

```python
# Evaluate on test set
test_metrics = model.evaluate(X_test, y_test)
print(f"Test Loss: {test_metrics[0]:.4f}")
print(f"Test Accuracy: {test_metrics[1]:.4f}")
print(f"Test Precision: {test_metrics[2]:.4f}")
print(f"Test Recall: {test_metrics[3]:.4f}")
```

### Visualization

Generate prediction visualizations:

```python
# Plot sample predictions
for i in range(5):
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    axes[0].imshow(X_test[i])
    axes[0].set_title('Original')
    axes[1].imshow(y_test[i].squeeze(), cmap='gray')
    axes[1].set_title('Ground Truth')
    axes[2].imshow(predictions[i].squeeze(), cmap='gray')
    axes[2].set_title('Prediction')
```

## Model Export

### Save Trained Model

```python
# Save in Keras format
model.save('resnet50_unet_tampering_detector.keras')

# Save weights only
model.save_weights('model_weights.h5')
```

### Load Model

```python
# Load complete model
model = tf.keras.models.load_model(
    'resnet50_unet_tampering_detector.keras',
    custom_objects={'combined_loss': combined_loss}
)
```

## Inference

### Single Image Prediction

```python
def predict_tampering(image_path):
    # Load and preprocess image
    img = load_img(image_path, target_size=(256, 256))
    img_array = img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    
    # Predict
    mask = model.predict(img_array)[0]
    
    # Threshold
    binary_mask = (mask > 0.5).astype(np.uint8)
    
    return binary_mask
```

### Batch Prediction

```python
# Predict on multiple images
predictions = model.predict(X_batch, batch_size=16)
```

## Performance Optimization

### Training Speed

- Use mixed precision training
- Increase batch size (GPU memory permitting)
- Use data generators for large datasets
- Enable XLA compilation
- Optimize data loading pipeline

### Memory Management

```python
# Mixed precision
policy = tf.keras.mixed_precision.Policy('mixed_float16')
tf.keras.mixed_precision.set_global_policy(policy)

# Data prefetching
dataset = dataset.prefetch(tf.data.AUTOTUNE)
```

## Results

Expected performance metrics:
- Training time: 4-5 hours (15 epochs, GPU)
- Final accuracy: 92-95%
- Precision: 0.85-0.90
- Recall: 0.80-0.88
- F1-Score: 0.82-0.89
- Inference time: 2-3 seconds per image

## Troubleshooting

### Out of Memory
- Reduce batch size
- Use gradient checkpointing
- Enable memory growth for GPU
- Clear Keras session between runs

### Poor Performance
- Increase training epochs
- Adjust learning rate
- Add more data augmentation
- Fine-tune loss weights
- Check data quality

### Slow Training
- Verify GPU is being used
- Increase batch size
- Use mixed precision
- Optimize data pipeline
- Check CPU threading

## Advanced Features

### Transfer Learning

Fine-tune on specific document types:
```python
# Freeze encoder layers
for layer in model.layers[:100]:
    layer.trainable = False

# Train decoder only
model.compile(optimizer=Adam(1e-5), loss=combined_loss)
```

### Ensemble Models

Combine multiple models:
```python
predictions = (model1.predict(X) + model2.predict(X)) / 2
```

## Utilities

### utils.py

Common functions:
- Image loading and preprocessing
- Mask generation
- Data augmentation
- Visualization helpers
- Metric calculation

### segregate.py

Organize dataset files:
- Match images with masks
- Separate authentic/tampered
- Create paired datasets
- Handle missing files

### train_test_split.py

Split data systematically:
- Stratified splitting
- Balanced class distribution
- Reproducible splits
- Custom ratios

## Contributing

To improve the model:
1. Experiment with architectures
2. Try different loss functions
3. Add new datasets
4. Implement new augmentations
5. Optimize hyperparameters
6. Document findings

## References

- U-Net: Convolutional Networks for Biomedical Image Segmentation
- ResNet50: Deep Residual Learning for Image Recognition
- Dice Loss for semantic segmentation
- Document forgery detection techniques

## License

Educational and research purposes.
