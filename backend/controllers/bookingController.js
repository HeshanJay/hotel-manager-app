import Booking from "../models/Booking.js";

export const createBooking = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      checkIn,
      checkOut,
      adults,
      children,
      roomType,
      numberOfRooms,
      nationality,
      agreeTerms,
      breakfast,
      parking,
      airportTransfer,
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !email ||
      !phone ||
      !checkIn ||
      !checkOut ||
      !adults ||
      !children ||
      !roomType ||
      !numberOfRooms ||
      !nationality ||
      agreeTerms === undefined
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
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

    // Calculate number of nights
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 3600 * 24));

    // Define room and service prices
    const roomPrices = {
      standard: 100,
      deluxe: 150,
      suite: 250,
    };
    const servicePrices = {
      breakfast: 10, // per person per night
      parking: 10, // per room per night
      airportTransfer: 50, // per booking
    };

    // Calculate total cost
    let baseCost = numberOfRooms * nights * roomPrices[roomType.toLowerCase()];
    let serviceCost = 0;
    if (breakfast) {
      const totalPeople = adults + children;
      serviceCost += nights * totalPeople * servicePrices.breakfast;
    }
    if (parking) {
      serviceCost += numberOfRooms * nights * servicePrices.parking;
    }
    if (airportTransfer) {
      serviceCost += servicePrices.airportTransfer;
    }
    const totalCost = baseCost + serviceCost;

    // Create booking
    const booking = new Booking({
      fullName,
      email,
      phone,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      adults,
      children,
      roomType,
      numberOfRooms,
      nationality,
      agreeTerms,
      breakfast,
      parking,
      airportTransfer,
      totalCost,
    });

    // Save to MongoDB
    await booking.save();

    // Send response
    res.status(201).json({ message: "Booking saved successfully", totalCost });
  } catch (error) {
    console.error("Error saving booking:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
