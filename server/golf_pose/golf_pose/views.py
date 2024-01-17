import os
import uuid
import time
import base64
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
    YOLOModel,
    MetricAnalysis
)

logger = logging.getLogger(__name__)


class RootView(APIView):
    def get(self, request, format=None):
        content = {'message': 'Welcome to the Golf Pose application!'}
        return Response(content)


class VideoUploadView(APIView):
    device = 'cuda:0'
    metric_path = 'golf_pose/h_swing/metric/pro'
    yolo = YOLOModel(device=device)
    metric_analyis = MetricAnalysis(metric_path)
    
    def post(self, request):
        start_time = time.time()
        video_file = request.FILES.get('video', None)
        if not video_file:
            return Response({"message": "No video file provided."}, status=status.HTTP_400_BAD_REQUEST)

        file_name = f"{uuid.uuid4()}.mp4"
        # file_name = 'pro.mp4'
        file_path = os.path.join('uploads', file_name)
        default_storage.save(file_path, video_file)
        converted_file_path = os.path.join('uploads', f"{uuid.uuid4()}_converted.mp4")
        
        self.convert_video(file_path, converted_file_path)
    
        try:
            keypoints, frames = self.yolo(converted_file_path)
            correction = self.metric_analyis(self.yolo.encoded_video, keypoints, frames, self.yolo.left_start, self.yolo.right_start)
            
            return Response({
                "correction": correction
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error occurred during inference: {e}")
            # encoded_video = self.encode_video_to_base64(self.yolo.save_path)
                
            return Response({
                "correction": {}
            }, status=status.HTTP_204_NO_CONTENT)
            
        finally:
            # os.remove(converted_file_path)
            logger.info(f"Finished! ({time.time() - start_time:.4f}s)")
            
    def convert_video(self, input_path, output_path):
        command = [
            'ffmpeg',
            '-i', input_path,
            '-r', '30',
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
        finally:
            pass
            
    def encode_video_to_base64(self, video_path):
        converted_video_path = f"{video_path.split('.')[0]}_converted.mp4"

        self.convert_video(video_path, converted_video_path)

        with open(converted_video_path, "rb") as video_file:
            encoded_video = base64.b64encode(video_file.read()).decode('utf-8')

        return encoded_video
    
    