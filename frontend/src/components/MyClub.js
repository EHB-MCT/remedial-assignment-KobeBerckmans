import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyClub.css';

function MyClub() {
  const [userClub, setUserClub] = useState(null);
  const [clubPlayers, setClubPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserClub();
  }, []);

  const fetchUserClub = async () => {
    try {
      // Get the first club as user's club
      const clubsResponse = await axios.get('http://localhost:3000/api/clubs');
      if (clubsResponse.data.length > 0) {
        const club = clubsResponse.data[0];
        setUserClub(club);
        
        // Fetch players for this club
        if (club.playerIds && club.playerIds.length > 0) {
          const playersResponse = await axios.get('http://localhost:3000/api/players');
          const allPlayers = playersResponse.data;
          const clubPlayerIds = club.playerIds.map(id => id.toString());
          const players = allPlayers.filter(player => 
            clubPlayerIds.includes(player._id.toString())
          );
          setClubPlayers(players);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch user club:', error);
      setLoading(false);
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
        <div className="club-info">
          <div className="club-budget">
            <span>Budget:</span>
            <strong>{formatAmount(userClub.budget)}</strong>
          </div>
          <div className="club-players-count">
            <span>Players:</span>
            <strong>{clubPlayers.length}</strong>
          </div>
        </div>
      </div>

      {clubPlayers.length === 0 ? (
        <div className="no-players">
          <p>Your club has no players yet. Participate in the transfer market to sign players!</p>
        </div>
      ) : (
        <div className="players-grid">
          {clubPlayers.map(player => (
            <div key={player._id} className="my-club-player-card">
              <div className="player-header">
                <h3>{player.name}</h3>
                <span className="player-position">{player.position}</span>
              </div>
              
              <div className="player-details">
                <div className="player-stat">
                  <span>Age:</span>
                  <strong>{player.age}</strong>
                </div>
                <div className="player-stat">
                  <span>Nationality:</span>
                  <strong>{player.nationality}</strong>
                </div>
                <div className="player-stat">
                  <span>Market Value:</span>
                  <strong>{formatAmount(player.marketValue)}</strong>
                </div>
              </div>
              
              <div className="player-stats">
                <div className="stat-item">
                  <span>Goals:</span>
                  <strong>{player.goals}</strong>
                </div>
                <div className="stat-item">
                  <span>Assists:</span>
                  <strong>{player.assists}</strong>
                </div>
                <div className="stat-item">
                  <span>Appearances:</span>
                  <strong>{player.appearances}</strong>
                </div>
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
                <div className="history-type">
                  {transfer.type === 'IN' ? '🟢 Signed' : '🔴 Sold'}
                </div>
                <div className="history-amount">
                  {formatAmount(transfer.amount)}
                </div>
                <div className="history-date">
                  {new Date(transfer.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyClub; 