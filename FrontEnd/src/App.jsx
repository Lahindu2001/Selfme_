// FrontEnd/src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // Remove BrowserRouter import
import "./App.css";

// ------------------- Import Components -------------------
import AdminPanel from "./Components/AdminPanel/Admin";
import InventoryManage from "./Components/InventoryMange/InventoryMange"; // Fix typo if needed
import ProductManager from "./Components/ProductManager/ProductManager";
import SupplyRequest from "./Components/SupplyRequest/SupplyRequest";
import Login from "./Components/Auth/Login";
import Signup from "./Components/Auth/Signup";
import FinanceManager from "./Components/FinanceManager/FinanceManager";
import TechnicianManager from "./Components/TechnicianManager/TechnicianManager";
import CustomerDashboard from "./Components/CustomerDashboard/CustomerDashboard";
import { isAuthenticated } from "./utils/auth";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes - Redirect to login if not authenticated */}
        <Route
          path="/mainAdminhome"
          element={isAuthenticated() ? <AdminPanel /> : <Navigate to="/login" />}
        />
        <Route
          path="/InventoryMange"
          element={isAuthenticated() ? <InventoryManage /> : <Navigate to="/login" />}
        />
        <Route
          path="/ProductManager"
          element={isAuthenticated() ? <ProductManager /> : <Navigate to="/login" />}
        />
        <Route
          path="/SupplyRequest"
          element={isAuthenticated() ? <SupplyRequest /> : <Navigate to="/login" />}
        />
        <Route
          path="/FinanceManager"
          element={isAuthenticated() ? <FinanceManager /> : <Navigate to="/login" />}
        />
        <Route
          path="/TechnicianManager"
          element={isAuthenticated() ? <TechnicianManager /> : <Navigate to="/login" />}
        />
        <Route
          path="/CustomerDashboard"
          element={isAuthenticated() ? <CustomerDashboard /> : <Navigate to="/login" />}
        />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;