/**
 * Club Model
 * 
 * This module defines the Club schema for the application.
 * It handles club management, player assignments, and budget tracking.
 * 
 * @author Kobe Berckmans
 * @version 1.0.0
 * @license MIT
 */

const mongoose = require('mongoose');

/**
 * Club Schema
 * Defines the structure and validation rules for club documents
 * 
 * @type {mongoose.Schema}
 */
const clubSchema = new mongoose.Schema({
  /**
   * Club name for identification
   * @type {string}
   * @required
   * @unique
   */
  name: {
    type: String,
    required: [true, 'Club name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Club name must be at least 2 characters long'],
    maxlength: [50, 'Club name cannot exceed 50 characters']
  },

  /**
   * Club's available budget for transfers
   * @type {number}
   * @required
   * @default 500000000
   */
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    default: 500000000, // 500M default budget
    min: [0, 'Budget cannot be negative']
  },

  /**
   * League the club belongs to
   * @type {string}
   * @default 'Premier League'
   */
  league: {
    type: String,
    default: 'Premier League',
    trim: true
  },

  /**
   * Country where the club is located
   * @type {string}
   * @default 'England'
   */
  country: {
    type: String,
    default: 'England',
    trim: true
  },

  /**
   * Array of player IDs assigned to this club
   * @type {Array<string>}
   * @default []
   */
  playerIds: {
    type: [String],
    default: []
  },

  /**
   * Array of transfer history records
   * @type {Array<Object>}
   * @default []
   */
  transferHistory: {
    type: [{
      /**
       * Player ID involved in the transfer
       * @type {string}
       */
      playerId: {
        type: String,
        required: true
      },

      /**
       * Type of transfer (IN/OUT)
       * @type {string}
       * @enum ['IN', 'OUT']
       */
      type: {
        type: String,
        enum: ['IN', 'OUT'],
        required: true
      },

      /**
       * Transfer amount in currency
       * @type {number}
       */
      amount: {
        type: Number,
        required: true,
        min: [0, 'Transfer amount cannot be negative']
      },

      /**
       * Date of the transfer
       * @type {Date}
       * @default Date.now
       */
      date: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
  },

  /**
   * Timestamp when the club was created
   * @type {Date}
   * @default Date.now
   */
  createdAt: {
    type: Date,
    default: Date.now
  },

  /**
   * Timestamp when the club was last updated
   * @type {Date}
   * @default Date.now
   */
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  /**
   * Schema options for timestamps and collection name
   */
  timestamps: true,
  collection: 'Clubs'
});

/**
 * Pre-save middleware to update the updatedAt timestamp
 */
clubSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

/**
 * Instance method to add a player to the club
 * 
 * @param {string} playerId - ID of the player to add
 * @returns {Promise<Object>} Updated club document
 */
clubSchema.methods.addPlayer = async function(playerId) {
  if (!this.playerIds.includes(playerId)) {
    this.playerIds.push(playerId);
    return await this.save();
  }
  return this;
};

/**
 * Instance method to remove a player from the club
 * 
 * @param {string} playerId - ID of the player to remove
 * @returns {Promise<Object>} Updated club document
 */
clubSchema.methods.removePlayer = async function(playerId) {
  this.playerIds = this.playerIds.filter(id => id !== playerId);
  return await this.save();
};

/**
 * Instance method to check if club has sufficient budget
 * 
 * @param {number} amount - Amount to check against budget
 * @returns {boolean} True if budget is sufficient
 */
clubSchema.methods.hasSufficientBudget = function(amount) {
  return this.budget >= amount;
};

/**
 * Instance method to update budget (add or subtract)
 * 
 * @param {number} amount - Amount to add (positive) or subtract (negative)
 * @returns {Promise<Object>} Updated club document
 */
clubSchema.methods.updateBudget = async function(amount) {
  this.budget += amount;
  if (this.budget < 0) {
    throw new Error('Budget cannot go below zero');
  }
  return await this.save();
};

/**
 * Instance method to add transfer to history
 * 
 * @param {string} playerId - ID of the player
 * @param {string} type - Transfer type (IN/OUT)
 * @param {number} amount - Transfer amount
 * @returns {Promise<Object>} Updated club document
 */
clubSchema.methods.addTransferToHistory = async function(playerId, type, amount) {
  this.transferHistory.push({
    playerId,
    type,
    amount,
    date: new Date()
  });
  return await this.save();
};

/**
 * Instance method to get club statistics
 * 
 * @returns {Object} Club statistics
 */
clubSchema.methods.getStats = function() {
  return {
    name: this.name,
    budget: this.budget,
    playerCount: this.playerIds.length,
    transferCount: this.transferHistory.length,
    totalSpent: this.transferHistory
      .filter(t => t.type === 'IN')
      .reduce((sum, t) => sum + t.amount, 0),
    totalEarned: this.transferHistory
      .filter(t => t.type === 'OUT')
      .reduce((sum, t) => sum + t.amount, 0)
  };
};

/**
 * Static method to find clubs by league
 * 
 * @param {string} league - League name
 * @returns {Promise<Array>} Array of club documents
 */
clubSchema.statics.findByLeague = function(league) {
  return this.find({ league });
};

/**
 * Static method to find clubs with budget above threshold
 * 
 * @param {number} threshold - Minimum budget amount
 * @returns {Promise<Array>} Array of club documents
 */
clubSchema.statics.findByBudgetThreshold = function(threshold) {
  return this.find({ budget: { $gte: threshold } });
};

module.exports = mongoose.model('Club', clubSchema); 