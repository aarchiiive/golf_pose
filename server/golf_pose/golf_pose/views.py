from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import uuid
import os
from django.core.files.storage import default_storage

class VideoUploadView(APIView):
    def post(self, request): # 이메일, 비밀번호, 비디오 파일 
        video_file = request.FILES.get('video', None)
        if not video_file:
            return Response({"message": "No video file provided."}, status=status.HTTP_400_BAD_REQUEST)

        file_name = f"{uuid.uuid4()}.mp4"
        file_path = os.path.join('uploads', file_name)
        default_storage.save(file_path, video_file)
        
        # yolo = YOLO(f"{uuid.uuid4()}.mp4")
        
        # metric
        # 
        # return Response({"score": score, "message": "Video uploaded successfully."}, status=status.HTTP_201_CREATED)
        return Response({"message": "Video uploaded successfully.", "file_name": file_name}, status=status.HTTP_201_CREATED)