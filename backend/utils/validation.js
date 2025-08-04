/**
 * Validation Utilities
 * 
 * This module contains reusable validation functions for the application.
 * It follows the Single Responsibility Principle by focusing only on validation logic.
 * 
 * @author Kobe Berckmans
 * @version 1.0.0
 */

/**
 * Validates if a value is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Validates if a value is a positive number
 * @param {number} value - The value to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidPositiveNumber = (value) => {
  return typeof value === 'number' && value > 0 && isFinite(value);
};

/**
 * Validates if a value is a valid email address
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates if a value is a valid username
 * @param {string} username - The username to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidUsername = (username) => {
  if (!username || typeof username !== 'string') return false;
  return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
};

/**
 * Validates if a value is a valid password
 * @param {string} password - The password to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidPassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
};

/**
 * Validates auction data
 * @param {Object} auctionData - The auction data to validate
 * @returns {Object} - Validation result with isValid and errors
 */
const validateAuctionData = (auctionData) => {
  const errors = [];

  if (!auctionData.playerId || !isValidObjectId(auctionData.playerId)) {
    errors.push('Invalid player ID');
  }

  if (!auctionData.playerName || typeof auctionData.playerName !== 'string') {
    errors.push('Invalid player name');
  }

  if (!auctionData.currentClubId || !isValidObjectId(auctionData.currentClubId)) {
    errors.push('Invalid club ID');
  }

  if (!isValidPositiveNumber(auctionData.startingPrice)) {
    errors.push('Invalid starting price');
  }

  if (!isValidPositiveNumber(auctionData.buyNowPrice)) {
    errors.push('Invalid buy now price');
  }

  if (auctionData.startingPrice >= auctionData.buyNowPrice) {
    errors.push('Starting price must be less than buy now price');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates bid data
 * @param {Object} bidData - The bid data to validate
 * @returns {Object} - Validation result with isValid and errors
 */
const validateBidData = (bidData) => {
  const errors = [];

  if (!bidData.clubId || !isValidObjectId(bidData.clubId)) {
    errors.push('Invalid club ID');
  }

  if (!isValidPositiveNumber(bidData.amount)) {
    errors.push('Invalid bid amount');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates club data
 * @param {Object} clubData - The club data to validate
 * @returns {Object} - Validation result with isValid and errors
 */
const validateClubData = (clubData) => {
  const errors = [];

  if (!clubData.name || typeof clubData.name !== 'string' || clubData.name.trim().length === 0) {
    errors.push('Invalid club name');
  }

  if (!isValidPositiveNumber(clubData.budget)) {
    errors.push('Invalid budget');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates user registration data
 * @param {Object} userData - The user data to validate
 * @returns {Object} - Validation result with isValid and errors
 */
const validateUserRegistration = (userData) => {
  const errors = [];

  if (!isValidUsername(userData.username)) {
    errors.push('Invalid username (3-20 characters, alphanumeric and underscore only)');
  }

  if (!isValidEmail(userData.email)) {
    errors.push('Invalid email address');
  }

  if (!isValidPassword(userData.password)) {
    errors.push('Password must be at least 6 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitizes input data to prevent XSS attacks
 * @param {string} input - The input to sanitize
 * @returns {string} - Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '')
    .trim();
};

/**
 * Formats currency values for display
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: EUR)
 * @returns {string} - Formatted currency string
 */
const formatCurrency = (amount, currency = 'EUR') => {
  if (!isValidPositiveNumber(amount)) return '€0';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

module.exports = {
  isValidObjectId,
  isValidPositiveNumber,
  isValidEmail,
  isValidUsername,
  isValidPassword,
  validateAuctionData,
  validateBidData,
  validateClubData,
  validateUserRegistration,
  sanitizeInput,
  formatCurrency
}; 