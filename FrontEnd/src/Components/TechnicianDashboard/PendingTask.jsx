import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TechnicianLayout from './TechnicianLayout';
import './CompletedTasks.css';

function PendingTasks() {
  const navigate = useNavigate();
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
  const firstName = authUser.firstName || 'Technician';
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch pending tasks on component mount
  useEffect(() => {
    console.log('PendingTasks mounted, fetching pending tasks...');
    fetchPendingTasks();
  }, []);

  const fetchPendingTasks = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No token found');
        return;
      }
      const res = await axios.get('http://localhost:5000/api/tech/paidtasks/pending', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      const taskData = Array.isArray(res.data) ? res.data : [];
      setTasks(taskData);
      console.log('✅ Pending tasks fetched:', taskData.length, taskData);
    } catch (err) {
      console.error('💥 Pending tasks fetch error:', err.response?.data, err.message);
    } finally {
      setIsLoading(false);
      console.log('Fetch pending tasks complete, isLoading:', false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authUser');
    navigate('/login');
  };

  return (
    <TechnicianLayout firstName={firstName} handleLogout={handleLogout}>
      <div id="pendingTasks" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Pending Tasks</h2>

        {isLoading && <p className="loading" style={{ textAlign: 'center' }}>Loading tasks...</p>}

        {/* Pending Tasks Table */}
        <div className="pending-tasks-list" style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '10px' }}>My Pending Tasks</h3>
          {tasks.length === 0 && !isLoading ? (
            <p style={{ textAlign: 'center', color: '#666' }}>No pending tasks found.</p>
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
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status of My</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.paymentId}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                    }}
                  >
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{task.paymentId || 'N/A'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{task.userId || 'N/A'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{task.customer || 'Unknown'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      Rs. {task.amount?.toLocaleString() || '0'}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {task.paymentDate ? new Date(task.paymentDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{task.status || 'N/A'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{task.statusofmy || 'pending'}</td>
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

export default PendingTasks;