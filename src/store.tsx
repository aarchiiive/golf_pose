// store.ts
import { createStore, combineReducers } from 'redux';
import { swingResultsReducer } from './reducers/swingResultsReducer';

const rootReducer = combineReducers({
  swingResults: swingResultsReducer,
});

export type AppState = ReturnType<typeof rootReducer>;

export const store = createStore(rootReducer);
