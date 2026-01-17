import os
from PIL import Image
from torch.utils.data import Dataset
from torchvision import transforms

class CASIAPatchDataset(Dataset):
    def __init__(self, root_dir):
        """
        root_dir = data/casia/patches_reduced/train
        expects:
          real/
          tampered/
        """

        self.samples = []
        self.labels = []

        real_dir = os.path.join(root_dir, "real")
        fake_dir = os.path.join(root_dir, "tampered")

        if not os.path.isdir(real_dir):
            raise FileNotFoundError(f"Missing directory: {real_dir}")
        if not os.path.isdir(fake_dir):
            raise FileNotFoundError(f"Missing directory: {fake_dir}")

        for f in os.listdir(real_dir):
            self.samples.append(os.path.join(real_dir, f))
            self.labels.append(0)   # real

        for f in os.listdir(fake_dir):
            self.samples.append(os.path.join(fake_dir, f))
            self.labels.append(1)   # tampered

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
        ])

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img = Image.open(self.samples[idx]).convert("RGB")
        img = self.transform(img)
        label = self.labels[idx]
        return img, label
