const mongoose = require('mongoose');

const AuctionSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true
  },
  playerName: {
    type: String,
    required: true
  },
  currentClub: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  startingPrice: {
    type: Number,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  highestBid: {
    type: Number,
    default: 0
  },
  highestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'ended', 'cancelled'],
    default: 'active'
  },
  bids: [{
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  buyNowPrice: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: 'Player available for transfer'
  }
}, {
  timestamps: true
});

// Index for efficient queries
AuctionSchema.index({ status: 1, endTime: 1 });

module.exports = mongoose.model('Auction', AuctionSchema); 