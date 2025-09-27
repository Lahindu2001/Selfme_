const SubmitFeedback = require('../../Model/UserModel/SubmitFeedbackModel');

const addFeedback = async (req, res, next) => {
    const { feedback_id, customer_id, order_id, job_id, rating, comments } = req.body;

    if (!feedback_id || !customer_id || !order_id || !job_id || !rating || !comments) {
        return res.status(400).json({ message: "All fields are required" });
    }

    let feedback;
    try {
        feedback = new SubmitFeedback({ feedback_id, customer_id, order_id, job_id, rating, comments });
        await feedback.save();
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: "Unable to add feedback", error: err.message });
    }
    if (!feedback) return res.status(404).json({ message: "Unable to add feedback" });
    return res.status(200).json({ feedback, message: "Feedback submitted successfully" });
};

exports.addFeedback = addFeedback;