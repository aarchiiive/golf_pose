import os
import time
import pprint

from golfdb import GolfDB
from yolo import YOLOModel
from metric import MetricAnalysis

# golfdb = GolfDB(mode='save_images')
yolo = YOLOModel()
metric_analyis = MetricAnalysis('golf_pose/h_swing/metric/pro')

start_time = time.time()

input_video = 'dataset/pro.mp4'
# frames = golfdb(input_video) 
keypoints, frames = yolo(input_video)
correction = metric_analyis(yolo.encoded_video, keypoints, frames, yolo.left_start, yolo.right_start)
pp = pprint.PrettyPrinter(indent=2,width=160)
print(yolo.save_path)

### video
# video = open(yolo.save_path, 'rb')

print(yolo.event_list[1:6])
pp.pprint(correction)
end_time = time.time()
print('inference_time:{}s'.format(int(end_time)-int(start_time)))


