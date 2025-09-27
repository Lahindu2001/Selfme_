// BackEnd > Routes > AdminandSupplyRoutes > AllFeedbackRoutes.js
const express = require("express");
const router = express.Router();
// Insert Model
const AllFeedback = require("../../Model/UserModel/SubmitFeedbackModel");
// Insert controller
const AllFeedbackController = require("../../Controllers/AdminandSupplyControllers/AllFeedbackController");
router.get("/", AllFeedbackController.getAllFeedbacks);
router.post("/", AllFeedbackController.addFeedback);
router.get("/:id", AllFeedbackController.getbyId);
router.delete("/:id", AllFeedbackController.deleteFeedback);
module.exports = router;