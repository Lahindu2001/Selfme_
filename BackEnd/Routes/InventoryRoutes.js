const express = require("express");
router = express.Router();

//insert Model
const User = require("../Model/InventoryModel") ;

// Import Inventory Controller
const InventoryController = require("../Controlers/InventoryController");

// Routes
router.get("/", InventoryController.getAllItems);       // Get all items
router.post("/", InventoryController.addItem);          // Add item
router.get("/:id", InventoryController.getById);        // Get item by ID
router.put("/:id", InventoryController.updateItem);     // Update item
router.delete("/:id", InventoryController.deleteItem);  // Delete item

// Export
module.exports = router;
