from golfdb.golfdb import GolfDB
from yolov8.yolomodel import YOLOModel
from metric.metric_analysis import MetricAnalysis
import time

golfdb = GolfDB()
yolo = YOLOModel()
metric_analyis = MetricAnalysis('metric/pro')

start_time = time.time()

input_video = 'dataset/junyuk4.mp4'
event = golfdb(input_video)
keypoints, video = yolo(input_video, event)
left_start, right_start = yolo.left_start, yolo.right_start
metric_analyis(keypoints, event, left_start, right_start)

end_time = time.time()
print('inference_time:{}s'.format(int(end_time)-int(start_time)))
