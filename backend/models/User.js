/**
 * User Model
 * 
 * This module defines the User schema for the application.
 * It handles user authentication, profile management, and club associations.
 * 
 * @author Kobe Berckmans
 * @version 1.0.0
 * @license MIT
 */

const mongoose = require('mongoose');

/**
 * User Schema
 * Defines the structure and validation rules for user documents
 * 
 * @type {mongoose.Schema}
 */
const userSchema = new mongoose.Schema({
  /**
   * Unique username for the user account
   * @type {string}
   * @required
   * @unique
   */
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },

  /**
   * User's email address for account recovery and notifications
   * @type {string}
   * @required
   * @unique
   */
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },

  /**
   * Hashed password for secure authentication
   * @type {string}
   * @required
   */
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },

  /**
   * User's club name for identification
   * @type {string}
   */
  clubName: {
    type: String,
    trim: true
  },

  /**
   * Reference to the user's associated club
   * @type {mongoose.Types.ObjectId}
   * @ref Club
   */
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  },

  /**
   * Timestamp when the user was created
   * @type {Date}
   * @default Date.now
   */
  createdAt: {
    type: Date,
    default: Date.now
  },

  /**
   * Timestamp of the user's last login
   * @type {Date}
   */
  lastLogin: {
    type: Date
  },

  /**
   * User's role in the system (for future role-based access control)
   * @type {string}
   * @default 'user'
   */
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },

  /**
   * Whether the user account is active
   * @type {boolean}
   * @default true
   */
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  /**
   * Schema options for timestamps and collection name
   */
  timestamps: true,
  collection: 'Users'
});

/**
 * Pre-save middleware to hash password before saving
 * Only hashes the password if it has been modified
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    const bcrypt = require('bcryptjs');
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method to compare password with hashed password
 * 
 * @param {string} candidatePassword - The password to compare
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Instance method to get user profile without sensitive data
 * 
 * @returns {Object} User object without password
 */
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

/**
 * Static method to find user by username or email
 * 
 * @param {string} identifier - Username or email
 * @returns {Promise<Object>} User document or null
 */
userSchema.statics.findByUsernameOrEmail = function(identifier) {
  return this.findOne({
    $or: [
      { username: identifier },
      { email: identifier }
    ]
  });
};

/**
 * Static method to check if username exists
 * 
 * @param {string} username - Username to check
 * @returns {Promise<boolean>} True if username exists
 */
userSchema.statics.usernameExists = async function(username) {
  const user = await this.findOne({ username });
  return !!user;
};

/**
 * Static method to check if email exists
 * 
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} True if email exists
 */
userSchema.statics.emailExists = async function(email) {
  const user = await this.findOne({ email });
  return !!user;
};

module.exports = mongoose.model('User', userSchema); 