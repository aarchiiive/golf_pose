import torch

print(torch.cuda.is_available())
print(torch.cuda.device_count())

device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu") 
image = torch.zeros((1, 3, 640, 640)).to(device)
model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True).to(device)

model(image)  # dry run