// FrontEnd/src/Components/InventoryManage/InventoryManage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../../utils/auth';


const InventoryManage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeAuthToken();
    navigate('/login');
  };

  return (
    <div className="home-container">
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Inventory Dashboard</h1>
            <p className="dashboard-subtitle">SelfMe - FUTURE OF SUN - SOLAR POWER</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default InventoryManage;