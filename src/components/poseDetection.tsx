import React, {
  useRef,
  useState,
  useEffect,
  useContext,
  useCallback,
  MutableRefObject,
} from "react";

import { Pose, Results, POSE_CONNECTIONS } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";


interface UsePoseDetectionProps {
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
}


// export const PoseDetection = ({ videoRef, canvasRef }: UsePoseDetectionProps) => {
//   const pose = new Pose({
//     locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
//   });

//   pose.setOptions({
//     modelComplexity: 1,
//     smoothLandmarks: true,
//     enableSegmentation: false,
//     smoothSegmentation: false,
//     minDetectionConfidence: 0.5,
//     minTrackingConfidence: 0.5,
//   });

//   pose.onResults((results) => {
//     const canvasElement = canvasRef.current;
//     if (canvasElement) {
//       const canvasCtx = canvasElement.getContext("2d");
//       if (canvasCtx) {
//         canvasCtx.save();
//         canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
//         canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

//         // Drawing logic
//         if (results.poseLandmarks) {
//           drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
//           drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
//         }

//         canvasCtx.restore();
//       }
//     }
//   });

//   useEffect(() => {
//     if (videoRef.current) {
//       const camera = new Camera(videoRef.current, {
//         onFrame: async () => {
//           await pose.send({ image: videoRef.current });
//         },
//         width: 1280,
//         height: 720,
//       });
//       camera.start();
//     }
//   }, [videoRef, pose]);

//   return (
//     <>
//       <video ref={videoRef} className="video" />
//       <canvas ref={canvasRef} className="canvas" />
//     </>
//   )
// };


export const drawCanvas = (ctx: CanvasRenderingContext2D, results: Results) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.save();
  ctx.clearRect(0, 0, width, height);
  
  // 좌우 반전
  ctx.scale(-1, 1);
  ctx.translate(-width, 0);
  
  // capture image 그리기
  ctx.drawImage(results.image, 0, 0, width, height);
  // 손의 묘사
  if (results.poseLandmarks) {
    drawConnectors(
      ctx, results.poseLandmarks, POSE_CONNECTIONS,
      {
        color: "#CBCBCB",
        lineWidth: 6,
      }
    );
    drawLandmarks(
      ctx, results.poseLandmarks,
      {
        color: '#FFE69D', // 빈 원의 내부 색
        fillColor: 'transparent', // 빈 원의 내부 색
        lineWidth: 4,
        radius: 8,
      }
    );
    ctx.restore();
  }
};