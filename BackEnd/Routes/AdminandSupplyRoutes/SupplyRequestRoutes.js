const express = require("express");
router = express.Router();
//insert Model
const SupplyRequest = require("../../Model/AdminandSupplyModel/SupplyRequestModel");
//insert user controller
const SupplyRequestController = require("../../Controllers/AdminandSupplyControllers/SupplyRequestController");

router.get("/", SupplyRequestController.getAllSupplyRequests);
router.post("/", SupplyRequestController.addSupplyRequest);
router.get("/:id", SupplyRequestController.getbyId);
router.put("/:id", SupplyRequestController.updateSupplyRequest);
router.delete("/:id", SupplyRequestController.deleteSupplyRequest);

//export
module.exports = router;