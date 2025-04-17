import Booking from "../models/Booking.js";

export const createBooking = async (req, res) => {
  try {
    const {
      bookingId,
      fullName,
      email,
      phone,
      address1,
      address2,
      address3,
      state,
      zip,
      country,
      checkIn,
      checkOut,
      adults,
      children,
      roomType,
      numberOfRooms,
      agreeTerms,
      breakfast,
      airportTransfer,
      golf,
      spa,
      totalCost,
    } = req.body;

    // Validate required fields
    if (
      !bookingId ||
      !fullName ||
      !email ||
      !phone ||
      !address1 ||
      !state ||
      !zip ||
      !country ||
      !checkIn ||
      !checkOut ||
      adults === undefined ||
      children === undefined ||
      !roomType ||
      !numberOfRooms ||
      agreeTerms === undefined
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    // Check if bookingId already exists
    const existingBooking = await Booking.findOne({ bookingId });
    if (existingBooking) {
      return res.status(400).json({ message: "Booking ID already exists" });
    }

    // Convert dates to Date objects
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate dates
    if (checkOutDate <= checkInDate) {
      return res
        .status(400)
        .json({ message: "Check-out date must be after check-in date" });
    }

    // Create booking
    const booking = new Booking({
      bookingId,
      fullName,
      email,
      phone,
      address1,
      address2,
      address3,
      state,
      zip,
      country,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      adults,
      children,
      roomType,
      numberOfRooms,
      agreeTerms,
      breakfast,
      airportTransfer,
      golf,
      spa,
      totalCost,
    });

    // Save to MongoDB
    await booking.save();

    // Send response
    res.status(201).json({
      message: "Booking saved successfully",
      bookingId: booking.bookingId,
      totalCost: booking.totalCost,
    });
  } catch (error) {
    console.error("Error saving booking:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
