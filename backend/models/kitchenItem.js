import mongoose from "mongoose";

const KitchenItemSchema = new mongoose.Schema({
  foodName: { type: String, required: true },
  foodType: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  date: { type: Date, required: true },
});

const KitchenItem = mongoose.model("KitchenItem", KitchenItemSchema);
export default KitchenItem;
