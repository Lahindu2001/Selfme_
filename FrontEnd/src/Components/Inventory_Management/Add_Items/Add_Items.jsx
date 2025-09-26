import React, { useState, useEffect } from "react";
import axios from "axios";
import InventoryManagementNav from "../Inventory_Management_Nav/Inventory_Management_Nav";
import "./Add_Items.css";

const Add_Items = () => {
  const [formData, setFormData] = useState({
    serial_number: "",
    item_name: "",
    category: "",
    description: "",
    quantity_in_stock: "",
    re_order_level: "",
    supplier_name: "",
    purchase_price: "",
    selling_price: "",
    status: "Available",
    product_remark: "",
  });

  const [itemImage, setItemImage] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [errors, setErrors] = useState({});

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

  const statusOptions = ["Available", "Coming Soon", "Damaged", "Returned"];

  // Fetch active suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/suppliers");
        setSuppliers(res.data.filter((s) => s.status === "Active"));
      } catch (err) {
        console.error("Error fetching suppliers:", err);
      }
    };
    fetchSuppliers();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    setItemImage(e.target.files[0]);
  };

  // Serial number generator
  const generateSerialNumber = () => {
    const sn = `SN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setFormData((prev) => ({ ...prev, serial_number: sn }));
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.serial_number)
      newErrors.serial_number = "Serial number required";
    if (!formData.item_name) newErrors.item_name = "Product name required";
    if (!formData.category) newErrors.category = "Select a category";
    if (!formData.quantity_in_stock || formData.quantity_in_stock < 0)
      newErrors.quantity_in_stock = "Quantity must be 0 or more";
    if (!formData.re_order_level || formData.re_order_level < 0)
      newErrors.re_order_level = "Re-order level must be 0 or more";
    if (!formData.supplier_name) newErrors.supplier_name = "Select a supplier";
    if (!formData.purchase_price || formData.purchase_price < 0)
      newErrors.purchase_price = "Purchase price must be 0 or more";
    if (!formData.selling_price || formData.selling_price < 0)
      newErrors.selling_price = "Selling price must be 0 or more";
    if (
      (formData.status === "Damaged" || formData.status === "Returned") &&
      !formData.product_remark
    )
      newErrors.product_remark = "Remark required for Damaged/Returned items";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const data = new FormData();
      const numericFields = [
        "quantity_in_stock",
        "re_order_level",
        "purchase_price",
        "selling_price",
      ];
      Object.keys(formData).forEach((key) => {
        let value = formData[key];
        if (numericFields.includes(key))
          value = value === "" ? null : Number(value);
        data.append(key, value);
      });
      if (itemImage) data.append("item_image", itemImage);

      const res = await axios.post("http://localhost:5000/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Product added successfully!");
      setFormData({
        serial_number: "",
        item_name: "",
        category: "",
        description: "",
        quantity_in_stock: "",
        re_order_level: "",
        supplier_name: "",
        purchase_price: "",
        selling_price: "",
        status: "Available",
        product_remark: "",
      });
      setItemImage(null);
      setErrors({});
    } catch (error) {
      if (error.response) {
        if (error.response.data.code === 11000) {
          alert("Error: Serial Number already exists!");
        } else {
          alert(`Error: ${error.response.data.message}`);
        }
      } else {
        alert("Error adding product");
      }
    }
  };

  return (
    <div>
      <InventoryManagementNav />
      <div className="add-item-container">
        <h2>Add New Product</h2>
        <form onSubmit={handleSubmit} className="add-item-form">
          {/* Basic Info */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <div className="form-group serial-number-group">
                <label>Serial Number *</label>
                <div className="serial-input-container">
                  <input
                    type="text"
                    name="serial_number"
                    placeholder="SN12345"
                    value={formData.serial_number}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="generate-btn"
                    onClick={generateSerialNumber}
                  >
                    Generate
                  </button>
                </div>
                {errors.serial_number && (
                  <span className="error-text">{errors.serial_number}</span>
                )}
              </div>

              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="item_name"
                  placeholder="Battery Z300"
                  value={formData.item_name}
                  onChange={handleChange}
                  required
                />
                {errors.item_name && (
                  <span className="error-text">{errors.item_name}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat, index) => (
                    <option key={index} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className="error-text">{errors.category}</span>
                )}
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  {statusOptions.map((status, index) => (
                    <option key={index} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Upload Product Image</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          {/* Inventory Info */}
          <div className="form-section">
            <h3>Inventory Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Quantity in Stock *</label>
                <input
                  type="number"
                  name="quantity_in_stock"
                  value={formData.quantity_in_stock}
                  onChange={handleChange}
                />
                {errors.quantity_in_stock && (
                  <span className="error-text">{errors.quantity_in_stock}</span>
                )}
              </div>
              <div className="form-group">
                <label>Re-order Level *</label>
                <input
                  type="number"
                  name="re_order_level"
                  value={formData.re_order_level}
                  onChange={handleChange}
                />
                {errors.re_order_level && (
                  <span className="error-text">{errors.re_order_level}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Supplier *</label>
              <select
                name="supplier_name"
                value={formData.supplier_name}
                onChange={handleChange}
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map((sup) => (
                  <option key={sup._id} value={sup.name}>
                    {sup.name} | {sup.company_name || "No Company"} |{" "}
                    {sup.email || "No Email"}
                  </option>
                ))}
              </select>
              {errors.supplier_name && (
                <span className="error-text">{errors.supplier_name}</span>
              )}
            </div>
          </div>

          {/* Pricing Info */}
          <div className="form-section">
            <h3>Pricing Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Purchase Price *</label>
                <input
                  type="number"
                  name="purchase_price"
                  value={formData.purchase_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
                {errors.purchase_price && (
                  <span className="error-text">{errors.purchase_price}</span>
                )}
              </div>
              <div className="form-group">
                <label>Selling Price *</label>
                <input
                  type="number"
                  name="selling_price"
                  value={formData.selling_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
                {errors.selling_price && (
                  <span className="error-text">{errors.selling_price}</span>
                )}
              </div>
            </div>
          </div>

          {/* Remarks */}
          {(formData.status === "Damaged" ||
            formData.status === "Returned") && (
            <div className="form-section">
              <h3>Remarks</h3>
              <div className="form-group">
                <label>
                  {formData.status === "Damaged"
                    ? "Damage Details *"
                    : "Return Reason *"}
                </label>
                <textarea
                  name="product_remark"
                  value={formData.product_remark}
                  onChange={handleChange}
                  rows="3"
                />
                {errors.product_remark && (
                  <span className="error-text">{errors.product_remark}</span>
                )}
              </div>
            </div>
          )}

          <button type="submit" className="form-submit-btn">
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default Add_Items;