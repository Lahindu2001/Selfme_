import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import AdminPanel from "./Components/AdminPanel/Admin";
import InventoryManage from "./Components/InventoryMange/InventoryMange";
import SupplyRequest from "./Components/AdminPanel/SupplyRequest/SupplyRequest";
import SupplyProducts from "./Components/AdminPanel/SupplyProducts/supplyProducts";
import AllUser from "./Components/AdminPanel/AllUser/AllUser";
import AllFeedback from "./Components/AdminPanel/AllFeedback/AllFeedback";
import AllEmployee from "./Components/AdminPanel/AllEmployee/AllEmployee";
import Login from "./Components/Auth/Login";
import Signup from "./Components/Auth/Signup";
import FinanceManager from "./Components/FinanceManager/FinanceManager";

import TechnicianDashboard from "./Components/TechnicianDashboard/TechnicianDashboard";
import RegisterEmployee from "./Components/TechnicianDashboard/RegisterEmployee";
import RegisteredEmployees from "./Components/TechnicianDashboard/RegisteredEmployees";
import AssignedTasks from "./Components/TechnicianDashboard/AssignedTasks";
import CompletedTasks from "./Components/TechnicianDashboard/CompletedTasks";


import Home from "./Components/UserManager/Home";
import { isAuthenticated } from "./utils/auth";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
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
          path="/AllUsers"
          element={isAuthenticated() ? <AllUser /> : <Navigate to="/login" />}
        />
        <Route
          path="/AllFeedback"
          element={isAuthenticated() ? <AllFeedback /> : <Navigate to="/login" />}
        />
        <Route
          path="/AllEmployees"
          element={isAuthenticated() ? <AllEmployee /> : <Navigate to="/login" />}
        />
        <Route
          path="/FinanceManager"
          element={isAuthenticated() ? <FinanceManager /> : <Navigate to="/login" />}
        />
 

        <Route
          path="/register-employee"
          element={isAuthenticated() ? <RegisterEmployee /> : <Navigate to="/login" />}
        /> 
        
        <Route
          path="/employees"
          element={isAuthenticated() ? <RegisteredEmployees /> : <Navigate to="/login" />}
        /> 

        
        <Route
          path="/assigned-tasks"
          element={isAuthenticated() ? <AssignedTasks /> : <Navigate to="/login" />}
        /> 

        
        <Route
          path="/completed-tasks"
          element={isAuthenticated() ? <CompletedTasks  /> : <Navigate to="/login" />}
        /> 

        <Route
          path="/technicianDashboard"
          element={isAuthenticated() ? <TechnicianDashboard  /> : <Navigate to="/login" />}
        /> 

        <Route
          path="/"
          element={isAuthenticated() ? <Home /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;