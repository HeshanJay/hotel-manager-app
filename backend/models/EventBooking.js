import mongoose from "mongoose";

const eventBookingSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  eventType: { type: String, required: true },
  eventDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  numberOfGuests: { type: Number, required: true, min: 1, max: 1000 },
  contactName: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  specialRequests: { type: String },
  agreeTerms: { type: Boolean, required: true },
  totalCost: { type: Number, required: true },
});

export default mongoose.model("EventBooking", eventBookingSchema);