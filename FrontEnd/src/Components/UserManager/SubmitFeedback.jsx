import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Nav/Navbar';
import Footer from '../Footer/Footer';
import './SubmitFeedback.css';

function SubmitFeedback() {
  const navigate = useNavigate();
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
  console.log('authUser in SubmitFeedback:', authUser); // Debug log
  const customer_id = authUser.userid || authUser._id || ''; // Prefer userid, fallback to _id

  const [formData, setFormData] = useState({
    feedback_id: '',
    customer_id: customer_id,
    order_id: '',
    job_id: '',
    rating: 1,
    comments: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setError(null); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to submit feedback.');
      navigate('/login');
      return;
    }

    if (!formData.feedback_id || !formData.customer_id || !formData.order_id || !formData.job_id || !formData.rating || !formData.comments) {
      setError('All fields are required');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/feedback',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSuccess('Feedback submitted successfully!');
      setError(null);
      setFormData({
        feedback_id: '',
        customer_id: customer_id,
        order_id: '',
        job_id: '',
        rating: 1,
        comments: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
      setSuccess(null);
    }
  };

  return (
    <div id="submit-feedback-container">
      <Navbar />
      <h2 id="submit-feedback-title">Submit Your Feedback</h2>
      <div id="submit-feedback-form-container">
        {error && <p id="submit-feedback-error">{error}</p>}
        {success && <p id="submit-feedback-success">{success}</p>}
        <form id="submit-feedback-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="feedback_id">Feedback ID</label>
            <input
              type="text"
              id="feedback_id"
              name="feedback_id"
              value={formData.feedback_id}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="customer_id">Customer ID</label>
            <input
              type="text"
              id="customer_id"
              name="customer_id"
              value={formData.customer_id}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="order_id">Order ID</label>
            <input
              type="text"
              id="order_id"
              name="order_id"
              value={formData.order_id}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="job_id">Job ID</label>
            <input
              type="text"
              id="job_id"
              name="job_id"
              value={formData.job_id}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="rating">Rating (1-5)</label>
            <select
              id="rating"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              required
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="comments">Comments</label>
            <textarea
              id="comments"
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <button type="submit" id="submit-feedback-button">
            Submit Feedback
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default SubmitFeedback;