// 2) Controller = BackEnd > Controller > AdminandSupplyControllers > AllFeedbackController.js
const AllFeedback = require("../../Model/AdminandSupplyModel/AllFeedbackModel");
// Get all feedbacks
const getAllFeedbacks = async (req, res, next) => {
    let feedbacks;
    try {
        feedbacks = await AllFeedback.find();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while fetching feedbacks" });
    }
    if (!feedbacks) return res.status(404).json({ message: "Feedbacks not found" });
    return res.status(200).json({ feedbacks });
};
// Insert feedback
const addFeedback = async (req, res, next) => {
    const { customer_id, order_id, job_id, rating, comments } = req.body;
    let feedback;
    try {
        feedback = new AllFeedback({ customer_id, order_id, job_id, rating, comments });
        await feedback.save();
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: "Unable to add feedback", error: err.message });
    }
    if (!feedback) return res.status(404).json({ message: "Unable to add feedback" });
    return res.status(200).json({ feedback });
};
// Get feedback by ID
const getbyId = async (req, res, next) => {
    const id = req.params.id;
    let feedback;
    try {
        feedback = await AllFeedback.findById(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while fetching feedback" });
    }
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });
    return res.status(200).json({ feedback });
};
// Update feedback (only reply)
const updateFeedback = async (req, res, next) => {
    const id = req.params.id;
    const { reply } = req.body;
    let feedback;
    try {
        feedback = await AllFeedback.findByIdAndUpdate(
            id,
            { reply },
            { new: true }
        );
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: "Unable to update feedback", error: err.message });
    }
    if (!feedback) return res.status(404).json({ message: "Unable to update feedback" });
    return res.status(200).json({ feedback });
};
// Delete feedback
const deleteFeedback = async (req, res, next) => {
    const id = req.params.id;
    let feedback;
    try {
        feedback = await AllFeedback.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while deleting feedback" });
    }
    if (!feedback) return res.status(404).json({ message: "Unable to delete feedback" });
    return res.status(200).json({ feedback });
};
exports.getAllFeedbacks = getAllFeedbacks;
exports.addFeedback = addFeedback;
exports.getbyId = getbyId;
exports.updateFeedback = updateFeedback;
exports.deleteFeedback = deleteFeedback;