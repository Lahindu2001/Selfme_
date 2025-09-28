const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const counterSchema = new Schema({
  _id: { type: String, required: true }, // e.g., 'empId'
  sequence_value: { type: Number, default: 0 },
  prefix: { type: String, default: 'EMPID' } // Prefix for employee ID format
});

module.exports = mongoose.model('Counter', counterSchema);