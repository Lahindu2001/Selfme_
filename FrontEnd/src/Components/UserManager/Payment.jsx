import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { v4 as uuidv4 } from "uuid";
import Navbar from "../Nav/Navbar";
import Footer from "../Footer/Footer";

function Payment() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slipFile, setSlipFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const invoiceId = uuidv4();

  useEffect(() => {
    console.log("💳 Payment component mounted");
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      console.log("🔄 Fetching cart...");
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("❌ No token found");
        setError("Please login to proceed with payment");
        setLoading(false);
        return;
      }
      const res = await axios.get("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      console.log("✅ Cart fetch response:", {
        status: res.status,
        dataLength: res.data.length,
        sampleData: res.data[0] || "No items",
      });
      const items = Array.isArray(res.data) ? res.data : [];
      setCartItems(items);
    } catch (err) {
      console.error("💥 Cart fetch error:", err);
      let errorMessage = "Failed to load cart items.";
      if (err.response) {
        errorMessage = err.response.data?.message || `Server error (${err.response.status})`;
      } else if (err.request) {
        errorMessage = "Cannot connect to server.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log("🏁 Cart fetch complete");
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
  const taxAmount = Math.round(totalAmount * 0.085);
  const grandTotal = totalAmount + taxAmount;

  const handleFileChange = (e) => {
    console.log("📁 File selected:", e.target.files[0]?.name);
    setSlipFile(e.target.files[0]);
  };

  const handleSubmitPayment = async () => {
    if (!slipFile) {
      console.log("❌ No slip uploaded");
      setError("Please upload bank transfer slip");
      return;
    }
    if (!cartItems.length) {
      console.log("❌ Empty cart");
      setError("Cart is empty. Add items before making a payment.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("❌ No token for payment submission");
        setError("Session expired. Please login again.");
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }
      const formData = new FormData();
      formData.append("amount", grandTotal);
      formData.append("payment_method", "Bank Transfer");
      formData.append("payment_date", new Date().toISOString());
      formData.append("status", "Pending");
      formData.append("invoice_id", invoiceId);
      formData.append("slip", slipFile);
      console.log("📤 Submitting payment...");
      const response = await axios.post("http://localhost:5000/api/payments", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 10000,
      });
      console.log("✅ Payment submitted:", response.data);
      alert("Payment submitted successfully! Waiting for admin review.");
      navigate("/?view=dashboard");
    } catch (err) {
      console.error("💥 Payment submission error:", err);
      let errorMessage = "Failed to submit payment.";
      if (err.response) {
        errorMessage = err.response.data.message || `Server error (${err.response.status})`;
      } else if (err.request) {
        errorMessage = "Cannot connect to server.";
      }
      setError(errorMessage);
    } finally {
      setSubmitting(false);
      console.log("🏁 Payment submission complete");
    }
  };

  const generateInvoicePDF = () => {
    console.log("📄 Generating invoice PDF...");
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Invoice", 20, 20);
    doc.setFontSize(12);
    doc.text(`Invoice ID: ${invoiceId}`, 20, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
    doc.text("Cart Items:", 20, 50);
    let y = 60;
    cartItems.forEach((item, index) => {
      doc.text(
        `${index + 1}. ${item.itemId?.item_name || "Product"} - Qty: ${item.quantity || 1} - Rs. ${item.subtotal?.toLocaleString() || 0}`,
        20,
        y
      );
      y += 10;
    });
    y += 10;
    doc.text(`Subtotal: Rs. ${totalAmount.toLocaleString()}`, 20, y);
    y += 10;
    doc.text(`Tax (8.5%): Rs. ${taxAmount.toLocaleString()}`, 20, y);
    y += 10;
    doc.text(`Grand Total: Rs. ${grandTotal.toLocaleString()}`, 20, y);
    doc.save(`invoice_${invoiceId}.pdf`);
    console.log("✅ Invoice PDF generated");
  };

  console.log("📊 Rendering Payment - cartItems:", cartItems.length, "loading:", loading, "error:", error);
  return (
    <div>
      <Navbar />
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", padding: "20px 0", marginTop: "60px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", padding: "20px" }}>
          <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>💳 Payment</h1>
          {loading && <div style={{ textAlign: "center" }}>Loading cart...</div>}
          {error && <div style={{ color: "red", textAlign: "center", marginBottom: "20px" }}>{error}</div>}
          {!loading && (
            <>
              <h2 style={{ marginBottom: "20px", color: "#333" }}>Cart Summary</h2>
              {cartItems.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#007BFF", color: "white" }}>
                      <th style={{ padding: "15px", textAlign: "left" }}>Item</th>
                      <th style={{ padding: "15px", textAlign: "center" }}>Quantity</th>
                      <th style={{ padding: "15px", textAlign: "center" }}>Unit Price</th>
                      <th style={{ padding: "15px", textAlign: "center" }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item, index) => (
                      <tr key={item._id || `item-${index}`} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white" }}>
                        <td style={{ padding: "15px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {item.itemId?.item_image ? (
                              <img
                                src={`http://localhost:5000${item.itemId.item_image}`}
                                alt={item.itemId?.item_name || "Product"}
                                style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                                onError={(e) => {
                                  e.target.src = "https://via.placeholder.com/50x50/007BFF/FFFFFF?text=?";
                                  console.log("🖼️ Image load error for item:", item.itemId?.item_name);
                                }}
                              />
                            ) : (
                              <div style={{ width: "50px", height: "50px", backgroundColor: "#e9ecef", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                No Image
                              </div>
                            )}
                            <span>{item.itemId?.item_name || "Product"}</span>
                          </div>
                        </td>
                        <td style={{ padding: "15px", textAlign: "center" }}>{item.quantity || 1}</td>
                        <td style={{ padding: "15px", textAlign: "center" }}>Rs. {(item.unit_price || 0).toLocaleString()}</td>
                        <td style={{ padding: "15px", textAlign: "center" }}>Rs. {(item.subtotal || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ textAlign: "center", color: "#6c757d" }}>Your cart is empty.</p>
              )}
              <div style={{ textAlign: "right", marginBottom: "20px" }}>
                <p>Subtotal: Rs. {totalAmount.toLocaleString()}</p>
                <p>Tax (8.5%): Rs. {taxAmount.toLocaleString()}</p>
                <strong>Grand Total: Rs. {grandTotal.toLocaleString()}</strong>
              </div>
              <h2 style={{ marginBottom: "20px", color: "#333" }}>Submit Payment</h2>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "10px" }}>Payment Method: Bank Transfer</label>
                <label style={{ display: "block", marginBottom: "10px" }}>Upload Bank Transfer Slip:</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="application/pdf,image/jpeg,image/png"
                  style={{ marginLeft: "10px" }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <button
                  onClick={handleSubmitPayment}
                  disabled={submitting || !cartItems.length}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: (submitting || !cartItems.length) ? "#6c757d" : "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: (submitting || !cartItems.length) ? "not-allowed" : "pointer",
                    fontSize: "16px",
                  }}
                >
                  {submitting ? "Submitting..." : "Submit Payment"}
                </button>
                <button
                  onClick={generateInvoicePDF}
                  disabled={!cartItems.length}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: !cartItems.length ? "#6c757d" : "#007BFF",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: !cartItems.length ? "not-allowed" : "pointer",
                    fontSize: "16px",
                  }}
                >
                  Download Invoice
                </button>
                <button
                  onClick={() => navigate("/?view=cart")}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  ← Back to Cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Payment;