/**
 * SimulationButton Component
 * 
 * Provides buttons to trigger different types of transfer simulations.
 * Supports single transfer simulation and transfer window simulation with multiple transfers.
 * 
 * @author Kobe Berckmans
 * @version 1.0.0
 * @license MIT
 */

import React, { useState } from 'react';
import axios from 'axios';
import './SimulationButton.css';

/**
 * SimulationButton Component
 * 
 * Renders simulation control buttons that allow users to trigger various
 * transfer market simulations and view results.
 * 
 * @param {Object} props - Component props
 * @param {Function} [props.onSimulationComplete] - Callback function called when simulation completes
 * @returns {JSX.Element} SimulationButton component
 */
function SimulationButton({ onSimulationComplete }) {
  // State for managing simulation process and user feedback
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  /**
   * Simulates a single transfer between clubs
   * Triggers backend simulation and handles response
   */
  const simulateSingleTransfer = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await axios.post('http://localhost:3000/api/simulation/transfer');
      setMessage(response.data.message);
      if (onSimulationComplete) {
        onSimulationComplete(response.data.transfer);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Simulation failed');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Simulates a transfer window with multiple transfers
   * Triggers backend simulation for multiple transfers and handles response
   */
  const simulateTransferWindow = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await axios.post('http://localhost:3000/api/simulation/transfer-window', {
        numTransfers: 5
      });
      setMessage(response.data.message);
      if (onSimulationComplete) {
        onSimulationComplete(response.data.transfers);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Transfer window simulation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="simulation-controls">
      {/* Component header */}
      <h3>Transfer Simulation</h3>
      
      {/* Simulation button controls */}
      <div className="simulation-buttons">
        {/* Single transfer simulation button */}
        <button 
          className="simulation-btn single"
          onClick={simulateSingleTransfer}
          disabled={isLoading}
        >
          {isLoading ? 'Simulating...' : 'Simulate Single Transfer'}
        </button>
        
        {/* Transfer window simulation button */}
        <button 
          className="simulation-btn window"
          onClick={simulateTransferWindow}
          disabled={isLoading}
        >
          {isLoading ? 'Simulating...' : 'Simulate Transfer Window (5 transfers)'}
        </button>
      </div>
      
      {/* Success/error message display */}
      {message && (
        <div className={`simulation-message ${message.includes('successfully') || message.includes('completed') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default SimulationButton; 