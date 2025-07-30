import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyClub.css';

function MyClub({ user, club }) {
  const [userClub, setUserClub] = useState(null);
  const [clubPlayers, setClubPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (club) {
      fetchUserClub();
    }
  }, [club]);

  const fetchUserClub = async () => {
    try {
      // Use the club passed as prop (user's own club)
      setUserClub(club);
      
      if (club.playerIds && club.playerIds.length > 0) {
        console.log('Club has players:', club.playerIds);
        const playersResponse = await axios.get('http://localhost:3000/api/players');
        const allPlayers = playersResponse.data;
        const clubPlayerIds = club.playerIds.map(id => id.toString());
        const players = allPlayers.filter(player => clubPlayerIds.includes(player._id.toString()));
        console.log('Found club players:', players.length);
        setClubPlayers(players);
      } else {
        console.log('Club has no players');
        setClubPlayers([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch user club:', error);
      setLoading(false);
    }
  };

  const sellPlayer = async (playerId, playerName) => {
    if (!userClub) {
      setMessage('❌ No club found');
      return;
    }

    console.log('User club:', userClub);
    console.log('Club ID:', userClub._id);
    console.log('Club name:', userClub.name);
    console.log('Player ID to sell:', playerId);

    try {
      // Calculate sell price based on player stats
      const player = clubPlayers.find(p => p._id.toString() === playerId);
      if (!player) {
        setMessage('❌ Player not found');
        return;
      }

      console.log('Found player to sell:', player);

      // Calculate suggested price based on goals, assists, and appearances
      const basePrice = 5000000; // 5M base
      const goalsValue = player.goals * 200000; // 200k per goal
      const assistsValue = player.assists * 150000; // 150k per assist
      const appearancesValue = player.appearances * 50000; // 50k per appearance
      const suggestedPrice = basePrice + goalsValue + assistsValue + appearancesValue;

      console.log('Suggested price:', suggestedPrice);

      // Ask user for custom price
      const customPrice = prompt(
        `Set your asking price for ${playerName}:\n\n` +
        `Suggested price: €${suggestedPrice.toLocaleString()}\n` +
        `Player stats: ${player.goals} goals, ${player.assists} assists, ${player.appearances} apps\n\n` +
        `Enter your price (in euros):`,
        suggestedPrice.toString()
      );

      if (!customPrice || isNaN(parseInt(customPrice))) {
        setMessage('❌ Invalid price entered');
        return;
      }

      const askingPrice = parseInt(customPrice);
      const startingPrice = Math.floor(askingPrice * 0.7); // 70% of asking price
      const buyNowPrice = askingPrice;

      console.log('User set price:', askingPrice);
      console.log('Starting price:', startingPrice);
      console.log('Buy now price:', buyNowPrice);

      // Create auction for the player
      const auctionData = {
        playerId: playerId,
        playerName: playerName,
        currentClub: userClub._id,
        startingPrice: startingPrice,
        currentPrice: startingPrice,
        buyNowPrice: buyNowPrice,
        endTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        description: `${playerName} available for transfer from ${userClub.name}. ${player.goals} goals, ${player.assists} assists this season.`
      };

      console.log('Creating auction with data:', auctionData);

      const response = await axios.post('http://localhost:3000/api/auctions', auctionData);
      
      if (response.status === 201) {
        setMessage(`✅ ${playerName} listed for sale!\nStarting price: €${startingPrice.toLocaleString()}\nBuy now: €${buyNowPrice.toLocaleString()}\nDuration: 15 minutes`);
        
        // Remove player from club
        const updatedPlayerIds = userClub.playerIds.filter(id => id !== playerId);
        console.log('Current playerIds:', userClub.playerIds);
        console.log('Updated playerIds:', updatedPlayerIds);
        console.log('Club ID for update:', userClub._id);
        
        try {
          const updateResponse = await axios.put(`http://localhost:3000/api/clubs/${userClub._id}`, {
            playerIds: updatedPlayerIds
          });

          console.log('Club update response:', updateResponse.data);

          // Refresh club data
          fetchUserClub();
        } catch (updateError) {
          console.error('Error updating club:', updateError);
          console.error('Update error response:', updateError.response?.data);
          setMessage(`⚠️ Player listed for sale but failed to update club. Please refresh the page.`);
        }
      }
    } catch (error) {
      console.error('Error selling player:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error URL:', error.config?.url);
      setMessage(`❌ ${error.response?.data?.message || 'Failed to sell player'}`);
    }
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
                  onClick={() => sellPlayer(player._id.toString(), player.name)}
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
    </div>
  );
}

export default MyClub; 