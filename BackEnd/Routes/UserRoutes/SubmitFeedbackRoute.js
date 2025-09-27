const express = require('express');
const router = express.Router();
const SubmitFeedbackController = require('../../Controllers/UserController/SubmitFeedbackController');

router.post('/', SubmitFeedbackController.addFeedback);

module.exports = router;