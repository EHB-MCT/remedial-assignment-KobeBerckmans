const mongoose = require('mongoose');
const User = require('../models/User');
const Club = require('../models/Club');
require('dotenv').config();

async function fixSpecificUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find the specific users with missing clubs
    const mourinho = await User.findOne({ username: 'Mourinho' });
    const jean = await User.findOne({ username: 'Jean' });
    
    console.log('Fixing specific users with missing clubs...');
    
    if (mourinho) {
      console.log(`Fixing Mourinho (${mourinho._id})`);
      
      // Create new club for Mourinho
      const mourinhoClub = new Club({
        name: `Mourinho's Club ${Date.now()}`,
        budget: 500000000,
        league: 'User League',
        country: 'User Country',
        playerIds: []
      });
      
      const savedMourinhoClub = await mourinhoClub.save();
      console.log(`Created club: ${savedMourinhoClub.name} (${savedMourinhoClub._id})`);
      
      // Update Mourinho's clubId
      await User.updateOne(
        { _id: mourinho._id },
        { clubId: savedMourinhoClub._id }
      );
      console.log(`Updated Mourinho with club ${savedMourinhoClub.name}`);
    }
    
    if (jean) {
      console.log(`Fixing Jean (${jean._id})`);
      
      // Create new club for Jean
      const jeanClub = new Club({
        name: `Jean's Club ${Date.now()}`,
        budget: 500000000,
        league: 'User League',
        country: 'User Country',
        playerIds: []
      });
      
      const savedJeanClub = await jeanClub.save();
      console.log(`Created club: ${savedJeanClub.name} (${savedJeanClub._id})`);
      
      // Update Jean's clubId
      await User.updateOne(
        { _id: jean._id },
        { clubId: savedJeanClub._id }
      );
      console.log(`Updated Jean with club ${savedJeanClub.name}`);
    }
    
    console.log('✅ Specific users fixed!');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing specific users:', err);
    process.exit(1);
  }
}

fixSpecificUsers(); 