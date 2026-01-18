import random
import shutil
from pathlib import Path

SRC_ROOT = Path("data/casia/patches/train")
DST_ROOT = Path("data/casia/patches_reduced/train")

REAL_LIMIT = 10000
TAMPERED_LIMIT = 10000

random.seed(42)

def copy_subset(src_dir, dst_dir, limit):
    files = list(src_dir.glob("*"))
    print(f"{src_dir.name}: found {len(files)} files")

    if len(files) < limit:
        raise ValueError(f"Not enough files in {src_dir}")

    selected = random.sample(files, limit)
    dst_dir.mkdir(parents=True, exist_ok=True)

    for f in selected:
        shutil.copy2(f, dst_dir / f.name)

    print(f"Copied {limit} files → {dst_dir}")

copy_subset(
    SRC_ROOT / "real",
    DST_ROOT / "real",
    REAL_LIMIT
)

copy_subset(
    SRC_ROOT / "tampered",
    DST_ROOT / "tampered",
    TAMPERED_LIMIT
)

print("Patch reduction completed")
