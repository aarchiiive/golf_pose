import { useNavigate } from 'react-router-dom';
import React, { useRef, useState, useEffect } from 'react';

import '../styles/home.css';

const Home = () => {
  const navigate = useNavigate();
  const typewriterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const adjustFontSize = () => {
      if (typewriterRef.current) {
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const fontSize = vw * 0.016; // 4% of viewport width
        typewriterRef.current.style.fontSize = `${fontSize}px`;
      }
    };

    // Adjust font size on mount and window resize
    adjustFontSize();
    window.addEventListener('resize', adjustFontSize);

    // Cleanup listener
    return () => window.removeEventListener('resize', adjustFontSize);
  }, []);

  return (
    <div className="home">
      <div className="typewriter" ref={typewriterRef}>
        <h1>H-Swing Project Arrived in CES 2024</h1>
      </div>
      <button
        onClick={() => {
          navigate('/record');
        }}
      >Start</button>
      {/* Company logo */}
      {/* <div className="home-company-logo">
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

export default Home;