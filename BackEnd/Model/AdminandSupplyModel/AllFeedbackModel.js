const mongoose = require('mongoose');

const AllFeedbackSchema = new mongoose.Schema({
    feedback_id: {
        type: String,
        required: [true, 'Feedback ID is required'],
        unique: true,
        trim: true
    },
    customer_id: {
        type: String,
        required: true,
        trim: true
    },
    order_id: {
        type: String,
        required: true,
        trim: true
    },
    job_id: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comments: {
        type: String,
        required: true,
        trim: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AllFeedback', AllFeedbackSchema);