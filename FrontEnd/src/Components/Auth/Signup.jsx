
// FrontEnd/src/Components/Auth/Signup.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css'; // Import the CSS file

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nic, setNic] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [ceboNo, setCeboNo] = useState('');
  const [role, setRole] = useState('Customer'); // Default to Customer
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/auth/signup', {
        firstName,
        lastName,
        email,
        password,
        nic,
        phone,
        dob,
        address,
        ceboNo,
        role
      });
      navigate('/login'); // Redirect to login after signup
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Admin">Admin</option>
          <option value="Inventory">Inventory</option>
          <option value="Finance">Finance</option>
          <option value="Technician">Technician</option>
          <option value="Customer">Customer</option>
        </select>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="text" placeholder="NIC" value={nic} onChange={(e) => setNic(e.target.value)} required />
        <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input type="date" placeholder="DOB" value={dob} onChange={(e) => setDob(e.target.value)} />
        <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
        <input type="text" placeholder="Cebo No" value={ceboNo} onChange={(e) => setCeboNo(e.target.value)} />
        <button type="submit">Signup</button>
      </form>
      {error && <p className="error">{error}</p>}
      <div className="nav-buttons">
        <Link to="/login">
          <button className="login-btn">Log In</button>
        </Link>
      </div>
    </div>
  );
};

export default Signup;
