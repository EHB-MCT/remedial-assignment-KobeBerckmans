const Transfer = require('../models/Transfer');
const Club = require('../models/Club');
const Auction = require('../models/Auction');

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
      playerId: randomPlayer._id.toString(),
      playerName: randomPlayer.name,
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
          playerId: randomPlayer._id.toString(),
          playerName: randomPlayer.name,
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

// Simulate a full day of transfer market activity
const simulateDay = async (req, res) => {
  try {
    const results = {
      completedTransfers: [],
      newAuctions: [],
      updatedClubs: []
    };

    // 1. Process ended auctions and complete transfers
    const endedAuctions = await Auction.find({
      status: 'active',
      endTime: { $lte: new Date() }
    }).populate('highestBidder').populate('currentClub');

    for (const auction of endedAuctions) {
      if (auction.highestBidder) {
        // Complete the transfer
        const transfer = new Transfer({
          playerId: auction.playerId,
          playerName: auction.playerName,
          fromClub: auction.currentClub._id,
          toClub: auction.highestBidder._id,
          amount: auction.highestBid,
          status: 'completed',
          transferWindow: 'Daily Simulation',
          notes: `Auction completed: ${auction.playerName} sold for ${auction.highestBid.toLocaleString()}`
        });

        await transfer.save();

        // Update club budgets and player lists
        const fromClub = await Club.findById(auction.currentClub._id);
        const toClub = await Club.findById(auction.highestBidder._id);

        if (fromClub && toClub) {
          // Remove player from selling club
          fromClub.playerIds = fromClub.playerIds.filter(id => id !== auction.playerId);
          fromClub.budget += auction.highestBid;
          
          // Add player to buying club
          toClub.playerIds.push(auction.playerId);
          toClub.budget -= auction.highestBid;

          // Add to transfer history
          fromClub.transferHistory.push({
            playerId: auction.playerId,
            type: 'OUT',
            amount: auction.highestBid,
            date: new Date()
          });

          toClub.transferHistory.push({
            playerId: auction.playerId,
            type: 'IN',
            amount: auction.highestBid,
            date: new Date()
          });

          await fromClub.save();
          await toClub.save();

          results.completedTransfers.push({
            player: auction.playerName,
            from: fromClub.name,
            to: toClub.name,
            amount: auction.highestBid
          });

          results.updatedClubs.push(fromClub.name, toClub.name);
        }
      }

      // Mark auction as ended
      auction.status = 'ended';
      await auction.save();
    }

    // 2. Create new auctions for random players
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

    // Select random players for new auctions
    const numNewAuctions = Math.floor(Math.random() * 3) + 2; // 2-4 new auctions
    const selectedPlayers = [];
    
    for (let i = 0; i < numNewAuctions; i++) {
      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      const randomClub = clubs[Math.floor(Math.random() * clubs.length)];
      
      // Check if player is not already in an active auction
      const existingAuction = await Auction.findOne({
        playerId: randomPlayer._id.toString(),
        status: 'active'
      });

      if (!existingAuction) {
        selectedPlayers.push({
          player: randomPlayer,
          club: randomClub
        });
      }
    }

    // Create new auctions
    for (const { player, club } of selectedPlayers) {
      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + Math.floor(Math.random() * 10) + 5); // 5-15 minutes

      const startingPrice = Math.floor(player.marketValue * (0.7 + Math.random() * 0.3));
      const buyNowPrice = Math.floor(player.marketValue * (1.1 + Math.random() * 0.4));

      const auction = new Auction({
        playerId: player._id.toString(),
        playerName: player.name,
        currentClub: club._id,
        startingPrice: startingPrice,
        currentPrice: startingPrice,
        buyNowPrice: buyNowPrice,
        endTime: endTime,
        status: 'active'
      });

      await auction.save();

      results.newAuctions.push({
        player: player.name,
        club: club.name,
        startingPrice: startingPrice,
        buyNowPrice: buyNowPrice,
        endTime: endTime
      });
    }

    // 3. Simulate some random transfers between clubs
    const numRandomTransfers = Math.floor(Math.random() * 3) + 1; // 1-3 random transfers
    
    for (let i = 0; i < numRandomTransfers; i++) {
      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      const availableClubs = clubs.filter(club => club.name !== randomPlayer.club);
      
      if (availableClubs.length > 0) {
        const fromClub = clubs.find(club => club.name === randomPlayer.club) || clubs[0];
        const toClub = availableClubs[Math.floor(Math.random() * availableClubs.length)];
        
        const transferAmount = Math.floor(randomPlayer.marketValue * (0.8 + Math.random() * 0.4));
        
        if (toClub.budget >= transferAmount) {
          const transfer = new Transfer({
            playerId: randomPlayer._id.toString(),
            playerName: randomPlayer.name,
            fromClub: fromClub._id,
            toClub: toClub._id,
            amount: transferAmount,
            status: 'completed',
            transferWindow: 'Daily Simulation',
            notes: `Direct transfer: ${randomPlayer.name}`
          });

          await transfer.save();

          // Update clubs
          fromClub.playerIds = fromClub.playerIds.filter(id => id !== randomPlayer._id.toString());
          fromClub.budget += transferAmount;
          toClub.playerIds.push(randomPlayer._id.toString());
          toClub.budget -= transferAmount;

          fromClub.transferHistory.push({
            playerId: randomPlayer._id.toString(),
            type: 'OUT',
            amount: transferAmount,
            date: new Date()
          });

          toClub.transferHistory.push({
            playerId: randomPlayer._id.toString(),
            type: 'IN',
            amount: transferAmount,
            date: new Date()
          });

          await fromClub.save();
          await toClub.save();

          results.completedTransfers.push({
            player: randomPlayer.name,
            from: fromClub.name,
            to: toClub.name,
            amount: transferAmount
          });
        }
      }
    }

    res.json({
      message: 'Daily simulation completed',
      results: results
    });

  } catch (err) {
    console.error('Daily simulation error:', err);
    res.status(500).json({ message: 'Daily simulation failed', error: err.message });
  }
};

module.exports = {
  simulateTransfer,
  simulateTransferWindow,
  simulateDay
}; 