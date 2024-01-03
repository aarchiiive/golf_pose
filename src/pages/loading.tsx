import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';
import { Bars } from 'react-loader-spinner';

import '../styles/loading.css';

const Loading = () => {
  const navigate = useNavigate();
  const [visibleAnimation, setVisibleAnimation] = useState("animateFadeIn");

  useEffect(() => {
    setTimeout(() => {
      setVisibleAnimation("animateFadeOut");
    }, 2000);
    navigate('/results');
  }, []);

  const visibleVariants = {
    containerFadeIn: {
      x: '100vw',
      opacity: 0,
    },
    containerFadeOut: {
      x: '0',
      opacity: 1,
    },

    animateFadeIn: {
      x: '0',
      opacity: 1,
      transition: { 
        duration: 0.8, 
        ease: [0.22, 0.61, 0.36, 1]
      }
    },
    animateFadeOut: {
      x: '-100vw',
      opacity: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.22, 0.61, 0.36, 1]
      }
    },
  };

  return (
    <motion.div
      className="loading-container"
      variants={visibleVariants}
      initial="containerFadeIn"
      animate={visibleAnimation}
    >
      {/* <div className="loader"></div> */}
      {/* <RingLoader color="#b1b1b1" loading={true} size={100} /> */}
      {/* <BarLoader color="#b1b1b1" loading={true}/> */}
      <Bars
        height="80"
        width="80"
        color="#b1b1b1"
        ariaLabel="bars-loading"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
      />
      <div className="loading-text">Loading...</div>
    </motion.div>
  );
};

export default Loading;