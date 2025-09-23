// 1) Model = BackEnd > Model > AdminandSupplyModel > AllEmployeeModel.js
const mongoose = require('mongoose');
const AutoIncrement = require("mongoose-sequence")(mongoose);
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
employeeSchema.plugin(AutoIncrement, { inc_field: "employee_id" });
module.exports = mongoose.model("Employee", employeeSchema);