import mongoose from "mongoose";

const itemDetailSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  quantity:   { type: Number, required: true, min: 0 },
  price:      { type: Number, required: true, min: 0 }
}, { _id: false });

const kitchenSchema = new mongoose.Schema({
  orderId:               { type: String, required: true },
  itemCategory:          { type: String, required: true },
  itemType:              { type: String, required: true },
  itemDetails:           { type: [itemDetailSchema], required: true },
  orderDate:             { type: Date,   required: true },
  expectedDeliveryDate:  { type: Date,   required: true },
  supplierName:          { type: String, required: true },
  supplierContact:       { type: String, required: true },
  paymentStatus:         { type: String, required: true },
  orderedBy:             { type: String, required: true },
  remarks:               { type: String },
  totalCost:             { type: Number, required: true, min: 0 },
});

export default mongoose.model("Kitchen", kitchenSchema);