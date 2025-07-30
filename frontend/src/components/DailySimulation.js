import React, { useState } from 'react';
import axios from 'axios';
import './DailySimulation.css';

function DailySimulation() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [message, setMessage] = useState('');

  const simulateDay = async () => {
    setIsLoading(true);
    setMessage('');
    setResults(null);

    try {
      const response = await axios.post('http://localhost:3000/api/simulation/day');
      setResults(response.data.results);
      setMessage('✅ Daily simulation completed successfully!');
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || 'Simulation failed'}`);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="daily-simulation">
      <div className="simulation-header">
        <h3>Daily Transfer Market Simulation</h3>
        <p>Simulate a full day of transfer market activity</p>
      </div>

      <div className="simulation-controls">
        <button 
          onClick={simulateDay}
          disabled={isLoading}
          className="simulate-day-btn"
        >
          {isLoading ? 'Simulating...' : 'Simulate Day'}
        </button>
      </div>

      {message && (
        <div className={`simulation-message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {results && (
        <div className="simulation-results">
          <div className="results-section">
            <h4>Completed Transfers ({results.completedTransfers.length})</h4>
            {results.completedTransfers.length > 0 ? (
              <div className="transfers-list">
                {results.completedTransfers.map((transfer, index) => (
                  <div key={index} className="transfer-item">
                    <div className="transfer-player">{transfer.player}</div>
                    <div className="transfer-clubs">
                      {transfer.from} → {transfer.to}
                    </div>
                    <div className="transfer-amount">
                      {formatAmount(transfer.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No transfers completed today.</p>
            )}
          </div>

          <div className="results-section">
            <h4>New Auctions ({results.newAuctions.length})</h4>
            {results.newAuctions.length > 0 ? (
              <div className="auctions-list">
                {results.newAuctions.map((auction, index) => (
                  <div key={index} className="auction-item">
                    <div className="auction-player">{auction.player}</div>
                    <div className="auction-club">{auction.club}</div>
                    <div className="auction-prices">
                      <span>Start: {formatAmount(auction.startingPrice)}</span>
                      <span>Buy Now: {formatAmount(auction.buyNowPrice)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No new auctions created today.</p>
            )}
          </div>

          <div className="results-section">
            <h4>Updated Clubs ({results.updatedClubs.length})</h4>
            {results.updatedClubs.length > 0 ? (
              <div className="clubs-list">
                {results.updatedClubs.map((club, index) => (
                  <div key={index} className="club-item">
                    {club}
                  </div>
                ))}
              </div>
            ) : (
              <p>No clubs were updated today.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DailySimulation; 