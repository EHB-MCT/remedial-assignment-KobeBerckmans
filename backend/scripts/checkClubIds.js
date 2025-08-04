const mongoose = require('mongoose');
const Club = require('../models/Club');
require('dotenv').config();

async function checkClubIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const clubs = await Club.find();
    
    console.log('Current club IDs:');
    clubs.forEach(club => {
      console.log(`${club.name}: ${club._id}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkClubIds(); 