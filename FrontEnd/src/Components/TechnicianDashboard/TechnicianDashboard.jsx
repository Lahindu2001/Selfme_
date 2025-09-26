import React from "react";
import { useNavigate } from "react-router-dom";
import "./TechnicianDashboard.css";
import TechnicianLayout from "./TechnicianLayout";

function TechnicianDashboard() {
  const navigate = useNavigate();

  // Hardcoded fake Sri Lankan purchase order data
  const orders = [
    {
      id: "PO-001",
      customerId: "CUST-001",
      customerName: "Amal Perera",
      product: "5KW Home Solar System",
      quantity: 1,
      amount: "Rs. 250,000",
      paymentStatus: "Success",
      orderDate: "2025-09-01",
      location: "Colombo",
    },
    {
      id: "PO-002",
      customerId: "CUST-002",
      customerName: "Nimali Fernando",
      product: "Lithium-ion Battery Pack",
      quantity: 2,
      amount: "Rs. 150,000",
      paymentStatus: "Success",
      orderDate: "2025-09-02",
      location: "Kandy",
    },
    {
      id: "PO-003",
      customerId: "CUST-003",
      customerName: "Saman Jayasinghe",
      product: "Hybrid Inverter",
      quantity: 1,
      amount: "Rs. 100,000",
      paymentStatus: "Success",
      orderDate: "2025-09-03",
      location: "Galle",
    },
    {
      id: "PO-004",
      customerId: "CUST-004",
      customerName: "Kumari Silva",
      product: "20KW Business Package",
      quantity: 1,
      amount: "Rs. 500,000",
      paymentStatus: "Success",
      orderDate: "2025-09-04",
      location: "Jaffna",
    },
    {
      id: "PO-005",
      customerId: "CUST-005",
      customerName: "Ranil Wickramasinghe",
      product: "5KW Home Solar System",
      quantity: 1,
      amount: "Rs. 250,000",
      paymentStatus: "Success",
      orderDate: "2025-09-05",
      location: "Negombo",
    },
  ];

  // Navigate to the Register Employee page
  const handleRegisterEmployee = () => {
    navigate("/register-employee");
  };

  return (
    <TechnicianLayout>
      <div className="technician-dashboard">
        <h1>Technician Dashboard</h1>
        <p>Select an option above to manage tasks or employees.</p>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer ID</th>
              <th>Customer Name</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Payment Status</th>
              <th>Order Date</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customerId}</td>
                <td>{order.customerName}</td>
                <td>{order.product}</td>
                <td>{order.quantity}</td>
                <td>{order.amount}</td>
                <td className="status-success">{order.paymentStatus}</td>
                <td>{order.orderDate}</td>
                <td>{order.location}</td>
                <td>
                  <button
                    className="cta-button primary"
                    onClick={handleRegisterEmployee}
                  >
                    Register Employee
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TechnicianLayout>
  );
}

export default TechnicianDashboard;