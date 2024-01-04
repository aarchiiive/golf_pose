import React, {
  useRef,
  useState,
  useEffect,
  useContext,
  useCallback,
  useReducer
} from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import Webcam from 'react-webcam';
import { motion, AnimatePresence, animate } from 'framer-motion';

import { Pose, Results, POSE_CONNECTIONS } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { drawCanvas } from '../components/poseDetection';

import '../styles/record.css';

import Loading from './loading';
// import PoseDetection from '../components/poseDetection';
import { visibleVariants, previewVariants } from '../animations/record';
import SwingResultsContext from '../context/swingResultsContext';


const Record: React.FC = () => {
  const poseVideoWidth = 1280;
  const poseVideoHeight = 960;

  const navigate = useNavigate();
  const swingResultsContext = useContext(SwingResultsContext);

  // refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder>();
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultsRef = useRef<Results>();

  const buttonTexts = ['Start Recording', 'Stop Recording'];

  // states
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [buttonText, setButtonText] = useState(buttonTexts[0]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isWebcamLoaded, setIsWebcamLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // styles
  const [visibleAnimation, setVisibleAnimation] = useState("animateFadeIn");
  const [previewAnimation, setPreviewAnimation] = useState("hidden");
  const [videoStyle, setVideoStyle] = useState({});
  const [previewVideoStyle, setPreviewVideoStyle] = useState({});

  const updateStyles = () => {
    const width = window.innerWidth;

    setVideoStyle({
      width: `${width * 0.75}px`,
    });
    setPreviewVideoStyle({
      width: `${width * 0.9}px`,
    });
  };

  const onResults = useCallback((results: Results) => {
    if (canvasRef.current && results) {
      const canvasCtx = canvasRef.current.getContext("2d");
      if (canvasCtx) drawCanvas(canvasCtx, results);
    }
  }, []);

  useEffect(() => {
    updateStyles();
    window.addEventListener('resize', updateStyles);
    return () => window.removeEventListener('resize', updateStyles);
  }, []);

  useEffect(() => {
    // Function to start video stream
    const startVideoStream = async () => {
      try {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.style.transform = 'scaleX(-1)';
          detectPose();
        }
      } catch (error) {
        console.error('Error accessing media devices.', error);
      }
    };

    startVideoStream();
    setIsWebcamLoaded(true);
  }, []);

  const detectPose = () => {
    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      }
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResults);

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await pose.send({ image: videoRef.current! });
        },
        width: poseVideoWidth,
        height: poseVideoHeight,
      });
      camera.start();
    }
  };

  // handling start/stop recording button
  const handleRecording = async () => {
    const startButton = document.querySelector('.start-button');
    setIsCapturing(!isCapturing);

    if (!isCapturing) {
      // Start recording
      console.log('Recording started');

      setButtonText(buttonTexts[1]);

      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current!.srcObject = mediaStream;
      videoRef.current!.play();

      let options = { mimeType: "video/webm" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(`${options.mimeType} is not supported, switching to video/mp4.`);
        options.mimeType = "video/mp4";
      }

      recorderRef.current = new MediaRecorder(mediaStream, options);
      recorderRef.current.addEventListener("dataavailable", handleDataAvailable);
      recorderRef.current.start();

      if (startButton && videoRef.current) {
        startButton.classList.add('start-button-recording');
        videoRef.current.classList.add('streamer-recording');
      }

    } else {
      // Stop recording
      console.log('Recording stopped');

      setButtonText(buttonTexts[0]);
      setVisibleAnimation("reverse");
      setTimeout(() => {
        setPreviewAnimation("animateFadeIn");
      }, 800);

      recorderRef.current!.stop();

      if (startButton && videoRef.current) {
        startButton.classList.remove('start-button-recording');
        videoRef.current.classList.remove('streamer-recording');
      }
    }
  };

  const handleDataAvailable = ({ data }: BlobEvent) => {
    if (data.size > 0) {
      const videoUrl = URL.createObjectURL(data);
      setVideoSrc(videoUrl);
      console.log('Save successfully');
    }
  };

  const handleRetryButtonClick = () => {
    setPreviewAnimation("animateRetryFadeOut");
    setTimeout(() => {
      setVisibleAnimation("animateFadeIn");
    }, 800);
  }

  // gunicorn --bind 0.0.0.0:8000 --timeout 86400 golf_pose.wsgi:application
  const handleNextButtonClick = async () => {
    if (videoSrc) {
      const blob = await fetch(videoSrc);
      const videoBlob = await blob.blob();
      const formData = new FormData();
      formData.append('video', videoBlob, 'video.webm');

      setPreviewAnimation("animateFadeOut");

      setTimeout(() => {
        setIsLoading(true);
      }, 800);  

      axios.post(`${process.env.REACT_APP_API_URL}/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(response => {
        console.log('Upload successfully', response.data);
        // setIsLoading(false);
        // navigate('/results');
        // metirc score
      }).catch(error => {
        console.error('Error uploading video', error);
        // setIsLoading(false);
        // navigate('/results');
      });
    }
  }

  return (
    <>
      {isLoading && (
        <Loading />
      )}
      <div className="record">
        {isWebcamLoaded && (
          <motion.div
            className="record-container"
            variants={visibleVariants}
            initial="containerFadeIn"
            animate={visibleAnimation}
          >
            <motion.div
              className="project-title"
              variants={visibleVariants}
              initial="titleFadeIn"
              animate={visibleAnimation}
            >
              <h1>
                H-Swing Project
              </h1>
            </motion.div>

            <video ref={videoRef} className="streamer" autoPlay playsInline style={videoStyle} />
            <canvas ref={canvasRef} className="canvas" width={poseVideoWidth} height={poseVideoHeight}/>

            {/* Start/Stop button */}
            <div className="button-container">
              <motion.button
                onClick={handleRecording}
                className="start-button"
                variants={visibleVariants}
                initial="buttonFadeIn"
                animate={visibleAnimation}
              >
                {buttonText}
              </motion.button>
            </div>

          </motion.div>
        )}

        {!isLoading && videoSrc && (
          <motion.div
            className="preview-container"
            variants={previewVariants}
            initial="hidden"
            animate={previewAnimation}
          >
            <video
              className="preview"
              style={previewVideoStyle}
              src={videoSrc}
              loop
              autoPlay
              playsInline
              controls={false}
            ></video>
            <div className="preview-button-container">
              <button className="retry-button" onClick={handleRetryButtonClick}>
                Retry
              </button>
              <button className="next-button" onClick={handleNextButtonClick}>
                Next
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default Record;