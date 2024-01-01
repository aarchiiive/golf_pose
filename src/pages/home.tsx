import { useNavigate } from 'react-router-dom';
import React, { useRef, useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import '../styles/home.css';

const Home = () => {
  const navigate = useNavigate();
  const typewriterRef = useRef<HTMLDivElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const marqueeContent = Array(240).fill("CES 2024").join(" ");

  const [startTypeWriting, setStartTypeWriting] = useState(false);
  const [isFadeOut, setIsFadeOut] = useState(false);

  const fadeOutVariants = {
    initial: {
      y: 0,
      opacity: 1,
    },
    exitTop: {
      y: -100,
      opacity: 0,
      transition: { duration: 0.4, ease: 'easeInOut' }
    },
    exitBottom: {
      y: 100,
      opacity: 0,
      transition: { duration: 0.4, ease: 'easeInOut' }
    }
  };

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

  useEffect(() => {
    console.log('startTypeWriting: ', startTypeWriting);
    if (startTypeWriting && typewriterRef.current && startButtonRef.current) {
      typewriterRef.current.classList.add('typewriter-start');
      startButtonRef.current.classList.add('home-start-button-fade-in');
    }
  }, [startTypeWriting]);

  const handleStartButtonClick = () => {
    setIsFadeOut(true);
    setTimeout(() => {
      navigate('/record');
    }, 800);
  };

  return (
    <div className="home">
      <AnimatePresence>
        {!isFadeOut && (
          <>
            <motion.div
              className="marquee marquee-top"
              variants={fadeOutVariants}
              initial="initial"
              exit="exitTop"
            >
              <div className="marquee-content">
                {marqueeContent}
              </div>
            </motion.div>
            <motion.div
              className="marquee marquee-bottom"
              variants={fadeOutVariants}
              initial="initial"
              exit="exitBottom"
            >
              <div className="marquee-content marquee-reverse">
                {marqueeContent}
              </div>
            </motion.div>
            <motion.div 
              className="typewriter"
              ref={typewriterRef}
              variants={fadeOutVariants}
              initial="initial"
              exit="exitTop"
            >
              <h1>H-Swing Project Arrived in CES 2024</h1>
            </motion.div>
            <motion.button
              className='home-start-button'
              ref={startButtonRef}
              variants={fadeOutVariants}
              initial="initial"
              exit="exitBottom"
              onClick={handleStartButtonClick}
            >
              Start
            </motion.button>
            <motion.div 
              className="marquee marquee-bottom"
              variants={fadeOutVariants}
              initial="initial"
              exit="exitBottom"
            >
              <div className="marquee-content marquee-reverse">
                {marqueeContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div
        className="box"
        animate={{
          scale: [1, 0.5, 0.4, 0],
          rotate: [0, 180, 270, 0],
          borderRadius: ["50%", "20%", "30%", "100%"],
        }}
        transition={{
          ease: "easeInOut",
          times: [0, 0.5, 0.75, 1],
          duration: 2,
        }}
        onAnimationComplete={() => { setStartTypeWriting(true) }}
      />

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