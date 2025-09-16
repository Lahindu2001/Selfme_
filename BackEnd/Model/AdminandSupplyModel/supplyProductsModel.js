const mongoose = require("mongoose");
// Defining the schema for the SupplyProduct model
const SupplyProductSchema = new mongoose.Schema({
  pid: { type: Number, unique: true }, // Auto-incremented in controller
  serial_number: { type: String, required: true, maxlength: 100 },
  supplier_name: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Supplier" }, // Reference to Supplier model
  product_item: { type: String, required: true, maxlength: 100 },
  quantity: { type: Number, required: true, min: 0 },
  product_image: { type: String, maxlength: 255 },
  unit_price: { type: Number, required: true, min: 0 },
}, { timestamps: true });
module.exports = mongoose.model("SupplyProduct", SupplyProductSchema);