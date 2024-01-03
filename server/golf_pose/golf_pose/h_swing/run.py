import time
import pprint

from golfdb.golfdb import GolfDB
from yolo.yolomodel import YOLOModel
from metric.metric_analysis import MetricAnalysis

golfdb = GolfDB()
yolo = YOLOModel()
metric_analyis = MetricAnalysis('golf_pose/h_swing/metric/pro')

start_time = time.time()

input_video = 'dataset/junyuk4.mp4'
frames, not_sorted = golfdb(input_video)

if not_sorted == 0:
    keypoints, video = yolo(input_video, frames, not_sorted)
elif not_sorted == 1:
    keypoints, video, frames = yolo(input_video, frames, not_sorted)

left_start, right_start = yolo.left_start, yolo.right_start
correction = metric_analyis(keypoints, frames, left_start, right_start)

# pp = pprint.PrettyPrinter(indent=2,width=160)
# pp.pprint(correction)
end_time = time.time()
print('inference_time:{}s'.format(int(end_time)-int(start_time)))
