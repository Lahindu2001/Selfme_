// FrontEnd/src/Components/TechnicianManager/TechnicianManager.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../../utils/auth';

const TechnicianManager = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeAuthToken();
    navigate('/login');
  };

  return (
    <div>
      <h2>Technician Dashboard</h2>
      <p>Welcome to Technician Management!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default TechnicianManager;