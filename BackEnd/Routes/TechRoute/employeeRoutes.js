const express = require("express");
const router = express.Router();
const Employee = require("../../Model/TechModel/employeeModel");
const EmployeeController = require("../../Controllers/TechController/employeeController");

router.post("/register", EmployeeController.registerEmployee);
router.get("/", EmployeeController.getAllEmployees);
router.get("/:id", EmployeeController.getById);
router.delete("/:id", EmployeeController.deleteEmployee);
router.put("/:id", EmployeeController.updateEmployee);

module.exports = router;