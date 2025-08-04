import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyClub.css';

function MyClub({ user, club, onClubUpdate }) {
  const [userClub, setUserClub] = useState(null);
  const [clubPlayers, setClubPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [sellPrice, setSellPrice] = useState('');
  const [buyNowPrice, setBuyNowPrice] = useState('');

  useEffect(() => {
    if (club) {
      fetchUserClub();
    }
  }, [club, onClubUpdate]);

  const fetchUserClub = async () => {
    try {
      console.log('🔍 Fetching user club data...');
      console.log('Club prop:', club);
      
      // Always fetch the most recent club data
      const clubResponse = await axios.get(`http://localhost:3000/api/clubs/${club._id}`);
      const currentClub = clubResponse.data;
      console.log('📊 Current club data:', currentClub);
      setUserClub(currentClub);
      
      if (currentClub.playerIds && currentClub.playerIds.length > 0) {
        console.log('👥 Club has players:', currentClub.playerIds);
        const playersResponse = await axios.get('http://localhost:3000/api/players');
        const allPlayers = playersResponse.data;
        console.log('📋 Total players in database:', allPlayers.length);
        
        const clubPlayerIds = currentClub.playerIds.map(id => id.toString());
        console.log('🎯 Looking for player IDs:', clubPlayerIds);
        
        const players = allPlayers.filter(player => {
          const playerId = player._id.toString();
          const isInClub = clubPlayerIds.includes(playerId);
          if (isInClub) {
            console.log('✅ Found player in club:', player.name, playerId);
          }
          return isInClub;
        });
        
        console.log('🎉 Found club players:', players.length);
        console.log('📝 Club players:', players.map(p => p.name));
        setClubPlayers(players);
      } else {
        console.log('❌ Club has no players');
        setClubPlayers([]);
      }
      setLoading(false);
      
      // Update parent component if onClubUpdate is provided
      if (onClubUpdate && currentClub) {
        onClubUpdate(currentClub);
      }
    } catch (error) {
      console.error('❌ Failed to fetch user club:', error);
      setLoading(false);
      // Retry after a short delay if it's a network error
      if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
        setTimeout(() => {
          console.log('🔄 Retrying club fetch...');
          fetchUserClub();
        }, 2000);
      }
    }
  };

  const openSellModal = (player) => {
    console.log('🎯 Opening sell modal for player:', player);
    setSelectedPlayer(player);
    
    // Calculate suggested prices based on player stats
    const basePrice = 5000000; // 5M base
    const goalsValue = player.goals * 200000; // 200k per goal
    const assistsValue = player.assists * 150000; // 150k per assist
    const appearancesValue = player.appearances * 50000; // 50k per appearance
    const suggestedPrice = basePrice + goalsValue + assistsValue + appearancesValue;
    
    const sellPriceValue = Math.floor(suggestedPrice * 0.8);
    const buyNowPriceValue = suggestedPrice;
    
    console.log('💰 Calculated prices:', { sellPriceValue, buyNowPriceValue });
    
    setSellPrice(sellPriceValue.toString());
    setBuyNowPrice(buyNowPriceValue.toString());
    setShowSellModal(true);
    
    console.log('✅ Modal should be open now');
  };

  const confirmSell = async () => {
    console.log('🎯 Confirm sell called');
    console.log('Selected player:', selectedPlayer);
    console.log('Sell price:', sellPrice);
    console.log('Buy now price:', buyNowPrice);
    console.log('User club:', userClub);
    
    if (!selectedPlayer || !sellPrice || !buyNowPrice) {
      console.log('❌ Missing data for sell');
      setMessage('❌ Please enter valid prices');
      return;
    }

    if (!userClub) {
      console.log('❌ No club found');
      setMessage('❌ No club found');
      return;
    }

    try {
      console.log('🚀 Creating auction for:', selectedPlayer.name);
      console.log('💰 Starting price:', sellPrice);
      console.log('💎 Buy now price:', buyNowPrice);

      // Create auction for the player
      const auctionData = {
        playerId: selectedPlayer._id.toString(),
        playerName: selectedPlayer.name,
        currentClubId: userClub._id,
        startingPrice: parseInt(sellPrice),
        buyNowPrice: parseInt(buyNowPrice),
        durationHours: 0.0833 // 5 minutes
      };

      console.log('Creating auction with data:', auctionData);

      const response = await axios.post('http://localhost:3000/api/auctions', auctionData);
      
      if (response.status === 201) {
        setMessage(`✅ ${selectedPlayer.name} listed for sale! Starting price: €${parseInt(sellPrice).toLocaleString()}`);
        
        // Remove player from club and add money immediately
        try {
          const updatedPlayerIds = userClub.playerIds.filter(id => id !== selectedPlayer._id.toString());
          const newBudget = userClub.budget + parseInt(sellPrice);
          
          const updateResponse = await axios.put(`http://localhost:3000/api/clubs/${userClub._id}`, {
            playerIds: updatedPlayerIds,
            budget: newBudget
          });

          console.log('Club update response:', updateResponse.data);

          // Update local state and parent component
          const updatedClub = { 
            ...userClub, 
            playerIds: updatedPlayerIds,
            budget: newBudget
          };
          setUserClub(updatedClub);
          if (onClubUpdate) {
            onClubUpdate(updatedClub);
          }
          
          setMessage(`✅ ${selectedPlayer.name} sold for €${parseInt(sellPrice).toLocaleString()}! Money added to budget.`);
        } catch (updateError) {
          console.error('Error updating club after sale:', updateError);
          setMessage(`⚠️ Player listed for sale but failed to update club. Please refresh the page.`);
        }
      }
    } catch (error) {
      console.error('Error selling player:', error);
      setMessage(`❌ ${error.response?.data?.message || 'Failed to sell player'}`);
    }

    // Close modal
    setShowSellModal(false);
    setSelectedPlayer(null);
    setSellPrice('');
    setBuyNowPrice('');
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <div className="my-club-loading">Loading your club...</div>;
  }

  if (!userClub) {
    return <div className="my-club-error">No club found</div>;
  }

  return (
    <div className="my-club">
      <div className="club-header">
        <h2>{userClub.name}</h2>
        <div className="club-stats">
          <div className="stat">
            <span>Budget:</span>
            <strong>{formatAmount(userClub.budget)}</strong>
          </div>
          <div className="stat">
            <span>Players:</span>
            <strong>{clubPlayers.length}</strong>
          </div>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {clubPlayers.length === 0 ? (
        <div className="no-players">
          <p>No players in your club yet. Buy some players from the transfer market!</p>
        </div>
      ) : (
        <div className="players-grid">
          {clubPlayers.map(player => (
            <div key={player._id} className="my-club-player-card">
              <div className="player-header">
                <h3>{player.name}</h3>
                <span className="position">{player.position}</span>
              </div>
              
              <div className="player-info">
                <p><strong>Age:</strong> {player.age}</p>
                <p><strong>Nationality:</strong> {player.nationality}</p>
                <p><strong>Club:</strong> {player.club}</p>
              </div>

              <div className="player-stats">
                <div className="stat-item">
                  <span className="stat-label">Goals:</span>
                  <span className="stat-value">{player.goals}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Assists:</span>
                  <span className="stat-value">{player.assists}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Apps:</span>
                  <span className="stat-value">{player.appearances}</span>
                </div>
              </div>

              <div className="player-actions">
                <button 
                  onClick={() => openSellModal(player)}
                  className="sell-btn"
                >
                  🏷️ Sell Player
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {userClub.transferHistory && userClub.transferHistory.length > 0 && (
        <div className="transfer-history">
          <h3>Recent Transfer History</h3>
          <div className="history-list">
            {userClub.transferHistory.slice(-5).reverse().map((transfer, index) => (
              <div key={index} className={`history-item ${transfer.type.toLowerCase()}`}>
                <div className="history-type">{transfer.type === 'IN' ? '🟢 Signed' : '🔴 Sold'}</div>
                <div className="history-amount">{formatAmount(transfer.amount)}</div>
                <div className="history-date">{new Date(transfer.date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && selectedPlayer && (
        <div className="sell-modal-overlay">
          <div className="sell-modal">
            <h3>🏷️ Sell {selectedPlayer.name}</h3>
            <p className="sell-info">💰 You will receive the starting price immediately!</p>
            <div className="modal-content">
              <div className="price-inputs">
                <div className="input-group">
                  <label>Sell Price (€):</label>
                  <input
                    type="number"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    placeholder="Enter sell price"
                    min="1000000"
                    step="100000"
                  />
                </div>
                <div className="input-group">
                  <label>Buy Now Price (€):</label>
                  <input
                    type="number"
                    value={buyNowPrice}
                    onChange={(e) => setBuyNowPrice(e.target.value)}
                    placeholder="Enter buy now price"
                    min={parseInt(sellPrice) || 1000000}
                    step="100000"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button onClick={confirmSell} className="confirm-btn">
                  💰 Sell Player
                </button>
                <button onClick={() => setShowSellModal(false)} className="cancel-btn">
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyClub; 