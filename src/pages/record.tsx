import React, {
  useRef,
  useState,
  useEffect,
  useReducer
} from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';

import axios from 'axios';

import '../styles/record.css';

const Record: React.FC = () => {
  const navigate = useNavigate();

  // refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder>();

  const buttonTexts = ['Start Recording', 'Stop Recording'];

  // states
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [buttonText, setButtonText] = useState(buttonTexts[0]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isWebcamLoaded, setIsWebcamLoaded] = useState(false);

  // styles
  const [visibleAnimation, setVisibleAnimation] = useState("animateFadeIn");
  const [previewAnimation, setPreviewAnimation] = useState("hidden");
  const [videoStyle, setVideoStyle] = useState({});
  const [previewVideoStyle, setPreviewVideoStyle] = useState({});

  const visibleVariants = {
    titleFadeIn: {
      y: '-10vh',
      opacity: 0,
    },
    buttonFadeIn: {
      y: '10vh',
      opacity: 0,
    },
    containerFadeIn: {
      opacity: 0,
    },

    titleFadeOut: {
      y: '-10vh',
      opacity: 1,
    },
    buttonFadeOut: {
      y: '10vh',
      opacity: 1,
    },

    containerFadeOut: {
      opacity: 1,
    },

    animateFadeIn: {
      y: '0',
      opacity: 1,
      transition: { 
        duration: 0.8, 
        ease: [0.22, 0.61, 0.36, 1]
      }
    },
    animateFadeOut: {
      y: '0',
      opacity: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.22, 0.61, 0.36, 1]
      }
    },
  };

  const previewVariants = {
    hidden: {
      x: '100vw',
      opacity: 0,
    },

    containerFadeIn: {
      x: '100vw',
      opacity: 0,
    },
    containerFadeOut: {
      x: '0',
      opacity: 1,
    },

    animationFadeIn: {
      x: '0',
      opacity: 1,
      transition: { 
        duration: 0.8, 
        ease: [0.22, 0.61, 0.36, 1]
      }
    },
    animationFadeOut: {
      x: '-100vw',
      opacity: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.22, 0.61, 0.36, 1]
      }
    },
  };

  const updateStyles = () => {
    const width = window.innerWidth;

    setVideoStyle({
      width: `${width * 0.75}px`,
    });
    setPreviewVideoStyle({
      width: `${width * 0.9}px`,
    });
  };

  useEffect(() => {
    updateStyles();
    window.addEventListener('resize', updateStyles);
    return () => window.removeEventListener('resize', updateStyles);
  }, []);

  useEffect(() => {
    // Function to start video stream
    const startVideoStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Error accessing media devices.', error);
      }
    };

    startVideoStream();
    setIsWebcamLoaded(true);
  }, []);

  // handling start/stop recording button
  const handleRecording = async () => {
    const startButton = document.querySelector('.start-button');
    setIsCapturing(!isCapturing);

    console.log('handleRecording -> isCapturing : ', isCapturing);

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
      setVisibleAnimation("animationFadeOut");
      setTimeout(() => {
        setPreviewAnimation("animationFadeIn");
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
    setPreviewAnimation("animationFadeOut");
    setTimeout(() => {
      setVisibleAnimation("animateFadeIn");
    }, 800);
  }

  const handleNextButtonClick = async () => {
    if (videoSrc) {
      const blob = await fetch(videoSrc);
      const videoBlob = await blob.blob();

      const formData = new FormData();
      formData.append('video', videoBlob, 'video.webm');

      axios.post('http://127.0.0.1:8000/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(response => {
        console.log('Upload successful', response.data);
        // metirc score
      }).catch(error => {
        console.error('Error uploading video', error);
      });
    }
    
    setPreviewAnimation("animationFadeOut");
    setTimeout(() => {
      navigate('/loading');
    }, 800);
  }

  return (
    <div className="record">
      {videoSrc && (
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

          <video ref={videoRef} className="streamer" autoPlay playsInline style={videoStyle} >
            {!isWebcamLoaded && (
              <Skeleton width="100%" height="100%" />
            )}
          </video>

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

      {/* Company logo */}
      {/* <div className="company-logo-container">
        <a href="http://hurotics.com/" target="_blank" rel="noopener noreferrer">
          <img
            src={require('../assets/hurotics.png')}
            alt="Company Logo"
            className="company-logo"
          />
        </a>
      </div> */}
      {/* </div> */}
    </div>
  );
};

export default Record;