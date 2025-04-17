import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import kitchenRoutes from "./routes/kitchen.js";
import bookingRoutes from "./routes/booking.js";
import eventBookingRoutes from "./routes/eventBooking.js";
import employeeRoutes from "./routes/employee.js";


dotenv.config();

const app = express();

// ✅ Middleware with configured CORS
app.use(cors({
  origin: 'http://localhost:5173', // allow Vite frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // if you send cookies
}));
app.use(express.json());

// ✅ Routes
app.use("/api/kitchen", kitchenRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/event-bookings", eventBookingRoutes);
app.use("/api/employees", employeeRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  connectDB();
  console.log(`Server started at http://localhost:${PORT}`);
  
});

