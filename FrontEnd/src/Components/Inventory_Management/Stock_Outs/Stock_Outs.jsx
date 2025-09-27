import React, { useState, useEffect } from "react";
import axios from "axios";
import InventoryManagementNav from "../Inventory_Management_Nav/Inventory_Management_Nav";
import "./Stock_Outs.css";

const API = "http://localhost:5000";

function Stock_Outs() {
  const [items, setItems] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [generatedStockOutId, setGeneratedStockOutId] = useState("");

  useEffect(() => {
    fetchItems();
    fetchRecentOrders();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API}/products`);
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch items.");
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const res = await axios.get(`${API}/stockouts`);
      setRecentOrders(
        (res.data || []).sort(
          (a, b) =>
            new Date(b.createdAt || b.orderDate) -
            new Date(a.createdAt || a.orderDate)
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Generate a preview stock out ID
  const generatePreviewStockOutId = () => {
    const year = new Date().getFullYear();
    const latestOrder = recentOrders[0];
    let sequence = 1;
    
    if (latestOrder && latestOrder.stock_out_id) {
      const lastSequence = parseInt(latestOrder.stock_out_id.split('-')[2]) || 0;
      sequence = lastSequence + 1;
    }
    
    return `SO-${year}-${sequence.toString().padStart(4, '0')}`;
  };

  const addItemToOrder = (itemId) => {
    const item = items.find((it) => it._id === itemId);
    if (!item) return;

    setOrderItems((prev) => {
      const exist = prev.find((p) => p.product_id === item._id);
      if (exist) {
        if (exist.quantity >= item.quantity_in_stock) {
          setMessage(`Cannot add more. Only ${item.quantity_in_stock} available.`);
          return prev;
        }
        return prev.map((p) =>
          p.product_id === item._id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [
        ...prev,
        {
          product_id: item._id,
          item_name: item.item_name,
          price: Number(item.selling_price) || 0,
          quantity: 1,
          available_stock: item.quantity_in_stock,
        },
      ];
    });

    setSelectedItemId("");
    setMessage("");
    
    // Update preview stock out ID when items are added
    if (orderItems.length === 0) {
      setGeneratedStockOutId(generatePreviewStockOutId());
    }
  };

  const updateQuantity = (productId, qty) => {
    const n = Number(qty);
    if (isNaN(n) || n < 1) return;
    const item = orderItems.find((i) => i.product_id === productId);
    if (item && n > item.available_stock) {
      setMessage(`Cannot exceed available stock of ${item.available_stock}`);
      return;
    }
    setOrderItems((prev) =>
      prev.map((i) => (i.product_id === productId ? { ...i, quantity: n } : i))
    );
    setMessage("");
  };

  const removeFromOrder = (productId) => {
    setOrderItems((prev) => prev.filter((i) => i.product_id !== productId));
    setMessage("");
    
    // Update preview stock out ID when all items are removed
    if (orderItems.length === 1) {
      setGeneratedStockOutId("");
    }
  };

  const total = orderItems.reduce(
    (s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 0),
    0
  );

  // Place and Confirm Order
  const placeAndConfirmOrder = async () => {
    if (!type) return setMessage("Please select an order type first.");
    if (type === "customer" && !customerId.trim())
      return setMessage("Please enter Customer ID.");
    if (orderItems.length === 0) return setMessage("Please add at least one item.");

    setLoading(true);
    try {
      const payloadItems = orderItems.map((i) => ({
        product_id: i.product_id,
        item_name: i.item_name,
        quantity: i.quantity,
        price: i.price,
      }));

      const orderPayload = {
        customer_id: type === "customer" ? customerId : "Technical Team",
        type: type,
        items: payloadItems,
        total: total,
      };

      const res = await axios.post(`${API}/stockouts`, orderPayload);
      const createdOrder = res.data.stockOut;

      // Confirm order immediately
      await axios.put(`${API}/stockouts/${createdOrder._id}/confirm`);

      setMessage(`Order ${createdOrder.stock_out_id} successfully placed and confirmed!`);
      setOrderItems([]);
      setCustomerId("");
      setType("");
      setSelectedItemId("");
      setGeneratedStockOutId("");
      fetchItems();
      fetchRecentOrders();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage(
        err.response?.data?.message || "Failed to place order. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Confirm Existing Order
  const confirmExistingOrder = async (orderId) => {
    try {
      await axios.put(`${API}/stockouts/${orderId}/confirm`);
      setMessage("Order confirmed successfully!");
      fetchItems();
      fetchRecentOrders();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to confirm order. Try again.");
    }
  };

  const clearOrder = () => {
    setOrderItems([]);
    setCustomerId("");
    setType("");
    setSelectedItemId("");
    setGeneratedStockOutId("");
    setMessage("");
  };

  return (
    <div className="stockouts-page">
      <InventoryManagementNav />

      <div className="stockouts-container">
        <div className="page-header">
          <h1>Stock Out & Order Management</h1>
          <p>Create and process stock out orders</p>
        </div>

        {message && (
          <div className={`message-alert ${message.includes("successfully") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <div className="main-content">
          {/* Form + Order Items */}
          <div className="order-creation-card">
            <div className="order-card-content">
              <div className="form-section">
                <h3>Create New Order</h3>

                {/* Stock Out ID Preview */}
                {generatedStockOutId && (
                  <div className="stock-out-id-preview">
                    <label>Stock Out ID</label>
                    <div className="stock-out-id-display">
                      {generatedStockOutId}
                      <span className="id-note">(Auto-generated)</span>
                    </div>
                  </div>
                )}

                <label>Order Type *</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="">Select Order Type</option>
                  <option value="customer">Customer Order</option>
                  <option value="technical">Technical Team Order</option>
                </select>

                {type === "customer" && (
                  <>
                    <label>Customer ID *</label>
                    <input
                      type="text"
                      placeholder="Enter Customer ID"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                    />
                  </>
                )}

                {type && (
                  <>
                    <label>Add Item</label>
                    <select
                      value={selectedItemId}
                      onChange={(e) => {
                        if (e.target.value) addItemToOrder(e.target.value);
                      }}
                    >
                      <option value="">Select Item</option>
                      {items
                        .filter((item) => item.quantity_in_stock > 0)
                        .map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.item_name} - LKR {item.selling_price} (Stock:{" "}
                            {item.quantity_in_stock})
                          </option>
                        ))}
                    </select>
                  </>
                )}
              </div>

              {orderItems.length > 0 && (
                <div className="order-items-section">
                  <h3>
                    Order Items ({orderItems.length}){" "}
                    <button className="clear-order-btn" onClick={clearOrder}>
                      Clear Order
                    </button>
                  </h3>

                  <table className="order-table">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Unit Price (LKR)</th>
                        <th>Subtotal (LKR)</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item) => (
                        <tr key={item.product_id}>
                          <td>{item.item_name}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              max={item.available_stock}
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.product_id, e.target.value)
                              }
                              className="quantity-input"
                            />
                            <span className="stock-info">/ {item.available_stock} available</span>
                          </td>
                          <td>{item.price.toLocaleString()}</td>
                          <td>{(item.price * item.quantity).toLocaleString()}</td>
                          <td>
                            <button
                              className="remove-item-btn"
                              onClick={() => removeFromOrder(item.product_id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="order-summary">
                    <div className="order-total">
                      <strong>Total Amount: LKR {total.toLocaleString()}</strong>
                    </div>
                    {/* <div className="order-meta">
                      <span>Stock Out ID: {generatedStockOutId}</span>
                      <span>Type: {type === 'customer' ? 'Customer Order' : 'Technical Team Order'}</span>
                      <span>Date: {new Date().toLocaleDateString()}</span>
                    </div> */}
                  </div>

                  <button
                    className="place-order-btn"
                    onClick={placeAndConfirmOrder}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="loading-spinner"></span>
                        Processing Order...
                      </>
                    ) : (
                      `Place & Confirm Order (${generatedStockOutId})`
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="orders-history-card">
            <h3>Recent Stock Out Orders</h3>
            {recentOrders.length === 0 ? (
              <p>No orders yet.</p>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Stock Out ID</th>
                    <th>Type</th>
                    <th>Customer/Team</th>
                    <th>Items</th>
                    <th>Total (LKR)</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.slice(0, 10).map((order) => {
                    const orderDate = new Date(order.createdAt || order.orderDate);
                    return (
                      <tr key={order._id} className={order.status === "Confirmed" ? "confirmed" : "pending"}>
                        <td className="stock-out-id">
                          <strong>{order.stock_out_id}</strong>
                        </td>
                        <td>{order.type === "technical" ? "Technical" : "Customer"}</td>
                        <td>{order.customer_id}</td>
                        <td>{order.items.length} items</td>
                        <td>{Number(order.total || 0).toLocaleString()}</td>
                        <td>{orderDate.toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          {order.status !== "Confirmed" ? (
                            <button
                              className="confirm-btn"
                              onClick={() => confirmExistingOrder(order._id)}
                            >
                              Confirm
                            </button>
                          ) : (
                            <span className="confirmed-text">Confirmed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stock_Outs;