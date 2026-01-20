import os
from PIL import Image
from torch.utils.data import Dataset
from torchvision import transforms

class CASIAClassificationDataset(Dataset):
    def __init__(self, root, split, transform=None):
        self.root = root
        split_file = os.path.join(root, "splits", f"{split}.txt")

        with open(split_file, "r") as f:
            self.samples = [l.strip() for l in f if l.strip()]

        self.transform = transform or transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        name = self.samples[idx]

        if name.startswith("Au_"):
            img_path = os.path.join(self.root, "images", "real", name)
            label = 0
        elif name.startswith("Tp_"):
            img_path = os.path.join(self.root, "images", "tampered", name)
            label = 1
        else:
            raise ValueError(f"Unknown CASIA filename: {name}")

        img = Image.open(img_path).convert("RGB")
        img = self.transform(img)

        return img, label
