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
    if (isCapturing) {
      setButtonText(buttonTexts[0]);
      handleStopRecording();
    } else {
      setButtonText(buttonTexts[1]);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current!.srcObject = mediaStream;
      videoRef.current!.play();

      mediaRecorderRef.current = new MediaRecorder(mediaStream, { mimeType: "video/webm" });
      mediaRecorderRef.current.addEventListener("dataavailable", handleDataAvailable);
      mediaRecorderRef.current.start();
    }

    setIsCapturing(!isCapturing);
    setShowNextButton(true);
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current!.stop();
    setIsCapturing(false);
    setButtonText(buttonTexts[0]);

    // Blob을 합치고 서버에 업로드
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const formData = new FormData();
    formData.append('video', blob);

    axios.post('http://127.0.0.1:8000/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(response => {
      console.log('Upload successful', response.data);
      // metirc score
    })
    .catch(error => {
      console.error('Error uploading video', error);
    });
  };

  const handleNextButtonClick = () => {
    navigate('/loading');
  }

  return (
    <div className="record">
      <div className="header">Hi-Swing Project</div>
      <video ref={videoRef} className="mb-4" autoPlay playsInline />

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
        <button className="next-button">
          <img
            className="next-icon"
            src={require('../assets/arrow_right.png')}
            alt="Next"
            onClick={handleNextButtonClick}
          />
        </button>
      )}

      {/* Company logo */}
      <div className="company-logo-container">
        <a href="http://hurotics.com/" target="_blank" rel="noopener noreferrer">
          <img
            src={require('../assets/hurotics.png')}
            alt="Company Logo"
            className="company-logo"
          />
        </a>
      </div>

    </div>
  );
};

export default Record;