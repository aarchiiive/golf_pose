import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './pages/home';
import Record from './pages/record';
import Loading from './pages/loading';

const App = () => {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path={`${process.env.PUBLIC_URL}/`} element={<Home />} />
        <Route path={`${process.env.PUBLIC_URL}/record`} element={<Record />} />
        <Route path={`${process.env.PUBLIC_URL}/loading`} element={<Loading />} />
      </Routes>
    </Router>
  );
};

export default App;
