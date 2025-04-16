import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import kitchenRoutes from "./routes/kitchen.js";

dotenv.config();
const app = express();

// CUSTOM CORS MIDDLEWARE
app.use((req, res, next) => {
  // Allow your React frontend domain
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  // Allow the required HTTP methods
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  // Allow any headers your requests might use
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // For OPTIONS requests, respond immediately with 200 status
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Parse JSON bodies
app.use(express.json());

// Connect to MongoDB
connectDB();

// Use API routes
app.use("/api/kitchen", kitchenRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
