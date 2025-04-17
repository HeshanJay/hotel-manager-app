import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import kitchenRoutes from "./routes/kitchen.js";

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  connectDB();
  console.log(`Server started at http://localhost:${PORT}`);
});