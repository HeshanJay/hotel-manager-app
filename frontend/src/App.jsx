import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import RoomBooking from "./Pages/RoomBooking";
import EventBooking from "./Pages/EventBooking";
import EmployeeManagement from "./Pages/EmployeeManagement";
import KitchenForm from "./Pages/KitchenForm";
import Dashboard from "./Pages/Dashboard";
import Sidebar from "./Components/Sidebar";
import Navbar from "./Components/Navbar";

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <div className="relative min-h-screen bg-gray-50">
                <Sidebar />
                <Navbar />
                <Dashboard />
              </div>
            }
          />
        </Routes>
        <Routes>
          <Route
            path="/room-booking"
            element={
              <div className="relative min-h-screen bg-gray-50">
                <Sidebar />
                <Navbar />
                <RoomBooking />
              </div>
            }
          />
          <Route
            path="/event-booking"
            element={
              <div className="relative min-h-screen bg-gray-50">
                <Sidebar />
                <Navbar />
                <EventBooking />
              </div>
            }
          />
          <Route
            path="/employee-management"
            element={
              <div className="relative min-h-screen bg-gray-50">
                <Sidebar />
                <Navbar />
                <EmployeeManagement />
              </div>
            }
          />
          <Route
            path="/kitchenForm"
            element={
              <div className="relative min-h-screen bg-gray-50">
                <Sidebar />
                <Navbar />
                <KitchenForm />
              </div>
            }
          />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
