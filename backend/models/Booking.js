import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  adults: { type: Number, required: true },
  children: { type: Number, required: true },
  roomType: { type: String, required: true },
  numberOfRooms: { type: Number, required: true },
  nationality: { type: String, required: true },
  agreeTerms: { type: Boolean, required: true },
  breakfast: { type: Boolean, default: false },
  parking: { type: Boolean, default: false },
  airportTransfer: { type: Boolean, default: false },
  totalCost: { type: Number, required: true },
});

export default mongoose.model("Booking", bookingSchema);
