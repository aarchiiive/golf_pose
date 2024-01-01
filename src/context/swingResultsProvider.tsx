// src/contexts/ResultsProvider.js
import React, { useState, ReactNode } from 'react';
import ResultsContext from './swingResultsContext';

import { SwingResults } from './swingResultsContext';

interface SwingResultsProviderProps {
  children: ReactNode;
}

const SwingResultsProvider: React.FC<SwingResultsProviderProps> = ({ children }) => {
  const [results, setResults] = useState<SwingResults>({
    toe_up: { "messages": ["Nice Swing!", "Pretty Good"], "scores": [93, 75] },
    backswing: { "messages": ["Nice Swing!", "Pretty Good"], "scores": [93, 75] },
    top: { "messages": ["Nice Swing!", "Pretty Good"], "scores": [93, 75] },
    downswing: { "messages": ["Nice Swing!", "Pretty Good"], "scores": [93, 75] },
    impact: { "messages": ["Nice Swing!", "Pretty Good"], "scores": [93, 75] },
    finish: { "messages": ["Nice Swing!", "Pretty Good"], "scores": [93, 75] },
    frames: [0, 13, 25, 43],
    video: null // This will be updated with the binary video data
  });

  return (
    <ResultsContext.Provider value={{ results, setResults }}>
      {children}
    </ResultsContext.Provider>
  );
};

export default SwingResultsProvider;
