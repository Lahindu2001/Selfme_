import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../../../utils/auth';
import axios from 'axios';
import jsPDF from 'jspdf';
import Nav from '../../Nav/Nav';
import './AllFeedback.css';

const URL = 'http://localhost:5000/all-feedback';

function AllFeedback() {
  const navigate = useNavigate();
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
  const firstName = authUser.firstName || 'Admin';
  
  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem('authUser');
    navigate('/login');
  };

  // ------------------- STATES -------------------
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddFeedbackForm, setShowAddFeedbackForm] = useState(false);
  const [selectedFields, setSelectedFields] = useState({
    customer_id: true,
    order_id: true,
    job_id: true,
    rating: true,
    comments: true,
    created_at: true,
    feedback_id: true,
  });

  const defaultInputs = {
    feedback_id: '',
    customer_id: '',
    order_id: '',
    job_id: '',
    rating: '',
    comments: '',
  };

  const [inputs, setInputs] = useState(defaultInputs);
  const [errors, setErrors] = useState({});

  // ------------------- COMPANY INFORMATION -------------------
  const companyInfo = {
    name: 'SelfMe',
    tagline: 'FUTURE OF SUN - SOLAR POWER',
    address: ['No/346, Madalanda, Dompe,', 'Colombo, Sri Lanka'],
    phone: '+94 717 882 883',
    email: 'Selfmepvtltd@gmail.com',
    website: 'www.selfme.com',
  };

  // ------------------- VALIDATION FUNCTIONS -------------------
  const validateFeedbackId = (value) => value !== '';
  const validateCustomerId = (value) => value === '' || /^\d+$/.test(value);
  const validateOrderId = (value) => value === '' || /^\d+$/.test(value);
  const validateJobId = (value) => value === '' || /^\d+$/.test(value);
  const validateRating = (value) => value === '' || (Number(value) >= 1 && Number(value) <= 5);
  const validateComments = (value) => value === '' || /^[a-zA-Z0-9\s,.]*$/.test(value);

  // ------------------- INPUT HANDLERS -------------------
  const handleFeedbackId = (e) => {
    const value = e.target.value;
    if (validateFeedbackId(value)) {
      setInputs((prev) => ({ ...prev, feedback_id: value }));
      setErrors((prev) => ({ ...prev, feedback_id: '' }));
    }
  };

  const handleCustomerId = (e) => {
    const value = e.target.value;
    if (validateCustomerId(value)) {
      setInputs((prev) => ({ ...prev, customer_id: value }));
      setErrors((prev) => ({ ...prev, customer_id: '' }));
    }
  };

  const handleOrderId = (e) => {
    const value = e.target.value;
    if (validateOrderId(value)) {
      setInputs((prev) => ({ ...prev, order_id: value }));
      setErrors((prev) => ({ ...prev, order_id: '' }));
    }
  };

  const handleJobId = (e) => {
    const value = e.target.value;
    if (validateJobId(value)) {
      setInputs((prev) => ({ ...prev, job_id: value }));
      setErrors((prev) => ({ ...prev, job_id: '' }));
    }
  };

  const handleRating = (e) => {
    const value = e.target.value;
    if (validateRating(value)) {
      setInputs((prev) => ({ ...prev, rating: value }));
      setErrors((prev) => ({ ...prev, rating: '' }));
    }
  };

  const handleComments = (e) => {
    const value = e.target.value;
    if (validateComments(value)) {
      setInputs((prev) => ({ ...prev, comments: value }));
      setErrors((prev) => ({ ...prev, comments: '' }));
    }
  };

  // ------------------- HANDLE KEY PRESS -------------------
  const handleKeyPress = (e, field) => {
    if (['customer_id', 'order_id', 'job_id', 'rating'].includes(field) && !/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
    if (field === 'comments' && !/[a-zA-Z0-9\s,.]/.test(e.key)) {
      e.preventDefault();
    }
  };

  // ------------------- ADD FEEDBACK -------------------
  const handleAddFeedback = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!validateFeedbackId(inputs.feedback_id)) newErrors.feedback_id = 'Valid Feedback ID required';
    if (!validateCustomerId(inputs.customer_id) || inputs.customer_id === '') newErrors.customer_id = 'Valid Customer ID required';
    if (!validateOrderId(inputs.order_id) || inputs.order_id === '') newErrors.order_id = 'Valid Order ID required';
    if (!validateJobId(inputs.job_id) || inputs.job_id === '') newErrors.job_id = 'Valid Job ID required';
    if (!validateRating(inputs.rating) || inputs.rating === '') newErrors.rating = 'Rating must be between 1 and 5';
    if (!validateComments(inputs.comments) || inputs.comments === '') newErrors.comments = 'Valid comments required';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await axios.post(URL, { ...inputs });
      setFeedbacks([...feedbacks, res.data]);
      setInputs(defaultInputs);
      setShowAddFeedbackForm(false);
      setErrors({});
      alert('Feedback added successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Error adding feedback:', err);
      setErrors({ submit: err.response?.data?.message || 'Failed to add feedback' });
    }
  };

  // ------------------- DELETE FEEDBACK -------------------
  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await axios.delete(`${URL}/${id}`);
      setFeedbacks(feedbacks.filter((r) => r._id !== id));
      alert('Feedback deleted successfully!');
    } catch (err) {
      console.error('Error deleting feedback:', err);
      alert('Failed to delete feedback!');
    }
  };

  // ------------------- FETCH FEEDBACKS -------------------
  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(URL);
      setFeedbacks(res.data.feedbacks || []);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setFeedbacks([]);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // ------------------- LOGO CONVERSION -------------------
  const getLogoAsBase64 = () => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const base64 = canvas.toDataURL('image/png');
        resolve(base64);
      };
      img.onerror = () => {
        console.warn('Could not load logo, proceeding without it');
        resolve(null);
      };
      img.src = '/newLogo.png';
    });
  };

  // ------------------- OFFICIAL PDF GENERATION -------------------
  const generatePDF = async (data, title) => {
    if (!data.length) return alert('No feedbacks to download!');
    try {
      const logoBase64 = await getLogoAsBase64();
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const addLetterhead = () => {
        if (logoBase64) {
          doc.addImage(logoBase64, 'PNG', 15, 10, 20, 20);
        }
        doc.setFont('times', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(companyInfo.name, pageWidth / 2, 20, { align: 'center' });
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text(companyInfo.address.join(', '), pageWidth / 2, 28, { align: 'center' });
        doc.text(`Phone: ${companyInfo.phone} | Email: ${companyInfo.email} | Website: ${companyInfo.website}`, pageWidth / 2, 34, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 0, 0);
        doc.line(15, 40, pageWidth - 15, 40);
      };

      const addFooter = (pageNum, totalPages, lastRecordIdx) => {
        doc.setFont('times', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 50);
        doc.setLineWidth(0.3);
        doc.setDrawColor(150, 150, 150);
        doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
        const footerText = `Generated by ${companyInfo.name} Feedback Management System`;
        doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });
        const recordText = lastRecordIdx >= 0 ? `Feedback #${String(lastRecordIdx + 1).padStart(3, '0')}` : '';
        doc.text(`Page ${pageNum} of ${totalPages} | ${recordText}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
        const genDate = new Date().toLocaleDateString('en-GB');
        const genTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
        doc.text(`Generated on ${genDate} at ${genTime}`, 15, pageHeight - 10);
      };

      const addSignatureField = () => {
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text('Authorized Signature: __________________', pageWidth - 85, pageHeight - 30);
      };

      let totalPages = 1;
      let tempY = 50;
      let lastRecordIdxPerPage = [];
      let currentPageRecords = [];
      
      data.forEach((_, idx) => {
        let fieldsCount = Object.keys(selectedFields).filter((field) => selectedFields[field]).length;
        let itemHeight = fieldsCount * 10 + 20;
        if (tempY + itemHeight > pageHeight - 40) {
          totalPages++;
          lastRecordIdxPerPage.push(currentPageRecords[currentPageRecords.length - 1] || -1);
          currentPageRecords = [];
          tempY = 50;
        }
        currentPageRecords.push(idx);
        tempY += itemHeight;
      });
      lastRecordIdxPerPage.push(currentPageRecords[currentPageRecords.length - 1] || -1);

      let currentPage = 1;
      let y = 50;
      addLetterhead();
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(title, pageWidth / 2, 45, { align: 'center' });

      data.forEach((feedback, idx) => {
        let fieldsCount = Object.keys(selectedFields).filter((field) => selectedFields[field]).length;
        let itemHeight = fieldsCount * 10 + 20;
        if (y + itemHeight > pageHeight - 40) {
          addSignatureField();
          addFooter(currentPage, totalPages, lastRecordIdxPerPage[currentPage - 1]);
          doc.addPage();
          currentPage++;
          addLetterhead();
          y = 50;
        }
        doc.setFont('times', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Feedback #${String(idx + 1).padStart(3, '0')}`, 15, y);
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text(`Feedback ID: ${feedback.feedback_id || 'N/A'}`, pageWidth - 50, y);
        y += 10;
        doc.setLineWidth(0.3);
        doc.setDrawColor(150, 150, 150);
        doc.rect(15, y, pageWidth - 30, fieldsCount * 10 + 5, 'S');
        y += 5;

        Object.keys(selectedFields).forEach((field) => {
          if (selectedFields[field]) {
            let label = field.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
            let value = feedback[field] || 'N/A';
            if (field === 'created_at') {
              value = new Date(value).toLocaleDateString('en-GB');
            }
            if (typeof value === 'string' && value.length > 50) {
              value = value.substring(0, 47) + '...';
            }
            doc.setFont('times', 'bold');
            doc.text(`${label}:`, 20, y);
            doc.setFont('times', 'normal');
            doc.text(String(value), 60, y);
            y += 10;
          }
        });
        y += 5;
        if (idx < data.length - 1) {
          doc.setLineWidth(0.2);
          doc.setDrawColor(200, 200, 200);
          doc.line(15, y, pageWidth - 15, y);
          y += 5;
        }
      });

      addSignatureField();
      addFooter(currentPage, totalPages, lastRecordIdxPerPage[currentPage - 1]);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `${companyInfo.name}_${title.replace(/\s+/g, '_')}_${timestamp}.pdf`;
      doc.save(fileName);
      alert(`Official report "${fileName}" downloaded successfully!`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // ------------------- DOWNLOAD FUNCTIONS -------------------
  const handleDownloadAll = () => generatePDF(feedbacks, 'Feedback Directory Report');
  const handleDownloadSingle = (feedback) => generatePDF([feedback], `Feedback Report - ${feedback.feedback_id || 'Unnamed'}`);

  // ------------------- FILTERED FEEDBACKS -------------------
  const filteredFeedbacks = feedbacks.filter(
    (feedback) =>
      (String(feedback.customer_id) || '').includes(searchTerm) ||
      (String(feedback.order_id) || '').includes(searchTerm) ||
      (String(feedback.job_id) || '').includes(searchTerm) ||
      (String(feedback.rating) || '').includes(searchTerm) ||
      (feedback.comments?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (String(feedback.feedback_id) || '').includes(searchTerm)
  );

  // ------------------- RENDER -------------------
  return (
    <div className="all-feedback-container">
      <Nav firstName={firstName} handleLogout={handleLogout} />
      <div className="all-feedback-section">
        <div className="title-container">
          <h2 className="Title">Feedback Management System</h2>
          <p className="subtitle">{companyInfo.name} - {companyInfo.tagline}</p>
        </div>

          {/*form*/}
        <button
          className="add-user-toggle"
          onClick={() => setShowAddFeedbackForm(!showAddFeedbackForm)}
        >
          {showAddFeedbackForm ? '✕ Hide Add Feedback Form' : '➕ Show Add Feedback Form'}
        </button>

        {showAddFeedbackForm && (
          <div className="add-user-container">
            <h3>Add New Feedback</h3>
            <form className="add-user-form" onSubmit={handleAddFeedback}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Feedback ID"
                  value={inputs.feedback_id}
                  onChange={handleFeedbackId}
                  required
                />
                {errors.feedback_id && <p className="error">{errors.feedback_id}</p>}
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Customer ID"
                  value={inputs.customer_id}
                  onChange={handleCustomerId}
                  onKeyPress={(e) => handleKeyPress(e, 'customer_id')}
                  required
                />
                {errors.customer_id && <p className="error">{errors.customer_id}</p>}
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Order ID"
                  value={inputs.order_id}
                  onChange={handleOrderId}
                  onKeyPress={(e) => handleKeyPress(e, 'order_id')}
                  required
                />
                {errors.order_id && <p className="error">{errors.order_id}</p>}
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Job ID"
                  value={inputs.job_id}
                  onChange={handleJobId}
                  onKeyPress={(e) => handleKeyPress(e, 'job_id')}
                  required
                />
                {errors.job_id && <p className="error">{errors.job_id}</p>}
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Rating (1-5)"
                  value={inputs.rating}
                  onChange={handleRating}
                  onKeyPress={(e) => handleKeyPress(e, 'rating')}
                  required
                />
                {errors.rating && <p className="error">{errors.rating}</p>}
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Comments"
                  value={inputs.comments}
                  onChange={handleComments}
                  onKeyPress={(e) => handleKeyPress(e, 'comments')}
                  required
                />
                {errors.comments && <p className="error">{errors.comments}</p>}
              </div>
              <button type="submit" className="submit-btn">
                Add Feedback
              </button>
              {errors.submit && <p className="error">{errors.submit}</p>}
            </form>
          </div>
        )}
{/*form off*/}
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search by Feedback ID, Customer ID, Order ID, Job ID, Rating, Comments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="download-options professional-section">
          <h3>Official Report Generation</h3>
          <p>Select the fields to include in your official report:</p>
          <div className="field-checkboxes">
            {Object.keys(selectedFields).map((field) => (
              <label key={field} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedFields[field]}
                  onChange={() =>
                    setSelectedFields((prev) => ({ ...prev, [field]: !prev[field] }))
                  }
                />
                <span>
                  {field.replace('_', ' ').replace(/([A-Z])/g, ' $1').trim().replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
          <div className="download-buttons">
            <button className="download-all-btn" onClick={handleDownloadAll}>
              Download Directory ({feedbacks.length} feedbacks)
            </button>
            <p className="download-note">
              Reports include official letterhead with {companyInfo.name} branding and contact details.
            </p>
          </div>
        </div>

        <div className="users-table-container">
          <div className="table-header">
            <span className="table-user-count">Total Feedbacks: {feedbacks.length}</span>
            <span className="filtered-count">
              {searchTerm && `(Showing ${filteredFeedbacks.length} filtered results)`}
            </span>
          </div>
          <table className="users-table">
            <thead>
              <tr>
                <th>Feedback ID</th>
                {Object.keys(defaultInputs).map((field) => (
                  <th key={field}>
                    {field.replace('_', ' ').replace(/([A-Z])/g, ' $1').trim().replace(/\b\w/g, (l) => l.toUpperCase())}
                  </th>
                ))}
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map((feedback) => (
                <tr key={feedback._id}>
                  <td>{feedback.feedback_id || 'N/A'}</td>
                  {Object.keys(defaultInputs).map((field) => (
                    <td key={field}>
                      {feedback[field] || 'N/A'}
                    </td>
                  ))}
                  <td>{new Date(feedback.created_at).toLocaleDateString('en-GB')}</td>
                  <td className="actions-cell">
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteFeedback(feedback._id)}
                      title="Delete Feedback"
                    >
                    delete
                    </button>
                    <button
                      className="action-btn download-btn"
                      onClick={() => handleDownloadSingle(feedback)}
                      title="Download Feedback Report"
                    >
                     download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredFeedbacks.length === 0 && (
            <div className="no-users-message">
              <p>No feedbacks found matching your search criteria.</p>
              {searchTerm && (
                <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllFeedback;