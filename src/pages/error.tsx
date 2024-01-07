import React, {
  useRef,
  useState,
  useEffect,
  useContext,
  useCallback,
  useReducer
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { motion, AnimatePresence, animate } from 'framer-motion';

// styles
import '../styles/error.css';
import { visibleVariants } from '../animations/error';

// image
import guidlineImage from '../assets/guideline.png';


// Loading 컴포넌트에 타입 적용
const Error: React.FC = () => {
  const navigate = useNavigate();
  const [visibleAnimation, setVisibleAnimation] = useState("animateFadeIn");

  const handleRetryButtonClick = () => {
    setVisibleAnimation("animateFadeOut");
    setTimeout(() => {
      setVisibleAnimation("hidden");
      navigate('/record');
    }, 800);
  };

  return (
    <motion.div
      className="error-container"
      variants={visibleVariants}
      initial="containerFadeIn"
      animate={visibleAnimation}
    >
      <div className="error-text">Please record your swing again</div>
      <img className="error-guideline-image" src={guidlineImage} alt="guideline"/>
      <div className="error-guideline-container">
        <div className="error-guideline-text">
          1. Record a frontal view of your swing.<br/>
          2. Ensure the background is not crowded with people.<br/>
          3. Keep the video duration around 10 seconds.
        </div>
      </div>
      <button
        className="error-retry-button"
        onClick={handleRetryButtonClick}
      >
        Record Again
      </button>
    </motion.div>
  );
}

export default Error;