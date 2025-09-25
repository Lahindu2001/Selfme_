import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
//import Navbar from "../Nav/Navbar";
//import Footer from "../Footer/Footer";
import "./TechnicianDashboard.css";

function TechnicianLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to check if a route is active
  const isActive = (path) => location.pathname === path;

  return (
    <div>
      
      {/* <Navbar /> */}
      <div className="technician-dashboard">
        <div className="dashboard-btn-group">
          <button
            className={`cta-button primary${
              isActive("/technicianDashboard") ? " active-btn" : ""
            }`}
            onClick={() => navigate("/technicianDashboard")}
          >
            Tasks
          </button>
          <button
            className={`cta-button primary${
              isActive("/technicianDashboard/register-employee")
                ? " active-btn"
                : ""
            }`}
            onClick={() => navigate("/technicianDashboard/register-employee")}
          >
            Register Employee
          </button>


           {/* 
          <button
            className={`cta-button primary${
              isActive("/technicianDashboard/employees") ? " active-btn" : ""
            }`}
            onClick={() => navigate("/technicianDashboard/employees")}
          >
            Registered Employees
          </button>

         
          <button
            className={`cta-button primary${
              isActive("/technicianDashboard/assigned-tasks") ? " active-btn" : ""
            }`}
            onClick={() => navigate("/technicianDashboard/assigned-tasks")}
          >
            Pending Tasks
          </button>
          <button
            className={`cta-button primary${
              isActive("/technicianDashboard/completed-tasks") ? " active-btn" : ""
            }`}
            onClick={() => navigate("/technicianDashboard/completed-tasks")}
          >
            Completed Tasks
          </button> */}
        </div>
        {children}
      </div>
      {/* <Footer /> */}
    </div>
  );
}

export default TechnicianLayout;