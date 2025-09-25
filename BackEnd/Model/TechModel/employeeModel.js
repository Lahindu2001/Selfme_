const mongoose = require("mongoose");
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

// Apply the auto-increment plugin only if not already applied
if (!mongoose.models.Employee) {
  employeeSchema.plugin(AutoIncrement, { inc_field: "employee_id" });
}

// Export the model, using existing model if it exists
module.exports = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);