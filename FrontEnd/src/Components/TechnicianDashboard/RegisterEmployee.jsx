import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import './RegisterEmployee.css';

const URL = 'http://localhost:5000/employees';

function RegisterEmployee() {
  // ------------------- STATES -------------------
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [selectedFields, setSelectedFields] = useState({
    employee_id: true,
    Employee_name: true,
    Employee_Address: true,
    Employee_Dob: true,
    contact_number: true,
    hire_date: true,
    assigned_tasks: true,
    created_at: true,
  });
  const defaultInputs = {
    Employee_name: '',
    Employee_Address: '',
    Employee_Dob: '',
    contact_number: '',
    hire_date: '',
    assigned_tasks: [],
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
    website: 'www.selfme.com',
  };

  // ------------------- INPUT HANDLERS -------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditInputs((prev) => ({ ...prev, [name]: value }));
  };

  // ------------------- ADD EMPLOYEE -------------------
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(URL + '/register', { ...inputs });
      setEmployees([...employees, res.data.employee]);
      setInputs(defaultInputs);
      setShowAddEmployeeForm(false);
      alert('Employee added successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Error adding employee:', err);
      alert(err.response?.data?.message || 'Failed to add employee');
    }
  };

  // ------------------- EDIT EMPLOYEE -------------------
  const startEdit = (employee) => {
    setEditingEmployeeId(employee._id);
    setEditInputs({
      Employee_name: employee.Employee_name,
      Employee_Address: employee.Employee_Address,
      Employee_Dob: employee.Employee_Dob ? new Date(employee.Employee_Dob).toISOString().split('T')[0] : '',
      contact_number: employee.contact_number,
      hire_date: employee.hire_date ? new Date(employee.hire_date).toISOString().split('T')[0] : '',
      assigned_tasks: employee.assigned_tasks,
    });
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${URL}/${editingEmployeeId}`, { ...editInputs });
      setEmployees(employees.map((e) => (e._id === editingEmployeeId ? res.data.employee : e)));
      setEditingEmployeeId(null);
      setEditInputs(defaultInputs);
      alert('Employee updated successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Error updating employee:', err);
      alert(err.response?.data?.message || 'Failed to update employee');
    }
  };

  // ------------------- DELETE EMPLOYEE -------------------
  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await axios.delete(`${URL}/${id}`);
      setEmployees(employees.filter((e) => e._id !== id));
      alert('Employee deleted successfully!');
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('Failed to delete employee!');
    }
  };

  // ------------------- FETCH EMPLOYEES -------------------
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(URL);
      setEmployees(res.data.employees || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
    }
  };

  useEffect(() => {
    fetchEmployees();
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

  // ------------------- PDF GENERATION -------------------
  const generatePDF = async (data, title) => {
    if (!data.length) return alert('No employees to download!');
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
        const footerText = `Generated by ${companyInfo.name} Employee Management System`;
        doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });
        const recordText = lastRecordIdx >= 0 ? `Employee #${String(lastRecordIdx + 1).padStart(3, '0')}` : '';
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

      data.forEach((employee, idx) => {
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
        doc.text(`Employee #${String(idx + 1).padStart(3, '0')}`, 15, y);
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text(`Employee ID: ${employee.employee_id || 'N/A'}`, pageWidth - 50, y);
        y += 10;
        doc.setLineWidth(0.3);
        doc.setDrawColor(150, 150, 150);
        doc.rect(15, y, pageWidth - 30, fieldsCount * 10 + 5, 'S');
        y += 5;
        Object.keys(selectedFields).forEach((field) => {
          if (selectedFields[field]) {
            let label = field.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
            let value = employee[field] || 'N/A';
            if (field === 'Employee_Dob' || field === 'hire_date' || field === 'created_at') {
              value = value ? new Date(value).toLocaleDateString('en-GB') : 'N/A';
            }
            if (field === 'assigned_tasks') {
              value = Array.isArray(value) ? value.join(', ') : 'N/A';
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
  const handleDownloadAll = () => generatePDF(employees, 'Employee Directory Report');
  const handleDownloadSingle = (employee) => generatePDF([employee], `Employee Report - ${employee.employee_id || 'Unnamed'}`);

  // ------------------- FILTERED EMPLOYEES -------------------
  const filteredEmployees = employees.filter(
    (employee) =>
      (String(employee.employee_id) || '').includes(searchTerm) ||
      (employee.Employee_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (employee.Employee_Address?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (employee.contact_number || '').includes(searchTerm)
  );

  // ------------------- RENDER -------------------
  return (
    <div id="register-employee-container">
      <div className="title-container">
        <h2 className="Title">Employee Management System</h2>
        <p className="subtitle">{companyInfo.name} - {companyInfo.tagline}</p>
      </div>
      <button
        className="add-user-toggle"
        onClick={() => setShowAddEmployeeForm(!showAddEmployeeForm)}
      >
        {showAddEmployeeForm ? 'Hide Add Employee Form' : ' Show Add Employee Form'}
      </button>
      {showAddEmployeeForm && (
        <div className="add-user-container">
          <h3>Add New Employee</h3>
          <form id="register-employee-form" onSubmit={handleAddEmployee}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Name"
                name="Employee_name"
                value={inputs.Employee_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Address"
                name="Employee_Address"
                value={inputs.Employee_Address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="date"
                placeholder="Date of Birth"
                name="Employee_Dob"
                value={inputs.Employee_Dob}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Contact Number"
                name="contact_number"
                value={inputs.contact_number}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="date"
                placeholder="Hire Date"
                name="hire_date"
                value={inputs.hire_date}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="submit-btn">
              Add Employee
            </button>
          </form>
        </div>
      )}
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search by Employee ID, Name, Address, or Contact Number..."
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
            Download Directory ({employees.length} employees)
          </button>
          <p className="download-note">
            Reports include official letterhead with {companyInfo.name} branding and contact details.
          </p>
        </div>
      </div>
      <div className="users-table-container">
        <div className="table-header">
          <span className="table-user-count">Total Employees: {employees.length}</span>
          <span className="filtered-count">
            {searchTerm && `(Showing ${filteredEmployees.length} filtered results)`}
          </span>
        </div>
        <table className="users-table">
          <thead>
            <tr>
              <th>Employee ID</th>
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
            {filteredEmployees.map((employee) => (
              <tr key={employee._id}>
                {editingEmployeeId === employee._id ? (
                  <td colSpan={Object.keys(defaultInputs).length + 2}>
                    <div className="update-user-container">
                      <h1>✏️ Update Employee</h1>
                      <form onSubmit={handleUpdateEmployee}>
                        <div className="form-group">
                          <input
                            type="text"
                            placeholder="Name"
                            name="Employee_name"
                            value={editInputs.Employee_name}
                            onChange={handleEditChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="text"
                            placeholder="Address"
                            name="Employee_Address"
                            value={editInputs.Employee_Address}
                            onChange={handleEditChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="date"
                            placeholder="Date of Birth"
                            name="Employee_Dob"
                            value={editInputs.Employee_Dob}
                            onChange={handleEditChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="text"
                            placeholder="Contact Number"
                            name="contact_number"
                            value={editInputs.contact_number}
                            onChange={handleEditChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="date"
                            placeholder="Hire Date"
                            name="hire_date"
                            value={editInputs.hire_date}
                            onChange={handleEditChange}
                            required
                          />
                        </div>
                        <button type="submit" className="submit-btn">
                          Update Employee
                        </button>
                        <button
                          type="button"
                          className="cancel-button"
                          onClick={() => setEditingEmployeeId(null)}
                        >
                          Cancel
                        </button>
                      </form>
                    </div>
                  </td>
                ) : (
                  <>
                    <td>{employee.employee_id || 'N/A'}</td>
                    {Object.keys(defaultInputs).map((field) => (
                      <td key={field}>
                        {field === 'Employee_Dob' || field === 'hire_date'
                          ? employee[field]
                            ? new Date(employee[field]).toLocaleDateString('en-GB')
                            : 'N/A'
                          : field === 'assigned_tasks'
                          ? Array.isArray(employee[field])
                            ? employee[field].join(', ')
                            : 'N/A'
                          : employee[field] || 'N/A'}
                      </td>
                    ))}
                    <td>{new Date(employee.created_at).toLocaleDateString('en-GB')}</td>
                    <td className="actions-cell">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => startEdit(employee)}
                        title="Edit Employee"
                      >
                        Update
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteEmployee(employee._id)}
                        title="Delete Employee"
                      >
                        delete
                      </button>
                      <button
                        className="action-btn download-btn"
                        onClick={() => handleDownloadSingle(employee)}
                        title="Download Employee Report"
                      >
                        downlord
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredEmployees.length === 0 && (
          <div className="no-users-message">
            <p>No employees found matching your search criteria.</p>
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

export default RegisterEmployee;