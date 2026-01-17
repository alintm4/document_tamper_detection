import torch.nn as nn
from torchvision.models import mobilenet_v3_small

class TamperClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.backbone = mobilenet_v3_small(weights="IMAGENET1K_V1")
        self.backbone.classifier[3] = nn.Linear(1024, 2)

    def forward(self, x):
        return self.backbone(x)
