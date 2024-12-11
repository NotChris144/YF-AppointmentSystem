import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import BuyoutCalculator from './components/BuyoutCalculator';
import PriceComparison from './pages/PriceComparison';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="calculator" element={<BuyoutCalculator />} />
          <Route path="/buyout-calculator" element={<BuyoutCalculator />} />
          <Route path="/price-comparison" element={<PriceComparison />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;