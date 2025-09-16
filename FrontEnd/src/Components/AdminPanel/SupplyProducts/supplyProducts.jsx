import React, { useState, useEffect } from 'react';
import Nav from '../../Nav/Nav';
import axios from 'axios';
import jsPDF from 'jspdf';
import './supplyProducts.css';

const SUPPLY_PRODUCTS_URL = 'http://localhost:5000/supply-products';
const SUPPLIERS_URL = 'http://localhost:5000/supply-requests';

function SupplyProducts() {
  // ------------------- STATES -------------------
  const [supplyProducts, setSupplyProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [selectedFields, setSelectedFields] = useState({
    serial_number: true,
    supplier_name: true,
    product_item: true,
    quantity: true,
    product_image: true,
    unit_price: true
  });
  const defaultInputs = {
    serial_number: '',
    supplier_name: '',
    product_item: '',
    quantity: '',
    product_image: null,
    unit_price: ''
  };
  const [inputs, setInputs] = useState(defaultInputs);
  const [editInputs, setEditInputs] = useState(defaultInputs);
  const [errors, setErrors] = useState({});

  // ------------------- COMPANY INFORMATION -------------------
  const companyInfo = {
    name: 'SelfMe',
    tagline: 'FUTURE OF SUN - SOLAR POWER',
    address: ['No/346, Madalanda, Dompe,', 'Colombo, Sri Lanka'],
    phone: '+94 717 882 883',
    email: 'Selfmepvtltd@gmail.com',
    website: 'www.selfme.com'
  };

  // ------------------- VALIDATION FUNCTIONS -------------------
  const validateSerialNumber = (value) => value === '' || /^[a-zA-Z0-9]*$/.test(value);
  const validateSupplierName = (value) => value !== '';
  const validateProductItem = (value) => value === '' || /^[A-Za-z]*$/.test(value);
  const validateQuantity = (value) => value === '' || /^[1-9][0-9]*$/.test(value);
  const validateUnitPrice = (value) => {
    if (value === '') return true;
    if (value === '0' || value === '0.0' || value === '0.00') return false;
    return /^[1-9][0-9]*(\.[0-9]{1,2})?$/.test(value);
  };

  // ------------------- INPUT HANDLERS -------------------
  const handleSerialNumber = (e) => {
    const value = e.target.value;
    if (value === '' || /^[a-zA-Z0-9]*$/.test(value)) {
      setInputs((prev) => ({ ...prev, serial_number: value }));
      setErrors((prev) => ({
        ...prev,
        serial_number: value && !/^[a-zA-Z0-9]+$/.test(value) ? 'Serial number can only contain letters and numbers' : ''
      }));
    }
  };

  const handleEditSerialNumber = (e) => {
    const value = e.target.value;
    if (value === '' || /^[a-zA-Z0-9]*$/.test(value)) {
      setEditInputs((prev) => ({ ...prev, serial_number: value }));
      setErrors((prev) => ({
        ...prev,
        serial_number: value && !/^[a-zA-Z0-9]+$/.test(value) ? 'Serial number can only contain letters and numbers' : ''
      }));
    }
  };

  const handleSupplierName = (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, supplier_name: value }));
    setErrors((prev) => ({
      ...prev,
      supplier_name: value && !validateSupplierName(value) ? 'Supplier name is required' : ''
    }));
  };

  const handleEditSupplierName = (e) => {
    const value = e.target.value;
    setEditInputs((prev) => ({ ...prev, supplier_name: value }));
    setErrors((prev) => ({
      ...prev,
      supplier_name: value && !validateSupplierName(value) ? 'Supplier name is required' : ''
    }));
  };

  const handleProductItem = (e) => {
    const value = e.target.value;
    if (value === '' || /^[A-Za-z]*$/.test(value)) {
      setInputs((prev) => ({ ...prev, product_item: value }));
      setErrors((prev) => ({
        ...prev,
        product_item: value && !/^[A-Za-z]+$/.test(value) ? 'Product item can only contain letters' : ''
      }));
    }
  };

  const handleEditProductItem = (e) => {
    const value = e.target.value;
    if (value === '' || /^[A-Za-z]*$/.test(value)) {
      setEditInputs((prev) => ({ ...prev, product_item: value }));
      setErrors((prev) => ({
        ...prev,
        product_item: value && !/^[A-Za-z]+$/.test(value) ? 'Product item can only contain letters' : ''
      }));
    }
  };

  const handleQuantity = (e) => {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value)) {
      setInputs((prev) => ({ ...prev, quantity: value }));
      setErrors((prev) => ({
        ...prev,
        quantity: value && !/^[1-9][0-9]*$/.test(value) ? 'Quantity must be a positive integer' : ''
      }));
    }
  };

  const handleEditQuantity = (e) => {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value)) {
      setEditInputs((prev) => ({ ...prev, quantity: value }));
      setErrors((prev) => ({
        ...prev,
        quantity: value && !/^[1-9][0-9]*$/.test(value) ? 'Quantity must be a positive integer' : ''
      }));
    }
  };

  const handleUnitPrice = (e) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]*\.?[0-9]{0,2}$/.test(value)) {
      setInputs((prev) => ({ ...prev, unit_price: value }));
      setErrors((prev) => ({
        ...prev,
        unit_price: value && (value === '0' || value === '0.0' || value === '0.00') ? 'Unit price cannot be zero' :
                    value && !/^[1-9][0-9]*(\.[0-9]{1,2})?$/.test(value) ? 'Unit price must be a non-negative number with up to 2 decimal places, not starting with zero' : ''
      }));
    }
  };

  const handleEditUnitPrice = (e) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]*\.?[0-9]{0,2}$/.test(value)) {
      setEditInputs((prev) => ({ ...prev, unit_price: value }));
      setErrors((prev) => ({
        ...prev,
        unit_price: value && (value === '0' || value === '0.0' || value === '0.00') ? 'Unit price cannot be zero' :
                    value && !/^[1-9][0-9]*(\.[0-9]{1,2})?$/.test(value) ? 'Unit price must be a non-negative number with up to 2 decimal places, not starting with zero' : ''
      }));
    }
  };

  const handleProductImage = (e) => {
    const file = e.target.files[0];
    setInputs((prev) => ({ ...prev, product_image: file }));
    setErrors((prev) => ({ ...prev, product_image: '' }));
  };

  const handleEditProductImage = (e) => {
    const file = e.target.files[0];
    setEditInputs((prev) => ({ ...prev, product_image: file }));
    setErrors((prev) => ({ ...prev, product_image: '' }));
  };

  // ------------------- HANDLE KEY PRESS -------------------
  const handleKeyPress = (e, field) => {
    if (field === 'serial_number' && !/[a-zA-Z0-9]/.test(e.key)) {
      e.preventDefault();
    }
    if (field === 'product_item' && !/[A-Za-z]/.test(e.key)) {
      e.preventDefault();
    }
    if (field === 'quantity' && !/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
    if (field === 'unit_price' && !/[0-9.]/.test(e.key)) {
      e.preventDefault();
    }
  };

  // ------------------- ADD SUPPLY PRODUCT -------------------
  const handleAddSupplyProduct = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!inputs.serial_number || !/^[a-zA-Z0-9]+$/.test(inputs.serial_number)) {
      newErrors.serial_number = 'Serial number must contain letters or numbers and cannot be empty';
    }
    if (!inputs.supplier_name) {
      newErrors.supplier_name = 'Supplier name is required';
    }
    if (!inputs.product_item || !/^[A-Za-z]+$/.test(inputs.product_item)) {
      newErrors.product_item = 'Product item must contain only letters and cannot be empty';
    }
    if (!inputs.quantity || !/^[1-9][0-9]*$/.test(inputs.quantity)) {
      newErrors.quantity = 'Quantity must be a positive integer';
    }
    if (!inputs.unit_price || inputs.unit_price === '0' || inputs.unit_price === '0.0' || inputs.unit_price === '0.00' || !/^[1-9][0-9]*(\.[0-9]{1,2})?$/.test(inputs.unit_price)) {
      newErrors.unit_price = 'Unit price must be a non-negative number with up to 2 decimal places, not zero or starting with zero';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    try {
      const formData = new FormData();
      Object.keys(inputs).forEach(key => {
        if (inputs[key] !== null && inputs[key] !== '') formData.append(key, inputs[key]);
      });
      const res = await axios.post(SUPPLY_PRODUCTS_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSupplyProducts([...supplyProducts, res.data.supplyProduct]);
      setInputs(defaultInputs);
      setShowAddForm(false);
      setErrors({});
      alert('Supply product added successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Error adding supply product:', err);
      setErrors({ submit: err.response?.data?.message || 'Failed to add supply product' });
    }
  };

  // ------------------- EDIT SUPPLY PRODUCT -------------------
  const startEdit = (product) => {
    setEditingProductId(product._id);
    setEditInputs({
      serial_number: product.serial_number,
      supplier_name: product.supplier_name?._id || '',
      product_item: product.product_item,
      quantity: product.quantity,
      product_image: null,
      unit_price: product.unit_price
    });
    setErrors({});
  };

  const handleUpdateSupplyProduct = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!editInputs.serial_number || !/^[a-zA-Z0-9]+$/.test(editInputs.serial_number)) {
      newErrors.serial_number = 'Serial number must contain letters or numbers and cannot be empty';
    }
    if (!editInputs.supplier_name) {
      newErrors.supplier_name = 'Supplier name is required';
    }
    if (!editInputs.product_item || !/^[A-Za-z]+$/.test(editInputs.product_item)) {
      newErrors.product_item = 'Product item must contain only letters and cannot be empty';
    }
    if (!editInputs.quantity || !/^[1-9][0-9]*$/.test(editInputs.quantity)) {
      newErrors.quantity = 'Quantity must be a positive integer';
    }
    if (!editInputs.unit_price || editInputs.unit_price === '0' || editInputs.unit_price === '0.0' || editInputs.unit_price === '0.00' || !/^[1-9][0-9]*(\.[0-9]{1,2})?$/.test(editInputs.unit_price)) {
      newErrors.unit_price = 'Unit price must be a non-negative number with up to 2 decimal places, not zero or starting with zero';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    try {
      const formData = new FormData();
      Object.keys(editInputs).forEach(key => {
        if (editInputs[key] !== null && editInputs[key] !== '') formData.append(key, editInputs[key]);
      });
      const res = await axios.put(`${SUPPLY_PRODUCTS_URL}/${editingProductId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSupplyProducts(supplyProducts.map(p => (p._id === editingProductId ? res.data.supplyProduct : p)));
      setEditingProductId(null);
      setEditInputs(defaultInputs);
      setErrors({});
      alert('Supply product updated successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Error updating supply product:', err);
      setErrors({ submit: err.response?.data?.message || 'Failed to update supply product' });
    }
  };

  // ------------------- DELETE SUPPLY PRODUCT -------------------
  const handleDeleteSupplyProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supply product?')) return;
    try {
      await axios.delete(`${SUPPLY_PRODUCTS_URL}/${id}`);
      setSupplyProducts(supplyProducts.filter(p => p._id !== id));
      alert('Supply product deleted successfully!');
    } catch (err) {
      console.error('Error deleting supply product:', err);
      alert('Failed to delete supply product!');
    }
  };

  // ------------------- FETCH SUPPLY PRODUCTS AND SUPPLIERS -------------------
  const fetchSupplyProducts = async () => {
    try {
      const res = await axios.get(SUPPLY_PRODUCTS_URL);
      setSupplyProducts(res.data.supplyProducts || []);
    } catch (err) {
      console.error('Error fetching supply products:', err);
      setSupplyProducts([]);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(SUPPLIERS_URL);
      setSuppliers(res.data.supplyRequests || []);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setSuppliers([]);
    }
  };

  useEffect(() => {
    fetchSupplyProducts();
    fetchSuppliers();
  }, []);

  // ------------------- LOGO CONVERSION -------------------
  const getLogoAsBase64 = () => {
    return new Promise((resolve, reject) => {
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
      img.src = '/newLogo.png';
    });
  };

  // ------------------- OFFICIAL PDF GENERATION -------------------
  const generatePDF = async (data, title) => {
    if (!data.length) return alert('No supply products to download!');
    try {
      const logoBase64 = await getLogoAsBase64();
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const addLetterhead = () => {
        if (logoBase64) {
          doc.addImage(logoBase64, 'PNG', 15, 10, 20, 20);
        }
        doc.setFont('times', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(companyInfo.name, pageWidth / 2, 20, { align: 'center' });
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text(companyInfo.address.join(', '), pageWidth / 2, 28, { align: 'center' });
        doc.text(`Phone: ${companyInfo.phone} | Email: ${companyInfo.email} | Website: ${companyInfo.website}`, pageWidth / 2, 34, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 0, 0);
        doc.line(15, 40, pageWidth - 15, 40);
      };
      const addFooter = (pageNum, totalPages, lastRecordIdx) => {
        doc.setFont('times', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 50);
        doc.setLineWidth(0.3);
        doc.setDrawColor(150, 150, 150);
        doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
        const footerText = `Generated by ${companyInfo.name} Supply Product Management System`;
        doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });
        const recordText = lastRecordIdx >= 0 ? `Supply Product #${String(lastRecordIdx + 1).padStart(3, '0')}` : '';
        doc.text(`Page ${pageNum} of ${totalPages} | ${recordText}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
        const genDate = new Date().toLocaleDateString('en-GB');
        const genTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
        doc.text(`Generated on ${genDate} at ${genTime}`, 15, pageHeight - 10);
      };
      const addSignatureField = () => {
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text('Authorized Signature: __________________', pageWidth - 85, pageHeight - 30);
      };
      let totalPages = 1;
      let tempY = 50;
      let lastRecordIdxPerPage = [];
      let currentPageRecords = [];
      data.forEach((_, idx) => {
        let fieldsCount = Object.keys(selectedFields).filter(field => selectedFields[field]).length;
        let productHeight = fieldsCount * 10 + 20;
        if (tempY + productHeight > pageHeight - 40) {
          totalPages++;
          lastRecordIdxPerPage.push(currentPageRecords[currentPageRecords.length - 1] || -1);
          currentPageRecords = [];
          tempY = 50;
        }
        currentPageRecords.push(idx);
        tempY += productHeight;
      });
      lastRecordIdxPerPage.push(currentPageRecords[currentPageRecords.length - 1] || -1);
      let currentPage = 1;
      let y = 50;
      addLetterhead();
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(title, pageWidth / 2, 45, { align: 'center' });
      data.forEach((product, idx) => {
        let fieldsCount = Object.keys(selectedFields).filter(field => selectedFields[field]).length;
        let productHeight = fieldsCount * 10 + 20;
        if (y + productHeight > pageHeight - 40) {
          addSignatureField();
          addFooter(currentPage, totalPages, lastRecordIdxPerPage[currentPage - 1]);
          doc.addPage();
          currentPage++;
          addLetterhead();
          y = 50;
        }
        doc.setFont('times', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Supply Product #${String(idx + 1).padStart(3, '0')}`, 15, y);
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text(`Product ID: ${product.pid || 'N/A'}`, pageWidth - 50, y);
        y += 10;
        doc.setLineWidth(0.3);
        doc.setDrawColor(150, 150, 150);
        doc.rect(15, y, pageWidth - 30, fieldsCount * 10 + 5, 'S');
        y += 5;
        Object.keys(selectedFields).forEach(field => {
          if (selectedFields[field]) {
            let label = field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            let value = field === 'product_image' ? (product[field] ? 'Uploaded' : 'N/A') : 
                        field === 'supplier_name' ? (product[field]?.supplier_brandname || 'N/A') : 
                        (product[field] || 'N/A');
            if (typeof value === 'string' && value.length > 50) {
              value = value.substring(0, 47) + '...';
            }
            doc.setFont('times', 'bold');
            doc.text(`${label}:`, 20, y);
            doc.setFont('times', 'normal');
            doc.text(String(value), 60, y);
            y += 10;
          }
        });
        y += 5;
        if (idx < data.length - 1) {
          doc.setLineWidth(0.2);
          doc.setDrawColor(200, 200, 200);
          doc.line(15, y, pageWidth - 15, y);
          y += 5;
        }
      });
      addSignatureField();
      addFooter(currentPage, totalPages, lastRecordIdxPerPage[currentPage - 1]);
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `${companyInfo.name}_${title.replace(/\s+/g, '_')}_${timestamp}.pdf`;
      doc.save(fileName);
      alert(`Official report "${fileName}" downloaded successfully!`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // ------------------- DOWNLOAD FUNCTIONS -------------------
  const handleDownloadAll = () => generatePDF(supplyProducts, 'Supply Product Directory Report');
  const handleDownloadSingle = (product) => generatePDF([product], `Supply Product Report - ${product.product_item}`);

  // ------------------- FILTERED SUPPLY PRODUCTS -------------------
  const filteredSupplyProducts = supplyProducts.filter(product =>
    (product.product_item?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // ------------------- RENDER -------------------
  return (
    <div className="supply-products-section">
      <Nav />
      <div className="title-container">
        <h2 className="Title">Supply Product Management System</h2>
        <p className="subtitle">{companyInfo.name} - {companyInfo.tagline}</p>
      </div>
      <button className="add-user-toggle" onClick={() => setShowAddForm(!showAddForm)}>
        {showAddForm ? '✕ Hide Add Supply Product Form' : '➕ Show Add Supply Product Form'}
      </button>
      {showAddForm && (
        <div className="add-user-container">
          <h3>📝 Add New Supply Product</h3>
          <form className="add-user-form" onSubmit={handleAddSupplyProduct}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Serial Number"
                value={inputs.serial_number}
                onChange={handleSerialNumber}
                onKeyPress={(e) => handleKeyPress(e, 'serial_number')}
                required
              />
              {errors.serial_number && <p className="error">{errors.serial_number}</p>}
            </div>
            <div className="form-group">
              <select value={inputs.supplier_name} onChange={handleSupplierName} required>
                <option value="" disabled>Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.supplier_brandname}
                  </option>
                ))}
              </select>
              {errors.supplier_name && <p className="error">{errors.supplier_name}</p>}
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Product Item"
                value={inputs.product_item}
                onChange={handleProductItem}
                onKeyPress={(e) => handleKeyPress(e, 'product_item')}
                required
              />
              {errors.product_item && <p className="error">{errors.product_item}</p>}
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Quantity"
                value={inputs.quantity}
                onChange={handleQuantity}
                onKeyPress={(e) => handleKeyPress(e, 'quantity')}
                required
              />
              {errors.quantity && <p className="error">{errors.quantity}</p>}
            </div>
            <div className="form-group">
              <input
                type="file"
                onChange={handleProductImage}
              />
              {errors.product_image && <p className="error">{errors.product_image}</p>}
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Unit Price"
                value={inputs.unit_price}
                onChange={handleUnitPrice}
                onKeyPress={(e) => handleKeyPress(e, 'unit_price')}
                required
              />
              {errors.unit_price && <p className="error">{errors.unit_price}</p>}
            </div>
            <button type="submit" className="submit-btn">
              Add Supply Product
            </button>
            {errors.submit && <p className="error">{errors.submit}</p>}
          </form>
        </div>
      )}
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search by Product Item..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="download-options professional-section">
        <h3>📄 Official Report Generation</h3>
        <p>Select the fields to include in your official report:</p>
        <div className="field-checkboxes">
          {Object.keys(selectedFields).map(field => (
            <label key={field} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedFields[field]}
                onChange={() => setSelectedFields(prev => ({ ...prev, [field]: !prev[field] }))}
              />
              <span>{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </label>
          ))}
        </div>
        <div className="download-buttons">
          <button className="download-all-btn" onClick={handleDownloadAll}>
            📊 Download Directory ({supplyProducts.length} products)
          </button>
          <p className="download-note">
            Reports include official letterhead with {companyInfo.name} branding and contact details.
          </p>
        </div>
      </div>
      <div className="users-table-container">
        <div className="table-header">
          <span className="table-user-count">👥 Total Supply Products: {supplyProducts.length}</span>
          <span className="filtered-count">
            {searchTerm && `(Showing ${filteredSupplyProducts.length} filtered results)`}
          </span>
        </div>
        <table className="users-table">
          <thead>
            <tr>
              {Object.keys(defaultInputs).map(field => (
                <th key={field}>{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSupplyProducts.map(product => (
              <tr key={product._id}>
                {editingProductId === product._id ? (
                  <td colSpan={Object.keys(defaultInputs).length + 1}>
                    <div className="update-user-container">
                      <h1>✏️ Update Supply Product Information</h1>
                      <form onSubmit={handleUpdateSupplyProduct}>
                        <div className="form-group">
                          <input
                            type="text"
                            placeholder="Serial Number"
                            value={editInputs.serial_number}
                            onChange={handleEditSerialNumber}
                            onKeyPress={(e) => handleKeyPress(e, 'serial_number')}
                            required
                          />
                          {errors.serial_number && <p className="error">{errors.serial_number}</p>}
                        </div>
                        <div className="form-group">
                          <select value={editInputs.supplier_name} onChange={handleEditSupplierName} required>
                            <option value="" disabled>Select Supplier</option>
                            {suppliers.map(supplier => (
                              <option key={supplier._id} value={supplier._id}>
                                {supplier.supplier_brandname}
                              </option>
                            ))}
                          </select>
                          {errors.supplier_name && <p className="error">{errors.supplier_name}</p>}
                        </div>
                        <div className="form-group">
                          <input
                            type="text"
                            placeholder="Product Item"
                            value={editInputs.product_item}
                            onChange={handleEditProductItem}
                            onKeyPress={(e) => handleKeyPress(e, 'product_item')}
                            required
                          />
                          {errors.product_item && <p className="error">{errors.product_item}</p>}
                        </div>
                        <div className="form-group">
                          <input
                            type="text"
                            placeholder="Quantity"
                            value={editInputs.quantity}
                            onChange={handleEditQuantity}
                            onKeyPress={(e) => handleKeyPress(e, 'quantity')}
                            required
                          />
                          {errors.quantity && <p className="error">{errors.quantity}</p>}
                        </div>
                        <div className="form-group">
                          <input
                            type="file"
                            onChange={handleEditProductImage}
                          />
                          {errors.product_image && <p className="error">{errors.product_image}</p>}
                        </div>
                        <div className="form-group">
                          <input
                            type="text"
                            placeholder="Unit Price"
                            value={editInputs.unit_price}
                            onChange={handleEditUnitPrice}
                            onKeyPress={(e) => handleKeyPress(e, 'unit_price')}
                            required
                          />
                          {errors.unit_price && <p className="error">{errors.unit_price}</p>}
                        </div>
                        <button type="submit" className="submit-btn">
                          ✅ Update Supply Product
                        </button>
                        <button type="button" className="cancel-button" onClick={() => setEditingProductId(null)}>❌ Cancel</button>
                        {errors.submit && <p className="error">{errors.submit}</p>}
                      </form>
                    </div>
                  </td>
                ) : (
                  <>
                    {Object.keys(defaultInputs).map(field => (
                      <td key={field}>
                        {field === 'product_image' && product[field] ? (
                          <img src={`http://localhost:5000${product[field]}`} alt="product" width="60" />
                        ) : field === 'supplier_name' ? (
                          product[field]?.supplier_brandname || 'N/A'
                        ) : (
                          product[field] || 'N/A'
                        )}
                      </td>
                    ))}
                    <td className="actions-cell">
                      <button className="action-btn edit-btn" onClick={() => startEdit(product)} title="Edit Supply Product">
                        ✏️
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDeleteSupplyProduct(product._id)} title="Delete Supply Product">
                        🗑️
                      </button>
                      <button className="action-btn download-btn" onClick={() => handleDownloadSingle(product)} title="Download Supply Product Report">
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