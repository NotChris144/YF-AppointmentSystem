import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SpeedTest from './pages/SpeedTest';
import BuyoutCalculator from './components/BuyoutCalculator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="speed-test" element={<SpeedTest />} />
          <Route path="calculator" element={<BuyoutCalculator />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;