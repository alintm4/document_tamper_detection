from pathlib import Path

root = Path("data/casia/patches/train")

real = len(list((root / "real").glob("*")))
tampered = len(list((root / "tampered").glob("*")))

print("Train patches")
print("Real:", real)
print("Tampered:", tampered)
print("Total:", real + tampered)
