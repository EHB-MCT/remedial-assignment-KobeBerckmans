const mongoose = require('mongoose');

const TransferSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  fromClub: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  toClub: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  negotiationHistory: [{
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club' },
    offer: { type: Number },
    action: { type: String, enum: ['offer', 'accept', 'reject', 'counter'] },
    date: { type: Date, default: Date.now }
  }],
  transferWindow: {
    type: String,
    default: 'Summer 2024'
  },
  transferDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transfer', TransferSchema); 