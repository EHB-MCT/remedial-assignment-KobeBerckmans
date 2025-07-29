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
  players: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Player' 
  }],
  transferHistory: [{
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
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