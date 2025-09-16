import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../../utils/auth';
import "./Admin.css";
function Admin() {
  const navigate = useNavigate();
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
  const firstName = authUser.firstName || 'Admin';
  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem('authUser');
    navigate('/login');
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
            <Link to="/SupplyProducts" className="activehome">
              <h2>Supply Products</h2>
              <p>Manage supply product inventory and details.</p>
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