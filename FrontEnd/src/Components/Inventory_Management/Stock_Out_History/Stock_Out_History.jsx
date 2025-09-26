import React, { useEffect, useState } from "react";
import axios from "axios";
import InventoryManagementNav from "../Inventory_Management_Nav/Inventory_Management_Nav";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import "./Stock_Out_History.css";
import logo from "./logo selfme.png"; // Make sure this path is correct

const API = "http://localhost:5000";

const Stock_Outs_History = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalAmount: 0,
    customerOrders: 0,
    technicalOrders: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/stockouts`);
      const confirmedOrders = (res.data || []).filter(
        (o) => (o.status || "").toLowerCase() === "confirmed"
      );
      const sortedOrders = confirmedOrders.sort(
        (a, b) =>
          new Date(b.createdAt || b.orderDate) -
          new Date(a.createdAt || a.orderDate)
      );
      setOrders(sortedOrders);
      calculateStats(sortedOrders);
    } catch (err) {
      console.error("fetchOrders error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orders) => {
    setStats({
      totalOrders: orders.length,
      totalAmount: orders.reduce((sum, order) => sum + (order.total || 0), 0),
      customerOrders: orders.filter((o) => o.type === "customer").length,
      technicalOrders: orders.filter((o) => o.type === "technical").length,
    });
  };

  const openDetails = (order) => setSelected(order);
  const closeDetails = () => setSelected(null);

  const displayItemName = (it) =>
    it.item_name || (it.product && (it.product.item_name || it.product.itemName)) || "Item";

  // ---------------- PDF GENERATION ----------------
  const handlePrintPDF = () => {
    if (!orders.length) return alert("No orders to export.");

    try {
      const doc = new jsPDF("p", "mm", "a4");
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const date = new Date();
      const formattedDate = date.toLocaleDateString();
      const formattedTime = date.toLocaleTimeString();

      const img = new Image();
      img.src = logo;
      img.onload = () => {
        doc.addImage(img, "PNG", margin, 8, 20, 20);

        doc.setFontSize(16);
        doc.setTextColor(33, 37, 41);
        doc.text("SelfMe Pvt Ltd", margin + 25, 15);

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text("No/346, Madalanda, Dompe, Colombo, Sri Lanka", margin + 25, 21);
        doc.text("Phone: +94 717 882 883 | Email: Selfmepvtltd@gmail.com", margin + 25, 26);

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, 32, pageWidth - margin, 32);

        doc.setFontSize(14);
        doc.setTextColor(0, 53, 128);
        doc.text("Stock Out Orders Report", pageWidth / 2, 45, { align: "center" });

        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Generated on: ${formattedDate} at ${formattedTime}`, margin, 55);
        doc.text(`Total Orders: ${orders.length}`, margin, 62);

        // ---------------- PDF TABLE BODY ----------------
        let tableColumns = [
          { header: "#", dataKey: "index" },
          { header: "Stock Out ID", dataKey: "stockOutId" },
          { header: "Order Type", dataKey: "type" },
          { header: "Item Name", dataKey: "itemName" },
          { header: "Qty", dataKey: "quantity" },
          { header: "Unit Price", dataKey: "unitPrice" },
          { header: "Subtotal", dataKey: "subtotal" },
          { header: "Total Amount", dataKey: "total" },
          { header: "Order Date & Time", dataKey: "dateTime" },
        ];

        let tableData = [];

        orders.forEach((order, i) => {
          const placed = new Date(order.createdAt || order.orderDate || Date.now());
          const dateTime = `${placed.toLocaleDateString()} ${placed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
          const items = order.items || [];
          const stockOutId = order.stock_out_id || `SO-${placed.getFullYear()}-${(i + 1).toString().padStart(4, '0')}`;

          items.forEach((it, idx) => {
            tableData.push({
              index: i + 1,
              stockOutId: stockOutId,
              type: order.type === "technical" ? "Technical" : "Customer",
              itemName: it.item_name || it.product?.item_name || "N/A",
              quantity: it.quantity,
              unitPrice: `LKR ${Number(it.price || 0).toLocaleString()}`,
              subtotal: `LKR ${(Number(it.price || 0) * Number(it.quantity || 0)).toLocaleString()}`,
              total: idx === 0 ? `LKR ${Number(order.total || 0).toLocaleString()}` : "",
              dateTime: idx === 0 ? dateTime : "",
            });
          });

          if (items.length === 0) {
            tableData.push({
              index: i + 1,
              stockOutId: stockOutId,
              type: order.type === "technical" ? "Technical" : "Customer",
              itemName: "N/A",
              quantity: "-",
              unitPrice: "-",
              subtotal: "-",
              total: `LKR ${Number(order.total || 0).toLocaleString()}`,
              dateTime: dateTime,
            });
          }
        });

        doc.autoTable({
          columns: tableColumns,
          body: tableData,
          startY: 75,
          theme: "grid",
          margin: { left: margin, right: margin },
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [0, 53, 128], textColor: 255, fontStyle: "bold", halign: "center" },
          columnStyles: {
            index: { halign: "center" },
            stockOutId: { halign: "center", fontStyle: "bold" },
            type: { halign: "center" },
            quantity: { halign: "center" },
            unitPrice: { halign: "right" },
            subtotal: { halign: "right" },
            total: { halign: "right" },
            dateTime: { halign: "center" },
          },
          didDrawPage: (data) => {
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
              `SelfMe Inventory Management System - Page ${data.pageNumber} of ${pageCount}`,
              pageWidth / 2,
              doc.internal.pageSize.height - 10,
              { align: "center" }
            );
          },
        });

        doc.save(`Stock_Out_History_${formattedDate.replace(/\//g, "-")}.pdf`);
      };
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Error generating PDF.");
    }
  };

  return (
    <div className="stockouts-history-page">
      <InventoryManagementNav />

      <div className="stockouts-container">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <h1>Stock Out History</h1>
          <p>Track confirmed stock out orders for customers and technical teams</p>
          <div className="header-actions">
            <button onClick={handlePrintPDF} className="btn-secondary">
              Generate PDF
            </button>
            <button onClick={fetchOrders} className="btn-primary" style={{ marginLeft: "10px" }}>
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-number">{stats.totalOrders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">LKR {stats.totalAmount.toLocaleString()}</div>
            <div className="stat-label">Total Value</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.customerOrders}</div>
            <div className="stat-label">Customer Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.technicalOrders}</div>
            <div className="stat-label">Technical Orders</div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="orders-section">
          <div className="section-header">
            <h2>Confirmed Orders</h2>
          </div>

          {loading ? (
            <p className="loading-text">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="empty-text">No confirmed orders available.</p>
          ) : (
            <div className="table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Stock Out ID</th>
                    <th>Type</th>
                    <th>Customer / Team</th>
                    <th>Items Count</th>
                    <th>Total Amount</th>
                    <th>Order Date</th>
                    <th>Order Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o, index) => {
                    const placed = new Date(o.createdAt || o.orderDate || Date.now());
                    const itemsCount = (o.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
                    const stockOutId = o.stock_out_id || `SO-${placed.getFullYear()}-${(index + 1).toString().padStart(4, '0')}`;

                    return (
                      <tr key={o._id}>
                        <td>{index + 1}</td>
                        <td className="stock-out-id-cell">
                          <strong>{stockOutId}</strong>
                        </td>
                        <td>{o.type === "technical" ? "Technical" : "Customer"}</td>
                        <td>{o.customer_id || (o.type === "technical" ? "Technical Team" : "N/A")}</td>
                        <td>{itemsCount}</td>
                        <td>LKR {Number(o.total || 0).toLocaleString()}</td>
                        <td>{placed.toLocaleDateString()}</td>
                        <td>{placed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                        <td>
                          <span className="status-badge confirmed">Confirmed</span>
                        </td>
                        <td>
                          <button onClick={() => openDetails(o)} className="view-btn">
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selected && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Order Details</h3>
                <button onClick={closeDetails} className="modal-close">
                  ×
                </button>
              </div>

              <div className="modal-content">
                <div className="modal-info">
                  <p><strong>Stock Out ID:</strong> {selected.stock_out_id || `SO-${new Date(selected.createdAt || selected.orderDate).getFullYear()}-0001`}</p>
                  <p><strong>Order Type:</strong> {selected.type === "technical" ? "Technical Team" : "Customer"}</p>
                  <p><strong>Customer/Team:</strong> {selected.customer_id || (selected.type === "technical" ? "Technical Team" : "N/A")}</p>
                  <p><strong>Date:</strong> {new Date(selected.createdAt || selected.orderDate).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {new Date(selected.createdAt || selected.orderDate).toLocaleTimeString()}</p>
                  <p><strong>Status:</strong> <span className="status-badge confirmed">Confirmed</span></p>
                </div>

                <div className="modal-items">
                  <h4>Order Items</h4>
                  <table className="modal-items-table">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Unit Price (LKR)</th>
                        <th>Subtotal (LKR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selected.items || []).map((it, idx) => (
                        <tr key={idx}>
                          <td>{displayItemName(it)}</td>
                          <td className="text-center">{it.quantity}</td>
                          <td className="text-right">{Number(it.price || 0).toLocaleString()}</td>
                          <td className="text-right">{(Number(it.price || 0) * Number(it.quantity || 0)).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="text-right"><strong>Grand Total:</strong></td>
                        <td className="text-right total-amount">
                          <strong>LKR {Number(selected.total || 0).toLocaleString()}</strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={closeDetails} className="modal-close-btn">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stock_Outs_History;