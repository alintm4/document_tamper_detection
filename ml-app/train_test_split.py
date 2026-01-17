import os
import shutil
import re
from pathlib import Path
from collections import defaultdict
import random

def extract_category_and_number(filename):
    """
    Extract category and number from authentic image filename.
    Returns: tuple (category, number) e.g., ('ani', '00001')
    """
    au_match = re.search(r'Au_(ani|arc|art|cha|ind|nat|pla|txt)_(\d+)', filename)
    if au_match:
        return (au_match.group(1), au_match.group(2))
    return None

def extract_tampered_info(filename):
    """
    Extract source category and number from tampered image filename.
    Returns: tuple (category, number)
    """
    matches = re.findall(r'(ani|arc|art|cha|ind|nat|pla|txt)(\d+)', filename)
    if len(matches) >= 1:
        return (matches[0][0], matches[0][1])
    return None

def get_mask_filename_pattern(tp_filename):
    """Get the base pattern for finding corresponding mask file."""
    base_name = os.path.splitext(tp_filename)[0]
    return base_name + '_gt'

def group_images_by_authentic(paired_folder):
    """
    Group all images by their authentic source image.
    Returns: dict with structure {(category, number): {'au': path, 'tp': [paths], 'mask': [paths]}}
    """
    au_folder = Path(paired_folder) / 'Au'
    tp_folder = Path(paired_folder) / 'Tp'
    mask_folder = Path(paired_folder) / 'Mask'
    
    groups = defaultdict(lambda: {'au': None, 'tp': [], 'mask': []})
    
    # Process authentic images
    print("Grouping authentic images...")
    if au_folder.exists():
        for file in au_folder.iterdir():
            if file.is_file():
                result = extract_category_and_number(file.name)
                if result:
                    category, number = result
                    groups[(category, number)]['au'] = file
                    print(f"  Au: {file.name} -> {category}_{number}")
    
    # Process tampered images
    print("\nGrouping tampered images...")
    if tp_folder.exists():
        for file in tp_folder.iterdir():
            if file.is_file():
                result = extract_tampered_info(file.name)
                if result:
                    category, number = result
                    groups[(category, number)]['tp'].append(file)
                    print(f"  Tp: {file.name} -> {category}_{number}")
    
    # Process mask images
    print("\nGrouping mask images...")
    if mask_folder.exists():
        for file in mask_folder.iterdir():
            if file.is_file():
                # Extract info from mask filename (remove _gt suffix first)
                mask_name = file.name.replace('_gt', '')
                mask_name = os.path.splitext(mask_name)[0]
                result = extract_tampered_info(mask_name)
                if result:
                    category, number = result
                    groups[(category, number)]['mask'].append(file)
                    print(f"  Mask: {file.name} -> {category}_{number}")
    
    return groups

def split_dataset(paired_folder, output_folder, train_ratio=0.7, test_ratio=0.2, val_ratio=0.1, seed=42):
    """
    Split paired dataset into train/test/val sets while keeping groups together.
    
    Args:
        paired_folder: Path to paired folder containing Au, Tp, Mask
        output_folder: Path to output folder for split data
        train_ratio: Ratio for training set (default: 0.7)
        test_ratio: Ratio for test set (default: 0.2)
        val_ratio: Ratio for validation set (default: 0.1)
        seed: Random seed for reproducibility
    """
    # Set random seed for reproducibility
    random.seed(seed)
    
    # Create output directories
    for split in ['train', 'test', 'val']:
        for folder in ['Au', 'Tp', 'Mask']:
            (Path(output_folder) / split / folder).mkdir(parents=True, exist_ok=True)
    
    # Group images by authentic source
    groups = group_images_by_authentic(paired_folder)
    
    # Get all group keys and shuffle them
    group_keys = list(groups.keys())
    random.shuffle(group_keys)
    
    # Calculate split sizes
    total_groups = len(group_keys)
    train_size = int(total_groups * train_ratio)
    test_size = int(total_groups * test_ratio)
    
    # Split the groups
    train_keys = group_keys[:train_size]
    test_keys = group_keys[train_size:train_size + test_size]
    val_keys = group_keys[train_size + test_size:]
    
    print("\n" + "="*60)
    print("SPLITTING DATASET")
    print("="*60)
    print(f"Total groups: {total_groups}")
    print(f"Train groups: {len(train_keys)} ({len(train_keys)/total_groups*100:.1f}%)")
    print(f"Test groups: {len(test_keys)} ({len(test_keys)/total_groups*100:.1f}%)")
    print(f"Val groups: {len(val_keys)} ({len(val_keys)/total_groups*100:.1f}%)")
    
    # Copy files to respective splits
    splits = {
        'train': train_keys,
        'test': test_keys,
        'val': val_keys
    }
    
    stats = defaultdict(lambda: defaultdict(int))
    
    for split_name, keys in splits.items():
        print(f"\n{split_name.upper()} SET:")
        print("-" * 60)
        
        for key in keys:
            category, number = key
            group = groups[key]
            
            # Copy authentic image
            if group['au']:
                dest = Path(output_folder) / split_name / 'Au' / group['au'].name
                shutil.copy2(group['au'], dest)
                stats[split_name]['au'] += 1
                print(f"  Au: {group['au'].name}")
            
            # Copy tampered images
            for tp_file in group['tp']:
                dest = Path(output_folder) / split_name / 'Tp' / tp_file.name
                shutil.copy2(tp_file, dest)
                stats[split_name]['tp'] += 1
                print(f"    Tp: {tp_file.name}")
            
            # Copy mask images
            for mask_file in group['mask']:
                dest = Path(output_folder) / split_name / 'Mask' / mask_file.name
                shutil.copy2(mask_file, dest)
                stats[split_name]['mask'] += 1
                print(f"      Mask: {mask_file.name}")
    
    # Print summary
    print("\n" + "="*70)
    print("SUMMARY")
    print("="*70)
    print(f"{'Split':<10} {'Groups':<10} {'Au Images':<12} {'Tp Images':<12} {'Masks':<12}")
    print("-"*70)
    
    for split_name in ['train', 'test', 'val']:
        groups_count = len(splits[split_name])
        au_count = stats[split_name]['au']
        tp_count = stats[split_name]['tp']
        mask_count = stats[split_name]['mask']
        print(f"{split_name:<10} {groups_count:<10} {au_count:<12} {tp_count:<12} {mask_count:<12}")
    
    print("="*70)
    print(f"\nOutput folder: {output_folder}")
    print(f"Random seed used: {seed}")

if __name__ == "__main__":
    import sys
    
    # Default paths
    paired_folder = r"C:\Users\Paudel\Desktop\techsprint_xhack\ml-app\organized_dataset\paired"
    output_folder = r"C:\Users\Paudel\Desktop\techsprint_xhack\ml-app\split_dataset"
    
    # Allow override via command line arguments
    if len(sys.argv) > 1:
        paired_folder = sys.argv[1]
        output_folder = sys.argv[2] if len(sys.argv) > 2 else output_folder
    
    print("\nTrain/Test/Val Split Script")
    print("="*60)
    print(f"Source folder: {paired_folder}")
    print(f"Output folder: {output_folder}")
    print(f"Split ratio: 70% train, 20% test, 10% val")
    print("="*60 + "\n")
    
    # Verify source folder exists
    if not os.path.exists(paired_folder):
        print(f"Error: Paired folder '{paired_folder}' does not exist!")
        sys.exit(1)
    
    split_dataset(paired_folder, output_folder, train_ratio=0.7, test_ratio=0.2, val_ratio=0.1, seed=42)
    print("\nDone!")