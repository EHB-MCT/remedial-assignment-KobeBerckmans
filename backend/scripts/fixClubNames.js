const mongoose = require('mongoose');
const Club = require('../models/Club');
require('dotenv').config();

async function fixClubNames() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find all clubs with timestamps in their names
    const clubsWithTimestamps = await Club.find({
      name: { $regex: /[0-9]{13}$/ } // Ends with 13 digits (timestamp)
    });
    
    console.log(`Found ${clubsWithTimestamps.length} clubs with timestamps to fix...`);
    
    for (const club of clubsWithTimestamps) {
      // Extract the base name (everything before the timestamp)
      let baseName = club.name.replace(/ [0-9]{13}$/, '');
      
      // Check if this name already exists
      const existingClub = await Club.findOne({ name: baseName });
      if (existingClub && existingClub._id.toString() !== club._id.toString()) {
        // Add a unique suffix to avoid duplicates
        baseName = `${baseName} (${club._id.toString().slice(-6)})`;
      }
      
      console.log(`Renaming: "${club.name}" -> "${baseName}"`);
      
      // Update the club name
      await Club.updateOne(
        { _id: club._id },
        { name: baseName }
      );
    }
    
    // Also fix any clubs that might have other timestamp formats
    const allClubs = await Club.find({});
    console.log('\nAll clubs after renaming:');
    allClubs.forEach(club => {
      console.log(`- ${club.name} (${club._id})`);
    });
    
    console.log('\n✅ Club names fixed!');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing club names:', err);
    process.exit(1);
  }
}

fixClubNames(); 