const Transfer = require('../models/Transfer');
const Club = require('../models/Club');

// Simulate a single transfer
const simulateTransfer = async (req, res) => {
  try {
    // Get all clubs and players
    const clubs = await Club.find();
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const mongoUri = process.env.MONGODB_URI;
    const client = new MongoClient(mongoUri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    await client.connect();
    const db = client.db('Course_Project');
    const players = await db.collection('Players').find({}).toArray();
    await client.close();

    if (clubs.length < 2 || players.length === 0) {
      return res.status(400).json({ message: 'Need at least 2 clubs and 1 player for simulation' });
    }

    // Random selection
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    const availableClubs = clubs.filter(club => club.name !== randomPlayer.club);
    const fromClub = clubs.find(club => club.name === randomPlayer.club) || clubs[0];
    const toClub = availableClubs[Math.floor(Math.random() * availableClubs.length)];

    // Calculate transfer amount (based on market value with some randomness)
    const baseAmount = randomPlayer.marketValue;
    const variation = 0.2; // 20% variation
    const transferAmount = Math.floor(baseAmount * (1 + (Math.random() - 0.5) * variation));

    // Check if toClub has enough budget
    if (toClub.budget < transferAmount) {
      return res.status(400).json({ 
        message: `${toClub.name} doesn't have enough budget (${toClub.budget.toLocaleString()} < ${transferAmount.toLocaleString()})` 
      });
    }

    // Create transfer
    const transfer = new Transfer({
      player: randomPlayer._id,
      fromClub: fromClub._id,
      toClub: toClub._id,
      amount: transferAmount,
      status: 'pending',
      transferWindow: 'Summer 2024',
      notes: `Simulated transfer: ${randomPlayer.name} from ${fromClub.name} to ${toClub.name}`
    });

    // Add initial negotiation
    transfer.negotiationHistory.push({
      club: toClub._id,
      offer: transferAmount,
      action: 'offer',
      date: new Date()
    });

    const savedTransfer = await transfer.save();
    const populatedTransfer = await Transfer.findById(savedTransfer._id)
      .populate('player')
      .populate('fromClub')
      .populate('toClub');

    res.json({
      message: 'Transfer simulation completed',
      transfer: populatedTransfer
    });

  } catch (err) {
    console.error('Simulation error:', err);
    res.status(500).json({ message: 'Simulation failed', error: err.message });
  }
};

// Simulate multiple transfers
const simulateTransferWindow = async (req, res) => {
  try {
    const numTransfers = req.body.numTransfers || 5;
    const results = [];

    for (let i = 0; i < numTransfers; i++) {
      // Similar logic as single transfer but with more complexity
      // This is a simplified version
      const clubs = await Club.find();
      const { MongoClient, ServerApiVersion } = require('mongodb');
      const mongoUri = process.env.MONGODB_URI;
      const client = new MongoClient(mongoUri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      });
      await client.connect();
      const db = client.db('Course_Project');
      const players = await db.collection('Players').find({}).toArray();
      await client.close();

      if (clubs.length < 2 || players.length === 0) break;

      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      const availableClubs = clubs.filter(club => club.name !== randomPlayer.club);
      const fromClub = clubs.find(club => club.name === randomPlayer.club) || clubs[0];
      const toClub = availableClubs[Math.floor(Math.random() * availableClubs.length)];

      const baseAmount = randomPlayer.marketValue;
      const transferAmount = Math.floor(baseAmount * (1 + (Math.random() - 0.5) * 0.3));

      if (toClub.budget >= transferAmount) {
        const transfer = new Transfer({
          player: randomPlayer._id,
          fromClub: fromClub._id,
          toClub: toClub._id,
          amount: transferAmount,
          status: 'pending',
          transferWindow: 'Summer 2024'
        });

        transfer.negotiationHistory.push({
          club: toClub._id,
          offer: transferAmount,
          action: 'offer'
        });

        const savedTransfer = await transfer.save();
        results.push(savedTransfer);
      }
    }

    res.json({
      message: `Simulated ${results.length} transfers`,
      transfers: results
    });

  } catch (err) {
    console.error('Transfer window simulation error:', err);
    res.status(500).json({ message: 'Transfer window simulation failed', error: err.message });
  }
};

module.exports = {
  simulateTransfer,
  simulateTransferWindow
}; 