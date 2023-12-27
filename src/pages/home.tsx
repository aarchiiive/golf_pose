import { useNavigate } from 'react-router-dom';
import React, { useRef, useState, useEffect } from 'react';

import '../styles/home.css';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="home">
      <button 
      onClick={() => {
        navigate('/record');
      }}
      >Start</button>
    </div>
  );
};

export default Home;