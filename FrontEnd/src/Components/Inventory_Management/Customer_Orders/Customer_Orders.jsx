import React, { useEffect, useState } from "react";
import axios from "axios";
import InventoryManagementNav from "../Inventory_Management_Nav/Inventory_Management_Nav";
import "./Customer_Orders.css";

function Customer_Orders() {
  const [payments, setPayments] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomerOrders();
    fetchProducts();
  }, []);

  const fetchCustomerOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/payments");
      console.log("Payments API Response:", response.data); // Debug log
      setPayments(response.data.payments || response.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch customer orders");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/products");
      console.log("Products API Response:", response.data); // Debug log
      setProducts(response.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Debug function to check data structure
  const debugPaymentData = (payment) => {
    console.log("Payment itemId structure:", payment.itemId);
    console.log("Payment data:", payment);
  };

  // Find product details - IMPROVED VERSION
  const getProductDetails = (item) => {
    if (!item) return null;

    // If item is a string (serial number)
    if (typeof item === "string") {
      const product = products.find(
        (product) => product.serial_number === item
      );
      console.log("Searching product by string:", item, "Found:", product);
      return product;
    }

    // If item is an object with serialNumber property
    if (typeof item === "object" && item.serialNumber) {
      const product = products.find(
        (product) => product.serial_number === item.serialNumber
      );
      console.log(
        "Searching product by object:",
        item.serialNumber,
        "Found:",
        product
      );
      return product;
    }

    // If item is an object with _id property (direct product reference)
    if (typeof item === "object" && item._id) {
      const product = products.find((product) => product._id === item._id);
      console.log("Searching product by _id:", item._id, "Found:", product);
      return product;
    }

    return null;
  };

  // Get product name safely
  const getProductName = (item) => {
    const product = getProductDetails(item);
    return product ? product.item_name : "Unknown Product";
  };

  // Get product image safely - FIXED VERSION
  const getProductImage = (item) => {
    const product = getProductDetails(item);
    if (product && product.item_image) {
      // Check if image path is already a full URL
      if (product.item_image.startsWith("http")) {
        return product.item_image;
      }
      // Otherwise, construct the path like in View_All_Items
      return `http://localhost:5000/images/${product.item_image}`;
    }
    return "/placeholder-product.jpg";
  };

  // Get serial number from item
  const getSerialNumber = (item) => {
    if (typeof item === "string") return item;
    if (item && typeof item === "object") {
      if (item.serialNumber) return item.serialNumber;
      if (item.serial_number) return item.serial_number;
      if (item._id) return item._id.substring(0, 8); // Use first 8 chars of ID as fallback
    }
    return "N/A";
  };

  // Get quantity from item
  const getQuantity = (item) => {
    if (item && typeof item === "object") return item.quantity || 1;
    return 1;
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/payments/${orderId}`, {
        status: newStatus,
      });
      fetchCustomerOrders();
      return true;
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update order status");
      return false;
    }
  };

  const handleViewOrderDetails = (payment) => {
    setSelectedOrder(payment);
    setShowOrderModal(true);
  };

  const handleProcessOrder = async (orderId, currentStatus) => {
    if (currentStatus === "Pending") {
      if (window.confirm("Are you sure you want to confirm this order?")) {
        try {
          const success = await handleStatusUpdate(orderId, "Paid");
          if (success) {
            alert("Order confirmed successfully!");
          }
        } catch (err) {
          alert("Failed to confirm order");
        }
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "LKR 0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Paid":
        return "status-completed";
      case "Pending":
        return "status-pending";
      case "Failed":
        return "status-cancelled";
      default:
        return "status-pending";
    }
  };

  // Filter orders based on status and search term
  const filteredOrders = payments.filter((payment) => {
    const matchesStatus =
      filterStatus === "all" || payment.status === filterStatus;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      payment.payment_id?.toLowerCase().includes(searchLower) ||
      payment.invoice_id?.toLowerCase().includes(searchLower) ||
      payment.userId?.toLowerCase().includes(searchLower) ||
      payment.reference_no?.toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div>
        <InventoryManagementNav />
        <div className="customer-orders-container">
          <div className="orders-loading">
            <p>Loading customer orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <InventoryManagementNav />
      <div className="customer-orders-container">
        <div className="orders-header">
          <h1>Customer Orders</h1>
          <div className="header-controls">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Completed</option>
              <option value="Failed">Cancelled</option>
            </select>

            <div className="search-box">
              <input
                type="text"
                placeholder="Search by Order ID, Invoice ID, or Customer ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button onClick={fetchCustomerOrders}>Retry</button>
          </div>
        )}

        <div className="orders-stats">
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p>{payments.length}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p>{payments.filter((p) => p.status === "Pending").length}</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p>{payments.filter((p) => p.status === "Paid").length}</p>
          </div>
          <div className="stat-card">
            <h3>Cancelled</h3>
            <p>{payments.filter((p) => p.status === "Failed").length}</p>
          </div>
        </div>

        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer ID</th>
                <th>Products</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((payment) => {
                  // Debug the payment structure
                  debugPaymentData(payment);

                  // Get product details for this payment
                  const paymentItems = payment.itemId || [];
                  console.log("Payment items:", paymentItems);

                  return (
                    <tr key={payment._id} className="order-row">
                      <td className="order-id">
                        <div>
                          <strong>#{payment.payment_id || "N/A"}</strong>
                          <span>Invoice: {payment.invoice_id || "N/A"}</span>
                        </div>
                      </td>

                      <td className="customer-info">
                        <span>{payment.userId || "N/A"}</span>
                      </td>

                      <td className="products-info">
                        <div className="products-list">
                          {paymentItems.length > 0 ? (
                            <>
                              {paymentItems.slice(0, 2).map((item, index) => {
                                const product = getProductDetails(item);
                                console.log(
                                  `Item ${index}:`,
                                  item,
                                  "Product:",
                                  product
                                );

                                return (
                                  <div key={index} className="product-item">
                                    <img
                                      src={getProductImage(item)}
                                      alt={getProductName(item)}
                                      className="product-image"
                                      onError={(e) => {
                                        console.log(
                                          "Image load error for:",
                                          item
                                        );
                                        e.target.src =
                                          "/placeholder-product.jpg";
                                      }}
                                      onLoad={() =>
                                        console.log(
                                          "Image loaded successfully for:",
                                          item
                                        )
                                      }
                                    />
                                    <div className="product-details">
                                      <span className="product-name">
                                        {getProductName(item)}
                                      </span>
                                      <span className="product-serial">
                                        SN: {getSerialNumber(item)}
                                      </span>
                                      <span className="product-quantity">
                                        Qty: {getQuantity(item)}
                                      </span>
                                      {product && (
                                        <span className="product-category">
                                          {product.category}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                              {paymentItems.length > 2 && (
                                <span className="more-items">
                                  +{paymentItems.length - 2} more
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="no-products">
                              No products in this order
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="order-amount">
                        {formatCurrency(payment.amount)}
                      </td>

                      <td className="order-date">
                        {formatDate(payment.payment_date)}
                      </td>

                      <td className="order-status">
                        <span
                          className={`status-badge ${getStatusBadgeClass(
                            payment.status
                          )}`}
                        >
                          {payment.status || "Pending"}
                        </span>
                      </td>

                      <td className="order-actions">
                        <button
                          className="btn-view"
                          onClick={() => handleViewOrderDetails(payment)}
                        >
                          View Details
                        </button>
                        {payment.status === "Pending" && (
                          <button
                            className="btn-process"
                            onClick={() =>
                              handleProcessOrder(payment._id, payment.status)
                            }
                          >
                            Confirm Order
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="no-orders">
                    <p>No orders found</p>
                    {searchTerm && (
                      <button
                        className="clear-search"
                        onClick={() => setSearchTerm("")}
                      >
                        Clear Search
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showOrderModal && selectedOrder && (
          <div className="modal-overlay">
            <div className="order-modal">
              <div className="modal-header">
                <h2>Order Details - #{selectedOrder.payment_id || "N/A"}</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowOrderModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-content">
                <div className="order-details-section">
                  <h3>Order Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Payment ID:</label>
                      <span>{selectedOrder.payment_id || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Invoice ID:</label>
                      <span>{selectedOrder.invoice_id || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Customer ID:</label>
                      <span>{selectedOrder.userId || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Order Date:</label>
                      <span>{formatDate(selectedOrder.payment_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="order-details-section">
                  <h3>Payment Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Total Amount:</label>
                      <span>{formatCurrency(selectedOrder.amount)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Payment Method:</label>
                      <span>{selectedOrder.payment_method || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Reference No:</label>
                      <span>{selectedOrder.reference_no || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <span
                        className={`status-badge ${getStatusBadgeClass(
                          selectedOrder.status
                        )}`}
                      >
                        {selectedOrder.status || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="order-details-section">
                  <h3>
                    Ordered Products ({selectedOrder.itemId?.length || 0})
                  </h3>
                  <div className="products-grid">
                    {selectedOrder.itemId && selectedOrder.itemId.length > 0 ? (
                      selectedOrder.itemId.map((item, index) => {
                        const product = getProductDetails(item);
                        return (
                          <div key={index} className="modal-product-item">
                            <img
                              src={getProductImage(item)}
                              alt={getProductName(item)}
                              className="modal-product-image"
                              onError={(e) => {
                                e.target.src = "/placeholder-product.jpg";
                              }}
                            />
                            <div className="modal-product-details">
                              <h4>{getProductName(item)}</h4>
                              <div className="product-meta">
                                <span>Serial: {getSerialNumber(item)}</span>
                                <span>Quantity: {getQuantity(item)}</span>
                                {product ? (
                                  <>
                                    <span>
                                      Category: {product.category || "N/A"}
                                    </span>
                                    <span>
                                      Price:{" "}
                                      {formatCurrency(
                                        product.selling_price || 0
                                      )}
                                    </span>
                                    <span>
                                      Stock: {product.quantity_in_stock || 0}
                                    </span>
                                    <span>
                                      Image:{" "}
                                      {product.item_image
                                        ? "Available"
                                        : "Not available"}
                                    </span>
                                  </>
                                ) : (
                                  <span className="product-not-found">
                                    Product details not available. Item data:{" "}
                                    {JSON.stringify(item)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="no-products">No products in this order</p>
                    )}
                  </div>
                </div>

                <div className="modal-actions">
                  {selectedOrder.status === "Pending" && (
                    <button
                      className="btn-process"
                      onClick={() => {
                        handleProcessOrder(
                          selectedOrder._id,
                          selectedOrder.status
                        );
                        setShowOrderModal(false);
                      }}
                    >
                      Confirm Order
                    </button>
                  )}
                  <button
                    className="btn-close"
                    onClick={() => setShowOrderModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Customer_Orders;
