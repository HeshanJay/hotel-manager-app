import Kitchen from "../models/kitchenItem.js";

export const createKitchen = async (req, res) => {
  try {
    const {
      orderId,
      itemNames,
      itemCategory,
      itemType,
      quantity,
      unit,
      price,
      orderDate,
      expectedDeliveryDate,
      supplierName,
      supplierContact,
      paymentStatus,
      orderedBy,
      remarks,
      totalCost,
    } = req.body;

    // Validate required fields.
    if (
      !orderId ||
      !itemCategory ||
      !itemType ||
      !quantity ||
      !unit ||
      !price ||
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
    
    // Validate multi-select count based on category.
    if (itemCategory === "Food") {
      if (itemType === "Vegetables" || itemType === "Fruits") {
        if (!Array.isArray(itemNames) || itemNames.length < 4 || itemNames.length > 10) {
          return res.status(400).json({ message: "For Vegetables and Fruits, please select at least 4 and maximum 10 items." });
        }
      } else { // Meat
        if (!Array.isArray(itemNames) || itemNames.length < 3 || itemNames.length > 10) {
          return res.status(400).json({ message: "For Meat, please select at least 3 and maximum 10 items." });
        }
      }
    }
    if (itemCategory === "Beverage" && itemType === "Soft Drinks") {
      if (!Array.isArray(itemNames) || itemNames.length < 3 || itemNames.length > 10) {
        return res.status(400).json({ message: "For Soft Drinks, please select at least 3 and maximum 10 items." });
      }
    }
    if (itemCategory === "Equipment") {
      if (!Array.isArray(itemNames) || itemNames.length < 2 || itemNames.length > 10) {
        return res.status(400).json({ message: "For Equipment, please select at least 2 and maximum 10 items." });
      }
    }

    const kitchen = new Kitchen({
      orderId,
      itemNames,
      itemCategory,
      itemType,
      quantity,
      unit,
      price,
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
    res.status(201).json({ message: "Kitchen order saved successfully", kitchen });
  } catch (error) {
    console.error("Error saving kitchen order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
