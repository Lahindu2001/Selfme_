import React, { useState, useEffect } from 'react';
import Nav from '../../Nav/Nav';
import axios from 'axios';
import jsPDF from 'jspdf';
import './supplyProducts.css';

const URL = 'http://localhost:5000/supply-products';
const SUPPLIERS_URL = 'http://localhost:5000/supply-products/suppliers';

function SupplyProducts() {
  // ------------------- STATES -------------------
  const [supplyProducts, setSupplyProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddSupplyProductForm, setShowAddSupplyProductForm] = useState(false);
  const [editingSupplyProductId, setEditingSupplyProductId] = useState(null);
  const [supplierNames, setSupplierNames] = useState([]);
  const [errors, setErrors] = useState({});

  // ------------------- SELECTED FIELDS FOR PDF -------------------
  const [selectedFields, setSelectedFields] = useState({
    serial_number: true,
    supplier_name: true,
    product_item: true,
    quantity: true,
    unit_price: true,
    created_at: true
  });

  // ------------------- FORM INPUTS -------------------
  const defaultInputs = {
    serial_number: '',
    supplier_name: '',
    product_item: '',
    quantity: '',
    unit_price: ''
  };
  const [inputs, setInputs] = useState(defaultInputs);
  const [editInputs, setEditInputs] = useState(defaultInputs);

  // ------------------- COMPANY INFORMATION -------------------
  const companyInfo = {
    name: 'SelfMe',
    tagline: 'FUTURE OF SUN - SOLAR POWER',
    address: ['No/346, Madalanda, Dompe,', 'Colombo, Sri Lanka'],
    phone: '+94 717 882 883',
    email: 'Selfmepvtltd@gmail.com',
    website: 'www.selfme.com'
  };

  // ------------------- VALIDATION -------------------
  const validateInputs = (inputs, isEdit = false) => {
    const newErrors = {};
    const prefix = isEdit ? 'edit_' : '';

    if (!inputs.serial_number || !inputs.serial_number.trim()) {
      newErrors[`${prefix}serial_number`] = 'Serial number is required';
    }
    if (!inputs.supplier_name || !/^[a-zA-Z\s]*$/.test(inputs.supplier_name)) {
      newErrors[`${prefix}supplier_name`] = 'Supplier name must contain only letters and spaces';
    }
    if (!inputs.product_item || !inputs.product_item.trim()) {
      newErrors[`${prefix}product_item`] = 'Product item is required';
    }
    const quantityNum = Number(inputs.quantity);
    if (isNaN(quantityNum) || !Number.isInteger(quantityNum) || quantityNum < 1) {
      newErrors[`${prefix}quantity`] = 'Quantity must be a positive integer';
    }
    const unitPriceNum = Number(inputs.unit_price);
    if (isNaN(unitPriceNum) || unitPriceNum < 0) {
      newErrors[`${prefix}unit_price`] = 'Unit price must be a non-negative number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ------------------- FETCH SUPPLY PRODUCTS -------------------
  const fetchSupplyProducts = async () => {
    try {
      const res = await axios.get(URL);
      setSupplyProducts(res.data.supplyProducts || []);
    } catch (err) {
      console.error('Error fetching supply products:', err);
      setSupplyProducts([]);
    }
  };

  // ------------------- FETCH SUPPLIER NAMES -------------------
  const fetchSupplierNames = async () => {
    try {
      const res = await axios.get(SUPPLIERS_URL);
      setSupplierNames(res.data.brandNames || []);
    } catch (err) {
      console.error('Error fetching supplier names:', err);
      setSupplierNames([]);
    }
  };

  useEffect(() => {
    fetchSupplyProducts();
    fetchSupplierNames();
  }, []);

  // ------------------- HANDLE INPUT CHANGE -------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field being edited
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditInputs((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field being edited
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ------------------- ADD SUPPLY PRODUCT -------------------
  const handleAddSupplyProduct = async (e) => {
    e.preventDefault();
    if (!validateInputs(inputs)) return;
    try {
      const res = await axios.post(URL, { ...inputs });
      setSupplyProducts([...supplyProducts, res.data]);
      setInputs(defaultInputs);
      setShowAddSupplyProductForm(false);
      setErrors({});
      alert('Supply product added successfully!');
    } catch (err) {
      console.error('Error adding supply product:', err);
      setErrors({ submit: err.response?.data?.message || 'Failed to add supply product' });
    }
  };

  // ------------------- EDIT SUPPLY PRODUCT -------------------
  const startEdit = (product) => {
    setEditingSupplyProductId(product._id);
    setEditInputs({ ...product });
    setErrors({});
  };

  const handleUpdateSupplyProduct = async (e) => {
    e.preventDefault();
    if (!validateInputs(editInputs, true)) return;
    try {
      const res = await axios.put(`${URL}/${editingSupplyProductId}`, { ...editInputs });
      setSupplyProducts(supplyProducts.map((p) => (p._id === editingSupplyProductId ? res.data : p)));
      setEditingSupplyProductId(null);
      setEditInputs(defaultInputs);
      setErrors({});
      alert('Supply product updated successfully!');
    } catch (err) {
      console.error('Error updating supply product:', err);
      setErrors({ submit: err.response?.data?.message || 'Failed to update supply product' });
    }
  };

  // ------------------- DELETE SUPPLY PRODUCT -------------------
  const handleDeleteSupplyProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supply product?')) return;
    try {
      await axios.delete(`${URL}/${id}`);
      setSupplyProducts(supplyProducts.filter((p) => p._id !== id));
      alert('Supply product deleted successfully!');
    } catch (err) {
      console.error('Error deleting supply product:', err);
      alert('Failed to delete supply product!');
    }
  };

  // ------------------- PDF GENERATION -------------------
  const getLogoAsBase64 = () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const base64 = canvas.toDataURL('image/png');
        resolve(base64);
      };
      img.onerror = () => {
        console.warn('Could not load logo, proceeding without it');
        resolve(null);
      };
      img.src = '/logo192.png';
    });
  };

  const generatePDF = async (data, title) => {
    if (!data.length) return alert('No supply products to download!');
    try {
      const logoBase64 = await getLogoAsBase64();
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const addLetterhead = () => {
        if (logoBase64) {
          doc.addImage(logoBase64, 'PNG', 15, 10, 30, 30);
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        doc.setTextColor(0, 0, 139);
        doc.text(companyInfo.name, logoBase64 ? 55 : pageWidth / 2, 25, { align: logoBase64 ? 'left' : 'center' });
        doc.setFontSize(12);
        doc.setTextColor(0, 128, 255);
        doc.text(companyInfo.tagline, logoBase64 ? 55 : pageWidth / 2, 35, { align: logoBase64 ? 'left' : 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 139);
        doc.text('Address:', 15, 50);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        companyInfo.address.forEach((line, index) => {
          doc.text(line, 15, 57 + index * 7);
        });
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 139);
        doc.text('Contact Information:', pageWidth - 85, 50);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(`Phone: ${companyInfo.phone}`, pageWidth - 85, 57);
        doc.text(`Email: ${companyInfo.email}`, pageWidth - 85, 64);
        doc.text(`Website: ${companyInfo.website}`, pageWidth - 85, 71);
        doc.setLineWidth(1.5);
        doc.setDrawColor(0, 0, 139);
        doc.line(15, 80, pageWidth - 15, 80);
        doc.setLineWidth(0.8);
        doc.setDrawColor(0, 128, 255);
        doc.line(15, 82, pageWidth - 15, 82);
      };

      const addFooter = (pageNum, totalPages) => {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(15, pageHeight - 30, pageWidth - 15, pageHeight - 30);
        const footerText = `This document is generated by ${companyInfo.name} Supply Products System`;
        doc.text(footerText, pageWidth / 2, pageHeight - 22, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 15, pageHeight - 12, { align: 'right' });
        const genDate = new Date().toLocaleDateString('en-GB');
        const genTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
        doc.text(`Generated: ${genDate} at ${genTime}`, 15, pageHeight - 12);
        doc.setTextColor(0, 0, 139);
        doc.text(companyInfo.website, pageWidth / 2, pageHeight - 5, { align: 'center' });
      };

      let totalPages = 1;
      let tempY = 95;
      data.forEach(() => {
        let fieldsCount = Object.keys(selectedFields).filter((field) => selectedFields[field]).length;
        let itemHeight = Math.ceil(fieldsCount / 2) * 12 + 35;
        if (tempY + itemHeight > pageHeight - 45) {
          totalPages++;
          tempY = 95;
        }
        tempY += itemHeight;
      });

      let currentPage = 1;
      let y = 95;
      addLetterhead();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      const titleText = title.toUpperCase();
      doc.text(titleText, pageWidth / 2, 90, { align: 'center' });

      data.forEach((product, idx) => {
        let fieldsCount = Object.keys(selectedFields).filter((field) => selectedFields[field]).length;
        let itemHeight = Math.ceil(fieldsCount / 2) * 12 + 35;
        if (y + itemHeight > pageHeight - 45) {
          addFooter(currentPage, totalPages);
          doc.addPage();
          currentPage++;
          addLetterhead();
          y = 95;
        }
        doc.setFillColor(240, 248, 255);
        doc.rect(15, y - 3, pageWidth - 30, 18, 'F');
        doc.setLineWidth(0.8);
        doc.setDrawColor(0, 0, 139);
        doc.rect(15, y - 3, pageWidth - 30, 18);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 139);
        doc.text(`SUPPLY PRODUCT #${String(idx + 1).padStart(3, '0')}`, 20, y + 8);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        doc.text(`Product ID: ${product.product_id || 'N/A'}`, pageWidth - 70, y + 8);
        y += 25;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        let leftY = y;
        let rightY = y;
        let isLeft = true;
        Object.keys(selectedFields).forEach((field) => {
          if (selectedFields[field]) {
            let label = field.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
            let value = product[field] || 'N/A';
            if (field === 'created_at') {
              value = new Date(value).toLocaleDateString('en-GB');
            }
            if (typeof value === 'string' && value.length > 35) {
              value = value.substring(0, 32) + '...';
            }
            const x = isLeft ? 25 : pageWidth / 2 + 10;
            const currentY = isLeft ? leftY : rightY;
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 139);
            doc.text(`${label}:`, x, currentY);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            doc.text(String(value), x + 50, currentY);
            if (isLeft) {
              leftY += 12;
            } else {
              rightY += 12;
            }
            isLeft = !isLeft;
          }
        });
        y = Math.max(leftY, rightY) + 15;
        if (idx < data.length - 1) {
          doc.setLineWidth(0.3);
          doc.setDrawColor(220, 220, 220);
          doc.line(25, y - 5, pageWidth - 25, y - 5);
          y += 15;
        }
      });

      addFooter(currentPage, totalPages);
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `${companyInfo.name}_${title.replace(/\s+/g, '_')}_${timestamp}.pdf`;
      doc.save(fileName);
      alert(`Professional report "${fileName}" downloaded successfully!`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // ------------------- DOWNLOAD FUNCTIONS -------------------
  const handleDownloadAll = () => generatePDF(supplyProducts, 'Complete Supply Products Directory Report');
  const handleDownloadSingle = (product) =>
    generatePDF([product], `Individual Supply Product Report - ${product.serial_number || 'Unnamed'}`);

  // ------------------- FILTERED SUPPLY PRODUCTS -------------------
  const filteredSupplyProducts = supplyProducts.filter(
    (product) =>
      (product.serial_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (product.supplier_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (product.product_item?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (String(product.product_id) || '').includes(searchTerm)
  );

  // ------------------- RENDER -------------------
  return (
    <div className="supply-products-section">
      <Nav />
      <div className="title-container">
        <h2 className="Title">Supply Products Management System</h2>
        <p className="subtitle">
          {companyInfo.name} - {companyInfo.tagline}
        </p>
      </div>
      <button
        className="add-user-toggle"
        onClick={() => setShowAddSupplyProductForm(!showAddSupplyProductForm)}
      >
        {showAddSupplyProductForm ? '✕ Hide Add Supply Product Form' : '➕ Show Add Supply Product Form'}
      </button>
      {showAddSupplyProductForm && (
        <div className="add-user-container">
          <h3>📝 Add New Supply Product</h3>
          <form className="add-user-form" onSubmit={handleAddSupplyProduct}>
            {Object.keys(defaultInputs).map((field) => (
              <div className="form-group" key={field}>
                <label htmlFor={field}>
                  {field.replace('_', ' ').replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
                </label>
                {field === 'supplier_name' ? (
                  <select
                    name={field}
                    value={inputs[field]}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      Select Supplier Name
                    </option>
                    {supplierNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field === 'quantity' || field === 'unit_price' ? 'number' : 'text'}
                    id={field}
                    name={field}
                    placeholder={`Enter ${field.replace('_', ' ').replace(/([A-Z])/g, ' $1').trim()}`}
                    value={inputs[field]}
                    onChange={handleChange}
                    required
                    min={field === 'quantity' ? 1 : field === 'unit_price' ? 0 : undefined}
                    step={field === 'unit_price' ? '0.01' : undefined}
                  />
                )}
                {errors[field] && <p className="error">{errors[field]}</p>}
              </div>
            ))}
            {errors.submit && <p className="error">{errors.submit}</p>}
            <button type="submit" className="submit-btn">
              Add Supply Product
            </button>
          </form>
        </div>
      )}
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search by Serial Number, Supplier Name, Product Item, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="download-options professional-section">
        <h3>📄 Professional Report Generation</h3>
        <p>Select the fields to include in your professional letterhead report:</p>
        <div className="field-checkboxes">
          {Object.keys(selectedFields).map((field) => (
            <label key={field} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedFields[field]}
                onChange={() => setSelectedFields((prev) => ({ ...prev, [field]: !prev[field] }))}
              />
              <span>{field.replace('_', ' ').replace(/([A-Z])/g, ' $1').trim().replace(/\b\w/g, (l) => l.toUpperCase())}</span>
            </label>
          ))}
        </div>
        <div className="download-buttons">
          <button className="download-all-btn" onClick={handleDownloadAll}>
            📊 Download Complete Directory ({supplyProducts.length} products)
          </button>
          <p className="download-note">
            Reports include professional letterhead with {companyInfo.name} logo, contact details, and formatted layouts.
          </p>
        </div>
      </div>
      <div className="users-table-container">
        <div className="table-header">
          <span className="table-user-count">📦 Total Products: {supplyProducts.length}</span>
          <span className="filtered-count">
            {searchTerm && `(Showing ${filteredSupplyProducts.length} filtered results)`}
          </span>
        </div>
        <table className="users-table">
          <thead>
            <tr>
              <th>Product ID</th>
              {Object.keys(defaultInputs).map((field) => (
                <th key={field}>{field.replace('_', ' ').replace(/([A-Z])/g, ' $1').trim().replace(/\b\w/g, (l) => l.toUpperCase())}</th>
              ))}
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSupplyProducts.map((product) => (
              <tr key={product._id}>
                {editingSupplyProductId === product._id ? (
                  <td colSpan={Object.keys(defaultInputs).length + 2}>
                    <div className="update-user-container">
                      <h1>✏️ Update Supply Product Information</h1>
                      <form onSubmit={handleUpdateSupplyProduct}>
                        {Object.keys(defaultInputs).map((field) => (
                          <div className="form-group" key={field}>
                            <label htmlFor={field}>
                              {field.replace('_', ' ').replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
                            </label>
                            {field === 'supplier_name' ? (
                              <select
                                name={field}
                                value={editInputs[field]}
                                onChange={handleEditChange}
                                required
                              >
                                <option value="" disabled>
                                  Select Supplier Name
                                </option>
                                {supplierNames.map((name) => (
                                  <option key={name} value={name}>
                                    {name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={field === 'quantity' || field === 'unit_price' ? 'number' : 'text'}
                                name={field}
                                placeholder={field.replace('_', ' ').replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
                                value={editInputs[field]}
                                onChange={handleEditChange}
                                required
                                min={field === 'quantity' ? 1 : field === 'unit_price' ? 0 : undefined}
                                step={field === 'unit_price' ? '0.01' : undefined}
                              />
                            )}
                            {errors[`edit_${field}`] && <p className="error">{errors[`edit_${field}`]}</p>}
                          </div>
                        ))}
                        {errors.submit && <p className="error">{errors.submit}</p>}
                        <button type="submit" className="submit-btn">
                          ✅ Update Supply Product
                        </button>
                        <button
                          type="button"
                          className="cancel-button"
                          onClick={() => {
                            setEditingSupplyProductId(null);
                            setErrors({});
                          }}
                        >
                          ❌ Cancel
                        </button>
                      </form>
                    </div>
                  </td>
                ) : (
                  <>
                    <td>{product.product_id || 'N/A'}</td>
                    {Object.keys(defaultInputs).map((field) => (
                      <td key={field}>
                        {product[field] || 'N/A'}
                      </td>
                    ))}
                    <td>{new Date(product.created_at).toLocaleDateString('en-GB')}</td>
                    <td className="actions-cell">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => startEdit(product)}
                        title="Edit Supply Product"
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteSupplyProduct(product._id)}
                        title="Delete Supply Product"
                      >
                        🗑️
                      </button>
                      <button
                        className="action-btn download-btn"
                        onClick={() => handleDownloadSingle(product)}
                        title="Download Supply Product Report"
                      >
                        📄
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSupplyProducts.length === 0 && (
          <div className="no-users-message">
            <p>📭 No supply products found matching your search criteria.</p>
            {searchTerm && (
              <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SupplyProducts;