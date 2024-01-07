import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

import Home from './pages/home';
import Record from './pages/record';
import Loading from './pages/loading';
import Error from './pages/error';
import Results from './pages/results';

ReactDOM.render(
  <Provider store={store}>
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path={`${process.env.PUBLIC_URL}/`} element={<Home />} />
        <Route path={`${process.env.PUBLIC_URL}/record`} element={<Record />} />
        <Route path={`${process.env.PUBLIC_URL}/results`} element={<Results />} />
        <Route path={`${process.env.PUBLIC_URL}/error`} element={<Error />} />
      </Routes>
    </Router>
  </Provider>,
  document.getElementById('root')
);

