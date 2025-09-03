import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../../utils/auth'; // Import auth utility
import "./Admin.css";

function Admin() {
  const navigate = useNavigate(); // Hook for navigation
  // Retrieve user data from localStorage
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
  const firstName = authUser.firstName || 'Admin'; // Use firstName, default to 'Admin'

  const handleLogout = () => {
    removeAuthToken(); // Clear the token
    localStorage.removeItem('authUser'); // Clear user data
    navigate('/login'); // Navigate to login page
  };

  return (
    <div className="home-container">
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Administrator Dashboard</h1>
            <p className="dashboard-subtitle">Welcome to Solar ERP Admin Panel</p>
          </div>
          <div className="user-info">
            <span className="user-name">Welcome, {firstName}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <div className="card-grid">
          <div className="card">
            <Link to="/SupplyRequest" className="activehome">
              <h2>Supply Request</h2>
              <p>Streamline supply orders, track requests, and manage inventory efficiently.</p>
            </Link>
          </div>
          <div className="card">
            <h2>Test1</h2>
            <p>Test1</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
