import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import InventoryManagementNav from "../Inventory_Management_Nav/Inventory_Management_Nav";
import "./View_All_Items.css";

const View_All_Items = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
    lowStock: false,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    item: null,
    loading: false,
  });
  const [editModal, setEditModal] = useState({
    isOpen: false,
    item: null,
    loading: false,
    formData: {},
    imagePreview: null,
    newImage: null,
  });
  const navigate = useNavigate();

  const categories = [
    "Solar Panels",
    "Solar Batteries",
    "Solar Inverters",
    "Solar Controllers",
    "Solar Wires & Cables",
    "Mounting Structures & Accessories",
    "Solar Lights & Devices",
    "Solar Pumps & Appliances",
    "Monitoring & Miscellaneous Accessories",
  ];

  const statusOptions = ["Available", "Damaged", "Returned", "Sold Out"];

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/suppliers");
        setSuppliers(res.data);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
      }
    };
    fetchSuppliers();
  }, []);

  // Fetch items
  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category !== "all")
        params.append("category", filters.category);
      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
      if (filters.lowStock) params.append("lowStock", "true");

      const res = await axios.get(`http://localhost:5000/products?${params}`);
      setItems(res.data);
      setFilteredItems(res.data);
    } catch (error) {
      console.error("Error fetching items:", error);
      setError("Failed to fetch items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [
    filters.category,
    filters.status,
    filters.sortBy,
    filters.sortOrder,
    filters.lowStock,
  ]);

  // Search
  useEffect(() => {
    const results = items.filter((item) =>
      Object.values(item).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredItems(results);
  }, [searchTerm, items]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleSortChange = (sortBy, sortOrder) => {
    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
  };

  const openDeleteModal = (item) => {
    setDeleteModal({ isOpen: true, item, loading: false });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, item: null, loading: false });
  };

  const openEditModal = (item) => {
    setEditModal({
      isOpen: true,
      item,
      loading: false,
      formData: {
        serial_number: item.serial_number,
        item_name: item.item_name,
        category: item.category,
        description: item.description || "",
        quantity_in_stock: item.quantity_in_stock,
        re_order_level: item.re_order_level,
        supplier_name: item.supplier_name || "",
        purchase_price: item.purchase_price,
        selling_price: item.selling_price,
        status: item.status,
        product_remark: item.product_remark || "",
      },
      imagePreview: item.item_image
        ? `http://localhost:5000/images/${item.item_image}`
        : null,
      newImage: null,
    });
  };

  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      item: null,
      loading: false,
      formData: {},
      imagePreview: null,
      newImage: null,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditModal((prev) => ({
      ...prev,
      formData: { ...prev.formData, [name]: value },
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditModal((prev) => ({
        ...prev,
        newImage: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.item) return;
    try {
      setDeleteModal((prev) => ({ ...prev, loading: true }));
      await axios.delete(
        `http://localhost:5000/products/${deleteModal.item._id}`
      );
      alert(`"${deleteModal.item.item_name}" has been deleted successfully!`);
      fetchItems();
      closeDeleteModal();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete item");
      closeDeleteModal();
    }
  };

  const handleUpdateConfirm = async () => {
    if (!editModal.item) return;
    try {
      setEditModal((prev) => ({ ...prev, loading: true }));

      const formData = new FormData();
      Object.keys(editModal.formData).forEach((key) =>
        formData.append(key, editModal.formData[key])
      );

      if (editModal.newImage) formData.append("item_image", editModal.newImage);

      await axios.put(
        `http://localhost:5000/products/${editModal.item._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert(`"${editModal.item.item_name}" has been updated successfully!`);
      fetchItems();
      closeEditModal();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update item");
      setEditModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const totalValue = items.reduce(
    (sum, item) => sum + item.quantity_in_stock * item.selling_price,
    0
  );

  if (loading) {
    return (
      <div>
        <InventoryManagementNav />
        <div className="loading-container">
          <p className="loading-text">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <InventoryManagementNav />
      <div className="view-items-container">
        <div className="page-header">
          <h2>Inventory Management</h2>
          <button
            className="add-item-btn"
            onClick={() => navigate("/add-item")}
          >
            + Add New Item
          </button>
        </div>

        {/* Statistics */}
        <div className="stats-container">
          <div className="stat-card">
            <h3>Total Items</h3>
            <p className="stat-number">{items.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Value</h3>
            <p className="stat-number">LKR {totalValue.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Low Stock Items</h3>
            <p className="stat-number">
              {
                items.filter(
                  (item) => item.quantity_in_stock <= item.re_order_level
                ).length
              }
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="filters-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="filter-group">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="all">All Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) =>
                handleSortChange(e.target.value, filters.sortOrder)
              }
            >
              <option value="createdAt">Sort by Date</option>
              <option value="item_name">Sort by Name</option>
              <option value="selling_price">Sort by Price</option>
              <option value="quantity_in_stock">Sort by Stock</option>
            </select>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.lowStock}
                onChange={(e) =>
                  handleFilterChange("lowStock", e.target.checked)
                }
              />
              Show Low Stock Only
            </label>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Items Grid */}
        <div className="items-grid">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item._id} className="item-card">
                <div className="item-image-container">
                  <img
                    src={
                      item.item_image
                        ? `http://localhost:5000/images/${item.item_image}`
                        : "/placeholder-image.png"
                    }
                    alt={item.item_name}
                    className="item-image"
                    onError={(e) => {
                      e.target.src = "/placeholder-image.png";
                    }}
                  />
                  {item.quantity_in_stock <= item.re_order_level && (
                    <div className="low-stock-badge">Low Stock</div>
                  )}
                </div>

                <div className="item-details">
                  <h3 className="item-name">{item.item_name}</h3>
                  <p className="item-serial">SN: {item.serial_number}</p>
                  <p className="item-category">{item.category}</p>
                  <p className="item-supplier">
                    Supplier: {item.supplier_name || "N/A"}
                  </p>

                  <div className="item-stock-info">
                    <span className="stock-quantity">
                      {item.quantity_in_stock} in stock
                    </span>
                    <span className="reorder-level">
                      Reorder at: {item.re_order_level}
                    </span>
                  </div>

                  <div className="item-pricing">
                    <span className="selling-price">
                      LKR {item.selling_price?.toLocaleString()}
                    </span>
                    <span className="cost-price">
                      Cost: LKR {item.purchase_price?.toLocaleString()}
                    </span>
                  </div>

                  <div className="item-status">
                    <span
                      className={`status-badge status-${item.status.toLowerCase()}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {item.product_remark && (
                    <p className="item-remark">Remark: {item.product_remark}</p>
                  )}
                </div>

                <div className="item-actions">
                  <button
                    className="btn-update"
                    onClick={() => openEditModal(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => openDeleteModal(item)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-items-found">
              <p>No items found{searchTerm && ` matching "${searchTerm}"`}.</p>
              {searchTerm && (
                <button
                  className="btn-clear-search"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Delete Modal */}
        {deleteModal.isOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Confirm Delete</h3>
                <button className="modal-close" onClick={closeDeleteModal}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                <p>Are you sure you want to delete this item?</p>
                <div className="item-to-delete">
                  <strong>{deleteModal.item?.item_name}</strong>
                  <br />
                  <span>Serial: {deleteModal.item?.serial_number}</span>
                  <br />
                  <span>Category: {deleteModal.item?.category}</span>
                </div>
                <p className="warning-text">
                  ⚠️ This action cannot be undone. All item data will be
                  permanently deleted.
                </p>
              </div>

              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={closeDeleteModal}
                  disabled={deleteModal.loading}
                >
                  Cancel
                </button>
                <button
                  className="btn-confirm-delete"
                  onClick={handleDeleteConfirm}
                  disabled={deleteModal.loading}
                >
                  {deleteModal.loading ? "Deleting..." : "Yes, Delete Item"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModal.isOpen && (
          <div className="modal-overlay">
            <div className="modal-content edit-modal">
              <div className="modal-header">
                <h3>Edit Product: {editModal.item?.item_name}</h3>
                <button className="modal-close" onClick={closeEditModal}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="edit-form">
                  {/* Image Upload */}
                  <div className="form-group">
                    <label>Product Image</label>
                    <div className="image-upload-container">
                      <img
                        src={editModal.imagePreview || "/placeholder-image.png"}
                        alt="Preview"
                        className="image-preview"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="image-upload-input"
                      />
                      <button
                        type="button"
                        className="btn-upload"
                        onClick={() =>
                          document.querySelector(".image-upload-input").click()
                        }
                      >
                        Change Image
                      </button>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>Serial Number *</label>
                      <input
                        type="text"
                        name="serial_number"
                        value={editModal.formData.serial_number}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Product Name *</label>
                      <input
                        type="text"
                        name="item_name"
                        value={editModal.formData.item_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        name="category"
                        value={editModal.formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Status *</label>
                      <select
                        name="status"
                        value={editModal.formData.status}
                        onChange={handleInputChange}
                        required
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Supplier *</label>
                    <select
                      name="supplier_name"
                      value={editModal.formData.supplier_name || ""}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Supplier</option>
                      {suppliers
                        .filter((supplier) => supplier.status === "Active") // Only active suppliers
                        .map((supplier) => (
                          <option key={supplier._id} value={supplier.name}>
                            {supplier.name}{" "}
                            {supplier.company_name
                              ? `- ${supplier.company_name}`
                              : ""}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={editModal.formData.description}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>

                  {/* Inventory Info */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>Quantity in Stock *</label>
                      <input
                        type="number"
                        name="quantity_in_stock"
                        value={editModal.formData.quantity_in_stock}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Re-order Level *</label>
                      <input
                        type="number"
                        name="re_order_level"
                        value={editModal.formData.re_order_level}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Prices */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>Purchase Price *</label>
                      <input
                        type="number"
                        name="purchase_price"
                        value={editModal.formData.purchase_price}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Selling Price *</label>
                      <input
                        type="number"
                        name="selling_price"
                        value={editModal.formData.selling_price}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Product Remark</label>
                    <textarea
                      name="product_remark"
                      value={editModal.formData.product_remark}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={closeEditModal}
                  disabled={editModal.loading}
                >
                  Cancel
                </button>
                <button
                  className="btn-confirm-update"
                  onClick={handleUpdateConfirm}
                  disabled={editModal.loading}
                >
                  {editModal.loading ? "Updating..." : "Update Item"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default View_All_Items;
