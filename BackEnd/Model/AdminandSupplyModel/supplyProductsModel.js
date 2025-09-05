const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Counter schema for auto-incrementing product_id
const counterSchema = new Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 }
});

// Check if Counter model is already compiled to avoid OverwriteModelError
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const supplyProductsSchema = new Schema({
  product_id: { type: Number, unique: true },
  serial_number: {
    type: String,
    required: true,
    maxlength: 50,
    trim: true
  },
  supplier_name: {
    type: String,
    required: true,
    maxlength: 100,
    match: /^[a-zA-Z\s]*$/ // Must match supplier_brandname format
  },
  product_item: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit_price: {
    type: Number,
    required: true,
    min: 0
  },
  created_at: { type: Date, default: Date.now }
});

// Pre-save hook to auto-increment product_id
supplyProductsSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'product_id',
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.product_id = counter.sequence_value;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

// Check if SupplyProduct model is already compiled to avoid OverwriteModelError
const SupplyProduct = mongoose.models.SupplyProduct || mongoose.model('SupplyProduct', supplyProductsSchema);

module.exports = SupplyProduct;