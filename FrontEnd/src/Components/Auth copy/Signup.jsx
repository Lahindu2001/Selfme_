import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css'; // Import the CSS file

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
  const [role] = useState('Customer'); // Fixed to Customer, no setter needed
  const [nicType, setNicType] = useState('New'); // Default to New NIC
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Validation functions
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

  // Input handlers with real-time validation
  const handleFirstName = (e) => {
    const value = e.target.value;
    if (validateName(value)) {
      setFirstName(value);
      setErrors((prev) => ({ ...prev, firstName: '' }));
    } else if (value === '') {
      setFirstName('');
      setErrors((prev) => ({ ...prev, firstName: '' }));
    } else {
      setErrors((prev) => ({ ...prev, firstName: 'Only letters are allowed' }));
    }
  };

  const handleLastName = (e) => {
    const value = e.target.value;
    if (validateName(value)) {
      setLastName(value);
      setErrors((prev) => ({ ...prev, lastName: '' }));
    } else if (value === '') {
      setLastName('');
      setErrors((prev) => ({ ...prev, lastName: '' }));
    } else {
      setErrors((prev) => ({ ...prev, lastName: 'Only letters are allowed' }));
    }
  };

  const handleEmail = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setErrors((prev) => ({ ...prev, email: 'Invalid email format' }));
    } else {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  const handleNic = (e) => {
    const value = e.target.value;
    // Allow only digits for New NIC, digits and V/X for Old NIC
    const isValidInput = nicType === 'New' ? /^[\d]*$/.test(value) : /^[\dVX]*$/.test(value);
    if (isValidInput && value.length <= (nicType === 'New' ? 12 : 10)) {
      setNic(value);
      if (value && !validateNic(value, nicType)) {
        setErrors((prev) => ({
          ...prev,
          nic: nicType === 'New' ? 'NIC must be exactly 12 digits' : 'NIC must be 9 digits followed by V or X',
        }));
      } else {
        setErrors((prev) => ({ ...prev, nic: '' }));
      }
    }
  };

  const handlePhone = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setPhone(value);
      if (value && !validatePhone(value)) {
        setErrors((prev) => ({ ...prev, phone: 'Phone number must be exactly 10 digits' }));
      } else {
        setErrors((prev) => ({ ...prev, phone: '' }));
      }
    }
  };

  const handleCeboNo = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setCeboNo(value);
      if (value && !validateCeboNo(value)) {
        setErrors((prev) => ({ ...prev, ceboNo: 'CEBO number must be exactly 10 digits' }));
      } else {
        setErrors((prev) => ({ ...prev, ceboNo: '' }));
      }
    }
  };

  const handleDob = (e) => {
    const value = e.target.value;
    if ((/^\d{4}-\d{2}-\d{2}$/.test(value) || value === '') && (validateDob(value) || value === '')) {
      setDob(value);
      setErrors((prev) => ({ ...prev, dob: '' }));
    } else if (value) {
      setErrors((prev) => ({ ...prev, dob: 'You must be at least 18 years old and use YYYY-MM-DD format' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!validateName(firstName)) newErrors.firstName = 'First name can only contain letters';
    if (!validateName(lastName)) newErrors.lastName = 'Last name can only contain letters';
    if (!validateEmail(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    if (!validateNic(nic, nicType)) newErrors.nic = nicType === 'New' ? 'NIC must be exactly 12 digits' : 'NIC must be 9 digits followed by V or X';
    if (phone && !validatePhone(phone)) newErrors.phone = 'Phone number must be exactly 10 digits';
    if (ceboNo && !validateCeboNo(ceboNo)) newErrors.ceboNo = 'CEBO number must be exactly 10 digits';
    if (!validateDob(dob)) newErrors.dob = 'You must be at least 18 years old';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
        role: 'Customer' // Explicitly set role to Customer
      });
      window.alert('Signup successful! Redirecting to login...');
      navigate('/login');
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Signup failed' });
    }
  };

  return (
    <div className="auth-container">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={handleFirstName}
            required
          />
          {errors.firstName && <p className="error">{errors.firstName}</p>}
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={handleLastName}
            required
          />
          {errors.lastName && <p className="error">{errors.lastName}</p>}
        </div>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleEmail}
            required
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>
        <div className="form-group">
          <select value={nicType} onChange={(e) => setNicType(e.target.value)}>
            <option value="New">New NIC</option>
            <option value="Old">Old NIC</option>
          </select>
          <input
            type="text"
            placeholder="NIC"
            value={nic}
            onChange={handleNic}
            required
            maxLength={nicType === 'New' ? 12 : 10}
          />
          {errors.nic && <p className="error">{errors.nic}</p>}
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={handlePhone}
            pattern="\d{10}"
            title="Phone number must be exactly 10 digits"
          />
          {errors.phone && <p className="error">{errors.phone}</p>}
        </div>
        <div className="form-group">
          <input
            type="date"
            placeholder="DOB"
            value={dob}
            onChange={handleDob}
            max={new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]}
            required
          />
          {errors.dob && <p className="error">{errors.dob}</p>}
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Cebo No"
            value={ceboNo}
            onChange={handleCeboNo}
            pattern="\d{10}"
            title="CEBO number must be exactly 10 digits"
          />
          {errors.ceboNo && <p className="error">{errors.ceboNo}</p>}
        </div>
        <button type="submit">Signup</button>
        {errors.submit && <p className="error">{errors.submit}</p>}
      </form>
      <div className="nav-buttons">
        <Link to="/login">
          <button className="login-btn">Log In</button>
        </Link>
      </div>
    </div>
  );
};

export default Signup;