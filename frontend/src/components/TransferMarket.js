import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TransferMarket.css';

function TransferMarket() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [userClub, setUserClub] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAuctions();
    fetchUserClub();
    const interval = setInterval(fetchAuctions, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAuctions = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/auctions');
      setAuctions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch auctions:', error);
      setLoading(false);
    }
  };

  const fetchUserClub = async () => {
    try {
      // For now, we'll use the first club as the user's club
      const response = await axios.get('http://localhost:3000/api/clubs');
      if (response.data.length > 0) {
        setUserClub(response.data[0]); // Use first club as user's club
      }
    } catch (error) {
      console.error('Failed to fetch user club:', error);
    }
  };

  const placeBid = async (auctionId) => {
    if (!userClub || !bidAmount) {
      setMessage('Please enter a valid bid amount');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:3000/api/auctions/${auctionId}/bid`, {
        clubId: userClub._id,
        amount: parseInt(bidAmount)
      });
      
      setMessage('Bid placed successfully!');
      setBidAmount('');
      fetchAuctions();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to place bid');
    }
  };

  const buyNow = async (auctionId) => {
    if (!userClub) {
      setMessage('No club selected');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:3000/api/auctions/${auctionId}/buy-now`, {
        clubId: userClub._id
      });
      
      setMessage('Player purchased successfully!');
      fetchAuctions();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to purchase player');
    }
  };

  const formatTimeLeft = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const timeLeft = end - now;

    if (timeLeft <= 0) return 'Ended';

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <div className="transfer-market-loading">Loading transfer market...</div>;
  }

  return (
    <div className="transfer-market">
      <div className="transfer-market-header">
        <h2>Transfer Market</h2>
        {userClub && (
          <div className="user-club-info">
            <span>Your Club: {userClub.name}</span>
            <span>Budget: {formatAmount(userClub.budget)}</span>
          </div>
        )}
      </div>

      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="auctions-grid">
        {auctions.length === 0 ? (
          <div className="no-auctions">
            <p>No active auctions. Players will be listed here when clubs put them up for transfer.</p>
          </div>
        ) : (
          auctions.map(auction => (
            <div key={auction._id} className="auction-card">
              <div className="auction-header">
                <div className="player-info">
                  <h3>{auction.playerName}</h3>
                  <p>Current Club: {auction.currentClub?.name}</p>
                </div>
                <div className="auction-status">
                  <span className={`status ${auction.status}`}>
                    {auction.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="auction-details">
                <div className="price-info">
                  <div className="current-bid">
                    <span>Current Bid:</span>
                    <strong>{formatAmount(auction.currentPrice)}</strong>
                  </div>
                  <div className="buy-now">
                    <span>Buy Now:</span>
                    <strong>{formatAmount(auction.buyNowPrice)}</strong>
                  </div>
                </div>

                <div className="time-left">
                  <span>Time Left:</span>
                  <strong className={formatTimeLeft(auction.endTime) === 'Ended' ? 'ended' : ''}>
                    {formatTimeLeft(auction.endTime)}
                  </strong>
                </div>

                {auction.highestBidder && (
                  <div className="highest-bidder">
                    <span>Highest Bidder:</span>
                    <strong>{auction.highestBidder.name}</strong>
                  </div>
                )}
              </div>

              {auction.status === 'active' && userClub && (
                <div className="auction-actions">
                  <div className="bid-section">
                    <input
                      type="number"
                      placeholder="Enter bid amount"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min={auction.currentPrice + 1000000}
                      step={1000000}
                    />
                    <button 
                      onClick={() => placeBid(auction._id)}
                      disabled={!bidAmount || parseInt(bidAmount) <= auction.currentPrice}
                      className="bid-btn"
                    >
                      Place Bid
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => buyNow(auction._id)}
                    disabled={userClub.budget < auction.buyNowPrice}
                    className="buy-now-btn"
                  >
                    Buy Now
                  </button>
                </div>
              )}

              {auction.bids.length > 0 && (
                <div className="bid-history">
                  <h4>Bid History</h4>
                  <div className="bids-list">
                    {auction.bids.slice(-5).reverse().map((bid, index) => (
                      <div key={index} className="bid-item">
                        <span>{bid.club.name}</span>
                        <span>{formatAmount(bid.amount)}</span>
                        <span>{new Date(bid.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TransferMarket; 