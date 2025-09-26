// BackEnd/Routes/AuthRoutes.js
const express = require('express');
const { signup, login } = require('../Controllers/AuthController');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Existing routes
router.post('/signup', signup);
router.post('/login', login);

// New route to get user data
router.get('/user', verifyToken, async (req, res) => {
  try {
    const User = require('../Model/UserModel'); // Import User model
    const user = await User.findById(req.userId).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.created_at, // Match schema field name
    });
  } catch (err) {
    console.error('❌ Get user error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;