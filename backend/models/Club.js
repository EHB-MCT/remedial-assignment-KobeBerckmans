const mongoose = require('mongoose');

const ClubSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  budget: { 
    type: Number, 
    required: true, 
    default: 100000000 
  },
  playerIds: [{ 
    type: String 
  }],
  transferHistory: [{
    playerId: { type: String },
    type: { type: String, enum: ['IN', 'OUT'], required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
  }],
  league: { 
    type: String, 
    default: 'Premier League' 
  },
  country: { 
    type: String, 
    default: 'England' 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Club', ClubSchema); 