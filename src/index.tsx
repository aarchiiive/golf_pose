import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './pages/home';
import Record from './pages/record';
import Loading from './pages/loading';

ReactDOM.render(
  <Router basename={process.env.PUBLIC_URL}>
    <Routes>
      <Route path={`${process.env.PUBLIC_URL}/`} element={<Home />} />
      <Route path={`${process.env.PUBLIC_URL}/record`} element={<Record />} />
      <Route path={`${process.env.PUBLIC_URL}/loading`} element={<Loading />} />
    </Routes>
  </Router>,
  document.getElementById('root')
);

