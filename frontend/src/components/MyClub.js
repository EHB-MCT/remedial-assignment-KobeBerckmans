/**
 * My Club Component
 * 
 * This component handles club management, player display, and club operations.
 * It provides detailed club information, player lists, and transfer history.
 * 
 * @author Kobe Berckmans
 * @version 1.0.0
 * @license MIT
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyClub.css';

/**
 * My Club Component
 * Displays club information, players, and management options
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object
 * @param {Object} props.club - Current club object
 * @param {Function} props.onClubUpdate - Callback function for club updates
 * @returns {JSX.Element} My club component
 */
function MyClub({ user, club, onClubUpdate }) {
  // State management for club data and UI
  const [clubData, setClubData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  /**
   * Effect hook to fetch club data when component mounts or club changes
   * Handles retry logic for network errors
   */
  useEffect(() => {
    if (club) {
      fetchUserClub();
    }
  }, [club]);

  /**
   * Fetches detailed club information including players
   * Implements retry mechanism for network resilience
   */
  const fetchUserClub = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch club details with players
      const response = await axios.get(`http://localhost:3000/api/clubs/${club._id}/players`);
      
      setClubData(response.data.club);
      setPlayers(response.data.players || []);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('Error fetching club data:', error);
      
      // Handle specific network errors with retry logic
      if (error.code === 'ECONNREFUSED' || error.message.includes('NETWORK_ERROR')) {
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setTimeout(fetchUserClub, 2000 * (retryCount + 1)); // Exponential backoff
          return;
        }
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to load club data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formats currency amounts for display
   * 
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  /**
   * Calculates club statistics for display
   * 
   * @returns {Object} Club statistics object
   */
  const getClubStats = () => {
    if (!clubData) return {};

    const totalSpent = clubData.transferHistory
      ?.filter(t => t.type === 'IN')
      ?.reduce((sum, t) => sum + t.amount, 0) || 0;

    const totalEarned = clubData.transferHistory
      ?.filter(t => t.type === 'OUT')
      ?.reduce((sum, t) => sum + t.amount, 0) || 0;

    return {
      playerCount: players.length,
      budget: clubData.budget,
      totalSpent,
      totalEarned,
      netSpent: totalSpent - totalEarned
    };
  };

  /**
   * Handles selling a player from the club
   * 
   * @param {string} playerId - ID of the player to sell
   * @param {number} price - Selling price
   */
  const handleSellPlayer = async (playerId, price) => {
    try {
      const response = await axios.post(`http://localhost:3000/api/transfers/sell`, {
        clubId: clubData._id,
        playerId: playerId,
        price: price
      });

      // Update club data after successful sale
      if (response.data.updatedClub) {
        setClubData(response.data.updatedClub);
        onClubUpdate(response.data.updatedClub);
      }

      // Refresh player list
      fetchUserClub();
    } catch (error) {
      console.error('Error selling player:', error);
      alert('Failed to sell player. Please try again.');
    }
  };

  /**
   * Formats transfer history for display
   * 
   * @param {Array} history - Transfer history array
   * @returns {Array} Formatted transfer history
   */
  const formatTransferHistory = (history) => {
    if (!history || history.length === 0) return [];

    return history
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10) // Show last 10 transfers
      .map(transfer => ({
        ...transfer,
        formattedAmount: formatCurrency(transfer.amount),
        formattedDate: new Date(transfer.date).toLocaleDateString()
      }));
  };

  // Show loading state
  if (loading) {
    return (
      <div className="myclub-container">
        <div className="loading">Loading club data...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="myclub-container">
        <div className="error-message">
          <h3>Error Loading Club Data</h3>
          <p>{error}</p>
          <button onClick={fetchUserClub} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show no club state
  if (!clubData) {
    return (
      <div className="myclub-container">
        <div className="no-club">
          <h3>No Club Found</h3>
          <p>Please contact support to set up your club.</p>
        </div>
      </div>
    );
  }

  const stats = getClubStats();
  const transferHistory = formatTransferHistory(clubData.transferHistory);

  return (
    <div className="myclub-container">
      {/* Club Overview Section */}
      <div className="club-overview">
        <div className="club-header">
          <h2>{clubData.name}</h2>
          <div className="club-info">
            <span><strong>League:</strong> {clubData.league}</span>
            <span><strong>Country:</strong> {clubData.country}</span>
          </div>
        </div>

        <div className="club-stats">
          <div className="stat-card">
            <span className="stat-number">{formatCurrency(stats.budget)}</span>
            <span className="stat-label">Budget</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.playerCount}</span>
            <span className="stat-label">Players</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{formatCurrency(stats.totalSpent)}</span>
            <span className="stat-label">Total Spent</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{formatCurrency(stats.totalEarned)}</span>
            <span className="stat-label">Total Earned</span>
          </div>
        </div>
      </div>

      {/* Players Section */}
      <div className="players-section">
        <h3>Your Squad</h3>
        {players.length === 0 ? (
          <div className="no-players">
            <p>No players in your squad yet.</p>
            <p>Visit the Transfer Market to sign players!</p>
          </div>
        ) : (
          <div className="players-grid">
            {players.map((player) => (
              <div key={player._id} className="player-card">
                <div className="player-info">
                  <h4>{player.name}</h4>
                  <p><strong>Position:</strong> {player.position}</p>
                  <p><strong>Age:</strong> {player.age}</p>
                  <p><strong>Rating:</strong> {player.rating}</p>
                </div>
                <div className="player-actions">
                  <button 
                    onClick={() => handleSellPlayer(player._id, player.value)}
                    className="sell-btn"
                  >
                    Sell Player
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transfer History Section */}
      <div className="transfer-history">
        <h3>Recent Transfers</h3>
        {transferHistory.length === 0 ? (
          <p>No transfer history yet.</p>
        ) : (
          <div className="transfers-list">
            {transferHistory.map((transfer, index) => (
              <div key={index} className={`transfer-item ${transfer.type.toLowerCase()}`}>
                <span className="transfer-type">{transfer.type}</span>
                <span className="transfer-amount">{transfer.formattedAmount}</span>
                <span className="transfer-date">{transfer.formattedDate}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyClub; 