import os
import time

import cv2
import torch
import numpy as np

import torch.nn.functional as F
from torchvision import transforms
from torch.utils.data import DataLoader
from .dataloader import ToTensor, Normalize, SampleVideo

from .model import EventDetector

class GolfDB:
    def __init__(self, device='cuda', mode = None ,seq_length=32):
        self.device = torch.device(device)    
        self.mode = mode
        self.seq_length = seq_length
        self.model = EventDetector(
            pretrain=True,
            width_mult=1.,
            lstm_layers=1,
            lstm_hidden=256,
            bidirectional=True,
            dropout=False,
            device=device,
        )
        self.load_weights()
        self.confidence = []
        self.batch = 0
        self.probs = None
        self.events = None
        self.cap = None
        self.not_sorted = 0
        self.sorted_events = None
        self.event_names = {
            0: '0',
            1: '1',
            2: '2',
            3: '3',
            4: '4',
            5: '5',
            6: '6',
            7: '7'
        }

    def __call__(self, video_path):
        return self.forward(video_path)

    def load_weights(self):
        save_dict = torch.load('weight/swingnet_1800.pth.tar', map_location=self.device)
        self.model.load_state_dict(save_dict['model_state_dict'])
        self.model.to(self.device)
        self.model.eval()

    def forward(self, video_path):
        self.video_path = video_path
        try: 
            self.video_name = video_path.split('.')[0].split('/')[-1]
        except:
            self.video_name = video_path.split('.')[-1]
        self.dataset = SampleVideo(video_path, transform=transforms.Compose([ToTensor(),
                                        Normalize([0.485, 0.456, 0.406],
                                        [0.229, 0.224, 0.225])]))
        self.dataloader = DataLoader(self.dataset, batch_size=1, shuffle=False, drop_last=False)
        self.cap = cv2.VideoCapture(video_path)
        self.cal_probability()
        self.cal_confidence()
        if isinstance(self.mode, str) == True:
            self.save_images()
        if not self.is_sorted():
            return self.sorted_events
        else:
            return self.events
    
    def is_sorted(self):
        print(self.events)
        self.sorted_events = sorted(self.events)
        print(self.sorted_events)
        return (self.sorted_events == self.events).all()

    def cal_confidence(self): 
        self.events = np.argmax(self.probs, axis=0)[:-1]
        for i, e in enumerate(self.events):
            self.confidence.append(self.probs[e, i])
    
    def cal_probability(self):
        for sample in self.dataloader:
            images = sample['images']
            while self.batch * self.seq_length < images.shape[1]:
                if (self.batch + 1) * self.seq_length > images.shape[1]:
                    image_batch = images[:, self.batch * self.seq_length:, :, :, :]
                else:
                    image_batch = images[:, self.batch * self.seq_length:(self.batch + 1) * self.seq_length, :, :, :]
                logits = self.model(image_batch.cuda())
                if self.batch == 0:
                    self.probs = F.softmax(logits.data, dim=1).cpu().numpy()
                else:
                    self.probs = np.append(self.probs, F.softmax(logits.data, dim=1).cpu().numpy(), 0)
                self.batch += 1
    
    def save_images(self):
        for i, e in enumerate(self.events):
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, e)
            _, img = self.cap.read()
            cv2.putText(img, '{:.3f}'.format(self.confidence[i]), (20, 20), cv2.FONT_HERSHEY_DUPLEX, 0.75, (0, 0, 255))
            save_path = os.path.join('results', self.video_name)
            os.makedirs(save_path, exist_ok=True)
            cv2.imwrite(os.path.join(save_path, self.event_names[i] + '.png'), img)


