import React from "react";
import { Link } from 'react-router-dom';
import "./Admin.css";


function Admin() {
  return (
    <div className="home-container">

      <div className="dashboard">
        <h1 className="dashboard-title">Administrator Dashboard</h1>
        <p className="dashboard-subtitle">Welcome to Solar ERP Admin Panel</p>

        <div className="card-grid">
          <div className="card">
          <Link to="/userdetails" className="activehome">
            <h2>User Management</h2>
            <p>Manage system users, roles & permissions.</p>
          </Link>
            
          </div>
          <div className="card">
          <Link to="/InventoryMange" className="activehome">
            <h2>Inventory Management</h2>
            <p>Track and update solar panels, wires & safety products.</p>
            </Link>
          </div>
          <div className="card">
           <Link to="/ProductManager" className="activehome">
              <h2>Product Management</h2>
              <p>Create and modify solar packages for customers.</p>
            </Link>
          </div>
          <div className="card">
            <h2>Finance Management</h2>
            <p>Monitor payments, invoices, and financial reports.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
