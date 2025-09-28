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

  const handleLogout = () => {
    localStorage.removeItem('authUser');
    navigate('/login');
  };

  return (
    <TechnicianLayout firstName={firstName} handleLogout={handleLogout}>
      <div id="technicianDashboard" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Technician Dashboard - Approved Payments</h2>

        {isLoading && <p className="loading" style={{ textAlign: 'center' }}>Loading payments...</p>}

        {/* Approved Payments Table */}
        <div className="approved-payment-list" style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '10px' }}>Approved Payments</h3>
          {payments.length === 0 && !isLoading ? (
            <p style={{ textAlign: 'center', color: '#666' }}>No approved payments found.</p>
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
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
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
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}
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