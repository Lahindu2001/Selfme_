import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    console.log('Component mounted, fetching payments...');
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view payments');
        console.warn('⚠️ No token found');
        return;
      }
      const res = await axios.get('http://localhost:5000/api/finance/payments', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      const paymentData = Array.isArray(res.data) ? res.data : [];
      setPayments(paymentData);
      console.log('✅ Payments fetched:', paymentData.length, paymentData);
    } catch (err) {
      console.error('💥 Payment fetch error:', err.response?.data, err.message);
      setError(err.response?.data?.message || 'Failed to load payments.');
    } finally {
      setIsLoading(false);
      console.log('Fetch payments complete, isLoading:', false);
    }
  };

  const handleSelectPayment = (payment) => {
    setSelectedPayment(payment);
    setError('');
    setSuccessMessage('');
    console.log('Selected payment:', payment?.payment_id, payment);
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedPayment) {
      setError('No payment selected');
      console.warn('⚠️ No payment selected for status update');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      console.log('Updating status for payment_id:', selectedPayment.payment_id, 'to', status);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token missing. Please login again.');
        console.warn('⚠️ No token found for status update');
        return;
      }
      const res = await axios.put(
        `http://localhost:5000/api/finance/payments/status/${selectedPayment.payment_id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );
      console.log('Backend response:', res.data);
      if (res.data.payment && res.data.payment.payment_id) {
        const updatedPayment = {
          ...res.data.payment,
          customer_id: res.data.payment.customer_id || { firstName: 'Unknown', lastName: '', email: '', userid: '' }
        };
        setPayments(payments.map(p =>
          p.payment_id === selectedPayment.payment_id ? updatedPayment : p
        ));
        setSelectedPayment(updatedPayment);
        setSuccessMessage(`Payment ${selectedPayment.payment_id} marked as ${status}`);
        console.log('✅ Status updated:', selectedPayment.payment_id, status, updatedPayment);
      } else {
        setError('Invalid response from server: missing payment data');
        console.error('❌ Invalid response structure:', res.data);
      }
    } catch (err) {
      console.error('❌ Status update error:', err.response?.data, err.message);
      setError(err.response?.data?.message || 'Failed to update payment status.');
    } finally {
      setIsLoading(false);
      console.log('Status update complete, isLoading:', false, 'selectedPayment:', selectedPayment);
    }
  };

  const generateReceiptPDF = () => {
    if (!selectedPayment || selectedPayment.status !== 'Paid') {
      setError('Select a paid payment to generate receipt');
      console.warn('⚠️ Invalid payment for receipt:', selectedPayment?.status);
      return;
    }
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Payment Receipt', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Receipt ID: REC${selectedPayment.payment_id}`, 20, 40);
      doc.text(
        `Customer: ${selectedPayment.customer_id?.firstName || 'Unknown'} ${selectedPayment.customer_id?.lastName || ''}`,
        20,
        50
      );
      doc.text(`User ID: ${selectedPayment.customer_id?.userid || 'N/A'}`, 20, 60);
      doc.text(`Email: ${selectedPayment.customer_id?.email || ''}`, 20, 70);
      doc.text(`Payment ID: ${selectedPayment.payment_id}`, 20, 80);
      doc.text(`Amount Paid: Rs. ${selectedPayment.amount?.toLocaleString() || '0'}`, 20, 90);
      doc.text(`Payment Date: ${new Date(selectedPayment.payment_date).toLocaleDateString()}`, 20, 100);
      doc.text('Payment Method: Bank Transfer', 20, 110);
      doc.text('Thank you for your payment!', 105, 130, { align: 'center' });
      doc.save(`receipt_${selectedPayment.payment_id}.pdf`);
      setSuccessMessage('Receipt generated and downloaded.');
      console.log('✅ Receipt generated for:', selectedPayment.payment_id);
    } catch (err) {
      console.error('❌ Receipt generation error:', err.message);
      setError('Failed to generate receipt.');
    }
  };

  console.log('Rendering Payments component, payments:', payments.length, 'selectedPayment:', selectedPayment?.payment_id);
  return (
    <div className="payments-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Payment Management</h2>
      {isLoading && <p className="loading" style={{ textAlign: 'center' }}>Loading payments...</p>}
      {error && <p className="error" style={{ color: 'red', fontWeight: 'bold', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>{error}</p>}
      {successMessage && <p className="success" style={{ color: 'green', fontWeight: 'bold', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>{successMessage}</p>}
      <div className="payment-list">
        <h3 style={{ marginBottom: '10px' }}>Payments</h3>
        {payments.length === 0 && !isLoading ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No payments found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ backgroundColor: '#007BFF', color: 'white' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Payment ID</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>User ID</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Customer</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Amount</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr
                  key={payment.payment_id}
                  onClick={() => handleSelectPayment(payment)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedPayment?.payment_id === payment.payment_id ? '#e9ecef' : 'white',
                    border: '1px solid #ddd'
                  }}
                >
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{payment.payment_id || 'N/A'}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{payment.customer_id?.userid || 'N/A'}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {payment.customer_id?.firstName || 'Unknown'} {payment.customer_id?.lastName || ''}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    Rs. {payment.amount?.toLocaleString() || '0'}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{payment.status || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {selectedPayment ? (
        <div className="payment-details" style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '15px' }}>Payment Details</h3>
          <p><strong>Payment ID:</strong> {selectedPayment.payment_id || 'N/A'}</p>
          <p><strong>User ID:</strong> {selectedPayment.customer_id?.userid || 'N/A'}</p>
          <p><strong>Customer:</strong> {selectedPayment.customer_id?.firstName || 'Unknown'} {selectedPayment.customer_id?.lastName || ''}</p>
          <p><strong>Email:</strong> {selectedPayment.customer_id?.email || 'N/A'}</p>
          <p><strong>Amount:</strong> Rs. {selectedPayment.amount?.toLocaleString() || '0'}</p>
          <p><strong>Status:</strong> {selectedPayment.status || 'N/A'}</p>
          <p><strong>Payment Date:</strong> {selectedPayment.payment_date ? new Date(selectedPayment.payment_date).toLocaleDateString() : 'N/A'}</p>
          {selectedPayment.reference_no && (
            <div>
              <h4 style={{ marginTop: '15px' }}>Bank Slip</h4>
              {selectedPayment.reference_no.endsWith('.pdf') ? (
                <a
                  href={`http://localhost:5000${selectedPayment.reference_no}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#007BFF', textDecoration: 'underline' }}
                >
                  View PDF Bank Slip
                </a>
              ) : (
                <img
                  src={`http://localhost:5000${selectedPayment.reference_no}`}
                  alt="Bank Slip"
                  style={{ maxWidth: '500px', border: '1px solid #ddd', borderRadius: '4px' }}
                  onError={() => console.error('❌ Failed to load bank slip image:', selectedPayment.reference_no)}
                />
              )}
            </div>
          )}
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleUpdateStatus('Paid')}
              disabled={isLoading || selectedPayment.status === 'Paid'}
              style={{
                padding: '10px 20px',
                backgroundColor: selectedPayment.status === 'Paid' ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: selectedPayment.status === 'Paid' ? 'not-allowed' : 'pointer'
              }}
            >
              Mark as Paid
            </button>
            <button
              onClick={() => handleUpdateStatus('Failed')}
              disabled={isLoading || selectedPayment.status === 'Failed'}
              style={{
                padding: '10px 20px',
                backgroundColor: selectedPayment.status === 'Failed' ? '#6c757d' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: selectedPayment.status === 'Failed' ? 'not-allowed' : 'pointer'
              }}
            >
              Mark as Failed
            </button>
            <button
              onClick={generateReceiptPDF}
              disabled={isLoading || selectedPayment.status !== 'Paid'}
              style={{
                padding: '10px 20px',
                backgroundColor: selectedPayment.status !== 'Paid' ? '#6c757d' : '#007BFF',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: selectedPayment.status !== 'Paid' ? 'not-allowed' : 'pointer'
              }}
            >
              Generate Receipt
            </button>
          </div>
        </div>
      ) : (
        <p className="no-selection" style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>
          Please select a payment to view details.
        </p>
      )}
    </div>
  );
};

export default Payments;