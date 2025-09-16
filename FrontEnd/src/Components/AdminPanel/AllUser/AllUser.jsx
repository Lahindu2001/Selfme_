
import React, { useState, useEffect } from 'react';
import Nav from '../../Nav/Nav';
import axios from 'axios';
import jsPDF from 'jspdf';
import './AllUser.css';

// Validation functions aligned with Signup.jsx
const validateName = (value) => /^[A-Za-z]*$/.test(value);
const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validateNic = (value, type) => {
  if (type === 'New') return /^\d{12}$/.test(value);
  return /^\d{9}[VX]$/.test(value);
};
const validatePhone = (value) => /^\d{10}$/.test(value);
const validateCeboNo = (value) => /^\d{10}$/.test(value);
const validateDob = (value) => {
  if (!value) return false;
  const today = new Date();
  const inputDate = new Date(value);
  const ageInYears = (today - inputDate) / (1000 * 60 * 60 * 24 * 365.25);
  return inputDate < today && ageInYears >= 18;
};

const URL = 'http://localhost:5000/all-users';

function AllUser() {
  // ------------------- STATES -------------------
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
    created_at: true
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
    status: 'Active'
  };
  const tableFields = {
    firstName: '',
    lastName: '',
    email: '',
    nic: '',
    phone: '',
    dob: '',
    address: '',
    ceboNo: '',
    role: 'Customer',
    status: 'Active'
  };
  const [inputs, setInputs] = useState(defaultInputs);
  const [editInputs, setEditInputs] = useState(defaultInputs);
  const [nicType, setNicType] = useState('New');
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

  // ------------------- VALIDATION -------------------
  const validateInputs = (inputs, isEdit = false) => {
    const newErrors = {};
    if (!inputs.firstName || !validateName(inputs.firstName)) newErrors.firstName = 'First name can only contain letters';
    if (!inputs.lastName || !validateName(inputs.lastName)) newErrors.lastName = 'Last name can only contain letters';
    if (!inputs.email || !validateEmail(inputs.email)) newErrors.email = 'Invalid email format';
    if (!isEdit && !inputs.password) newErrors.password = 'Password is required';
    if (!inputs.nic || !validateNic(inputs.nic, nicType)) {
      newErrors.nic = nicType === 'New' ? 'NIC must be exactly 12 digits' : 'NIC must be 9 digits followed by V or X';
    }
    if (inputs.phone && !validatePhone(inputs.phone)) newErrors.phone = 'Phone number must be exactly 10 digits';
    if (inputs.ceboNo && !validateCeboNo(inputs.ceboNo)) newErrors.ceboNo = 'CEBO number must be exactly 10 digits';
    if (!inputs.dob || !validateDob(inputs.dob)) newErrors.dob = 'You must be at least 18 years old';
    if (!inputs.role) newErrors.role = 'Role is required';
    if (!inputs.status) newErrors.status = 'Status is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ------------------- INPUT HANDLERS -------------------
  const handleFirstName = (e) => {
    const value = e.target.value;
    if (validateName(value)) {
      setInputs(prev => ({ ...prev, firstName: value }));
      setErrors(prev => ({ ...prev, firstName: '' }));
    } else if (value === '') {
      setInputs(prev => ({ ...prev, firstName: '' }));
      setErrors(prev => ({ ...prev, firstName: '' }));
    } else {
      setErrors(prev => ({ ...prev, firstName: 'Only letters are allowed' }));
    }
  };

  const handleLastName = (e) => {
    const value = e.target.value;
    if (validateName(value)) {
      setInputs(prev => ({ ...prev, lastName: value }));
      setErrors(prev => ({ ...prev, lastName: '' }));
    } else if (value === '') {
      setInputs(prev => ({ ...prev, lastName: '' }));
      setErrors(prev => ({ ...prev, lastName: '' }));
    } else {
      setErrors(prev => ({ ...prev, lastName: 'Only letters are allowed' }));
    }
  };

  const handleEmail = (e) => {
    const value = e.target.value;
    setInputs(prev => ({ ...prev, email: value }));
    if (value && !validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handleNic = (e) => {
    const value = e.target.value;
    const isValidInput = nicType === 'New' ? /^[\d]*$/.test(value) : /^[\dVX]*$/.test(value);
    if (isValidInput && value.length <= (nicType === 'New' ? 12 : 10)) {
      setInputs(prev => ({ ...prev, nic: value }));
      if (value && !validateNic(value, nicType)) {
        setErrors(prev => ({
          ...prev,
          nic: nicType === 'New' ? 'NIC must be exactly 12 digits' : 'NIC must be 9 digits followed by V or X'
        }));
      } else {
        setErrors(prev => ({ ...prev, nic: '' }));
      }
    }
  };

  const handlePhone = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setInputs(prev => ({ ...prev, phone: value }));
      if (value && !validatePhone(value)) {
        setErrors(prev => ({ ...prev, phone: 'Phone number must be exactly 10 digits' }));
      } else {
        setErrors(prev => ({ ...prev, phone: '' }));
      }
    }
  };

  const handleCeboNo = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setInputs(prev => ({ ...prev, ceboNo: value }));
      if (value && !validateCeboNo(value)) {
        setErrors(prev => ({ ...prev, ceboNo: 'CEBO number must be exactly 10 digits' }));
      } else {
        setErrors(prev => ({ ...prev, ceboNo: '' }));
      }
    }
  };

  const handleDob = (e) => {
    const value = e.target.value;
    if ((/^\d{4}-\d{2}-\d{2}$/.test(value) || value === '') && (validateDob(value) || value === '')) {
      setInputs(prev => ({ ...prev, dob: value }));
      setErrors(prev => ({ ...prev, dob: '' }));
    } else if (value) {
      setErrors(prev => ({ ...prev, dob: 'You must be at least 18 years old and use YYYY-MM-DD format' }));
    }
  };

  const handleEditFirstName = (e) => {
    const value = e.target.value;
    if (validateName(value)) {
      setEditInputs(prev => ({ ...prev, firstName: value }));
      setErrors(prev => ({ ...prev, firstName: '' }));
    } else if (value === '') {
      setEditInputs(prev => ({ ...prev, firstName: '' }));
      setErrors(prev => ({ ...prev, firstName: '' }));
    } else {
      setErrors(prev => ({ ...prev, firstName: 'Only letters are allowed' }));
    }
  };

  const handleEditLastName = (e) => {
    const value = e.target.value;
    if (validateName(value)) {
      setEditInputs(prev => ({ ...prev, lastName: value }));
      setErrors(prev => ({ ...prev, lastName: '' }));
    } else if (value === '') {
      setEditInputs(prev => ({ ...prev, lastName: '' }));
      setErrors(prev => ({ ...prev, lastName: '' }));
    } else {
      setErrors(prev => ({ ...prev, lastName: 'Only letters are allowed' }));
    }
  };

  const handleEditEmail = (e) => {
    const value = e.target.value;
    setEditInputs(prev => ({ ...prev, email: value }));
    if (value && !validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handleEditNic = (e) => {
    const value = e.target.value;
    const isValidInput = nicType === 'New' ? /^[\d]*$/.test(value) : /^[\dVX]*$/.test(value);
    if (isValidInput && value.length <= (nicType === 'New' ? 12 : 10)) {
      setEditInputs(prev => ({ ...prev, nic: value }));
      if (value && !validateNic(value, nicType)) {
        setErrors(prev => ({
          ...prev,
          nic: nicType === 'New' ? 'NIC must be exactly 12 digits' : 'NIC must be 9 digits followed by V or X'
        }));
      } else {
        setErrors(prev => ({ ...prev, nic: '' }));
      }
    }
  };

  const handleEditPhone = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setEditInputs(prev => ({ ...prev, phone: value }));
      if (value && !validatePhone(value)) {
        setErrors(prev => ({ ...prev, phone: 'Phone number must be exactly 10 digits' }));
      } else {
        setErrors(prev => ({ ...prev, phone: '' }));
      }
    }
  };

  const handleEditCeboNo = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setEditInputs(prev => ({ ...prev, ceboNo: value }));
      if (value && !validateCeboNo(value)) {
        setErrors(prev => ({ ...prev, ceboNo: 'CEBO number must be exactly 10 digits' }));
      } else {
        setErrors(prev => ({ ...prev, ceboNo: '' }));
      }
    }
  };

  const handleEditDob = (e) => {
    const value = e.target.value;
    if ((/^\d{4}-\d{2}-\d{2}$/.test(value) || value === '') && (validateDob(value) || value === '')) {
      setEditInputs(prev => ({ ...prev, dob: value }));
      setErrors(prev => ({ ...prev, dob: '' }));
    } else if (value) {
      setErrors(prev => ({ ...prev, dob: 'You must be at least 18 years old and use YYYY-MM-DD format' }));
    }
  };

  // ------------------- FETCH USERS -------------------
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
        let fieldsCount = Object.keys(selectedFields).filter(field => selectedFields[field] && field !== 'password').length;
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
        let fieldsCount = Object.keys(selectedFields).filter(field => selectedFields[field] && field !== 'password').length;
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
        doc.text(`User #${String(idx + 1).padStart(3, '0')}`, 15, y);
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text(`User ID: ${user.userid || 'N/A'}`, pageWidth - 50, y);
        y += 10;
        doc.setLineWidth(0.3);
        doc.setDrawColor(150, 150, 150);
        doc.rect(15, y, pageWidth - 30, fieldsCount * 10 + 5, 'S');
        y += 5;
        Object.keys(selectedFields).forEach(field => {
          if (selectedFields[field] && field !== 'password') {
            let label = field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            let value = field === 'dob' ? (user[field] ? new Date(user[field]).toLocaleDateString('en-GB') : 'N/A') : (user[field] || 'N/A');
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

  // ------------------- ADD USER -------------------
  const handleAddUser = async e => {
    e.preventDefault();
    if (!validateInputs(inputs)) return;
    try {
      const res = await axios.post(URL, inputs);
      setUsers([...users, res.data.user]);
      setInputs(defaultInputs);
      setShowAddForm(false);
      alert('User added successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Error adding user:', err);
      setErrors({ submit: err.response?.data?.message || 'Failed to add user' });
    }
  };

  // ------------------- EDIT USER -------------------
  const startEdit = user => {
    setEditingUserId(user._id);
    setEditInputs({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: user.password || '',
      nic: user.nic || '',
      phone: user.phone || '',
      dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
      address: user.address || '',
      ceboNo: user.ceboNo || '',
      role: user.role || 'Customer',
      status: user.status || 'Active'
    });
  };

  const handleUpdateUser = async e => {
    e.preventDefault();
    if (!validateInputs(editInputs, true)) return;
    try {
      const res = await axios.put(`${URL}/${editingUserId}`, editInputs);
      setUsers(users.map(p => (p._id === editingUserId ? res.data.user : p)));
      setEditingUserId(null);
      setEditInputs(defaultInputs);
      alert('User updated successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Error updating user:', err);
      setErrors({ submit: err.response?.data?.message || 'Failed to update user' });
    }
  };

  // ------------------- DELETE USER -------------------
  const handleDeleteUser = async id => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${URL}/${id}`);
      setUsers(users.filter(p => p._id !== id));
      alert('User deleted successfully!');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user!');
    }
  };

  // ------------------- DOWNLOAD FUNCTIONS -------------------
  const handleDownloadAll = () => generatePDF(users, 'Complete User Directory Report');
  const handleDownloadSingle = user => generatePDF([user], `Individual User Report - ${user.firstName}`);

  // ------------------- FILTERED USERS -------------------
  const filteredUsers = users.filter(user =>
    (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // ------------------- RENDER -------------------
  return (
    <div className="supply-products-section">
      <Nav />
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
              <label htmlFor="firstName">FIRST NAME</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Enter First Name"
                value={inputs.firstName}
                onChange={handleFirstName}
                required
              />
              {errors.firstName && <span className="error">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="lastName">LAST NAME</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Enter Last Name"
                value={inputs.lastName}
                onChange={handleLastName}
                required
              />
              {errors.lastName && <span className="error">{errors.lastName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="email">EMAIL</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter Email"
                value={inputs.email}
                onChange={handleEmail}
                required
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="password">PASSWORD</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter Password"
                value={inputs.password}
                onChange={e => setInputs(prev => ({ ...prev, password: e.target.value }))}
                required
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="nicType">NIC TYPE</label>
              <select
                id="nicType"
                value={nicType}
                onChange={e => setNicType(e.target.value)}
              >
                <option value="New">New (12 digits)</option>
                <option value="Old">Old (9 digits + V/X)</option>
              </select>
              <label htmlFor="nic">NIC</label>
              <input
                type="text"
                id="nic"
                name="nic"
                placeholder="Enter NIC"
                value={inputs.nic}
                onChange={handleNic}
                maxLength={nicType === 'New' ? 12 : 10}
                required
              />
              {errors.nic && <span className="error">{errors.nic}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="phone">PHONE</label>
              <input
                type="text"
                id="phone"
                name="phone"
                placeholder="Enter Phone"
                value={inputs.phone}
                onChange={handlePhone}
                pattern="\d{10}"
                title="Phone number must be exactly 10 digits"
              />
              {errors.phone && <span className="error">{errors.phone}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="dob">DOB</label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={inputs.dob}
                onChange={handleDob}
                max={new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]}
                required
              />
              {errors.dob && <span className="error">{errors.dob}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="address">ADDRESS</label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Enter Address"
                value={inputs.address}
                onChange={e => setInputs(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="ceboNo">CEBO NO</label>
              <input
                type="text"
                id="ceboNo"
                name="ceboNo"
                placeholder="Enter Cebo No"
                value={inputs.ceboNo}
                onChange={handleCeboNo}
                pattern="\d{10}"
                title="CEBO number must be exactly 10 digits"
              />
              {errors.ceboNo && <span className="error">{errors.ceboNo}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="role">ROLE</label>
              <select
                id="role"
                name="role"
                value={inputs.role}
                onChange={e => setInputs(prev => ({ ...prev, role: e.target.value }))}
                required
              >
                <option value="Admin">Admin</option>
                <option value="Inventory">Inventory</option>
                <option value="Finance">Finance</option>
                <option value="Technician">Technician</option>
                <option value="Customer">Customer</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="status">STATUS</label>
              <select
                id="status"
                name="status"
                value={inputs.status}
                onChange={e => setInputs(prev => ({ ...prev, status: e.target.value }))}
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <button type="submit" className="submit-btn">Add User</button>
            {errors.submit && <span className="error">{errors.submit}</span>}
          </form>
        </div>
      )}
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search by First Name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="download-options professional-section">
        <h3>📄 Official Report Generation</h3>
        <p>Select the fields to include in your official report:</p>
        <div className="field-checkboxes">
          {Object.keys(selectedFields).map(field => (
            field !== 'password' && (
              <label key={field} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedFields[field]}
                  onChange={() => setSelectedFields(prev => ({ ...prev, [field]: !prev[field] }))}
                />
                <span>{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              </label>
            )
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
          <span className="table-user-count">👥 Total Users: {users.length}</span>
          <span className="filtered-count">
            {searchTerm && `(Showing ${filteredUsers.length} filtered results)`}
          </span>
        </div>
        <div className="table-scroll-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>User ID</th>
                {Object.keys(tableFields).map(field => (
                  <th key={field}>{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  {editingUserId === user._id ? (
                    <td colSpan={Object.keys(tableFields).length + 2}>
                      <div className="update-user-container">
                        <h1>✏️ Update User Information</h1>
                        <form onSubmit={handleUpdateUser}>
                          <div className="form-group">
                            <label htmlFor="firstName">FIRST NAME</label>
                            <input
                              type="text"
                              id="firstName"
                              name="firstName"
                              placeholder="Enter First Name"
                              value={editInputs.firstName}
                              onChange={handleEditFirstName}
                              required
                            />
                            {errors.firstName && <span className="error">{errors.firstName}</span>}
                          </div>
                          <div className="form-group">
                            <label htmlFor="lastName">LAST NAME</label>
                            <input
                              type="text"
                              id="lastName"
                              name="lastName"
                              placeholder="Enter Last Name"
                              value={editInputs.lastName}
                              onChange={handleEditLastName}
                              required
                            />
                            {errors.lastName && <span className="error">{errors.lastName}</span>}
                          </div>
                          <div className="form-group">
                            <label htmlFor="email">EMAIL</label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              placeholder="Enter Email"
                              value={editInputs.email}
                              onChange={handleEditEmail}
                              required
                            />
                            {errors.email && <span className="error">{errors.email}</span>}
                          </div>
                          <div className="form-group">
                            <label htmlFor="password">PASSWORD</label>
                            <input
                              type="password"
                              id="password"
                              name="password"
                              placeholder="Enter Password"
                              value={editInputs.password}
                              onChange={e => setEditInputs(prev => ({ ...prev, password: e.target.value }))}
                            />
                            {errors.password && <span className="error">{errors.password}</span>}
                          </div>
                          <div className="form-group">
                            <label htmlFor="nicType">NIC TYPE</label>
                            <select
                              id="nicType"
                              value={nicType}
                              onChange={e => setNicType(e.target.value)}
                            >
                              <option value="New">New (12 digits)</option>
                              <option value="Old">Old (9 digits + V/X)</option>
                            </select>
                            <label htmlFor="nic">NIC</label>
                            <input
                              type="text"
                              id="nic"
                              name="nic"
                              placeholder="Enter NIC"
                              value={editInputs.nic}
                              onChange={handleEditNic}
                              maxLength={nicType === 'New' ? 12 : 10}
                              required
                            />
                            {errors.nic && <span className="error">{errors.nic}</span>}
                          </div>
                          <div className="form-group">
                            <label htmlFor="phone">PHONE</label>
                            <input
                              type="text"
                              id="phone"
                              name="phone"
                              placeholder="Enter Phone"
                              value={editInputs.phone}
                              onChange={handleEditPhone}
                              pattern="\d{10}"
                              title="Phone number must be exactly 10 digits"
                            />
                            {errors.phone && <span className="error">{errors.phone}</span>}
                          </div>
                          <div className="form-group">
                            <label htmlFor="dob">DOB</label>
                            <input
                              type="date"
                              id="dob"
                              name="dob"
                              value={editInputs.dob}
                              onChange={handleEditDob}
                              max={new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]}
                              required
                            />
                            {errors.dob && <span className="error">{errors.dob}</span>}
                          </div>
                          <div className="form-group">
                            <label htmlFor="address">ADDRESS</label>
                            <input
                              type="text"
                              id="address"
                              name="address"
                              placeholder="Enter Address"
                              value={editInputs.address}
                              onChange={e => setEditInputs(prev => ({ ...prev, address: e.target.value }))}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="ceboNo">CEBO NO</label>
                            <input
                              type="text"
                              id="ceboNo"
                              name="ceboNo"
                              placeholder="Enter Cebo No"
                              value={editInputs.ceboNo}
                              onChange={handleEditCeboNo}
                              pattern="\d{10}"
                              title="CEBO number must be exactly 10 digits"
                            />
                            {errors.ceboNo && <span className="error">{errors.ceboNo}</span>}
                          </div>
                          <div className="form-group">
                            <label htmlFor="role">ROLE</label>
                            <select
                              id="role"
                              name="role"
                              value={editInputs.role}
                              onChange={e => setEditInputs(prev => ({ ...prev, role: e.target.value }))}
                              required
                            >
                              <option value="Admin">Admin</option>
                              <option value="Inventory">Inventory</option>
                              <option value="Finance">Finance</option>
                              <option value="Technician">Technician</option>
                              <option value="Customer">Customer</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label htmlFor="status">STATUS</label>
                            <select
                              id="status"
                              name="status"
                              value={editInputs.status}
                              onChange={e => setEditInputs(prev => ({ ...prev, status: e.target.value }))}
                              required
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          </div>
                          <button type="submit" className="submit-btn">✅ Update User</button>
                          <button type="button" className="cancel-button" onClick={() => setEditingUserId(null)}>❌ Cancel</button>
                          {errors.submit && <span className="error">{errors.submit}</span>}
                        </form>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td>{user.userid || 'N/A'}</td>
                      {Object.keys(tableFields).map(field => (
                        <td key={field}>
                          {field === 'dob' ? (user[field] ? new Date(user[field]).toLocaleDateString('en-GB') : 'N/A') : user[field] || 'N/A'}
                        </td>
                      ))}
                      <td className="actions-cell">
                        <button className="action-btn edit-btn" onClick={() => startEdit(user)} title="Edit User">
                          ✏️
                        </button>
                        <button className="action-btn delete-btn" onClick={() => handleDeleteUser(user._id)} title="Delete User">
                          🗑️
                        </button>
                        <button className="action-btn download-btn" onClick={() => handleDownloadSingle(user)} title="Download User Report">
                          📄
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
  );
}

export default AllUser;