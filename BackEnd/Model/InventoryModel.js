const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  productName: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Panel', 'Wire', 'Safety'], // must match frontend
    required: true 
  },
  description: { type: String },
  stockQuantity: { type: Number, required: true, min: 0 }, // number required
  reorderLevel: { type: Number, default: 0 },
  reorderQuantity: { type: Number, default: 0 },
  stockLocation: { 
    type: String, 
    enum: ['Warehouse A', 'Warehouse B', 'Warehouse C'], // must match frontend
    required: true
  },
  purchasePrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  supplier: { type: String },
  warrantyPeriod: { type: String },
  powerRating: { type: String },
  manufacturer: { type: String },
  modelNumber: { type: String },
  itemStatus: { type: String, default: 'Active', enum: ['Active', 'Inactive'] }
});

module.exports = mongoose.model('Inventory', InventorySchema);
