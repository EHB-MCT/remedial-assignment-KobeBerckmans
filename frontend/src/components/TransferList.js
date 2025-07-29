import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TransferList.css';

function TransferList() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransfers();
  }, []);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'accepted': return '#2196F3';
      case 'pending': return '#FF9800';
      case 'rejected': return '#f44336';
      default: return '#757575';
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
    return <div className="transfer-list-loading">Loading transfers...</div>;
  }

  return (
    <div className="transfer-list">
      <h3>Transfer History ({transfers.length})</h3>
      {transfers.length === 0 ? (
        <div className="no-transfers">
          <p>No transfers yet. Start a simulation to see transfers!</p>
        </div>
      ) : (
        <div className="transfer-grid">
          {transfers.map(transfer => (
            <div key={transfer._id} className="transfer-card">
              <div className="transfer-header">
                <div className="transfer-status" style={{ backgroundColor: getStatusColor(transfer.status) }}>
                  {transfer.status.toUpperCase()}
                </div>
                <div className="transfer-amount">
                  {formatAmount(transfer.amount)}
                </div>
              </div>
              
              <div className="transfer-player">
                <span role="img" aria-label="player">⚽️</span>
                <span>{transfer.playerName || 'Unknown Player'}</span>
              </div>
              
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
              
              {transfer.notes && (
                <div className="transfer-notes">
                  <small>{transfer.notes}</small>
                </div>
              )}
              
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