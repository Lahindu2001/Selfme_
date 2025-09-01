import React, { useState, useEffect } from 'react';
import Nav from '../Nav/Nav';
import axios from 'axios';
import jsPDF from 'jspdf';
import './InventoryManage.css';
import './UpdateInventory.css';

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
    } catch (err) {
      console.error(err);
      alert('Failed to add item! Check console for details.');
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
      alert('Item updated successfully!');
    } catch (err) {
      console.error(err);
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
      console.error(err);
      alert('Failed to delete item!');
    }
  };

  // ------------------- DOWNLOAD PDF -------------------
  const handleDownload = () => {
    if (!items.length) return alert('No items to download!');
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(16);
    const title = 'Inventory Report';
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - textWidth) / 2, 15);
    doc.setFontSize(10);

    items.forEach((item, idx) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`Item ${idx + 1}`, 10, y); y += 6;
      doc.setFont('helvetica', 'normal');

      Object.keys(selectedFields).forEach(key => {
        if (selectedFields[key]) {
          doc.text(`${key} : ${item[key] || ''}`, 12, y);
          y += 5;
        }
      });

      y += 3;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    doc.save('inventory_report.pdf');
    alert('Inventory Report Downloaded!');
  };

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
    <div className="inventory-section">
      <Nav />
      <div className="title-container">
        <h2 className="Title">Inventory Management</h2>
      </div>

      <button className="add-item-toggle" onClick={() => setShowAddForm(!showAddForm)}>
        {showAddForm ? 'Hide Add Item Form' : 'Show Add Item Form'}
      </button>

      {showAddForm && (
        <div className="add-item-container">
          <h3>Add New Item</h3>
          <form className="add-item-form" onSubmit={handleAddItem}>
            {Object.keys(defaultInputs).map(field => (
              <div className="form-group" key={field}>
                <label>{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                {field === "category" ? (
                  <select name={field} value={inputs[field]} onChange={handleChange} required>
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                ) : field === "stockLocation" ? (
                  <select name={field} value={inputs[field]} onChange={handleChange} required>
                    <option value="">Select Location</option>
                    {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                ) : field === "itemStatus" ? (
                  <select name={field} value={inputs[field]} onChange={handleChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                ) : (
                  <input
                    type={field.includes('Price') || field.includes('Quantity') ? 'number' : 'text'}
                    name={field}
                    value={inputs[field]}
                    onChange={handleChange}
                    required={field === "stockQuantity" || field === "productName"}
                    placeholder={field.replace(/([A-Z])/g, ' $1').trim()}
                  />
                )}
              </div>
            ))}
            <button type="submit">Add Item</button>
          </form>
        </div>
      )}

      {/* ------------------- SEARCH ------------------- */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by Product or Category..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ------------------- PDF DOWNLOAD OPTIONS ------------------- */}
      <div className="download-options">
        <h3>Download Options</h3>
        {Object.keys(selectedFields).map(key => (
          <label key={key}>
            <input
              type="checkbox"
              checked={selectedFields[key]}
              onChange={() => setSelectedFields(prev => ({ ...prev, [key]: !prev[key] }))}
            />
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
        ))}
        <button onClick={handleDownload}>Download Report</button>
      </div>

      {/* ------------------- ITEMS TABLE ------------------- */}
      <div className="items-table-container">
        <span className="table-item-count">Total Items: {items.length}</span>
        <table className="items-table">
          <thead>
            <tr>
              {Object.keys(defaultInputs).map((key) => (
                <th key={key}>{key.replace(/([A-Z])/g, ' $1').trim()}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item._id}>
                {editingItemId === item._id ? (
                  <td colSpan={Object.keys(defaultInputs).length + 1}>
                    <div className="add-item-container">
                      <h3>Update Item</h3>
                      <form className="add-item-form" onSubmit={handleUpdateItem}>
                        {Object.keys(defaultInputs).filter(field => field !== 'itemStatus' && field !== '_id').map(field => (
                          <div className="form-group" key={field}>
                            <label>{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                            {field === "category" ? (
                              <select
                                name={field}
                                value={editInputs[field] || ''}
                                onChange={handleEditChange}
                                required
                              >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            ) : field === "stockLocation" ? (
                              <select
                                name={field}
                                value={editInputs[field] || ''}
                                onChange={handleEditChange}
                                required
                              >
                                <option value="">Select Location</option>
                                {locations.map(loc => (
                                  <option key={loc} value={loc}>{loc}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={field.includes('Price') || field.includes('Quantity') ? 'number' : 'text'}
                                name={field}
                                value={editInputs[field] || ''}
                                onChange={handleEditChange}
                                required={field === "stockQuantity" || field === "productName"}
                                placeholder={field.replace(/([A-Z])/g, ' $1').trim()}
                              />
                            )}
                          </div>
                        ))}
                        <div className="form-group">
                          <button type="submit">Update Item</button>
                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => setEditingItemId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </td>
                ) : (
                  <>
                    {Object.keys(defaultInputs).map(field => (
                      <td key={field}>{item[field] || ''}</td>
                    ))}
                    <td>
                      <button className="update-button" onClick={() => startEdit(item)}>Edit</button>
                      <button className="delete-button" onClick={() => handleDeleteItem(item._id)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryManage;