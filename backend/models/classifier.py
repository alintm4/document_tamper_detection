import torch.nn as nn
from torchvision.models import efficientnet_b4

class TamperClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.backbone = efficientnet_b4(weights="IMAGENET1K_V1")
        self.backbone.classifier[1] = nn.Linear(1792, 2)

    def forward(self, x):
        return self.backbone(x)
