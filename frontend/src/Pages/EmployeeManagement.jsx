import React, { useState, useEffect } from "react";

const EmployeeManagement = () => {
  const [formData, setFormData] = useState({
    employeeId: "",
    fullName: "",
    nic: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    address: "",
    department: "",
    position: "",
    dateOfJoining: "",
    salary: "",
    employmentType: "",
    allowanceRate: "",
    totalSalary: "",
  });

  // Add a new state to store submitted data for the popup
  const [submittedData, setSubmittedData] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Fetch next employee ID on component mount
  useEffect(() => {
    const fetchNextEmployeeId = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/employees/next-id"
        );
        const data = await response.json();
        if (response.ok) {
          setFormData((prev) => ({ ...prev, employeeId: data.employeeId }));
        } else {
          // Generate a fallback ID if API fails - silently without error message
          const fallbackId = `EMP${Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, "0")}`;
          setFormData((prev) => ({ ...prev, employeeId: fallbackId }));
        }
      } catch (error) {
        // Generate a fallback ID if API fails - silently without error message
        const fallbackId = `EMP${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")}`;
        setFormData((prev) => ({ ...prev, employeeId: fallbackId }));
        console.error("Error fetching employee ID:", error);
      }
    };
    fetchNextEmployeeId();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear previous error for this field
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    // Field-specific validations
    if (name === "fullName") {
      if (value && !/^[A-Za-z\s]+$/.test(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          fullName: "Full Name should contain only letters and spaces",
        }));
      }
    } else if (name === "nic") {
      if (value && !/^(\d{9}[vV]|\d{12})$/.test(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          nic: "Invalid NIC",
        }));
      }
    } else if (name === "dateOfBirth") {
      // Check if the date is in the future
      if (value) {
        const selectedDate = new Date(value);
        const today = new Date();

        if (selectedDate > today) {
          setFieldErrors((prev) => ({
            ...prev,
            dateOfBirth: "Future dates cannot be included",
          }));
        }
      }
    } else if (name === "email") {
      if (
        value &&
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
      ) {
        setFieldErrors((prev) => ({
          ...prev,
          email: "Invalid Email",
        }));
      }
    } else if (name === "position") {
      if (value && !/^[A-Za-z\s]+$/.test(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          position: "Only letters and spaces allowed",
        }));
      }
    }

    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };

      // Calculate allowance and total salary when salary or employmentType changes
      if (name === "salary" || name === "employmentType") {
        const salary = Number(updatedData.salary) || 0;
        const allowanceRate =
          updatedData.employmentType === "Full-Time"
            ? 0.3
            : updatedData.employmentType === "Part-Time"
            ? 0.15
            : 0;
        const allowance = salary * allowanceRate;
        const totalSalary = salary + allowance;

        return {
          ...updatedData,
          allowanceRate: allowance.toFixed(2),
          totalSalary: totalSalary.toFixed(2),
        };
      }

      return updatedData;
    });
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    // Check fullName - required and only letters+spaces
    if (!formData.fullName) {
      errors.fullName = "Full name is required";
    } else if (!/^[A-Za-z\s]+$/.test(formData.fullName)) {
      errors.fullName = "Full Name should contain only letters and spaces";
    }

    // Check NIC - required and format validation
    if (!formData.nic) {
      errors.nic = "NIC is required";
    } else if (!/^(\d{9}[vV]|\d{12})$/.test(formData.nic)) {
      errors.nic = "Invalid NIC";
    }

    // Date of Birth validation
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required";
    } else {
      // Check if the date is in the future
      const selectedDate = new Date(formData.dateOfBirth);
      const today = new Date();

      if (selectedDate > today) {
        errors.dateOfBirth = "Invalid DOB";
      }
    }

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      errors.email = "Invalid Email";
    }

    // Phone validation - only check if phone is required, no format validation
    if (!formData.phone) {
      errors.phone = "Phone number is required";
    }

    // Address validation
    if (!formData.address) {
      errors.address = "Address is required";
    }

    // Department validation
    if (!formData.department) {
      errors.department = "Department is required";
    }

    // Position validation
    if (!formData.position) {
      errors.position = "Position is required";
    } else if (!/^[A-Za-z\s]+$/.test(formData.position)) {
      errors.position = "Only letters and spaces allowed";
    }

    // Date of Joining validation
    if (!formData.dateOfJoining) {
      errors.dateOfJoining = "Date of joining is required";
    }

    // Salary validation
    if (
      !formData.salary ||
      isNaN(formData.salary) ||
      Number(formData.salary) <= 0
    ) {
      errors.salary = "Valid salary is required";
    }

    // Employment Type validation
    if (!formData.employmentType) {
      errors.employmentType = "Employment type is required";
    }

    setFieldErrors(errors);

    // Return the first error message for general form error, or empty string if no errors
    const errorValues = Object.values(errors);
    return errorValues.length > 0 ? errorValues[0] : "";
  };

  // Handle form submission
  const handleSubmit = async () => {
    setError("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          salary: Number(formData.salary),
          allowanceRate: Number(formData.allowanceRate),
          totalSalary: Number(formData.totalSalary),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // Save the current form data for the popup before resetting
        setSubmittedData({ ...formData });
        setIsPopupOpen(true);

        try {
          // Fetch next employee ID for the next form - handle failure silently
          const nextIdResponse = await fetch(
            "http://localhost:5000/api/employees/next-id"
          );
          const nextIdData = await nextIdResponse.json();

          // Generate new form state with either API ID or fallback ID
          const newFormState = {
            employeeId: nextIdResponse.ok
              ? nextIdData.employeeId
              : `EMP${Math.floor(Math.random() * 10000)
                  .toString()
                  .padStart(4, "0")}`,
            fullName: "",
            nic: "",
            dateOfBirth: "",
            email: "",
            phone: "",
            address: "",
            department: "",
            position: "",
            dateOfJoining: "",
            salary: "",
            employmentType: "",
            allowanceRate: "",
            totalSalary: "",
          };

          setFormData(newFormState);
          setFieldErrors({});
        } catch (idError) {
          // If fetching new ID fails, still reset form with fallback ID
          const fallbackId = `EMP${Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, "0")}`;
          setFormData({
            employeeId: fallbackId,
            fullName: "",
            nic: "",
            dateOfBirth: "",
            email: "",
            phone: "",
            address: "",
            department: "",
            position: "",
            dateOfJoining: "",
            salary: "",
            employmentType: "",
            allowanceRate: "",
            totalSalary: "",
          });
          setFieldErrors({});
          console.error("Error fetching next employee ID:", idError);
        }
      } else {
        setError(data.message || "Failed to create employee");
      }
    } catch (error) {
      // Keep this error since it's critical for users to know their data wasn't saved
      setError("Failed to save employee data. Please try again.");
      console.error("Error submitting form:", error);
    }
  };

  // Handle popup close
  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSubmittedData(null);
  };

  // Error message component for reuse
  const ErrorMessage = ({ message }) => (
    <div className="mt-1 flex items-center text-sm text-red-600">
      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </div>
  );

  // Format date for display in the popup
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get today's date in yyyy-mm-dd format for the max attribute
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="ml-64 pt-16 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
        <h1 className="text-4xl font-extrabold text-indigo-800 mb-8 text-center">
          Employee Management
        </h1>
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg shadow-md">
            {error}
          </div>
        )}
        <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
          {/* Employee ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Employee ID
            </label>
            <input
              id="employeeId"
              type="text"
              name="employeeId"
              value={formData.employeeId}
              readOnly
              className="w-full p-3 rounded-md border border-gray-300 bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full p-3 rounded-md border ${
                fieldErrors.fullName ? "border-red-500" : "border-gray-300"
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
              placeholder="e.g., John Doe"
            />
            {fieldErrors.fullName && (
              <ErrorMessage message={fieldErrors.fullName} />
            )}
          </div>

          {/* NIC */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              NIC
            </label>
            <input
              id="nic"
              type="text"
              name="nic"
              value={formData.nic}
              onChange={handleChange}
              className={`w-full p-3 rounded-md border ${
                fieldErrors.nic ? "border-red-500" : "border-gray-300"
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
              placeholder="e.g., 200012345678 or 123456789V"
            />
            {fieldErrors.nic && <ErrorMessage message={fieldErrors.nic} />}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              max={today}
              className={`w-full p-3 rounded-md border ${
                fieldErrors.dateOfBirth ? "border-red-500" : "border-gray-300"
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
            />
            {fieldErrors.dateOfBirth && (
              <ErrorMessage message={fieldErrors.dateOfBirth} />
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 rounded-md border ${
                fieldErrors.email ? "border-red-500" : "border-gray-300"
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
              placeholder="e.g., john.doe@example.com"
            />
            {fieldErrors.email && <ErrorMessage message={fieldErrors.email} />}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full p-3 rounded-md border ${
                fieldErrors.phone ? "border-red-500" : "border-gray-300"
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
              placeholder="e.g., 0712345678"
            />
            {fieldErrors.phone && <ErrorMessage message={fieldErrors.phone} />}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              className={`w-full p-3 rounded-md border ${
                fieldErrors.address ? "border-red-500" : "border-gray-300"
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
              placeholder="e.g., 123 Main Street, Colombo"
            ></textarea>
            {fieldErrors.address && (
              <ErrorMessage message={fieldErrors.address} />
            )}
          </div>

          {/* Department - Updated to use a dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Department
            </label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`w-full p-3 rounded-md border ${
                fieldErrors.department ? "border-red-500" : "border-gray-300"
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
            >
              <option value="">Select Department</option>
              <option value="Front Office Department">
                Front Office Department
              </option>
              <option value="Housekeeping Department">
                Housekeeping Department
              </option>
              <option value="Kitchen / Food Production Department">
                Kitchen / Food Production Department
              </option>
              <option value="Human Resources Department">
                Human Resources Department
              </option>
              <option value="Information Technology (IT)">
                Information Technology (IT)
              </option>
            </select>
            {fieldErrors.department && (
              <ErrorMessage message={fieldErrors.department} />
            )}
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Position
            </label>
            <input
              id="position"
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className={`w-full p-3 rounded-md border ${
                fieldErrors.position ? "border-red-500" : "border-gray-300"
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
              placeholder="e.g., Manager, Developer"
            />
            {fieldErrors.position && (
              <ErrorMessage message={fieldErrors.position} />
            )}
          </div>

          {/* Date of Joining */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date of Joining
            </label>
            <input
              id="dateOfJoining"
              type="date"
              name="dateOfJoining"
              value={formData.dateOfJoining}
              onChange={handleChange}
              className={`w-full p-3 rounded-md border ${
                fieldErrors.dateOfJoining ? "border-red-500" : "border-gray-300"
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
            />
            {fieldErrors.dateOfJoining && (
              <ErrorMessage message={fieldErrors.dateOfJoining} />
            )}
          </div>

          {/* Salary */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Salary
            </label>
            <input
              id="salary"
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className={`w-full p-3 rounded-md border ${
                fieldErrors.salary ? "border-red-500" : "border-gray-300"
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
              placeholder="e.g., 50000"
            />
            {fieldErrors.salary && (
              <ErrorMessage message={fieldErrors.salary} />
            )}
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Employment Type
            </label>
            <select
              id="employmentType"
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className={`w-full p-3 rounded-md border ${
                fieldErrors.employmentType
                  ? "border-red-500"
                  : "border-gray-300"
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200`}
            >
              <option value="">Select Type</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
            </select>
            {fieldErrors.employmentType && (
              <ErrorMessage message={fieldErrors.employmentType} />
            )}
          </div>

          {/* Allowance */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Allowance
            </label>
            <input
              id="allowanceRate"
              type="number"
              name="allowanceRate"
              value={formData.allowanceRate}
              readOnly
              className="w-full p-3 rounded-md border border-gray-300 bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Total Salary */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Total Salary
            </label>
            <input
              id="totalSalary"
              type="number"
              name="totalSalary"
              value={formData.totalSalary}
              readOnly
              className="w-full p-3 rounded-md border border-gray-300 bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Submit Button */}
          <button
            id="createEmployeeButton"
            onClick={handleSubmit}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300"
          >
            Create Employee
          </button>
        </div>

        {/* Success Popup styled with scrollable content */}
        {isPopupOpen && submittedData && (
          <div
            id="successPopup"
            className="fixed inset-0 rounded-2xl bg-black/80 flex justify-center items-end z-50"
          >
            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 mb-8">
              <div className="text-center mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-green-500"
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
                <h3
                  className="text-xl font-bold text-gray-800 mt-2"
                  id="successTitle"
                >
                  Employee Created!
                </h3>
                <p
                  className="text-green-600 font-semibold text-sm"
                  id="successMessage"
                >
                  Your registration is now complete
                </p>
              </div>

              {/* Scrollable section with all employee details */}
              <div
                className="space-y-2 text-left border-t border-b border-gray-200 py-3 my-3 max-h-64 overflow-y-auto pr-2"
                style={{ scrollbarWidth: "thin" }}
              >
                <p>
                  <span className="font-semibold">Employee ID:</span>{" "}
                  {submittedData.employeeId}
                </p>
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  {submittedData.fullName}
                </p>
                <p>
                  <span className="font-semibold">NIC:</span>{" "}
                  {submittedData.nic}
                </p>
                <p>
                  <span className="font-semibold">Date of Birth:</span>{" "}
                  {formatDate(submittedData.dateOfBirth)}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {submittedData.email}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  {submittedData.phone}
                </p>
                <p>
                  <span className="font-semibold">Address:</span>{" "}
                  {submittedData.address}
                </p>
                <p>
                  <span className="font-semibold">Department:</span>{" "}
                  {submittedData.department}
                </p>
                <p>
                  <span className="font-semibold">Position:</span>{" "}
                  {submittedData.position}
                </p>
                <p>
                  <span className="font-semibold">Date of Joining:</span>{" "}
                  {formatDate(submittedData.dateOfJoining)}
                </p>
                <p>
                  <span className="font-semibold">Employment Type:</span>{" "}
                  {submittedData.employmentType}
                </p>
                <p>
                  <span className="font-semibold">Base Salary:</span> Rs.{" "}
                  {submittedData.salary}
                </p>
                <p>
                  <span className="font-semibold">Allowance:</span> Rs.{" "}
                  {submittedData.allowanceRate}
                </p>
                <p>
                  <span className="font-semibold">Total Salary:</span> Rs.{" "}
                  {submittedData.totalSalary}
                </p>
              </div>

              <div className="text-center">
                <button
                  onClick={handleClosePopup}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
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

export default EmployeeManagement;
