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
import { ScrollMenu, VisibilityContext } from 'react-horizontal-scrolling-menu';
import 'react-horizontal-scrolling-menu/dist/styles.css';

// styles
import '../styles/results.css';
import NextButtonIcon from '../assets/arrow_right.png';
import PrevButtonIcon from '../assets/arrow_left.png';
import { visibleVariants } from '../animations/results';

// interfaces
import { SwingResults, SwingMotion } from '../interfaces/swingResults';

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

const swingPhases: (keyof SwingResults)[] = ['toe_up', 'backswing', 'top', 'downswing', 'impact', 'finish'];

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
      {/* <SwingResultHeader name={name} /> */}
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

const SwingResultsTable: React.FC<{ motion: SwingMotion; className?: string }> = ({ motion, className }) => {
  return (
    <div className={`swing-results-table ${className || ''}`}>
      {motion.messages.map((message, index) => (
        <>
        <div key={index} className="message-score-container">
          <p className="swing-results-table-message">{message}</p>
          <p className="swing-results-table-score">{motion.scores[index]}</p>
          
        </div>
        {index < motion.messages.length - 1 && <hr />}
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
      width: `${width * 0.9}px`,
    });
  };

  useEffect(() => {
    updateStyles();
    window.addEventListener('resize', updateStyles);
    return () => window.removeEventListener('resize', updateStyles);
  }, []);

  return (
    <div className="results-container">
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
      <div className="scroll-menu-container">
        <button className="scroll-prev-button" onClick={handlePrevious} disabled={currentTableIndex === 1}>
          <img className="next-button-icon" src={PrevButtonIcon}/>
        </button>
        <ScrollMenu>
          <SwingResultsTable motion={swingResults[filteredKeys[currentTableIndex]] as SwingMotion} />
        </ScrollMenu>

        <button className="scroll-next-button" onClick={handleNext} disabled={currentTableIndex === totalTables - 1}>
          <img className="next-button-icon" src={NextButtonIcon}/>
        </button>
      </div>

    </div>
  );
};

export default Results;