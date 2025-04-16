import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import KitchenForm from './Pages/KitchenForm';
import KitchenSummary from './Pages/KitchenSummary';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<KitchenForm />} />
        <Route path="/kitchen-summary" element={<KitchenSummary />} />
      </Routes>
    </Router>
  );
}

export default App;
