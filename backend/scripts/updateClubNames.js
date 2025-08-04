const mongoose = require('mongoose');
const Club = require('../models/Club');
require('dotenv').config();

async function updateClubNames() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Update specific club names
    const updates = [
      { username: 'Mourinho', newName: 'Avenir' },
      { username: 'Jean', newName: 'Jean FC' },
      // Add more specific updates as needed
    ];
    
    console.log('Updating specific club names...');
    
    for (const update of updates) {
      // Find the club by looking for the user's club
      const club = await Club.findOne({
        name: { $regex: new RegExp(`${update.username}'s Club`, 'i') }
      });
      
      if (club) {
        console.log(`Updating: "${club.name}" -> "${update.newName}"`);
        
        await Club.updateOne(
          { _id: club._id },
          { name: update.newName }
        );
      } else {
        console.log(`❌ Club not found for user: ${update.username}`);
      }
    }
    
    // Show all clubs after update
    const allClubs = await Club.find({});
    console.log('\nAll clubs after updates:');
    allClubs.forEach(club => {
      console.log(`- ${club.name} (${club._id})`);
    });
    
    console.log('\n✅ Club names updated!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating club names:', err);
    process.exit(1);
  }
}

updateClubNames(); 