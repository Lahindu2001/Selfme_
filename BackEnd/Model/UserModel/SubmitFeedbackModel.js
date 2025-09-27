const mongoose = require('mongoose');

const SubmitFeedbackSchema = new mongoose.Schema({
    customer_id: {
        type: String,
        required: [true, 'Customer ID is required'],
        trim: true
    },
    order_id: {
        type: String,
        required: [true, 'Order ID is required'],
        trim: true
    },
    job_id: {
        type: String,
        required: [true, 'Job ID is required'],
        trim: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },
    comments: {
        type: String,
        required: [true, 'Comments are required'],
        trim: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AllFeedback', SubmitFeedbackSchema);