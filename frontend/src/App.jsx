import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import RoomBooking from "./Pages/RoomBooking";
import EventBooking from "./Pages/EventBooking";
import EmployeeManagement from "./Pages/EmployeeManagement";
import KitchenForm from "./Pages/KitchenForm";

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
        <Routes>
          <Route path="/room-booking" element={<RoomBooking />} />
          <Route path="/event-booking" element={<EventBooking />} />
          <Route path="/employee-management" element={<EmployeeManagement />} />
          <Route path="/kitchenForm" element={<KitchenForm />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
