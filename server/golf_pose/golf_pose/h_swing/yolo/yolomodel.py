import os
import copy
import time
import logging

import cv2
import numpy as np

from ultralytics import YOLO

class YOLOModel:
    def __init__(self, device = 'cuda', mode = None):
        self.model = YOLO('weight/yolov8n-pose.pt')  
        self.device = device
        self.mode = mode
        self.event = None
        self.heights = []
        self.left_frame = []
        self.new_event = {}
        self.event_dict = None
        self.keypoints = []
        self.image_frames = None
        self.video = []
        self.frame_count = None
        self.width = None
        self.height = None
        self.left_start = None
        self.right_start = None
        self.radius = None
        self.y_position = None
        self.connections = [[5, 7], [6, 8], [7, 9], [8, 10],
                            [5, 11], [6, 12], [11, 13], [12, 14],
                            [13, 15], [14, 16], [5, 6], [11, 12], [0, 5, 6]]
        self.LR = np.array([0,1,0,1,0,1,0,1,0,1,0,1,2])
        self.line_color = (153, 204, 153)
        self.colors = [(255, 204, 102), (153, 102, 204), (102, 204, 102)]
        self.thickness = 3

    def __call__(self, video_path, event, not_sorted):
        return self.forward(video_path, event, not_sorted)
    
    def forward(self, video_path, event, not_sorted):
        # try: 
        #     self.video_name = video_path.split('.')[0].split('/')[-1]
        # except:
        #     self.video_name = video_path.split('.')[-1]
        self.not_sorted = not_sorted
        self.image_frames = self._get_images_from_video(video_path)
        self.event = event
        self.event_dict = self._make_event_dict() 
        # self._save_video()
        for frame, image in enumerate(self.image_frames):
            logging.info(f"Frame : {frame}/{self.frame_count}")
            logging.info(f"Frame count : {self.frame_count}")
            image = cv2.resize(image,(860,480))
            
            self.results = self.model(image, half=True, stream=True, max_det=1, device=self.device)
            
            for _ , r in enumerate(self.results):
                keypoint = self._save_kpts(r)
                if (keypoint[16][0] - keypoint[10][0]) > 0 :
                    self.left_frame.append(frame)
                self._get_lines(frame, keypoint)
                self._save_keypoints(image, keypoint, frame)
        # self.video_writer.release()
        
        if self.not_sorted == 1:
            self.make_sorted_events()
            self.event_dict = self.new_event
            return self.keypoints, self.video, self.event_dict
        elif self.not_sorted == 0:
            return self.keypoints, self.video
    
    def make_sorted_events(self):
        for frame, keypoint in enumerate(self.keypoints):
            wrist_keypoint = keypoint[10]
            before_keypoint = self.keypoints[frame-1][10]
            max_height = (np.array(self.keypoints)[:self.left_frame[-1],10,1]).min()
            min_height = (np.array(self.keypoints)[self.left_frame[-15]:self.left_frame[-1],10,1]).max()
            max_left = (np.array(self.keypoints)[:,10,0]).min()
            max_right = (np.array(self.keypoints)[:,10,0]).max()
            x_dif = before_keypoint[0] - wrist_keypoint[0]
            y_dif = before_keypoint[1] - wrist_keypoint[1]
            if x_dif >= 8 and len(self.new_event) == 0 and frame != 0:
                self.new_event[0] = frame - 1
            else: self.new_event[0] = 10
            if abs(max_left - wrist_keypoint[0]) < 1 and len(self.new_event) == 1:
                self.new_event[2] = frame
            if abs(max_height - wrist_keypoint[1]) < 1 and len(self.new_event) == 2:
                self.new_event[3] = frame
            if abs(min_height - wrist_keypoint[1]) < 1 and len(self.new_event) == 3:
                self.new_event[5] = frame + 1
            if abs(max_right - wrist_keypoint[0]) < 1 and len(self.new_event) == 4:
                self.new_event[6] = frame
       
        self.new_event[1] = self.new_event[0] + (self.new_event[2] - self.new_event[0]) // 2
        self.new_event[4] = self.new_event[5] - 3
        self.new_event[7] = self.new_event[6] + 5

    def _get_images_from_video(self,video_path):
        video_capture = cv2.VideoCapture(video_path)
        self.image_frames = []
        self.frame_count = int(video_capture.get(cv2.CAP_PROP_FRAME_COUNT))
        self.width = int(video_capture.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.height = int(video_capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
        for i in range(self.frame_count):
            success, frame = video_capture.read()
            if not success:
                break
            self.image_frames.append(frame)
        video_capture.release()
        return self.image_frames

    def _get_lines(self, frame, keypoint):
        if self.not_sorted == 0 :
            if frame == 0:
                self.left_start = list(map(int, keypoint[16]))
                self.right_start = list(map(int, keypoint[15]))
                self.radius = int((keypoint[1][0] - keypoint[2][0]) * 1.5)
            elif frame == self.event_dict[0]:
                self.left_start = list(map(int, keypoint[16]))
                self.right_start = list(map(int, keypoint[15]))
                self.radius = int((keypoint[1][0] - keypoint[2][0]) * 1.5)
        elif self.not_sorted == 1 :
            if frame == 0 :
                self.left_start = list(map(int, keypoint[16]))
                self.right_start = list(map(int, keypoint[15]))
                self.radius = int((keypoint[1][0] - keypoint[2][0]) * 1.5)

    def _draw_kpts(self, keypoint, img):
        for j,c in enumerate(self.connections):
            if len(c) == 3:
                start = list(map(int, keypoint[c[0]]))
                end = list(map(int, (keypoint[c[1]] + keypoint[c[2]])//2))
                cv2.circle(img, (start[0], start[1]), thickness= 3, color=(153, 153, 153), radius=self.radius)
            else:
                start = list(map(int, keypoint[c[0]]))
                end = list(map(int, keypoint[c[1]]))
            cv2.line(img, (start[0], start[1]), (end[0], end[1]), self.colors[self.LR[j]], self.thickness)
            cv2.circle(img, (start[0], start[1]), thickness=-1, color=(153, 153, 153), radius=3)
            cv2.circle(img, (end[0], end[1]), thickness=-1, color=(153, 153, 153), radius=3)

        cv2.line(img, (self.left_start[0] - 30, self.left_start[1]), (self.left_start[0] - 30, self.left_start[1] - int(self.height/1.2)), self.line_color, self.thickness)
        cv2.line(img, (self.right_start[0] + 30, self.right_start[1]), (self.right_start[0] + 30, self.right_start[1] - int(self.height/1.2)), self.line_color, self.thickness)
        return img

    def _make_event_dict(self):
        event_dict = {}
        for i, frame in enumerate(self.event):
            event_dict[i] = frame
        return event_dict
    
    def _save_keypoints(self, image, keypoint, frame):
        img = self._draw_kpts(keypoint, copy.deepcopy(image))
        self.video.append(img)
        # self.video_writer.write(img)
        if isinstance(self.mode, str) == True:
            self._save_images(img, frame)

    def _save_images(self,image, index):
        save_path = os.path.join('results',self.video_name)
        os.makedirs(save_path, exist_ok=True)
        cv2.imwrite(os.path.join(save_path ,  str(index) + '.png'), image)

    def _save_video(self):
        save_path = os.path.join('results',self.video_name)
        os.makedirs(save_path, exist_ok=True)
        self.video_writer = cv2.VideoWriter(os.path.join(save_path , self.video_name + '.mp4'), cv2.VideoWriter_fourcc(*'mp4v'), 30, (860, 480))

    def _save_kpts(self,r):
        if self.device == 'cpu':
            keypoint = np.array(r.keypoints.xy).squeeze(0)
            self.keypoints.append(keypoint)
        else:
            keypoint = np.array(r.keypoints.xy.cpu()).squeeze(0)
            self.keypoints.append(keypoint)
        return keypoint
