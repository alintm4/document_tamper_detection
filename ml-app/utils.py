
import os
import tensorflow as tf
from tensorflow import keras
from pathlib import Path
from pathlib import Path

BASE_PATH = Path.cwd().parent / 'split_dataset'

def load_image_dataset(directory, batch_size=32, image_size=(256, 256), labels=None):
    if not os.path.exists(directory):
        print(f"Directory not found: {directory}")
        return None
    
    return keras.utils.image_dataset_from_directory(
        directory=directory,
        labels=labels,
        batch_size=batch_size,
        image_size=image_size
    )


def normalize(image):
    return tf.cast(image, tf.float32) / 255.0


def load_dataset_with_info(split_name, category, base_path, batch_size=32, image_size=256):

    full_path = Path(base_path) / split_name / category
    
    if not full_path.exists():
        print(f"❌ {split_name}/{category}: Path not found - {full_path}")
        return None
    
    # Count files
    file_count = len(list(full_path.glob('*.*')))
    
    # Convert image_size to tuple if needed
    img_size = (image_size, image_size) if isinstance(image_size, int) else image_size
    
    # Load dataset
    ds = load_image_dataset(
        str(full_path), 
        batch_size=batch_size, 
        image_size=img_size,
        labels=None
    )
    
    if ds is not None:
        print(f"✅ {split_name:12s} | {category:4s} | {file_count:4d} images | {full_path.name}")
    
    return ds


def augment_image(image, mask):
 
    # Random horizontal flip
    if tf.random.uniform(()) > 0.5:
        image = tf.image.flip_left_right(image)
        mask = tf.image.flip_left_right(mask)
    
    # Random vertical flip
    if tf.random.uniform(()) > 0.5:
        image = tf.image.flip_up_down(image)
        mask = tf.image.flip_up_down(mask)
    
    # Random brightness (only on image, not mask)
    image = tf.image.random_brightness(image, max_delta=0.2)
    image = tf.clip_by_value(image, 0.0, 1.0)
    
    # Random contrast (only on image, not mask)
    image = tf.image.random_contrast(image, lower=0.8, upper=1.2)
    image = tf.clip_by_value(image, 0.0, 1.0)
    
    return image, mask



