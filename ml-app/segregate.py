import os
import shutil
import re
from pathlib import Path
from collections import defaultdict

def extract_category_and_number(filename):
    """
    Extract category and number from authentic or tampered image filename.
    
    Returns:
        tuple: (category, number) e.g., ('ani', '00001') or None if not matched
    """
    # For authentic images: Au_ani_00001.jpg, Au_arc_00023.jpg, etc.
    au_match = re.search(r'Au_(ani|arc|art|cha|ind|nat|pla|txt)_(\d+)', filename)
    if au_match:
        return (au_match.group(1), au_match.group(2))
    
    return None

def extract_tampered_info(filename):
    """
    Extract information from tampered image filename.
    
    Returns:
        dict: {
            'source_category': str,
            'source_number': str,
            'target_category': str (if exists),
            'target_number': str (if exists)
        }
    """
    # Pattern for tampered images: Tp_D_CRN_S_N_cha00063_art00014_11818.jpg
    # The source image is the first category_number pair
    # The target image is the second category_number pair (if exists)
    
    info = {}
    
    # Find all category_number patterns
    matches = re.findall(r'(ani|arc|art|cha|ind|nat|pla|txt)(\d+)', filename)
    
    if len(matches) >= 1:
        info['source_category'] = matches[0][0]
        info['source_number'] = matches[0][1]
    
    if len(matches) >= 2:
        info['target_category'] = matches[1][0]
        info['target_number'] = matches[1][1]
    
    return info if info else None

def get_mask_filename(tp_filename):
    """
    Get corresponding mask filename for a tampered image.
    Mask files have '_gt' appended before the extension.
    Example: Tp_D_CND_M_N_ani00018_sec00096_00138.tif -> Tp_D_CND_M_N_ani00018_sec00096_00138_gt.png
    """
    # Remove the extension from the tampered filename
    base_name = os.path.splitext(tp_filename)[0]
    # Add '_gt' suffix
    mask_name = base_name + '_gt'
    return mask_name

def organize_dataset(dataset_folder, output_folder):
    """
    Organize dataset into 'paired' and 'unknown' folders for all categories.
    Also copies corresponding mask images.
    
    Args:
        dataset_folder: Path to folder containing Au, Tp, and masking subfolders
        output_folder: Path to output folder for organized data
    """
    au_folder = Path(dataset_folder) / 'Au'
    tp_folder = Path(dataset_folder) / 'Tp'
    mask_folder = Path(dataset_folder) / 'masking'
    
    # Create output directories (no category subfolders)
    paired_au = Path(output_folder) / 'paired' / 'Au'
    paired_tp = Path(output_folder) / 'paired' / 'Tp'
    paired_mask = Path(output_folder) / 'paired' / 'Mask'
    unknown_au = Path(output_folder) / 'unknown' / 'Au'
    
    for folder in [paired_au, paired_tp, paired_mask, unknown_au]:
        folder.mkdir(parents=True, exist_ok=True)
    
    # Dictionary to store authentic files by category and number
    # Format: au_files[category][number] = file_path
    au_files = defaultdict(dict)
    
    # Dictionary to track which authentic images have tampered pairs
    # Format: has_tampered[category][number] = True/False
    has_tampered = defaultdict(lambda: defaultdict(bool))
    
    # Dictionary to store mask files by filename
    mask_files = {}
    
    # Get all mask images
    print("Scanning mask images...")
    if mask_folder.exists():
        for file in mask_folder.iterdir():
            if file.is_file() and file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.bmp']:
                mask_files[file.name] = file
                print(f"  Found mask: {file.name}")
    else:
        print(f"  Warning: Mask folder not found at {mask_folder}")
    
    # Get all authentic images
    print("\nScanning authentic images...")
    if au_folder.exists():
        for file in au_folder.iterdir():
            if file.is_file() and file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.tif', '.tiff']:
                result = extract_category_and_number(file.name)
                if result:
                    category, number = result
                    au_files[category][number] = file
                    print(f"  Found: {file.name} -> {category}_{number}")
    
    # Get all tampered images and track their source/target authentic images
    print("\nScanning tampered images...")
    tp_files = []
    if tp_folder.exists():
        for file in tp_folder.iterdir():
            if file.is_file() and file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.tif', '.tiff']:
                info = extract_tampered_info(file.name)
                if info and 'source_category' in info:
                    source_cat = info['source_category']
                    source_num = info['source_number']
                    
                    # Mark that this authentic image has a tampered version
                    has_tampered[source_cat][source_num] = True
                    
                    # Also mark target image if it exists
                    if 'target_category' in info:
                        target_cat = info['target_category']
                        target_num = info['target_number']
                        has_tampered[target_cat][target_num] = True
                    
                    tp_files.append((info, file))
                    print(f"  Found: {file.name} -> source: {source_cat}_{source_num}")
    
    # Organize authentic images
    print("\n" + "="*60)
    print("Organizing authentic images...")
    print("="*60)
    
    categories = ['ani', 'arc', 'art', 'cha', 'ind', 'nat', 'pla', 'txt']
    stats = defaultdict(lambda: {'paired': 0, 'unknown': 0})
    
    for category in categories:
        if category in au_files:
            print(f"\nCategory: {category.upper()}")
            for number, au_file in au_files[category].items():
                if has_tampered[category][number]:
                    # Has corresponding tampered image(s)
                    shutil.copy2(au_file, paired_au / au_file.name)
                    stats[category]['paired'] += 1
                    print(f"  ✓ Paired: {au_file.name}")
                else:
                    # No corresponding tampered image
                    shutil.copy2(au_file, unknown_au / au_file.name)
                    stats[category]['unknown'] += 1
                    print(f"  ? Unknown: {au_file.name}")
    
    # Copy all tampered images and their corresponding masks
    print("\n" + "="*60)
    print("Organizing tampered images and masks...")
    print("="*60)
    
    tp_stats = defaultdict(int)
    mask_stats = {'found': 0, 'missing': 0}
    
    for info, tp_file in tp_files:
        source_cat = info['source_category']
        source_num = info['source_number']
        
        # Check if the source authentic image exists
        if source_num in au_files[source_cat]:
            # Copy tampered image
            shutil.copy2(tp_file, paired_tp / tp_file.name)
            tp_stats[source_cat] += 1
            print(f"  Copied Tp: {tp_file.name} (source: {source_cat}_{source_num})")
            
            # Copy corresponding mask image if it exists
            mask_filename = get_mask_filename(tp_file.name)
            
            # Try different extensions for mask files
            mask_found = False
            for ext in ['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.bmp']:
                # Remove current extension and try with new one
                mask_name_base = os.path.splitext(mask_filename)[0]
                mask_name_with_ext = mask_name_base + ext
                
                if mask_name_with_ext in mask_files:
                    shutil.copy2(mask_files[mask_name_with_ext], paired_mask / mask_files[mask_name_with_ext].name)
                    mask_stats['found'] += 1
                    print(f"    + Mask: {mask_files[mask_name_with_ext].name}")
                    mask_found = True
                    break
            
            if not mask_found:
                mask_stats['missing'] += 1
                print(f"    ! Mask not found for: {tp_file.name}")
    
    # Print summary
    print("\n" + "="*70)
    print("SUMMARY")
    print("="*70)
    print(f"{'Category':<12} {'Paired Au':<12} {'Paired Tp':<12} {'Unknown Au':<12}")
    print("-"*70)
    
    total_paired_au = 0
    total_paired_tp = 0
    total_unknown_au = 0
    
    for category in categories:
        paired_au_count = stats[category]['paired']
        unknown_au_count = stats[category]['unknown']
        paired_tp_count = tp_stats[category]
        
        if paired_au_count > 0 or unknown_au_count > 0 or paired_tp_count > 0:
            print(f"{category.upper():<12} {paired_au_count:<12} {paired_tp_count:<12} {unknown_au_count:<12}")
            total_paired_au += paired_au_count
            total_paired_tp += paired_tp_count
            total_unknown_au += unknown_au_count
    
    print("-"*70)
    print(f"{'TOTAL':<12} {total_paired_au:<12} {total_paired_tp:<12} {total_unknown_au:<12}")
    print("="*70)
    print(f"\nMask Statistics:")
    print(f"  Masks found and copied: {mask_stats['found']}")
    print(f"  Masks missing: {mask_stats['missing']}")
    print("="*70)
    print(f"\nOutput folders:")
    print(f"  Paired Au: {paired_au}")
    print(f"  Paired Tp: {paired_tp}")
    print(f"  Paired Mask: {paired_mask}")
    print(f"  Unknown Au: {unknown_au}")

if __name__ == "__main__":
    import sys
    
    # Default path - configured for your dataset
    dataset_folder = r"/home/alintm4/Documents/Techsprint_alternative/ml-app/dataset"
    output_folder = r"/home/alintm4/Documents/Techsprint_alternative/data/casia_raw"
    
    # Allow override via command line arguments
    if len(sys.argv) > 1:
        dataset_folder = sys.argv[1]
        output_folder = sys.argv[2] if len(sys.argv) > 2 else output_folder
    
    print("\nDataset Organization Script (All Categories with Masks)")
    print("="*60)
    print(f"Source folder: {dataset_folder}")
    print(f"Output folder: {output_folder}")
    print("="*60 + "\n")
    
    # Verify source folder exists
    if not os.path.exists(dataset_folder):
        print(f"Error: Dataset folder '{dataset_folder}' does not exist!")
        sys.exit(1)
    
    organize_dataset(dataset_folder, output_folder)
    print("\nDone!")