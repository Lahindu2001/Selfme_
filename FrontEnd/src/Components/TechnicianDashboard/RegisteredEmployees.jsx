import React, { useEffect, useState } from "react";
import "./RegisteredEmployees.css";
import TechnicianLayout from "./TechnicianLayout";

function RegisteredEmployees() {
  const [employees, setEmployees] = useState([]);
  const [editEmp, setEditEmp] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedTask, setSelectedTask] = useState("");
  const [assignSuccess, setAssignSuccess] = useState(false);

  // Hardcoded demo tasks (purchase orders) for assignment dropdown
  const demoTasks = [
    {
      id: "PO-001",
      customerId: "CUST-001",
      customerName: "Amal Perera",
      product: "5KW Home Solar System",
      amount: "Rs. 250,000",
      orderDate: "2025-09-01",
    },
    {
      id: "PO-002",
      customerId: "CUST-002",
      customerName: "Nimali Fernando",
      product: "Lithium-ion Battery Pack",
      amount: "Rs. 150,000",
      orderDate: "2025-09-02",
    },
    {
      id: "PO-003",
      customerId: "CUST-003",
      customerName: "Saman Jayasinghe",
      product: "Hybrid Inverter",
      amount: "Rs. 100,000",
      orderDate: "2025-09-03",
    },
    {
      id: "PO-004",
      customerId: "CUST-004",
      customerName: "Kumari Silva",
      product: "20KW Business Package",
      amount: "Rs. 500,000",
      orderDate: "2025-09-04",
    },
    {
      id: "PO-005",
      customerId: "CUST-005",
      customerName: "Ranil Wickramasinghe",
      product: "5KW Home Solar System",
      amount: "Rs. 250,000",
      orderDate: "2025-09-05",
    },
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost:5000/employees");
      if (!res.ok) throw new Error('Failed to fetch employees');
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      setEmployees([]);
      setEditErrors({ general: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const res = await fetch(`http://localhost:5000/employees/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error('Failed to delete employee');
        fetchEmployees();
      } catch (err) {
        setEditErrors({ general: err.message });
      }
    }
  };

  // Validation helpers
  const getAge = (dob) => {
    if (!dob) return 0;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validate = (form) => {
    const newErrors = {};
    if (!form.Employee_name || !form.Employee_name.trim()) {
      newErrors.Employee_name = "Name is required";
    } else if (!/^[A-Za-z\s]+$/.test(form.Employee_name)) {
      newErrors.Employee_name = "Name must contain only letters and spaces";
    }
    if (!form.Employee_Address || !form.Employee_Address.trim()) {
      newErrors.Employee_Address = "Address is required";
    }
    if (!form.Employee_Dob) {
      newErrors.Employee_Dob = "Date of Birth is required";
    } else if (getAge(form.Employee_Dob) < 18) {
      newErrors.Employee_Dob = "Employee must be at least 18 years old";
    }
    if (!form.contact_number) {
      newErrors.contact_number = "Contact number is required";
    } else if (!/^\d{10}$/.test(form.contact_number)) {
      newErrors.contact_number = "Contact number must be exactly 10 digits";
    }
    if (!form.hire_date) {
      newErrors.hire_date = "Hire date is required";
    } else {
      const hireDate = new Date(form.hire_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (hireDate > today) {
        newErrors.hire_date = "Hire date cannot be in the future";
      }
    }
    if (!form.isManager) {
      newErrors.isManager = "Please select a role";
    }
    return newErrors;
  };

  const openEdit = (emp) => {
    setEditEmp(emp);
    setEditForm({
      Employee_name: emp.Employee_name,
      Employee_Address: emp.Employee_Address,
      Employee_Dob: emp.Employee_Dob ? emp.Employee_Dob.slice(0, 10) : '',
      contact_number: emp.contact_number,
      hire_date: emp.hire_date ? emp.hire_date.slice(0, 10) : '',
      isManager: emp.isManager || 'Employee'
    });
    setEditErrors({});
  };

  const handleEditInput = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "Employee_name") {
      newValue = value.replace(/[^A-Za-z\s]/g, "");
    }
    if (name === "contact_number") {
      newValue = value.replace(/\D/g, "").slice(0, 10);
    }
    setEditForm({ ...editForm, [name]: newValue });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(editForm);
    setEditErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const res = await fetch(`http://localhost:5000/employees/${editEmp._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update employee');
      }
      setEditEmp(null);
      setSuccess(true);
      fetchEmployees();
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setEditErrors({ general: err.message });
    }
  };

  const openAssignModal = (emp) => {
    setSelectedEmployee(emp);
    setSelectedTask("");
    setShowAssignModal(true);
    setAssignSuccess(false);
  };

  const handleAssignTask = async () => {
    if (!selectedTask) {
      setEditErrors({ general: "Please select a task" });
      return;
    }
    try {
      const taskObj = demoTasks.find((t) => t.id === selectedTask);
      const res = await fetch("http://localhost:5000/assignments/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedEmployee._id,
          order: taskObj,
        }),
      });
      if (!res.ok) throw new Error('Failed to assign task');
      setAssignSuccess(true);
      fetchEmployees();
      setTimeout(() => {
        setShowAssignModal(false);
        setAssignSuccess(false);
      }, 2000);
    } catch (err) {
      setEditErrors({ general: err.message });
    }
  };

  // Set date constraints
  const today = new Date();
  const minDob = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
  const maxDob = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const maxHireDate = today.toISOString().split("T")[0];

  return (
    <TechnicianLayout>
      <div id="registeredEmployeesDashboard">
        <h2>Registered Employees</h2>
        {success && <div className="success-msg">Employee updated successfully!</div>}
        {editErrors.general && <div className="error-msg">{editErrors.general}</div>}
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Address</th>
              <th>DOB</th>
              <th>Contact</th>
              <th>Hire Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id}>
                <td>{emp.employee_id}</td>
                <td>{emp.Employee_name}</td>
                <td>{emp.isManager}</td>
                <td>{emp.Employee_Address}</td>
                <td>{emp.Employee_Dob?.slice(0, 10)}</td>
                <td>{emp.contact_number}</td>
                <td>{emp.hire_date?.slice(0, 10)}</td>
                <td>
                  <button className="cta-button" onClick={() => openEdit(emp)}>
                    Edit
                  </button>
                  <button
                    className="cta-button"
                    style={{ background: "#dc3545", color: "#fff", marginLeft: "10px" }}
                    onClick={() => handleDelete(emp._id)}
                  >
                    Delete
                  </button>
                  <button
                    className="cta-button primary"
                    style={{ marginLeft: "10px" }}
                    onClick={() => openAssignModal(emp)}
                  >
                    Assign Task
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Edit Modal */}
        {editEmp && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ minWidth: "500px" }}>
              <h3>Edit Employee</h3>
              <form className="employee-form" style={{ maxWidth: "100%" }} onSubmit={handleEditSubmit}>
                <div>
                  <label>Name:</label>
                  <input
                    type="text"
                    name="Employee_name"
                    value={editForm.Employee_name}
                    onChange={handleEditInput}
                    required
                  />
                  {editErrors.Employee_name && (
                    <div className="error-msg">{editErrors.Employee_name}</div>
                  )}
                </div>
                <div>
                  <label>Role:</label>
                  <select
                    name="isManager"
                    value={editForm.isManager}
                    onChange={handleEditInput}
                    required
                  >
                    <option value="Employee">Employee</option>
                    <option value="Team Manager">Team Manager</option>
                  </select>
                  {editErrors.isManager && (
                    <div className="error-msg">{editErrors.isManager}</div>
                  )}
                </div>
                <div>
                  <label>Address:</label>
                  <input
                    type="text"
                    name="Employee_Address"
                    value={editForm.Employee_Address}
                    onChange={handleEditInput}
                    required
                  />
                  {editErrors.Employee_Address && (
                    <div className="error-msg">{editErrors.Employee_Address}</div>
                  )}
                </div>
                <div>
                  <label>Date of Birth:</label>
                  <input
                    type="date"
                    name="Employee_Dob"
                    value={editForm.Employee_Dob}
                    onChange={handleEditInput}
                    min={minDob.toISOString().split("T")[0]}
                    max={maxDob.toISOString().split("T")[0]}
                    required
                  />
                  {editErrors.Employee_Dob && (
                    <div className="error-msg">{editErrors.Employee_Dob}</div>
                  )}
                </div>
                <div>
                  <label>Contact Number:</label>
                  <input
                    type="text"
                    name="contact_number"
                    value={editForm.contact_number}
                    onChange={handleEditInput}
                    maxLength={10}
                    required
                    inputMode="numeric"
                    pattern="\d*"
                  />
                  {editErrors.contact_number && (
                    <div className="error-msg">{editErrors.contact_number}</div>
                  )}
                </div>
                <div>
                  <label>Hire Date:</label>
                  <input
                    type="date"
                    name="hire_date"
                    value={editForm.hire_date}
                    onChange={handleEditInput}
                    max={maxHireDate}
                    required
                  />
                  {editErrors.hire_date && (
                    <div className="error-msg">{editErrors.hire_date}</div>
                  )}
                </div>
                <button className="cta-button primary" type="submit">
                  Save
                </button>
                <button
                  className="cta-button"
                  style={{ marginLeft: "10px" }}
                  type="button"
                  onClick={() => setEditEmp(null)}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
        {/* Assign Task Modal */}
        {showAssignModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Assign Task to {selectedEmployee.Employee_name}</h3>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
              >
                <option value="">Select Task</option>
                {demoTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.id} - {task.product} - {task.customerName}
                  </option>
                ))}
              </select>
              {editErrors.general && (
                <div className="error-msg">{editErrors.general}</div>
              )}
              <div style={{ marginTop: "15px" }}>
                <button
                  className="cta-button primary"
                  onClick={handleAssignTask}
                  disabled={!selectedTask}
                >
                  Assign
                </button>
                <button
                  className="cta-button"
                  style={{ marginLeft: "10px" }}
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </button>
              </div>
              {assignSuccess && <div className="success-msg">Task assigned successfully!</div>}
            </div>
          </div>
        )}
      </div>
    </TechnicianLayout>
  );
}

export default RegisteredEmployees;