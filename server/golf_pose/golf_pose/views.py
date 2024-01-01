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

logger = logging.getLogger(__name__)
class VideoUploadView(APIView):
    device = 'cpu'
    def post(self, request): # 이메일, 비밀번호, 비디오 파일 
        start_time = time.time()
        video_file = request.FILES.get('video', None)
        if not video_file:
            return Response({"message": "No video file provided."}, status=status.HTTP_400_BAD_REQUEST)

        file_name = f"{uuid.uuid4()}.mp4"
        file_path = os.path.join('uploads', file_name)
        default_storage.save(file_path, video_file)
        
        yolo = YOLO('yolov8l.pt')
        results = yolo.predict(file_path, device=self.device, conf=0.5, stream=True, vid_stride=30, save_frames=True)

        logger.info(f"Finished! ({time.time() - start_time:.4f}s)")
        
        # results = yolo(f'uploads/{file_name}')
        
        # yolo = YOLO(f"{uuid.uuid4()}.mp4")
        
        # metric
        # score, message, images
        # return Response({"score": score, "message": "Video uploaded successfully."}, status=status.HTTP_201_CREATED)
        return Response({"message": "Video uploaded successfully.", "file_name": file_name}, status=status.HTTP_201_CREATED)
    
class VideoToGifAPIView(APIView):
    def post(self, request):
        video_file = request.FILES.get('video', None)
        if not video_file:
            return Response({'error': 'No video file provided'}, status=status.HTTP_400_BAD_REQUEST)

        # 임시 파일 저장
        file_name = f"{uuid.uuid4()}.webm"
        file_path = os.path.join('uploads', file_name)
        default_storage.save(file_path, video_file)

        # FFmpeg를 사용하여 GIF로 변환
        output_gif_name = f"{uuid.uuid4()}.gif"
        output_gif_path = os.path.join('uploads', output_gif_name)

        try:
            subprocess.run([
                'ffmpeg', '-i', default_storage.path(file_path), 
                '-vf', 'scale=320:-1', '-t', '10', '-r', '10', 
                default_storage.path(output_gif_path)
            ], check=True)

            # GIF 파일 제공
            if default_storage.exists(output_gif_path):
                with default_storage.open(output_gif_path, 'rb') as gif:
                    return FileResponse(gif, as_attachment=True, filename=output_gif_name)
            else:
                return Response({'error': 'GIF conversion failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except subprocess.CalledProcessError as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            # 임시 파일 정리
            default_storage.delete(file_path)
            default_storage.delete(output_gif_path)
