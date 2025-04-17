import React, { useState } from "react";

const RoomBooking = () => {
  // Define room prices per night
  const roomPrices = {
    standard: 100,
    deluxe: 150,
    suite: 250,
  };

  // Define service prices (adult prices)
  const servicePrices = {
    breakfast: 10, // per person per night
    airportTransfer: 50, // per booking
    golf: 30, // per person per day
    spa: 40, // per person per day
  };

  // Generate a random booking ID
  const generateBookingId = () => {
    return "BK-" + Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  // State for form data
  const [formData, setFormData] = useState({
    bookingId: generateBookingId(),
    fullName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    address3: "",
    state: "",
    zip: "",
    country: "",
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    roomType: "",
    numberOfRooms: 1,
    agreeTerms: false,
    breakfast: false,
    airportTransfer: false,
    golf: false,
    spa: false,
  });

  // State for errors
  const [errors, setErrors] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [bookingTotalCost, setBookingTotalCost] = useState(0);
  const [error, setError] = useState(""); // For server errors
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate function
  const validate = (data) => {
    const errors = {};
    if (!data.fullName.trim()) errors.fullName = "Full Name is required";
    else if (!/^[A-Za-z ]+$/.test(data.fullName))
      errors.fullName = "Only letters and spaces allowed";
    if (!data.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(data.email))
      errors.email = "Email is invalid";
    if (!data.phone) errors.phone = "Phone number is required";
    else if (!/^\d{10,15}$/.test(data.phone))
      errors.phone = "Phone number must be 10-15 digits";
    if (!data.address1.trim()) errors.address1 = "Address Line 1 is required";
    if (!data.state.trim()) errors.state = "State/Province is required";
    if (!data.zip.trim()) errors.zip = "Zip/Postal Code is required";
    if (!data.country.trim()) errors.country = "Country is required";
    if (!data.checkIn) errors.checkIn = "Check-in date is required";
    else {
      const checkInDate = new Date(data.checkIn);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (checkInDate < today)
        errors.checkIn = "Check-in date cannot be in the past";
    }
    if (!data.checkOut) errors.checkOut = "Check-out date is required";
    else if (data.checkIn && new Date(data.checkIn) >= new Date(data.checkOut))
      errors.checkOut = "Check-out must be after check-in";
    if (data.adults < 1) errors.adults = "At least one adult is required";
    if (data.children < 0)
      errors.children = "Number of children cannot be negative";
    if (!data.roomType) errors.roomType = "Room type is required";
    if (data.numberOfRooms < 1)
      errors.numberOfRooms = "At least one room is required";
    if (!data.agreeTerms)
      errors.agreeTerms = "You must agree to the terms and conditions";
    return errors;
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setError("");
      setIsSubmitting(true);

      try {
        // Calculate total cost
        const total = calculateTotalCost(formData);

        // Prepare data for MongoDB
        const bookingData = {
          bookingId: formData.bookingId,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address1: formData.address1,
          address2: formData.address2,
          address3: formData.address3,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          adults: formData.adults,
          children: formData.children,
          roomType: formData.roomType,
          numberOfRooms: formData.numberOfRooms,
          agreeTerms: formData.agreeTerms,
          breakfast: formData.breakfast,
          airportTransfer: formData.airportTransfer,
          golf: formData.golf,
          spa: formData.spa,
          totalCost: total,
        };

        const response = await fetch("http://localhost:5000/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        });

        const data = await response.json();

        if (response.ok) {
          setBookingTotalCost(total);
          setIsPopupOpen(true);
        } else {
          setError(data.message || "Failed to save booking");
        }
      } catch (error) {
        setError("Network error, please try again");
        console.error("Error:", error);
      } finally {
        setIsSubmitting(false);
      }
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

    // Room cost
    if (data.roomType && nights > 0 && data.numberOfRooms > 0) {
      total += data.numberOfRooms * nights * roomPrices[data.roomType];
    }

    // Breakfast (only for adults)
    if (data.breakfast) {
      const adultCost =
        parseInt(data.adults) * nights * servicePrices.breakfast;
      total += adultCost;
    }

    // Airport Transfer
    if (data.airportTransfer) {
      total += servicePrices.airportTransfer;
    }

    // Golf (only for adults)
    if (data.golf) {
      const adultCost = parseInt(data.adults) * nights * servicePrices.golf;
      total += adultCost;
    }

    // Spa (only for adults)
    if (data.spa) {
      const adultCost = parseInt(data.adults) * nights * servicePrices.spa;
      total += adultCost;
    }

    return total;
  };

  // Calculate total cost for display
  const totalCost = calculateTotalCost(formData);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-indigo-800 mb-8 text-center">
        Book Your Room
      </h1>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-500 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}
      <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
        {/* Personal Information */}
        <div>
          <h2 className="text-xl font-bold mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="bookingId"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Booking ID
              </label>
              <input
                type="text"
                id="bookingId"
                name="bookingId"
                value={formData.bookingId}
                readOnly
                className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200 bg-gray-100"
              />
            </div>
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.fullName}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.phone}
                </p>
              )}
            </div>
            <h3 className="text-lg font-medium mb-2">Address</h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="address1"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Address Line 1
                </label>
                <input
                  type="text"
                  id="address1"
                  name="address1"
                  value={formData.address1}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
                />
                {errors.address1 && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.address1}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="address2"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Address Line 2
                </label>
                <input
                  type="text"
                  id="address2"
                  name="address2"
                  value={formData.address2}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
                />
              </div>
              <div>
                <label
                  htmlFor="address3"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Address Line 3
                </label>
                <input
                  type="text"
                  id="address3"
                  name="address3"
                  value={formData.address3}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
                />
              </div>
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  State / Province
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.state}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="zip"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Zip / Postal Code
                </label>
                <input
                  type="text"
                  id="zip"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
                />
                {errors.zip && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.zip}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
                />
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.country}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div>
          <h2 className="text-xl font-bold mb-4">Booking Details</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="checkIn"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Check-in Date
              </label>
              <input
                type="date"
                id="checkIn"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
                className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
              />
              {errors.checkIn && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.checkIn}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="checkOut"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Check-out Date
              </label>
              <input
                type="date"
                id="checkOut"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
                className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
              />
              {errors.checkOut && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.checkOut}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="adults"
                className="block text-sm font-semibold text-gray-700 mb-2"
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
                className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
              />
              {errors.adults && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.adults}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="children"
                className="block text-sm font-semibold text-gray-700 mb-2"
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
                className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
              />
              {errors.children && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.children}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="roomType"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Room Type
              </label>
              <select
                id="roomType"
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
                className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
              >
                <option value="">Select Room Type</option>
                <option value="standard">Standard Room</option>
                <option value="deluxe">Deluxe Room</option>
                <option value="suite">Suite</option>
              </select>
              {errors.roomType && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.roomType}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="numberOfRooms"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Number of Rooms
              </label>
              <select
                id="numberOfRooms"
                name="numberOfRooms"
                value={formData.numberOfRooms}
                onChange={handleChange}
                className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
              >
                {[1, 2, 3, 4].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              {errors.numberOfRooms && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.numberOfRooms}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Services */}
        <div>
          <h2 className="text-xl font-bold mb-4">Services</h2>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Services
            </label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="breakfast"
                  checked={formData.breakfast}
                  onChange={handleChange}
                  className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2">
                  Breakfast (${servicePrices.breakfast} adult per night)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="airportTransfer"
                  checked={formData.airportTransfer}
                  onChange={handleChange}
                  className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2">
                  Airport Transfer (${servicePrices.airportTransfer} per
                  booking)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="golf"
                  checked={formData.golf}
                  onChange={handleChange}
                  className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2">
                  Golf (${servicePrices.golf} adult per day)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="spa"
                  checked={formData.spa}
                  onChange={handleChange}
                  className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2">
                  Spa (${servicePrices.spa} adult per day)
                </span>
              </label>
            </div>
          </div>
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              I agree to the terms and conditions
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.agreeTerms}
            </p>
          )}
        </div>
        {totalCost > 0 && (
          <div className="mt-6 text-center">
            <p className="text-lg font-medium text-gray-800">
              Total Cost: ${totalCost.toFixed(2)}
            </p>
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Processing..." : "Book Now"}
        </button>
      </div>
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <p className="text-green-600 text-xl mb-4">Booking Successful!</p>
            <h2 className="text-2xl font-bold mb-4">Booking Summary</h2>
            <p>
              <strong>Booking ID:</strong> {formData.bookingId}
            </p>
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
              {formData.airportTransfer && <li>Airport Transfer</li>}
              {formData.golf && <li>Golf</li>}
              {formData.spa && <li>Spa</li>}
            </ul>
            <p>
              <strong>Total Cost:</strong> ${bookingTotalCost.toFixed(2)}
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