const express = require("express");
const router = express.Router();

// Import Models
const SupplyProduct = require("../../Model/AdminandSupplyModel/supplyProductsModel");
const Supplier = require("../../Model/AdminandSupplyModel/SupplyRequestModel");

// Import Controller
const SupplyProductController = require("../../Controllers/AdminandSupplyControllers/supplyProductsController");

// Routes
router.get("/", SupplyProductController.getAllSupplyProducts);
router.get("/suppliers", SupplyProductController.getSupplierBrandNames);
router.post("/", SupplyProductController.addSupplyProduct);
router.get("/:id", SupplyProductController.getSupplyProductById);
router.put("/:id", SupplyProductController.updateSupplyProduct);
router.delete("/:id", SupplyProductController.deleteSupplyProduct);

module.exports = router;