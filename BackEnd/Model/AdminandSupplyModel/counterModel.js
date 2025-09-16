const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Counter schema for auto-incrementing IDs
const counterSchema = new Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 }
});

module.exports = mongoose.model('Counter', counterSchema);