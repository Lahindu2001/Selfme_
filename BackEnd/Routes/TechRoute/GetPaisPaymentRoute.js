const express = require("express");
const router = express.Router();
const Payment = require("../../Model/UserModel/PaymentModel");
const GetPaisPaymentController = require("../../Controllers/TechController/GetPaisPaymentController");

router.get("/", GetPaisPaymentController.getAllPaidPayments);
router.get("/:id", GetPaisPaymentController.getById);

module.exports = router;