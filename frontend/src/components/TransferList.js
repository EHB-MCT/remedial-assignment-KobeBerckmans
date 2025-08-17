/**
 * TransferList Component
 * 
 * Displays a comprehensive list of all transfer transactions in the system.
 * Shows transfer details including player, clubs, amount, status, and date.
 * 
 * @author Kobe Berckmans
 * @version 1.0.0
 * @license MIT
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TransferList.css';

/**
 * TransferList Component
 * 
 * Renders a list of transfer transactions with detailed information
 * about each transfer including status, amounts, and club information.
 * 
 * @returns {JSX.Element} TransferList component
 */
function TransferList() {
  // State for storing transfer data and loading status
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch transfers from API when component mounts
   * Retrieves all transfer data and updates component state
   */
  useEffect(() => {
    fetchTransfers();
  }, []);

  /**
   * Fetches transfer data from the backend API
   * Updates component state with fetched transfers
   */
  const fetchTransfers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/transfers');
      setTransfers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch transfers:', error);
      setLoading(false);
    }
  };

  /**
   * Returns appropriate color for transfer status
   * Maps status values to color codes for visual representation
   * 
   * @param {string} status - Transfer status (completed, accepted, pending, rejected)
   * @returns {string} Hex color code for the status
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50'; // Green
      case 'accepted': return '#2196F3'; // Blue
      case 'pending': return '#FF9800';  // Orange
      case 'rejected': return '#f44336'; // Red
      default: return '#757575';        // Gray
    }
  };

  /**
   * Formats currency amounts in EUR format
   * 
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Show loading indicator while fetching data
  if (loading) {
    return <div className="transfer-list-loading">Loading transfers...</div>;
  }

  return (
    <div className="transfer-list">
      {/* Component header with transfer count */}
      <h3>Transfer History ({transfers.length})</h3>
      
      {transfers.length === 0 ? (
        // Empty state message
        <div className="no-transfers">
          <p>No transfers yet. Start a simulation to see transfers!</p>
        </div>
      ) : (
        // Transfer grid display
        <div className="transfer-grid">
          {transfers.map(transfer => (
            <div key={transfer._id} className="transfer-card">
              {/* Transfer header with status and amount */}
              <div className="transfer-header">
                <div className="transfer-status" style={{ backgroundColor: getStatusColor(transfer.status) }}>
                  {transfer.status.toUpperCase()}
                </div>
                <div className="transfer-amount">
                  {formatAmount(transfer.amount)}
                </div>
              </div>
              
              {/* Player information */}
              <div className="transfer-player">
                <span role="img" aria-label="player">⚽️</span>
                <span>{transfer.playerName || 'Unknown Player'}</span>
              </div>
              
              {/* Club information with transfer direction */}
              <div className="transfer-clubs">
                <div className="club from">
                  <span>From:</span>
                  <strong>{transfer.fromClub?.name || 'Unknown Club'}</strong>
                </div>
                <div className="transfer-arrow">→</div>
                <div className="club to">
                  <span>To:</span>
                  <strong>{transfer.toClub?.name || 'Unknown Club'}</strong>
                </div>
              </div>
              
              {/* Optional transfer notes */}
              {transfer.notes && (
                <div className="transfer-notes">
                  <small>{transfer.notes}</small>
                </div>
              )}
              
              {/* Transfer date */}
              <div className="transfer-date">
                {new Date(transfer.transferDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TransferList; 