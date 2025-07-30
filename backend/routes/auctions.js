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
    res.json(auctions);
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

    res.status(201).json(populatedAuction);
  } catch (err) {
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

    if (auction.status !== 'active') {
      return res.status(400).json({ message: 'Auction is not active' });
    }

    if (new Date() > auction.endTime) {
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

    if (auction.status !== 'active') {
      return res.status(400).json({ message: 'Auction is not active' });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    if (club.budget < auction.buyNowPrice) {
      return res.status(400).json({ message: 'Insufficient budget for buy now price' });
    }

    // Get the selling club
    const sellingClub = await Club.findById(auction.currentClub);
    if (!sellingClub) {
      return res.status(404).json({ message: 'Selling club not found' });
    }

    // Update club budgets and player lists
    club.budget -= auction.buyNowPrice;
    club.playerIds.push(auction.playerId);
    
    // Add transfer history for buying club
    club.transferHistory.push({
      playerId: auction.playerId,
      type: 'IN',
      amount: auction.buyNowPrice,
      date: new Date()
    });

    // Remove player from selling club and add money
    sellingClub.budget += auction.buyNowPrice;
    sellingClub.playerIds = sellingClub.playerIds.filter(id => id !== auction.playerId);
    
    // Add transfer history for selling club
    sellingClub.transferHistory.push({
      playerId: auction.playerId,
      type: 'OUT',
      amount: auction.buyNowPrice,
      date: new Date()
    });

    // Save both clubs
    await club.save();
    await sellingClub.save();

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

    res.json(populatedAuction);
  } catch (err) {
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

    if (auction.status !== 'active') {
      return res.status(400).json({ message: 'Auction is not active' });
    }

    const now = new Date();
    if (now <= auction.endTime) {
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

      // Update club budgets and player lists
      buyingClub.budget -= auction.highestBid;
      buyingClub.playerIds.push(auction.playerId);
      
      // Add transfer history for buying club
      buyingClub.transferHistory.push({
        playerId: auction.playerId,
        type: 'IN',
        amount: auction.highestBid,
        date: new Date()
      });

      // Remove player from selling club and add money
      sellingClub.budget += auction.highestBid;
      sellingClub.playerIds = sellingClub.playerIds.filter(id => id !== auction.playerId);
      
      // Add transfer history for selling club
      sellingClub.transferHistory.push({
        playerId: auction.playerId,
        type: 'OUT',
        amount: auction.highestBid,
        date: new Date()
      });

      // Save both clubs
      await buyingClub.save();
      await sellingClub.save();

      console.log(`Successfully transferred player. ${buyingClub.name} now has ${buyingClub.playerIds.length} players`);
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