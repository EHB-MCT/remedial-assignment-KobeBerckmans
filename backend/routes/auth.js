/**
 * Authentication Routes
 * 
 * This module handles all authentication-related API endpoints including:
 * - User registration
 * - User login
 * - JWT token validation
 * - Password hashing and verification
 * 
 * @author Kobe Berckmans
 * @version 1.0.0
 * @license MIT
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * POST /api/auth/register
 * Registers a new user account
 * 
 * @route POST /api/auth/register
 * @param {string} username - Unique username for the account
 * @param {string} email - User's email address
 * @param {string} password - User's password (will be hashed)
 * @returns {Object} Created user object with JWT token
 * @throws {400} Username or email already exists
 * @throws {400} Invalid input data
 * @throws {500} Internal server error
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    const savedUser = await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: savedUser._id, username: savedUser.username },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT token
 * 
 * @route POST /api/auth/login
 * @param {string} username - User's username or email
 * @param {string} password - User's password
 * @returns {Object} User object with JWT token
 * @throws {401} Invalid credentials
 * @throws {400} Missing required fields
 * @throws {500} Internal server error
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: username },
        { email: username }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

/**
 * POST /api/auth/verify
 * Verifies a JWT token and returns user information
 * 
 * @route POST /api/auth/verify
 * @param {string} token - JWT token to verify
 * @returns {Object} User information if token is valid
 * @throws {401} Invalid or expired token
 * @throws {500} Internal server error
 */
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ message: 'Token is required' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // Find user by ID
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({
      message: 'Token is valid',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Error verifying token' });
  }
});

/**
 * POST /api/auth/logout
 * Logs out a user (client-side token removal)
 * 
 * @route POST /api/auth/logout
 * @returns {Object} Success message
 */
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router; 