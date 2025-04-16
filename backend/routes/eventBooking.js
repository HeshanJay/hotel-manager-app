import express from "express";
import { createEventBooking } from "../controllers/eventBookingController.js";

const router = express.Router();

router.post("/", createEventBooking);

export default router;