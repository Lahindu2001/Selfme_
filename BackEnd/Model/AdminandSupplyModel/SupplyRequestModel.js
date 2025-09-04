const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Counter schema for auto-incrementing supplier_id
const counterSchema = new Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 }
});
const Counter = mongoose.model("Counter", counterSchema);

const supplyRequestSchema = new Schema({
  supplier_id: { type: Number, unique: true },
  supplier_brandname: { 
    type: String, 
    required: true, 
    maxlength: 100,
    match: /^[a-zA-Z\s]*$/ // Only letters and spaces
  },
  supplier_contact: { 
    type: String, 
    required: true, 
    match: /^\d{10}$/ // Exactly 10 digits
  },
  supplier_address: { 
    type: String, 
    required: true, 
    maxlength: 200 
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending'],
    default: 'Pending'
  },
  created_at: { type: Date, default: Date.now }
});

// Pre-save hook to auto-increment supplier_id
supplyRequestSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'supplier_id',
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.supplier_id = counter.sequence_value;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("Supplier", supplyRequestSchema);