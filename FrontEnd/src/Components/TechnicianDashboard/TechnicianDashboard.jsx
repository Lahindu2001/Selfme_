import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TechnicianLayout from './TechnicianLayout';
import './TechnicianDashboard.css';

function TechnicianDashboard() {
  const navigate = useNavigate();
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
  const firstName = authUser.firstName || 'Technician';

  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('TechnicianDashboard mounted, fetching payments...');
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    setError('');
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

  // Filter payments to show only pending ones
  const pendingPayments = payments.filter((payment) => payment?.status === 'Pending');

  const handleLogout = () => {
    localStorage.removeItem('authUser');
    navigate('/login');
  };

  return (
    <TechnicianLayout firstName={firstName} handleLogout={handleLogout}>
      <div id="technicianDashboard" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Technician Dashboard - Pending Payments</h2>

        {isLoading && <p className="loading" style={{ textAlign: 'center' }}>Loading payments...</p>}
        {error && (
          <p
            className="error"
            style={{
              color: 'red',
              fontWeight: 'bold',
              backgroundColor: '#ffe6e6',
              padding: '10px',
              borderRadius: '4px',
              textAlign: 'center',
            }}
          >
            {error}
          </p>
        )}

        {/* Pending Payments Table */}
        <div className="pending-payment-list" style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '10px' }}>Pending Payments</h3>
          {pendingPayments.length === 0 && !isLoading ? (
            <p style={{ textAlign: 'center', color: '#666' }}>No pending payments found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#ffc107', color: 'black' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Payment ID</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>User ID</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Customer</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Amount</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments.map((payment) => (
                  <tr
                    key={payment.payment_id}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
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
      </div>
    </TechnicianLayout>
  );
}

export default TechnicianDashboard;