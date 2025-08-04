 const axios = require('axios');

// AI clubs that will automatically bid (updated with new club IDs and 500M budget)
const AI_CLUBS = [
  { id: '688b7a69b6517d2d0f319e3d', name: 'Manchester City', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e3e', name: 'Real Madrid', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e3f', name: 'Bayern Munich', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e40', name: 'Paris Saint-Germain', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e41', name: 'Liverpool', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e42', name: 'Barcelona', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e43', name: 'Manchester United', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e44', name: 'Chelsea', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e45', name: 'Arsenal', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e46', name: 'Tottenham Hotspur', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e47', name: 'Atletico Madrid', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e48', name: 'Sevilla', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e49', name: 'Borussia Dortmund', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e4a', name: 'RB Leipzig', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e4b', name: 'Bayer Leverkusen', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e4c', name: 'AC Milan', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e4d', name: 'Inter Milan', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e4e', name: 'Juventus', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e4f', name: 'Napoli', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e50', name: 'AS Roma', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e51', name: 'Marseille', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e52', name: 'Lyon', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e53', name: 'Monaco', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e54', name: 'Porto', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e55', name: 'Benfica', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e56', name: 'Ajax', budget: 500000000 },
  { id: '688b7a69b6517d2d0f319e57', name: 'PSV Eindhoven', budget: 500000000 }
];

// Function to place a bid
async function placeBid(auctionId, clubId, amount) {
  try {
    console.log(`🎯 Attempting to place bid: €${amount.toLocaleString()} by club ${clubId} on auction ${auctionId}`);
    const response = await axios.post(`http://localhost:3000/api/auctions/${auctionId}/bid`, {
      clubId: clubId,
      amount: amount
    });
    console.log(`✅ ${response.data.highestBidder.name} bid €${amount.toLocaleString()} on ${response.data.playerName}`);
    return response.data;
  } catch (error) {
    console.log(`❌ Bid failed: ${error.response?.data?.message || 'Unknown error'}`);
    console.log(`❌ Error details:`, error.response?.data);
    return null;
  }
}

// Function to buy now
async function buyNow(auctionId, clubId) {
  try {
    const response = await axios.post(`http://localhost:3000/api/auctions/${auctionId}/buy-now`, {
      clubId: clubId
    });
    console.log(`💰 ${response.data.highestBidder.name} bought ${response.data.playerName} for €${response.data.buyNowPrice.toLocaleString()}`);
    return response.data;
  } catch (error) {
    console.log(`❌ Buy now failed: ${error.response?.data?.message || 'Unknown error'}`);
    return null;
  }
}

// Function to get current club budgets
async function getClubBudgets() {
  try {
    const response = await axios.get('http://localhost:3000/api/clubs');
    const clubs = response.data;
    return clubs.reduce((acc, club) => {
      acc[club._id] = club.budget;
      return acc;
    }, {});
  } catch (error) {
    console.error('Failed to get club budgets:', error);
    return {};
  }
}

// Main function to process auctions
async function processAuctions() {
  try {
    console.log('🤖 AI Auto-Bidder starting...');
    
    // Get current auctions
    const auctionsResponse = await axios.get('http://localhost:3000/api/auctions');
    const auctions = auctionsResponse.data.filter(auction => auction.status === 'active');
    
    if (auctions.length === 0) {
      console.log('📭 No active auctions found');
      return;
    }
    
    console.log(`📋 Found ${auctions.length} active auctions`);
    
    // Get current club budgets
    const clubBudgets = await getClubBudgets();
    
    // Process each auction individually to avoid race conditions
    for (const auction of auctions) {
      try {
        console.log(`\n🎯 Processing auction for ${auction.playerName}`);
        console.log(`💰 Current price: €${auction.currentPrice.toLocaleString()}`);
        
        // Re-fetch auction to get latest status
        const currentAuctionResponse = await axios.get(`http://localhost:3000/api/auctions/${auction._id}`);
        const currentAuction = currentAuctionResponse.data;
        
        // Check if auction is still active
        if (currentAuction.status !== 'active') {
          console.log(`⏰ Auction ${auction.playerName} is no longer active (${currentAuction.status})`);
          continue;
        }
        
        // Check if auction has ended
        const timeLeft = new Date(currentAuction.endTime) - new Date();
        console.log(`⏰ Time left: ${Math.floor(timeLeft / 1000)} seconds`);
        
        if (timeLeft <= 0) {
          console.log('⏰ Auction has ended, processing...');
          try {
            const processResponse = await axios.post(`http://localhost:3000/api/auctions/${currentAuction._id}/process`);
            console.log('✅ Auction processed:', processResponse.data);
          } catch (error) {
            console.log('❌ Failed to process auction:', error.response?.data?.message);
            // If auction is already ended, mark it as ended to avoid future processing
            if (error.response?.status === 400 && error.response?.data?.message === 'Auction is not active') {
              console.log('🔄 Auction already ended, skipping...');
            }
          }
          continue;
        }
        
        // Process AI clubs for this auction
        const processedClubs = new Set(); // Track which clubs have already processed this auction
        
        for (const aiClub of AI_CLUBS) {
          try {
            // Skip if this club already processed this auction
            if (processedClubs.has(aiClub.id)) {
              continue;
            }
            
            const currentBudget = clubBudgets[aiClub.id] || aiClub.budget;
            
            console.log(`\n🤖 ${aiClub.name} (Budget: €${currentBudget.toLocaleString()})`);
            
            // Check if club can afford the minimum bid
            const minBid = currentAuction.highestBid > 0 ? currentAuction.highestBid : currentAuction.startingPrice;
            console.log(`💰 Minimum bid needed: €${minBid.toLocaleString()}`);
            
            if (currentBudget < minBid) {
              console.log(`💸 ${aiClub.name} can't afford minimum bid`);
              continue;
            }
            
            // 20% chance to bid (much lower to make auctions last longer)
            const bidChance = Math.random();
            console.log(`🎲 ${aiClub.name} bid chance: ${(bidChance * 100).toFixed(1)}%`);
            
            if (bidChance < 0.20) {
              // Calculate bid amount - if no bids yet, start from starting price
              const maxBid = Math.min(
                Math.floor(minBid * (1 + Math.random() * 0.15)), // 0-15% increase (smaller increases)
                currentAuction.buyNowPrice - 1 // Stay below buy now price
              );
              
              console.log(`💡 ${aiClub.name} calculated bid: €${maxBid.toLocaleString()}`);
              
              if (maxBid > minBid && maxBid <= currentBudget) {
                console.log(`🎲 ${aiClub.name} decides to bid €${maxBid.toLocaleString()}`);
                const result = await placeBid(currentAuction._id, aiClub.id, maxBid);
                if (result) {
                  console.log(`✅ ${aiClub.name} bid successful!`);
                  clubBudgets[aiClub.id] = result.highestBidder.budget;
                  processedClubs.add(aiClub.id); // Mark as processed
                } else {
                  console.log(`❌ ${aiClub.name} bid failed`);
                }
              } else {
                console.log(`💸 ${aiClub.name} can't afford calculated bid or bid too low`);
              }
            }
            
            // 5% chance to buy now (very rare to avoid abrupt auction endings)
            const buyNowChance = Math.random();
            console.log(`💎 ${aiClub.name} buy now chance: ${(buyNowChance * 100).toFixed(1)}%`);
            
            if (buyNowChance < 0.05 && currentBudget >= currentAuction.buyNowPrice) {
              console.log(`💎 ${aiClub.name} decides to BUY NOW for €${currentAuction.buyNowPrice.toLocaleString()}!`);
              const result = await buyNow(currentAuction._id, aiClub.id);
              if (result) {
                console.log(`✅ ${aiClub.name} successfully bought ${currentAuction.playerName} for €${currentAuction.buyNowPrice.toLocaleString()}`);
                clubBudgets[aiClub.id] = result.highestBidder.budget;
                processedClubs.add(aiClub.id); // Mark as processed
                break; // Stop processing this auction since it's been bought
              } else {
                console.log(`❌ ${aiClub.name} buy now failed`);
              }
            }
            
            // Mark this club as processed for this auction
            processedClubs.add(aiClub.id);
            
          } catch (error) {
            console.error(`❌ Error with AI club ${aiClub.name}:`, error.message);
            // Continue with next AI club
          }
        }
        
        // Add a small delay between auctions to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error processing auction ${auction.playerName}:`, error.message);
        // Continue with next auction
      }
    }
    
    console.log('\n✅ Auto-bidder finished processing');
    
  } catch (error) {
    console.error('❌ Auto-bidder error:', error);
    // Don't throw error to prevent script from stopping
  }
}

// Run the auto-bidder every 30 seconds
console.log('🤖 Starting AI Auto-Bidder...');
processAuctions();

setInterval(processAuctions, 30000); // Every 30 seconds for slower bidding 