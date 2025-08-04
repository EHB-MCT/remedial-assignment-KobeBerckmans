/**
 * Error Handling Utilities
 * 
 * This module contains custom error classes and error handling utilities.
 * It follows the Single Responsibility Principle by focusing only on error handling.
 * 
 * @author Kobe Berckmans
 * @version 1.0.0
 */

/**
 * Custom error class for validation errors
 */
class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.field = field;
  }
}

/**
 * Custom error class for authentication errors
 */
class AuthenticationError extends Error {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
    this.status = 401;
  }
}

/**
 * Custom error class for authorization errors
 */
class AuthorizationError extends Error {
  constructor(message = 'Access denied') {
    super(message);
    this.name = 'AuthorizationError';
    this.status = 403;
  }
}

/**
 * Custom error class for not found errors
 */
class NotFoundError extends Error {
  constructor(resource = 'Resource') {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

/**
 * Custom error class for database errors
 */
class DatabaseError extends Error {
  constructor(message = 'Database operation failed') {
    super(message);
    this.name = 'DatabaseError';
    this.status = 500;
  }
}

/**
 * Custom error class for auction errors
 */
class AuctionError extends Error {
  constructor(message = 'Auction operation failed') {
    super(message);
    this.name = 'AuctionError';
    this.status = 400;
  }
}

/**
 * Creates a standardized error response
 * @param {Error} error - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleError = (error, req, res, next) => {
  console.error(`❌ Error: ${error.name} - ${error.message}`);
  console.error(`📍 Path: ${req.path}`);
  console.error(`🔍 Method: ${req.method}`);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.message,
      field: error.field,
      timestamp: new Date().toISOString()
    });
  }

  if (error.name === 'AuthenticationError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }

  if (error.name === 'AuthorizationError') {
    return res.status(403).json({
      error: 'Authorization Error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }

  if (error.name === 'NotFoundError') {
    return res.status(404).json({
      error: 'Not Found',
      message: error.message,
      path: req.path,
      timestamp: new Date().toISOString()
    });
  }

  if (error.name === 'DatabaseError') {
    return res.status(500).json({
      error: 'Database Error',
      message: 'An internal database error occurred',
      timestamp: new Date().toISOString()
    });
  }

  if (error.name === 'AuctionError') {
    return res.status(400).json({
      error: 'Auction Error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }

  // Default error handler
  const status = error.status || 500;
  const message = error.message || 'Internal server error';
  
  res.status(status).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? message : 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    timestamp: new Date().toISOString()
  });
};

/**
 * Async error wrapper for Express routes
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Wrapped function with error handling
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validates if an error is a MongoDB duplicate key error
 * @param {Error} error - The error to check
 * @returns {boolean} - True if it's a duplicate key error
 */
const isDuplicateKeyError = (error) => {
  return error.code === 11000 || error.code === 11001;
};

/**
 * Validates if an error is a MongoDB validation error
 * @param {Error} error - The error to check
 * @returns {boolean} - True if it's a validation error
 */
const isValidationError = (error) => {
  return error.name === 'ValidationError';
};

/**
 * Creates a user-friendly error message
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
const createUserFriendlyMessage = (error) => {
  if (error.name === 'ValidationError') {
    return 'Please check your input and try again.';
  }
  
  if (error.name === 'AuthenticationError') {
    return 'Please log in to continue.';
  }
  
  if (error.name === 'AuthorizationError') {
    return 'You do not have permission to perform this action.';
  }
  
  if (error.name === 'NotFoundError') {
    return 'The requested resource was not found.';
  }
  
  if (error.name === 'DatabaseError') {
    return 'A database error occurred. Please try again later.';
  }
  
  if (error.name === 'AuctionError') {
    return 'There was an issue with the auction. Please try again.';
  }
  
  return 'An unexpected error occurred. Please try again later.';
};

/**
 * Logs error details for debugging
 * @param {Error} error - The error to log
 * @param {Object} context - Additional context information
 */
const logError = (error, context = {}) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    name: error.name,
    message: error.message,
    stack: error.stack,
    context
  };
  
  console.error('🚨 Error Log:', JSON.stringify(errorLog, null, 2));
};

module.exports = {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  AuctionError,
  handleError,
  asyncHandler,
  isDuplicateKeyError,
  isValidationError,
  createUserFriendlyMessage,
  logError
}; 