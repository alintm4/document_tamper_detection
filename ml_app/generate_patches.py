import cv2
import os
from pathlib import Path

IMG_ROOT = Path("data/casia/images")
SPLIT_ROOT = Path("data/splits")
PATCH_ROOT = Path("data/patches")

PATCH_ROOT.mkdir(parents=True, exist_ok=True)

def load_list(path):
    return [l.strip() for l in open(path).readlines()]

def patchify(img, rows=3, cols=3):
    h, w = img.shape[:2]
    patches = []
    ph, pw = h // rows, w // cols
    for i in range(rows):
        for j in range(cols):
            patch = img[i*ph:(i+1)*ph, j*pw:(j+1)*pw]
            patch = cv2.resize(patch, (224, 224))
            patches.append(patch)
    return patches

def process(split, label):
    out_dir = PATCH_ROOT / split / label
    out_dir.mkdir(parents=True, exist_ok=True)

    file_list = load_list(SPLIT_ROOT / f"{split}_{label}.txt")

    for name in file_list:
        img = cv2.imread(str(IMG_ROOT / label / name))
        img = cv2.resize(img, (1024, 1024))
        patches = patchify(img)

        for i, p in enumerate(patches):
            out_name = f"{name.replace('.', '_')}_p{i}.png"
            cv2.imwrite(str(out_dir / out_name), p)

def main():
    for split in ["train", "val", "test"]:
        for label in ["clean", "tampered"]:
            process(split, label)

    print("Patch generation complete.")

if __name__ == "__main__":
    main()
