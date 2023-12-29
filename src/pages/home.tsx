import { useNavigate } from 'react-router-dom';
import React, { useRef, useState, useEffect } from 'react';

import '../styles/home.css';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="home">
      <div className="typewriter">
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