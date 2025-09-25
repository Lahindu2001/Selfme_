import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../../../utils/auth';
import axios from 'axios';
import jsPDF from 'jspdf';
import Nav from '../../Nav/Nav'; // Adjust path based on your folder structure
import './SupplyRequest.css';

const URL = 'http://localhost:5000/supply-requests';

function SupplyRequest() {
  const navigate = useNavigate();
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
  const firstName = authUser.firstName || 'Admin';

  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem('authUser');
    navigate('/login');
  };

  // ------------------- STATES -------------------
  const [supplyRequests, setSupplyRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddSupplyRequestForm, setShowAddSupplyRequestForm] = useState(false);
  const [editingSupplyRequestId, setEditingSupplyRequestId] = useState(null);
  const [selectedFields, setSelectedFields] = useState({
    supplier_brandname: true,
    supplier_contact: true,
    supplier_address: true,
    status: true,
    created_at: true,
  });
  const defaultInputs = {
    supplier_brandname: '',
    supplier_contact: '',
    supplier_address: '',
    status: 'Pending',
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
    website: 'www.selfme.com',
  };

  // ------------------- VALIDATION FUNCTIONS -------------------
  const validateSupplierBrandname = (value) => value === '' || /^[A-Za-z]*$/.test(value);
  const validateSupplierContact = (value) => value === '' || /^\d{10}$/.test(value);
  const validateSupplierAddress = (value) => value === '' || /^[a-zA-Z0-9\s,.]*$/.test(value);
  const validateStatus = (value) => ['Pending', 'Active', 'Inactive'].includes(value);

  // ------------------- INPUT HANDLERS -------------------
  const handleSupplierBrandname = (e) => {
    const value = e.target.value;
    if (value === '' || /^[A-Za-z]*$/.test(value)) {
      setInputs((prev) => ({ ...prev, supplier_brandname: value }));
      setErrors((prev) => ({
        ...prev,
        supplier_brandname: value && !/^[A-Za-z]+$/.test(value) ? 'Only letters are allowed' : '',
      }));
    }
  };

  const handleEditSupplierBrandname = (e) => {
    const value = e.target.value;
    if (value === '' || /^[A-Za-z]*$/.test(value)) {
      setEditInputs((prev) => ({ ...prev, supplier_brandname: value }));
      setErrors((prev) => ({
        ...prev,
        supplier_brandname: value && !/^[A-Za-z]+$/.test(value) ? 'Only letters are allowed' : '',
      }));
    }
  };

  const handleSupplierContact = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setInputs((prev) => ({ ...prev, supplier_contact: value }));
      setErrors((prev) => ({
        ...prev,
        supplier_contact: value && !/^\d{10}$/.test(value) ? 'Phone number must be exactly 10 digits' : '',
      }));
    }
  };

  const handleEditSupplierContact = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setEditInputs((prev) => ({ ...prev, supplier_contact: value }));
      setErrors((prev) => ({
        ...prev,
        supplier_contact: value && !/^\d{10}$/.test(value) ? 'Phone number must be exactly 10 digits' : '',
      }));
    }
  };

  const handleSupplierAddress = (e) => {
    const value = e.target.value;
    if (value === '' || /^[a-zA-Z0-9\s,.]*$/.test(value)) {
      setInputs((prev) => ({ ...prev, supplier_address: value }));
      setErrors((prev) => ({
        ...prev,
        supplier_address: value && !/^[a-zA-Z0-9\s,.]+$/.test(value) ? 'Address can only contain letters, numbers, spaces, commas, and periods' : '',
      }));
    }
  };

  const handleEditSupplierAddress = (e) => {
    const value = e.target.value;
    if (value === '' || /^[a-zA-Z0-9\s,.]*$/.test(value)) {
      setEditInputs((prev) => ({ ...prev, supplier_address: value }));
      setErrors((prev) => ({
        ...prev,
        supplier_address: value && !/^[a-zA-Z0-9\s,.]+$/.test(value) ? 'Address can only contain letters, numbers, spaces, commas, and periods' : '',
      }));
    }
  };

  const handleStatus = (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, status: value }));
    setErrors((prev) => ({ ...prev, status: '' }));
  };

  const handleEditStatus = (e) => {
    const value = e.target.value;
    setEditInputs((prev) => ({ ...prev, status: value }));
    setErrors((prev) => ({ ...prev, status: '' }));
  };

  // ------------------- HANDLE KEY PRESS -------------------
  const handleKeyPress = (e, field) => {
    if (field === 'supplier_brandname' && !/[A-Za-z]/.test(e.key)) {
      e.preventDefault();
    }
    if (field === 'supplier_contact' && !/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
    if (field === 'supplier_address' && !/[a-zA-Z0-9\s,.]/.test(e.key)) {
      e.preventDefault();
    }
  };

  // ------------------- ADD SUPPLY REQUEST -------------------
  const handleAddSupplyRequest = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!inputs.supplier_brandname || !/^[A-Za-z]+$/.test(inputs.supplier_brandname)) {
      newErrors.supplier_brandname = 'Brand name must contain only letters and cannot be empty';
    }
    if (!inputs.supplier_contact || !/^\d{10}$/.test(inputs.supplier_contact)) {
      newErrors.supplier_contact = 'Phone number must be exactly 10 digits';
    }
    if (!inputs.supplier_address || !/^[a-zA-Z0-9\s,.]+$/.test(inputs.supplier_address)) {
      newErrors.supplier_address = 'Address must contain letters, numbers, spaces, commas, or periods and cannot be empty';
    }
    if (!validateStatus(inputs.status)) {
      newErrors.status = 'Invalid status';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    try {
      const res = await axios.post(URL, { ...inputs });
      setSupplyRequests([...supplyRequests, res.data]);
      setInputs(defaultInputs);
      setShowAddSupplyRequestForm(false);
      setErrors({});
      alert('Supply request added successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Error adding supply request:', err);
      setErrors({ submit: err.response?.data?.message || 'Failed to add supply request' });
    }
  };

  // ------------------- EDIT SUPPLY REQUEST -------------------
  const startEdit = (request) => {
    setEditingSupplyRequestId(request._id);
    setEditInputs({ ...request });
    setErrors({});
  };

  const handleUpdateSupplyRequest = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!editInputs.supplier_brandname || !/^[A-Za-z]+$/.test(editInputs.supplier_brandname)) {
      newErrors.supplier_brandname = 'Brand name must contain only letters and cannot be empty';
    }
    if (!editInputs.supplier_contact || !/^\d{10}$/.test(editInputs.supplier_contact)) {
      newErrors.supplier_contact = 'Phone number must be exactly 10 digits';
    }
    if (!editInputs.supplier_address || !/^[a-zA-Z0-9\s,.]+$/.test(editInputs.supplier_address)) {
      newErrors.supplier_address = 'Address must contain letters, numbers, spaces, commas, or periods and cannot be empty';
    }
    if (!validateStatus(editInputs.status)) {
      newErrors.status = 'Invalid status';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    try {
      const res = await axios.put(`${URL}/${editingSupplyRequestId}`, { ...editInputs });
      setSupplyRequests(supplyRequests.map((r) => (r._id === editingSupplyRequestId ? res.data : r)));
      setEditingSupplyRequestId(null);
      setEditInputs(defaultInputs);
      setErrors({});
      alert('Supply request updated successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Error updating supply request:', err);
      setErrors({ submit: err.response?.data?.message || 'Failed to update supply request' });
    }
  };

  // ------------------- DELETE SUPPLY REQUEST -------------------
  const handleDeleteSupplyRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supply request?')) return;
    try {
      await axios.delete(`${URL}/${id}`);
      setSupplyRequests(supplyRequests.filter((r) => r._id !== id));
      alert('Supply request deleted successfully!');
    } catch (err) {
      console.error('Error deleting supply request:', err);
      alert('Failed to delete supply request!');
    }
  };

  // ------------------- FETCH SUPPLY REQUESTS -------------------
  const fetchSupplyRequests = async () => {
    try {
      const res = await axios.get(URL);
      setSupplyRequests(res.data.supplyRequests || []);
    } catch (err) {
      console.error('Error fetching supply requests:', err);
      setSupplyRequests([]);
    }
  };

  useEffect(() => {
    fetchSupplyRequests();
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
    if (!data.length) return alert('No supply requests to download!');
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
        const footerText = `Generated by ${companyInfo.name} Supply Request Management System`;
        doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });
        const recordText = lastRecordIdx >= 0 ? `Supply Request #${String(lastRecordIdx + 1).padStart(3, '0')}` : '';
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
        let fieldsCount = Object.keys(selectedFields).filter((field) => selectedFields[field]).length;
        let itemHeight = fieldsCount * 10 + 20;
        if (tempY + itemHeight > pageHeight - 40) {
          totalPages++;
          lastRecordIdxPerPage.push(currentPageRecords[currentPageRecords.length - 1] || -1);
          currentPageRecords = [];
          tempY = 50;
        }
        currentPageRecords.push(idx);
        tempY += itemHeight;
      });
      lastRecordIdxPerPage.push(currentPageRecords[currentPageRecords.length - 1] || -1);

      let currentPage = 1;
      let y = 50;
      addLetterhead();
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(title, pageWidth / 2, 45, { align: 'center' });

      data.forEach((request, idx) => {
        let fieldsCount = Object.keys(selectedFields).filter((field) => selectedFields[field]).length;
        let itemHeight = fieldsCount * 10 + 20;
        if (y + itemHeight > pageHeight - 40) {
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
        doc.text(`Supply Request #${String(idx + 1).padStart(3, '0')}`, 15, y);
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text(`Supplier ID: ${request.supplier_id || 'N/A'}`, pageWidth - 50, y);
        y += 10;
        doc.setLineWidth(0.3);
        doc.setDrawColor(150, 150, 150);
        doc.rect(15, y, pageWidth - 30, fieldsCount * 10 + 5, 'S');
        y += 5;
        Object.keys(selectedFields).forEach((field) => {
          if (selectedFields[field]) {
            let label = field.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
            let value = request[field] || 'N/A';
            if (field === 'created_at') {
              value = new Date(value).toLocaleDateString('en-GB');
            }
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
  const handleDownloadAll = () => generatePDF(supplyRequests, 'Supply Request Directory Report');
  const handleDownloadSingle = (request) => generatePDF([request], `Supply Request Report - ${request.supplier_brandname || 'Unnamed'}`);

  // ------------------- FILTERED SUPPLY REQUESTS -------------------
  const filteredSupplyRequests = supplyRequests.filter(
    (request) =>
      (request.supplier_brandname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (request.supplier_contact?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (request.supplier_address?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (String(request.supplier_id) || '').includes(searchTerm)
  );

  // ------------------- ENUMS -------------------
  const statusOptions = ['Pending', 'Active', 'Inactive'];

  // ------------------- RENDER -------------------
  return (
    <div className="supply-request-container">
      <Nav firstName={firstName} handleLogout={handleLogout} />
      <div className="supply-request-section">
        <div className="title-container">
          <h2 className="Title">Supply Request Management System</h2>
          <p className="subtitle">{companyInfo.name} - {companyInfo.tagline}</p>
        </div>
        <button
          className="add-user-toggle"
          onClick={() => setShowAddSupplyRequestForm(!showAddSupplyRequestForm)}
        >
          {showAddSupplyRequestForm ? '✕ Hide Add Supply Request Form' : '➕ Show Add Supply Request Form'}
        </button>
        {showAddSupplyRequestForm && (
          <div className="add-user-container">
            <h3>Add New Supply Request</h3>
            <form className="add-user-form" onSubmit={handleAddSupplyRequest}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Supplier Brandname"
                  value={inputs.supplier_brandname}
                  onChange={handleSupplierBrandname}
                  onKeyPress={(e) => handleKeyPress(e, 'supplier_brandname')}
                  required
                />
                {errors.supplier_brandname && <p className="error">{errors.supplier_brandname}</p>}
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Supplier Contact"
                  value={inputs.supplier_contact}
                  onChange={handleSupplierContact}
                  onKeyPress={(e) => handleKeyPress(e, 'supplier_contact')}
                  maxLength={10}
                  required
                />
                {errors.supplier_contact && <p className="error">{errors.supplier_contact}</p>}
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Supplier Address"
                  value={inputs.supplier_address}
                  onChange={handleSupplierAddress}
                  onKeyPress={(e) => handleKeyPress(e, 'supplier_address')}
                  required
                />
                {errors.supplier_address && <p className="error">{errors.supplier_address}</p>}
              </div>
              <div className="form-group">
                <select value={inputs.status} onChange={handleStatus} required>
                  {statusOptions.map((stat) => (
                    <option key={stat} value={stat}>
                      {stat}
                    </option>
                  ))}
                </select>
                {errors.status && <p className="error">{errors.status}</p>}
              </div>
              <button type="submit" className="submit-btn">
                Add Supply Request
              </button>
              {errors.submit && <p className="error">{errors.submit}</p>}
            </form>
          </div>
        )}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by Supplier Brandname, Contact, Address or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="download-options professional-section">
          <h3>Official Report Generation</h3>
          <p>Select the fields to include in your official report:</p>
          <div className="field-checkboxes">
            {Object.keys(selectedFields).map((field) => (
              <label key={field} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedFields[field]}
                  onChange={() =>
                    setSelectedFields((prev) => ({ ...prev, [field]: !prev[field] }))
                  }
                />
                <span>
                  {field.replace('_', ' ').replace(/([A-Z])/g, ' $1').trim().replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
          <div className="download-buttons">
            <button className="download-all-btn" onClick={handleDownloadAll}>
              Download Directory ({supplyRequests.length} requests)
            </button>
            <p className="download-note">
              Reports include official letterhead with {companyInfo.name} branding and contact details.
            </p>
          </div>
        </div>
        <div className="users-table-container">
          <div className="table-header">
            <span className="table-user-count">Total Requests: {supplyRequests.length}</span>
            <span className="filtered-count">
              {searchTerm && `(Showing ${filteredSupplyRequests.length} filtered results)`}
            </span>
          </div>
          <table className="users-table">
            <thead>
              <tr>
                <th>Supplier ID</th>
                {Object.keys(defaultInputs).map((field) => (
                  <th key={field}>
                    {field.replace('_', ' ').replace(/([A-Z])/g, ' $1').trim().replace(/\b\w/g, (l) => l.toUpperCase())}
                  </th>
                ))}
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSupplyRequests.map((request) => (
                <tr key={request._id}>
                  {editingSupplyRequestId === request._id ? (
                    <td colSpan={Object.keys(defaultInputs).length + 2}>
                      <div className="update-user-container">
                        <h1>Update Supply Request Information</h1>
                        <form onSubmit={handleUpdateSupplyRequest}>
                          <div className="form-group">
                            <input
                              type="text"
                              placeholder="Supplier Brandname"
                              value={editInputs.supplier_brandname}
                              onChange={handleEditSupplierBrandname}
                              onKeyPress={(e) => handleKeyPress(e, 'supplier_brandname')}
                              required
                            />
                            {errors.supplier_brandname && (
                              <p className="error">{errors.supplier_brandname}</p>
                            )}
                          </div>
                          <div className="form-group">
                            <input
                              type="text"
                              placeholder="Supplier Contact"
                              value={editInputs.supplier_contact}
                              onChange={handleEditSupplierContact}
                              onKeyPress={(e) => handleKeyPress(e, 'supplier_contact')}
                              maxLength={10}
                              required
                            />
                            {errors.supplier_contact && <p className="error">{errors.supplier_contact}</p>}
                          </div>
                          <div className="form-group">
                            <input
                              type="text"
                              placeholder="Supplier Address"
                              value={editInputs.supplier_address}
                              onChange={handleEditSupplierAddress}
                              onKeyPress={(e) => handleKeyPress(e, 'supplier_address')}
                              required
                            />
                            {errors.supplier_address && <p className="error">{errors.supplier_address}</p>}
                          </div>
                          <div className="form-group">
                            <select value={editInputs.status} onChange={handleEditStatus} required>
                              {statusOptions.map((stat) => (
                                <option key={stat} value={stat}>
                                  {stat}
                                </option>
                              ))}
                            </select>
                            {errors.status && <p className="error">{errors.status}</p>}
                          </div>
                          <button type="submit" className="submit-btn">
                            Update Supply Request
                          </button>
                          <button
                            type="button"
                            className="cancel-button"
                            onClick={() => setEditingSupplyRequestId(null)}
                          >
                            Cancel
                          </button>
                          {errors.submit && <p className="error">{errors.submit}</p>}
                        </form>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td>{request.supplier_id || 'N/A'}</td>
                      {Object.keys(defaultInputs).map((field) => (
                        <td key={field}>
                          {field === 'status' ? (
                            <span className={`status-badge ${request[field]?.toLowerCase()}`}>
                              {request[field] || 'N/A'}
                            </span>
                          ) : (
                            request[field] || 'N/A'
                          )}
                        </td>
                      ))}
                      <td>{new Date(request.created_at).toLocaleDateString('en-GB')}</td>
                      <td className="actions-cell">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => startEdit(request)}
                          title="Edit Supply Request"
                        >
                          Update
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteSupplyRequest(request._id)}
                          title="Delete Supply Request"
                        >
                          Delete
                        </button>
                        <button
                          className="action-btn download-btn"
                          onClick={() => handleDownloadSingle(request)}
                          title="Download Supply Request Report"
                        >
                          Download
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSupplyRequests.length === 0 && (
            <div className="no-users-message">
              <p>No supply requests found matching your search criteria.</p>
              {searchTerm && (
                <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SupplyRequest;