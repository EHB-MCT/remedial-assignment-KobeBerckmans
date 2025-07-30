const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Club = require('../models/Club');
const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, clubName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Username or email already exists' 
      });
    }

    // Check if club name already exists
    const existingClub = await Club.findOne({ name: clubName });
    if (existingClub) {
      return res.status(400).json({ 
        message: 'Club name already exists' 
      });
    }

    // Create new club for the user
    const newClub = new Club({
      name: clubName,
      budget: 100000000, // 100M starting budget
      league: 'User League',
      country: 'User Country',
      playerIds: []
    });

    const savedClub = await newClub.save();

    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      clubName,
      clubId: savedClub._id
    });

    const savedUser = await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: savedUser._id, 
        username: savedUser.username,
        clubId: savedClub._id,
        clubName: savedClub.name
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: savedUser,
      club: savedClub
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error creating user',
      error: error.message 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username }).populate('clubId');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid username or password' 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid username or password' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        clubId: user.clubId._id,
        clubName: user.clubId.name
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
      club: user.clubId
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error during login',
      error: error.message 
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('clubId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: user.toJSON(),
      club: user.clubId
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      message: 'Error fetching profile',
      error: error.message 
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router; 