import React, {
  useRef,
  useState,
  useEffect,
  useContext,
  ReactNode
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, animate } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';

import axios from 'axios';

import SwingResultsContext from '../context/swingResultsContext';
import '../styles/results.css';

interface SwingResultHeaderProps {
  name: string;
}

interface SwingActionProps {
  name: string;
  children: ReactNode;
}

interface SwingTableRowProps {
  message: string;
  score: number;
}

const SwingResultHeader: React.FC<SwingResultHeaderProps> = ({ name }) => {
  return (
    <div className="results-header">
      <h1>{name}</h1>
    </div>
  );
};

const SwingResult: React.FC<SwingActionProps> = ({ name, children }) => {
  return (
    <div className="swing-action">
      <SwingResultHeader name={name} />
      <div className="video-container">
        {/* 비디오 컨텐츠 */}
      </div>
      <div className="score-table-container">
        {children}
      </div>
    </div>
  );
};

const SwingTableRow: React.FC<SwingTableRowProps> = ({ message, score }) => {
  return (
    <div className="score-table-row">
      <div className="message">
        {message}
      </div>
      <div className="score">
        {score}
      </div>
    </div>
  );
}

const Results: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [visibleAnimation, setVisibleAnimation] = useState("animateFadeIn");

  useEffect(() => {
    const unlisten = () => {
      window.onpopstate = (e: PopStateEvent) => {
        navigate('/record');
      };
    };

    unlisten();

    return () => {
      window.onpopstate = null;
    };
  }, [navigate]);

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
        <SwingResultHeader name="Toe Up" />
        <div className="video-container">
        </div>
        <div className="score-table-container">
          <div className="score-table">
            <SwingTableRow message="Perfect Swing!" score={94} />
            <SwingTableRow message="Position of your right arm is perfect!" score={96} />
            <SwingTableRow message="Rotation of your upper body is perfect!" score={92} />
          </div>
        </div>
      </>
    </motion.div>
  );

};

export default Results;