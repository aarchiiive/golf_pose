import React, {
  useRef,
  useState,
  useEffect,
  useReducer
} from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [recordedChunk, setRecordedChunk] = useState<Blob | null>(null);
  const [buttonText, setButtonText] = useState(buttonTexts[0]);
  const [isCapturing, setIsCapturing] = useState(false);

  // styles
  const [backgroundOpacity, setBackgroundOpacity] = useState(1);
  const [videoStyle, setVideoStyle] = useState({});
  const [previewVideoStyle, setPreviewVideoStyle] = useState({});
  const [nextButtonStyle, setNextButtonStyle] = useState({});
  const [nextIconStyle, setNextIconStyle] = useState({});

  const updateStyles = () => {
    const width = window.innerWidth;

    setVideoStyle({
      width: `${width * 0.75}px`,
    });
    setPreviewVideoStyle({
      width: `${width * 0.9}px`,
      // height: `${width * 0.75}px`,
    });
    setNextButtonStyle({
      right: `${width * 0.01}px`,
      width: `${width * 0.05}px`,
      height: `${width * 0.05}px`,
      borderRadius: `${width * 0.025}px`,
    });
    setNextIconStyle({
      width: `${width * 0.03}px`,
      height: `${width * 0.03}px`,
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
      // recorderRef.current.onstop = handleStopRecording;
      recorderRef.current.start();

      if (startButton && videoRef.current) {
        startButton.classList.add('start-button-recording');
        videoRef.current.classList.add('streamer-recording');
      }

    } else {
      // Stop recording
      console.log('Recording stopped');

      setButtonText(buttonTexts[0]);
      setBackgroundOpacity(0.1);

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
    setVideoSrc(null);
    setBackgroundOpacity(1);
  }

  const handleNextButtonClick = () => {
    navigate('/loading');
    // const blob = new Blob(recordedChunk, { type: 'video/webm' });
    // const formData = new FormData();
    // formData.append('video', blob);

    // axios.post('http://127.0.0.1:8000/upload/', formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data'
    //   }
    // })
    //   .then(response => {
    //     console.log('Upload successful', response.data);
    //     // metirc score
    //   })
    //   .catch(error => {
    //     console.error('Error uploading video', error);
    //   });
  }

  return (
    <div className="record">
      {videoSrc && (
        <div className="preview-container">
          <video
            className="preview"
            style={previewVideoStyle}
            src={videoSrc}
            loop
            autoPlay
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
        </div>
      )}
      <div className="record-container" style={{ opacity: backgroundOpacity }}>
        <div className="header">H-Swing Project</div>
            
        {/* Video streamer */}
        <video ref={videoRef} className="streamer" autoPlay playsInline style={videoStyle} />

        {/* Start/Stop button */}
        <div className="button-container">
          <button
            onClick={handleRecording}
            className="start-button"
          >
            {buttonText}
          </button>
        </div>

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
      </div>
    </div>
  );
};

export default Record;