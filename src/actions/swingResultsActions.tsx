// actions/swingResultsActions.ts
import { SET_SWING_RESULTS } from './types';
import { SwingResults } from '../interfaces/swingResults';

export const setSwingResults = (swingResults: SwingResults) => {
  return {
    type: SET_SWING_RESULTS,
    payload: swingResults,
  };
};
