import csv
import cv2
import torch
from torch.utils.data import Dataset
from torchvision import transforms

class PatchDataset(Dataset):
    def __init__(self, csv_file):
        self.images = []
        with open(csv_file) as f:
            reader = csv.DictReader(f)
            for row in reader:
                self.images.append(row)

        self.tf = transforms.Compose([
            transforms.ToTensor(),
            transforms.Resize((224, 224)),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

    def __len__(self):
        return len(self.images) * 9

    def __getitem__(self, idx):
        img_idx = idx // 9
        patch_idx = idx % 9

        row = self.images[img_idx]
        img = cv2.imread(row["image_path"])
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        h, w, _ = img.shape
        ph, pw = h // 3, w // 3
        i = patch_idx // 3
        j = patch_idx % 3

        patch = img[i*ph:(i+1)*ph, j*pw:(j+1)*pw]
        patch = self.tf(patch)

        label = torch.tensor(int(row["label"]))
        return patch, label
