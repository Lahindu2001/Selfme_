import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import TechnicianLayout from './TechnicianLayout';
import './TechnicianDashboard.css';

function TechnicianDashboard() {
  const navigate = useNavigate();
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
  const firstName = authUser.firstName || 'Technician';
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Company Information
  const companyInfo = {
    name: 'SelfMe',
    tagline: 'FUTURE OF SUN - SOLAR POWER',
    address: ['No/346, Madalanda, Dompe,', 'Colombo, Sri Lanka'],
    phone: '+94 717 882 883',
    email: 'Selfmepvtltd@gmail.com',
    website: 'www.selfme.com',
  };

  // Fetch payments and save to mypaidtask on component mount
  useEffect(() => {
    console.log('TechnicianDashboard mounted, fetching payments...');
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No token found');
        return;
      }
      const res = await axios.get('http://localhost:5000/api/finance/payments', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      const paymentData = Array.isArray(res.data) ? res.data : [];
      // Filter only Paid payments
      const paidPayments = paymentData.filter((payment) => payment?.status === 'Paid');
      setPayments(paidPayments);
      console.log('✅ Paid payments fetched:', paidPayments.length, paidPayments);

      // Save paid payments to mypaidtask
      await saveToMyPaidTask(paidPayments);
    } catch (err) {
      console.error('💥 Payment fetch error:', err.response?.data, err.message);
    } finally {
      setIsLoading(false);
      console.log('Fetch payments complete, isLoading:', false);
    }
  };

  const saveToMyPaidTask = async (payments) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No token found for saving paid tasks');
        return;
      }

      // Map payments to the format expected by mypaidtask
      const tasks = payments.map((payment) => ({
        paymentId: payment.payment_id || 'N/A',
        userId: payment.customer_id?.userid || 'N/A',
        customer: `${payment.customer_id?.firstName || 'Unknown'} ${payment.customer_id?.lastName || ''}`.trim(),
        amount: payment.amount || 0,
        paymentDate: payment.payment_date || new Date(),
        status: payment.status || 'Paid',
        statusofmy: 'notyet', // Default value
      }));

      const res = await axios.post('http://localhost:5000/api/tech/paidtasks', tasks, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      console.log('✅ Paid tasks saved:', res.data);
    } catch (err) {
      console.error('❌ Error saving paid tasks:', err.response?.data, err.message);
    }
  };

  // Logo Conversion
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

  // PDF Generation
  const generatePDF = async (data, title) => {
    if (!data.length) return alert('No payments to download!');
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
        const footerText = `Generated by ${companyInfo.name} Task Management System`;
        doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });
        const recordText = lastRecordIdx >= 0 ? `Payment #${String(lastRecordIdx + 1).padStart(3, '0')}` : '';
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

      const fields = ['payment_id', 'customer_id.userid', 'customer', 'amount', 'payment_date', 'status'];
      let totalPages = 1;
      let tempY = 50;
      let lastRecordIdxPerPage = [];
      let currentPageRecords = [];

      data.forEach((_, idx) => {
        let itemHeight = fields.length * 10 + 20;
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

      data.forEach((payment, idx) => {
        let itemHeight = fields.length * 10 + 20;
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
        doc.text(`Payment #${String(idx + 1).padStart(3, '0')}`, 15, y);
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        y += 10;
        doc.setLineWidth(0.3);
        doc.setDrawColor(150, 150, 150);
        doc.rect(15, y, pageWidth - 30, fields.length * 10 + 5, 'S');
        y += 5;
        fields.forEach((field) => {
          let label = field.replace(/([A-Z])/g, ' $1').replace(/\./g, ' ').trim().replace(/\b\w/g, (l) => l.toUpperCase());
          let value;
          if (field === 'customer_id.userid') {
            value = payment.customer_id?.userid || 'N/A';
          } else if (field === 'customer') {
            value = `${payment.customer_id?.firstName || 'Unknown'} ${payment.customer_id?.lastName || ''}`.trim();
          } else if (field === 'payment_date') {
            value = payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-GB') : 'N/A';
          } else if (field === 'amount') {
            value = `Rs. ${payment.amount?.toLocaleString() || '0'}`;
          } else {
            value = payment[field] || 'N/A';
          }
          if (typeof value === 'string' && value.length > 50) {
            value = value.substring(0, 47) + '...';
          }
          doc.setFont('times', 'bold');
          doc.text(`${label}:`, 20, y);
          doc.setFont('times', 'normal');
          doc.text(String(value), 60, y);
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
      const fileName = `${companyInfo.name}_${title.replace(/\s+/g, '_')}_${timestamp}.pdf`;
      doc.save(fileName);
      alert(`Official report "${fileName}" downloaded successfully!`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Download Functions
  const handleDownloadAll = () => generatePDF(payments, 'Approved Payments Report');
  const handleDownloadSingle = (payment) => generatePDF([payment], `Payment Report - ${payment.payment_id || 'Unnamed'}`);

  // Filtered Payments
  const filteredPayments = payments.filter(
    (payment) =>
      (payment.payment_id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (payment.customer_id?.userid?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (`${payment.customer_id?.firstName || ''} ${payment.customer_id?.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (String(payment.amount) || '').includes(searchTerm)
  );

  const handleLogout = () => {
    localStorage.removeItem('authUser');
    navigate('/login');
  };

  return (
    <TechnicianLayout firstName={firstName} handleLogout={handleLogout}>
      <div id="technicianDashboard" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Technician Dashboard - Approved Payments</h2>

        {isLoading && <p className="loading" style={{ textAlign: 'center' }}>Loading payments...</p>}

        <div id="search-bar">
          <input
            type="text"
            placeholder="Search by Payment ID, User ID, Customer, or Amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', fontSize: '14px', marginBottom: '20px' }}
          />
        </div>

        <div id="download-options">
          <h3 id="download-options-title">Official Report Generation</h3>
          <div id="download-buttons">
            <button id="download-all-btn" onClick={handleDownloadAll}>
              Download Directory ({payments.length} payments)
            </button>
            <p id="download-note">
              Reports include official letterhead with {companyInfo.name} branding and contact details.
            </p>
          </div>
        </div>

        <div className="approved-payment-list" style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '10px' }}>Approved Payments</h3>
          <div id="table-header">
            <span id="table-payment-count">Total Payments: {payments.length}</span>
            <span id="filtered-count">
              {searchTerm && `(Showing ${filteredPayments.length} filtered results)`}
            </span>
          </div>
          {filteredPayments.length === 0 && !isLoading ? (
            <p style={{ textAlign: 'center', color: '#666' }}>
              No approved payments found matching your search criteria.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#28a745', color: 'white' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Payment ID</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>User ID</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Customer</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Amount</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Payment Date</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.payment_id}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                    }}
                  >
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{payment.payment_id || 'N/A'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{payment.customer_id?.userid || 'N/A'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {`${payment.customer_id?.firstName || 'Unknown'} ${payment.customer_id?.lastName || ''}`.trim()}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      Rs. {payment.amount?.toLocaleString() || '0'}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{payment.status || 'N/A'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      <button
                        className="action-btn download-btn"
                        onClick={() => handleDownloadSingle(payment)}
                        title="Download Payment Report"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {filteredPayments.length === 0 && searchTerm && (
            <div id="no-payments-message">
              <button id="clear-search-btn" onClick={() => setSearchTerm('')}>
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>
    </TechnicianLayout>
  );
}

export default TechnicianDashboard;