import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';
import { Bars } from 'react-loader-spinner';

import '../styles/loading.css';

const Loading = () => {
  const [visibleAnimation, setVisibleAnimation] = useState("animateFadeIn");
  // useEffect(() => {
  //   const fetchData = async () => {
  //     await new Promise((resolve) => setTimeout(resolve, 3000)); // 3초간 로딩을 시뮬레이션
  //     // 로딩이 완료되면 다른 페이지로 이동하도록 구현할 수 있습니다.
  //     window.location.href = '/other-page'; // 다른 페이지로 이동
  //   };

  //   fetchData();
  // }, []);

  useEffect(() => {
    // setVisibleAnimation("animateFadeOut");
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