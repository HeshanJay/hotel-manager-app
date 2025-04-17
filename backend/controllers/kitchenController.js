import Kitchen from "../models/kitchenItem.js";

export const createKitchen = async (req, res) => {
  try {
    const {
      orderId,
      itemCategory,
      itemType,
      itemDetails,        // array of { name, quantity, price }
      orderDate,
      expectedDeliveryDate,
      supplierName,
      supplierContact,
      paymentStatus,
      orderedBy,
      remarks,
      totalCost
    } = req.body;

    // Basic required‑field check
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
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    // Validate itemDetails length by category/type
    const count = itemDetails.length;
    if (itemCategory === "Food") {
      const min = (itemType === "Vegetables" || itemType === "Fruits") ? 4 : 3;
      if (count < min || count > 10) {
        return res.status(400).json({ message: `For ${itemType}, select between ${min} and 10 items.` });
      }
    } else if (itemCategory === "Beverage" && itemType === "Soft Drinks") {
      if (count < 3 || count > 10) {
        return res.status(400).json({ message: "For Soft Drinks, select between 3 and 10 items." });
      }
    } else if (itemCategory === "Equipment") {
      if (count < 2 || count > 10) {
        return res.status(400).json({ message: "For Equipment, select between 2 and 10 items." });
      }
    }

    // Validate each itemDetail
    for (const { name, quantity, price } of itemDetails) {
      if (!name || quantity < 0 || price < 0) {
        return res.status(400).json({ message: "Each item must have a name, non‑negative quantity and price." });
      }
    }

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
      totalCost
    });

    await kitchen.save();
    res.status(201).json({ message: "Kitchen order saved successfully", kitchen });
  } catch (error) {
    console.error("Error saving kitchen order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};