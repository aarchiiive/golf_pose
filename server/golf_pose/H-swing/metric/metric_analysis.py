import pickle
import pandas as pd
import numpy as np
import matplotlib
import matplotlib.pyplot as plt 
from mpl_toolkits.mplot3d import Axes3D
import matplotlib.gridspec as gridspec
import copy
import cv2
import os
import argparse
from scipy.stats import linregress
from .metricc import *

class MetricAnalysis():
    def __init__(self, pro_path):
        self.score = []
        self.weight_list = [1]*20
        self.weight_sum = np.sum(self.weight_list)
        self.final_sum = 0
        self.result = None
        self.pro_path = pro_path
        self.pro_list = []
        self.usr_list = []
        for i in range(1,21):
            self.pro_name = 'metric_list' + str(i) + '.pickle'
            self.load_pro()
        self.img = 1
    def __call__(self, keypoints, event, left_start, right_start):
        return self.forward(keypoints, event, left_start, right_start)
    
    def forward(self, keypoints, event, left_start, right_start):
        self.load_usr(keypoints, event, left_start, right_start)
        print(len(self.pro_list))
        print(len(self.usr_list))





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


if __name__ == '__main__':
    ma = MetricAnalysis()
    event = [128, 137, 142, 157, 161, 165, 171, 192] #준혁4
    keypoints = pd.read_pickle('junyuk4.pickle')
    ma(keypoints, event)

# def add_toe_upper_rotate_analysis(my_swing_metric_list_3,metric_list_3):

#     my_rotate = my_swing_metric_list_3
#     pro_rotate = metric_list_3
#     # print(my_rotate)
#     # print(pro_rotate)
#     # my_rotate['left'][-1] = 80


#     if my_rotate['left'][-1] > pro_rotate['left'][-1]:

#         if my_rotate['left'][-1] <= 60:
#             angle = my_rotate['left'][-1] - pro_rotate['left'][-1]
#             toe_up_score = int((1-(angle/80))*100)

#             score.append(toe_up_score)
#             print('toe_up시 상체회전이 완벽합니다!')
#             print('toe_up 점수:', toe_up_score)           
        
        
#         elif 60 < my_rotate['left'][-1] <= 70:

#             angle = my_rotate['left'][-1] - pro_rotate['left'][-1]
#             toe_up_score = int((1-(angle/70))*100)

#             score.append(toe_up_score)
#             print('toe_up시 상체를 조금만 더 돌리세요!')
#             print('toe_up 점수:', toe_up_score)
        

#         else :
#             angle = my_rotate['left'][-1] - pro_rotate['left'][-1]
#             toe_up_score = int((1-(angle/60))*100)     
            
#             score.append(toe_up_score)
#             print('toe_up시 상체가 너무 돌지 않고 있습니다! 더 많이 돌리세요!') 
#             print('toe_up 점수:', toe_up_score) 

#     else:       

#         if my_rotate['left'][-1] >= 40:
#             angle = pro_rotate['left'][-1] - my_rotate['left'][-1]
#             toe_up_score = int((1-(angle/90))*100)

#             score.append(toe_up_score)
#             print('toe_up시 상체회전이 완벽합니다!')
#             print('toe_up 점수:', toe_up_score) 


#         elif 30 <= my_rotate['left'][-1] < 40:

#             angle = pro_rotate['left'][-1] - my_rotate['left'][-1]
#             toe_up_score = int((1-(angle/70))*100)

#             score.append(toe_up_score)
#             print('toe_up시  상체를 조금만 덜 돌리세요')
#             print('toe_up 점수:', toe_up_score)  


#         else:
#             angle = pro_rotate['left'][-1] - my_rotate['left'][-1]
#             toe_up_score = int((1-(angle/60))*100)

#             score.append(toe_up_score)
#             print('toe_up시 상체가 너무 돌아갔습니다! 조금만 돌리세요!')
#             print('toe_up 점수:', toe_up_score) 
 
#     print()

