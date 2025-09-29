import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import './Salaries.css';

const companyInfo = {
  name: 'Your Company Name',
  address: ['123 Business Street', 'City, State, ZIP'],
  phone: '(123) 456-7890',
  email: 'info@company.com',
  website: 'www.company.com'
};

const Salaries = () => {
  const [employees, setEmployees] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [jobAssignments, setJobAssignments] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('September 2025');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ workingDays: 0, otherAllowance: 0, salaryStatus: 'Non-Paid' });
  const [error, setError] = useState(null);
  
  const months = [
    'January 2025', 'February 2025', 'March 2025', 'April 2025', 'May 2025', 'June 2025',
    'July 2025', 'August 2025', 'September 2025'
  ];
  
  const currentMonthIndex = months.indexOf(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));
  const selectedMonthIndex = months.indexOf(selectedMonth);

  useEffect(() => {
    fetchStaff();
    fetchJobAssignments();
    fetchSalaries();
  }, [selectedMonth]);

  const fetchStaff = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/finance/staff');
      setStaffList(response.data);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Error fetching staff data.');
    }
  };

  const fetchJobAssignments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/finance/job-assigning');
      setJobAssignments(response.data);
    } catch (err) {
      console.error('Error fetching job assignments:', err);
      setError('Error fetching job assignments.');
    }
  };

  const fetchSalaries = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/finance/salary?month=${selectedMonth}`);
      console.log('Fetched salaries:', response.data);
      let fetchedEmployees = response.data;
      fetchedEmployees = fetchedEmployees.map(emp => ({
        ...emp,
        salaryStatus: selectedMonthIndex < currentMonthIndex ? 'Paid' : emp.salaryStatus || 'Non-Paid'
      }));
      setEmployees(fetchedEmployees);
      setError(null);
    } catch (err) {
      setError('Error fetching salaries. Please check the backend server.');
      console.error('Error fetching salaries:', err);
    }
  };

  const calculateSalary = (emp) => {
    const workingDays = emp.workingDays || 0;
    const perDayManpower = 3000;
    const basic = emp.isManager ? 20000 : 10000;
    const manpowerAllowance = perDayManpower * workingDays;
    const total = basic + manpowerAllowance + (emp.otherAllowance || 0);
    return { basic, perDayManpower, workingDays, manpowerAllowance, total };
  };

  const calculateTotalSalaries = () => {
    return employees.reduce((sum, emp) => sum + calculateSalary(emp).total, 0);
  };

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

  const generatePDF = async (emp, month) => {
    try {
      const logoBase64 = await getLogoAsBase64();
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const { basic, perDayManpower, workingDays, manpowerAllowance, total } = calculateSalary(emp);
      const monthParts = month.split(' ');
      const monthIndex = months.indexOf(month);
      const generateDate = new Date(parseInt(monthParts[1]), monthIndex, 28).toLocaleDateString('en-GB');

      // Add letterhead
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

      // Add title
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.text(`Salary Slip for ${emp.name} - ${month}`, pageWidth / 2, 45, { align: 'center' });

      // Add salary details
      let y = 55;
      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      doc.text(`Employee ID: ${emp.empId}`, 15, y);
      y += 10;
      doc.text(`Role: ${emp.isManager ? 'Team Manager' : 'Employee'}`, 15, y);
      y += 10;
      doc.text(`Generate Date: ${generateDate}`, 15, y);
      y += 10;
      doc.text(`Basic Salary: ${basic}`, 15, y);
      y += 10;
      doc.text(`Per Day Manpower: ${perDayManpower}`, 15, y);
      y += 10;
      doc.text(`Working Days: ${workingDays}`, 15, y);
      y += 10;
      doc.text(`Manpower Allowance: ${manpowerAllowance}`, 15, y);
      y += 10;
      doc.text(`Other Allowance: ${emp.otherAllowance || 0}`, 15, y);
      y += 10;
      doc.text(`Total Salary: ${total}`, 15, y);
      y += 10;
      doc.text(`Salary Status: ${emp.salaryStatus}`, 15, y);

      // Add signature field
      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('Authorized Signature: _________________', pageWidth - 85, pageHeight - 30);

      // Add footer
      doc.setFont('times', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      doc.setLineWidth(0.3);
      doc.setDrawColor(150, 150, 150);
      doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
      const footerText = `Generated by ${companyInfo.name} Salary Management System`;
      doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });
      const genDate = new Date().toLocaleDateString('en-GB');
      const genTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
      doc.text(`Generated on ${genDate} at ${genTime}`, 15, pageHeight - 10);
      doc.text(`Page 1 of 1`, pageWidth - 15, pageHeight - 10, { align: 'right' });

      // Save PDF
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `${companyInfo.name}_Salary_Slip_${emp.empId}_${month.replace(' ', '_')}_${timestamp}.pdf`;
      doc.save(fileName);
      alert(`Salary slip "${fileName}" downloaded successfully!`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleUpdateClick = (emp) => {
    if (selectedMonthIndex < currentMonthIndex) {
      alert('Cannot update salaries for past months.');
      return;
    }
    setEditingId(emp._id);
    setEditForm({
      workingDays: emp.workingDays || 0,
      otherAllowance: emp.otherAllowance || 0,
      salaryStatus: emp.salaryStatus,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const saveUpdate = async () => {
    try {
      const emp = employees.find(e => e._id === editingId);
      if (!emp) throw new Error('Employee not found in local state');
      const isManager = emp.isManager;
      const basicSalary = isManager ? 20000 : 10000;
      const perDayManpower = 3000;
      const workingDays = emp.workingDays || 0;
      const manpowerAllowance = perDayManpower * workingDays;
      const newOtherAllowance = parseInt(editForm.otherAllowance) || 0;
      const totalSalary = basicSalary + manpowerAllowance + newOtherAllowance;

      console.log('Update payload:', {
        _id: editingId,
        workingDays,
        otherAllowance: newOtherAllowance,
        salaryStatus: editForm.salaryStatus,
        basicSalary,
        manpowerAllowance,
        totalSalary
      });

      const response = await axios.put(`http://localhost:5000/api/finance/salary/${editingId}`, {
        workingDays,
        otherAllowance: newOtherAllowance,
        salaryStatus: editForm.salaryStatus,
        basicSalary,
        manpowerAllowance,
        totalSalary
      });
      console.log('Update response:', response.data);
      fetchSalaries();
      setEditingId(null);
    } catch (err) {
      setError('Error updating salary. Please check console for details.');
      console.error('Update error:', err.response?.data || err.message);
    }
  };

  const cancelUpdate = () => {
    setEditingId(null);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  return (
    <div id="salaries-content-section">
      <h2 id="salaries-page-title">Manage Salaries</h2>
      <p id="salaries-page-description">View and manage employee salaries based on job assignments for the finance manager.</p>
      
      <div id="month-selection-container">
        <label id="month-selection-label">Select Month: </label>
        <select id="month-dropdown" value={selectedMonth} onChange={handleMonthChange}>
          {months.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </div>
      
      {error && <p id="salaries-error-message">{error}</p>}
      
      {employees.length > 0 ? (
        <div id="salaries-table-container">
          <table id="salaries-main-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Month</th>
                <th>Basic Salary</th>
                <th>Per Day Manpower</th>
                <th>Working Days</th>
                <th>Manpower Allowance</th>
                <th>Other Allowance</th>
                <th>Total Salary</th>
                <th>Salary Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, index) => {
                const { basic, perDayManpower, workingDays, manpowerAllowance, total } = calculateSalary(emp);
                const isEditable = selectedMonthIndex >= currentMonthIndex;
                return (
                  <tr key={emp._id} id={`salary-employee-row-${index}`}>
                    <td>{emp.empId}</td>
                    <td>{emp.name}</td>
                    <td>
                      <span className={emp.isManager ? 'salary-role-manager' : 'salary-role-employee'}>
                        {emp.isManager ? 'Team Manager' : 'Employee'}
                      </span>
                    </td>
                    <td>{selectedMonth}</td>
                    <td>Rs. {basic.toLocaleString()}</td>
                    <td>Rs. {perDayManpower.toLocaleString()}</td>
                    <td>{workingDays}</td>
                    <td>Rs. {manpowerAllowance.toLocaleString()}</td>
                    <td>Rs. {(emp.otherAllowance || 0).toLocaleString()}</td>
                    <td>Rs. {total.toLocaleString()}</td>
                    <td>
                      <span className={emp.salaryStatus === 'Paid' ? 'salary-status-paid' : 'salary-status-non-paid'}>
                        {emp.salaryStatus}
                      </span>
                    </td>
                    <td>
                      {isEditable && (
                        <button 
                          id={`salary-update-btn-${index}`}
                          className="salary-update-btn" 
                          onClick={() => handleUpdateClick(emp)}
                        >
                          Update
                        </button>
                      )}
                      <button 
                        id={`salary-download-btn-${index}`}
                        className="salary-download-btn" 
                        onClick={() => generatePDF(emp, selectedMonth)}
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
              <tr id="salaries-total-row">
                <td colSpan="9">
                  Total Salaries for {selectedMonth}:
                </td>
                <td>
                  Rs. {calculateTotalSalaries().toLocaleString()}
                </td>
                <td colSpan="2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p id="no-salaries-message">{error || 'No salaries for this month or no staff assigned.'}</p>
      )}
      
      {editingId && (
        <div id="salary-edit-form-container">
          <h3 id="salary-edit-form-title">Edit Employee Salary</h3>
          
          <div className="salary-edit-employee-info">
            <p>Employee ID: {employees.find(emp => emp._id === editingId)?.empId}</p>
            <p>Name: {employees.find(emp => emp._id === editingId)?.name}</p>
            <p>Role: {employees.find(emp => emp._id === editingId)?.isManager ? 'Team Manager' : 'Employee'}</p>
          </div>
          
          <div className="salary-edit-field-container">
            <label htmlFor="working-days-input">Working Days: </label>
            <input 
              id="working-days-input"
              className="salary-edit-input"
              type="number" 
              name="workingDays" 
              value={editForm.workingDays} 
              readOnly 
            />
          </div>
          
          <div className="salary-edit-field-container">
            <label htmlFor="other-allowance-input">Other Allowance: </label>
            <input 
              id="other-allowance-input"
              className="salary-edit-input"
              type="number" 
              name="otherAllowance" 
              value={editForm.otherAllowance} 
              onChange={handleInputChange} 
            />
          </div>
          
          <div className="salary-edit-field-container">
            <label htmlFor="salary-status-select">Salary Status: </label>
            <select 
              id="salary-status-select"
              className="salary-edit-select"
              name="salaryStatus" 
              value={editForm.salaryStatus} 
              onChange={handleInputChange}
            >
              <option value="Paid">Paid</option>
              <option value="Non-Paid">Non-Paid</option>
            </select>
          </div>
          
          <button id="salary-edit-save-btn" onClick={saveUpdate}>
            Save Changes
          </button>
          <button id="salary-edit-cancel-btn" onClick={cancelUpdate}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Salaries;