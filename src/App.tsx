import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LeadForm from './pages/LeadForm';
import RevisitForm from './pages/RevisitForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="lead" element={<LeadForm />} />
          <Route path="revisit" element={<RevisitForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;