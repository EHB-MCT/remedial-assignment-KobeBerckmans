import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>TransferMarketSim</h1>
        <nav>
          <ul className="nav-list">
            <li><a href="#clubs">Clubs</a></li>
            <li><a href="#players">Players</a></li>
            <li><a href="#transfers">Transfers</a></li>
            <li><a href="#history">History</a></li>
          </ul>
        </nav>
      </header>
      <main className="app-main">
        <section id="clubs">
          <h2>Clubs</h2>
          {/* Club list/component komt hier */}
        </section>
        <section id="players">
          <h2>Players</h2>
          {/* Player list/component komt hier */}
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
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} TransferMarketSim</p>
      </footer>
    </div>
  );
}

export default App; 