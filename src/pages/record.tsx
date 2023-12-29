import React, {
  useRef,
  useState,
  useEffect
} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import '../styles/record.css';

const Record: React.FC = () => {
  const navigate = useNavigate();

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder>();

  const buttonTexts = ['Start Recording', 'Stop Recording'];
  const [isCapturing, setIsCapturing] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [buttonText, setButtonText] = useState(buttonTexts[0]);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const [videoStyle, setVideoStyle] = useState({});
  const [nextButtonStyle, setNextButtonStyle] = useState({});
  const [nextIconStyle, setNextIconStyle] = useState({});

  const updateStyles = () => {
    const width = window.innerWidth;

    setVideoStyle({
      width: `${width * 0.75}px`,
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

  const handleDataAvailable = ({ data }: BlobEvent) => {
    if (data.size > 0) {
      setRecordedChunks(prev => [...prev, data]);
    }
  };

  const handleStartRecordingClick = async () => {
    const videoStreamer = videoRef.current;
    const startButton = document.querySelector('.start-button');

    if (isCapturing) {
      setButtonText(buttonTexts[0]);
      handleStopRecording();
      if (startButton && videoStreamer) {
        startButton.classList.remove('start-button-recording');
        videoStreamer.classList.remove('streamer-recording');
      }
    } else {
      setButtonText(buttonTexts[1]);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current!.srcObject = mediaStream;
      videoRef.current!.play();

      mediaRecorderRef.current = new MediaRecorder(mediaStream, { mimeType: "video/webm" });
      mediaRecorderRef.current.addEventListener("dataavailable", handleDataAvailable);
      mediaRecorderRef.current.start();

      if (startButton && videoStreamer) {
        startButton.classList.add('start-button-recording');
        videoStreamer.classList.add('streamer-recording');
      }
    }

    setIsCapturing(!isCapturing);
    setShowNextButton(true);
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current!.stop();
    setIsCapturing(false);
    setButtonText(buttonTexts[0]);

    // const blob = new Blob(recordedChunks, { type: 'video/webm' });
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
  };

  const handleNextButtonClick = () => {
    navigate('/loading');
  }

  return (
    <div className="record">
      <div className="header">Hi-Swing Project</div>
      <video ref={videoRef} className="streamer" autoPlay playsInline style={videoStyle} />

      {/* Start/Stop button */}
      <div className="button-container">
        <button
          onClick={handleStartRecordingClick}
          className="start-button"
        >
          {buttonText}
        </button>
      </div>

      {/* Next button */}
      {showNextButton && (
        <button className="next-button" style={nextButtonStyle} onClick={handleNextButtonClick}>
          <img
            className="next-icon"
            src={require('../assets/arrow_right.png')}
            alt="Next"
            style={nextIconStyle}
            // onClick={handleNextButtonClick}
          />
        </button>
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

    </div>
  );
};

export default Record;