// BackEnd/Controllers/AuthController.js
const User = require('../Model/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key_here'; // Change this to a strong secret in .env

// Signup
const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, nic, phone, dob, address, ceboNo, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      nic,
      phone,
      dob,
      address,
      ceboNo,
      role
    });
    
    await newUser.save();
    console.log("✅ New user created:", newUser._id, newUser.email);
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Login attempt for:", email);
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Invalid password for:", email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // FIXED: Use _id instead of userid (MongoDB's default ID)
    const token = jwt.sign(
      { 
        userId: user._id.toString(), // Use MongoDB's _id
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' } // Increased to 24h for testing
    );
    
    console.log("✅ Login successful for:", email, "User ID:", user._id);
    
    // Return token and user data
    res.json({
      token,
      userId: user._id.toString(), // Include userId for frontend
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { signup, login };