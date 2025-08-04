const mongoose = require('mongoose');
const Club = require('../models/Club');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config({ path: __dirname + '/../.env' });

const uri = process.env.MONGODB_URI;

async function assignPlayersToClubs() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Get all clubs
    const clubs = await Club.find();
    console.log(`Found ${clubs.length} clubs`);

    // Get all players
    const client = new MongoClient(uri, {
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

    console.log(`Found ${players.length} players`);

    // Clear all playerIds from clubs
    for (const club of clubs) {
      club.playerIds = [];
      await club.save();
    }

    // Assign players to clubs based on their club name
    for (const player of players) {
      const club = clubs.find(c => c.name === player.club);
      if (club) {
        club.playerIds.push(player._id.toString());
        await club.save();
        console.log(`✅ Assigned ${player.name} to ${club.name}`);
      } else {
        console.log(`⚠️ No club found for ${player.name} (club: ${player.club})`);
      }
    }

    // Show final distribution
    console.log('\n📊 Final player distribution:');
    for (const club of clubs) {
      console.log(`${club.name}: ${club.playerIds.length} players`);
    }

    console.log('\n🎉 Players assigned to clubs successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error assigning players to clubs:', err);
    process.exit(1);
  }
}

assignPlayersToClubs(); 