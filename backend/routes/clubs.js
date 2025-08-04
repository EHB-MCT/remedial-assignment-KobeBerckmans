/**
 * Club Routes
 * 
 * This module handles all club-related API endpoints including:
 * - Club management and information
 * - Player assignments and transfers
 * - Budget management
 * - Club statistics and data
 * 
 * @author Kobe Berckmans
 * @version 1.0.0
 * @license MIT
 */

const express = require('express');
const router = express.Router();
const Club = require('../models/Club');

/**
 * GET /api/clubs
 * Retrieves all clubs with their basic information
 * 
 * @route GET /api/clubs
 * @returns {Array} Array of club objects
 * @throws {500} Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const clubs = await Club.find({}).sort({ name: 1 });
    res.json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ message: 'Error fetching clubs' });
  }
});

/**
 * GET /api/clubs/:id
 * Retrieves a specific club by ID with detailed information
 * 
 * @route GET /api/clubs/:id
 * @param {string} id - Club ID
 * @returns {Object} Club object with detailed information
 * @throws {404} Club not found
 * @throws {500} Internal server error
 */
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    res.json(club);
  } catch (error) {
    console.error('Error fetching club:', error);
    res.status(500).json({ message: 'Error fetching club' });
  }
});

/**
 * GET /api/clubs/:id/players
 * Retrieves a specific club's players by filtering from the main player collection
 * 
 * @route GET /api/clubs/:id/players
 * @param {string} id - Club ID
 * @returns {Object} Club object with associated players
 * @throws {404} Club not found
 * @throws {500} Internal server error
 */
router.get('/:id/players', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Fetch players from the main Players collection
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    
    await client.connect();
    const database = client.db();
    const players = await database.collection('Players')
      .find({ _id: { $in: club.playerIds.map(id => new require('mongodb').ObjectId(id)) } })
      .toArray();
    
    await client.close();

    res.json({
      club: club,
      players: players
    });
  } catch (error) {
    console.error('Error fetching club players:', error);
    res.status(500).json({ message: 'Error fetching club players' });
  }
});

/**
 * PUT /api/clubs/:id
 * Updates a club's information
 * 
 * @route PUT /api/clubs/:id
 * @param {string} id - Club ID
 * @param {Object} updateData - Club data to update
 * @returns {Object} Updated club object
 * @throws {404} Club not found
 * @throws {400} Invalid update data
 * @throws {500} Internal server error
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, budget, league, country } = req.body;
    
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Update club fields if provided
    if (name !== undefined) club.name = name;
    if (budget !== undefined) club.budget = budget;
    if (league !== undefined) club.league = league;
    if (country !== undefined) club.country = country;

    const updatedClub = await club.save();
    
    res.json(updatedClub);
  } catch (error) {
    console.error('Error updating club:', error);
    res.status(500).json({ message: 'Error updating club' });
  }
});

module.exports = router; 