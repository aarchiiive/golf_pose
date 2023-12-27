import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Record from './pages/record';
import Loading from './pages/loading';

ReactDOM.render(
  <Router>
    <Routes>
      <Route path="/record" element={<Record />} />
      <Route path="/loading" element={<Loading />} />
    </Routes>
  </Router>,
  document.getElementById('root')
);

