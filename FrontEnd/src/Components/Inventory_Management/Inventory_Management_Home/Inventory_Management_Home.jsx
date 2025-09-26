// InventoryManagementHome.jsx
import React from "react";
import InventoryManagementNav from "../Inventory_Management_Nav/Inventory_Management_Nav";
import "./Inventory_Management_Home.css";

const InventoryManagementHome = () => {
  return (
    <div className="inv-page">
      <div className="inv-sidebar">
        <InventoryManagementNav />
      </div>
      <main className="inv-main">
        <h1>Inventory Management Dashboard</h1>
        <p>Welcome to your dashboard!</p>
      </main>
    </div>
  );
};

export default InventoryManagementHome;
