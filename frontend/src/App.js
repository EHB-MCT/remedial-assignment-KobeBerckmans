import React from 'react';
import './App.css';
import PlayerList from './components/PlayerList';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function Home() {
  return (
    <main className="app-main">
      <section id="myclub">
        <h2>My Club</h2>
        <p>Here are the players currently in your club.</p>
        {/* My club logic/component komt hier */}
      </section>
      <section id="players">
        <h2>Players</h2>
        <p>Featured players from the database.</p>
        <PlayerList limit={4} compact={true} />
      </section>
      <section id="transfers">
        <h2>Transfers</h2>
        {/* Transfer logic/component komt hier */}
      </section>
      <section id="history">
        <h2>Transfer History</h2>
        {/* Transfer history/component komt hier */}
      </section>
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

function MyClubPage() {
  return (
    <main className="app-main">
      <section id="myclub">
        <h2>My Club</h2>
        <p>Here are the players currently in your club.</p>
        {/* My club logic/component komt hier */}
      </section>
    </main>
  );
}

function TransfersPage() {
  return (
    <main className="app-main">
      <section id="transfers">
        <h2>Transfers</h2>
        {/* Transfer logic/component komt hier */}
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
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1><Link to="/" className="app-title-link">TransferMarketSim</Link></h1>
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
          <Route path="/" element={<Home />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/myclub" element={<MyClubPage />} />
          <Route path="/transfers" element={<TransfersPage />} />
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