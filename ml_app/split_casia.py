import os
import random
from pathlib import Path

random.seed(42)

CASIA_ROOT = Path("data/casia")
SPLIT_DIR = Path("data/splits")
SPLIT_DIR.mkdir(parents=True, exist_ok=True)

def split_files(file_list, train=0.8, val=0.1):
    random.shuffle(file_list)
    n = len(file_list)
    n_train = int(n * train)
    n_val = int(n * val)
    return (
        file_list[:n_train],
        file_list[n_train:n_train+n_val],
        file_list[n_train+n_val:]
    )

def write_split(name, files):
    with open(SPLIT_DIR / f"{name}.txt", "w") as f:
        for file in files:
            f.write(file + "\n")

def main():
    clean_files = [f.name for f in (CASIA_ROOT / "images/clean").iterdir()]
    tampered_files = [f.name for f in (CASIA_ROOT / "images/tampered").iterdir()]

    clean_train, clean_val, clean_test = split_files(clean_files)
    tamp_train, tamp_val, tamp_test = split_files(tampered_files)

    write_split("train_clean", clean_train)
    write_split("val_clean", clean_val)
    write_split("test_clean", clean_test)

    write_split("train_tampered", tamp_train)
    write_split("val_tampered", tamp_val)
    write_split("test_tampered", tamp_test)

    print("CASIA split complete.")
    print(f"Clean: {len(clean_train)}/{len(clean_val)}/{len(clean_test)}")
    print(f"Tampered: {len(tamp_train)}/{len(tamp_val)}/{len(tamp_test)}")

if __name__ == "__main__":
    main()
