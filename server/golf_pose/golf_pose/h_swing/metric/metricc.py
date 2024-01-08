import os
import copy
import pickle

import cv2
import numpy as np
import pandas as pd

#############################################################################################
def read_pkl(video_name):
    input_video = np.array(pd.read_pickle(video_name))
    return input_video

def normalize_pro(Tigerwoods, input_video):

    mult_list = []
    for i in range(len(input_video)):
        try:
            height1 = Tigerwoods[i,5,1] - Tigerwoods[i,15,1]
            height2= input_video[i,5,1] - input_video[i,15,1]
            mult = (height2/height1)
            mult_list.append(mult)
        except:
            continue
    Tigerwoods = (min(mult_list))* Tigerwoods

    return Tigerwoods

def draw_all_joints(kps, img, left_start, right_start, radius):
    connections = [[5, 7], [6, 8], [7, 9], [8, 10],
                   [5, 11], [6, 12], [11, 13], [12, 14], [13, 15],
                   [14, 16], [5, 6],[11, 12], [0, 5, 6]]
    LR = np.array([0,1,0,1,0,1,0,1,0,1,0,1,2])
    lcolor = (255, 0, 0)
    rcolor = (0, 0, 255)
    hcolor = (0, 255, 0)
    colors = [lcolor, rcolor, hcolor]
    thickness = 3

    for j,c in enumerate(connections):
        if len(c) == 3:
            start = list(map(int, kps[c[0]]))
            end = list(map(int, (kps[c[1]] + kps[c[2]])//2))
            cv2.line(img, (start[0], start[1]), (end[0], end[1]), colors[LR[j]], thickness)
            cv2.circle(img, (start[0], start[1]), thickness=-1, color=(0, 255, 0), radius=3)
            cv2.circle(img, (end[0], end[1]), thickness=-1, color=(0, 255, 0), radius=3)
            cv2.circle(img, (start[0], start[1]), thickness= 3, color=(0, 255, 0), radius=radius)
        else:
            start = list(map(int, kps[c[0]]))
            end = list(map(int, kps[c[1]]))
            cv2.line(img, (start[0], start[1]), (end[0], end[1]), colors[LR[j]], thickness)
            cv2.circle(img, (start[0], start[1]), thickness=-1, color=(0, 255, 0), radius=3)
            cv2.circle(img, (end[0], end[1]), thickness=-1, color=(0, 255, 0), radius=3)

    cv2.line(img, (left_start[0]-30, left_start[1]), (left_start[0]-30, left_start[1]-500), (100,100,100), thickness)
    cv2.line(img, (right_start[0]+ 30, right_start[1]), (right_start[0]+30, right_start[1]-500), (100,100,100), thickness)

    return img

def save_all_joints(input_video, video_name, event_dict):
    img = np.full((480,860,3), 255, dtype=np.uint8)
    output_dir = video_name + '/full' 
    left_start = list(map(int, input_video[event_dict[0]][16]))
    right_start = list(map(int, input_video[event_dict[0]][15]))
    radius = int((input_video[event_dict[0]][1][0] - input_video[event_dict[0]][2][0]) * 1.5)
    for i in range(len(input_video)):
        image = draw_all_joints(input_video[i], copy.deepcopy(img), left_start, right_start, radius)
        os.makedirs(output_dir, exist_ok=True)
        cv2.imwrite(os.path.join(output_dir , str(('%04d'% i)) + '.png'), image)

def joint_mov_sync(start, start1, end, end1, movement_list, movement_2_list):

    movement = start1[0] - start[0]
    movement_2 = end1[0] - end[0]

    movement_list.append(movement)
    movement_2_list.append(movement_2)

    current_movement = movement - movement_list[0]
    current_movement_2 = movement_2 - movement_list[0]


    start = np.array(start)
    current_movement = [current_movement,0]
    current_movement = np.array(current_movement)
    start = start - current_movement

    end = np.array(end)
    current_movement_2 = [current_movement_2,0]
    current_movement_2 = np.array(current_movement_2)
    end = end - current_movement_2

    return start, end

def get_angle_from_2vectors(vector1,vector2):

    vect_norm1 = np.linalg.norm(vector1)
    vect_norm2 = np.linalg.norm(vector2)

    dot = np.dot(vector1,vector2)
    cos = dot / (vect_norm1*vect_norm2)
    angle = np.arccos(cos)
    angle = np.rad2deg(angle)

    return angle

def split_left_right(angle_list):
    right = []
    left = []

    for i in range(len(angle_list)):
        try:
            if angle_list[i+1] > angle_list[i] :
                if (len(right) == 0) and (len(left)==0):
                    right.append(angle_list[i])
                elif len(right) == 0:
                    left.append(angle_list[i])
                right.append(angle_list[i+1])
            else: left.append(angle_list[i])
        except:
            if angle_list[i] < angle_list[i-1]:
                left.append(angle_list[i])
            else: continue

    return right,left
 
def draw_joints(kps, img, check_joint,index):
 
    lcolor = (255, 0, 0)
    rcolor = (0, 0, 255)
    thickness = 2

    start = map(int, kps[index][check_joint[1]])
    end1 = map(int, kps[index][check_joint[0]])    
    end2 = map(int, kps[index][check_joint[2]])      

    start = list(start)
    end1 = list(end1)       
    end2 = list(end2)

    # cv2.line(img, (start[0], start[1]), (end1[0], end1[1]), lcolor , thickness)
    # cv2.line(img, (start[0], start[1]), (end2[0], end2[1]), lcolor , thickness)
    # cv2.circle(img, (start[0], start[1]), thickness=-1, color=(0, 255, 0), radius=1)
    # cv2.circle(img, (end1[0], end1[1]), thickness=-1, color=(0, 255, 0), radius=3)
    # cv2.circle(img, (end2[0], end2[1]), thickness=-1, color=(0, 255, 0), radius=3)

    start = np.array(start)
    end1 = np.array(end1)       
    end2 = np.array(end2)

    return start, end1, end2

def draw_points(kps, img, check_joint, index, mode = None,line = None):
 
    lcolor = (255, 0, 0)
    rcolor = (0, 0, 255)
    thickness = 2

    point = map(int, kps[index][check_joint])
    point = list(point)
 
    # cv2.circle(img, (point[0], point[1]), thickness=-1, color=(0, 255, 0), radius=3)
    # point = np.array(point)
    
    # if isinstance(line,list) == True:
    #     if mode == 'left':
    #         cv2.line(img, (line[0] - 30, line[1]), (line[0] - 30, line[1] - 400), (100,100,100), thickness)
    #     elif mode == 'right':
    #         cv2.line(img, (line[0] + 30, line[1]), (line[0] + 30, line[1] - 400), (100,100,100), thickness)

    return point
#######################################################################################

def toe_up_right_arm(kps, img, event_dict, left_start=None, right_start=None):
    check_joint = [6, 8, 10]
    angle_list = []
    for i in range(event_dict[1]-3, event_dict[1]+1):      
        start, end1, end2 = draw_joints(kps, img, check_joint, i)   
        vector1 = end1 - start
        vector2 = end2 - start 
        angle = get_angle_from_2vectors(vector1,vector2)
        angle_list.append(angle)
    mean = np.mean(angle_list)
    return img, mean

def toe_up_right_shoulder(kps, img, event_dict, left_start=None, right_start=None):
    check_joint = [12, 6, 8]
    angle_list = []
    for i in range(event_dict[1]-3, event_dict[1]+1):      
        start, end1, end2 = draw_joints(kps, img, check_joint, i)   
        vector1 = end1 - start
        vector2 = end2 - start 
        angle = get_angle_from_2vectors(vector1,vector2)
        angle_list.append(angle)
    mean = np.mean(angle_list)
    max = np.max(angle_list)
    return img, mean

def toe_up_rotate(kps, img, event_dict, left_start=None, right_start=None):
    check_joint = [12, 6, 5]
    angle_list = []
    for i in range(event_dict[1]-3, event_dict[1]+1):      
        start, end1, end2 = draw_joints(kps, img, check_joint, i)   
        vector1 = end1 - start
        vector2 = end2 - start 
        angle = get_angle_from_2vectors(vector1,vector2)
        angle_list.append(angle)
    min = np.min(angle_list)
    max = np.max(angle_list)
    return img, max-min

def back_left_arm(kps, img, event_dict, left_start=None, right_start=None):
    check_joint = [5, 7, 9]
    angle_list = []
    for i in range(event_dict[1],event_dict[2]):      
        start, end1, end2 = draw_joints(kps, img, check_joint, i)   
        vector1 = end1 - start
        vector2 = end2 - start 
        angle = get_angle_from_2vectors(vector1,vector2)
        angle_list.append(angle)
    mean = np.mean(angle_list)
    return img,mean

def back_right_shoulder(kps, img, event_dict, left_start=None, right_start=None):
    check_joint = [12, 6, 8]
    angle_list = []
    for i in range(event_dict[1], event_dict[2]):      
        start, end1, end2 = draw_joints(kps, img, check_joint, i)   
        vector1 = end1 - start
        vector2 = end2 - start 
        angle = get_angle_from_2vectors(vector1,vector2)
        angle_list.append(angle)
    mean = np.mean(angle_list)
    return img, mean

def back_rotate(kps, img, event_dict, left_start=None, right_start=None):
    check_joint = [12, 6, 5]
    angle_list = []
    for i in range(event_dict[1], event_dict[2]):      
        start, end1, end2 = draw_joints(kps, img, check_joint, i)   
        vector1 = end1 - start
        vector2 = end2 - start 
        angle = get_angle_from_2vectors(vector1,vector2)
        angle_list.append(angle)
    min = np.min(angle_list)
    max = np.max(angle_list)
    return img, max-min

def top_left_arm(kps, img, event_dict, left_start=None, right_start=None):
    check_joint = [5, 7, 9]
    angle_list = []
    for i in range(event_dict[2], event_dict[3]):      
        start, end1, end2 = draw_joints(kps, img, check_joint, i)   
        vector1 = end1 - start
        vector2 = end2 - start 
        angle = get_angle_from_2vectors(vector1,vector2)
        angle_list.append(angle)
    mean = np.mean(angle_list)
    return img,mean

def top_right_shoulder(kps, img, event_dict, left_start=None, right_start=None):
    check_joint = [12, 6, 8]
    angle_list = []
    for i in range(event_dict[2], event_dict[3]):      
        start, end1, end2 = draw_joints(kps, img, check_joint, i)   
        vector1 = end1 - start
        vector2 = end2 - start 
        angle = get_angle_from_2vectors(vector1,vector2)
        angle_list.append(angle)
    mean = np.mean(angle_list)
    max = np.max(angle_list)
    return img, mean

def top_rotate(kps, img, event_dict, left_start=None, right_start=None):
    check_joint = [12, 6, 5]
    angle_list = []
    for i in range(event_dict[2], event_dict[3]):      
        start, end1, end2 = draw_joints(kps, img, check_joint, i)   
        vector1 = end1 - start
        vector2 = end2 - start 
        angle = get_angle_from_2vectors(vector1,vector2)
        angle_list.append(angle)
    min = np.min(angle_list)
    max = np.max(angle_list)
    return img, max-min

def down_left_arm(kps, img, event_dict, left_start=None, right_start=None):
    check_joint = [5, 7, 9]
    angle_list = []
    for i in range(event_dict[3], event_dict[4]):      
        start, end1, end2 = draw_joints(kps, img, check_joint, i)   
        vector1 = end1 - start
        vector2 = end2 - start 
        angle = get_angle_from_2vectors(vector1,vector2)
        angle_list.append(angle)
    mean = np.mean(angle_list)
    return img,mean

def down_right_shoulder(kps, img, event_dict, left_start=None, right_start=None):
    check_joint = [12, 6, 8]
    angle_list = []
    for i in range(event_dict[3], event_dict[4]):      
        start, end1, end2 = draw_joints(kps, img, check_joint, i)   
        vector1 = end1 - start
        vector2 = end2 - start 
        angle = get_angle_from_2vectors(vector1,vector2)
        angle_list.append(angle)
    mean = np.mean(angle_list)
    return img, mean

def down_rotate(kps, img, event_dict, left_start=None, right_start=None):
    check_joint = [12, 6, 5]
    angle_list = []
    for i in range(event_dict[3], event_dict[4]):      
        start, end1, end2 = draw_joints(kps, img, check_joint, i)   
        vector1 = end1 - start
        vector2 = end2 - start 
        angle = get_angle_from_2vectors(vector1,vector2)
        angle_list.append(angle)
    min = np.min(angle_list)
    max = np.max(angle_list)
    return img, max-min

def down_rotate_lower(kps, img, event_dict, left_start=None, right_start=None):
    check_joint = [13, 11, 12]
    angle_list = []
    for i in range(event_dict[3], event_dict[4]):      
        start, end1, end2 = draw_joints(kps, img, check_joint, i)   
        vector1 = end1 - start
        vector2 = end2 - start 
        angle = get_angle_from_2vectors(vector1,vector2)
        angle_list.append(angle)
    min = np.min(angle_list)
    max = np.max(angle_list)
    return img, max-min

def impact_right_shoulder(kps, img, event_dict, left_start=None, right_start=None):
    check_joint = [12, 6, 8]
    angle_list = []
    for i in range(event_dict[4], event_dict[5]):      
        start, end1, end2 = draw_joints(kps, img, check_joint, i)   
        vector1 = end1 - start
        vector2 = end2 - start 
        angle = get_angle_from_2vectors(vector1,vector2)
        angle_list.append(angle)
    mean = np.mean(angle_list)
    return img, mean

def impact_rotate(kps, img, event_dict, left_start=None, right_start=None):
    check_joint = [12, 6, 5]
    angle_list = []
    for i in range(event_dict[4], event_dict[5]):      
        start, end1, end2 = draw_joints(kps, img, check_joint, i)   
        vector1 = end1 - start
        vector2 = end2 - start 
        angle = get_angle_from_2vectors(vector1,vector2)
        angle_list.append(angle)
    min = np.min(angle_list)
    max = np.max(angle_list)
    return img, max-min

def impact_rotate_lower(kps, img, event_dict, left_start=None, right_start=None):
    check_joint = [13, 11, 12]
    angle_list = []
    for i in range(event_dict[4], event_dict[5]):      
        start, end1, end2 = draw_joints(kps, img, check_joint, i)   
        vector1 = end1 - start
        vector2 = end2 - start 
        angle = get_angle_from_2vectors(vector1,vector2)
        angle_list.append(angle)
    min = np.min(angle_list)
    max = np.max(angle_list)
    return img, max-min

def impact_head(kps, img, event_dict, left_start=None, right_start=None):
    check_joint = 0
    y_position_list = []
    for i in range(event_dict[4], event_dict[5]):      
        point = draw_points(kps, img, check_joint, i)   
        y_position_list.append(point[1])
    min = np.min(y_position_list)
    max = np.max(y_position_list)
    return img, max-min

def finish_center(kps, img, event_dict, left_start=None, right_start=None):
    check_joint = 11
    x_position_list = []
    for i in range(event_dict[5], event_dict[6]+1):
        point = draw_points(kps, img, check_joint, i, 'right', right_start)
        x_position_list.append((right_start[0] + 30) - point[0])
    min = np.min(x_position_list)
    return img, min

def back_center(kps, img, event_dict, left_start=None, right_start=None):
    check_joint = 14
    x_position_list = []
    for i in range(event_dict[0], event_dict[3]):
        point = draw_points(kps, img, check_joint, i, 'left', left_start)
        x_position_list.append(point[0]-(left_start[0] - 30))
    min = np.min(x_position_list)
    return img, min

def down_center(kps, img, event_dict, left_start=None, right_start=None):
    check_joint = 13
    x_position_list = []
    for i in range(event_dict[3], event_dict[5]):
        point = draw_points(kps, img, check_joint, i, 'right',right_start)
        x_position_list.append(right_start[0] + 30 - point[0])
    min = np.min(x_position_list)
    return img, min





##################################################################################################

if __name__ =='__main__':
    event = [0, 50, 55, 60, 66, 68, 70, 87]
    # event = [128, 137, 142, 157, 161, 165, 171, 192] #준혁4

    pro_video_name = 'Tigerwoods.pickle'
    video_name = 'junyuk4.pickle'

    Tigerwoods = read_pkl(pro_video_name)
    input_video = read_pkl(video_name)
    Tigerwoods = normalize_pro(Tigerwoods, input_video)
    video_name = video_name.split('.')[-2]

    input_video = Tigerwoods
    video_name = pro_video_name.split('.')[-2]

    
    event_dict = {}
    for i, frame in enumerate(event):
        event_dict[i] = frame
        
    # save_all_joints(input_video, video_name, event_dict)
    right_start = list(map(int, input_video[event_dict[0]][15]))
    left_start = list(map(int, input_video[event_dict[0]][16]))
    img = np.full((480,860,3), 255, dtype=np.uint8)
    output_dir = str(video_name) + '/' + 'output2/'

    ###############################################################################################  
    image, result= toe_up_right_arm(input_video,copy.deepcopy(img),event_dict)
    
    os.makedirs(output_dir, exist_ok=True)
    cv2.imwrite(output_dir +'toe_up_right_arm' + '.png', image) 
    with open('metric_list1.pickle', 'wb') as f:
        pickle.dump(result, f, pickle.HIGHEST_PROTOCOL)  
    print('toe up-right arm angle :',result)
    ###############################################################################################  
    image, result= toe_up_right_shoulder(input_video,copy.deepcopy(img),event_dict)
    
    os.makedirs(output_dir, exist_ok=True)
    cv2.imwrite(output_dir +'toe_up_right_shoulder' + '.png', image) 
    with open('metric_list2.pickle', 'wb') as f:
        pickle.dump(result, f, pickle.HIGHEST_PROTOCOL)  
    print('toe up-right shoulder angle :',result)
    ###############################################################################################  
    image, result= toe_up_rotate(input_video,copy.deepcopy(img),event_dict)
    
    os.makedirs(output_dir, exist_ok=True)
    cv2.imwrite(output_dir  +'toe_up_rotate' + '.png', image) 
    with open('metric_list3.pickle', 'wb') as f:
        pickle.dump(result, f, pickle.HIGHEST_PROTOCOL)  
    print('toe up-rotation angle :',result)
    ###############################################################################################  
    image, result= back_left_arm(input_video,copy.deepcopy(img),event_dict)
    
    os.makedirs(output_dir, exist_ok=True)
    cv2.imwrite(output_dir +'back_left_arm' + '.png', image) 
    with open('metric_list4.pickle', 'wb') as f:
        pickle.dump(result, f, pickle.HIGHEST_PROTOCOL)  
    print('backswing-left arm angle :',result)
    ###############################################################################################  
    image, result= back_right_shoulder(input_video,copy.deepcopy(img),event_dict)
    
    os.makedirs(output_dir, exist_ok=True)
    cv2.imwrite(output_dir +'back_right_shoulder' + '.png', image) 
    with open('metric_list5.pickle', 'wb') as f:
        pickle.dump(result, f, pickle.HIGHEST_PROTOCOL)  
    print('backswing-right shoulder angle :',result)
    ###############################################################################################  
    image, result= back_rotate(input_video,copy.deepcopy(img),event_dict)
    
    os.makedirs(output_dir, exist_ok=True)
    cv2.imwrite(output_dir +'back_rotate' + '.png', image) 
    with open('metric_list6.pickle', 'wb') as f:
        pickle.dump(result, f, pickle.HIGHEST_PROTOCOL)  
    print('backswing-rotation angle :',result)
    ###############################################################################################  
    image, result= top_left_arm(input_video,copy.deepcopy(img),event_dict)
    
    os.makedirs(output_dir, exist_ok=True)
    cv2.imwrite(output_dir +'top_left_arm' + '.png', image) 
    with open('metric_list7.pickle', 'wb') as f:
        pickle.dump(result, f, pickle.HIGHEST_PROTOCOL)
    print('top-left arm angle :',result)
    ###############################################################################################  
    image, result= top_right_shoulder(input_video,copy.deepcopy(img),event_dict)
    
    os.makedirs(output_dir, exist_ok=True)
    cv2.imwrite(output_dir +'top_right_shoulder' + '.png', image) 
    with open('metric_list8.pickle', 'wb') as f:
        pickle.dump(result, f, pickle.HIGHEST_PROTOCOL)  
    print('top-right shoulder angle :',result)
    ###############################################################################################  
    image, result= top_rotate(input_video,copy.deepcopy(img),event_dict)
    
    os.makedirs(output_dir, exist_ok=True)
    cv2.imwrite(output_dir +'top_rotate' + '.png', image) 
    with open('metric_list9.pickle', 'wb') as f:
        pickle.dump(result, f, pickle.HIGHEST_PROTOCOL)
    print('top-rotation angle :',result)
    ###############################################################################################  
    image, result= down_left_arm(input_video,copy.deepcopy(img),event_dict)
    
    os.makedirs(output_dir, exist_ok=True)
    cv2.imwrite(output_dir +'down_left_arm' + '.png', image) 
    with open('metric_list10.pickle', 'wb') as f:
        pickle.dump(result, f, pickle.HIGHEST_PROTOCOL)
    print('downswing-left arm angle :',result)
    ###############################################################################################  
    image, result= down_right_shoulder(input_video,copy.deepcopy(img),event_dict)
    
    os.makedirs(output_dir, exist_ok=True)
    cv2.imwrite(output_dir +'down_right_shoulder' + '.png', image) 
    with open('metric_list11.pickle', 'wb') as f:
        pickle.dump(result, f, pickle.HIGHEST_PROTOCOL)
    print('downswing-right shoulder angle :',result)
    ###############################################################################################  
    image, result= down_rotate(input_video,copy.deepcopy(img),event_dict)
    
    os.makedirs(output_dir, exist_ok=True)
    cv2.imwrite(output_dir +'down_rotate' + '.png', image) 
    with open('metric_list12.pickle', 'wb') as f:
        pickle.dump(result, f, pickle.HIGHEST_PROTOCOL)
    print('downswing-rotation angle :',result)
    ###############################################################################################  
    image, result= down_rotate_lower(input_video,copy.deepcopy(img),event_dict)
    
    os.makedirs(output_dir, exist_ok=True)
    cv2.imwrite(output_dir +'down_rotate_lower' + '.png', image) 
    with open('metric_list13.pickle', 'wb') as f:
        pickle.dump(result, f, pickle.HIGHEST_PROTOCOL)
    print('downswing-lower rotation angle :',result)
    ###############################################################################################  
    image, result= impact_right_shoulder(input_video,copy.deepcopy(img),event_dict)
    
    os.makedirs(output_dir, exist_ok=True)
    cv2.imwrite(output_dir +'impact_right_shoulder' + '.png', image) 
    with open('metric_list14.pickle', 'wb') as f:
        pickle.dump(result, f, pickle.HIGHEST_PROTOCOL) 
    print('impact-right shoulder angle :',result)
    ###############################################################################################  
    image, result= impact_rotate(input_video,copy.deepcopy(img),event_dict)
    
    os.makedirs(output_dir, exist_ok=True)
    cv2.imwrite(output_dir +'impact_rotate' + '.png', image) 
    with open('metric_list15.pickle', 'wb') as f:
        pickle.dump(result, f, pickle.HIGHEST_PROTOCOL)
    print('impact-rotation angle :',result)
    ###############################################################################################  
    image, result= impact_rotate_lower(input_video,copy.deepcopy(img),event_dict)
    
    os.makedirs(output_dir, exist_ok=True)
    cv2.imwrite(output_dir +'impact_rotate_lower' + '.png', image) 
    with open('metric_list16.pickle', 'wb') as f:
        pickle.dump(result, f, pickle.HIGHEST_PROTOCOL)
    print('impact-lower rotation angle :',result)
    ###############################################################################################  
    image, result= impact_head(input_video,copy.deepcopy(img),event_dict)
    
    os.makedirs(output_dir, exist_ok=True)
    cv2.imwrite(output_dir +'impact_head' + '.png', image) 
    with open('metric_list17.pickle', 'wb') as f:
        pickle.dump(result, f, pickle.HIGHEST_PROTOCOL)
    print('impact-head position :',result)
    ###############################################################################################  
    image, result= finish_center(input_video,copy.deepcopy(img),event_dict, right_start)
    
    os.makedirs(output_dir, exist_ok=True)
    cv2.imwrite(output_dir +'finish_pelvis' + '.png', image) 
    with open('metric_list18.pickle', 'wb') as f:
        pickle.dump(result, f, pickle.HIGHEST_PROTOCOL)
    print('finish center movement :',result)
    ###############################################################################################  
    image, result= back_center(input_video,copy.deepcopy(img),event_dict, left_start)
    
    os.makedirs(output_dir, exist_ok=True)
    cv2.imwrite(output_dir +'back_center' + '.png', image) 
    with open('metric_list19.pickle', 'wb') as f:
        pickle.dump(result, f, pickle.HIGHEST_PROTOCOL) 
    print('backswing center movement :',result)
    ###############################################################################################  
    image, result= down_center(input_video,copy.deepcopy(img),event_dict, right_start)
    
    os.makedirs(output_dir, exist_ok=True)
    cv2.imwrite(output_dir +'down_center' + '.png', image) 
    with open('metric_list20.pickle', 'wb') as f:
        pickle.dump(result, f, pickle.HIGHEST_PROTOCOL)
    print('downswing center movement :',result)
















  



  



  

  

  

 

  

  

  

  

 

  