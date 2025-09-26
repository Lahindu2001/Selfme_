import React, { useEffect, useState } from "react";
import TechnicianLayout from "./TechnicianLayout";
import "./TechnicianDashboard.css";
import DownloadAssignedTasksReport from "./DownloadAssignedTasksReport";

function AssignedTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateTaskId, setUpdateTaskId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  
  // Search and filter states
  const [search, setSearch] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [allEmployees, setAllEmployees] = useState([]);

  const fetchTasks = () => {
    setLoading(true);
    fetch("http://localhost:5000/assignments/assigned-tasks")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTasks();
    // Get all employees for filtering
    fetch("http://localhost:5000/employees")
      .then((res) => res.json())
      .then((data) => setAllEmployees(data));
  }, []);

  const handleMarkDone = async (id) => {
    await fetch(`http://localhost:5000/assignments/mark-done/${id}`, {
      method: "PATCH",
    });
    fetchTasks();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await fetch(`http://localhost:5000/assignments/delete/${id}`, {
        method: "DELETE",
      });
      fetchTasks();
    }
  };

  const openUpdateModal = async (taskId) => {
    setUpdateTaskId(taskId);
    setShowUpdateModal(true);
    setSelectedEmployee("");
    // Fetch employees
    const res = await fetch("http://localhost:5000/employees");
    const data = await res.json();
    setEmployees(data);
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;
    await fetch(`http://localhost:5000/assignments/update-employee/${updateTaskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newEmployeeId: selectedEmployee }),
    });
    setShowUpdateModal(false);
    fetchTasks();
  };

  // Filter and search functions
  const filteredTasks = tasks
    .filter((task) => task.status !== "Done") // Show only pending tasks
    .filter((task) => {
      // Search by customer name, product or order ID
      return search === "" || 
        (task.customerName && task.customerName.toLowerCase().includes(search.toLowerCase())) ||
        (task.product && task.product.toLowerCase().includes(search.toLowerCase())) ||
        (task.custom_id && task.custom_id.toLowerCase().includes(search.toLowerCase()));
    })
    .filter((task) => {
      // Filter by employee
      return filterEmployee === "" || 
        (task.assigned_employee && task.assigned_employee._id === filterEmployee);
    })
    .filter((task) => {
      // Filter by status (in case you add more statuses later)
      return filterStatus === "" || task.status === filterStatus;
    });

  const resetFilters = () => {
    setSearch("");
    setFilterEmployee("");
    setFilterStatus("");
  };

  return (
    <TechnicianLayout>
      <h2>Pending Tasks</h2>
      
      {/* Search and Filter Section */}
      <div className="search-filter-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by customer, product or order ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
          <select 
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
            className="filter-select"
          >
            <option value="">All Employees</option>
            {allEmployees.map(emp => (
              <option key={emp._id} value={emp._id}>
                {emp.Employee_name}
              </option>
            ))}
          </select>
          
          <button className="cta-button" onClick={resetFilters}>
            Reset Filters
          </button>
          
          
        </div>
      </div>
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer ID</th>
              <th>Customer Name</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Assigned Employee</th>
              <th>Assigned Date</th>
              <th>Deadline</th>
              <th>Order Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task._id}>
                <td>{task.custom_id}</td>
                <td>{task.customerId || "-"}</td>
                <td>{task.customerName || "-"}</td>
                <td>{task.product || "-"}</td>
                <td>Rs. {task.total_amount?.toLocaleString()}</td>
                <td>
                  <span
                    style={{
                      color: task.status === "Done" ? "green" : "orange",
                      fontWeight: "bold",
                    }}
                  >
                    {task.status}
                  </span>
                </td>
                <td>
                  {task.assigned_employee
                    ? task.assigned_employee.Employee_name
                    : "-"}
                </td>
                <td>
                  {task.assigned_date
                    ? new Date(task.assigned_date).toLocaleString()
                    : "-"}
                </td>
                <td>
                  {task.deadline
                    ? new Date(task.deadline).toLocaleDateString()
                    : "-"}
                </td>
                <td>
                  {task.order_date
                    ? new Date(task.order_date).toLocaleDateString()
                    : "-"}
                </td>
                <td>
                  <button
                    className="cta-button primary"
                    onClick={() => handleMarkDone(task._id)}
                  >
                    Mark as Done
                  </button>
                  <button
                    className="cta-button"
                    onClick={() => openUpdateModal(task._id)}
                  >
                    Update
                  </button>
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Update Employee Modal */}
      {showUpdateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Update Assigned Employee</h3>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.Employee_name}
                </option>
              ))}
            </select>
            <div style={{ marginTop: "15px" }}>
              <button
                className="cta-button primary"
                onClick={handleUpdateEmployee}
                disabled={!selectedEmployee}
              >
                Update
              </button>
              <button
                className="cta-button"
                style={{ marginLeft: "10px" }}
                onClick={() => setShowUpdateModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </TechnicianLayout>
  );
}

export default AssignedTasks;

