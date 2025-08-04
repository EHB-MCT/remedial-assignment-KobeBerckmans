const express = require('express');
const router = express.Router();
const Club = require('../models/Club');

// GET all clubs
router.get('/', async (req, res) => {
  try {
    const clubs = await Club.find();
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single club
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    res.json(club);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET club players
router.get('/:id/players', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Get players from MongoDB
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

    // Filter players that belong to this club
    const clubPlayers = players.filter(player => 
      club.playerIds.includes(player._id.toString())
    );

    res.json({
      club: club,
      players: clubPlayers,
      playerCount: clubPlayers.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new club
router.post('/', async (req, res) => {
  const club = new Club({
    name: req.body.name,
    budget: req.body.budget || 100000000,
    league: req.body.league || 'Premier League',
    country: req.body.country || 'England'
  });

  try {
    const newClub = await club.save();
    res.status(201).json(newClub);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update club
router.put('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    if (req.body.name) club.name = req.body.name;
    if (req.body.budget) club.budget = req.body.budget;
    if (req.body.league) club.league = req.body.league;
    if (req.body.country) club.country = req.body.country;
    if (req.body.playerIds) club.playerIds = req.body.playerIds;

    const updatedClub = await club.save();
    res.json(updatedClub);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE club
router.delete('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    await club.remove();
    res.json({ message: 'Club deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 