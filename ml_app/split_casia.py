import os
import random

random.seed(42)

TAMPERED_DIR = "data/casia/images/tampered"
OUT_DIR = "data/casia/splits"

os.makedirs(OUT_DIR, exist_ok=True)

files = [f for f in os.listdir(TAMPERED_DIR)
         if f.lower().endswith((".jpg", ".png"))]

random.shuffle(files)

n = len(files)
train = files[:int(0.7*n)]
val   = files[int(0.7*n):int(0.85*n)]
test  = files[int(0.85*n):]

def write(name, items):
    with open(os.path.join(OUT_DIR, name), "w") as f:
        for x in items:
            f.write(x + "\n")

write("train.txt", train)
write("val.txt", val)
write("test.txt", test)

print("Splits created:")
print("Train:", len(train))
print("Val  :", len(val))
print("Test :", len(test))
