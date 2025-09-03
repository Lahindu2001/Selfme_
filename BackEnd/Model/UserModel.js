// BackEnd/Models/UserModel.js
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, maxlength: 100 },
  password: { type: String, required: true, maxlength: 255 },  // Hashed
  firstName: { type: String, maxlength: 150 },
  lastName: { type: String, maxlength: 150 },
  email: { type: String, required: true, unique: true, maxlength: 150 },
  phone: { type: String, maxlength: 20 },
  dob: { type: Date },
  address: { type: String, maxlength: 255 },
  ceboNo: { type: String, maxlength: 10 },  // For customers/technicians
  role: { 
    type: String, 
    enum: ['Admin', 'Inventory', 'Finance', 'Technician', 'Customer'], 
    required: true 
  },
  status: { type: String, maxlength: 20, default: 'Active' },  // Active/Inactive
  created_at: { type: Date, default: Date.now }
});

// Add auto-increment for userid (if you insist on INT PK; otherwise use _id)
userSchema.plugin(AutoIncrement, { inc_field: 'userid' });

module.exports = mongoose.model('User', userSchema);