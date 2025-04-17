import React, { useState } from "react";

const EventBooking = () => {
  const [formData, setFormData] = useState({
    eventName: "",
    eventType: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    numberOfGuests: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    specialRequests: "",
    agreeTerms: false,
  });

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [bookingTotalCost, setBookingTotalCost] = useState(0);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;
    if (name === "numberOfGuests") {
      val = parseInt(value, 10) || "";
    }
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const validateForm = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(formData.eventDate);

    if (!formData.eventName) return "Event name is required";
    if (!formData.eventType) return "Event type is required";
    if (!formData.eventDate) return "Event date is required";
    if (eventDate < today) return "Event date must be in the future";
    if (!formData.startTime) return "Start time is required";
    if (!formData.endTime) return "End time is required";
    if (formData.startTime >= formData.endTime) return "End time must be after start time";
    if (!formData.numberOfGuests || formData.numberOfGuests < 1) return "Number of guests must be at least 1";
    if (formData.numberOfGuests > 1000) return "Number of guests cannot exceed 1000";
    if (!formData.contactName) return "Contact name is required";
    if (!formData.contactEmail || !/\S+@\S+\.\S+/.test(formData.contactEmail)) return "Valid email is required";
    if (!formData.contactPhone || !/^\d{10}$/.test(formData.contactPhone)) return "Phone number must be 10 digits";
    if (!formData.agreeTerms) return "You must agree to the terms and conditions";
    return "";
  };

  const calculateTotalCost = () => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`1970-01-01T${formData.startTime}:00`);
      const end = new Date(`1970-01-01T${formData.endTime}:00`);
      const hourDiff = (end - start) / (1000 * 3600);
      return hourDiff > 0 ? hourDiff * 50 : 0;
    }
    return 0;
  };

  const handleSubmit = async () => {
    setError("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/event-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setBookingTotalCost(data.totalCost);
        setIsPopupOpen(true);
      } else {
        setError(data.message || "Failed to save event booking");
      }
    } catch (error) {
      setError("Network error, please try again");
      console.error("Error:", error);
    }
  };

  const totalCost = calculateTotalCost();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-indigo-800 mb-8 text-center">Book Your Event</h1>
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg shadow-md">{error}</div>
      )}
      <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Event Name</label>
          <input
            type="text"
            name="eventName"
            value={formData.eventName}
            onChange={handleChange}
            className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
            placeholder="e.g., Annual Gala"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type</label>
          <select
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
          >
            <option value="">Select Event Type</option>
            <option value="wedding">Wedding</option>
            <option value="conference">Conference</option>
            <option value="party">Party</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Event Date</label>
          <input
            type="date"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Guests</label>
          <input
            type="number"
            name="numberOfGuests"
            value={formData.numberOfGuests}
            onChange={handleChange}
            min="1"
            max="1000"
            className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
            placeholder="e.g., 50"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Name</label>
          <input
            type="text"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
            placeholder="e.g., Lakshi"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Email</label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
            placeholder="e.g., lakshi.doe@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Phone</label>
          <input
            type="tel"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
            placeholder="e.g., 0701244567"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Special Requests</label>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
            rows="4"
            placeholder="e.g., Catering required"
          ></textarea>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleChange}
            className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label className="ml-2 text-sm text-gray-700">I agree to the terms and conditions</label>
        </div>
        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300"
        >
          Book Event
        </button>
      </div>
      {totalCost > 0 && (
        <div className="mt-6 text-center">
          <p className="text-lg font-medium text-gray-800">Estimated Total Cost: ${totalCost}</p>
        </div>
      )}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
            <p className="text-green-600 text-2xl font-semibold mb-6 text-center">Event Booking Successful!</p>
            <h2 className="text-2xl font-bold text-indigo-800 mb-4">Booking Summary</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Event Name:</strong> {formData.eventName}</p>
              <p><strong>Event Type:</strong> {formData.eventType}</p>
              <p><strong>Date:</strong> {formData.eventDate}</p>
              <p><strong>Time:</strong> {formData.startTime} - {formData.endTime}</p>
              <p><strong>Guests:</strong> {formData.numberOfGuests}</p>
              <p><strong>Contact:</strong> {formData.contactName}</p>
              <p><strong>Email:</strong> {formData.contactEmail}</p>
              <p><strong>Phone:</strong> {formData.contactPhone}</p>
              {formData.specialRequests && <p><strong>Special Requests:</strong> {formData.specialRequests}</p>}
              <p><strong>Total Cost:</strong> RS{bookingTotalCost}</p>
            </div>
            <button
              onClick={() => setIsPopupOpen(false)}
              className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventBooking;