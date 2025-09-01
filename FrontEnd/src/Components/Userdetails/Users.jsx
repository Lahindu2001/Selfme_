import React, { useState, useEffect } from 'react';
import Nav from '../Nav/Nav';
import axios from 'axios';
import jsPDF from 'jspdf';
import './Users.css';
import './UpdateUser.css'; // CSS for the Update User form

const URL = 'http://localhost:5000/users';

function Users() {
  // ------------------- STATES -------------------
  const [users, setUsers] = useState([]); // Store all users
  const [searchTerm, setSearchTerm] = useState(''); // Search input
  const [selectedFields, setSelectedFields] = useState({ name: true, gmail: true, age: true, address: true }); // Fields for PDF
  const [ageFilter, setAgeFilter] = useState('all'); // Age range filter
  const [inputs, setInputs] = useState({ name: '', gmail: '', age: '', address: '' }); // New user inputs
  const [showAddUserForm, setShowAddUserForm] = useState(false); // Toggle Add User form
  const [editingUserId, setEditingUserId] = useState(null); // ID of user being edited
  const [editInputs, setEditInputs] = useState({ name: '', gmail: '', age: '', address: '' }); // Edit form inputs

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

  // ------------------- ADD USER -------------------
  const handleChange = e => setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddUser = async e => {
    e.preventDefault();
    const age = Number(inputs.age);
    if (isNaN(age) || age < 1 || age > 120) {
      alert('Age must be between 1 and 120!');
      return;
    }
    try {
      const res = await axios.post(URL, {
        name: inputs.name,
        gmail: inputs.gmail,
        age: age,
        address: inputs.address,
      });
      setUsers([...users, res.data]);
      setInputs({ name: '', gmail: '', age: '', address: '' });
      setShowAddUserForm(false);
      alert('User added successfully!');
      window.location.reload(); // Reload page after adding user
    } catch (err) {
      console.error('Error adding user:', err);
      alert('Failed to add user!');
    }
  };

  // ------------------- EDIT / UPDATE USER -------------------
  const startEdit = user => {
    setEditingUserId(user._id);
    setEditInputs({ ...user });
  };

  const handleEditChange = e => setEditInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUpdateUser = async e => {
    e.preventDefault();
    const age = Number(editInputs.age);
    if (isNaN(age) || age < 1 || age > 120) {
      alert('Age must be between 1 and 120!');
      return;
    }
    try {
      const res = await axios.put(`${URL}/${editingUserId}`, {
        name: editInputs.name,
        gmail: editInputs.gmail,
        age: age,
        address: editInputs.address,
      });
      setUsers(users.map(u => (u._id === editingUserId ? res.data : u)));
      setEditingUserId(null);
      setEditInputs({ name: '', gmail: '', age: '', address: '' });
      alert('User updated successfully!');
      window.location.reload(); // Reload page after updating user
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to update user!');
    }
  };

  // ------------------- DELETE USER -------------------
  const handleDeleteUser = async id => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${URL}/${id}`);
      setUsers(users.filter(u => u._id !== id));
      alert('User deleted successfully!');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user!');
    }
  };

  // ------------------- DOWNLOAD PDF -------------------
  const handleDownload = () => {
    if (!users.length) return alert('No users to download!');
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(16);
    const title = 'Users Report';
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - textWidth) / 2, 15);
    doc.setFontSize(12);

    const filteredUsers = ageFilter === 'all'
      ? users
      : users.filter(user => {
          const age = Number(user.age || 0);
          if (ageFilter === '0-20') return age <= 20;
          if (ageFilter === '21-40') return age >= 21 && age <= 40;
          if (ageFilter === '41-60') return age >= 41 && age <= 60;
          if (ageFilter === '61+') return age >= 61;
          return true;
        });

    filteredUsers.forEach((user, idx) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`User ${idx + 1}`, 10, y); y += 8;
      doc.setFont('helvetica', 'normal');
      if (selectedFields.name) { doc.text(`Name     : ${user.name}`, 20, y); y += 7; }
      if (selectedFields.gmail) { doc.text(`Email    : ${user.gmail}`, 20, y); y += 7; }
      if (selectedFields.age) { doc.text(`Age      : ${user.age}`, 20, y); y += 7; }
      if (selectedFields.address) { doc.text(`Address  : ${user.address}`, 20, y); y += 7; }
      y += 5;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    doc.save('users_report.pdf');
    alert('User Report Downloaded!');
  };

  // ------------------- FILTERED USERS FOR DISPLAY -------------------
  const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.gmail?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // ------------------- RENDER -------------------
  return (
    <div className="users-section">
      <Nav />

      {/* Title */}
      <div className="title-container">
        <h2 className="Title">User Management</h2>
      </div>

      {/* Toggle Add User Form */}
      <button className="add-user-toggle" onClick={() => setShowAddUserForm(!showAddUserForm)}>
        {showAddUserForm ? 'Hide Add User Form' : 'Show Add User Form'}
      </button>

      {/* Add User Form */}
      {showAddUserForm && (
        <div className="add-user-container">
          <h3>Add New User</h3>
          <form className="add-user-form" onSubmit={handleAddUser}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter name"
                value={inputs.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="gmail">Email</label>
              <input
                type="email"
                id="gmail"
                name="gmail"
                placeholder="Enter email"
                value={inputs.gmail}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                placeholder="Enter age"
                value={inputs.age}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Enter address"
                value={inputs.address}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit">Add User</button>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by Name or Email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Download Options */}
      <div className="download-options">
        <h3>Download Options</h3>
        <label>
          <input
            type="checkbox"
            checked={selectedFields.name}
            onChange={() => setSelectedFields(prev => ({ ...prev, name: !prev.name }))}
          /> Name
        </label>
        <label>
          <input
            type="checkbox"
            checked={selectedFields.gmail}
            onChange={() => setSelectedFields(prev => ({ ...prev, gmail: !prev.gmail }))}
          /> Gmail
        </label>
        <label>
          <input
            type="checkbox"
            checked={selectedFields.age}
            onChange={() => setSelectedFields(prev => ({ ...prev, age: !prev.age }))}
          /> Age
        </label>
        <label>
          <input
            type="checkbox"
            checked={selectedFields.address}
            onChange={() => setSelectedFields(prev => ({ ...prev, address: !prev.address }))}
          /> Address
        </label>

        <div>
          <label>Filter by Age Range: </label>
          <select value={ageFilter} onChange={e => setAgeFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="0-20">0-20</option>
            <option value="21-40">21-40</option>
            <option value="41-60">41-60</option>
            <option value="61+">61+</option>
          </select>
          <button onClick={handleDownload}>Download Report</button>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <span className="table-user-count">Total Users: {users.length}</span>
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Age</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id}>
                {editingUserId === user._id ? (
                  <td colSpan="5">
                    <div className="update-user-container">
                      <h1>Update User</h1>
                      <form onSubmit={handleUpdateUser}>
                        <input
                          type="text"
                          name="name"
                          value={editInputs.name}
                          onChange={handleEditChange}
                          required
                        />
                        <input
                          type="email"
                          name="gmail"
                          value={editInputs.gmail}
                          onChange={handleEditChange}
                          required
                        />
                        <input
                          type="number"
                          name="age"
                          value={editInputs.age}
                          onChange={handleEditChange}
                          required
                        />
                        <input
                          type="text"
                          name="address"
                          value={editInputs.address}
                          onChange={handleEditChange}
                          required
                        />
                        <button type="submit">Update</button>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => setEditingUserId(null)}
                        >
                          Cancel
                        </button>
                      </form>
                    </div>
                  </td>
                ) : (
                  <>
                    <td>{user.name}</td>
                    <td>{user.gmail}</td>
                    <td>{user.age}</td>
                    <td>{user.address}</td>
                    <td>
                      <button
                        className="update-button"
                        onClick={() => startEdit(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        Delete
                      </button>
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

export default Users;