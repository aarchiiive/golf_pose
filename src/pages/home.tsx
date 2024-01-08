import { useNavigate } from 'react-router-dom';
import React, { useRef, useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import '../styles/home.css';
import huroticsLogo from '../assets/hurotics_logo.png';
import cesLogo from '../assets/ces_logo.png';

import { visibleVariants } from '../animations/home';

const Home = () => {
  const navigate = useNavigate();
  const typewriterRef = useRef<HTMLDivElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const marqueeContent = Array(240).fill("CES 2024").join(" ");

  const [buttonAnimation, setButtonAnimation] = useState("buttonInitial");
  const [huroticsLogoAnimation, setHuroticsLogoAnimation] = useState("hidden");
  const [cesLogoAnimation, setCesLogoAnimation] = useState("hidden");
  const [isFadeOut, setIsFadeOut] = useState(false);

  useEffect(() => {
    const adjustFontSize = () => {
      if (typewriterRef.current) {
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const fontSize = vw * 0.016; // 4% of viewport width
        typewriterRef.current.style.fontSize = `${fontSize}px`;
      }
    };

    adjustFontSize();
    window.addEventListener('resize', adjustFontSize);

    return () => window.removeEventListener('resize', adjustFontSize);
  }, []);

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
            {/* marquee animation (top) */}
            <motion.div
              className="marquee marquee-top"
              variants={visibleVariants}
              initial="initial"
              exit="exitTop"
            >
              <div className="marquee-content">
                {marqueeContent}
              </div>
            </motion.div>

            {/* marquee animation (bottom) */}
            <motion.div
              className="marquee marquee-bottom"
              variants={visibleVariants}
              initial="initial"
              exit="exitBottom"
            >
              <div className="marquee-content marquee-reverse">
                {marqueeContent}
              </div>
            </motion.div>
              
            {/* Huorotics logo */}
            <motion.div 
              className="huorotics-logo"
              variants={visibleVariants}
              initial="hidden"
              animate={huroticsLogoAnimation}
              exit="exitTop"
              onAnimationComplete={() => { setCesLogoAnimation("animateFadeIn"); }}
            >
              <img src={huroticsLogo} alt="Hurotics Logo" />
            </motion.div>

            {/* CES logo */}
            <motion.div 
              className="ces-logo"
              variants={visibleVariants}
              initial="hidden"
              animate={cesLogoAnimation}
              exit="exitTop"
              onAnimationComplete={() => { setButtonAnimation("buttonFadeIn"); }}
            >
              <text>In</text>
              <img src={cesLogo} alt="CES Logo" />
            </motion.div>

            {/* start button */}
            <motion.button
              className='home-start-button'
              ref={startButtonRef}
              variants={visibleVariants}
              initial="buttonInitial"
              animate={buttonAnimation}
              exit="exitBottom"
              onClick={handleStartButtonClick}
            >
              Start
            </motion.button>
            <motion.div 
              className="marquee marquee-bottom"
              variants={visibleVariants}
              initial="hidden"
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
          rotate: [0, 180, 270, 360],
          borderRadius: ["50%", "20%", "30%", "100%"],
        }}
        transition={{
          ease: [0.22, 0.61, 0.36, 1],
          times: [0, 0.44, 0.8, 1],
          duration: 2.4,
        }}
        onAnimationComplete={() => { setHuroticsLogoAnimation("animateFadeIn"); }}
      />
    </div>
  );
};

export default Home;