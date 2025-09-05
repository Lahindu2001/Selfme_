// FrontEnd/src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// ------------------- Import Components -------------------
import AdminPanel from "./Components/AdminPanel/Admin";
import InventoryManage from "./Components/InventoryMange/InventoryMange";
import SupplyRequest from "./Components/AdminPanel/SupplyRequest/SupplyRequest";
import SupplyProducts from "./Components/AdminPanel/SupplyProducts/SupplyProducts";
import Login from "./Components/Auth/Login";
import Signup from "./Components/Auth/Signup";
import FinanceManager from "./Components/FinanceManager/FinanceManager";
import TechnicianManager from "./Components/TechnicianManager/TechnicianManager";
import Home from "./Components/UserManager/Home"; // Import Home component
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
          path="/SupplyRequest"
          element={isAuthenticated() ? <SupplyRequest /> : <Navigate to="/login" />}
        />

        <Route
          path="/SupplyProducts"
          element={isAuthenticated() ? <SupplyProducts /> : <Navigate to="/login" />}
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
          path="/"
          element={isAuthenticated() ? <Home /> : <Navigate to="/login" />}
        />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;