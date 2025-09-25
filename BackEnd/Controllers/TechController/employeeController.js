const Employee = require("../../Model/TechModel/employeeModel");

// Register new employee
exports.registerEmployee = async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all employees
exports.getAllEmployees = async (req, res) => {
  const employees = await Employee.find();
  res.json(employees);
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { Employee_name, Employee_Address, Employee_Dob, contact_number, hire_date } = req.body;
    if (!Employee_name || !/^[A-Za-z\s]+$/.test(Employee_name)) {
      return res.status(400).json({ error: "Name must contain only letters and spaces" });
    }
    if (!Employee_Address) {
      return res.status(400).json({ error: "Address is required" });
    }
    if (!Employee_Dob || (new Date().getFullYear() - new Date(Employee_Dob).getFullYear()) < 18) {
      return res.status(400).json({ error: "Employee must be at least 18 years old" });
    }
    if (!contact_number || !/^\d{10}$/.test(contact_number)) {
      return res.status(400).json({ error: "Contact number must be exactly 10 digits" });
    }
    if (!hire_date) {
      return res.status(400).json({ error: "Hire date is required" });
    }

    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};