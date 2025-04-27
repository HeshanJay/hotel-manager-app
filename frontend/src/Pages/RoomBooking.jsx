import React, { useState, useEffect } from "react";

const RoomBooking = () => {
  // Define room prices per night
  const roomPrices = {
    standard: 30000, // LKR
    deluxe: 45000, // LKR
    suite: 75000, // LKR
  };

  // Define service prices (adult prices)
  const servicePrices = {
    breakfast: 3000, // per person per night (LKR)
    airportTransfer: 15000, // per booking (LKR)
    golf: 9000, // per person per day (LKR)
    spa: 12000, // per person per day (LKR)
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

  useEffect(() => {
    if (isPopupOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isPopupOpen]);

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
    <div className="ml-64">
      {/* Section 1: Introduction and Personal Information */}
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen mt-15">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-blue-800 mb-2 px-4 py-2">
            <span className="font-extrabold">Book Your Room</span>
          </h1>
          {/* <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Experience unparalleled comfort with our premium accommodations
                and services
              </p> */}
        </div>

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

        <div className="bg-white p-8 rounded-xl shadow-lg space-y-6 mt-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-xl font-bold mb-4 relative inline-block">
              <span className="relative z-10 px-2 bg-white">
                Personal Information
              </span>
              <span className="absolute bottom-1 left-0 w-full h-2 bg-blue-100 z-0"></span>
            </h2>
            <div className="space-y-4">
              <div className="relative">
                <label
                  htmlFor="bookingId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Booking ID
                </label>
                <input
                  type="text"
                  id="bookingId"
                  name="bookingId"
                  value={formData.bookingId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm bg-gray-100"
                />
              </div>
              <div className="relative">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm"
                  placeholder="e.g., Nimsara Perera"
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
              <div className="relative">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm"
                  placeholder="e.g., abcd@example.com"
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
              <div className="relative">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm"
                  placeholder="e.g., +94 77 123 4567"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label
                    htmlFor="address1"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    id="address1"
                    name="address1"
                    value={formData.address1}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm"
                    placeholder="e.g., No. 12, Temple Road"
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
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    id="address2"
                    name="address2"
                    value={formData.address2}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm"
                    placeholder="e.g., Kottawa"
                  />
                </div>
                <div>
                  <label
                    htmlFor="address3"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address Line 3
                  </label>
                  <input
                    type="text"
                    id="address3"
                    name="address3"
                    value={formData.address3}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm"
                    placeholder="e.g., Homagama"
                  />
                </div>
                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    State / Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm"
                    placeholder="e.g., Western Province"
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
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Zip / Postal Code
                  </label>
                  <input
                    type="text"
                    id="zip"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm"
                    placeholder="e.g., 10200"
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
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm"
                    placeholder="e.g., Sri Lanka"
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
            <h2 className="text-xl font-bold mb-4 relative inline-block">
              <span className="relative z-10 px-2 bg-white">
                Booking Details
              </span>
              <span className="absolute bottom-1 left-0 w-full h-2 bg-blue-100 z-0"></span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="checkIn"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Check-in Date
                </label>
                <input
                  type="date"
                  id="checkIn"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm"
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
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Check-out Date
                </label>
                <input
                  type="date"
                  id="checkOut"
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm"
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
                  className="block text-sm font-medium text-gray-700 mb-1"
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm"
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
                  className="block text-sm font-medium text-gray-700 mb-1"
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm"
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
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Room Type
                </label>
                <select
                  id="roomType"
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm"
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
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Number of Rooms
                </label>
                <select
                  id="numberOfRooms"
                  name="numberOfRooms"
                  value={formData.numberOfRooms}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm"
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
            <h2 className="text-xl font-bold mb-4 relative inline-block">
              <span className="relative z-10 px-2 bg-white">Services</span>
              <span className="absolute bottom-1 left-0 w-full h-2 bg-blue-100 z-0"></span>
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Services
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      name="breakfast"
                      checked={formData.breakfast}
                      onChange={handleChange}
                      className="focus:ring-blue-500 h-5 w-5 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <span className="text-gray-700">
                    Breakfast (Rs. {servicePrices.breakfast} adult per night)
                  </span>
                </label>
                <label className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      name="airportTransfer"
                      checked={formData.airportTransfer}
                      onChange={handleChange}
                      className="focus:ring-blue-500 h-5 w-5 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <span className="text-gray-700">
                    Airport Transfer (Rs. {servicePrices.airportTransfer} per
                    booking)
                  </span>
                </label>
                <label className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      name="golf"
                      checked={formData.golf}
                      onChange={handleChange}
                      className="focus:ring-blue-500 h-5 w-5 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <span className="text-gray-700">
                    Golf (Rs. {servicePrices.golf} adult per day)
                  </span>
                </label>
                <label className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      name="spa"
                      checked={formData.spa}
                      onChange={handleChange}
                      className="focus:ring-blue-500 h-5 w-5 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <span className="text-gray-700">
                    Spa (Rs. {servicePrices.spa} adult per day)
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="focus:ring-blue-500 h-5 w-5 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <span className="text-sm text-gray-700">
                I agree to the terms and conditions
              </span>
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
          </div>

          {totalCost > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">
                  Total Cost:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  Rs. {totalCost.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {calculateNumberOfNights(formData.checkIn, formData.checkOut)}{" "}
                night(s) × {formData.numberOfRooms} room(s)
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-300 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-800 to-indigo-800 hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-1"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Confirm Booking"
            )}
          </button>
        </div>
        {isPopupOpen && (
          <div className="fixed inset-0 bg-black/80 flex justify-center items-end z-1000">
            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full ml-8 mb-15">
              <div className="text-center mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-2xl font-bold text-gray-800 mt-4">
                  Booking Confirmed!
                </h3>
                <p className="text-green-600 font-semibold mt-2">
                  Your reservation is now complete
                </p>
              </div>

              <div className="space-y-3 text-left border-t border-b border-gray-200 py-4 my-4">
                <p>
                  <span className="font-semibold">Booking ID:</span>{" "}
                  {formData.bookingId}
                </p>
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  {formData.fullName}
                </p>
                <p>
                  <span className="font-semibold">Dates:</span>{" "}
                  {formData.checkIn} to {formData.checkOut}
                </p>
                <p>
                  <span className="font-semibold">Total:</span> Rs.{" "}
                  {bookingTotalCost.toFixed(2)}
                </p>
              </div>

              <div className="text-center">
                <button
                  onClick={() => {
                    setIsPopupOpen(false);
                    window.location.reload();
                  }}
                  className="w-full bg-indigo-700 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Close Summary
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomBooking;
