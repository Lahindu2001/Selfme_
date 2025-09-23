// 2) Controller = BackEnd > Controller > AdminandSupplyControllers > AllEmployeeController.js
const Employee = require("../../Model/AdminandSupplyModel/AllEmployeeModel");

// Get all employees
const getAllEmployees = async (req, res, next) => {
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
const getById = async (req, res, next) => {
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

exports.getAllEmployees = getAllEmployees;
exports.getById = getById;