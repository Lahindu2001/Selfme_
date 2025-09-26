import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Nav/Navbar";
import Footer from "../Footer/Footer";
import { isAuthenticated, removeAuthToken } from "../../utils/auth";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);

  // Get user data from localStorage
  const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
  const firstName = authUser.firstName || "User";

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      removeAuthToken();
      localStorage.removeItem("authUser");
      navigate("/login");
      return;
    }
    fetchPayments();
  }, [navigate]);

  const fetchPayments = async () => {
    try {
      console.log("🔄 Fetching payments...");
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("❌ No token for payments");
        setError("Please login to view payment history");
        return;
      }
      const res = await axios.get("http://localhost:5000/api/payments", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      console.log("✅ Payments fetch response:", {
        status: res.status,
        dataLength: res.data.length,
        sampleData: res.data[0] || "No payments",
      });
      const paymentData = Array.isArray(res.data) ? res.data : [];
      setPayments(paymentData);
    } catch (err) {
      console.error("💥 Payments fetch error:", err);
      setError(err.response?.data?.message || "Failed to load payment history.");
    }
  };

  console.log("📊 Rendering UserDashboard - payments:", payments.length, "error:", error);

  return (
    <div className="user-dashboard">
      <Navbar />
      <div className="dashboard-content" style={{ margin: "50px", textAlign: "center" }}>
        <h2>Welcome to Your Dashboard, {firstName}!</h2>
        <div className="user-info">
          <p>Your solar journey starts here! Explore our packages or check your cart to continue.</p>
        </div>
        <div className="dashboard-actions">
          <button
            onClick={() => navigate("/?view=cart")}
            style={{
              backgroundColor: "#28a745",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              margin: "10px",
              cursor: "pointer",
            }}
          >
            View Cart
          </button>
          <button
            onClick={() => navigate("/?view=packages")}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              margin: "10px",
              cursor: "pointer",
            }}
          >
            Browse Packages
          </button>
        </div>
        <div style={{ maxWidth: "900px", margin: "20px auto", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", padding: "20px" }}>
          <h2 style={{ marginBottom: "20px", color: "#333" }}>Payment History</h2>
          {error && <div style={{ color: "red", textAlign: "center", marginBottom: "20px" }}>{error}</div>}
          {payments.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
              <thead>
                <tr style={{ backgroundColor: "#007BFF", color: "white" }}>
                  <th style={{ padding: "15px", textAlign: "left" }}>Payment ID</th>
                  <th style={{ padding: "15px", textAlign: "center" }}>Amount</th>
                  <th style={{ padding: "15px", textAlign: "center" }}>Date</th>
                  <th style={{ padding: "15px", textAlign: "center" }}>Status</th>
                  <th style={{ padding: "15px", textAlign: "center" }}>Slip</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, index) => (
                  <tr key={payment.payment_id || `payment-${index}`} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white" }}>
                    <td style={{ padding: "15px" }}>{payment.payment_id}</td>
                    <td style={{ padding: "15px", textAlign: "center" }}>Rs. {(payment.amount || 0).toLocaleString()}</td>
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : "N/A"}
                    </td>
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      <span
                        style={{
                          color: payment.status === "Pending" ? "#ffc107" : payment.status === "Paid" ? "#28a745" : "#dc3545",
                          fontWeight: "600",
                        }}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      {payment.reference_no ? (
                        <a href={`http://localhost:5000${payment.reference_no}`} target="_blank" rel="noopener noreferrer">
                          <img
                            src={`http://localhost:5000${payment.reference_no}`}
                            alt="Payment Slip"
                            style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/50x50/007BFF/FFFFFF?text=Slip";
                              console.log("🖼️ Slip image load error for payment:", payment.payment_id);
                            }}
                          />
                        </a>
                      ) : (
                        "No Slip"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: "center", color: "#6c757d" }}>No payment history available.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserDashboard;