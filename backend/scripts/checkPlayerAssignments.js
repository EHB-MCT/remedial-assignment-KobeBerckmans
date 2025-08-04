const mongoose = require('mongoose');
const Club = require('../models/Club');
const Auction = require('../models/Auction');
const { MongoClient, ServerApiVersion } = require('mongodb');

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI;
mongoose.connect(mongoUri);

async function checkPlayerAssignments() {
  try {
    console.log('🔍 Checking player assignments...');
    
    // Get all clubs
    const clubs = await Club.find();
    console.log(`📋 Found ${clubs.length} clubs`);
    
    // Get all players
    const client = new MongoClient(mongoUri, {
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
    
    console.log(`👥 Found ${players.length} players in database`);
    
    // Check each club
    for (const club of clubs) {
      console.log(`\n🏟️ Club: ${club.name}`);
      console.log(`💰 Budget: €${club.budget.toLocaleString()}`);
      console.log(`📝 Player IDs in club: ${club.playerIds.length}`);
      
      if (club.playerIds.length > 0) {
        console.log(`🎯 Player IDs: ${club.playerIds.slice(0, 5).join(', ')}${club.playerIds.length > 5 ? '...' : ''}`);
        
        // Check if players actually exist
        const existingPlayers = [];
        const missingPlayers = [];
        
        for (const playerId of club.playerIds) {
          const player = players.find(p => p._id.toString() === playerId);
          if (player) {
            existingPlayers.push(player.name);
          } else {
            missingPlayers.push(playerId);
          }
        }
        
        console.log(`✅ Existing players: ${existingPlayers.join(', ')}`);
        if (missingPlayers.length > 0) {
          console.log(`❌ Missing players: ${missingPlayers.join(', ')}`);
        }
      }
      
      // Check transfer history
      if (club.transferHistory && club.transferHistory.length > 0) {
        console.log(`📊 Recent transfers: ${club.transferHistory.length} total`);
        const recentTransfers = club.transferHistory.slice(-3);
        for (const transfer of recentTransfers) {
          const type = transfer.type === 'IN' ? '🟢' : '🔴';
          console.log(`  ${type} ${transfer.type}: €${transfer.amount.toLocaleString()} (${new Date(transfer.date).toLocaleDateString()})`);
        }
      }
    }
    
    // Check active auctions
    const activeAuctions = await Auction.find({ status: 'active' });
    console.log(`\n🏷️ Active auctions: ${activeAuctions.length}`);
    
    for (const auction of activeAuctions) {
      console.log(`  📦 ${auction.playerName} - Current bid: €${auction.highestBid.toLocaleString()}`);
    }
    
    console.log('\n✅ Player assignment check completed');
    
  } catch (error) {
    console.error('❌ Error checking player assignments:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the check
checkPlayerAssignments(); 