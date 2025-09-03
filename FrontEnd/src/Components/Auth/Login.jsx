import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { setAuthToken } from '../../utils/auth';
import './Auth.css'; // Import the CSS file
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/auth/login', { email, password });
      setAuthToken(res.data.token);
      // Redirect based on role
      switch (res.data.role) {
        case 'Admin':
          navigate('/mainAdminhome');
          break;
        case 'Inventory':
          navigate('/InventoryMange');
          break;
        case 'Finance':
          navigate('/FinanceManager');
          break;
        case 'Technician':
          navigate('/TechnicianManager');
          break;
        case 'Customer':
          navigate('/'); // Updated to navigate to Home.jsx
          break;
        default:
          setError('Unknown role');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };
  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p className="error">{error}</p>}
      <div className="nav-buttons">
        <Link to="/signup">
          <button className="signup-btn">Sign Up</button>
        </Link>
      </div>
    </div>
  );
};
export default Login;