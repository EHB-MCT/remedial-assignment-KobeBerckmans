/**
 * Football Transfer Market Simulation - Main Application Component
 * 
 * This is the main React application component that handles:
 * - Application routing and navigation
 * - User authentication state management
 * - Club data management
 * - Global state and context
 * 
 * @author Kobe Berckmans
 * @version 1.0.0
 * @license MIT
 */

import React, { useState, useEffect } from 'react';
import './App.css';
import PlayerList from './components/PlayerList';
import SimulationButton from './components/SimulationButton';
import TransferList from './components/TransferList';
import TransferMarket from './components/TransferMarket';
import DailySimulation from './components/DailySimulation';
import MyClub from './components/MyClub';
import Login from './components/Login';
import Register from './components/Register';
import PlayerForm from './components/PlayerForm';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';

/**
 * Home Component
 * Displays the main homepage with club statistics and feature overview
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object
 * @param {Object} props.club - Current club object
 * @returns {JSX.Element} Homepage component
 */
function Home({ user, club }) {
  return (
    <main className="app-main">
      <div className="welcome-banner">
        <h1>Welcome to TransferMarketSim</h1>
        <p>Manage your club, scout players, and dominate the transfer market!</p>
        {club && (
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{club.budget ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(club.budget) : '€0'}</span>
              <span className="stat-label">Club Budget</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{club.playerIds ? club.playerIds.length : 0}</span>
              <span className="stat-label">Players</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Market Open</span>
            </div>
          </div>
        )}
      </div>

      <div className="homepage-container">
        <section className="homepage-section myclub-section">
          <h2>My Club</h2>
          <p>View your current squad, manage your players, and track your club's performance. Build your dream team and compete in the transfer market.</p>
          <p>Your club: <strong>{club?.name || 'Loading...'}</strong></p>
        </section>

        <section className="homepage-section players-section">
          <h2>Players</h2>
          <p>Browse through the complete database of available players. Scout talent, analyze statistics, and find the perfect additions to your squad.</p>
          <PlayerList limit={4} compact={true} />
        </section>

        <section className="homepage-section transfers-section">
          <h2>Transfer Market</h2>
          <p>Participate in live auctions, place bids on players, and negotiate transfers. The market is dynamic with real-time updates and competitive bidding.</p>
        </section>

        <section className="homepage-section player-form-section">
          <h2>Player Form</h2>
          <p>Track player performance, recent form, and match ratings. Analyze which players are in top form and make informed transfer decisions.</p>
        </section>
      </div>
    </main>
  );
}

/**
 * Players Page Component
 * Displays all available players in a grid layout
 * 
 * @returns {JSX.Element} Players page component
 */
function PlayersPage() {
  return (
    <main className="app-main">
      <section id="players">
        <h2>All Players</h2>
        <PlayerList grid={true} />
      </section>
    </main>
  );
}

/**
 * My Club Page Component
 * Displays detailed club management interface
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object
 * @param {Object} props.club - Current club object
 * @param {Function} props.onClubUpdate - Callback function for club updates
 * @returns {JSX.Element} My club page component
 */
function MyClubPage({ user, club, onClubUpdate }) {
  return (
    <main className="app-main">
      <section id="myclub">
        <h2>My Club</h2>
        <MyClub user={user} club={club} onClubUpdate={onClubUpdate} />
      </section>
    </main>
  );
}

/**
 * Transfers Page Component
 * Displays transfer market and simulation interface
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object
 * @param {Object} props.club - Current club object
 * @param {Function} props.onClubUpdate - Callback function for club updates
 * @returns {JSX.Element} Transfers page component
 */
function TransfersPage({ user, club, onClubUpdate }) {
  return (
    <main className="app-main">
      <section id="transfers">
        <h2>Transfer Market</h2>
        <DailySimulation />
        <TransferMarket user={user} club={club} onClubUpdate={onClubUpdate} />
      </section>
    </main>
  );
}

/**
 * Player Form Page Component
 * Displays player performance and form analysis
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object
 * @param {Object} props.club - Current club object
 * @returns {JSX.Element} Player form page component
 */
function PlayerFormPage({ user, club }) {
  return (
    <main className="app-main">
      <section id="player-form">
        <h2>Player Form</h2>
        <PlayerForm user={user} club={club} />
      </section>
    </main>
  );
}

/**
 * Main App Component
 * Handles application state, routing, and authentication
 * 
 * @returns {JSX.Element} Main application component
 */
function App() {
  // State management for user authentication and club data
  const [user, setUser] = useState(null);
  const [club, setClub] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Effect hook to check authentication status on component mount
   * Retrieves stored token and validates user session
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set default authorization header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Verify token and fetch user data
      axios.post('http://localhost:3000/api/auth/verify', { token })
        .then(response => {
          setUser(response.data.user);
          fetchUserClub(response.data.user.id);
        })
        .catch(error => {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetches club data for the authenticated user
   * 
   * @param {string} userId - User ID to fetch club for
   */
  const fetchUserClub = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/clubs/${userId}`);
      setClub(response.data);
    } catch (error) {
      console.error('Error fetching user club:', error);
    }
  };

  /**
   * Handles user login and sets up authentication
   * 
   * @param {Object} data - Login response data containing user and token
   */
  const handleLogin = (data) => {
    setUser(data.user);
    localStorage.setItem('token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    fetchUserClub(data.user.id);
  };

  /**
   * Handles user registration and automatic login
   * 
   * @param {Object} data - Registration response data containing user and token
   */
  const handleRegister = (data) => {
    setUser(data.user);
    localStorage.setItem('token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    fetchUserClub(data.user.id);
  };

  /**
   * Handles user logout and clears authentication data
   */
  const handleLogout = () => {
    setUser(null);
    setClub(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  /**
   * Handles club data updates and refreshes state
   * 
   * @param {Object} updatedClub - Updated club data
   */
  const handleClubUpdate = (updatedClub) => {
    setClub(updatedClub);
  };

  /**
   * Switches to registration view
   */
  const switchToRegister = () => {
    setShowRegister(true);
  };

  /**
   * Switches to login view
   */
  const switchToLogin = () => {
    setShowRegister(false);
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  // Show authentication forms if user is not logged in
  if (!user) {
    return (
      <div className="auth-container">
        {showRegister ? (
          <Register onRegister={handleRegister} onSwitchToLogin={switchToLogin} />
        ) : (
          <Login onLogin={handleLogin} onSwitchToRegister={switchToRegister} />
        )}
      </div>
    );
  }

  // Main application with routing
  return (
    <Router>
      <div className="App">
        <nav className="app-nav">
          <div className="nav-brand">
            <Link to="/">TransferMarketSim</Link>
          </div>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/players">Players</Link>
            <Link to="/myclub">My Club</Link>
            <Link to="/transfers">Transfer Market</Link>
            <Link to="/player-form">Player Form</Link>
          </div>
          <div className="nav-user">
            <span>Welcome, {user.username}!</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home user={user} club={club} />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/myclub" element={<MyClubPage user={user} club={club} onClubUpdate={handleClubUpdate} />} />
          <Route path="/transfers" element={<TransfersPage user={user} club={club} onClubUpdate={handleClubUpdate} />} />
          <Route path="/player-form" element={<PlayerFormPage user={user} club={club} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 