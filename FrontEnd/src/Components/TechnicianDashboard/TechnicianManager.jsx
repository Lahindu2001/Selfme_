import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../../utils/auth';
import './TechnicianManager.css';

const TechnicianManager = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
  const firstName = authUser.firstName || 'Technician';

  const companyInfo = {
    name: 'SelfMe',
    logo: '/newLogo.png',
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
    <div className="technician home-container">
      <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img
            src={companyInfo.logo}
            alt={`${companyInfo.name} Logo`}
            className="sidebar-logo"
          />
          <div>
            <h2 className="sidebar-title">{companyInfo.name}</h2>
            <p className="sidebar-subtitle">Technician Panel</p>
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {isSidebarOpen ? '✕' : '☰'}
          </button>
        </div>
        <ul className="sidebar-menu">
          <li>
            <NavLink
              to="#"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title="Test One"
            >
              <span className="icon">🛠️</span>
              <span className="text">Test One</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="#"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title="Test Two"
            >
              <span className="icon">🔧</span>
              <span className="text">Test Two</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="#"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title="Test Three"
            >
              <span className="icon">⚙️</span>
              <span className="text">Test Three</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="#"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title="Test Four"
            >
              <span className="icon">🔩</span>
              <span className="text">Test Four</span>
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
      <div className="main-content">
        <div className="dashboard">
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">Technician Dashboard</h1>
              <p className="dashboard-subtitle">{companyInfo.name} - FUTURE OF SUN - SOLAR POWER</p>
            </div>
            <div className="user-info">
              <span className="user-name">Welcome, {firstName}</span>
            </div>
          </div>
          <div className="card-grid">
            <div className="card">
              <NavLink to="#" className={({ isActive }) => `activehome ${isActive ? 'active' : ''}`}>
                <h2>Test One</h2>
                <p>Placeholder for Test One functionality.</p>
              </NavLink>
            </div>
            <div className="card">
              <NavLink to="#" className={({ isActive }) => `activehome ${isActive ? 'active' : ''}`}>
                <h2>Test Two</h2>
                <p>Placeholder for Test Two functionality.</p>
              </NavLink>
            </div>
            <div className="card">
              <NavLink to="#" className={({ isActive }) => `activehome ${isActive ? 'active' : ''}`}>
                <h2>Test Three</h2>
                <p>Placeholder for Test Three functionality.</p>
              </NavLink>
            </div>
            <div className="card">
              <NavLink to="#" className={({ isActive }) => `activehome ${isActive ? 'active' : ''}`}>
                <h2>Test Four</h2>
                <p>Placeholder for Test Four functionality.</p>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianManager;