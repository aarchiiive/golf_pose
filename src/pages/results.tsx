import React, {
  useRef,
  useState,
  useEffect,
  useContext,
  Component
} from 'react';
import { useNavigate } from 'react-router-dom';

// redux
import { useSelector } from 'react-redux';
import { AppState } from '../store';

// libraries
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import { ScrollMenu } from 'react-horizontal-scrolling-menu';
import 'react-horizontal-scrolling-menu/dist/styles.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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

interface ResultsSliderProps {
  onSlideChange: (index: number) => void;
}

const swingPhases: (keyof SwingResults)[] = ['toe_up', 'backswing', 'top', 'downswing', 'impact', 'finish'];

const SwingResultHeader: React.FC<SwingResultHeaderProps> = ({ name }) => {
  return (
    <div className="results-header">
      <h1>{name}</h1>
    </div>
  );
};

const ResultsSlider: React.FC<ResultsSliderProps> = ({ onSlideChange }) => {
  const swingResults = useSelector((state: AppState) => state.swingResults);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    arrows: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    afterChange: onSlideChange,
  };
  
  const renderTable = (swingMotion: SwingMotion) => (
    <table className="results-table">
      <tbody>
        {swingMotion.messages.map((message, index) => (
          <tr key={index}>
            <td className="message-column">{message}</td>
            <td className="score-column">{swingMotion.scores[index]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="results-slider">
      <h2>Swipe To Slide</h2>
      <Slider {...settings}>
        {Object.keys(swingResults).map(key => (
          swingResults[key].video && (
            <div className="results-slider-item" key={key}>
              <video
                className="result"
                src={`data:video/mp4;base64,${swingResults[key].video}`}
                loop
                autoPlay
                playsInline
                controls={false}
              ></video>
              {renderTable(swingResults[key])}
            </div>
          )
        ))}
      </Slider>
    </div>
  );
}

const Results: React.FC = () => {
  const navigate = useNavigate();
  
  const [currentTableIndex, setCurrentTableIndex] = useState(0);
  const [currentSwingPhase, setCurrentSwingPhase] = useState("");
  const [visibleAnimation, setVisibleAnimation] = useState("animateFadeIn");

  useEffect(() => {
    const phase = swingPhases[currentTableIndex];
    if (phase) {
      const phaseWithoutUnderscore = phase.replace(/_/g, ' ');
      const formattedPhase = phaseWithoutUnderscore.charAt(0).toUpperCase() + phaseWithoutUnderscore.slice(1);
      setCurrentSwingPhase(formattedPhase);
    }
  }, [currentTableIndex]);

  const handleSlideChange = (current: number) => {
    setCurrentTableIndex(current);
    const phase = swingPhases[current];
    if (phase) {
      const phaseWithoutUnderscore = phase.replace(/_/g, ' ');
      const formattedPhase = phaseWithoutUnderscore.charAt(0).toUpperCase() + phaseWithoutUnderscore.slice(1);
      setCurrentSwingPhase(formattedPhase);
    }
  }

  return (
    <motion.div
      className="results-container"
      variants={visibleVariants}
      initial="containerFadeIn"
      animate={visibleAnimation}
    >
      <SwingResultHeader name={`Swing Results - ${currentSwingPhase}`} />
      <ResultsSlider onSlideChange={handleSlideChange}/>

      {(currentTableIndex === 6) && (
        <button
          className='try-again-button'
          onClick={() => navigate('/record')}
        >
          Try Again
        </button>
      )}

    </motion.div>
  );
};

export default Results;