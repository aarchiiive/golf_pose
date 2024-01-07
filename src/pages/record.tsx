import React, {
  useRef,
  useState,
  useEffect,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

// libraries
import axios from 'axios';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';

// styles
import '../styles/record.css';
import { visibleVariants, previewVariants } from '../animations/record';

// redux
import { AppState } from '../store';
import { setSwingResults } from '../actions/swingResultsActions';

// loading
import Loading from './loading';

const Record: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const swingResults = useSelector((state: AppState) => state.swingResults);

  // refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder>();

  const buttonTexts = ['Start Recording', 'Stop Recording'];

  // states
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [buttonText, setButtonText] = useState(buttonTexts[0]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isWebcamLoaded, setIsWebcamLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [responseCode, setResponseCode] = useState<number | null>(null);

  // styles
  const [visibleAnimation, setVisibleAnimation] = useState("animateFadeIn");
  const [previewAnimation, setPreviewAnimation] = useState("hidden");
  const [loadingAnimation, setLoadingAnimation] = useState("animateFadeIn");
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

  useEffect(() => {
    updateStyles();
    window.addEventListener('resize', updateStyles);
    return () => window.removeEventListener('resize', updateStyles);
  }, []);

  // Start video stream
  useEffect(() => {
    
    const startVideoStream = async () => {
      try {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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

  // Get swing results from server
  useEffect(() => {
    console.log('Swing results: ', swingResults);

    setLoadingAnimation("animateFadeOut");
    setTimeout(() => {
      setIsLoading(false);
      if (responseCode === 200) {
        navigate("/results");
      } else if ([204, 400, 404, 500].includes(responseCode!)) {
        setPreviewAnimation("hidden");
        navigate('/error');
      }
    }
    , 800);
  }, [swingResults]);

  // handling start/stop recording button
  const handleRecording = async () => {
    const startButton = document.querySelector('.start-button');
    setIsCapturing(!isCapturing);

    if (!isCapturing) {
      // Start recording
      setButtonText(buttonTexts[1]);

      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current!.srcObject = mediaStream;
      videoRef.current!.play();

      let options = { mimeType: "video/webm" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
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
    }
  };

  const handleRetryButtonClick = () => {
    setPreviewAnimation("animateRetryFadeOut");
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

      setPreviewAnimation("animateFadeOut");

      setTimeout(() => {
        setIsLoading(true);
        setLoadingAnimation("animateFadeIn");
      }, 800);  

      axios.post(`${process.env.REACT_APP_API_URL}/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(response => {
        setResponseCode(response.status);
        const { video, frames, correction } = response.data;
          dispatch(setSwingResults({
            ...swingResults,
            video,
            frames,
            ...correction,
          }));
      }).catch(error => {
        console.error('Error uploading video', error);
      });
    }
  }

  return (
    <>
      {isLoading && (
        <Loading animate={loadingAnimation}/>
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
            <div className="preview-title">
              <h1>Use this video?</h1>
            </div>
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