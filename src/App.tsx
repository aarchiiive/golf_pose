import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './pages/home';
import Record from './pages/record';
import Loading from './pages/loading';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/record" element={<Record />} />
        <Route path="/loading" element={<Loading />} />
      </Routes>
    </Router>
  );
};

export default App;
