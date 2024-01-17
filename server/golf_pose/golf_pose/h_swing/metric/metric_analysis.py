import os
from enum import Enum
from collections import defaultdict, Sequence

import random
import pandas as pd
import numpy as np

from .metricc import *


class SwingSequence(Enum):
    TOE_UP = 'toe_up'
    BACKSWING = 'backswing'
    TOP = 'top'
    DOWNSWING = 'downswing'
    IMPACT = 'impact'
    FINISH = 'finish'
    
class SwingIndicies(Enum):
    TOE_UP = [0, 1, 2]
    BACKSWING = [3, 4, 5, 17]
    TOP = [6, 7, 8]
    DOWNSWING = [9, 10, 11, 12, 18]
    IMPACT = [13, 14, 15, 16]
    FINISH = [19]
    
class MetricAnalysis:
    def __init__(self, pro_path, low_score=50, high_score=90):
        self.pro_path = pro_path
        self.low_score = low_score
        self.high_score = high_score
        
        self.score_list = []
        self.weight_list = [1]*20
        self.weight_sum = np.sum(self.weight_list)
        self.final_sum = 0
        self.result = None
        self.pro_list = []
        self.user_list = []
        self.pro = None
        self.user = None
        self.idx = None
        self.score = None
        self.angle = None
        self.mode = None
        self.sequence_name = None
        self.correction = defaultdict(dict)
        # self.pp = pprint.PrettyPrinter(indent=1, width= 160)
        
        self.metric_functions = [
            toe_up_right_arm,
            toe_up_right_shoulder,
            toe_up_rotate,
            back_left_arm,
            back_right_shoulder,
            back_rotate,
            top_left_arm,
            top_right_shoulder,
            top_rotate,
            down_left_arm,
            down_right_shoulder,
            down_rotate,
            down_rotate_lower,
            impact_right_shoulder,
            impact_rotate,
            impact_rotate_lower,
            impact_head,
            finish_center,
            back_center,
            down_center,
        ]
        
        self.swing_indicies = {
            SwingSequence.TOE_UP: SwingIndicies.TOE_UP,
            SwingSequence.BACKSWING: SwingIndicies.BACKSWING,
            SwingSequence.TOP: SwingIndicies.TOP,
            SwingSequence.DOWNSWING: SwingIndicies.DOWNSWING,
            SwingSequence.IMPACT: SwingIndicies.IMPACT,
            SwingSequence.FINISH: SwingIndicies.FINISH,
        }
        
        for i in range(1, 21):
            self.pro_name = f'metric_list{i}.pickle'
            self.load_pro()
            
        self.img = 1

    def __call__(self, encoded_video, keypoints, event, left_start, right_start):
        return self.forward(encoded_video, keypoints, event, left_start, right_start)
    
    def forward(self,encoded_video ,keypoints, event, left_start, right_start):
        self.encoded_video = encoded_video
        self.load_user(keypoints, event, left_start, right_start)
        self.toe_up_analysis()
        self.backswing_analysis()
        self.top_analysis()
        self.downswing_analysis()
        self.impact_analysis()
        self.finish_analysis()
        return self.correction
        # self.pp.pprint(self.correction)
    
    def toe_up_analysis(self):
        self.analyze_swing(SwingSequence.TOE_UP)

    def backswing_analysis(self):
        self.analyze_swing(SwingSequence.BACKSWING)

    def top_analysis(self):
        self.analyze_swing(SwingSequence.TOP)

    def downswing_analysis(self):
        self.analyze_swing(SwingSequence.DOWNSWING)

    def impact_analysis(self):
        self.analyze_swing(SwingSequence.IMPACT)

    def finish_analysis(self):
        self.analyze_swing(SwingSequence.FINISH)
    
    def analyze_swing(self, sequence: SwingSequence):
        self.sequence_name = sequence.value
        self.correction[self.sequence_name] = defaultdict(list)
        self.add_video(self.encoded_video)
        for i in self.swing_indicies[sequence].value:
            self.get_score(i)
            self.print_correction(i)
    
    def add_message(self, message):
        self.correction[self.sequence_name]['messages'].append(message)
        
    def add_score(self, score):
        self.correction[self.sequence_name]['scores'].append(score)
    
    def add_video(self, video):
        self.correction[self.sequence_name]['video'].append(video)
    
    def get_score(self, index):
        if index in [17, 18]:
            self.pro = int(self.pro_list[index])
            self.user = int(self.user_list[index])
            if self.pro > self.user:
                try:
                    self.score = int((1 - ((self.pro-self.user)/30))*100)
                except:
                    self.score = 0
                if self.score < 0:
                    self.score = random.randint(0, 30)
            else: 
                self.score = 100

        elif index in [16, 19]:
            self.pro = int(self.pro_list[index])
            self.user = int(self.user_list[index])
            if self.pro >= self.user:
                self.score = 100
            else:
                try:
                    self.score = int((1 - (self.user - self.pro)/30)*100)
                except:
                    self.score = 0
                if self.score < 0:
                    self.score = random.randint(0, 30)

        else:
            self.pro = round(self.pro_list[index],1)
            self.user = round(self.user_list[index],1)
            self.angle = self.user - self.pro
            if self.angle > 0 :
                try:
                    self.score = int((1 - (self.angle / 120))*90) if index in [0, 3, 4, 6, 7, 9, 10] else int((1 - (self.angle/30))*100)
                except:
                    self.score = 0
                if self.score < 0:
                    self.score = random.randint(0, 30)
                self.mode = 'higher'
            elif self.angle < 0 :
                self.angle = self.angle * -1
                try:
                    self.score = int((1 - (self.angle / 120))*90) if index in [0, 3, 4, 6, 7, 9, 10] else int((1 - (self.angle/30))*100)
                except:
                    self.score = 0
                self.mode = 'lower'
                if self.score < 0:
                    self.score = random.randint(0, 30)
            else:
                self.mode = 'perfect'

    def print_correction(self, index):
        
        if index == 0:
            if self.mode == 'higher':
                if self.score >= self.high_score:
                    self.add_message("Straightness of your right arm is perfect.")
                elif self.low_score < self.score < self.high_score:
                    self.add_message("Keep your right arm more away.")
                else:
                    self.add_message("Keep your right arm much further away.")
            elif self.mode == 'lower':
                if self.score >= self.high_score:
                    self.add_message("Straightness of your right arm is perfect.")
                elif self.low_score < self.score < self.high_score:
                    self.add_message("Keep your right arm much further away.")
                else:
                    self.add_message("Keep your right arm much further away.")
            else:
                self.add_message("Straightness of your right arm is perfect.")

        elif index in [3, 6, 9]:
            if self.mode == 'higher':
                if self.score >= self.high_score:
                    self.add_message("Straightness of your left arm is perfect.")
                elif self.low_score < self.score < self.high_score:
                    self.add_message("Keep your left arm more away.")
                else:
                    self.add_message("Keep your left arm much further away.")
            elif self.mode == 'lower':
                if self.score >= self.high_score:
                    self.add_message("Straightness of your left arm is perfect.")
                elif self.low_score < self.score < self.high_score:
                    self.add_message("Keep your left arm more away.")
                else:
                    self.add_message("Keep your left arm much further away.")
            else:
                self.add_message("Straightness of your left arm is perfect.")
            
        elif index in [1, 4, 7, 10, 13]:
            if self.mode == 'higher':
                if self.score >= self.high_score:
                    self.add_message("Position of your right arm is perfect.")
                elif self.low_score < self.score < self.high_score:
                    self.add_message("Lower your right arm more.")
                else:
                    self.add_message("Lower your right arm much more.")
            elif self.mode == 'lower':
                if self.score >= self.high_score:
                    self.add_message("Position of your right arm is perfect.")
                elif self.low_score < self.score < self.high_score:
                    self.add_message("Lift your right arm more.")
                else:
                    self.add_message("Lift your right arm much more.")
            else:
                self.add_message("Position of your right arm is perfect.")
                
        elif index in [2, 5, 8, 11, 14]:
            if self.mode == 'higher':
                if self.score >= self.high_score:
                    self.add_message("Rotation of your upper body is perfect.")
                elif self.low_score < self.score < self.high_score:
                    self.add_message("Reduce rotation of your upper body more.")
                else:
                    self.add_message("Reduce rotation of your upper body much more.")
            elif self.mode == 'lower':
                if self.score >= self.high_score:
                    self.add_message("Rotation of your upper body is perfect.")
                elif self.low_score < self.score < self.high_score:
                    self.add_message("Rotate your upper body more.")
                else:
                    self.add_message("Rotate your upper bodymuch more.")
            else:
                self.add_message("Rotation of your upper body is perfect.")

        elif index in [12, 15]:
            if self.mode == 'higher':
                if self.score >= self.high_score:
                    self.add_message("Rotation of your lower body is perfect.")
                elif self.low_score < self.score < self.high_score:
                    self.add_message("Reduce rotation of your lower body more.")
                else:
                    self.add_message("Reduce rotation of your lower body much more.")
            elif self.mode == 'lower':
                if self.score >= self.high_score:
                    self.add_message("Rotation of your lower body is perfect.")
                elif self.low_score < self.score < self.high_score:
                    self.add_message("Rotate your lower body more.")
                else:
                    self.add_message("Rotate your lower body much more.")
            else:
                self.add_message("Rotation of your lower body is perfect.")
            
        elif index == 16:
            if self.score >= self.high_score:
                self.add_message("Position of your head is perfect.")
            else:
                self.add_message("Keep your head position.")

        elif index == 17:
            if self.score >= self.high_score:
                self.add_message(" Your body shifting is perfect .")
            else:
                self.add_message(" Keep your body from shifting to the right .")
        
        elif index == 18:
            if self.score >= self.high_score:
                self.add_message(" Your body shifting is perfect .")
            else:
                self.add_message(" Keep your body from shifting to the left .")
        
        elif index == 19:
            if self.score >= self.high_score:
                self.add_message(" Your body shifting is perfect .")
            elif self.low_score < self.score < self.high_score:
                self.add_message(" Move your body to the left more.")
            else:
                self.add_message(" Move your body to the left much more.")
            
        self.add_score(self.score)

    def load_pro(self):
        self.pro_list.append(pd.read_pickle(os.path.join(self.pro_path, self.pro_name)))

    def load_user(self, keypoints, event, left_start, right_start):
        print(event)
        for mf in self.metric_functions:
            _, result = mf(keypoints, self.img, event, left_start, right_start)
            self.user_list.append(result)

    # def final_score_calculate(self):
    #     for i in range(len(self.score)):
    #         self.final_sum += self.score[i] * self.weight_list[i]
    #     self.result = self.final_sum / self.weight_sum
    #     return self.result

