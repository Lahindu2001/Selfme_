const Staff = require('../../Model/FinanceManager/staffModel');
const Counter = require('../../Model/AdminandSupplyModel/counterModel');

// Function to get the next sequence value for empId
const getNextSequenceValue = async (sequenceName) => {
  const counter = await Counter.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return `${counter.prefix}${String(counter.sequence_value).padStart(3, '0')}`;
};

// Register a new employee
exports.registerEmployee = async (req, res) => {
  try {
    const { Employee_name, Employee_Address, Employee_Dob, contact_number, hire_date, isManager } = req.body;

    // Validate required fields
    if (!Employee_name || !Employee_Address || !Employee_Dob || !contact_number || !hire_date) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Generate empId
    const empId = await getNextSequenceValue('empId');

    // Map dropdown value to boolean for isManager
    const isManagerBoolean = isManager === 'Team Manager';

    // Create new staff document
    const newEmployee = new Staff({
      empId,
      name: Employee_name,
      address: Employee_Address,
      dob: new Date(Employee_Dob),
      contactNumber: contact_number,
      hireDate: new Date(hire_date),
      isManager: isManagerBoolean
    });

    // Save employee to database
    await newEmployee.save();

    res.status(201).json({ message: 'Employee registered successfully', empId });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Employee ID already exists' });
    }
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};