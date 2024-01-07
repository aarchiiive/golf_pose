import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';
import { Bars } from 'react-loader-spinner';

import '../styles/loading.css';
import { visibleVariants } from '../animations/loading';

interface LoadingProps {
  animate: string;
}

// Loading 컴포넌트에 타입 적용
const Loading: React.FC<LoadingProps> = ({ animate }) => {
  const navigate = useNavigate();
  // const [animate, setanimate] = useState("animateFadeIn");
  const [dotCount, setDotCount] = useState(0);

  const loadingText = 'Loading' + '.'.repeat(dotCount);

  useEffect(() => {
    const interval = setInterval(() => { 
      setDotCount(prevDotCount => (prevDotCount + 1) % 6);
    }, 1500 / 5);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log('animate: ', animate);
  }, [animate]);

  return (
    <motion.div
      className="loading-container"
      variants={visibleVariants}
      initial="containerFadeIn"
      animate={animate}
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
      <div className="loading-text">{loadingText}</div>
    </motion.div>
  );
};

export default Loading;