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

module.exports = router; 