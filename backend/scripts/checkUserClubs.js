const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function checkUserClubs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find all users
    const allUsers = await User.find({});
    console.log(`Total users: ${allUsers.length}`);
    
    // Check users without clubs
    const usersWithoutClubs = await User.find({ clubId: { $exists: false } });
    console.log(`Users without clubId field: ${usersWithoutClubs.length}`);
    
    // Check users with null clubId
    const usersWithNullClub = await User.find({ clubId: null });
    console.log(`Users with null clubId: ${usersWithNullClub.length}`);
    
    // Check users with invalid clubId (not an ObjectId)
    const usersWithInvalidClub = await User.find({
      clubId: { $exists: true, $ne: null },
      $expr: { $not: { $regexMatch: { input: { $toString: "$clubId" }, regex: "^[0-9a-fA-F]{24}$" } } }
    });
    console.log(`Users with invalid clubId format: ${usersWithInvalidClub.length}`);
    
    // Show details for problematic users
    if (usersWithoutClubs.length > 0) {
      console.log('\nUsers without clubId field:');
      usersWithoutClubs.forEach(user => {
        console.log(`- ${user.username} (${user._id})`);
      });
    }
    
    if (usersWithNullClub.length > 0) {
      console.log('\nUsers with null clubId:');
      usersWithNullClub.forEach(user => {
        console.log(`- ${user.username} (${user._id})`);
      });
    }
    
    if (usersWithInvalidClub.length > 0) {
      console.log('\nUsers with invalid clubId format:');
      usersWithInvalidClub.forEach(user => {
        console.log(`- ${user.username} (${user._id}) - clubId: ${user.clubId}`);
      });
    }
    
    // Show some valid users as examples
    const validUsers = await User.find({
      clubId: { $exists: true, $ne: null },
      $expr: { $regexMatch: { input: { $toString: "$clubId" }, regex: "^[0-9a-fA-F]{24}$" } }
    }).limit(5);
    
    if (validUsers.length > 0) {
      console.log('\nValid users (first 5):');
      validUsers.forEach(user => {
        console.log(`- ${user.username} (${user._id}) - clubId: ${user.clubId}`);
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error checking user clubs:', err);
    process.exit(1);
  }
}

checkUserClubs(); 