import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    nic: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    department: { type: String, required: true },
    position: { type: String, required: true },
    dateOfJoining: { type: Date, required: true },
    salary: { type: Number, required: true },
    employmentType: {
      type: String,
      required: true,
      enum: ["Full-Time", "Part-Time"],
    },
    allowanceRate: { type: Number, required: true },
    totalSalary: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
