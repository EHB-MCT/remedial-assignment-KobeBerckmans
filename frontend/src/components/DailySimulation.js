/**
 * DailySimulation Component
 * 
 * Provides functionality to simulate a full day of transfer market activity.
 * Triggers backend simulation and displays results including transfers, auctions, and club updates.
 * 
 * @author Kobe Berckmans
 * @version 1.0.0
 * @license MIT
 */

import React, { useState } from 'react';
import axios from 'axios';
import './DailySimulation.css';

/**
 * DailySimulation Component
 * 
 * Renders a simulation interface that allows users to trigger daily transfer market
 * simulations and view detailed results of the simulation.
 * 
 * @returns {JSX.Element} DailySimulation component
 */
function DailySimulation() {
  // State for managing simulation process and results
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [message, setMessage] = useState('');

  /**
   * Triggers the daily simulation on the backend
   * Sends POST request to simulation endpoint and handles response
   */
  const simulateDay = async () => {
    setIsLoading(true);
    setMessage('');
    setResults(null);

    try {
      const response = await axios.post('http://localhost:3000/api/simulation/day');
      setResults(response.data.results);
      setMessage('Daily simulation completed successfully!');
    } catch (error) {
      setMessage(`${error.response?.data?.message || 'Simulation failed'}`);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="daily-simulation">
      {/* Simulation header with description */}
      <div className="simulation-header">
        <h3>Daily Transfer Market Simulation</h3>
        <p>Simulate a full day of transfer market activity</p>
      </div>

      {/* Simulation control button */}
      <div className="simulation-controls">
        <button 
          onClick={simulateDay}
          disabled={isLoading}
          className="simulate-day-btn"
        >
          {isLoading ? 'Simulating...' : 'Simulate Day'}
        </button>
      </div>

      {/* Success/error message display */}
      {message && (
        <div className={`simulation-message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Simulation results display */}
      {results && (
        <div className="simulation-results">
          {/* Completed transfers section */}
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

          {/* New auctions section */}
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

          {/* Updated clubs section */}
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