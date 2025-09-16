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
  // ------------------- SELECTED FIELDS FOR PDF -------------------
  const [selectedFields, setSelectedFields] = useState({
    serial_number: true,
    supplier_name: true,
    product_item: true,
    quantity: true,
    product_image: true,
    unit_price: true
  });
  // ------------------- FORM INPUTS -------------------
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
  // ------------------- COMPANY INFORMATION -------------------
  const companyInfo = {
    name: 'SelfMe',
    tagline: 'FUTURE OF SUN - SOLAR POWER',
    address: ['No/346, Madalanda, Dompe,', 'Colombo, Sri Lanka'],
    phone: '+94 717 882 883',
    email: 'Selfmepvtltd@gmail.com',
    website: 'www.selfme.com'
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
      img.src = '/logo192.png';
    });
  };
  // ------------------- PROFESSIONAL PDF GENERATION -------------------
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
          doc.text(line, 15, 57 + (index * 7));
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
        const footerText = `This document is generated by ${companyInfo.name} Supply Product Management System`;
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
        let fieldsCount = Object.keys(selectedFields).filter(field => selectedFields[field]).length;
        let productHeight = Math.ceil(fieldsCount / 2) * 12 + 35;
        if (tempY + productHeight > pageHeight - 45) {
          totalPages++;
          tempY = 95;
        }
        tempY += productHeight;
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
        let fieldsCount = Object.keys(selectedFields).filter(field => selectedFields[field]).length;
        let productHeight = Math.ceil(fieldsCount / 2) * 12 + 35;
        if (y + productHeight > pageHeight - 45) {
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
        doc.text(`SUPPLY PRODUCT RECORD #${String(idx + 1).padStart(3, '0')}`, 20, y + 8);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        doc.text(`Product ID: ${product.pid || 'N/A'}`, pageWidth - 70, y + 8);
        y += 25;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        let leftY = y;
        let rightY = y;
        let isLeft = true;
        Object.keys(selectedFields).forEach(field => {
          if (selectedFields[field]) {
            let label = field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            let value = field === 'product_image' ? (product[field] ? 'Uploaded' : 'N/A') : 
                        field === 'supplier_name' ? (product[field]?.supplier_brandname || 'N/A') : 
                        (product[field] || 'N/A');
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
  // ------------------- HANDLE INPUT CHANGE -------------------
  const handleChange = e => {
    if (e.target.name === 'product_image') {
      setInputs(prev => ({ ...prev, product_image: e.target.files[0] }));
    } else {
      setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };
  const handleEditChange = e => {
    if (e.target.name === 'product_image') {
      setEditInputs(prev => ({ ...prev, product_image: e.target.files[0] }));
    } else {
      setEditInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };
  // ------------------- ADD SUPPLY PRODUCT -------------------
  const handleAddSupplyProduct = async e => {
    e.preventDefault();
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
      alert('Supply product added successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Error adding supply product:', err);
      alert('Failed to add supply product!');
    }
  };
  // ------------------- EDIT SUPPLY PRODUCT -------------------
  const startEdit = product => {
    setEditingProductId(product._id);
    setEditInputs({
      serial_number: product.serial_number,
      supplier_name: product.supplier_name?._id || '',
      product_item: product.product_item,
      quantity: product.quantity,
      product_image: null,
      unit_price: product.unit_price
    });
  };
  const handleUpdateSupplyProduct = async e => {
    e.preventDefault();
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
      alert('Supply product updated successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Error updating supply product:', err);
      alert('Failed to update supply product!');
    }
  };
  // ------------------- DELETE SUPPLY PRODUCT -------------------
  const handleDeleteSupplyProduct = async id => {
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
  // ------------------- DOWNLOAD FUNCTIONS -------------------
  const handleDownloadAll = () => generatePDF(supplyProducts, 'Complete Supply Product Directory Report');
  const handleDownloadSingle = product => generatePDF([product], `Individual Supply Product Report - ${product.product_item}`);
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
            {Object.keys(defaultInputs).map(field => (
              <div className="form-group" key={field}>
                <label htmlFor={field}>{field.replace('_', ' ').toUpperCase()}</label>
                {field === 'supplier_name' ? (
                  <select
                    id={field}
                    name={field}
                    value={inputs[field]}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Select Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.supplier_brandname}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field === 'product_image' ? 'file' : field === 'quantity' || field === 'unit_price' ? 'number' : 'text'}
                    id={field}
                    name={field}
                    placeholder={`Enter ${field.replace('_', ' ')}`}
                    value={field !== 'product_image' ? inputs[field] : undefined}
                    onChange={handleChange}
                    required={field === 'serial_number' || field === 'product_item' || field === 'quantity' || field === 'unit_price'}
                  />
                )}
              </div>
            ))}
            <button type="submit" className="submit-btn">Add Supply Product</button>
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
        <h3>📄 Professional Report Generation</h3>
        <p>Select the fields to include in your professional letterhead report:</p>
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
            📊 Download Complete Directory ({supplyProducts.length} products)
          </button>
          <p className="download-note">
            Reports include professional letterhead with {companyInfo.name} logo, contact details, and formatted layouts.
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
                        {Object.keys(defaultInputs).map(field => (
                          <div className="form-group" key={field}>
                            <label htmlFor={field}>{field.replace('_', ' ').toUpperCase()}</label>
                            {field === 'supplier_name' ? (
                              <select
                                id={field}
                                name={field}
                                value={editInputs[field]}
                                onChange={handleEditChange}
                                required
                              >
                                <option value="" disabled>Select Supplier</option>
                                {suppliers.map(supplier => (
                                  <option key={supplier._id} value={supplier._id}>
                                    {supplier.supplier_brandname}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={field === 'product_image' ? 'file' : field === 'quantity' || field === 'unit_price' ? 'number' : 'text'}
                                name={field}
                                placeholder={field.replace('_', ' ').toUpperCase()}
                                value={field !== 'product_image' ? editInputs[field] : undefined}
                                onChange={handleEditChange}
                                required={field === 'serial_number' || field === 'product_item' || field === 'quantity' || field === 'unit_price'}
                              />
                            )}
                          </div>
                        ))}
                        <button type="submit" className="submit-btn">✅ Update Supply Product</button>
                        <button type="button" className="cancel-button" onClick={() => setEditingProductId(null)}>❌ Cancel</button>
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