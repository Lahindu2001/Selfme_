import React, { useEffect, useState } from "react";
import axios from "axios";
import InventoryManagementNav from "../Inventory_Management_Nav/Inventory_Management_Nav";
import "./Order_Place.css";

const Order_Place = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/orders?populate=true");
      console.log("Orders data with population:", res.data);
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getProductInfo = (order) => {
    if (order.product && typeof order.product === 'object') {
      return {
        name: order.product.item_name || order.product.name || "Unknown Product",
        sku: order.product.serial_number || order.product.sku || "N/A",
        stock: order.product.quantity_in_stock || 0,
        category: order.product.category || "N/A"
      };
    }
    
    return {
      name: order.item_name || "Unknown Product",
      sku: order.serial_number || "N/A",
      stock: order.quantity_in_stock || 0,
      category: order.category || "N/A"
    };
  };

  const getSupplierInfo = (order) => {
    if (order.supplier && typeof order.supplier === 'object') {
      return {
        name: order.supplier.supplier_name || order.supplier.name || "Unknown Supplier",
        company: order.supplier.company_name || order.supplier.company || "N/A",
        email: order.supplier.email || "N/A",
        phone: order.supplier.phone || "N/A"
      };
    }
    
    return {
      name: order.supplier_name || "Unknown Supplier",
      company: order.company_name || "N/A",
      email: order.supplier_email || "N/A",
      phone: order.supplier_phone || "N/A"
    };
  };

  const refreshOrders = () => {
    fetchOrders();
  };

  if (loading) {
    return (
      <div>
        <InventoryManagementNav />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <InventoryManagementNav />
      <div className="orders-container">
        <div className="page-header">
          <div className="header-left">
            <h1>Placed Orders</h1>
            <p>Track and manage all supplier orders</p>
          </div>
          <div className="header-right">
            <button onClick={refreshOrders} className="refresh-btn">
              Refresh Orders
            </button>
          </div>
        </div>

        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        <div className="summary-bar">
          <div className="summary-item">
            <span className="summary-label">Total Orders:</span>
            <span className="summary-value">{orders.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Pending:</span>
            <span className="summary-value">{orders.filter(o => o.status === 'pending').length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Completed:</span>
            <span className="summary-value">{orders.filter(o => o.status === 'completed').length}</span>
          </div>
        </div>

        {orders.length > 0 ? (
          <div className="table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product Details</th>
                  <th>Supplier Info</th>
                  <th>Quantity</th>
                  <th>Order Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const product = getProductInfo(order);
                  const supplier = getSupplierInfo(order);

                  return (
                    <tr key={order._id}>
                      <td className="order-id-cell">
                        {(order._id || '').slice(-6).toUpperCase()}
                      </td>
                      <td className="product-cell">
                        <div className="product-info">
                          <div className="product-name">{product.name}</div>
                          <div className="product-details">
                            SKU: {product.sku} | Category: {product.category}
                          </div>
                          <div className="stock-info">
                            Current Stock: {product.stock}
                          </div>
                        </div>
                      </td>
                      <td className="supplier-cell">
                        <div className="supplier-info">
                          <div className="supplier-name">{supplier.name}</div>
                          <div className="supplier-details">
                            {supplier.company}
                          </div>
                          <div className="contact-info">
                            {supplier.email} | {supplier.phone}
                          </div>
                        </div>
                      </td>
                      <td className="quantity-cell">
                        <span className="quantity-value">{order.quantity}</span>
                      </td>
                      <td className="date-cell">
                        {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="status-cell">
                        <span className={`status-badge status-${order.status || 'pending'}`}>
                          {(order.status || 'pending').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No Orders Found</h3>
            <p>You haven't placed any orders yet.</p>
            <button 
              onClick={() => window.location.href = '/re-order'}
              className="primary-btn"
            >
              Place Your First Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Order_Place;