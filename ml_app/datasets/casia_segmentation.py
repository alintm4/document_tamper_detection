import os
from PIL import Image
from torch.utils.data import Dataset
from torchvision import transforms

MASK_EXTS = [".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp"]

class CASIASegmentationDataset(Dataset):
    def __init__(self, root, split):
        self.root = root

        split_file = os.path.join(root, "splits", f"{split}.txt")
        with open(split_file, "r") as f:
            names = [x.strip() for x in f if x.strip().startswith("Tp_")]

        self.samples = []

        for name in names:
            base = os.path.splitext(name)[0] + "_gt"

            for ext in MASK_EXTS:
                mask_path = os.path.join(
                    root, "masks", "tampered", base + ext
                )
                if os.path.exists(mask_path):
                    self.samples.append((name, mask_path))
                    break

        print(f"[{split}] Valid segmentation samples: {len(self.samples)}")

        self.img_transform = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.ToTensor()
        ])

        self.mask_transform = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.ToTensor()
        ])

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img_name, mask_path = self.samples[idx]

        img_path = os.path.join(
            self.root, "images", "tampered", img_name
        )

        image = Image.open(img_path).convert("RGB")
        mask  = Image.open(mask_path).convert("L")

        image = self.img_transform(image)
        mask  = self.mask_transform(mask)

        mask = (mask > 0).float()  # binary

        return image, mask
