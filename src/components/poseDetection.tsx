import React, {
  useRef,
  useState,
  useEffect,
  useContext,
  useCallback,
  MutableRefObject,
} from "react";

import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";


interface UsePoseDetectionProps {
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
}


const PoseDetection = ({ videoRef, canvasRef }: UsePoseDetectionProps) => {
  const pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  pose.onResults((results) => {
    const canvasElement = canvasRef.current;
    if (canvasElement) {
      const canvasCtx = canvasElement.getContext("2d");
      if (canvasCtx) {
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

        // Drawing logic
        if (results.poseLandmarks) {
          drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
          drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
        }

        canvasCtx.restore();
      }
    }
  });

  useEffect(() => {
    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await pose.send({ image: videoRef.current });
        },
        width: 1280,
        height: 720,
      });
      camera.start();
    }
  }, [videoRef, pose]);

  return (
    <>
      <video ref={videoRef} className="video" />
      <canvas ref={canvasRef} className="canvas" />
    </>
  )
};

export default PoseDetection;