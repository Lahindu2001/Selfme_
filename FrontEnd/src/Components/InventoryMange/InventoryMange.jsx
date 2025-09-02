import React, { useState, useEffect } from 'react';
import Nav from '../Nav/Nav';
import axios from 'axios';
import jsPDF from 'jspdf';

const URL = 'http://localhost:5000/inventory';

function InventoryManage() {
  // ------------------- STATES -------------------
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  // ------------------- SELECTED FIELDS FOR PDF -------------------
  const [selectedFields, setSelectedFields] = useState({
    productName: true,
    category: true,
    description: true,
    stockQuantity: true,
    reorderLevel: true,
    reorderQuantity: true,
    stockLocation: true,
    purchasePrice: true,
    sellingPrice: true,
    supplier: true,
    warrantyPeriod: true,
    powerRating: true,
    manufacturer: true,
    modelNumber: true,
    itemStatus: true
  });

  // ------------------- FORM INPUTS -------------------
  const defaultInputs = {
    productName: '',
    category: '',
    description: '',
    stockQuantity: '',
    reorderLevel: '',
    reorderQuantity: '',
    stockLocation: '',
    purchasePrice: '',
    sellingPrice: '',
    supplier: '',
    warrantyPeriod: '',
    powerRating: '',
    manufacturer: '',
    modelNumber: '',
    itemStatus: 'Active'
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

  // ------------------- FETCH ITEMS -------------------
  const fetchItems = async () => {
    try {
      const res = await axios.get(URL);
      setItems(res.data.items || []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setItems([]);
    }
  };

  useEffect(() => {
    fetchItems();
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
    if (!data.length) return alert('No items to download!');

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

        const footerText = `This document is generated by ${companyInfo.name} Inventory Management System`;
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

      data.forEach((item, idx) => {
        let fieldsCount = Object.keys(selectedFields).filter(field => selectedFields[field]).length;
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
        doc.text(`ITEM RECORD #${String(idx + 1).padStart(3, '0')}`, 20, y + 8);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        doc.text(`Item ID: ${item.productName || 'N/A'}`, pageWidth - 70, y + 8);

        y += 25;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);

        let leftY = y;
        let rightY = y;
        let isLeft = true;

        Object.keys(selectedFields).forEach(field => {
          if (selectedFields[field]) {
            let label = field.replace(/([A-Z])/g, ' $1').trim().replace(/\b\w/g, l => l.toUpperCase());
            let value = item[field] || 'N/A';

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
  const handleChange = e => setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleEditChange = e => setEditInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // ------------------- ADD ITEM -------------------
  const handleAddItem = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(URL, {
        ...inputs,
        stockQuantity: Number(inputs.stockQuantity),
        reorderLevel: Number(inputs.reorderLevel),
        reorderQuantity: Number(inputs.reorderQuantity),
        purchasePrice: Number(inputs.purchasePrice),
        sellingPrice: Number(inputs.sellingPrice)
      });
      setItems([...items, res.data.item]);
      setInputs(defaultInputs);
      setShowAddForm(false);
      alert('Item added successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Error adding item:', err);
      alert('Failed to add item!');
    }
  };

  // ------------------- EDIT ITEM -------------------
  const startEdit = item => {
    const filteredItem = { ...defaultInputs };
    Object.keys(defaultInputs).forEach(key => {
      filteredItem[key] = item[key] !== undefined ? item[key] : defaultInputs[key];
    });
    setEditingItemId(item._id);
    setEditInputs(filteredItem);
  };

  const handleUpdateItem = async e => {
    e.preventDefault();
    try {
      const res = await axios.put(`${URL}/${editingItemId}`, {
        ...editInputs,
        stockQuantity: Number(editInputs.stockQuantity),
        reorderLevel: Number(editInputs.reorderLevel),
        reorderQuantity: Number(editInputs.reorderQuantity),
        purchasePrice: Number(editInputs.purchasePrice),
        sellingPrice: Number(editInputs.sellingPrice)
      });
      setItems(items.map(i => (i._id === editingItemId ? res.data.item : i)));
      setEditingItemId(null);
      setEditInputs(defaultInputs);
      alert('Item updated successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Error updating item:', err);
      alert('Failed to update item!');
    }
  };

  // ------------------- DELETE ITEM -------------------
  const handleDeleteItem = async id => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`${URL}/${id}`);
      setItems(items.filter(i => i._id !== id));
      alert('Item deleted successfully!');
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Failed to delete item!');
    }
  };

  // ------------------- DOWNLOAD FUNCTIONS -------------------
  const handleDownloadAll = () => generatePDF(items, 'Complete Inventory Report');
  const handleDownloadSingle = item => generatePDF([item], `Individual Item Report - ${item.productName}`);

  // ------------------- FILTERED ITEMS -------------------
  const filteredItems = items.filter(item =>
    (item.productName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // ------------------- ENUMS -------------------
  const categories = ['Panel', 'Wire', 'Safety'];
  const locations = ['Warehouse A', 'Warehouse B', 'Warehouse C'];
  const statusOptions = ['Active', 'Inactive'];

  // ------------------- RENDER -------------------
  return (
    <div className="users-section">
      <Nav />
      <div className="title-container">
        <h2 className="Title">Inventory Management System</h2>
        <p className="subtitle">{companyInfo.name} - {companyInfo.tagline}</p>
      </div>

      <button className="add-user-toggle" onClick={() => setShowAddForm(!showAddForm)}>
        {showAddForm ? '✕ Hide Add Item Form' : '➕ Show Add Item Form'}
      </button>

      {showAddForm && (
        <div className="add-user-container">
          <h3>📝 Add New Item</h3>
          <form className="add-user-form" onSubmit={handleAddItem}>
            {Object.keys(defaultInputs).map(field => (
              <div className="form-group" key={field}>
                <label htmlFor={field}>{field.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}</label>
                {field === 'category' ? (
                  <select name={field} value={inputs[field]} onChange={handleChange} required>
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                ) : field === 'stockLocation' ? (
                  <select name={field} value={inputs[field]} onChange={handleChange} required>
                    <option value="">Select Location</option>
                    {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                ) : field === 'itemStatus' ? (
                  <select name={field} value={inputs[field]} onChange={handleChange} required>
                    {statusOptions.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.includes('Price') || field.includes('Quantity') ? 'number' : 'text'}
                    id={field}
                    name={field}
                    placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').trim()}`}
                    value={inputs[field]}
                    onChange={handleChange}
                    required={field === 'productName' || field === 'stockQuantity'}
                  />
                )}
              </div>
            ))}
            <button type="submit" className="submit-btn">Add Item</button>
          </form>
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search by Product or Category..."
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
              <span>{field.replace(/([A-Z])/g, ' $1').trim().replace(/\b\w/g, l => l.toUpperCase())}</span>
            </label>
          ))}
        </div>
        <div className="download-buttons">
          <button className="download-all-btn" onClick={handleDownloadAll}>
            📊 Download Complete Inventory ({items.length} items)
          </button>
          <p className="download-note">
            Reports include professional letterhead with {companyInfo.name} logo, contact details, and formatted layouts.
          </p>
        </div>
      </div>

      <div className="users-table-container">
        <div className="table-header">
          <span className="table-user-count">👥 Total Items: {items.length}</span>
          <span className="filtered-count">
            {searchTerm && `(Showing ${filteredItems.length} filtered results)`}
          </span>
        </div>
        <table className="users-table">
          <thead>
            <tr>
              {Object.keys(defaultInputs).map(field => (
                <th key={field}>{field.replace(/([A-Z])/g, ' $1').trim().replace(/\b\w/g, l => l.toUpperCase())}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item._id}>
                {editingItemId === item._id ? (
                  <td colSpan={Object.keys(defaultInputs).length + 1}>
                    <div className="update-user-container">
                      <h1>✏️ Update Item Information</h1>
                      <form onSubmit={handleUpdateItem}>
                        {Object.keys(defaultInputs).map(field => (
                          <div className="form-group" key={field}>
                            <label htmlFor={field}>{field.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}</label>
                            {field === 'category' ? (
                              <select name={field} value={editInputs[field]} onChange={handleEditChange} required>
                                <option value="">Select Category</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                              </select>
                            ) : field === 'stockLocation' ? (
                              <select name={field} value={editInputs[field]} onChange={handleEditChange} required>
                                <option value="">Select Location</option>
                                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                              </select>
                            ) : field === 'itemStatus' ? (
                              <select name={field} value={editInputs[field]} onChange={handleEditChange} required>
                                {statusOptions.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                              </select>
                            ) : (
                              <input
                                type={field.includes('Price') || field.includes('Quantity') ? 'number' : 'text'}
                                name={field}
                                placeholder={field.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
                                value={editInputs[field]}
                                onChange={handleEditChange}
                                required={field === 'productName' || field === 'stockQuantity'}
                              />
                            )}
                          </div>
                        ))}
                        <button type="submit" className="submit-btn">✅ Update Item</button>
                        <button type="button" className="cancel-button" onClick={() => setEditingItemId(null)}>❌ Cancel</button>
                      </form>
                    </div>
                  </td>
                ) : (
                  <>
                    {Object.keys(defaultInputs).map(field => (
                      <td key={field}>
                        {field === 'itemStatus' ? (
                          <span className={`status-badge ${item[field]?.toLowerCase()}`}>
                            {item[field] || 'N/A'}
                          </span>
                        ) : (
                          item[field] || 'N/A'
                        )}
                      </td>
                    ))}
                    <td className="actions-cell">
                      <button className="action-btn edit-btn" onClick={() => startEdit(item)} title="Edit Item">
                        ✏️
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDeleteItem(item._id)} title="Delete Item">
                        🗑️
                      </button>
                      <button className="action-btn download-btn" onClick={() => handleDownloadSingle(item)} title="Download Item Report">
                        📄
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredItems.length === 0 && (
          <div className="no-users-message">
            <p>📭 No items found matching your search criteria.</p>
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

export default InventoryManage;