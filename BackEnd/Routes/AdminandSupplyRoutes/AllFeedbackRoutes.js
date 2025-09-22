// 3) Routes = BackEnd > Routes > AdminandSupplyRoutes > AllFeedbackRoutes.js
const express = require("express");
const router = express.Router();
// Insert Model
const AllFeedback = require("../../Model/AdminandSupplyModel/AllFeedbackModel");
// Insert controller
const AllFeedbackController = require("../../Controllers/AdminandSupplyControllers/AllFeedbackController");
router.get("/", AllFeedbackController.getAllFeedbacks);
router.post("/", AllFeedbackController.addFeedback);
router.get("/:id", AllFeedbackController.getbyId);
router.put("/:id", AllFeedbackController.updateFeedback);
router.delete("/:id", AllFeedbackController.deleteFeedback);
module.exports = router;