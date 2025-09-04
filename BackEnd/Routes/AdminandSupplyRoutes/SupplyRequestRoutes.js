const express = require("express");
const router = express.Router();

// Insert Model
const SupplyRequest = require("../../Model/AdminandSupplyModel/SupplyRequestModel");

// Insert controller
const SupplyRequestController = require("../../Controllers/AdminandSupplyControllers/SupplyRequestController");

router.get("/", SupplyRequestController.getAllSupplyRequests);
router.post("/", SupplyRequestController.addSupplyRequest);
router.get("/:id", SupplyRequestController.getbyId);
router.put("/:id", SupplyRequestController.updateSupplyRequest);
router.delete("/:id", SupplyRequestController.deleteSupplyRequest);

module.exports = router;