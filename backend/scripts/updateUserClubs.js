const mongoose = require('mongoose');
const Club = require('../models/Club');
require('dotenv').config({ path: __dirname + '/../.env' });

const uri = process.env.MONGODB_URI;

async function updateUserClubs() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Find all clubs that are user clubs (not the seeded AI clubs)
    const userClubs = await Club.find({
      league: 'User League'
    });

    console.log(`Found ${userClubs.length} user clubs to update`);

    // Update each user club to have 500M budget
    for (const club of userClubs) {
      club.budget = 500000000;
      await club.save();
      console.log(`✅ Updated ${club.name} budget to €500,000,000`);
    }

    console.log('🎉 All user clubs updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating user clubs:', err);
    process.exit(1);
  }
}

updateUserClubs(); 