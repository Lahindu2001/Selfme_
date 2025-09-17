import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../../../utils/auth';
import Nav from '../../Nav/Nav';
import axios from 'axios';
import jsPDF from 'jspdf';
import './AllUser.css';

const URL = 'http://localhost:5000/all-users';

function AllUser() {
  const navigate = useNavigate();
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
  const firstName = authUser.firstName || 'Admin';

  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem('authUser');
    navigate('/login');
  };

  // Validation functions
  const validateName = (value) => /^[A-Za-z]*$/.test(value);
  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validateNic = (value, type) => (type === 'New' ? /^\d{12}$/.test(value) : /^\d{9}[VX]$/.test(value));
  const validatePhone = (value) => /^\d{10}$/.test(value);
  const validateCeboNo = (value) => /^\d{10}$/.test(value);
  const validateDob = (value) => {
    if (!value) return false;
    const today = new Date();
    const inputDate = new Date(value);
    const ageInYears = (today - inputDate) / (1000 * 60 * 60 * 24 * 365.25);
    return inputDate < today && ageInYears >= 18;
  };

  // State Management
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedFields, setSelectedFields] = useState({
    firstName: true,
    lastName: true,
    email: true,
    nic: true,
    phone: true,
    dob: true,
    address: true,
    ceboNo: true,
    role: true,
    status: true,
  });
  const defaultInputs = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    nic: '',
    phone: '',
    dob: '',
    address: '',
    ceboNo: '',
    role: 'Customer',
    status: 'Active',
  };
  const [inputs, setInputs] = useState(defaultInputs);
  const [editInputs, setEditInputs] = useState(defaultInputs);
  const [errors, setErrors] = useState({});
  const [nicType, setNicType] = useState('New');

  // Company Information
  const companyInfo = {
    name: 'SelfMe',
    tagline: 'FUTURE OF SUN - SOLAR POWER',
    address: ['No/346, Madalanda, Dompe,', 'Colombo, Sri Lanka'],
    phone: '+94 717 882 883',
    email: 'Selfmepvtltd@gmail.com',
    website: 'www.selfme.com',
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(URL);
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Input Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if ((name === 'firstName' || name === 'lastName') && value !== '' && !validateName(value)) {
      return;
    }
    if ((name === 'phone' || name === 'ceboNo') && value !== '' && !/^\d*$/.test(value)) {
      return;
    }
    if (name === 'nic' && value !== '' && !(nicType === 'New' ? /^\d*$/ : /^[\dVX]*$/).test(value)) {
      return;
    }
    setInputs((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    if ((name === 'firstName' || name === 'lastName') && value !== '' && !validateName(value)) {
      return;
    }
    if ((name === 'phone' || name === 'ceboNo') && value !== '' && !/^\d*$/.test(value)) {
      return;
    }
    if (name === 'nic' && value !== '' && !(nicType === 'New' ? /^\d*$/ : /^[\dVX]*$/).test(value)) {
      return;
    }
    setEditInputs((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const handleKeyPress = (e, field) => {
    if (field === 'firstName' || field === 'lastName') {
      if (!/[A-Za-z]/.test(e.key)) e.preventDefault();
    }
    if (field === 'phone' || field === 'ceboNo') {
      if (!/[0-9]/.test(e.key)) e.preventDefault();
    }
    if (field === 'nic') {
      if (nicType === 'New' && !/[0-9]/.test(e.key)) e.preventDefault();
      if (nicType === 'Old' && !/[0-9VX]/.test(e.key)) e.preventDefault();
    }
  };

  // Validation
  const validateInputs = (inputData, isEdit = false) => {
    const newErrors = {};
    if (!inputData.firstName || !validateName(inputData.firstName)) {
      newErrors.firstName = 'First name must contain only letters';
    }
    if (!inputData.lastName || !validateName(inputData.lastName)) {
      newErrors.lastName = 'Last name must contain only letters';
    }
    if (!inputData.email || !validateEmail(inputData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!isEdit && (!inputData.password || inputData.password.length < 6)) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!inputData.nic || !validateNic(inputData.nic, nicType)) {
      newErrors.nic = nicType === 'New' ? 'NIC must be 12 digits' : 'NIC must be 9 digits + V/X';
    }
    if (inputData.phone && !validatePhone(inputData.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    if (inputData.ceboNo && !validateCeboNo(inputData.ceboNo)) {
      newErrors.ceboNo = 'CEBO must be 10 digits';
    }
    if (!inputData.dob || !validateDob(inputData.dob)) {
      newErrors.dob = 'Must be 18+ and a valid date';
    }
    if (!inputData.role) {
      newErrors.role = 'Role is required';
    }
    if (!inputData.status) {
      newErrors.status = 'Status is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // CRUD Operations
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!validateInputs(inputs)) return;
    try {
      const res = await axios.post(URL, inputs);
      setUsers([...users, res.data.user]);
      setInputs(defaultInputs);
      setShowAddForm(false);
      setErrors({});
      alert('User added successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Error adding user:', err);
      setErrors({ submit: err.response?.data?.message || 'Failed to add user' });
    }
  };

  const startEdit = (user) => {
    setEditingUserId(user._id);
    setEditInputs({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: '',
      nic: user.nic || '',
      phone: user.phone || '',
      dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
      address: user.address || '',
      ceboNo: user.ceboNo || '',
      role: user.role || 'Customer',
      status: user.status || 'Active',
    });
    setNicType(user.nic?.length === 12 ? 'New' : 'Old');
    setErrors({});
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!validateInputs(editInputs, true)) return;
    try {
      const res = await axios.put(`${URL}/${editingUserId}`, editInputs);
      setUsers(users.map((u) => (u._id === editingUserId ? res.data.user : u)));
      setEditingUserId(null);
      setEditInputs(defaultInputs);
      setErrors({});
      alert('User updated successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Error updating user:', err);
      setErrors({ submit: err.response?.data?.message || 'Failed to update user' });
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${URL}/${id}`);
      setUsers(users.filter((u) => u._id !== id));
      alert('User deleted successfully!');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user!');
    }
  };

  // PDF Generation
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

  const generatePDF = async (data, title) => {
    if (!data.length) return alert('No users to download!');
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
        const footerText = `Generated by ${companyInfo.name} User Management System`;
        doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });
        const recordText = lastRecordIdx >= 0 ? `User #${String(lastRecordIdx + 1).padStart(3, '0')}` : '';
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
        let userHeight = fieldsCount * 10 + 20;
        if (tempY + userHeight > pageHeight - 40) {
          totalPages++;
          lastRecordIdxPerPage.push(currentPageRecords[currentPageRecords.length - 1] || -1);
          currentPageRecords = [];
          tempY = 50;
        }
        currentPageRecords.push(idx);
        tempY += userHeight;
      });
      lastRecordIdxPerPage.push(currentPageRecords[currentPageRecords.length - 1] || -1);

      let currentPage = 1;
      let y = 50;
      addLetterhead();
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(title, pageWidth / 2, 45, { align: 'center' });

      data.forEach((user, idx) => {
        let fieldsCount = Object.keys(selectedFields).filter((field) => selectedFields[field]).length;
        let userHeight = fieldsCount * 10 + 20;
        if (y + userHeight > pageHeight - 40) {
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
        doc.text(`User #${String(idx + 1).padStart(3, '0')}`, pageWidth - 15, y, { align: 'right' });
        y += 10;
        doc.setLineWidth(0.3);
        doc.setDrawColor(150, 150, 150);
        doc.rect(15, y, pageWidth - 30, fieldsCount * 10 + 5, 'S');
        y += 5;
        Object.keys(selectedFields).forEach((field) => {
          if (selectedFields[field]) {
            let label = field.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
            let value = user[field] || 'N/A';
            if (field === 'dob' && value !== 'N/A') {
              value = new Date(value).toISOString().split('T')[0];
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

  // Download Functions
  const handleDownloadAll = () => generatePDF(users, 'User Directory Report');
  const handleDownloadSingle = (user) => generatePDF([user], `User Report - ${user.firstName}`);

  // Filtered Users
  const filteredUsers = users.filter((user) =>
    (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Define visible fields for table
  const visibleFields = [
    'firstName',
    'lastName',
    'email',
    'nic',
    'phone',
    'dob',
    'address',
    'ceboNo',
    'role',
    'status',
  ];

  // Render
  return (
    <div className="all-users-container">
      <Nav firstName={firstName} handleLogout={handleLogout} />
      <div className="all-users-section">
        <div className="title-container">
          <h2 className="Title">User Management System</h2>
          <p className="subtitle">{companyInfo.name} - {companyInfo.tagline}</p>
        </div>
        <button className="add-user-toggle" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? '✕ Hide Add User Form' : '➕ Show Add User Form'}
        </button>
        {showAddForm && (
          <div className="add-user-container">
            <h3>📝 Add New User</h3>
            <form className="add-user-form" onSubmit={handleAddUser}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="First Name"
                  name="firstName"
                  value={inputs.firstName}
                  onChange={handleInputChange}
                  onKeyPress={(e) => handleKeyPress(e, 'firstName')}
                  required
                />
                {errors.firstName && <p className="error">{errors.firstName}</p>}
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Last Name"
                  name="lastName"
                  value={inputs.lastName}
                  onChange={handleInputChange}
                  onKeyPress={(e) => handleKeyPress(e, 'lastName')}
                  required
                />
                {errors.lastName && <p className="error">{errors.lastName}</p>}
              </div>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={inputs.email}
                  onChange={handleInputChange}
                  required
                />
                {errors.email && <p className="error">{errors.email}</p>}
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={inputs.password}
                  onChange={handleInputChange}
                  required
                />
                {errors.password && <p className="error">{errors.password}</p>}
              </div>
              <div className="form-group">
                <select name="nicType" value={nicType} onChange={(e) => setNicType(e.target.value)}>
                  <option value="New">New (12 digits)</option>
                  <option value="Old">Old (9 digits + V/X)</option>
                </select>
                <input
                  type="text"
                  placeholder="NIC"
                  name="nic"
                  value={inputs.nic}
                  onChange={handleInputChange}
                  onKeyPress={(e) => handleKeyPress(e, 'nic')}
                  maxLength={nicType === 'New' ? 12 : 10}
                  required
                />
                {errors.nic && <p className="error">{errors.nic}</p>}
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Phone"
                  name="phone"
                  value={inputs.phone}
                  onChange={handleInputChange}
                  onKeyPress={(e) => handleKeyPress(e, 'phone')}
                />
                {errors.phone && <p className="error">{errors.phone}</p>}
              </div>
              <div className="form-group">
                <input
                  type="date"
                  placeholder="Date of Birth"
                  name="dob"
                  value={inputs.dob}
                  onChange={handleInputChange}
                  max={new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]}
                  required
                />
                {errors.dob && <p className="error">{errors.dob}</p>}
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Address"
                  name="address"
                  value={inputs.address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="CEBO No"
                  name="ceboNo"
                  value={inputs.ceboNo}
                  onChange={handleInputChange}
                  onKeyPress={(e) => handleKeyPress(e, 'ceboNo')}
                />
                {errors.ceboNo && <p className="error">{errors.ceboNo}</p>}
              </div>
              <div className="form-group">
                <select name="role" value={inputs.role} onChange={handleInputChange} required>
                  <option value="Admin">Admin</option>
                  <option value="Inventory">Inventory</option>
                  <option value="Finance">Finance</option>
                  <option value="Technician">Technician</option>
                  <option value="Customer">Customer</option>
                </select>
                {errors.role && <p className="error">{errors.role}</p>}
              </div>
              <div className="form-group">
                <select name="status" value={inputs.status} onChange={handleInputChange} required>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {errors.status && <p className="error">{errors.status}</p>}
              </div>
              <button type="submit" className="submit-btn">Add User</button>
              {errors.submit && <p className="error">{errors.submit}</p>}
            </form>
          </div>
        )}
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search by First Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="download-options professional-section">
          <h3>📄 Official Report Generation</h3>
          <p>Select the fields to include in your official report:</p>
          <div className="field-checkboxes">
            {Object.keys(selectedFields).map((field) => (
              <label key={field} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedFields[field]}
                  onChange={() => setSelectedFields((prev) => ({ ...prev, [field]: !prev[field] }))}
                />
                <span>{field.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</span>
              </label>
            ))}
          </div>
          <div className="download-buttons">
            <button className="download-all-btn" onClick={handleDownloadAll}>
              📊 Download Directory ({users.length} users)
            </button>
            <p className="download-note">
              Reports include official letterhead with {companyInfo.name} branding and contact details.
            </p>
          </div>
        </div>
        <div className="users-table-container">
          <div className="table-header">
            <span className="table-user-count">👤 Total Users: {users.length}</span>
            <span className="filtered-count">
              {searchTerm && `(Showing ${filteredUsers.length} filtered results)`}
            </span>
          </div>
          <table className="users-table">
            <thead>
              <tr>
                {visibleFields.map((field) => (
                  <th key={field}>{field.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  {editingUserId === user._id ? (
                    <td colSpan={visibleFields.length + 1}>
                      <div className="update-user-container">
                        <h1>✏️ Update User Information</h1>
                        <form onSubmit={handleUpdateUser}>
                          <div className="form-group">
                            <input
                              type="text"
                              placeholder="First Name"
                              name="firstName"
                              value={editInputs.firstName}
                              onChange={handleEditInputChange}
                              onKeyPress={(e) => handleKeyPress(e, 'firstName')}
                              required
                            />
                            {errors.firstName && <p className="error">{errors.firstName}</p>}
                          </div>
                          <div className="form-group">
                            <input
                              type="text"
                              placeholder="Last Name"
                              name="lastName"
                              value={editInputs.lastName}
                              onChange={handleEditInputChange}
                              onKeyPress={(e) => handleKeyPress(e, 'lastName')}
                              required
                            />
                            {errors.lastName && <p className="error">{errors.lastName}</p>}
                          </div>
                          <div className="form-group">
                            <input
                              type="email"
                              placeholder="Email"
                              name="email"
                              value={editInputs.email}
                              onChange={handleEditInputChange}
                              required
                            />
                            {errors.email && <p className="error">{errors.email}</p>}
                          </div>
                          <div className="form-group">
                            <input
                              type="password"
                              placeholder="Password (optional)"
                              name="password"
                              value={editInputs.password}
                              onChange={handleEditInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <select name="nicType" value={nicType} onChange={(e) => setNicType(e.target.value)}>
                              <option value="New">New (12 digits)</option>
                              <option value="Old">Old (9 digits + V/X)</option>
                            </select>
                            <input
                              type="text"
                              placeholder="NIC"
                              name="nic"
                              value={editInputs.nic}
                              onChange={handleEditInputChange}
                              onKeyPress={(e) => handleKeyPress(e, 'nic')}
                              maxLength={nicType === 'New' ? 12 : 10}
                              required
                            />
                            {errors.nic && <p className="error">{errors.nic}</p>}
                          </div>
                          <div className="form-group">
                            <input
                              type="text"
                              placeholder="Phone"
                              name="phone"
                              value={editInputs.phone}
                              onChange={handleEditInputChange}
                              onKeyPress={(e) => handleKeyPress(e, 'phone')}
                            />
                            {errors.phone && <p className="error">{errors.phone}</p>}
                          </div>
                          <div className="form-group">
                            <input
                              type="date"
                              placeholder="Date of Birth"
                              name="dob"
                              value={editInputs.dob}
                              onChange={handleEditInputChange}
                              max={new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]}
                              required
                            />
                            {errors.dob && <p className="error">{errors.dob}</p>}
                          </div>
                          <div className="form-group">
                            <input
                              type="text"
                              placeholder="Address"
                              name="address"
                              value={editInputs.address}
                              onChange={handleEditInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <input
                              type="text"
                              placeholder="CEBO No"
                              name="ceboNo"
                              value={editInputs.ceboNo}
                              onChange={handleEditInputChange}
                              onKeyPress={(e) => handleKeyPress(e, 'ceboNo')}
                            />
                            {errors.ceboNo && <p className="error">{errors.ceboNo}</p>}
                          </div>
                          <div className="form-group">
                            <select name="role" value={editInputs.role} onChange={handleEditInputChange} required>
                              <option value="Admin">Admin</option>
                              <option value="Inventory">Inventory</option>
                              <option value="Finance">Finance</option>
                              <option value="Technician">Technician</option>
                              <option value="Customer">Customer</option>
                            </select>
                            {errors.role && <p className="error">{errors.role}</p>}
                          </div>
                          <div className="form-group">
                            <select name="status" value={editInputs.status} onChange={handleEditInputChange} required>
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                            {errors.status && <p className="error">{errors.status}</p>}
                          </div>
                          <button type="submit" className="submit-btn">✅ Update User</button>
                          <button
                            type="button"
                            className="cancel-button"
                            onClick={() => setEditingUserId(null)}
                          >
                            ❌ Cancel
                          </button>
                          {errors.submit && <p className="error">{errors.submit}</p>}
                        </form>
                      </div>
                    </td>
                  ) : (
                    <>
                      {visibleFields.map((field) => (
                        <td key={field}>{field === 'dob' && user[field] ? new Date(user[field]).toISOString().split('T')[0] : user[field] || 'N/A'}</td>
                      ))}
                      <td className="actions-cell">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => startEdit(user)}
                          title="Edit User"
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteUser(user._id)}
                          title="Delete User"
                        >
                          🗑️
                        </button>
                        <button
                          className="action-btn download-btn"
                          onClick={() => handleDownloadSingle(user)}
                          title="Download User Report"
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
          {filteredUsers.length === 0 && (
            <div className="no-users-message">
              <p>📭 No users found matching your search criteria.</p>
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

export default AllUser;