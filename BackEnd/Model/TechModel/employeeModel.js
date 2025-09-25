const mongoose = require("mongoose");
const Counter = require('../../Model/AdminandSupplyModel/counterModel');

const employeeSchema = new mongoose.Schema(
  {
    employee_id: { type: Number, unique: true }, // Auto-incremented field
    Employee_name: { type: String, required: true },
    Employee_Address: { type: String, required: true },
    Employee_Dob: { type: Date, required: true },
    contact_number: { type: String, required: true },
    hire_date: { type: Date, required: true },
    assigned_tasks: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

// Pre-save hook to auto-increment employee_id using Counter model
employeeSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { _id: 'employee_id' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.employee_id = counter.sequence_value;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

// Check if model already exists before compiling
module.exports = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);