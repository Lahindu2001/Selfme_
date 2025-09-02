import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// ------------------- Import Components -------------------
import AdminPanel from "./Components/AdminPanel/Admin";
import InventoryManage from "./Components/InventoryMange/InventoryMange";
import ProductManager from "./Components/ProductManager/ProductManager";
import SupplyRequest from "./Components/SupplyRequest/SupplyRequest";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirect root to mainAdminhome */}
          <Route path="/" element={<Navigate to="/mainAdminhome" replace />} />

          {/* Home Page */}
          <Route path="/mainAdminhome" element={<AdminPanel />} />

          {/* Inventory Management */}
          <Route path="/InventoryMange" element={<InventoryManage />} />

          {/* Product Management */}
          <Route path="/ProductManager" element={<ProductManager />} />

          {/* Supply Request */}
          <Route path="/SupplyRequest" element={<SupplyRequest />} />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
