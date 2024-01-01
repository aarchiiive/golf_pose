import os
from collections import defaultdict

import pandas as pd
import numpy as np

from .metricc import *



class MetricAnalysis():
    def __init__(self, pro_path):
        self.score_list = []
        self.weight_list = [1]*20
        self.weight_sum = np.sum(self.weight_list)
        self.final_sum = 0
        self.result = None
        self.pro_path = pro_path
        self.pro_list = []
        self.usr_list = []
        self.pro = None
        self.usr = None
        self.idx = None
        self.score = None
        self.angle = None
        self.mode = None
        self.sequence = None
        self.correction = defaultdict(dict)
        # self.pp = pprint.PrettyPrinter(indent=1, width= 160)
        
        for i in range(1,21):
            self.pro_name = 'metric_list' + str(i) + '.pickle'
            self.load_pro()
        self.img = 1

    def __call__(self, keypoints, event, left_start, right_start):
        return self.forward(keypoints, event, left_start, right_start)
    
    def forward(self, keypoints, event, left_start, right_start):
        self.load_usr(keypoints, event, left_start, right_start)
        self.toe_up_analysis()
        self.backswing_analysis()
        self.top_analysis()
        self.downswing_analysis()
        self.impact_analysis()
        self.finish_analysis()
        return self.correction
        # self.pp.pprint(self.correction)
    
    def toe_up_analysis(self):
        self.sequence = 'toe up'
        self.correction[self.sequence] = defaultdict(list)
        self.idx = [0, 1, 2]
        for i in self.idx:
            self.get_score(i)
            self.print_correction(i)

    def backswing_analysis(self):
        self.sequence = 'backswing'
        self.correction[self.sequence] = defaultdict(list)
        self.idx = [3, 4, 5, 17]
        for i in self.idx:
            self.get_score(i)
            self.print_correction(i)

    def top_analysis(self):
        self.sequence = 'top'
        self.correction[self.sequence] = defaultdict(list)
        self.idx = [6, 7, 8]
        for i in self.idx:
            self.get_score(i)
            self.print_correction(i)

    def downswing_analysis(self):
        self.sequence = 'downswing'
        self.correction[self.sequence] = defaultdict(list)
        self.idx = [9, 10, 11, 12, 18]
        for i in self.idx:
            self.get_score(i)
            self.print_correction(i)

    def impact_analysis(self):
        self.sequence = 'impact'
        self.correction[self.sequence] = defaultdict(list)
        self.idx = [13, 14, 15, 16]
        for i in self.idx:
            self.get_score(i)
            self.print_correction(i)

    def finish_analysis(self):
        self.sequence = 'finish'
        self.correction[self.sequence] = defaultdict(list)
        self.idx = [19]
        for i in self.idx:
            self.get_score(i)
            self.print_correction(i)
 
    def get_score(self, index):
        if index in [17, 18]:
            self.pro = int(self.pro_list[index])
            self.usr = int(self.usr_list[index])
            if self.pro > self.usr:
                try:
                    self.score = int((1 - ((self.pro-self.usr)/30))*100)
                except:
                    self.score = 0
            else: 
                self.score = 100
        elif index in [16, 19]:
            self.pro = int(self.pro_list[index])
            self.usr = int(self.usr_list[index])
            if self.pro >= self.usr:
                self.score = 100
            else:
                try:
                    self.score = int((1 - (self.usr-self.pro)/30)*100)
                except:
                    self.score = 0
        else:
            self.pro = round(self.pro_list[index],1)
            self.usr = round(self.usr_list[index],1)
            self.angle = self.usr - self.pro
            if self.angle > 0 :
                try:
                    self.score = int((1-(self.angle/180))*100) if index in [0, 3, 6, 9] else int((1-(self.angle/45))*100)
                except:
                    self.score = 0
                self.mode = 'higher'
            elif self.angle < 0 :
                self.angle = self.angle * -1
                try:
                    self.score = int((1-(self.angle/180))*100) if index in [0, 3, 6, 9] else int((1-(self.angle/45))*100)
                except:
                    self.score = 0
                self.mode = 'lower'
            else:
                self.mode = 'perfect'

    def print_correction(self, index):

        if index == 0:
            if self.mode == 'higher':
                if self.score >= 90:
                    self.correction[self.sequence]['messages'].append("During {}, straightness of your right arm is perfect.".format(self.sequence))
                elif  50 < self.score < 90:
                    self.correction[self.sequence]['messages'].append("During {}, keep your right arm more away.".format(self.sequence))
                else:
                    self.correction[self.sequence]['messages'].append("During {}, keep your right arm much further away.".format(self.sequence))
                self.correction[self.sequence]['scores'].append(self.score)
            elif self.mode == 'lower':
                if self.score >= 90:
                    self.correction[self.sequence]['messages'].append("During {}, straightness of your right arm is perfect.".format(self.sequence))
                elif  50 < self.score < 90:
                    self.correction[self.sequence]['messages'].append("During {}, keep your right arm much further away.".format(self.sequence))
                else:
                    self.correction[self.sequence]['messages'].append("During {}, keep your right arm much further away.".format(self.sequence))
                self.correction[self.sequence]['scores'].append(self.score)
            else:
                self.correction[self.sequence]['messages'].append("During {}, straightness of your right arm is perfect.".format(self.sequence))
                self.correction[self.sequence]['scores'].append(self.score)

        elif index in [3, 6, 9]:
            if self.mode == 'higher':
                if self.score >= 90:
                    self.correction[self.sequence]['messages'].append("During {}, straightness of your left arm is perfect.".format(self.sequence))
                elif  50 < self.score < 90:
                    self.correction[self.sequence]['messages'].append("During {}, keep your left arm more away.".format(self.sequence))
                else:
                    self.correction[self.sequence]['messages'].append("During {}, keep your left arm much further away.".format(self.sequence))
                self.correction[self.sequence]['scores'].append(self.score)
            elif self.mode == 'lower':
                if self.score >= 90:
                    self.correction[self.sequence]['messages'].append("During {}, straightness of your left arm is perfect.".format(self.sequence))
                elif  50 < self.score < 90:
                    self.correction[self.sequence]['messages'].append("During {}, keep your left arm more away.".format(self.sequence))
                else:
                    self.correction[self.sequence]['messages'].append("During {}, keep your left arm much further away.".format(self.sequence))
                self.correction[self.sequence]['scores'].append(self.score)
            else:
                self.correction[self.sequence]['messages'].append("During {}, straightness of your left arm is perfect.".format(self.sequence))
                self.correction[self.sequence]['scores'].append(self.score)

        elif index in [1, 4, 7, 10, 13]:
            if self.mode == 'higher':
                if self.score >= 90:
                    self.correction[self.sequence]['messages'].append("During {}, position of your right shoulder is perfect.".format(self.sequence))
                elif  50 < self.score < 90:
                    self.correction[self.sequence]['messages'].append("During {}, lower your right shoulder more.".format(self.sequence))
                else:
                    self.correction[self.sequence]['messages'].append("During {}, lower your right shoulder much more.".format(self.sequence))
                self.correction[self.sequence]['scores'].append(self.score)
            elif self.mode == 'lower':
                if self.score >= 90:
                    self.correction[self.sequence]['messages'].append("During {}, position of your right shoulder is perfect.".format(self.sequence))
                elif  50 < self.score < 90:
                    self.correction[self.sequence]['messages'].append("During {}, lift your right shoulder more.".format(self.sequence))
                else:
                    self.correction[self.sequence]['messages'].append("During {}, lift your right shoulder much more.".format(self.sequence))
                self.correction[self.sequence]['scores'].append(self.score)
            else:
                self.correction[self.sequence]['messages'].append("During {}, position of your right shoulder is perfect.".format(self.sequence))
                self.correction[self.sequence]['scores'].append(self.score)
        
        elif index in [2, 5, 8, 11, 14]:
            if self.mode == 'higher':
                if self.score >= 90:
                    self.correction[self.sequence]['messages'].append("During {}, rotation of your upper body is perfect.".format(self.sequence))
                elif  50 < self.score < 90:
                    self.correction[self.sequence]['messages'].append("During {}, reduce rotation of your upper body more.".format(self.sequence))
                else:
                    self.correction[self.sequence]['messages'].append("During {}, reduce rotation of your upper body much more.".format(self.sequence))
                self.correction[self.sequence]['scores'].append(self.score)
            elif self.mode == 'lower':
                if self.score >= 90:
                    self.correction[self.sequence]['messages'].append("During {}, rotation of your upper body is perfect.".format(self.sequence))
                elif  50 < self.score < 90:
                    self.correction[self.sequence]['messages'].append("During {}, rotate your upper body more.".format(self.sequence))
                else:
                    self.correction[self.sequence]['messages'].append("During {}, rotate your upper body much more.".format(self.sequence))
                self.correction[self.sequence]['scores'].append(self.score)
            else:
                self.correction[self.sequence]['messages'].append("During {}, rotation of your upper body is perfect.".format(self.sequence))
                self.correction[self.sequence]['scores'].append(self.score)

        elif index in [12, 15]:
            if self.mode == 'higher':
                if self.score >= 90:
                    self.correction[self.sequence]['messages'].append("During {}, rotation of your lower body is perfect.".format(self.sequence))
                elif  50 < self.score < 90:
                    self.correction[self.sequence]['messages'].append("During {}, reduce rotation of your lower body more.".format(self.sequence))
                else:
                    self.correction[self.sequence]['messages'].append("During {}, reduce rotation of your lower body much more.".format(self.sequence))
                self.correction[self.sequence]['scores'].append(self.score)
            elif self.mode == 'lower':
                if self.score >= 90:
                    self.correction[self.sequence]['messages'].append("During {}, rotation of your lower body is perfect.".format(self.sequence))
                elif  50 < self.score < 90:
                    self.correction[self.sequence]['messages'].append("During {}, rotate your lower body more.".format(self.sequence))
                else:
                    self.correction[self.sequence]['messages'].append("During {}, rotate your lower body much more.".format(self.sequence))
                self.correction[self.sequence]['scores'].append(self.score)
            else:
                self.correction[self.sequence]['messages'].append("During {}, rotation of your lower body is perfect.".format(self.sequence))
                self.correction[self.sequence]['scores'].append(self.score)

        elif index == 16:
            if self.score >= 90:
                self.correction[self.sequence]['messages'].append("During {}, position of your head is perfect.".format(self.sequence))
            else:
                self.correction[self.sequence]['messages'].append("During {}, keep your head position.".format(self.sequence))
            self.correction[self.sequence]['scores'].append(self.score)

        elif index == 17:
            if self.score >= 90:
                self.correction[self.sequence]['messages'].append("During {}, your body shifting is perfect .".format(self.sequence))
            else:
                self.correction[self.sequence]['messages'].append("During {}, Keep your body from shifting to the right .".format(self.sequence))
            self.correction[self.sequence]['scores'].append(self.score)
        elif index == 18:
            if self.score >= 90:
                self.correction[self.sequence]['messages'].append("During {}, your body shifting is perfect .".format(self.sequence))
            else:
                self.correction[self.sequence]['messages'].append("During {}, Keep your body from shifting to the left .".format(self.sequence))
            self.correction[self.sequence]['scores'].append(self.score)
        elif index == 19:
            if self.score >= 90:
                self.correction[self.sequence]['messages'].append("During {}, your body shifting is perfect .".format(self.sequence))
            elif  50 < self.score < 90:
                self.correction[self.sequence]['messages'].append("During {}, move your body to the left more.".format(self.sequence))
            else:
                self.correction[self.sequence]['messages'].append("During {}, move your body to the left much more.".format(self.sequence))
            self.correction[self.sequence]['scores'].append(self.score)

    def load_pro(self):
        pro = pd.read_pickle(os.path.join(self.pro_path, self.pro_name))
        self.pro_list.append(pro)

    def load_usr(self, keypoints, event, left_start, right_start):
        _, result= toe_up_right_arm(keypoints, self.img, event)
        self.usr_list.append(result)
        _, result= toe_up_right_shoulder(keypoints, self.img, event)
        self.usr_list.append(result)
        _, result= toe_up_rotate(keypoints, self.img, event)
        self.usr_list.append(result)
        _, result= back_left_arm(keypoints, self.img, event)
        self.usr_list.append(result)
        _, result= back_right_shoulder(keypoints, self.img, event)  
        self.usr_list.append(result)
        _, result= back_rotate(keypoints, self.img, event) 
        self.usr_list.append(result)
        _, result= top_left_arm(keypoints, self.img, event)   
        self.usr_list.append(result)
        _, result= top_right_shoulder(keypoints, self.img, event)
        self.usr_list.append(result)
        _, result= top_rotate(keypoints, self.img, event)
        self.usr_list.append(result)
        _, result= down_left_arm(keypoints, self.img, event)
        self.usr_list.append(result)
        _, result= down_right_shoulder(keypoints, self.img, event)
        self.usr_list.append(result)
        _, result= down_rotate(keypoints, self.img, event)
        self.usr_list.append(result)
        _, result= down_rotate_lower(keypoints, self.img, event)
        self.usr_list.append(result)
        _, result= impact_right_shoulder(keypoints, self.img, event)
        self.usr_list.append(result)
        _, result= impact_rotate(keypoints, self.img, event)
        self.usr_list.append(result)
        _, result= impact_rotate_lower(keypoints, self.img, event)
        self.usr_list.append(result)
        _, result= impact_head(keypoints, self.img, event)
        self.usr_list.append(result)
        _, result= finish_center(keypoints, self.img, event, right_start)
        self.usr_list.append(result)
        _, result= back_center(keypoints, self.img, event, left_start)
        self.usr_list.append(result)
        _, result= down_center(keypoints, self.img, event, right_start)
        self.usr_list.append(result)


    # def final_score_calculate(self):
    #     for i in range(len(self.score)):
    #         self.final_sum += self.score[i] * self.weight_list[i]
    #     self.result = self.final_sum / self.weight_sum
    #     return self.result

