const mongoose = require("mongoose");

// Defining the schema for the Product model
const ProductSchema = new mongoose.Schema({
  product_name: { type: String, required: true, maxlength: 100 },
  price: { type: Number, required: true, min: 0 },
  description: { type: String },
  photo: { type: String, maxlength: 255 },
  created_by: { type: Number, required: true, ref: "Users" },
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);