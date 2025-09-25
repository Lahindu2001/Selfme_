import React, { useState } from 'react';
import { NavLink, useNavigate  } from 'react-router-dom';
import { removeAuthToken } from '../../utils/auth';
import './TechnicianManager.css';






function TechnicianManager() {
  // ------------------- STATES -------------------
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
  const firstName = authUser.firstName || 'Technician';

  // ------------------- COMPANY INFORMATION -------------------
  const companyInfo = {
    name: 'SelfMe',
    logo: '/newLogo.png',
  };

  // ------------------- TOGGLE SIDEBAR -------------------
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
    const handleLogout = () => {
      removeAuthToken();
      localStorage.removeItem('authUser');
      navigate('/login');
    };

  // ------------------- RENDER -------------------
  return (
    <div className="home-container technician-manager">
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
            <p className="sidebar-subtitle">Technician Manager Panel</p>
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {isSidebarOpen ? '✕' : '☰'}
          </button>
        </div>
        <ul className="sidebar-menu">
          <li>
            <NavLink
              to="/RegisterEmployee"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title="Register Employee"
            >
              <span className="icon">🛠️</span>
              <span className="text">Register Employee</span>
            </NavLink>
          </li>
        </ul>
        <div className="sidebar-user-info">
       
          <button className="logout-btn" onClick={handleLogout}>
            <span className="icon">🚪</span>
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
              <h1 className="dashboard-title">Technician Manager Dashboard</h1>
              <p className="dashboard-subtitle">Welcome to {companyInfo.name} Technician Manager Panel</p>
            </div>
            <div className="user-info">
              <span className="user-name">Welcome, {firstName}</span>
            </div>
          </div>
          <div className="card-grid">
            <div className="card">
               {/*
              <NavLink to="/RegisterEmployee" className={({ isActive }) => `activehome ${isActive ? 'active' : ''}`}>
                <h2>Register Employee</h2>
                <p>Register a new employee in the system.</p>
              </NavLink>*/}

              <NavLink to="/register-employee" className={({ isActive }) => `activehome ${isActive ? 'active' : ''}`}>
                <h2>Register Employee</h2>
                <p>Register a new employee in the system.</p>
              </NavLink>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default TechnicianManager;