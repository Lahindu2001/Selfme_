import React, { useState } from "react";
import axios from "axios";
import InventoryManagementNav from "../Inventory_Management_Nav/Inventory_Management_Nav";
import "./Supplier.css";

const Supplier = () => {
  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    email: "",
    phone: "",
    address: "",
    remark: "",
    status: "Active",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Invalid image file");
    if (file.size > 5 * 1024 * 1024) return setError("Max image size 5MB");
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return setError("Supplier name required");

    setIsLoading(true);
    setError("");
    setSuccess(false);

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key] || ""));
    if (image) data.append("image", image);

    try {
      await axios.post("http://localhost:5000/suppliers", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
      setFormData({ name: "", company_name: "", email: "", phone: "", address: "", remark: "", status: "Active" });
      setImage(null);
      setPreview(null);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add supplier");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({ name: "", company_name: "", email: "", phone: "", address: "", remark: "", status: "Active" });
    setImage(null);
    setPreview(null);
    setError("");
    setSuccess(false);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="supplier-page-wrapper">
      <InventoryManagementNav />
      <div className="supplier-form-container">
        <h2>Add New Supplier</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Supplier added successfully!</div>}

        <form onSubmit={handleSubmit} className="supplier-form">
          <input type="text" name="name" placeholder="Supplier Name*" value={formData.name} onChange={handleChange} required />
          <input type="text" name="company_name" placeholder="Company Name" value={formData.company_name} onChange={handleChange} />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <textarea name="address" placeholder="Address" value={formData.address} onChange={handleChange}></textarea>
          <textarea name="remark" placeholder="Remarks" value={formData.remark} onChange={handleChange}></textarea>

          <input type="file" accept="image/*" onChange={handleImageChange} />
          {preview && <img src={preview} alt="Preview" style={{ width: "100px", margin: "10px 0" }} />}

          <div>
            <button type="button" onClick={handleClear}>Clear</button>
            <button type="submit">{isLoading ? "Adding..." : "Add Supplier"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Supplier;
