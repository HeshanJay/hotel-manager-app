import express from "express";
import KitchenItem from "../models/kitchenItem.js"; 

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    console.log("Incoming POST body:", req.body);
    const newItem = new KitchenItem(req.body);
    await newItem.save();
    res.status(201).json({ message: "Item saved successfully" });
  } catch (err) {
    console.error("Error saving item:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
