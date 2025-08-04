const axios = require('axios');

// Function to clear any stuck auctions
async function clearStuckAuctions() {
  try {
    console.log('🧹 Clearing stuck auctions...');
    
    // Get all auctions
    const auctionsResponse = await axios.get('http://localhost:3000/api/auctions');
    const auctions = auctionsResponse.data;
    
    console.log(`📋 Found ${auctions.length} total auctions`);
    
    // Check for auctions that should be ended but aren't
    const now = new Date();
    const stuckAuctions = auctions.filter(auction => 
      auction.status === 'active' && new Date(auction.endTime) < now
    );
    
    console.log(`🔍 Found ${stuckAuctions.length} stuck auctions`);
    
    for (const auction of stuckAuctions) {
      console.log(`⏰ Processing stuck auction: ${auction.playerName}`);
      try {
        const processResponse = await axios.post(`http://localhost:3000/api/auctions/${auction._id}/process`);
        console.log(`✅ Processed stuck auction: ${auction.playerName}`);
      } catch (error) {
        console.log(`❌ Failed to process stuck auction ${auction.playerName}:`, error.response?.data?.message);
      }
    }
    
    console.log('✅ Stuck auctions cleared');
    
  } catch (error) {
    console.error('❌ Error clearing stuck auctions:', error);
  }
}

// Function to reset AI club budgets
async function resetAIBudgets() {
  try {
    console.log('💰 Resetting AI club budgets...');
    
    // AI club IDs
    const aiClubIds = [
      '688b7a69b6517d2d0f319e3d', '688b7a69b6517d2d0f319e3e', '688b7a69b6517d2d0f319e3f',
      '688b7a69b6517d2d0f319e40', '688b7a69b6517d2d0f319e41', '688b7a69b6517d2d0f319e42',
      '688b7a69b6517d2d0f319e43', '688b7a69b6517d2d0f319e44', '688b7a69b6517d2d0f319e45',
      '688b7a69b6517d2d0f319e46', '688b7a69b6517d2d0f319e47', '688b7a69b6517d2d0f319e48',
      '688b7a69b6517d2d0f319e49', '688b7a69b6517d2d0f319e4a', '688b7a69b6517d2d0f319e4b',
      '688b7a69b6517d2d0f319e4c', '688b7a69b6517d2d0f319e4d', '688b7a69b6517d2d0f319e4e',
      '688b7a69b6517d2d0f319e4f', '688b7a69b6517d2d0f319e50', '688b7a69b6517d2d0f319e51',
      '688b7a69b6517d2d0f319e52', '688b7a69b6517d2d0f319e53', '688b7a69b6517d2d0f319e54',
      '688b7a69b6517d2d0f319e55', '688b7a69b6517d2d0f319e56', '688b7a69b6517d2d0f319e57'
    ];
    
    for (const clubId of aiClubIds) {
      try {
        await axios.put(`http://localhost:3000/api/clubs/${clubId}`, {
          budget: 500000000 // Reset to 500M
        });
        console.log(`✅ Reset budget for club ${clubId}`);
      } catch (error) {
        console.log(`❌ Failed to reset budget for club ${clubId}:`, error.response?.data?.message);
      }
    }
    
    console.log('✅ AI club budgets reset');
    
  } catch (error) {
    console.error('❌ Error resetting AI budgets:', error);
  }
}

// Main function
async function restartAutoBidder() {
  try {
    console.log('🔄 Restarting Auto-Bidder...');
    
    // Step 1: Clear stuck auctions
    await clearStuckAuctions();
    
    // Step 2: Reset AI budgets
    await resetAIBudgets();
    
    console.log('✅ Auto-Bidder restart completed');
    console.log('💡 The autoBidder script should now run more smoothly');
    
  } catch (error) {
    console.error('❌ Error restarting auto-bidder:', error);
  }
}

// Run the restart
restartAutoBidder(); 