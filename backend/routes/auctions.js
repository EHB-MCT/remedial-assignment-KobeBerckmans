const express = require('express');
const router = express.Router();
const Auction = require('../models/Auction');
const Club = require('../models/Club');

// GET all active auctions
router.get('/', async (req, res) => {
  try {
    const auctions = await Auction.find({ status: 'active' })
      .populate('currentClub')
      .populate('highestBidder')
      .populate('bids.club')
      .sort({ endTime: 1 });
    
    // Filter out auctions that have actually ended
    const now = new Date();
    const validAuctions = auctions.filter(auction => {
      const hasEnded = now > auction.endTime;
      if (hasEnded && auction.status === 'active') {
        // Mark auction as ended if it has passed its end time
        auction.status = 'ended';
        auction.save().catch(err => console.error('Error updating auction status:', err));
        return false;
      }
      return true;
    });
    
    res.json(validAuctions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single auction
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('currentClub')
      .populate('highestBidder')
      .populate('bids.club');
    
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    res.json(auction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create new auction
router.post('/', async (req, res) => {
  try {
    const { playerId, playerName, currentClubId, startingPrice, buyNowPrice, durationHours = 24 } = req.body;
    
    const currentClub = await Club.findById(currentClubId);
    if (!currentClub) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check if player is already in an active auction
    const existingAuction = await Auction.findOne({
      playerId: playerId,
      status: 'active'
    });

    if (existingAuction) {
      return res.status(400).json({ message: 'Player is already listed for sale' });
    }

    const endTime = new Date();
    endTime.setHours(endTime.getHours() + durationHours);

    const auction = new Auction({
      playerId,
      playerName,
      currentClub: currentClubId,
      startingPrice,
      currentPrice: startingPrice,
      buyNowPrice,
      endTime
    });

    const savedAuction = await auction.save();
    const populatedAuction = await Auction.findById(savedAuction._id)
      .populate('currentClub')
      .populate('highestBidder');

    console.log(`✅ Created auction for ${playerName} from ${currentClub.name}`);

    res.status(201).json(populatedAuction);
  } catch (err) {
    console.error('Error creating auction:', err);
    res.status(400).json({ message: err.message });
  }
});

// POST place bid
router.post('/:id/bid', async (req, res) => {
  try {
    const { clubId, amount } = req.body;
    const auction = await Auction.findById(req.params.id);
    
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    console.log(`Bid attempt for auction ${auction._id}: status=${auction.status}, endTime=${auction.endTime}, now=${new Date()}`);
    
    if (auction.status !== 'active') {
      console.log(`Auction ${auction._id} is not active, status: ${auction.status}`);
      return res.status(400).json({ message: 'Auction is not active' });
    }

    const now = new Date();
    if (now > auction.endTime) {
      console.log(`Auction ${auction._id} has ended, endTime: ${auction.endTime}, now: ${now}`);
      return res.status(400).json({ message: 'Auction has ended' });
    }

    // Add a larger buffer to prevent race conditions (5 seconds)
    if (now > new Date(auction.endTime.getTime() + 5000)) {
      console.log(`Auction ${auction._id} ended with buffer, endTime: ${auction.endTime}, now: ${now}`);
      return res.status(400).json({ message: 'Auction has ended' });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    if (club.budget < amount) {
      return res.status(400).json({ message: 'Insufficient budget' });
    }

    if (amount <= auction.highestBid) {
      return res.status(400).json({ message: 'Bid must be higher than current highest bid' });
    }

    if (amount >= auction.buyNowPrice) {
      return res.status(400).json({ 
        message: `Bid cannot be higher than or equal to buy now price (€${auction.buyNowPrice.toLocaleString()}). Use buy now instead!` 
      });
    }

    // Use atomic operations to prevent race conditions
    const session = await Club.startSession();
    try {
      await session.withTransaction(async () => {
        // Re-check club budget in transaction
        const currentClub = await Club.findById(clubId).session(session);
        if (!currentClub) {
          throw new Error('Club not found during transaction');
        }
        
        if (currentClub.budget < amount) {
          throw new Error('Insufficient budget during transaction');
        }

        // Update club budget
        await Club.findByIdAndUpdate(
          clubId,
          { $inc: { budget: -amount } },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    // Add bid
    auction.bids.push({
      club: clubId,
      amount: amount,
      timestamp: new Date()
    });

    auction.highestBid = amount;
    auction.highestBidder = clubId;
    auction.currentPrice = amount;

    const savedAuction = await auction.save();
    const populatedAuction = await Auction.findById(savedAuction._id)
      .populate('currentClub')
      .populate('highestBidder')
      .populate('bids.club');

    res.json(populatedAuction);
  } catch (err) {
    console.error('Bid error:', err);
    res.status(400).json({ message: err.message });
  }
});

// POST buy now
router.post('/:id/buy-now', async (req, res) => {
  try {
    const { clubId } = req.body;
    const auction = await Auction.findById(req.params.id);
    
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    console.log(`Buy now attempt for auction ${auction._id}: status=${auction.status}, endTime=${auction.endTime}, now=${new Date()}`);
    
    if (auction.status !== 'active') {
      console.log(`Auction ${auction._id} is not active for buy now, status: ${auction.status}`);
      return res.status(400).json({ message: 'Auction is not active' });
    }

    // Check if auction has ended
    const now = new Date();
    if (now > auction.endTime) {
      console.log(`Auction ${auction._id} has ended for buy now, endTime: ${auction.endTime}, now: ${now}`);
      return res.status(400).json({ message: 'Auction has ended' });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    console.log(`Buy now attempt for player: ${auction.playerName}`);
    console.log(`Club budget: ${club.budget}, Buy now price: ${auction.buyNowPrice}`);
    console.log(`Budget check: ${club.budget >= auction.buyNowPrice ? 'PASS' : 'FAIL'}`);

    if (club.budget < auction.buyNowPrice) {
      return res.status(400).json({ 
        message: `Insufficient budget. You have ${club.budget} but need ${auction.buyNowPrice}` 
      });
    }

    // Get the selling club
    const sellingClub = await Club.findById(auction.currentClub);
    if (!sellingClub) {
      return res.status(404).json({ message: 'Selling club not found' });
    }

    console.log(`Processing buy now: ${club.name} buying ${auction.playerName} for ${auction.buyNowPrice}`);

    // Use atomic operations to avoid race conditions
    const session = await Club.startSession();
    try {
      await session.withTransaction(async () => {
        // Update buying club - add player and subtract budget
        const buyingClubResult = await Club.findByIdAndUpdate(
          club._id,
          { 
            $inc: { budget: -auction.buyNowPrice },
            $addToSet: { playerIds: auction.playerId }, // Use addToSet to prevent duplicates
            $push: { 
              transferHistory: {
                playerId: auction.playerId,
                type: 'IN',
                amount: auction.buyNowPrice,
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
          sellingClub._id,
          { 
            $inc: { budget: auction.buyNowPrice },
            $pull: { playerIds: auction.playerId },
            $push: { 
              transferHistory: {
                playerId: auction.playerId,
                type: 'OUT',
                amount: auction.buyNowPrice,
                date: new Date()
              }
            }
          },
          { new: true, session }
        );

        if (!sellingClubResult) {
          throw new Error('Failed to update selling club');
        }

        console.log(`Buy now successful. ${buyingClubResult.name} now has ${buyingClubResult.playerIds.length} players and ${buyingClubResult.budget} budget`);
      });
    } finally {
      await session.endSession();
    }

    // End auction and assign player
    auction.status = 'ended';
    auction.highestBid = auction.buyNowPrice;
    auction.highestBidder = clubId;
    auction.currentPrice = auction.buyNowPrice;

    // Add final bid
    auction.bids.push({
      club: clubId,
      amount: auction.buyNowPrice,
      timestamp: new Date()
    });

    const savedAuction = await auction.save();
    const populatedAuction = await Auction.findById(savedAuction._id)
      .populate('currentClub')
      .populate('highestBidder')
      .populate('bids.club');

    // Get updated club data
    const updatedClub = await Club.findById(clubId);

    // Add a special message for buy now
    const responseData = {
      ...populatedAuction.toObject(),
      buyNowMessage: `💎 ${club.name} used BUY NOW to purchase ${auction.playerName} for €${auction.buyNowPrice.toLocaleString()}!`,
      updatedClub: updatedClub
    };

    res.json(responseData);
  } catch (err) {
    console.error('Buy now error:', err);
    res.status(400).json({ message: err.message });
  }
});

// GET check auction status (for timer updates)
router.get('/:id/status', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    const now = new Date();
    const isEnded = now > auction.endTime;
    const timeLeft = Math.max(0, auction.endTime - now);

    res.json({
      status: auction.status,
      isEnded,
      timeLeft: timeLeft,
      endTime: auction.endTime
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST process ended auction
router.post('/:id/process', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    console.log(`Process attempt for auction ${auction._id}: status=${auction.status}, endTime=${auction.endTime}, now=${new Date()}`);
    
    if (auction.status !== 'active') {
      console.log(`Auction ${auction._id} is not active for processing, status: ${auction.status}`);
      return res.status(400).json({ message: 'Auction is not active' });
    }

    const now = new Date();
    if (now <= auction.endTime) {
      console.log(`Auction ${auction._id} has not ended yet, endTime: ${auction.endTime}, now: ${now}`);
      return res.status(400).json({ message: 'Auction has not ended yet' });
    }

    console.log(`Processing auction for player: ${auction.playerName}`);
    console.log(`Highest bidder: ${auction.highestBidder}`);
    console.log(`Highest bid: ${auction.highestBid}`);

    if (auction.highestBidder) {
      // Get clubs
      const buyingClub = await Club.findById(auction.highestBidder);
      const sellingClub = await Club.findById(auction.currentClub);
      
      if (!buyingClub || !sellingClub) {
        console.error('Club not found:', { buyingClub: !!buyingClub, sellingClub: !!sellingClub });
        return res.status(404).json({ message: 'Club not found' });
      }

      console.log(`Transferring player from ${sellingClub.name} to ${buyingClub.name}`);

      // Use atomic operations to avoid race conditions
      const session = await Club.startSession();
      try {
        await session.withTransaction(async () => {
          // Update buying club - add player and subtract budget
          const buyingClubResult = await Club.findByIdAndUpdate(
            buyingClub._id,
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
            sellingClub._id,
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

          console.log(`Successfully transferred player. ${buyingClubResult.name} now has ${buyingClubResult.playerIds.length} players`);
        });
      } finally {
        await session.endSession();
      }
    } else {
      console.log('No highest bidder found for this auction');
    }

    // Mark auction as ended
    auction.status = 'ended';
    await auction.save();

    res.json({ message: 'Auction processed successfully' });
  } catch (err) {
    console.error('Error processing auction:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 