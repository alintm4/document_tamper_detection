import torch.nn as nn
from torchvision.models.segmentation import deeplabv3_resnet50

class TamperSegmenter(nn.Module):
    def __init__(self):
        super().__init__()
        self.model = deeplabv3_resnet50(weights="DEFAULT")
        self.model.classifier[4] = nn.Conv2d(256, 1, kernel_size=1)

    def forward(self, x):
        return self.model(x)["out"]
