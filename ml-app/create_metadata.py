import os
import csv

IMG_DIR = "data/doctamper/images"
OUT_CSV = "data/doctamper/metadata.csv"

with open(OUT_CSV, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["image_path", "label"])

    for img in sorted(os.listdir(IMG_DIR)):
        if img.endswith(".png"):
            writer.writerow([f"data/doctamper/images/{img}", 1])

print("metadata.csv created")
