import React, { useState } from "react";

const EventBooking = () => {
  const baseCosts = {
    wedding: 200000,
    conference: 150000,
    party: 80000,
    other: 50000,
  };

  const initialFormData = {
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
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [bookingTotalCost, setBookingTotalCost] = useState(0);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;
    if (name === "numberOfGuests") {
      val = parseInt(value, 10) || "";
    }
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const validateForm = () => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(formData.eventDate);

    if (!formData.eventName) errors.eventName = "Event name is required";
    if (!formData.eventType) errors.eventType = "Event type is required";
    if (!formData.eventDate) errors.eventDate = "Event date is required";
    else if (eventDate < today) errors.eventDate = "Event date must be in the future";
    if (!formData.startTime) errors.startTime = "Start time is required";
    if (!formData.endTime) errors.endTime = "End time is required";
    else if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime)
      errors.endTime = "End time must be after start time";
    if (!formData.numberOfGuests || formData.numberOfGuests < 1)
      errors.numberOfGuests = "Number of guests must be at least 1";
    else if (formData.numberOfGuests > 1000)
      errors.numberOfGuests = "Number of guests cannot exceed 1000";
    if (!formData.contactName) errors.contactName = "Contact name is required";
    if (!formData.contactEmail) errors.contactEmail = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.contactEmail))
      errors.contactEmail = "Valid email is required";
    if (!formData.contactPhone) errors.contactPhone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.contactPhone))
      errors.contactPhone = "Phone number must be 10 digits";
    if (!formData.agreeTerms)
      errors.agreeTerms = "You must agree to the terms and conditions";

    return errors;
  };

  const calculateTotalCost = () => {
    console.log("formData:", formData);
    const baseCost = baseCosts[formData.eventType] || 0;
    const guestsCost = (formData.numberOfGuests || 0) * 3000;
    let durationCost = 0;
    if (formData.startTime && formData.endTime) {
      const start = new Date(`1970-01-01T${formData.startTime}:00`);
      const end = new Date(`1970-01-01T${formData.endTime}:00`);
      const hourDiff = (end - start) / (1000 * 3600);
      console.log("hourDiff:", hourDiff);
      durationCost = hourDiff > 0 ? hourDiff * 8000 : 0;
    }
    console.log(
      "baseCost:",
      baseCost,
      "guestsCost:",
      guestsCost,
      "durationCost:",
      durationCost
    );
    return baseCost + guestsCost + durationCost;
  };

  const handleSubmit = async () => {
    setErrors({});
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
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
        setErrors({ general: data.message || "Failed to save event booking" });
      }
    } catch (error) {
      setErrors({ general: "Network error, please try again" });
      console.error("Error:", error);
    }
  };

  const totalCost = calculateTotalCost();

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setFormData(initialFormData);
    setErrors({});
  };

  return (
    <div className="ml-64 pt-16 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
        <h1 className="text-4xl font-extrabold text-indigo-800 mb-8 text-center">
          Book Your Event
        </h1>
        {errors.general && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg shadow-md">
            {errors.general}
          </div>
        )}
        <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Name
            </label>
            <input
              type="text"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              className={`w-full p-3 rounded-md border ${
                errors.eventName ? "border-red-500" : "border-gray-300"
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
              placeholder="e.g., Annual Gala"
            />
            {errors.eventName && (
              <p className="mt-1 text-sm text-red-600">{errors.eventName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Type
            </label>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              className={`w-full p-3 rounded-md border ${
                errors.eventType ? "border-red-500" : "border-gray-300"
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
            >
              <option value="">Select Event Type</option>
              <option value="wedding">Wedding</option>
              <option value="conference">Conference</option>
              <option value="party">Party</option>
              <option value="other">Other</option>
            </select>
            {errors.eventType && (
              <p className="mt-1 text-sm text-red-600">{errors.eventType}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Date
            </label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              className={`w-full p-3 rounded-md border ${
                errors.eventDate ? "border-red-500" : "border-gray-300"
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
            />
            {errors.eventDate && (
              <p className="mt-1 text-sm text-red-600">{errors.eventDate}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={`w-full p-3 rounded-md border ${
                  errors.startTime ? "border-red-500" : "border-gray-300"
                } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={`w-full p-3 rounded-md border ${
                  errors.endTime ? "border-red-500" : "border-gray-300"
                } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Guests
            </label>
            <input
              type="number"
              name="numberOfGuests"
              value={formData.numberOfGuests}
              onChange={handleChange}
              min="1"
              max="1000"
              className={`w-full p-3 rounded-md border ${
                errors.numberOfGuests ? "border-red-500" : "border-gray-300"
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
              placeholder="e.g., 50"
            />
            {errors.numberOfGuests && (
              <p className="mt-1 text-sm text-red-600">{errors.numberOfGuests}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contact Name
            </label>
            <input
              type="text"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              className={`w-full p-3 rounded-md border ${
                errors.contactName ? "border-red-500" : "border-gray-300"
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
              placeholder="e.g., Lakshi"
            />
            {errors.contactName && (
              <p className="mt-1 text-sm text-red-600">{errors.contactName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              className={`w-full p-3 rounded-md border ${
                errors.contactEmail ? "border-red-500" : "border-gray-300"
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
              placeholder="e.g., lakshi.doe@example.com"
            />
            {errors.contactEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              className={`w-full p-3 rounded-md border ${
                errors.contactPhone ? "border-red-500" : "border-gray-300"
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
              placeholder="e.g., 0701244567"
            />
            {errors.contactPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Special Requests
            </label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
              rows="4"
              placeholder="e.g., Catering required"
            ></textarea>
          </div>
          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label className="ml-2 text-sm text-gray-700">
                I agree to the terms and conditions
              </label>
            </div>
            {errors.agreeTerms && (
              <p className="mt-1 text-sm text-red-600">{errors.agreeTerms}</p>
            )}
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
            <p className="text-lg font-medium text-gray-800">
              Estimated Total Cost: Rs {totalCost.toFixed(2)}
            </p>
          </div>
        )}
        {isPopupOpen && (
          <div className="fixed inset-0 rounded-2xl bg-black/90 bg-opacity-10 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
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
                  Event Booking Confirmed!
                </h3>
                <p className="text-green-600 font-semibold mt-2">
                  Your Event booking is now complete
                </p>
              </div>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>Event Name:</strong> {formData.eventName}
                </p>
                <p>
                  <strong>Event Type:</strong> {formData.eventType}
                </p>
                <p>
                  <strong>Date:</strong> {formData.eventDate}
                </p>
                <p>
                  <strong>Time:</strong> {formData.startTime} - {formData.endTime}
                </p>
                <p>
                  <strong>Guests:</strong> {formData.numberOfGuests}
                </p>
                <p>
                  <strong>Contact:</strong> {formData.contactName}
                </p>
                <p>
                  <strong>Email:</strong> {formData.contactEmail}
                </p>
                <p>
                  <strong>Phone:</strong> {formData.contactPhone}
                </p>
                {formData.specialRequests && (
                  <p>
                    <strong>Special Requests:</strong> {formData.specialRequests}
                  </p>
                )}
                <p>
                  <strong>Total Cost:</strong> Rs {bookingTotalCost.toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleClosePopup}
                className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
              >
                Close Summary
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventBooking;


// import React, { useState } from "react";

// const EventBooking = () => {
//   const baseCosts = {
//     wedding: 200000,
//     conference: 150000,
//     party: 80000,
//     other: 50000,
//   };

//   const [formData, setFormData] = useState({
//     eventName: "",
//     eventType: "",
//     eventDate: "",
//     startTime: "",
//     endTime: "",
//     numberOfGuests: "",
//     contactName: "",
//     contactEmail: "",
//     contactPhone: "",
//     specialRequests: "",
//     agreeTerms: false,
//   });

//   const [isPopupOpen, setIsPopupOpen] = useState(false);
//   const [bookingTotalCost, setBookingTotalCost] = useState(0);
//   const [errors, setErrors] = useState({});

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     let val = type === "checkbox" ? checked : value;
//     if (name === "numberOfGuests") {
//       val = parseInt(value, 10) || "";
//     }
//     setFormData((prev) => ({ ...prev, [name]: val }));
//   };

//   const validateForm = () => {
//     const errors = {};
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const eventDate = new Date(formData.eventDate);

//     if (!formData.eventName) errors.eventName = "Event name is required";
//     if (!formData.eventType) errors.eventType = "Event type is required";
//     if (!formData.eventDate) errors.eventDate = "Event date is required";
//     else if (eventDate < today) errors.eventDate = "Event date must be in the future";
//     if (!formData.startTime) errors.startTime = "Start time is required";
//     if (!formData.endTime) errors.endTime = "End time is required";
//     else if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime)
//       errors.endTime = "End time must be after start time";
//     if (!formData.numberOfGuests || formData.numberOfGuests < 1)
//       errors.numberOfGuests = "Number of guests must be at least 1";
//     else if (formData.numberOfGuests > 1000)
//       errors.numberOfGuests = "Number of guests cannot exceed 1000";
//     if (!formData.contactName) errors.contactName = "Contact name is required";
//     if (!formData.contactEmail) errors.contactEmail = "Email is required";
//     else if (!/\S+@\S+\.\S+/.test(formData.contactEmail))
//       errors.contactEmail = "Valid email is required";
//     if (!formData.contactPhone) errors.contactPhone = "Phone number is required";
//     else if (!/^\d{10}$/.test(formData.contactPhone))
//       errors.contactPhone = "Phone number must be 10 digits";
//     if (!formData.agreeTerms)
//       errors.agreeTerms = "You must agree to the terms and conditions";

//     return errors;
//   };

//   const calculateTotalCost = () => {
//     console.log("formData:", formData); // Debug log
//     const baseCost = baseCosts[formData.eventType] || 0;
//     const guestsCost = (formData.numberOfGuests || 0) * 3000;
//     let durationCost = 0;
//     if (formData.startTime && formData.endTime) {
//       const start = new Date(`1970-01-01T${formData.startTime}:00`);
//       const end = new Date(`1970-01-01T${formData.endTime}:00`);
//       const hourDiff = (end - start) / (1000 * 3600);
//       console.log("hourDiff:", hourDiff); // Debug log
//       durationCost = hourDiff > 0 ? hourDiff * 8000 : 0;
//     }
//     console.log(
//       "baseCost:",
//       baseCost,
//       "guestsCost:",
//       guestsCost,
//       "durationCost:",
//       durationCost
//     ); // Debug log
//     return baseCost + guestsCost + durationCost;
//   };

//   const handleSubmit = async () => {
//     setErrors({});
//     const validationErrors = validateForm();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }

//     try {
//       const response = await fetch("http://localhost:5000/api/event-bookings", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();
//       if (response.ok) {
//         setBookingTotalCost(data.totalCost);
//         setIsPopupOpen(true);
//       } else {
//         setErrors({ general: data.message || "Failed to save event booking" });
//       }
//     } catch (error) {
//       setErrors({ general: "Network error, please try again" });
//       console.error("Error:", error);
//     }
//   };

//   const totalCost = calculateTotalCost();

//   return (
//     <div className="ml-64 pt-16 min-h-screen bg-gray-50">
//       <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
//         <h1 className="text-4xl font-extrabold text-indigo-800 mb-8 text-center">
//           Book Your Event
//         </h1>
//         {errors.general && (
//           <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg shadow-md">
//             {errors.general}
//           </div>
//         )}
//         <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Event Name
//             </label>
//             <input
//               type="text"
//               name="eventName"
//               value={formData.eventName}
//               onChange={handleChange}
//               className={`w-full p-3 rounded-md border ${
//                 errors.eventName ? "border-red-500" : "border-gray-300"
//               } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
//               placeholder="e.g., Annual Gala"
//             />
//             {errors.eventName && (
//               <p className="mt-1 text-sm text-red-600">{errors.eventName}</p>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Event Type
//             </label>
//             <select
//               name="eventType"
//               value={formData.eventType}
//               onChange={handleChange}
//               className={`w-full p-3 rounded-md border ${
//                 errors.eventType ? "border-red-500" : "border-gray-300"
//               } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
//             >
//               <option value="">Select Event Type</option>
//               <option value="wedding">Wedding</option>
//               <option value="conference">Conference</option>
//               <option value="party">Party</option>
//               <option value="other">Other</option>
//             </select>
//             {errors.eventType && (
//               <p className="mt-1 text-sm text-red-600">{errors.eventType}</p>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Event Date
//             </label>
//             <input
//               type="date"
//               name="eventDate"
//               value={formData.eventDate}
//               onChange={handleChange}
//               className={`w-full p-3 rounded-md border ${
//                 errors.eventDate ? "border-red-500" : "border-gray-300"
//               } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
//             />
//             {errors.eventDate && (
//               <p className="mt-1 text-sm text-red-600">{errors.eventDate}</p>
//             )}
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Start Time
//               </label>
//               <input
//                 type="time"
//                 name="startTime"
//                 value={formData.startTime}
//                 onChange={handleChange}
//                 className={`w-full p-3 rounded-md border ${
//                   errors.startTime ? "border-red-500" : "border-gray-300"
//                 } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
//               />
//               {errors.startTime && (
//                 <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
//               )}
//             </div>
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 End Time
//               </label>
//               <input
//                 type="time"
//                 name="endTime"
//                 value={formData.endTime}
//                 onChange={handleChange}
//                 className={`w-full p-3 rounded-md border ${
//                   errors.endTime ? "border-red-500" : "border-gray-300"
//                 } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
//               />
//               {errors.endTime && (
//                 <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
//               )}
//             </div>
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Number of Guests
//             </label>
//             <input
//               type="number"
//               name="numberOfGuests"
//               value={formData.numberOfGuests}
//               onChange={handleChange}
//               min="1"
//               max="1000"
//               className={`w-full p-3 rounded-md border ${
//                 errors.numberOfGuests ? "border-red-500" : "border-gray-300"
//               } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
//               placeholder="e.g., 50"
//             />
//             {errors.numberOfGuests && (
//               <p className="mt-1 text-sm text-red-600">{errors.numberOfGuests}</p>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Contact Name
//             </label>
//             <input
//               type="text"
//               name="contactName"
//               value={formData.contactName}
//               onChange={handleChange}
//               className={`w-full p-3 rounded-md border ${
//                 errors.contactName ? "border-red-500" : "border-gray-300"
//               } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
//               placeholder="e.g., Lakshi"
//             />
//             {errors.contactName && (
//               <p className="mt-1 text-sm text-red-600">{errors.contactName}</p>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Contact Email
//             </label>
//             <input
//               type="email"
//               name="contactEmail"
//               value={formData.contactEmail}
//               onChange={handleChange}
//               className={`w-full p-3 rounded-md border ${
//                 errors.contactEmail ? "border-red-500" : "border-gray-300"
//               } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
//               placeholder="e.g., lakshi.doe@example.com"
//             />
//             {errors.contactEmail && (
//               <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Contact Phone
//             </label>
//             <input
//               type="tel"
//               name="contactPhone"
//               value={formData.contactPhone}
//               onChange={handleChange}
//               className={`w-full p-3 rounded-md border ${
//                 errors.contactPhone ? "border-red-500" : "border-gray-300"
//               } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
//               placeholder="e.g., 0701244567"
//             />
//             {errors.contactPhone && (
//               <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Special Requests
//             </label>
//             <textarea
//               name="specialRequests"
//               value={formData.specialRequests}
//               onChange={handleChange}
//               className="w-full p-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
//               rows="4"
//               placeholder="e.g., Catering required"
//             ></textarea>
//           </div>
//           <div>
//             <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 name="agreeTerms"
//                 checked={formData.agreeTerms}
//                 onChange={handleChange}
//                 className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
//               />
//               <label className="ml-2 text-sm text-gray-700">
//                 I agree to the terms and conditions
//               </label>
//             </div>
//             {errors.agreeTerms && (
//               <p className="mt-1 text-sm text-red-600">{errors.agreeTerms}</p>
//             )}
//           </div>
//           <button
//             onClick={handleSubmit}
//             className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300"
//           >
//             Book Event
//           </button>
//         </div>
//         {totalCost > 0 && (
//           <div className="mt-6 text-center">
//             <p className="text-lg font-medium text-gray-800">
//               Estimated Total Cost: Rs {totalCost.toFixed(2)}
//             </p>
//           </div>
//         )}
//         {isPopupOpen && (
//           <div className="fixed inset-0 rounded-2xl bg-black/90 bg-opacity-10 flex justify-center items-center z-50">
//             <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
//                 <div className="text-center mb-6">
//                   <svg
//                       className="mx-auto h-16 w-16 text-green-500"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                   >
//                       <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth="2"
//                           d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                   </svg>
//                   <h3 className="text-2xl font-bold text-gray-800 mt-4">
//                       Event Booking Confirmed!
//                   </h3>
//                   <p className="text-green-600 font-semibold mt-2">
//                       Your Event booking is now complete
//                   </p>
//               </div>

//               {/* <p className="text-green-600 text-2xl font-semibold mb-6 text-center">
//                 Event Booking Successful!
//               </p>
//               <h2 className="text-2xl font-bold text-indigo-800 mb-4">
//                 Booking Summary
//               </h2> */}
//               <div className="space-y-2 text-gray-700">
//                 <p>
//                   <strong>Event Name:</strong> {formData.eventName}
//                 </p>
//                 <p>
//                   <strong>Event Type:</strong> {formData.eventType}
//                 </p>
//                 <p>
//                   <strong>Date:</strong> {formData.eventDate}
//                 </p>
//                 <p>
//                   <strong>Time:</strong> {formData.startTime} -{" "}
//                   {formData.endTime}
//                 </p>
//                 <p>
//                   <strong>Guests:</strong> {formData.numberOfGuests}
//                 </p>
//                 <p>
//                   <strong>Contact:</strong> {formData.contactName}
//                 </p>
//                 <p>
//                   <strong>Email:</strong> {formData.contactEmail}
//                 </p>
//                 <p>
//                   <strong>Phone:</strong> {formData.contactPhone}
//                 </p>
//                 {formData.specialRequests && (
//                   <p>
//                     <strong>Special Requests:</strong>{" "}
//                     {formData.specialRequests}
//                   </p>
//                 )}
//                 <p>
//                   <strong>Total Cost:</strong> Rs {totalCost.toFixed(2)}
//                 </p>
//               </div>
//               <button
//                 onClick={() => setIsPopupOpen(false)}
//                 className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
//               >
//                 Close Summary
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default EventBooking;

