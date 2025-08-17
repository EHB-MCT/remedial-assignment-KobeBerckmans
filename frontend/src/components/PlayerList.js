/**
 * PlayerList Component
 * 
 * Displays a list of football players with different layout options.
 * Supports grid, compact, and limited display modes for various use cases.
 * 
 * @author Kobe Berckmans
 * @version 1.0.0
 * @license MIT
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PlayerList.css';

/**
 * PlayerList Component
 * 
 * Renders a list of football players with configurable display options.
 * Fetches player data from the API and displays it in various formats.
 * 
 * @param {Object} props - Component props
 * @param {number} [props.limit] - Maximum number of players to display
 * @param {boolean} [props.grid] - Whether to display players in a grid layout
 * @param {boolean} [props.compact] - Whether to display players in compact mode
 * @returns {JSX.Element} PlayerList component
 */
function PlayerList({ limit, grid, compact }) {
  // State for storing fetched players and loading status
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch players from the API when component mounts
   * Sets loading state and updates players state with fetched data
   */
  useEffect(() => {
    axios.get('http://localhost:3000/api/players')
      .then(res => {
        setPlayers(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Show loading indicator while fetching data
  if (loading) return <div className="player-list-loading">Loading players...</div>;

  // Apply limit if specified, otherwise show all players
  const shownPlayers = limit ? players.slice(0, limit) : players;

  /**
   * Determine CSS class based on display mode
   * Combines grid and compact options for flexible styling
   */
  const getPlayerCardClass = () => {
    if (grid) return "player-card";
    if (compact) return "player-card compact-short";
    return "player-card";
  };

  return (
    <div className={grid ? "player-list grid" : compact ? "player-list compact" : "player-list"}>
      {shownPlayers.map(player => (
        <div className={getPlayerCardClass()} key={player._id}>
          {/* Player avatar with football emoji */}
          <div className="player-avatar">
            <span role="img" aria-label="player">⚽️</span>
          </div>
          
          {/* Player information section */}
          <div className="player-info">
            <h3>{player.name}</h3>
            <p><b>Position:</b> {player.position}</p>
            <p><b>Club:</b> {player.club}</p>
            
            {/* Extended information for grid view */}
            {!compact && grid && <p><b>Market Value:</b> €{player.marketValue.toLocaleString()}</p>}
            {!compact && grid && <p><b>Age:</b> {player.age}</p>}
            {!compact && grid && <p><b>Nationality:</b> {player.nationality}</p>}
            
            {/* Player statistics */}
            {!compact && (
              <div className="player-stats">
                <div className="stat-item">
                  <span className="stat-label">Goals:</span>
                  <span className="stat-value">{player.goals}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Assists:</span>
                  <span className="stat-value">{player.assists}</span>
                </div>
                {/* Appearances only shown in grid view */}
                {grid && (
                  <div className="stat-item">
                    <span className="stat-label">Apps:</span>
                    <span className="stat-value">{player.appearances}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PlayerList; 