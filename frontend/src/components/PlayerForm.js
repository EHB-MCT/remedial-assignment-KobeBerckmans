import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PlayerForm.css';

function PlayerForm({ user, club }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, club, top-performers
  const [sortBy, setSortBy] = useState('form'); // form, goals, assists, rating

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/players');
      const allPlayers = response.data;
      
      // Add form data to players (simulated for now)
      const playersWithForm = allPlayers.map(player => ({
        ...player,
        form: generateFormData(player),
        recentRating: calculateRecentRating(player),
        lastMatches: generateLastMatches(player)
      }));
      
      setPlayers(playersWithForm);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch players:', error);
      setLoading(false);
    }
  };

  // Generate form data for a player
  const generateFormData = (player) => {
    const baseForm = Math.floor(Math.random() * 30) + 70; // 70-100
    const formTrend = Math.random() > 0.5 ? 'up' : 'down';
    const formChange = Math.floor(Math.random() * 10) + 1;
    
    return {
      current: baseForm,
      trend: formTrend,
      change: formChange,
      last5Games: Array.from({ length: 5 }, () => Math.floor(Math.random() * 30) + 70)
    };
  };

  // Calculate recent rating based on performance
  const calculateRecentRating = (player) => {
    const baseRating = 70;
    const goalsBonus = player.goals * 2;
    const assistsBonus = player.assists * 1.5;
    const appearancesBonus = player.appearances * 0.5;
    
    return Math.min(100, Math.floor(baseRating + goalsBonus + assistsBonus + appearancesBonus));
  };

  // Generate last 5 matches data
  const generateLastMatches = (player) => {
    return Array.from({ length: 5 }, () => ({
      rating: Math.floor(Math.random() * 30) + 70,
      goals: Math.floor(Math.random() * 3),
      assists: Math.floor(Math.random() * 2),
      result: ['W', 'D', 'L'][Math.floor(Math.random() * 3)]
    }));
  };

  const getFormColor = (form) => {
    if (form >= 85) return 'excellent';
    if (form >= 75) return 'good';
    if (form >= 65) return 'average';
    return 'poor';
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? '📈' : '📉';
  };

  const formatRating = (rating) => {
    return rating.toFixed(1);
  };

  const filterPlayers = () => {
    let filtered = players;
    
    if (filter === 'club' && club) {
      filtered = players.filter(player => 
        club.playerIds.includes(player._id.toString())
      );
    } else if (filter === 'top-performers') {
      filtered = players.filter(player => player.form.current >= 80);
    }
    
    return filtered;
  };

  const sortPlayers = (playerList) => {
    return playerList.sort((a, b) => {
      switch (sortBy) {
        case 'form':
          return b.form.current - a.form.current;
        case 'goals':
          return b.goals - a.goals;
        case 'assists':
          return b.assists - a.assists;
        case 'rating':
          return b.recentRating - a.recentRating;
        default:
          return 0;
      }
    });
  };

  const getPlayerForm = (player) => {
    const form = player.form;
    const color = getFormColor(form.current);
    const trendIcon = getTrendIcon(form.trend);
    
    return (
      <div className={`form-indicator ${color}`}>
        <span className="form-number">{form.current}</span>
        <span className="form-trend">
          {trendIcon} {form.change}
        </span>
      </div>
    );
  };

  if (loading) {
    return <div className="player-form-loading">Loading player form data...</div>;
  }

  const filteredAndSortedPlayers = sortPlayers(filterPlayers());

  return (
    <div className="player-form">
      <div className="player-form-header">
        <h2>📊 Player Form Analysis</h2>
        <p>Track player performance, recent form, and match ratings</p>
        
        <div className="form-controls">
          <div className="filter-controls">
            <label>Filter:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Players</option>
              <option value="club">My Club</option>
              <option value="top-performers">Top Performers</option>
            </select>
          </div>
          
          <div className="sort-controls">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="form">Form</option>
              <option value="goals">Goals</option>
              <option value="assists">Assists</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-stats-overview">
        <div className="stat-card">
          <span className="stat-number">{filteredAndSortedPlayers.length}</span>
          <span className="stat-label">Players</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {filteredAndSortedPlayers.filter(p => p.form.current >= 80).length}
          </span>
          <span className="stat-label">In Form</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {Math.round(filteredAndSortedPlayers.reduce((acc, p) => acc + p.form.current, 0) / filteredAndSortedPlayers.length)}
          </span>
          <span className="stat-label">Avg Form</span>
        </div>
      </div>

      <div className="players-form-grid">
        {filteredAndSortedPlayers.map(player => (
          <div key={player._id} className="player-form-card">
            <div className="player-form-header">
              <div className="player-info">
                <h3>{player.name}</h3>
                <span className="position">{player.position}</span>
                <span className="club">{player.club}</span>
              </div>
              {getPlayerForm(player)}
            </div>

            <div className="player-stats">
              <div className="stat-row">
                <span className="stat-label">Recent Rating:</span>
                <span className="stat-value">{formatRating(player.recentRating)}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Season Goals:</span>
                <span className="stat-value">{player.goals}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Season Assists:</span>
                <span className="stat-value">{player.assists}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Appearances:</span>
                <span className="stat-value">{player.appearances}</span>
              </div>
            </div>

            <div className="recent-matches">
              <h4>Last 5 Matches</h4>
              <div className="matches-grid">
                {player.lastMatches.map((match, index) => (
                  <div key={index} className={`match-result ${match.result.toLowerCase()}`}>
                    <span className="match-rating">{match.rating}</span>
                    <span className="match-stats">
                      {match.goals}G {match.assists}A
                    </span>
                    <span className="match-result-indicator">{match.result}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-history">
              <h4>Form Trend</h4>
              <div className="form-chart">
                {player.form.last5Games.map((game, index) => (
                  <div 
                    key={index} 
                    className={`form-bar ${getFormColor(game)}`}
                    style={{ height: `${game}%` }}
                    title={`Game ${index + 1}: ${game}`}
                  >
                    <span className="form-value">{game}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedPlayers.length === 0 && (
        <div className="no-players">
          <p>No players found matching the current filter.</p>
        </div>
      )}
    </div>
  );
}

export default PlayerForm; 