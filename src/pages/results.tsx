import React, {
  useRef,
  useState,
  useEffect,
  useContext,
  ReactNode
} from 'react';
import { useNavigate } from 'react-router-dom';

// redux
import { useSelector } from 'react-redux';
import { AppState } from '../store';

// libraries
import { motion } from 'framer-motion';
import { ScrollMenu } from 'react-horizontal-scrolling-menu';
import 'react-horizontal-scrolling-menu/dist/styles.css';

// styles
import '../styles/results.css';
import NextButtonIcon from '../assets/arrow_right.png';
import PrevButtonIcon from '../assets/arrow_left.png';
import { visibleVariants, tableVariants } from '../animations/results';

// interfaces
import { SwingResults, SwingMotion } from '../interfaces/swingResults';

interface SwingResultHeaderProps {
  name: string;
}

const swingPhases: (keyof SwingResults)[] = ['toe_up', 'backswing', 'top', 'downswing', 'impact', 'finish'];

const SwingResultHeader: React.FC<SwingResultHeaderProps> = ({ name }) => {
  return (
    <div className="results-header">
      <h1>{name}</h1>
    </div>
  );
};

const SwingResultsTable: React.FC<{ 
  swingMotion: SwingMotion; 
  className?: string; 
  tableIndex: number 
}> = ({ 
  swingMotion, 
  className, 
  tableIndex }) => {
  // const [prevTableIndex, setPrevTableIndex] = useState(tableIndex);
  // const [animationState, setAnimationState] = useState("hidden");

  // useEffect(() => {
  //   if (tableIndex > prevTableIndex) {
  //     setAnimationState("animateFadeInRight");
  //   } else if (tableIndex < prevTableIndex) {
  //     setAnimationState("animateFadeInLeft");
  //   } else {
  //     setAnimationState("hidden");
  //   }
    
  //   console.log('tableIndex: ', tableIndex);
  //   console.log('prevTableIndex: ', prevTableIndex);

  //   setTimeout(() => {
  //     if (tableIndex > prevTableIndex) {
  //       setAnimationState("animateFadeInRight");
  //     } else if (tableIndex < prevTableIndex) {
  //       setAnimationState("animateFadeInLeft");
  //     }
  //   }, 600);
  //   setPrevTableIndex(tableIndex);
  // }, [tableIndex, prevTableIndex]);

  return (
    <div
      className={`swing-results-table ${className || ''}`}
      // variants={tableVariants}
      // initial="animateFadeInLeft"
      // animate={animationState}
    >
      {swingMotion.messages.map((message, index) => (
        <>
          <div key={index} className="message-score-container">
            <p className="swing-results-table-message">{message}</p>
            <p className="swing-results-table-score">{swingMotion.scores[index]}</p>
          </div>
          {index < swingMotion.messages.length - 1 && <hr />}
        </>
      ))}
    </div>
  );
};

const Results: React.FC = () => {
  const navigate = useNavigate();
  const swingResults = useSelector((state: AppState) => state.swingResults);
  const filteredKeys = Object.keys(swingResults).filter(key => key !== 'frames' && key !== 'video');
  const totalTables = filteredKeys.length;

  const [resultsVideoStyle, setResultsVideoStyle] = useState({});
  const [currentTableIndex, setCurrentTableIndex] = useState(1);
  const [currentSwingPhase, setCurrentSwingPhase] = useState("");
  const [visibleAnimation, setVisibleAnimation] = useState("animateFadeIn");
  
  const handleNext = () => {
    if (currentTableIndex < totalTables - 1) {
      setCurrentTableIndex(currentIndex => currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTableIndex > 0) {
      setCurrentTableIndex(currentIndex => currentIndex - 1);
    }
  };

  const updateStyles = () => {
    const width = window.innerWidth;

    setResultsVideoStyle({
      width: `${width * 0.36}px`,
    });
  };

  useEffect(() => {
    updateStyles();
    window.addEventListener('resize', updateStyles);
    return () => window.removeEventListener('resize', updateStyles);
  }, []);

  useEffect(() => {
    const phase = swingPhases[currentTableIndex - 1];
    if (phase) {
      const phaseWithoutUnderscore = phase.replace(/_/g, ' ');
      const formattedPhase = phaseWithoutUnderscore.charAt(0).toUpperCase() + phaseWithoutUnderscore.slice(1);
      setCurrentSwingPhase(formattedPhase);
    }
  }, [currentTableIndex]);

  return (
    <motion.div
      className="results-container"
      variants={visibleVariants}
      initial="containerFadeIn"
      animate={visibleAnimation}
    >
      <SwingResultHeader name="Swing Results" />
      <video
        className="result"
        style={resultsVideoStyle}
        src={`data:video/mp4;base64,${swingResults.video}`}
        loop
        autoPlay
        playsInline
        controls={false}
      ></video>
      <div className="swing-results-table-title">
        <h2>{currentSwingPhase}</h2>
      </div>
      <div className="scroll-menu-container">
        <button className="scroll-prev-button" onClick={handlePrevious} disabled={currentTableIndex === 1}>
          <img className="next-button-icon" src={PrevButtonIcon} />
        </button>
        <ScrollMenu>
          <SwingResultsTable 
          swingMotion={swingResults[filteredKeys[currentTableIndex]] as SwingMotion} 
          tableIndex={currentTableIndex}/>
        </ScrollMenu>
        <button className="scroll-next-button" onClick={handleNext} disabled={currentTableIndex === totalTables - 1}>
          <img className="next-button-icon" src={NextButtonIcon} />
        </button>
      </div>

    </motion.div>
  );
};

export default Results;