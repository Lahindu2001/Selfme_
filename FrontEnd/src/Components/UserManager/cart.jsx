
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../Nav/Navbar";
import Footer from "../Footer/Footer";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({}); // Track which items are being updated
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🛒 Cart component mounted");
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      console.log("🔄 Fetching cart...");
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      console.log("🔑 Token exists:", !!token);
      if (!token) {
        const errorMsg = "Please login to view your cart";
        console.log("❌", errorMsg);
        setError(errorMsg);
        setLoading(false);
        return;
      }
      console.log("📡 Making API call to: http://localhost:5000/api/cart");
      const res = await axios.get("http://localhost:5000/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });
      console.log("✅ API Response:", {
        status: res.status,
        dataLength: res.data.length,
        sampleData: res.data[0] || "No items"
      });
    
      const items = Array.isArray(res.data) ? res.data : [];
      setCartItems(items);
    
    } catch (err) {
      console.error("💥 Cart fetch error:", err);
    
      let errorMessage = "Failed to load cart items.";
    
      if (err.response) {
        const { status, data } = err.response;
        console.error(`Server error ${status}:`, data);
      
        if (status === 401) {
          errorMessage = "Session expired. Please login again.";
          localStorage.removeItem("token");
          setTimeout(() => navigate("/login"), 1500);
        } else if (status === 404) {
          errorMessage = "Cart not found. Your cart is empty.";
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (data.message) {
          errorMessage = data.message;
        } else {
          errorMessage = `Server error (${status})`;
        }
      } else if (err.request) {
        errorMessage = "Cannot connect to server. Please check your connection.";
        console.error("Network error:", err.request);
      } else {
        errorMessage = err.message || "An unexpected error occurred.";
      }
    
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log("🏁 Cart fetch complete");
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
   
    setUpdating(prev => ({ ...prev, [cartItemId]: true }));
   
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }
      console.log(`🔄 Updating quantity for ${cartItemId} to ${newQuantity}`);
     
      const response = await axios.put(
        `http://localhost:5000/api/cart/${cartItemId}`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );
      console.log("✅ Quantity updated:", response.data);
     
      setCartItems(prevItems =>
        prevItems.map(item =>
          item._id === cartItemId
            ? { ...item, quantity: response.data.quantity, subtotal: response.data.subtotal }
            : item
        )
      );
     
    } catch (error) {
      console.error("❌ Failed to update quantity:", error);
     
      let errorMessage = "Failed to update quantity.";
     
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.removeItem("token");
          setTimeout(() => navigate("/login"), 1500);
          return;
        }
        errorMessage = error.response.data?.message || `Server error (${error.response.status})`;
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }
     
      console.error("Error updating quantity:", errorMessage);
    } finally {
      setUpdating(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const deleteItem = async (cartItemId) => {
    if (!window.confirm("Are you sure you want to remove this item from your cart?")) {
      return;
    }
   
    setUpdating(prev => ({ ...prev, [cartItemId]: true }));
   
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }
      console.log(`🗑️ Deleting item ${cartItemId}`);
     
      await axios.delete(`http://localhost:5000/api/cart/${cartItemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      console.log("✅ Item deleted successfully");
     
      setCartItems(prevItems => prevItems.filter(item => item._id !== cartItemId));
     
    } catch (error) {
      console.error("❌ Failed to delete item:", error);
     
      let errorMessage = "Failed to remove item.";
     
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.removeItem("token");
          setTimeout(() => navigate("/login"), 1500);
          return;
        }
        errorMessage = error.response.data?.message || `Server error (${error.response.status})`;
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }
     
      console.error("Error deleting item:", errorMessage);
      setError(errorMessage);
    } finally {
      setUpdating(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const handleProceed = () => {
    console.log("💳 Proceed to payment");
    navigate("/?view=payment");
  };

  const handleAddMoreItems = () => {
    console.log("🛍️ Navigating to packages page");
    navigate("/?view=packages");
  };

  const totalAmount = cartItems.reduce((sum, item) => {
    const subtotal = Number(item.subtotal) || 0;
    return sum + subtotal;
  }, 0);
  const taxAmount = Math.round(totalAmount * 0.085);
  const grandTotal = totalAmount + taxAmount;

  console.log("📊 Rendering - Items:", cartItems.length, "Total: Rs.", grandTotal);

  return (
    <div>
      <Navbar />
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "20px 0",
        marginTop: "60px"
      }}>
        <div style={{
          maxWidth: "900px",
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          padding: "20px"
        }}>
          <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>
            🛒 My Cart
          </h1>
          {loading && (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <div style={{ fontSize: "3rem", marginBottom: "20px" }}>⏳</div>
              <h2>Loading your cart...</h2>
              <p style={{ color: "#666" }}>Just a moment while we fetch your items!</p>
            </div>
          )}
          {error && (
            <div style={{
              textAlign: "center",
              color: "red",
              padding: "20px",
              backgroundColor: "#fee",
              borderRadius: "5px",
              marginBottom: "20px",
              border: "1px solid #fcc"
            }}>
              <strong>❌ Error:</strong> {error}
              <br />
              <br />
              <button
                onClick={fetchCart}
                disabled={loading}
                style={{
                  padding: "8px 16px",
                  background: loading ? "#6c757d" : "#007BFF",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: loading ? "not-allowed" : "pointer",
                  marginRight: "10px",
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? "⏳ Loading..." : "🔄 Retry"}
              </button>
            
              {error.includes("login") && (
                <button
                  onClick={() => navigate("/login")}
                  style={{
                    padding: "8px 16px",
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  🔐 Login
                </button>
              )}
            </div>
          )}
          {!loading && !error && (
            <div>
              <div style={{
                marginBottom: "30px",
                paddingBottom: "15px",
                borderBottom: "2px solid #ddd"
              }}>
                <h2 style={{ margin: "0 0 5px 0", color: "#333" }}>
                  Your Shopping Cart
                </h2>
                <p style={{ margin: 0, color: "#666" }}>
                  {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} selected
                </p>
              </div>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "20px",
                backgroundColor: "white",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
              }}>
                <thead>
                  <tr style={{ backgroundColor: "#007BFF", color: "white" }}>
                    <th style={{ padding: "15px", textAlign: "left", border: "none" }}>
                      Item
                    </th>
                    <th style={{ padding: "15px", textAlign: "center", border: "none" }}>
                      Quantity
                    </th>
                    <th style={{ padding: "15px", textAlign: "center", border: "none" }}>
                      Unit Price
                    </th>
                    <th style={{ padding: "15px", textAlign: "center", border: "none" }}>
                      Subtotal
                    </th>
                    <th style={{ padding: "15px", textAlign: "center", border: "none", width: "80px" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.length > 0 ? (
                    cartItems.map((item, index) => (
                      <tr key={item._id || `item-${index}`} style={{
                        backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white"
                      }}>
                        <td style={{
                          padding: "15px",
                          textAlign: "left",
                          borderBottom: "1px solid #ddd",
                          verticalAlign: "middle"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                            <div style={{ flexShrink: 0 }}>
                              {item.itemId?.item_image ? (
                                <img
                                  src={`http://localhost:5000${item.itemId.item_image}`}
                                  alt={item.itemId?.item_name || "Product"}
                                  style={{
                                    width: "60px",
                                    height: "60px",
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                    border: "1px solid #ddd"
                                  }}
                                  onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/60x60/007BFF/FFFFFF?text=?";
                                  }}
                                />
                              ) : (
                                <div style={{
                                  width: "60px",
                                  height: "60px",
                                  backgroundColor: "#e9ecef",
                                  borderRadius: "4px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#6c757d",
                                  fontSize: "12px"
                                }}>
                                  No Image
                                </div>
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: "600", color: "#333", marginBottom: "5px" }}>
                                {item.itemId?.item_name || "Solar Product"}
                              </div>
                              <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
                                {item.itemId?.description || "High-quality solar solution"}
                              </div>
                              <div style={{ fontSize: "12px", color: "#999" }}>
                                Added: {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Unknown"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{
                          padding: "15px",
                          textAlign: "center",
                          borderBottom: "1px solid #ddd",
                          verticalAlign: "middle"
                        }}>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "20px",
                            padding: "5px 10px",
                            border: "1px solid #dee2e6"
                          }}>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              disabled={updating[item._id] || item.quantity <= 1}
                              style={{
                                width: "24px",
                                height: "24px",
                                border: "none",
                                borderRadius: "50%",
                                backgroundColor: (updating[item._id] || item.quantity <= 1) ? "#6c757d" : "#dc3545",
                                color: "white",
                                cursor: (updating[item._id] || item.quantity <= 1) ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                                fontWeight: "bold",
                                opacity: (updating[item._id] || item.quantity <= 1) ? 0.6 : 1,
                                transition: "all 0.2s ease"
                              }}
                              title="Decrease quantity"
                            >
                              −
                            </button>
                            <span style={{
                              minWidth: "30px",
                              textAlign: "center",
                              fontWeight: "600",
                              color: "#333",
                              fontSize: "16px"
                            }}>
                              {updating[item._id] ? (
                                <span style={{ color: "#007BFF" }}>⏳</span>
                              ) : (
                                item.quantity || 1
                              )}
                            </span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              disabled={updating[item._id]}
                              style={{
                                width: "24px",
                                height: "24px",
                                border: "none",
                                borderRadius: "50%",
                                backgroundColor: updating[item._id] ? "#6c757d" : "#28a745",
                                color: "white",
                                cursor: updating[item._id] ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                                fontWeight: "bold",
                                opacity: updating[item._id] ? 0.6 : 1,
                                transition: "all 0.2s ease"
                              }}
                              title="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td style={{
                          padding: "15px",
                          textAlign: "center",
                          borderBottom: "1px solid #ddd"
                        }}>
                          <span style={{ color: "#28a745", fontWeight: "600" }}>
                            Rs. {(item.unit_price || 0).toLocaleString()}
                          </span>
                        </td>
                        <td style={{
                          padding: "15px",
                          textAlign: "center",
                          borderBottom: "1px solid #ddd"
                        }}>
                          <strong style={{ color: "#dc3545", fontSize: "16px" }}>
                            Rs. {(item.subtotal || 0).toLocaleString()}
                          </strong>
                        </td>
                        <td style={{
                          padding: "15px",
                          textAlign: "center",
                          borderBottom: "1px solid #ddd",
                          verticalAlign: "middle"
                        }}>
                          <button
                            onClick={() => deleteItem(item._id)}
                            disabled={updating[item._id]}
                            style={{
                              padding: "8px 12px",
                              backgroundColor: updating[item._id] ? "#6c757d" : "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: updating[item._id] ? "not-allowed" : "pointer",
                              fontSize: "14px",
                              fontWeight: "600",
                              transition: "all 0.2s ease",
                              opacity: updating[item._id] ? 0.6 : 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "4px",
                              margin: "0 auto",
                              whiteSpace: "nowrap"
                            }}
                            title="Remove item"
                          >
                            {updating[item._id] ? "⏳" : "🗑️"} Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{
                        padding: "60px",
                        textAlign: "center",
                        color: "#6c757d"
                      }}>
                        <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🛒</div>
                        <h3>Your cart is empty</h3>
                        <p style={{ marginBottom: "20px" }}>
                          Add some amazing solar products to get started!
                        </p>
                        <button
                          onClick={() => navigate("/?view=packages")}
                          style={{
                            padding: "12px 24px",
                            background: "#007BFF",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontSize: "16px",
                            textDecoration: "none"
                          }}
                        >
                          🛍️ Shop Solar Products
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {cartItems.length > 0 && (
                <div style={{
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  padding: "25px",
                  marginTop: "20px",
                  textAlign: "right",
                  border: "1px solid #dee2e6"
                }}>
                  <div style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: "10px"
                  }}>
                    Subtotal: Rs. {totalAmount.toLocaleString()}
                  </div>
                  <div style={{
                    fontSize: "16px",
                    color: "#666",
                    marginBottom: "10px"
                  }}>
                    Tax (8.5%): Rs. {taxAmount.toLocaleString()}
                  </div>
                  <div style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#28a745",
                    borderTop: "2px solid #ddd",
                    paddingTop: "10px"
                  }}>
                    Total: Rs. {grandTotal.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}
          <div style={{ textAlign: "center", marginTop: "30px", display: "flex", justifyContent: "center", gap: "20px" }}>
            <button
              onClick={handleAddMoreItems}
              style={{
                padding: "15px 40px",
                fontSize: "16px",
                fontWeight: "600",
                backgroundColor: "#007BFF",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                transition: "all 0.3s ease"
              }}
            >
              🛍️ Add More Items
            </button>
            <button
              onClick={handleProceed}
              disabled={cartItems.length === 0 || loading}
              style={{
                padding: "15px 40px",
                fontSize: "16px",
                fontWeight: "600",
                backgroundColor: (cartItems.length === 0 || loading) ? "#6c757d" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: (cartItems.length === 0 || loading) ? "not-allowed" : "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                transition: "all 0.3s ease",
                opacity: (cartItems.length === 0 || loading) ? 0.6 : 1
              }}
            >
              💳 Proceed to Payment
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: "20px", color: "#666", fontSize: "14px" }}>
            <p>🔒 Secure checkout • 🚚 Free shipping • ⏪ 30-day returns</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Cart;