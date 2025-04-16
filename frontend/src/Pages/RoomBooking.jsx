import React, { useState } from "react";

const RoomBooking = () => {
  // Define room prices per night
  const roomPrices = {
    standard: 100,
    deluxe: 150,
    suite: 250,
  };

  // Define service prices
  const servicePrices = {
    breakfast: 10, // per person per night
    parking: 10, // per room per night
    airportTransfer: 50, // per booking
  };

  // State for form data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    roomType: "",
    numberOfRooms: 1,
    nationality: "",
    agreeTerms: false,
    breakfast: false,
    parking: false,
    airportTransfer: false,
  });

  // State for popup and error
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [bookingTotalCost, setBookingTotalCost] = useState(0);
  const [error, setError] = useState("");

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;
    if (["adults", "children", "numberOfRooms"].includes(name)) {
      val = parseInt(value, 10) || 0;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error
    try {
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setBookingTotalCost(data.totalCost);
        setIsPopupOpen(true);
        console.log("Booking saved:", data);
      } else {
        setError(data.message || "Failed to save booking");
      }
    } catch (error) {
      setError("Network error, please try again");
      console.error("Error:", error);
    }
  };

  // Function to calculate number of nights
  const calculateNumberOfNights = (checkIn, checkOut) => {
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      if (checkOutDate > checkInDate) {
        const timeDiff = checkOutDate - checkInDate;
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
      }
    }
    return 0;
  };

  // Function to calculate total cost for display
  const calculateTotalCost = (data) => {
    const nights = calculateNumberOfNights(data.checkIn, data.checkOut);
    let total = 0;

    if (data.roomType && nights > 0 && data.numberOfRooms > 0) {
      total += data.numberOfRooms * nights * roomPrices[data.roomType];
    }

    if (data.breakfast) {
      const totalPeople = parseInt(data.adults) + parseInt(data.children);
      total += nights * totalPeople * servicePrices.breakfast;
    }

    if (data.parking) {
      total += data.numberOfRooms * nights * servicePrices.parking;
    }

    if (data.airportTransfer) {
      total += servicePrices.airportTransfer;
    }

    return total;
  };

  // Calculate total cost for display
  const totalCost = calculateTotalCost(formData);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Book Your Room</h1>
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      <div className="space-y-6">
        {/* Personal Information */}
        <div>
          <h2 className="text-xl font-bold mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div className="mb-4">
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm placeholder-gray-400"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm placeholder-gray-400"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div>
          <h2 className="text-xl font-bold mb-4">Booking Details</h2>
          <div className="space-y-4">
            <div className="mb-4">
              <label
                htmlFor="checkIn"
                className="block text-sm font-medium text-gray-700"
              >
                Check-in Date
              </label>
              <input
                type="date"
                id="checkIn"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="checkOut"
                className="block text-sm font-medium text-gray-700"
              >
                Check-out Date
              </label>
              <input
                type="date"
                id="checkOut"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="adults"
                className="block text-sm font-medium text-gray-700"
              >
                Number of Adults
              </label>
              <input
                type="number"
                id="adults"
                name="adults"
                value={formData.adults}
                onChange={handleChange}
                min="1"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="children"
                className="block text-sm font-medium text-gray-700"
              >
                Number of Children
              </label>
              <input
                type="number"
                id="children"
                name="children"
                value={formData.children}
                onChange={handleChange}
                min="0"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="roomType"
                className="block text-sm font-medium text-gray-700"
              >
                Room Type
              </label>
              <select
                id="roomType"
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select Room Type</option>
                <option value="standard">Standard Room</option>
                <option value="deluxe">Deluxe Room</option>
                <option value="suite">Suite</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                htmlFor="numberOfRooms"
                className="block text-sm font-medium text-gray-700"
              >
                Number of Rooms
              </label>
              <select
                id="numberOfRooms"
                name="numberOfRooms"
                value={formData.numberOfRooms}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {[1, 2, 3, 4].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h2 className="text-xl font-bold mb-4">Additional Information</h2>
          <div className="space-y-4">
            <div className="mb-4">
              <label
                htmlFor="nationality"
                className="block text-sm font-medium text-gray-700"
              >
                Nationality
              </label>
              <input
                type="text"
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm placeholder-gray-400"
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                  className="form-checkbox h-5 w-5 text-indigo-600"
                />
                <span className="ml-2 text-sm text-gray-700">
                  I agree to the terms and conditions
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Services */}
        <div>
          <h2 className="text-xl font-bold mb-4">Services</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Additional Services
            </label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="breakfast"
                  checked={formData.breakfast}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-indigo-600"
                />
                <span className="ml-2">
                  Breakfast ($10 per person per night)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="parking"
                  checked={formData.parking}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-indigo-600"
                />
                <span className="ml-2">Parking ($10 per room per night)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="airportTransfer"
                  checked={formData.airportTransfer}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-indigo-600"
                />
                <span className="ml-2">Airport Transfer ($50 per booking)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mt-6"
      >
        Book Now
      </button>
      {totalCost > 0 && (
        <div className="mt-4 text-lg font-medium text-gray-900">
          Total Cost: ${totalCost}
        </div>
      )}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <p className="text-green-600 text-xl mb-4">Booking Successful!</p>
            <h2 className="text-2xl font-bold mb-4">Booking Summary</h2>
            <p>
              <strong>Room Type:</strong> {formData.roomType}
            </p>
            <p>
              <strong>Number of Rooms:</strong> {formData.numberOfRooms}
            </p>
            <p>
              <strong>Check-in Date:</strong> {formData.checkIn}
            </p>
            <p>
              <strong>Check-out Date:</strong> {formData.checkOut}
            </p>
            <p>
              <strong>Number of Adults:</strong> {formData.adults}
            </p>
            <p>
              <strong>Number of Children:</strong> {formData.children}
            </p>
            <p>
              <strong>Services:</strong>
            </p>
            <ul className="list-disc pl-5 mb-4">
              {formData.breakfast && <li>Breakfast</li>}
              {formData.parking && <li>Parking</li>}
              {formData.airportTransfer && <li>Airport Transfer</li>}
            </ul>
            <p>
              <strong>Total Cost:</strong> ${bookingTotalCost}
            </p>
            <button
              onClick={() => setIsPopupOpen(false)}
              className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomBooking;
