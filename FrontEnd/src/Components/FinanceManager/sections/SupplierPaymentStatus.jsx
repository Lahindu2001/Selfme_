import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import './SupplierPaymentStatus.css';

const SupplierPaymentStatus = () => {
  const [productRequests, setProductRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('Monthly');
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().toLocaleString('default', { month: 'long' }) + ' ' + new Date().getFullYear(),
    year: new Date().getFullYear(),
  });

  // Company information (replace with your actual data)
  const companyInfo = {
    name: 'Your Company Name',
    address: ['123 Business Street', 'Finance City, FC 12345'],
    phone: '+91-123-456-7890',
    email: 'contact@yourcompany.com',
    website: 'www.yourcompany.com',
  };

  // Fetch all product requests
  useEffect(() => {
    const fetchProductRequests = async () => {
      try {
        console.log('Fetching product requests from http://localhost:5000/api/finance/financial/product-requests');
        const response = await axios.get('http://localhost:5000/api/finance/financial/product-requests', {
          headers: {
            'Content-Type': 'application/json',
            // Add authorization header if needed, e.g., Authorization: `Bearer ${localStorage.getItem('token')}`
          },
        });
        console.log('API Response:', response.data);
        console.log('Response type:', Array.isArray(response.data) ? 'Array' : typeof response.data);
        console.log('Response length:', Array.isArray(response.data) ? response.data.length : 0);
        setProductRequests(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product requests:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          statusText: err.response?.statusText,
        });
        setError(
          err.response?.status === 404
            ? 'Endpoint not found. Please check if the backend route /api/finance/financial/product-requests is correctly set up.'
            : err.response?.data?.message || 'Failed to fetch product requests'
        );
        setLoading(false);
      }
    };
    fetchProductRequests();
  }, []);

  // Handle financial status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      console.log(`Updating financial status for ID: ${id} to ${newStatus}`);
      const response = await axios.put(
        `http://localhost:5000/api/finance/financial/product-requests/${id}/financial-status`,
        { financial_status: newStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            // Add authorization header if needed
          },
        }
      );
      console.log('Update Response:', response.data);
      setProductRequests((prev) =>
        prev.map((req) =>
          req._id === id ? response.data.updatedProductRequest : req
        )
      );
      alert('Financial status updated successfully');
    } catch (err) {
      console.error('Error updating financial status:', err);
      setError(err.response?.data?.message || 'Failed to update financial status');
    }
  };

  // Logo conversion
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

  // PDF generation
  const generatePDF = async (data, title) => {
    if (!data.length) return alert('No data to download!');
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
        const footerText = `Generated by ${companyInfo.name} Payment Management System`;
        doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });
        const recordText = lastRecordIdx >= 0 ? `Request #${String(lastRecordIdx + 1).padStart(3, '0')}` : '';
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
        let fieldsCount = 6; // supplier_name, product_item, quantity, total_cost, need_date, financial_status
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
      doc.text(`${title} - ${reportType === 'Monthly' ? selectedPeriod.month : selectedPeriod.year}`, pageWidth / 2, 45, { align: 'center' });
      data.forEach((request, idx) => {
        let itemHeight = 6 * 10 + 20;
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
        doc.text(`Request #${String(idx + 1).padStart(3, '0')}`, 15, y);
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text(`Request ID: ${request._id || 'N/A'}`, pageWidth - 50, y);
        y += 10;
        doc.setLineWidth(0.3);
        doc.setDrawColor(150, 150, 150);
        doc.rect(15, y, pageWidth - 30, 6 * 10 + 5, 'S');
        y += 5;
        const fields = [
          { label: 'Supplier Name', value: request.supplier_name || 'N/A' },
          { label: 'Product Item', value: request.product_item || 'N/A' },
          { label: 'Quantity', value: request.quantity || 0 },
          { label: 'Total Cost', value: `Rs. ${request.total_cost?.toFixed(2) || '0.00'}` },
          { label: 'Need Date', value: request.need_date ? new Date(request.need_date).toLocaleDateString('en-GB') : 'N/A' },
          { label: 'Financial Status', value: request.financial_status || 'Pending' },
        ];
        fields.forEach((field) => {
          doc.setFont('times', 'bold');
          doc.text(`${field.label}:`, 20, y);
          doc.setFont('times', 'normal');
          doc.text(String(field.value), 60, y);
          y += 10;
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
      const fileName = `${companyInfo.name}_${title.replace(/\s+/g, '_')}_${reportType === 'Monthly' ? selectedPeriod.month.replace(/\s+/g, '_') : selectedPeriod.year}_${timestamp}.pdf`;
      doc.save(fileName);
      alert(`Official report "${fileName}" downloaded successfully!`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Download functions
  const handleDownloadPending = () => {
    const pendingData = productRequests.filter((req) => req.financial_status !== 'approved');
    generatePDF(pendingData, 'Pending Report');
  };

  const handleDownloadApproved = () => {
    const approvedData = productRequests.filter((req) => req.financial_status === 'approved');
    generatePDF(approvedData, 'Approved Report');
  };

  const handleDownloadAll = () => {
    generatePDF(productRequests, 'All Payments Report');
  };

  // Filter requests into pending/rejected and approved
  const pendingOrRejectedRequests = productRequests.filter(
    (request) => request.financial_status !== 'approved'
  );
  const approvedRequests = productRequests.filter(
    (request) => request.financial_status === 'approved'
  );

  if (loading) {
    return <div id="supplier-payment-loading" className="loading-container">Loading product requests...</div>;
  }

  if (error) {
    return (
      <div id="supplier-payment-error" className="error-container">
        <div id="error-message" className="error-message">{error}</div>
        <button
          id="error-retry-btn"
          onClick={() => window.location.reload()}
          className="retry-btn"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div id="supplier-payment-main-container" className="main-container">
      {/* Report Download Section */}
      <div id="report-controls-section" className="report-controls">
        <div id="report-controls-wrapper" className="controls-wrapper">
          <div id="report-type-selector" className="control-group">
            <label id="report-type-label" className="control-label">Report Type:</label>
            <select
              id="report-type-dropdown"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="control-select"
            >
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
          
          <div id="period-selector" className="control-group">
            <label id="period-selector-label" className="control-label">
              Select {reportType === 'Monthly' ? 'Month' : 'Year'}:
            </label>
            {reportType === 'Monthly' ? (
              <input
                id="month-selector-input"
                type="month"
                value={selectedPeriod.month.split(' ')[1] + '-' + selectedPeriod.month.split(' ')[0].toLowerCase().slice(0, 3)}
                onChange={(e) => {
                  const [year, month] = e.target.value.split('-');
                  setSelectedPeriod({ ...selectedPeriod, month: new Date(year, month - 1).toLocaleString('default', { month: 'long' }) + ' ' + year });
                }}
                className="control-input"
              />
            ) : (
              <input
                id="year-selector-input"
                type="number"
                value={selectedPeriod.year}
                onChange={(e) => setSelectedPeriod({ ...selectedPeriod, year: e.target.value })}
                min="2000"
                max="2100"
                className="control-input year-input"
              />
            )}
          </div>
        </div>
        
        <div id="download-buttons-section" className="download-buttons">
          <button
            id="download-pending-report-btn"
            onClick={handleDownloadPending}
            className="download-btn pending-btn"
          >
            Download Pending Report
          </button>
          <button
            id="download-approved-report-btn"
            onClick={handleDownloadApproved}
            className="download-btn approved-btn"
          >
            Download Approved Report
          </button>
          <button
            id="download-all-report-btn"
            onClick={handleDownloadAll}
            className="download-btn all-btn"
          >
            Download All Payments Report
          </button>
        </div>
      </div>

      {/* Pending/Rejected Requests Section */}
      <div id="pending-requests-section" className="table-section">
        <h2 id="pending-requests-title" className="section-title pending-title">
          Pending/Rejected Requests
        </h2>
        {pendingOrRejectedRequests.length === 0 ? (
          <div id="no-pending-requests-message" className="empty-state">
            <div id="no-pending-text" className="empty-text">
              No pending or rejected requests available
            </div>
            <button
              id="refresh-pending-requests-btn"
              onClick={() => window.location.reload()}
              className="refresh-btn"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div id="pending-requests-table-wrapper" className="table-wrapper">
            <table id="pending-requests-table" className="data-table">
              <thead id="pending-requests-table-head">
                <tr className="table-header-row pending-header">
                  <th id="pending-supplier-header" className="table-header">Supplier Name</th>
                  <th id="pending-product-header" className="table-header">Product Item</th>
                  <th id="pending-quantity-header" className="table-header">Quantity</th>
                  <th id="pending-cost-header" className="table-header">Total Cost</th>
                  <th id="pending-date-header" className="table-header">Need Date</th>
                  <th id="pending-status-header" className="table-header">Financial Status</th>
                  <th id="pending-actions-header" className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody id="pending-requests-table-body">
                {pendingOrRejectedRequests.map((request, index) => (
                  <tr key={request._id} id={`pending-request-row-${index}`} className="table-row pending-row">
                    <td id={`pending-supplier-${index}`} className="table-cell">{request.supplier_name || 'N/A'}</td>
                    <td id={`pending-product-${index}`} className="table-cell">{request.product_item || 'N/A'}</td>
                    <td id={`pending-quantity-${index}`} className="table-cell">{request.quantity || 0}</td>
                    <td id={`pending-cost-${index}`} className="table-cell cost-cell">Rs. {request.total_cost?.toFixed(2) || '0.00'}</td>
                    <td id={`pending-date-${index}`} className="table-cell">
                      {request.need_date
                        ? new Date(request.need_date).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td id={`pending-status-${index}`} className="table-cell status-cell">{request.financial_status || 'Pending'}</td>
                    <td id={`pending-actions-${index}`} className="table-cell actions-cell">
                      <select
                        id={`status-select-pending-${index}`}
                        value={request.financial_status || 'pending'}
                        onChange={(e) => handleStatusUpdate(request._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approved Requests Section */}
      <div id="approved-requests-section" className="table-section">
        <h2 id="approved-requests-title" className="section-title approved-title">
          Approved Requests
        </h2>
        {approvedRequests.length === 0 ? (
          <div id="no-approved-requests-message" className="empty-state">
            <div id="no-approved-text" className="empty-text">
              No approved requests available
            </div>
          </div>
        ) : (
          <div id="approved-requests-table-wrapper" className="table-wrapper">
            <table id="approved-requests-table" className="data-table">
              <thead id="approved-requests-table-head">
                <tr className="table-header-row approved-header">
                  <th id="approved-supplier-header" className="table-header">Supplier Name</th>
                  <th id="approved-product-header" className="table-header">Product Item</th>
                  <th id="approved-quantity-header" className="table-header">Quantity</th>
                  <th id="approved-cost-header" className="table-header">Total Cost</th>
                  <th id="approved-date-header" className="table-header">Need Date</th>
                  <th id="approved-status-header" className="table-header">Financial Status</th>
                </tr>
              </thead>
              <tbody id="approved-requests-table-body">
                {approvedRequests.map((request, index) => (
                  <tr key={request._id} id={`approved-request-row-${index}`} className="table-row approved-row">
                    <td id={`approved-supplier-${index}`} className="table-cell">{request.supplier_name || 'N/A'}</td>
                    <td id={`approved-product-${index}`} className="table-cell">{request.product_item || 'N/A'}</td>
                    <td id={`approved-quantity-${index}`} className="table-cell">{request.quantity || 0}</td>
                    <td id={`approved-cost-${index}`} className="table-cell cost-cell">Rs. {request.total_cost?.toFixed(2) || '0.00'}</td>
                    <td id={`approved-date-${index}`} className="table-cell">
                      {request.need_date
                        ? new Date(request.need_date).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td id={`approved-status-${index}`} className="table-cell status-cell approved-status">{request.financial_status || 'Approved'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierPaymentStatus;