import React from 'react';

export interface SwingMotion {
    messages: string[];
    scores: number[];
}

export interface SwingResults {
    toe_up: SwingMotion;
    backswing: SwingMotion;
    top: SwingMotion;
    downswing: SwingMotion;
    impact: SwingMotion;
    finish: SwingMotion;
    frames: number[];
    video: Blob | null;
}

const SwingResultsContext = React.createContext<{
    results: SwingResults;
    setResults: React.Dispatch<React.SetStateAction<SwingResults>>;
} | null>(null);

export default SwingResultsContext;