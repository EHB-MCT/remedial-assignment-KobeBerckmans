const mongoose = require('mongoose');
const User = require('../models/User');
const Club = require('../models/Club');
require('dotenv').config();

async function checkClubsExist() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Get all users with their clubIds
    const users = await User.find({});
    console.log(`Checking ${users.length} users...`);
    
    let missingClubs = 0;
    let validClubs = 0;
    
    for (const user of users) {
      if (user.clubId) {
        // Check if the club exists
        const club = await Club.findById(user.clubId);
        if (club) {
          validClubs++;
          console.log(`✅ ${user.username} -> ${club.name} (${club._id})`);
        } else {
          missingClubs++;
          console.log(`❌ ${user.username} -> Club ${user.clubId} NOT FOUND`);
        }
      } else {
        console.log(`⚠️ ${user.username} -> No clubId`);
      }
    }
    
    console.log(`\nSummary:`);
    console.log(`- Valid clubs: ${validClubs}`);
    console.log(`- Missing clubs: ${missingClubs}`);
    console.log(`- Total users: ${users.length}`);
    
    if (missingClubs > 0) {
      console.log(`\nNeed to fix ${missingClubs} users with missing clubs`);
    } else {
      console.log(`\n✅ All users have valid clubs!`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error checking clubs:', err);
    process.exit(1);
  }
}

checkClubsExist(); 