const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  payment_id: { type: String, required: true, unique: true },
  invoice_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false }], // Added itemId array
  payment_method: { type: String, enum: ['Bank Transfer'], required: true },
  amount: { type: Number, required: true },
  payment_date: { type: Date, default: Date.now },
  reference_no: { type: String, default: null },
  status: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' }
});

paymentSchema.index({ payment_id: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema);