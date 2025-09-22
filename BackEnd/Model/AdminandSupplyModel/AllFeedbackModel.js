// 1) Model = BackEnd > Model > AdminandSupplyModel > AllFeedbackModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('./counterModel');
const allFeedbackSchema = new Schema({
  feedback_id: { type: Number, unique: true },
  customer_id: {
    type: Number,
    required: true
  },
  order_id: {
    type: Number,
    required: true
  },
  job_id: {
    type: Number,
    required: true
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
    maxlength: 500
  },
  reply: {
    type: String,
    default: 'In Process'
  },
  created_at: { type: Date, default: Date.now }
});
// Pre-save hook to auto-increment feedback_id
allFeedbackSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'feedback_id',
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.feedback_id = counter.sequence_value;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});
module.exports = mongoose.model("Feedback", allFeedbackSchema);