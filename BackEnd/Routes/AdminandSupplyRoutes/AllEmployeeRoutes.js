// 3) Routes = BackEnd > Routes > AdminandSupplyRoutes > AllEmployeeRoutes.js
const express = require("express");
const router = express.Router();
// Insert Model
const Employee = require("../../Model/AdminandSupplyModel/AllEmployeeModel");
// Insert controller
const EmployeeController = require("../../Controllers/AdminandSupplyControllers/AllEmployeeController");
router.get("/", EmployeeController.getAllEmployees);
router.get("/:id", EmployeeController.getById);
module.exports = router;