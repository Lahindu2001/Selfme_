// 6) Updated admin.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../../utils/auth';
import '../Nav/Nav';
import './Admin.css';
function Admin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
  const firstName = authUser.firstName || 'Admin';
  const companyInfo = {
    name: 'SelfMe',
    logo: '/newLogo.png', // Logo from Nav.js
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem('authUser');
    navigate('/login');
  };
  return (
    <div className="home-container admin">
      {/* Left Sidebar */}
      <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img
            src={companyInfo.logo}
            alt={`${companyInfo.name} Logo`}
            className="sidebar-logo"
          />
          <div>
            <h2 className="sidebar-title">{companyInfo.name}</h2>
            <p className="sidebar-subtitle">Admin Panel</p>
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {isSidebarOpen ? '✕' : '☰'}
          </button>
        </div>
        <ul className="sidebar-menu">
          <li>
            <NavLink
              to="/mainAdminhome"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title="Admin Home"
            >
            
              <span className="text">Admin Home</span>
            </NavLink>
          </li>
        
          <li>
            <NavLink
              to="/AllUsers"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title="User Management"
            >
            
              <span className="text">User Management</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/AllFeedback"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title="Feedback Management"
            >
          
              <span className="text">All Feedback</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/AllEmployees"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title="Employee Management"
            >
            
              <span className="text">All Employees</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/ViewSupplyAll"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title="Supplier Management"
            >
            
              <span className="text">All Suppliers</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/GetSupplyAll"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title="Product Request Management"
            >
            
              <span className="text">All Product Requests</span>
            </NavLink>
          </li>
        </ul>
        <div className="sidebar-user-info">
     
          <button className="logout-btn" onClick={handleLogout}>
          
            <span className="text">Logout</span>
          </button>
        </div>
        <div className="sidebar-footer">
          <p>© {new Date().getFullYear()} {companyInfo.name}</p>
        </div>
      </nav>
      {/* Main Content Area */}
      <div className="main-content">
        <div className="dashboard">
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">Administrator Dashboard</h1>
              <p className="dashboard-subtitle">Welcome to {companyInfo.name} Admin Panel</p>
            </div>
            <div className="user-info">
              <span className="user-name">Welcome, {firstName}</span>
            </div>
          </div>
      
          <div className="card-grid">
             <div className="card">
              <NavLink to="/AllUsers" className={({ isActive }) => `activehome ${isActive ? 'active' : ''}`}>
                <h2>Users</h2>
                <p>Manage all users and their details.</p>
              </NavLink>
            </div>
          
            <div className="card">
              <NavLink to="/AllFeedback" className={({ isActive }) => `activehome ${isActive ? 'active' : ''}`}>
                <h2>All Feedback</h2>
                <p>Manage all feedbacks and replies.</p>
              </NavLink>
            </div>
            <div className="card">
              <NavLink to="/AllEmployees" className={({ isActive }) => `activehome ${isActive ? 'active' : ''}`}>
                <h2>All Employees</h2>
                <p>View all employee details.</p>
              </NavLink>
            </div>
           
            <div className="card">
              <NavLink to="/ViewSupplyAll" className={({ isActive }) => `activehome ${isActive ? 'active' : ''}`}>
                <h2>All Suppliers</h2>
                <p>View all supplier details.</p>
              </NavLink>
            </div>
            <div className="card">
              <NavLink to="/GetSupplyAll" className={({ isActive }) => `activehome ${isActive ? 'active' : ''}`}>
                <h2>All Product Requests</h2>
                <p>Manage all product requests and statuses.</p>
              </NavLink>
            </div>
            <div className="card">
              <NavLink to="#" className={({ isActive }) => `activehome ${isActive ? 'active' : ''}`}>
                <h2>test</h2>
                <p>Streamline supply orders, track requests, and manage inventory efficiently.</p>
              </NavLink>
            </div>
           
          </div>
        </div>
      </div>
    </div>
  );
}
export default Admin;