import React from 'react';
import { useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../../utils/auth';
import './FinanceManager.css';

const FinanceManager = () => {
  const navigate = useNavigate();
  // Retrieve user data from localStorage
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
  const firstName = authUser.firstName || 'Finance'; // Use firstName, default to 'Finance'

  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem('authUser'); // Clear user data
    navigate('/login');
  };

  return (
    <div className="home-container">
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Finance Dashboard</h1>
            <p className="dashboard-subtitle">Welcome to Solar ERP Finance Management Panel</p>
          </div>
          <div className="user-info">
            <span className="user-name">Welcome, {firstName}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceManager;
