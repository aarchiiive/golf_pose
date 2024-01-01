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
    def __init__(self, device='cuda', mode = None ,seq_length=64):
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
        self.load_weights(self.model)
        self.confidence = []
        self.batch = 0
        self.event_names = {
            0: 'Address',
            1: 'Toe-up',
            2: 'Mid-backswing (arm parallel)',
            3: 'Top',
            4: 'Mid-downswing (arm parallel)',
            5: 'Impact',
            6: 'Mid-follow-through (shaft parallel)',
            7: 'Finish'
        }

    def __call__(self, video_path):
        return self.forward(video_path)

    def load_weights(self, model):
        # save_dict = torch.load('swingnet_1800.pth.tar')
        save_dict = torch.load('golf_pose/h_swing/swingnet_1800.pth.tar', map_location=self.device)
        model.load_state_dict(save_dict['model_state_dict'])
        model.to(self.device)
        model.eval()

    def forward(self, video_path):
        self.video_path = video_path
        try: 
            self.video_name = video_path.split('.')[0].split('/')[-1]
        except:
            self.video_name = video_path.split('.')[-1]
        self.dataset = SampleVideo(video_path, transform=transforms.Compose([ToTensor(),
                                        Normalize([0.485, 0.456, 0.406],
                                        [0.229, 0.224, 0.225])]))
        self.dataloader = dl = DataLoader(self.dataset, batch_size=1, shuffle=False, drop_last=False)
        self.cap = cv2.VideoCapture(video_path)
        probs = self.cal_probability()
        events = self.cal_confidence(probs)
        if isinstance(self.mode, str) == True:
            self.save_images(events)
        return events
    
    def cal_confidence(self, probs): 
        events = np.argmax(probs, axis=0)[:-1]
        for i, e in enumerate(events):
            self.confidence.append(probs[e, i])
        return events
    
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
                    probs = F.softmax(logits.data, dim=1).cpu().numpy()
                else:
                    probs = np.append(probs, F.softmax(logits.data, dim=1).cpu().numpy(), 0)
                self.batch += 1
        return probs
    
    def save_images(self, events):
        for i, e in enumerate(events):
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, e)
            _, img = self.cap.read()
            cv2.putText(img, '{:.3f}'.format(self.confidence[i]), (20, 20), cv2.FONT_HERSHEY_DUPLEX, 0.75, (0, 0, 255))
            save_path = os.path.join('results', self.video_name)
            os.makedirs(save_path, exist_ok=True)
            cv2.imwrite(os.path.join(save_path, self.event_names[i] + '.png'), img)


if __name__ == '__main__':
    # model = GolfDB('dataset/junyuk4.mp4')
    model = GolfDB(device='cuda')
    # model = GolfDB('dataset/Tigerwoods.mp4',device='cuda', mode = 'save_image')
    start_time = time.time()
    events = model('dataset/junyuk4.mp4')
    end_time = time.time()
    print('inference_time:{}s'.format(int(end_time)-int(start_time)))
    print(events)

