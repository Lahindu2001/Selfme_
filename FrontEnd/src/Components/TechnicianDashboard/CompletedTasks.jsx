import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TechnicianLayout from './TechnicianLayout';
import './CompletedTasks.css';

function CompletedTasks() {
  const navigate = useNavigate();
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
  const firstName = authUser.firstName || 'Technician';
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTaskAssigned, setIsTaskAssigned] = useState(false);
  const [formData, setFormData] = useState({
    empIds: [],
    jobTitle: '',
    startDate: '',
    endDate: '',
    projectId: '',
  });

  // Fetch not yet assigned tasks and staff on component mount
  useEffect(() => {
    console.log('CompletedTasks mounted, fetching not yet assigned tasks and staff...');
    fetchNotYetTasks();
    fetchStaff();
  }, []);

  const fetchNotYetTasks = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No token found');
        return;
      }
      const res = await axios.get('http://localhost:5000/api/tech/paidtasks/notyet', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      const taskData = Array.isArray(res.data) ? res.data : [];
      setTasks(taskData);
      console.log('✅ Not yet assigned tasks fetched:', taskData.length, taskData);
    } catch (err) {
      console.error('💥 Not yet tasks fetch error:', err.response?.data, err.message);
    } finally {
      setIsLoading(false);
      console.log('Fetch not yet tasks complete, isLoading:', false);
    }
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No token found for staff fetch');
        return;
      }
      const res = await axios.get('http://localhost:5000/api/finance/staff', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      const staffData = Array.isArray(res.data) ? res.data : [];
      setStaff(staffData);
      console.log('✅ Staff fetched:', staffData.length, staffData);
    } catch (err) {
      console.error('💥 Staff fetch error:', err.response?.data, err.message);
    }
  };

  const checkTaskAssignment = async (paymentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No token found for checking task assignment');
        return false;
      }
      const res = await axios.get('http://localhost:5000/api/finance/jobassignings', {
        headers: { Authorization: `Bearer ${token}` },
        params: { projectId: paymentId },
        timeout: 10000,
      });
      const assignments = Array.isArray(res.data) ? res.data : [];
      return assignments.length > 0;
    } catch (err) {
      console.error('💥 Error checking task assignment:', err.response?.data, err.message);
      return false;
    }
  };

  const handleSelectTask = async (task) => {
    setSelectedTask(task);
    setIsLoading(true);
    try {
      const isAssigned = await checkTaskAssignment(task.paymentId);
      setIsTaskAssigned(isAssigned);
      setFormData({
        empIds: [],
        jobTitle: '',
        startDate: '',
        endDate: '',
        projectId: task.paymentId || '',
      });
      setIsModalOpen(true);
      console.log('Selected task for assignment:', task?.paymentId, task, 'Is assigned:', isAssigned);
    } catch (err) {
      console.error('💥 Error in handleSelectTask:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setIsTaskAssigned(false);
    console.log('Modal closed');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (empId) => {
    setFormData((prev) => {
      const empIds = prev.empIds.includes(empId)
        ? prev.empIds.filter((id) => id !== empId)
        : [...prev.empIds, empId];
      return { ...prev, empIds };
    });
  };

  const updateStatusOfMy = async (paymentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No token found for updating statusofmy');
        return;
      }
      await axios.put(
        `http://localhost:5000/api/tech/paidtasks/${paymentId}/statusofmy`,
        { statusofmy: 'pending' },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );
      console.log(`✅ Updated statusofmy to pending for paymentId: ${paymentId}`);
    } catch (err) {
      console.error('❌ Error updating statusofmy:', err.response?.data, err.message);
    }
  };

  const handleAssignJob = async (e) => {
    e.preventDefault();
    if (!formData.empIds.length || !formData.jobTitle || !formData.startDate || !formData.endDate) {
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No token found for job assignment');
        return;
      }
      // Create job assignments for each selected employee
      const assignmentPromises = formData.empIds.map((empId) =>
        axios.post(
          'http://localhost:5000/api/finance/jobassignings',
          {
            empId,
            jobTitle: formData.jobTitle,
            startDate: formData.startDate,
            endDate: formData.endDate,
            projectId: formData.projectId,
            status: 'Assigned',
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }
        )
      );
      await Promise.all(assignmentPromises);
      console.log('✅ Jobs assigned for employees:', formData.empIds);

      // Update statusofmy to pending in mypaidtask
      await updateStatusOfMy(formData.projectId);

      // Refresh tasks to reflect updated statusofmy
      await fetchNotYetTasks();
      handleCloseModal();
    } catch (err) {
      console.error('❌ Job assignment error:', err.response?.data, err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authUser');
    navigate('/login');
  };

  return (
    <TechnicianLayout firstName={firstName} handleLogout={handleLogout}>
      <div id="completedTasks" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Not Yet Assigned Tasks</h2>

        {isLoading && <p className="loading" style={{ textAlign: 'center' }}>Loading tasks...</p>}

        {/* Not Yet Assigned Tasks Table */}
        <div className="paid-tasks-list" style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '10px' }}>Not Yet Assigned Tasks</h3>
          {tasks.length === 0 && !isLoading ? (
            <p style={{ textAlign: 'center', color: '#666' }}>No not yet assigned tasks found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#28a745', color: 'white' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Payment ID</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>User ID</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Customer</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Amount</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Payment Date</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status of My</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.paymentId}
                    onClick={() => handleSelectTask(task)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: selectedTask?.paymentId === task.paymentId ? '#e9ecef' : 'white',
                      border: '1px solid #ddd',
                    }}
                  >
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{task.paymentId || 'N/A'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{task.userId || 'N/A'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{task.customer || 'Unknown'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      Rs. {task.amount?.toLocaleString() || '0'}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {task.paymentDate ? new Date(task.paymentDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{task.status || 'N/A'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{task.statusofmy || 'notyet'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal for Job Assignment */}
        {isModalOpen && selectedTask && (
          <div
            className="modal"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}
          >
            <div
              className="modal-content"
              style={{
                backgroundColor: '#ffffff',
                padding: '30px',
                borderRadius: '12px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '85vh',
                overflowY: 'auto',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                animation: 'fadeIn 0.3s ease-in-out',
              }}
            >
              <style>
                {`
                  @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                  }
                `}
              </style>
              <button
                onClick={handleCloseModal}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = '#c82333')}
                onMouseOut={(e) => (e.target.style.backgroundColor = '#dc3545')}
              >
                ✕ Close
              </button>
              <h3 style={{ marginBottom: '20px', textAlign: 'center', fontSize: '24px', color: '#333' }}>
                Assign Job for Payment {selectedTask.paymentId}
              </h3>
              {isTaskAssigned ? (
                <p
                  style={{
                    color: '#ff9800',
                    fontWeight: 'bold',
                    backgroundColor: '#fff3e0',
                    padding: '10px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    width: '100%',
                    marginBottom: '15px',
                  }}
                >
                  This task has already been assigned and cannot be assigned again.
                </p>
              ) : (
                <form onSubmit={handleAssignJob} style={{ width: '100%', textAlign: 'left' }}>
                  <div style={{ margin: '10px 0' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '16px' }}>Select Employees:</label>
                    <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                      {staff.map((s) => (
                        <div key={s.empId} style={{ margin: '5px 0' }}>
                          <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                            <input
                              type="checkbox"
                              checked={formData.empIds.includes(s.empId)}
                              onChange={() => handleCheckboxChange(s.empId)}
                              style={{ marginRight: '10px' }}
                              disabled={isTaskAssigned}
                            />
                            {s.name} ({s.empId})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ margin: '10px 0' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '16px' }}>Job Title:</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', fontSize: '14px' }}
                      required
                      disabled={isTaskAssigned}
                    />
                  </div>
                  <div style={{ margin: '10px 0' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '16px' }}>Start Date:</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', fontSize: '14px' }}
                      required
                      disabled={isTaskAssigned}
                    />
                  </div>
                  <div style={{ margin: '10px 0' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '16px' }}>End Date:</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', fontSize: '14px' }}
                      required
                      disabled={isTaskAssigned}
                    />
                  </div>
                  <div style={{ margin: '10px 0' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '16px' }}>Project ID:</label>
                    <input
                      type="text"
                      name="projectId"
                      value={formData.projectId}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        backgroundColor: '#f0f0f0',
                        cursor: 'not-allowed',
                      }}
                    />
                  </div>
                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                    <button
                      type="submit"
                      disabled={isLoading || isTaskAssigned}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: isLoading || isTaskAssigned ? '#6c757d' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isLoading || isTaskAssigned ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseOver={(e) => !(isLoading || isTaskAssigned) && (e.target.style.backgroundColor = '#218838')}
                      onMouseOut={(e) => !(isLoading || isTaskAssigned) && (e.target.style.backgroundColor = '#28a745')}
                    >
                      {isLoading ? 'Assigning...' : 'Assign Job'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </TechnicianLayout>
  );
}

export default CompletedTasks;