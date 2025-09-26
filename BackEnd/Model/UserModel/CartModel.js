const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit_price: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  receipt: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null }, // Changed 'Receipt' to 'Invoice'
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cart', cartSchema);