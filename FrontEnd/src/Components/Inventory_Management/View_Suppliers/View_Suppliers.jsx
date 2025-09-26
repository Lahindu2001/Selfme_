import React, { useEffect, useState } from "react";
import axios from "axios";
import InventoryManagementNav from "../Inventory_Management_Nav/Inventory_Management_Nav";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import logo from "./logo selfme.png"; // make sure this path is correct
import "./View_Suppliers.css";

const View_Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Fetch all suppliers
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/suppliers");
      setSuppliers(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch suppliers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Open edit modal
  const openEditModal = (supplier) => {
    setSelectedSupplier({
      ...supplier,
      newImage: null,
      imagePreview: supplier.image
        ? `http://localhost:5000/uploads/${supplier.image}`
        : null,
    });
    setIsEditModalOpen(true);
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  // Handle input change in edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedSupplier((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image change in edit form
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedSupplier((prev) => ({
        ...prev,
        newImage: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  // Update supplier
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const formData = new FormData();
      Object.keys(selectedSupplier).forEach((key) => {
        if (
          key !== "image" &&
          key !== "imagePreview" &&
          selectedSupplier[key] !== undefined
        ) {
          formData.append(key, selectedSupplier[key] || "");
        }
      });

      if (selectedSupplier.newImage) {
        formData.append("image", selectedSupplier.newImage);
      }

      await axios.put(
        `http://localhost:5000/suppliers/${selectedSupplier._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setUpdateSuccess(true);
      setIsEditModalOpen(false);
      fetchSuppliers();
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      setUpdateError(err.response?.data?.error || "Failed to update supplier.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Delete supplier
  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/suppliers/${supplierToDelete._id}`
      );
      setSuppliers(suppliers.filter((s) => s._id !== supplierToDelete._id));
      setIsDeleteModalOpen(false);
      setSupplierToDelete(null);
    } catch (err) {
      alert("Failed to delete supplier.");
    }
  };

  // Open delete modal
  const openDeleteModal = (supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteModalOpen(true);
  };

  // ------------------- PDF GENERATION FUNCTION -------------------
  const handlePrintPDF = () => {
    if (!suppliers.length) return alert("No suppliers to export.");

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
        doc.text(
          "No/346, Madalanda, Dompe, Colombo, Sri Lanka",
          margin + 25,
          21
        );
        doc.text(
          "Phone: +94 717 882 883 | Email: Selfmepvtltd@gmail.com",
          margin + 25,
          26
        );

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, 32, pageWidth - margin, 32);

        doc.setFontSize(14);
        doc.setTextColor(0, 53, 128);
        doc.text("SUPPLIER LIST REPORT", pageWidth / 2, 45, {
          align: "center",
        });

        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(
          `Generated on: ${formattedDate} at ${formattedTime}`,
          margin,
          55
        );
        doc.text(`Total Suppliers: ${suppliers.length}`, margin, 62);

        const tableColumns = [
          { header: "#", dataKey: "index" },
          { header: "Name", dataKey: "name" },
          { header: "Company", dataKey: "company" },
          { header: "Email", dataKey: "email" },
          { header: "Phone", dataKey: "phone" },
          { header: "Status", dataKey: "status" },
        ];

        const tableData = suppliers.map((s, i) => ({
          index: i + 1,
          name: s.name || "N/A",
          company: s.company_name || "N/A",
          email: s.email || "N/A",
          phone: s.phone || "N/A",
          status: s.status || "Active",
        }));

        doc.autoTable({
          columns: tableColumns,
          body: tableData,
          startY: 75,
          margin: { left: margin, right: margin },
          theme: "grid",
          headStyles: {
            fillColor: [0, 53, 128],
            textColor: 255,
            fontStyle: "bold",
            halign: "center",
          },
          columnStyles: {
            index: { halign: "center", fontStyle: "bold" },
            status: { halign: "center" },
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

        doc.save(`Supplier_List_${formattedDate.replace(/\//g, "-")}.pdf`);
      };
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Error generating PDF.");
    }
  };

  return (
    <div id="suppliers-page">
      <InventoryManagementNav />

      <div id="suppliers-content" className="suppliers-content">
        {/* Header */}
        <div id="suppliers-header" className="page-header">
          <div className="header-info">
            <h1>Supplier Management</h1>
            <p>Manage all supplier information and details</p>
          </div>
          <div className="header-actions">
            <button
              className="btn-primary"
              onClick={() => (window.location.href = "/supplier")}
            >
              Add New Supplier
            </button>
          </div>
        </div>

        {/* Stats */}
        <div id="suppliers-stats" className="stats-container">
          <div className="stat-item">
            <h3>{suppliers.length}</h3>
            <p>Total Suppliers</p>
          </div>
          <div className="stat-item">
            <h3>{suppliers.filter((s) => s.status === "Active").length}</h3>
            <p>Active Suppliers</p>
          </div>
          <div className="stat-item">
            <h3>{suppliers.filter((s) => s.status === "Inactive").length}</h3>
            <p>Inactive Suppliers</p>
          </div>
        </div>

        {error && (
          <div id="suppliers-error" className="alert alert-error">
            {error}
          </div>
        )}
        {updateSuccess && (
          <div id="suppliers-success" className="alert alert-success">
            Supplier updated successfully!
          </div>
        )}

        {/* PDF Button */}
        <button
          className="btn-secondary"
          style={{ marginLeft: "10px", marginBottom: "1.5rem" }}
          onClick={handlePrintPDF}
        >
          Generate PDF
        </button>

        {/* Supplier Cards */}
        <div id="suppliers-container" className="suppliers-container">
          {loading ? (
            <div id="suppliers-loading" className="loading-state">
              <div className="spinner"></div>
              <p>Loading suppliers...</p>
            </div>
          ) : suppliers.length === 0 ? (
            <div id="suppliers-empty" className="empty-state">
              <p>No suppliers found.</p>
              <button
                className="btn-primary"
                onClick={() => (window.location.href = "/supplier")}
              >
                Add Your First Supplier
              </button>
            </div>
          ) : (
            <div id="suppliers-grid" className="suppliers-grid">
              {suppliers.map((supplier) => (
                <div key={supplier._id} className="supplier-card">
                  <div className="supplier-header">
                    <div className="supplier-image-container">
                      {supplier.image ? (
                        <img
                          src={`http://localhost:5000/uploads/${supplier.image}`}
                          alt={supplier.name}
                          className="supplier-image"
                        />
                      ) : (
                        <div className="supplier-image-placeholder">
                          {supplier.name?.charAt(0).toUpperCase() || "S"}
                        </div>
                      )}
                    </div>
                    <div className="supplier-title">
                      <h3 className="supplier-name">{supplier.name}</h3>
                      <span
                        className={`status-badge status-${
                          supplier.status?.toLowerCase() || "active"
                        }`}
                      >
                        {supplier.status || "Active"}
                      </span>
                    </div>
                  </div>

                  <div className="supplier-info">
                    <div className="info-item">
                      <span className="info-label">Company:</span>
                      <span className="info-value">
                        {supplier.company_name || "Not specified"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">
                        {supplier.email || "Not provided"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Phone:</span>
                      <span className="info-value">
                        {supplier.phone || "Not provided"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Address:</span>
                      <span className="info-value">
                        {supplier.address || "Not provided"}
                      </span>
                    </div>
                    {supplier.remark && (
                      <div className="info-item">
                        <span className="info-label">Remark:</span>
                        <span className="info-value">{supplier.remark}</span>
                      </div>
                    )}
                  </div>

                  <div className="supplier-actions">
                    <button
                      className="btn-edit"
                      onClick={() => openEditModal(supplier)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => openDeleteModal(supplier)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedSupplier && (
        <div id="edit-modal-overlay" className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Supplier</h2>
              <button
                className="modal-close"
                onClick={() => setIsEditModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdate} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="edit-name">Supplier Name *</label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    value={selectedSupplier.name}
                    onChange={handleInputChange}
                    placeholder="Supplier Name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-company">Company Name</label>
                  <input
                    type="text"
                    id="edit-company"
                    name="company_name"
                    value={selectedSupplier.company_name || ""}
                    onChange={handleInputChange}
                    placeholder="Company Name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-email">Email</label>
                  <input
                    type="email"
                    id="edit-email"
                    name="email"
                    value={selectedSupplier.email || ""}
                    onChange={handleInputChange}
                    placeholder="Email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-phone">Phone</label>
                  <input
                    type="tel"
                    id="edit-phone"
                    name="phone"
                    value={selectedSupplier.phone || ""}
                    onChange={handleInputChange}
                    placeholder="Phone"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-status">Status</label>
                  <select
                    id="edit-status"
                    name="status"
                    value={selectedSupplier.status || "Active"}
                    onChange={handleInputChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="edit-address">Address</label>
                  <textarea
                    id="edit-address"
                    name="address"
                    value={selectedSupplier.address || ""}
                    onChange={handleInputChange}
                    placeholder="Address"
                    rows="3"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="edit-remark">Remark</label>
                  <textarea
                    id="edit-remark"
                    name="remark"
                    value={selectedSupplier.remark || ""}
                    onChange={handleInputChange}
                    placeholder="Remark"
                    rows="2"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="edit-image">Supplier Image</label>
                  <input
                    type="file"
                    id="edit-image"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  {selectedSupplier.imagePreview && (
                    <div className="image-preview">
                      <img src={selectedSupplier.imagePreview} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>

              {updateError && <div className="form-error">{updateError}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={updateLoading}
                >
                  {updateLoading ? "Updating..." : "Update Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && supplierToDelete && (
        <div id="delete-modal-overlay" className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button
                className="modal-close"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <p>
                Are you sure you want to delete{" "}
                <strong>{supplierToDelete.name}</strong>?
              </p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                Delete Supplier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default View_Suppliers;
