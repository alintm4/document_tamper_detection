import torch.nn as nn
from torchvision.models import convnext_tiny

class TamperClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = convnext_tiny(weights="DEFAULT")
        self.net.classifier[2] = nn.Linear(768, 2)

    def forward(self, x):
        return self.net(x)
