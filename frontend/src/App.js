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
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';

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
          <h2>🏆 My Club</h2>
          <p>View your current squad, manage your players, and track your club's performance. Build your dream team and compete in the transfer market.</p>
          <p>Your club: <strong>{club?.name || 'Loading...'}</strong></p>
        </section>

        <section className="homepage-section players-section">
          <h2>👥 Players</h2>
          <p>Browse through the complete database of available players. Scout talent, analyze statistics, and find the perfect additions to your squad.</p>
          <PlayerList limit={4} compact={true} />
        </section>

        <section className="homepage-section transfers-section">
          <h2>💰 Transfer Market</h2>
          <p>Participate in live auctions, place bids on players, and negotiate transfers. The market is dynamic with real-time updates and competitive bidding.</p>
        </section>

        <section className="homepage-section history-section">
          <h2>📊 Transfer History</h2>
          <p>Track all your completed transfers, view transaction history, and analyze your club's transfer strategy over time.</p>
        </section>
      </div>
    </main>
  );
}

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

function MyClubPage({ user, club }) {
  return (
    <main className="app-main">
      <section id="myclub">
        <h2>My Club</h2>
        <MyClub user={user} club={club} />
      </section>
    </main>
  );
}

function TransfersPage({ user, club }) {
  return (
    <main className="app-main">
      <section id="transfers">
        <h2>Transfer Market</h2>
        <DailySimulation />
        <TransferMarket user={user} club={club} />
      </section>
    </main>
  );
}

function HistoryPage() {
  return (
    <main className="app-main">
      <section id="history">
        <h2>Transfer History</h2>
        {/* Transfer history/component komt hier */}
      </section>
    </main>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [club, setClub] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedClub = localStorage.getItem('club');

    if (token && savedUser && savedClub) {
      setUser(JSON.parse(savedUser));
      setClub(JSON.parse(savedClub));
      setIsAuthenticated(true);
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const handleLogin = (data) => {
    setUser(data.user);
    setClub(data.club);
    setIsAuthenticated(true);
  };

  const handleRegister = (data) => {
    setUser(data.user);
    setClub(data.club);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('club');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setClub(null);
    setIsAuthenticated(false);
  };

  const switchToRegister = () => {
    setShowLogin(false);
  };

  const switchToLogin = () => {
    setShowLogin(true);
  };

  // If not authenticated, show login/register
  if (!isAuthenticated) {
    return (
      <div className="app-container">
        {showLogin ? (
          <Login onLogin={handleLogin} onSwitchToRegister={switchToRegister} />
        ) : (
          <Register onRegister={handleRegister} onSwitchToLogin={switchToLogin} />
        )}
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1><Link to="/" className="app-title-link">TransferMarketSim</Link></h1>
          <div className="user-info">
            <span className="welcome-text">Welcome, {user?.username}!</span>
            <span className="club-name">{club?.name}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
          <nav>
            <ul className="nav-list">
              <li><Link to="/myclub">My Club</Link></li>
              <li><Link to="/players">Players</Link></li>
              <li><Link to="/transfers">Transfers</Link></li>
              <li><Link to="/history">History</Link></li>
            </ul>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<Home user={user} club={club} />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/myclub" element={<MyClubPage user={user} club={club} />} />
          <Route path="/transfers" element={<TransfersPage user={user} club={club} />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} TransferMarketSim</p>
        </footer>
      </div>
    </Router>
  );
}

export default App; 