const Transfer = require('../models/Transfer');
const Club = require('../models/Club');
const Auction = require('../models/Auction');
const axios = require('axios');

// AI clubs that will automatically bid (updated with new club IDs and 500M budget)
const AI_CLUBS = [
  { id: '688b7a69b6517d2d0f319e3d', name: 'Manchester City', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e3e', name: 'Real Madrid', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e3f', name: 'Bayern Munich', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e40', name: 'Paris Saint-Germain', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e41', name: 'Liverpool', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e42', name: 'Barcelona', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e43', name: 'Manchester United', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e44', name: 'Chelsea', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e45', name: 'Arsenal', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e46', name: 'Tottenham Hotspur', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e47', name: 'Atletico Madrid', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e48', name: 'Sevilla', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e49', name: 'Borussia Dortmund', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e4a', name: 'RB Leipzig', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e4b', name: 'Bayer Leverkusen', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e4c', name: 'AC Milan', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e4d', name: 'Inter Milan', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e4e', name: 'Juventus', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e4f', name: 'Napoli', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e50', name: 'AS Roma', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e51', name: 'Marseille', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e52', name: 'Lyon', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e53', name: 'Monaco', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e54', name: 'Porto', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e55', name: 'Benfica', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e56', name: 'Ajax', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e57', name: 'PSV Eindhoven', budget: 500000000 }
];

// Function to place a bid (for AI)
async function placeAIBid(auctionId, clubId, amount) {
  try {
    const response = await axios.post(`http://localhost:3000/api/auctions/${auctionId}/bid`, {
      clubId: clubId,
      amount: amount
    });
    return response.data;
  } catch (error) {
    console.error(`AI bid failed for auction ${auctionId}:`, error.response?.data?.message || error.message);
    return null;
  }
}

// Function to buy now (for AI)
async function buyNowAI(auctionId, clubId) {
  try {
    const response = await axios.post(`http://localhost:3000/api/auctions/${auctionId}/buy-now`, {
      clubId: clubId
    });
    return response.data;
  } catch (error) {
    console.error(`AI buy now failed for auction ${auctionId}:`, error.response?.data?.message || error.message);
    return null;
  }
}

// Function to get current club budgets
async function getClubBudgets() {
  try {
    const response = await axios.get('http://localhost:3000/api/clubs');
    const clubs = response.data;
    return clubs.reduce((acc, club) => {
      acc[club._id] = club.budget;
      return acc;
    }, {});
  } catch (error) {
    return {};
  }
}

// Function to trigger AI bidding on auctions
async function triggerAIBidding() {
  try {
    console.log('🤖 Triggering AI bidding after simulation...');
    
    // Get current auctions
    const auctionsResponse = await axios.get('http://localhost:3000/api/auctions');
    const auctions = auctionsResponse.data.filter(auction => auction.status === 'active');
    
    if (auctions.length === 0) {
      console.log('📭 No active auctions found for AI bidding');
      return;
    }
    
    console.log(`📋 Found ${auctions.length} active auctions for AI bidding`);
    
    // Get current club budgets
    const clubBudgets = await getClubBudgets();
    
    // Process each auction individually to avoid race conditions
    for (const auction of auctions) {
      try {
        console.log(`\n🎯 AI bidding on auction for ${auction.playerName}`);
        
        // Re-fetch auction to get latest status
        const currentAuctionResponse = await axios.get(`http://localhost:3000/api/auctions/${auction._id}`);
        const currentAuction = currentAuctionResponse.data;
        
        // Check if auction is still active
        if (currentAuction.status !== 'active') {
          console.log(`⏰ Auction ${auction.playerName} is no longer active (${currentAuction.status})`);
          continue;
        }
        
        // Check if auction has ended
        const timeLeft = new Date(currentAuction.endTime) - new Date();
        if (timeLeft <= 0) {
          console.log(`⏰ Auction ${auction.playerName} has ended, skipping...`);
          continue;
        }
        
        // Track which clubs have already processed this auction
        const processedClubs = new Set();
        
        // For each AI club, decide whether to bid
        for (const aiClub of AI_CLUBS) {
          try {
            // Skip if this club already processed this auction
            if (processedClubs.has(aiClub.id)) {
              continue;
            }
            
            const currentBudget = clubBudgets[aiClub.id] || aiClub.budget;
            
            // Check if club can afford the minimum bid
            const minBid = currentAuction.highestBid > 0 ? currentAuction.highestBid : currentAuction.startingPrice;
            
            if (currentBudget < minBid) {
              continue;
            }
            
            // 25% chance to bid (reduced to make auctions last longer)
            const bidChance = Math.random();
            
            if (bidChance < 0.25) {
              // Calculate bid amount (but don't exceed buy now price)
              const maxBid = Math.min(
                Math.floor(minBid * (1 + Math.random() * 0.2)), // 0-20% increase (smaller increases)
                currentAuction.buyNowPrice - 1 // Stay below buy now price
              );
              
              if (maxBid > minBid && maxBid <= currentBudget) {
                const result = await placeAIBid(currentAuction._id, aiClub.id, maxBid);
                if (result) {
                  clubBudgets[aiClub.id] = result.highestBidder.budget;
                  processedClubs.add(aiClub.id); // Mark as processed
                }
              }
            }
            
            // 5% chance to buy now (very rare to avoid abrupt auction endings)
            const buyNowChance = Math.random();
            
            if (buyNowChance < 0.05 && currentBudget >= currentAuction.buyNowPrice) {
              console.log(`💎 ${aiClub.name} decides to BUY NOW for €${currentAuction.buyNowPrice.toLocaleString()}!`);
              const result = await buyNowAI(currentAuction._id, aiClub.id);
              if (result) {
                clubBudgets[aiClub.id] = result.highestBidder.budget;
                processedClubs.add(aiClub.id); // Mark as processed
                console.log(`✅ ${aiClub.name} successfully bought ${currentAuction.playerName} for €${currentAuction.buyNowPrice.toLocaleString()}`);
                break; // Stop processing this auction since it's been bought
              }
            }
            
            // Mark this club as processed for this auction
            processedClubs.add(aiClub.id);
            
          } catch (error) {
            console.error(`Error with AI club ${aiClub.name}:`, error);
            // Continue with next AI club
          }
        }
        
        // Add a small delay between auctions to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`Error processing auction ${auction.playerName}:`, error.message);
        // Continue with next auction
      }
    }
    
    console.log('✅ AI bidding completed');
    
  } catch (error) {
    console.error('AI bidding error:', error);
    throw error; // Re-throw to be caught by the caller
  }
}

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
        // Complete the transfer using atomic operations
        const session = await Club.startSession();
        try {
          await session.withTransaction(async () => {
            // Get clubs with session
            const fromClub = await Club.findById(auction.currentClub._id).session(session);
            const toClub = await Club.findById(auction.highestBidder._id).session(session);
            
            if (!fromClub || !toClub) {
              throw new Error('Club not found during transfer');
            }

            // Update buying club - add player and subtract budget
            const buyingClubResult = await Club.findByIdAndUpdate(
              toClub._id,
              { 
                $inc: { budget: -auction.highestBid },
                $addToSet: { playerIds: auction.playerId }, // Use addToSet to prevent duplicates
                $push: { 
                  transferHistory: {
                    playerId: auction.playerId,
                    type: 'IN',
                    amount: auction.highestBid,
                    date: new Date()
                  }
                }
              },
              { new: true, session }
            );

            if (!buyingClubResult) {
              throw new Error('Failed to update buying club');
            }

            // Update selling club - remove player and add budget
            const sellingClubResult = await Club.findByIdAndUpdate(
              fromClub._id,
              { 
                $inc: { budget: auction.highestBid },
                $pull: { playerIds: auction.playerId },
                $push: { 
                  transferHistory: {
                    playerId: auction.playerId,
                    type: 'OUT',
                    amount: auction.highestBid,
                    date: new Date()
                  }
                }
              },
              { new: true, session }
            );

            if (!sellingClubResult) {
              throw new Error('Failed to update selling club');
            }

            results.completedTransfers.push({
              player: auction.playerName,
              from: sellingClubResult.name,
              to: buyingClubResult.name,
              amount: auction.highestBid
            });

            results.updatedClubs.push(sellingClubResult.name, buyingClubResult.name);
          });
        } finally {
          await session.endSession();
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
    const numNewAuctions = Math.floor(Math.random() * 5) + 5; // 5-10 new auctions
    const selectedPlayers = [];
    
    // Get all player IDs that are currently in clubs
    const allClubs = await Club.find();
    const playersInClubs = new Set();
    allClubs.forEach(club => {
      club.playerIds.forEach(playerId => {
        playersInClubs.add(playerId);
      });
    });
    
    for (let i = 0; i < numNewAuctions; i++) {
      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      
      // Find clubs that actually have this player
      const clubsWithPlayer = clubs.filter(club => 
        club.playerIds.includes(randomPlayer._id.toString())
      );
      
      // Only create auction if player is in a club
      if (clubsWithPlayer.length > 0) {
        const randomClub = clubsWithPlayer[Math.floor(Math.random() * clubsWithPlayer.length)];
        
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
    }

    // Create new auctions
    for (const { player, club } of selectedPlayers) {
      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + 15); // 15 minutes for longer auctions

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

    // Trigger AI bidding on new auctions
    try {
      await triggerAIBidding();
    } catch (error) {
      console.error('AI bidding error:', error);
      // Continue with simulation even if AI bidding fails
    }

    // 3. Simulate some random transfers between clubs
    const numRandomTransfers = Math.floor(Math.random() * 3) + 1; // 1-3 random transfers
    
    for (let i = 0; i < numRandomTransfers; i++) {
      // Find clubs that have players
      const clubsWithPlayers = clubs.filter(club => club.playerIds.length > 0);
      
      if (clubsWithPlayers.length >= 2) {
        const fromClub = clubsWithPlayers[Math.floor(Math.random() * clubsWithPlayers.length)];
        const availableToClubs = clubsWithPlayers.filter(club => club._id.toString() !== fromClub._id.toString());
        
        if (availableToClubs.length > 0 && fromClub.playerIds.length > 0) {
          const toClub = availableToClubs[Math.floor(Math.random() * availableToClubs.length)];
          
          // Pick a random player from the fromClub
          const randomPlayerId = fromClub.playerIds[Math.floor(Math.random() * fromClub.playerIds.length)];
          const randomPlayer = players.find(p => p._id.toString() === randomPlayerId);
          
          if (randomPlayer) {
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

              // Update clubs using atomic operations
              const session = await Club.startSession();
              try {
                await session.withTransaction(async () => {
                  // Update from club - remove player and add budget
                  const fromClubResult = await Club.findByIdAndUpdate(
                    fromClub._id,
                    { 
                      $inc: { budget: transferAmount },
                      $pull: { playerIds: randomPlayer._id.toString() },
                      $push: { 
                        transferHistory: {
                          playerId: randomPlayer._id.toString(),
                          type: 'OUT',
                          amount: transferAmount,
                          date: new Date()
                        }
                      }
                    },
                    { new: true, session }
                  );

                  if (!fromClubResult) {
                    throw new Error('Failed to update from club');
                  }

                  // Update to club - add player and subtract budget
                  const toClubResult = await Club.findByIdAndUpdate(
                    toClub._id,
                    { 
                      $inc: { budget: -transferAmount },
                      $addToSet: { playerIds: randomPlayer._id.toString() },
                      $push: { 
                        transferHistory: {
                          playerId: randomPlayer._id.toString(),
                          type: 'IN',
                          amount: transferAmount,
                          date: new Date()
                        }
                      }
                    },
                    { new: true, session }
                  );

                  if (!toClubResult) {
                    throw new Error('Failed to update to club');
                  }

                  results.completedTransfers.push({
                    player: randomPlayer.name,
                    from: fromClubResult.name,
                    to: toClubResult.name,
                    amount: transferAmount
                  });
                });
              } finally {
                await session.endSession();
              }
            }
          }
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