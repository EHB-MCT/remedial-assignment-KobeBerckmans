import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PlayerList.css';

function PlayerList({ limit, grid, compact }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3000/api/players')
      .then(res => {
        setPlayers(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="player-list-loading">Loading players...</div>;

  const shownPlayers = limit ? players.slice(0, limit) : players;

  return (
    <div className={grid ? "player-list grid" : compact ? "player-list compact" : "player-list"}>
      {shownPlayers.map(player => (
        <div className={grid ? "player-card" : compact ? "player-card compact-short" : "player-card"} key={player._id}>
          <div className="player-avatar">
            <span role="img" aria-label="player">⚽️</span>
          </div>
          <div className="player-info">
            <h3>{player.name}</h3>
            <p><b>Position:</b> {player.position}</p>
            <p><b>Club:</b> {player.club}</p>
            {!compact && grid && <p><b>Market Value:</b> €{player.marketValue.toLocaleString()}</p>}
            {!compact && grid && <p><b>Age:</b> {player.age}</p>}
            {!compact && grid && <p><b>Nationality:</b> {player.nationality}</p>}
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