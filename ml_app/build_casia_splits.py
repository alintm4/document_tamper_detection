import os
import random

ROOT = "data/casia"
OUT = os.path.join(ROOT, "splits")

real = sorted(os.listdir(os.path.join(ROOT, "images", "real")))
tampered = sorted(os.listdir(os.path.join(ROOT, "images", "tampered")))

random.seed(42)
random.shuffle(real)
random.shuffle(tampered)

def split(lst):
    n = len(lst)
    return (
        lst[:int(0.7*n)],
        lst[int(0.7*n):int(0.85*n)],
        lst[int(0.85*n):]
    )

r_train, r_val, r_test = split(real)
t_train, t_val, t_test = split(tampered)

splits = {
    "train.txt": r_train + t_train,
    "val.txt": r_val + t_val,
    "test.txt": r_test + t_test
}

for name, items in splits.items():
    random.shuffle(items)
    with open(os.path.join(OUT, name), "w") as f:
        f.write("\n".join(items))

print("✅ CASIA splits rebuilt")
print("Train:", len(splits["train.txt"]))
print("Val:", len(splits["val.txt"]))
print("Test:", len(splits["test.txt"]))
