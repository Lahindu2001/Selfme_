import React, { useEffect, useState } from "react";
import TechnicianLayout from "./TechnicianLayout";
import DownloadAssignedTasksReport from "./DownloadAssignedTasksReport";
import "./CompletedTasks.css";

function CompletedTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  // Search and filter states
  const [search, setSearch] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");
  const [allEmployees, setAllEmployees] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

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

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/assignments/delete/${id}`, {
      method: "DELETE",
    });
    fetchTasks();
  };

  // Filtered completed tasks
  const filteredTasks = tasks
    .filter((task) => task.status === "Done")
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
    });

  const resetFilters = () => {
    setSearch("");
    setFilterEmployee("");
  };

  return (
    <TechnicianLayout>
      <div id="completedTasksDashboard">
        <h2>Completed Tasks</h2>

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

            <DownloadAssignedTasksReport tasks={filteredTasks} />
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
                      className="cta-button"
                      style={{ background: "#dc3545", color: "#fff" }}
                      onClick={() => {
                        setDeleteId(task._id);
                        setShowConfirm(true);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {showConfirm && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ minWidth: "340px" }}>
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete this completed task?</p>
              <div style={{ marginTop: "18px", display: "flex", justifyContent: "center", gap: "16px" }}>
                <button
                  className="cta-button primary"
                  style={{ background: "#dc3545", borderColor: "#dc3545" }}
                  onClick={async () => {
                    await handleDelete(deleteId);
                    setShowConfirm(false);
                    setDeleteId(null);
                  }}
                >
                  Yes, Delete
                </button>
                <button
                  className="cta-button"
                  onClick={() => {
                    setShowConfirm(false);
                    setDeleteId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TechnicianLayout>
  );
}

export default CompletedTasks;