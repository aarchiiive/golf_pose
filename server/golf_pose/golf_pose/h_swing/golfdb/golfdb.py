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
        self.not_sorted = 0
        self.sorted_events = None
        self.seen_events = {}
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

    def __call__(self, video_path, video_frame):
        return self.forward(video_path, video_frame)

    def load_weights(self):
        save_dict = torch.load('weight/swingnet_1800.pth.tar', map_location=self.device)
        self.model.load_state_dict(save_dict['model_state_dict'])
        self.model.to(self.device)
        self.model.eval()

    def forward(self, video_array, video_frame):
        self.dataset = SampleVideo(video_array, transform=transforms.Compose([ToTensor(),
                                        Normalize([0.485, 0.456, 0.406],
                                        [0.229, 0.224, 0.225])]))
        self.dataloader = DataLoader(self.dataset, batch_size=1, shuffle=False, drop_last=False)
        self.cal_probability()
        self.cal_confidence()
        
        if not self.is_sorted():
            # self.sorted_events = [3,3,57,61,78,129,136,136,139]
            # self.sorted_events = self.modify_list(self.sorted_events)
            # print(self.sorted_events)
            return self.sorted_events
        else:
            self.events = self.modify_list(self.events)
            return self.events
    
    def modify_list(self, lst):
        for i, num in enumerate(lst):
            if num in self.seen_events: 
                idx = self.seen_events[num] 
                average = (lst[idx - 1] + lst[idx + 1]) / 2  
                lst[idx] = average
            self.seen_events[num] = i 
        return lst

    def is_sorted(self):
        self.sorted_events = sorted(self.events)
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
    



