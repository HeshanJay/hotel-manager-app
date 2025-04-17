import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address1: { type: String, required: true },
    address2: { type: String },
    address3: { type: String },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    adults: { type: Number, required: true },
    children: { type: Number, required: true },
    roomType: { type: String, required: true },
    numberOfRooms: { type: Number, required: true },
    agreeTerms: { type: Boolean, required: true },
    breakfast: { type: Boolean, default: false },
    airportTransfer: { type: Boolean, default: false },
    golf: { type: Boolean, default: false },
    spa: { type: Boolean, default: false },
    totalCost: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);