const express = require('express');
const router = express.Router();
const employeeController = require('../../Controllers/TechController/employeeController');

// Route to register a new employee
router.post('/register', employeeController.registerEmployee);

module.exports = router;