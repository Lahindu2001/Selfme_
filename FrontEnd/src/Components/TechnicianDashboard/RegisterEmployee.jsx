import React, { useState } from "react";
import "./TechnicianDashboard.css";
import TechnicianLayout from "./TechnicianLayout";

function RegisterEmployee() {
  const [form, setForm] = useState({
    Employee_name: "",
    Employee_Address: "",
    Employee_Dob: "",
    contact_number: "",
    hire_date: "",
  });

  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Helper: Calculate age from DOB
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

  // Restrict input for name (only letters and spaces)
  const handleNameInput = (e) => {
    const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
    setForm({ ...form, Employee_name: value });
  };

  // Restrict input for contact number (only digits, max 10)
  const handleContactInput = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 10) value = value.slice(0, 10);
    setForm({ ...form, contact_number: value });
  };

  // Restrict input for address (no validation here, but you can add if needed)
  const handleAddressInput = (e) => {
    setForm({ ...form, Employee_Address: e.target.value });
  };

  // Restrict input for hire date and dob
  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Validation before submit
  const validate = () => {
    const newErrors = {};
    if (!form.Employee_name.trim()) {
      newErrors.Employee_name = "Name is required";
    }
    if (!/^[A-Za-z\s]+$/.test(form.Employee_name)) {
      newErrors.Employee_name = "Name must contain only letters";
    }
    if (!form.Employee_Address.trim()) {
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
      // Check if hire date is in the future
      const hireDate = new Date(form.hire_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for fair comparison

      if (hireDate > today) {
        newErrors.hire_date = "Hire date cannot be in the future";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await fetch("http://localhost:5000/employees/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({
      Employee_name: "",
      Employee_Address: "",
      Employee_Dob: "",
      contact_number: "",
      hire_date: "",
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  // Set max date for DOB to ensure 18+ only
  const today = new Date();
  const minDob = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
  const maxDob = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

  // Set max date for hire date (today)
  const maxHireDate = today.toISOString().split("T")[0];

  return (
    <TechnicianLayout>
      <div className="technician-dashboard">
        <h2>Register Employee</h2>
        <form className="employee-form" onSubmit={handleRegister} autoComplete="off">
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="Employee_name"
              value={form.Employee_name}
              onChange={handleNameInput}
              required
              autoComplete="off"
            />
            {errors.Employee_name && (
              <div className="error-msg">{errors.Employee_name}</div>
            )}
          </div>
          <div>
            <label>Address:</label>
            <input
              type="text"
              name="Employee_Address"
              value={form.Employee_Address}
              onChange={handleAddressInput}
              required
              autoComplete="off"
            />
            {errors.Employee_Address && (
              <div className="error-msg">{errors.Employee_Address}</div>
            )}
          </div>
          <div>
            <label>Date of Birth:</label>
            <input
              type="date"
              name="Employee_Dob"
              value={form.Employee_Dob}
              onChange={handleInput}
              min={minDob.toISOString().split("T")[0]}
              max={maxDob.toISOString().split("T")[0]}
              required
            />
            {errors.Employee_Dob && (
              <div className="error-msg">{errors.Employee_Dob}</div>
            )}
          </div>
          <div>
            <label>Contact Number:</label>
            <input
              type="text"
              name="contact_number"
              value={form.contact_number}
              onChange={handleContactInput}
              maxLength={10}
              required
              autoComplete="off"
              inputMode="numeric"
              pattern="\d*"
            />
            {errors.contact_number && (
              <div className="error-msg">{errors.contact_number}</div>
            )}
          </div>
          <div>
            <label>Hire Date:</label>
            <input
              type="date"
              name="hire_date"
              value={form.hire_date}
              onChange={handleInput}
              max={maxHireDate}
              required
            />
            {errors.hire_date && (
              <div className="error-msg">{errors.hire_date}</div>
            )}
          </div>
          <button className="cta-button primary" type="submit">
            Register
          </button>
        </form>
        {success && (
          <div className="success-msg">Employee registered successfully!</div>
        )}
      </div>
    </TechnicianLayout>
  );
}

export default RegisterEmployee;