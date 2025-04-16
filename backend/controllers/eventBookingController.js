import EventBooking from "../models/EventBooking.js";

export const createEventBooking = async (req, res) => {
  try {
    const {
      eventName,
      eventType,
      eventDate,
      startTime,
      endTime,
      numberOfGuests,
      contactName,
      contactEmail,
      contactPhone,
      specialRequests,
      agreeTerms,
    } = req.body;

    // Validate required fields
    if (
      !eventName ||
      !eventType ||
      !eventDate ||
      !startTime ||
      !endTime ||
      !numberOfGuests ||
      !contactName ||
      !contactEmail ||
      !contactPhone ||
      agreeTerms === undefined
    ) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Convert eventDate to Date object
    const eventDateObj = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validate event date is in the future
    if (eventDateObj < today) {
      return res.status(400).json({ message: "Event date must be in the future" });
    }

    // Validate times
    if (startTime >= endTime) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    // Define pricing
    const basePricePerHour = 50;
    const hourDiff = (new Date(`1970-01-01T${endTime}:00`) - new Date(`1970-01-01T${startTime}:00`)) / (1000 * 3600);
    const totalCost = hourDiff * basePricePerHour;

    // Create event booking
    const eventBooking = new EventBooking({
      eventName,
      eventType,
      eventDate: eventDateObj,
      startTime,
      endTime,
      numberOfGuests,
      contactName,
      contactEmail,
      contactPhone,
      specialRequests,
      agreeTerms,
      totalCost,
    });

    // Save to MongoDB
    await eventBooking.save();

    res.status(201).json({ message: "Event booking saved successfully", totalCost });
  } catch (error) {
    console.error("Error saving event booking:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};