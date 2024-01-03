import React, {
  useRef,
  useState,
  useEffect,
  useContext,
  ReactNode
} from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, animate } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';

import axios from 'axios';

import SwingResultsContext from '../context/swingResultsContext';
import '../styles/results.css';

interface SwingActionProps {
  name: string;
  children: ReactNode;
}

const SwingResult: React.FC<SwingActionProps> = ({ name, children }) => {
  return (
    <div className="swing-action">
      <div className="results-header">
        <h1>{name}</h1>
      </div>
      <div className="video-container">
        {/* 비디오 컨텐츠 */}
      </div>
      <div className="score-table-container">
        {children}
      </div>
    </div>
  );
};

const Results: React.FC = () => {
  const [visibleAnimation, setVisibleAnimation] = useState("animateFadeIn");

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
      className="results-container"
      variants={visibleVariants}
      initial="containerFadeIn"
      animate={visibleAnimation}
    >
      <>
        <div className="results-header">
          <h1>Toe Up</h1>
        </div>
        <div className="video-container">
        </div>
        <div className="score-table-container">
          <div className="score-table">
            <div className="score-table-row">
              <div className="message">
                Perfect Swing!
              </div>
              <div className="score">
                94
              </div>
            </div>
            <div className="score-table-row">
              <div className="message">
                Position of your right arm is perfect!
              </div>
              <div className="score">
                96
              </div>
            </div>
            <div className="score-table-row">
              <div className="message">
                Rotation of your upper body is perfect!
              </div>
              <div className="score">
                92
              </div>
            </div>
          </div>
        </div>
      </>
    </motion.div>
  );

};

export default Results;