const mongoose = require('mongoose');
const User = require('../models/User');
const Club = require('../models/Club');
require('dotenv').config();

async function fixUsersWithoutClubs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find users without clubs
    const usersWithoutClubs = await User.find({ clubId: { $exists: false } });
    console.log(`Found ${usersWithoutClubs.length} users without clubs`);
    
    for (const user of usersWithoutClubs) {
      console.log(`Fixing user: ${user.username}`);
      
      // Create a new club for this user with unique name
      const timestamp = Date.now();
      const newClub = new Club({
        name: `${user.username}'s Club ${timestamp}`,
        budget: 500000000,
        league: 'User League',
        country: 'User Country',
        playerIds: []
      });
      
      const savedClub = await newClub.save();
      console.log(`Created club: ${savedClub.name} (${savedClub._id})`);
      
      // Update user with club reference (skip validation)
      await User.updateOne(
        { _id: user._id },
        { clubId: savedClub._id }
      );
      console.log(`Updated user ${user.username} with club ${savedClub.name}`);
    }
    
    // Also check for users with null clubId
    const usersWithNullClub = await User.find({ clubId: null });
    console.log(`Found ${usersWithNullClub.length} users with null clubId`);
    
    for (const user of usersWithNullClub) {
      console.log(`Fixing user with null clubId: ${user.username}`);
      
      // Create a new club for this user with unique name
      const timestamp = Date.now();
      const newClub = new Club({
        name: `${user.username}'s Club ${timestamp}`,
        budget: 500000000,
        league: 'User League',
        country: 'User Country',
        playerIds: []
      });
      
      const savedClub = await newClub.save();
      console.log(`Created club: ${savedClub.name} (${savedClub._id})`);
      
      // Update user with club reference (skip validation)
      await User.updateOne(
        { _id: user._id },
        { clubId: savedClub._id }
      );
      console.log(`Updated user ${user.username} with club ${savedClub.name}`);
    }
    
    console.log('✅ All users without clubs have been fixed!');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing users without clubs:', err);
    process.exit(1);
  }
}

fixUsersWithoutClubs(); 