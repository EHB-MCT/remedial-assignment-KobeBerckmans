import React, { useState } from 'react';
import axios from 'axios';
import './SimulationButton.css';

function SimulationButton({ onSimulationComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const simulateSingleTransfer = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await axios.post('http://localhost:3000/api/simulation/transfer');
      setMessage(`✅ ${response.data.message}`);
      if (onSimulationComplete) {
        onSimulationComplete(response.data.transfer);
      }
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || 'Simulation failed'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateTransferWindow = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await axios.post('http://localhost:3000/api/simulation/transfer-window', {
        numTransfers: 5
      });
      setMessage(`✅ ${response.data.message}`);
      if (onSimulationComplete) {
        onSimulationComplete(response.data.transfers);
      }
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || 'Transfer window simulation failed'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="simulation-controls">
      <h3>Transfer Simulation</h3>
      <div className="simulation-buttons">
        <button 
          className="simulation-btn single"
          onClick={simulateSingleTransfer}
          disabled={isLoading}
        >
          {isLoading ? 'Simulating...' : 'Simulate Single Transfer'}
        </button>
        
        <button 
          className="simulation-btn window"
          onClick={simulateTransferWindow}
          disabled={isLoading}
        >
          {isLoading ? 'Simulating...' : 'Simulate Transfer Window (5 transfers)'}
        </button>
      </div>
      
      {message && (
        <div className={`simulation-message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default SimulationButton; 