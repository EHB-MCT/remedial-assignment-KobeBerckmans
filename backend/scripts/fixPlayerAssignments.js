const mongoose = require('mongoose');
const Club = require('../models/Club');
const Auction = require('../models/Auction');
const { MongoClient, ServerApiVersion } = require('mongodb');

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI;
mongoose.connect(mongoUri);

async function fixPlayerAssignments() {
  try {
    console.log('🔧 Fixing player assignments...');
    
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
    
    // Create a map of player IDs to player names for easier lookup
    const playerMap = new Map();
    players.forEach(player => {
      playerMap.set(player._id.toString(), player.name);
    });
    
    // Check and fix each club
    for (const club of clubs) {
      console.log(`\n🏟️ Processing club: ${club.name}`);
      
      const originalPlayerCount = club.playerIds.length;
      const validPlayerIds = [];
      const invalidPlayerIds = [];
      
      // Check each player ID
      for (const playerId of club.playerIds) {
        if (playerMap.has(playerId)) {
          validPlayerIds.push(playerId);
        } else {
          invalidPlayerIds.push(playerId);
          console.log(`❌ Invalid player ID found: ${playerId}`);
        }
      }
      
      // Remove invalid player IDs
      if (invalidPlayerIds.length > 0) {
        console.log(`🧹 Removing ${invalidPlayerIds.length} invalid player IDs from ${club.name}`);
        
        const session = await Club.startSession();
        try {
          await session.withTransaction(async () => {
            await Club.findByIdAndUpdate(
              club._id,
              { 
                $pull: { playerIds: { $in: invalidPlayerIds } }
              },
              { session }
            );
          });
        } finally {
          await session.endSession();
        }
      }
      
      // Remove duplicate player IDs
      const uniquePlayerIds = [...new Set(validPlayerIds)];
      if (uniquePlayerIds.length !== validPlayerIds.length) {
        console.log(`🔄 Removing ${validPlayerIds.length - uniquePlayerIds.length} duplicate player IDs from ${club.name}`);
        
        const session = await Club.startSession();
        try {
          await session.withTransaction(async () => {
            await Club.findByIdAndUpdate(
              club._id,
              { playerIds: uniquePlayerIds },
              { session }
            );
          });
        } finally {
          await session.endSession();
        }
      }
      
      // Get updated club data
      const updatedClub = await Club.findById(club._id);
      console.log(`✅ ${club.name}: ${originalPlayerCount} → ${updatedClub.playerIds.length} players`);
      
      if (updatedClub.playerIds.length > 0) {
        const playerNames = updatedClub.playerIds.map(id => playerMap.get(id)).filter(Boolean);
        console.log(`📝 Players: ${playerNames.join(', ')}`);
      }
    }
    
    // Check for players that might be in multiple clubs
    console.log('\n🔍 Checking for duplicate player assignments...');
    const allPlayerIds = [];
    const allClubs = await Club.find();
    
    for (const club of allClubs) {
      allPlayerIds.push(...club.playerIds);
    }
    
    const duplicatePlayerIds = allPlayerIds.filter((id, index) => allPlayerIds.indexOf(id) !== index);
    const uniqueDuplicates = [...new Set(duplicatePlayerIds)];
    
    if (uniqueDuplicates.length > 0) {
      console.log(`⚠️ Found ${uniqueDuplicates.length} players assigned to multiple clubs:`);
      for (const playerId of uniqueDuplicates) {
        const playerName = playerMap.get(playerId) || 'Unknown';
        const clubsWithPlayer = allClubs.filter(club => club.playerIds.includes(playerId));
        console.log(`  ${playerName} (${playerId}): ${clubsWithPlayer.map(c => c.name).join(', ')}`);
      }
    } else {
      console.log('✅ No duplicate player assignments found');
    }
    
    // Check active auctions for consistency
    console.log('\n🏷️ Checking active auctions...');
    const activeAuctions = await Auction.find({ status: 'active' });
    
    for (const auction of activeAuctions) {
      const playerName = playerMap.get(auction.playerId) || 'Unknown';
      const sellingClub = allClubs.find(c => c._id.toString() === auction.currentClub.toString());
      
      if (!sellingClub) {
        console.log(`❌ Auction for ${playerName}: Selling club not found`);
        continue;
      }
      
      if (!sellingClub.playerIds.includes(auction.playerId)) {
        console.log(`❌ Auction for ${playerName}: Player not in selling club ${sellingClub.name}`);
      } else {
        console.log(`✅ Auction for ${playerName}: Player correctly in ${sellingClub.name}`);
      }
    }
    
    console.log('\n✅ Player assignment fix completed');
    
  } catch (error) {
    console.error('❌ Error fixing player assignments:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the fix
fixPlayerAssignments(); 