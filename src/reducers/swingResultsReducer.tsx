// reducers/swingResultsReducer.ts
import { SET_SWING_RESULTS } from '../actions/types';
import { SwingMotion, SwingResults } from '../interfaces/swingResults';

const initialSwingMotion: SwingMotion = { messages: [], scores: [], video: null };

const initialState: SwingResults = {
  toe_up: initialSwingMotion,
  backswing: initialSwingMotion,
  top: initialSwingMotion,
  downswing: initialSwingMotion,
  impact: initialSwingMotion,
  finish: initialSwingMotion,
};


export const swingResultsReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_SWING_RESULTS:
      return action.payload;
    default:
      return state;
  }
};
