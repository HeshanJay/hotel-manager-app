// controllers/kitchenController.js

import Kitchen from "../models/kitchenItem.js";

export const createKitchen = async (req, res) => {
  // define today so date-checks won’t crash
  const today = new Date().toISOString().split("T")[0];

  try {
    const {
      orderId,
      itemCategory,
      itemType,
      itemDetails,         // array of { name, quantity, price }
      orderDate,
      expectedDeliveryDate,
      supplierName,
      supplierContact,
      paymentStatus,
      orderedBy,
      remarks,
      totalCost
    } = req.body;

    // 1) Basic required-field check
    if (
      !orderId ||
      !itemCategory ||
      !itemType ||
      !Array.isArray(itemDetails) ||
      itemDetails.length === 0 ||
      !orderDate ||
      !expectedDeliveryDate ||
      !supplierName ||
      !supplierContact ||
      !paymentStatus ||
      !orderedBy ||
      totalCost == null
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    // 2) Enforce min/max count (skip for Water)
    const count = itemDetails.length;
    if (itemType !== "Water") {
      if (count < 5 || count > 10) {
        return res.status(400).json({
          message: `For ${itemType}, select between 5 and 10 items.`,
        });
      }
    }

    // 3) Validate each item
    for (const { name, quantity, price } of itemDetails) {
      if (!name) {
        return res
          .status(400)
          .json({ message: "Each item must have a name." });
      }
      if (quantity === "" || Number(quantity) < 0) {
        return res.status(400).json({
          message: `Quantity for "${name}" must be non-negative.`,
        });
      }
      if (price === "" || Number(price) < 0) {
        return res.status(400).json({
          message: `Price for "${name}" must be non-negative.`,
        });
      }
    }

    // 4) Date must not be in the past
    if (orderDate < today || expectedDeliveryDate < today) {
      return res
        .status(400)
        .json({ message: "Dates cannot be in the past." });
    }

    // 5) Supplier contact format
    const c = supplierContact.trim();
    const isPhone = /^[0-9]{10}$/.test(c);
    const isEmail = /^\S+@\S+\.\S+$/.test(c);
    if (!isPhone && !isEmail) {
      return res
        .status(400)
        .json({ message: "Enter a valid email or 10-digit phone number." });
    }

    // 6) Everything’s valid → save
    const kitchen = new Kitchen({
      orderId,
      itemCategory,
      itemType,
      itemDetails,
      orderDate,
      expectedDeliveryDate,
      supplierName,
      supplierContact,
      paymentStatus,
      orderedBy,
      remarks,
      totalCost,
    });

    await kitchen.save();
    return res
      .status(201)
      .json({ message: "Kitchen order saved successfully", kitchen });

  } catch (error) {
    console.error("Error saving kitchen order:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
