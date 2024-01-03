import os
import uuid
import time
import logging
import subprocess

import cv2
from ultralytics import YOLO

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import FileUploadParser

from django.http import HttpResponse, FileResponse
from django.core.files.storage import default_storage

from .h_swing import (
    GolfDB,
    YOLOModel,
    MetricAnalysis
)

logger = logging.getLogger(__name__)

from rest_framework.views import APIView
from rest_framework.response import Response

class RootView(APIView):
    def get(self, request, format=None):
        content = {'message': 'Welcome to the Golf Pose application!'}
        return Response(content)


class VideoUploadView(APIView):
    device = 'cuda:0'
    metric_path = 'golf_pose/h_swing/metric/pro'
    
    def post(self, request):
        start_time = time.time()
        video_file = request.FILES.get('video', None)
        if not video_file:
            return Response({"message": "No video file provided."}, status=status.HTTP_400_BAD_REQUEST)

        file_name = f"{uuid.uuid4()}.mp4"
        file_path = os.path.join('uploads', file_name)
        default_storage.save(file_path, video_file)
        
        converted_file_path = os.path.join('uploads', f"{uuid.uuid4()}_converted.mp4")
        
        self.convert_video(file_path, converted_file_path)
        
        try:
            golfDB = GolfDB(device=self.device)
            yolo = YOLOModel(device=self.device)
            metric_analyis = MetricAnalysis(self.metric_path)
            
            frames, not_sorted = golfDB(converted_file_path)
            if not_sorted == 0:
                keypoints, video = yolo(converted_file_path, frames, not_sorted)
            elif not_sorted == 1:
                keypoints, video, frames = yolo(converted_file_path, frames, not_sorted)
            left_start, right_start = yolo.left_start, yolo.right_start
            correction = metric_analyis(keypoints, frames, left_start, right_start)
        except Exception as e:
            logger.error(f"Error occurred during inference: {e}")
            return Response({"message": "Error occurred during inference."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            os.remove(converted_file_path)
            logger.info(f"Finished! ({time.time() - start_time:.4f}s)")
            
        # try:
        #     golfDB = GolfDB(device=self.device)
        #     yolo = YOLOModel(device=self.device)
        #     metric_analyis = MetricAnalysis(self.metric_path)
            
        #     frames = golfDB(converted_file_path)
        #     keypoints, video = yolo(converted_file_path, frames)
        #     left_start, right_start = yolo.left_start, yolo.right_start
        #     correction = metric_analyis(keypoints, frames, left_start, right_start)
        # except Exception as e:
        #     logger.error(f"Error occurred during inference: {e}")
        #     return Response({"message": "Error occurred during inference."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # finally:
        #     os.remove(converted_file_path)
        #     logger.info(f"Finished! ({time.time() - start_time:.4f}s)")
            
        os.remove(converted_file_path)
        logger.info(f"Finished! ({time.time() - start_time:.4f}s)")
        
        # score, message, images
        # return Response({"score": score, "message": "Video uploaded successfully."}, status=status.HTTP_201_CREATED)
        return Response({"message": "Video uploaded successfully.", "file_name": file_name}, status=status.HTTP_201_CREATED)
    
    def convert_video(self, input_path, output_path):
        command = [
            'ffmpeg',
            '-i', input_path,
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '22',
            output_path
        ]
        try:
            result = subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            os.remove(input_path)
            return result
        except subprocess.CalledProcessError as e:
            print(f"An error occurred during video conversion: {e.stderr}")
            raise e
    