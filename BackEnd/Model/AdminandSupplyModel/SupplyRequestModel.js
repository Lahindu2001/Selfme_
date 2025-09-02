const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const supplyRequestSchema = new Schema({
  supplier_id: { type: Number, required: true },
  supplier_name: { type: String, required: true, maxlength: 100 },
  supplier_contact: { type: String, required: true, maxlength: 10 },
  supplier_brandname: { type: String, required: true, maxlength: 100 },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Pending'], 
    default: 'Pending' 
  },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Supplier", supplyRequestSchema);