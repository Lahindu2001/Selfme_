const Employee = require("../../Model/TechModel/employeeModel");

// Register new employee
exports.registerEmployee = async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json({ employee });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Server error while registering employee" });
  }
};

// Get all employees
exports.getAllEmployees = async (req, res) => {
  let employees;
  try {
    employees = await Employee.find();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error while fetching employees" });
  }
  if (!employees) return res.status(404).json({ message: "Employees not found" });
  return res.status(200).json({ employees });
};

// Get employee by ID
exports.getById = async (req, res) => {
  const id = req.params.id;
  let employee;
  try {
    employee = await Employee.findById(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error while fetching employee" });
  }
  if (!employee) return res.status(404).json({ message: "Employee not found" });
  return res.status(200).json({ employee });
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Server error while deleting employee" });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { Employee_name, Employee_Address, Employee_Dob, contact_number, hire_date } = req.body;
    if (!Employee_name || !/^[A-Za-z\s]+$/.test(Employee_name)) {
      return res.status(400).json({ message: "Name must contain only letters and spaces" });
    }
    if (!Employee_Address) {
      return res.status(400).json({ message: "Address is required" });
    }
    if (!Employee_Dob || (new Date().getFullYear() - new Date(Employee_Dob).getFullYear()) < 18) {
      return res.status(400).json({ message: "Employee must be at least 18 years old" });
    }
    if (!contact_number || !/^\d{10}$/.test(contact_number)) {
      return res.status(400).json({ message: "Contact number must be exactly 10 digits" });
    }
    if (!hire_date) {
      return res.status(400).json({ message: "Hire date is required" });
    }
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Employee not found" });
    res.status(200).json({ employee: updated });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Server error while updating employee" });
  }
};