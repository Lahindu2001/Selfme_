import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { removeAuthToken } from '../../utils/auth';
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  // Retrieve user data from localStorage
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
  const firstName = authUser.firstName || 'User'; // Use firstName, default to 'User'

  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem('authUser'); // Clear user data
    navigate('/login');
  };

  return (
    <nav id="selfmeNavbarContainer">
      <h1 id="selfmeNavbarLogo">Selfme.lk</h1>
      <a href="/" id="selfmeNavHome">
        Home
      </a>
      <a href="#" id="selfmeNavProducts">
        Products
      </a>
      <a href="#" id="selfmeNavPackages">
        Packages
      </a>
      <a href="#" id="selfmeNavService">
        Service
      </a>
      <a href="#" id="selfmeNavAbout">
        About Us
      </a>
      <a href="#" id="selfmeNavContact">
        Contact
      </a>
      <div className="user-info">
        <span className="user-name">Welcome, {firstName}</span>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
