import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import './index.css';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder>();
  const [capturing, setCapturing] = useState(false);
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

  const handleStartCaptureClick = async () => {
    setCapturing(true);
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current!.srcObject = mediaStream;
    videoRef.current!.play();

    mediaRecorderRef.current = new MediaRecorder(mediaStream, { mimeType: "video/webm" });
    mediaRecorderRef.current.addEventListener("dataavailable", handleDataAvailable);
    mediaRecorderRef.current.start();
  };

  const handleDataAvailable = ({ data }: BlobEvent) => {
    if (data.size > 0) {
      setRecordedChunks(prev => [...prev, data]);
    }
  };

  const handleStopCaptureClick = () => {
    mediaRecorderRef.current!.stop();
    setCapturing(false);
  };

  const handleDownload = () => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style.display = "none";
      a.href = url;
      a.download = "recorded-video.webm";
      a.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  };

  return (
    <div className="App">
      <video ref={videoRef} className="mb-4" autoPlay playsInline />
      {!capturing ? (
        <button 
          onClick={handleStartCaptureClick} 
          className="start-button"
          >
          Start Recording
        </button>
      ) : (
        <button 
          onClick={handleStopCaptureClick} 
          className="stop-button"
          >
          Stop
        </button>
      )}
      {recordedChunks.length > 0 && (
        <button 
          onClick={handleDownload} 
          className="download-button"
          >
          Download
        </button>
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
