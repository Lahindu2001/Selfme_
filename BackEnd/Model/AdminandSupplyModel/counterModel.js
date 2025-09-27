const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const counterSchema = new Schema({
  _id: { type: String, required: true }, // e.g., 'userid'
  sequence_value: { type: Number, default: 0 },
  prefix: { type: String, default: 'SELFMEID' } // Added prefix for custom ID format
});

module.exports = mongoose.model('Counter', counterSchema);