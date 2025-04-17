import Employee from "../models/Employee.js";

export const createEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      fullName,
      nic,
      dateOfBirth,
      email,
      phone,
      address,
      department,
      position,
      dateOfJoining,
      salary,
      employmentType,
      allowanceRate,
      totalSalary,
    } = req.body;

    // Validate required fields
    if (
      !employeeId ||
      !fullName ||
      !nic ||
      !dateOfBirth ||
      !email ||
      !phone ||
      !address ||
      !department ||
      !position ||
      !dateOfJoining ||
      !salary ||
      !employmentType ||
      allowanceRate === undefined ||
      totalSalary === undefined
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    // Convert dates to Date objects
    const dob = new Date(dateOfBirth);
    const doj = new Date(dateOfJoining);

    // Create employee
    const employee = new Employee({
      employeeId,
      fullName,
      nic,
      dateOfBirth: dob,
      email,
      phone,
      address,
      department,
      position,
      dateOfJoining: doj,
      salary,
      employmentType,
      allowanceRate,
      totalSalary,
    });

    // Save to MongoDB
    await employee.save();

    // Send response
    res.status(201).json({
      message: "Employee created successfully",
      employeeId,
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
