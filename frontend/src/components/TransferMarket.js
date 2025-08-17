import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TransferMarket.css';

function TransferMarket({ user, club, onClubUpdate }) {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [userClub, setUserClub] = useState(null);
  const [message, setMessage] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [timerInterval, setTimerInterval] = useState(null);

  useEffect(() => {
    if (club) {
      setUserClub(club);
      fetchAuctions();
    }
    
    // Set up real-time updates every 10 seconds for live bidding (slower to prevent race conditions)
    const interval = setInterval(fetchAuctions, 10000);
    setRefreshInterval(interval);

    // Set up live countdown timer every 5 seconds (slower to prevent conflicts)
    const timer = setInterval(() => {
      setAuctions(prevAuctions => 
        prevAuctions.map(auction => ({
          ...auction,
          timeLeft: calculateTimeLeft(auction.endTime)
        }))
      );
    }, 5000);
    setTimerInterval(timer);

    return () => {
      if (interval) clearInterval(interval);
      if (timer) clearInterval(timer);
    };
  }, [club]);

  const calculateTimeLeft = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const timeLeft = end - now;
    return Math.max(0, timeLeft);
  };

  const fetchAuctions = async () => {
    try {
      console.log('🔄 Fetching auctions...');
      const response = await axios.get('http://localhost:3000/api/auctions');
      const auctions = response.data;
      
      console.log(`📋 Found ${auctions.length} auctions:`, auctions.map(a => `${a.playerName} (${a.status})`));
      
      // Add timeLeft to each auction
      const auctionsWithTime = auctions.map(auction => ({
        ...auction,
        timeLeft: calculateTimeLeft(auction.endTime)
      }));
      
      // Only show active auctions to prevent confusion
      const activeAuctions = auctionsWithTime.filter(auction => auction.status === 'active');
      
      console.log(`📊 Setting ${activeAuctions.length} active auctions to state`);
      setAuctions(activeAuctions);
      setLoading(false);
    } catch (error) {
      console.error('❌ Failed to fetch auctions:', error);
      setLoading(false);
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
      
      setMessage('✅ Bid placed successfully!');
      setBidAmount('');
      fetchAuctions(); // Immediate refresh
    } catch (error) {
      console.error('Bid error:', error.response?.data);
      setMessage(`❌ ${error.response?.data?.message || 'Failed to place bid'}`);
    }
  };

  const buyNow = async (auctionId) => {
    if (!userClub) {
      setMessage('No club selected');
      return;
    }

    try {
      console.log('Attempting buy now for auction:', auctionId);
      console.log('User club budget:', userClub.budget);
      
      const response = await axios.post(`http://localhost:3000/api/auctions/${auctionId}/buy-now`, {
        clubId: userClub._id
      });
      
      console.log('Buy now response:', response.data);
      
      // Show the special buy now message from the server
      if (response.data.buyNowMessage) {
        setMessage(response.data.buyNowMessage);
      } else {
        // Fallback message
        const auction = auctions.find(a => a._id === auctionId);
        if (auction) {
          setMessage(`💎 ${userClub.name} used BUY NOW to purchase ${auction.playerName} for ${formatAmount(auction.buyNowPrice)}!`);
        } else {
          setMessage('✅ Player purchased successfully with BUY NOW!');
        }
      }
      
      // Update club data if provided in response
      if (response.data.updatedClub && onClubUpdate) {
        onClubUpdate(response.data.updatedClub);
      }
      
      // Refresh auctions and club data
      fetchAuctions();
      
      // Update club data if onClubUpdate is available and not already updated
      if (onClubUpdate && !response.data.updatedClub) {
        try {
          const clubResponse = await axios.get(`http://localhost:3000/api/clubs/${userClub._id}`);
          onClubUpdate(clubResponse.data);
        } catch (clubError) {
          console.error('Failed to refresh club data after purchase:', clubError);
        }
      }
    } catch (error) {
      console.error('Buy now error:', error);
      console.error('Error response:', error.response?.data);
      setMessage(`❌ ${error.response?.data?.message || 'Failed to purchase player'}`);
      
      // Refresh auctions to get latest status
      fetchAuctions();
    }
  };

  const formatTimeLeft = (timeLeft) => {
    if (timeLeft <= 0) return 'Ended';

    const minutes = Math.floor(timeLeft / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTimeLeftColor = (timeLeft) => {
    if (timeLeft <= 0) return 'ended';
    if (timeLeft <= 60000) return 'urgent'; // Less than 1 minute
    if (timeLeft <= 300000) return 'warning'; // Less than 5 minutes
    return 'normal';
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
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="auctions-grid">
        {auctions.length === 0 ? (
          <div className="no-auctions">
            <p>No active auctions. Run a daily simulation to create new auctions!</p>
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
                  <strong className={`time-${getTimeLeftColor(auction.timeLeft)}`}>
                    {formatTimeLeft(auction.timeLeft)}
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
                      placeholder={`Min bid: ${formatAmount(auction.currentPrice + 1000000)}`}
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
                    title={`Your budget: ${formatAmount(userClub.budget)} | Buy now price: ${formatAmount(auction.buyNowPrice)}`}
                  >
                    Buy Now
                  </button>
                </div>
              )}

              {auction.bids.length > 0 && (
                <div className="bid-history">
                  <h4>🔴 Live Bid History</h4>
                  <div className="bids-list">
                    {auction.bids.slice(-5).reverse().map((bid, index) => (
                      <div key={index} className={`bid-item ${index === 0 ? 'latest-bid' : ''}`}>
                        <span className="bidder-name">{bid.club.name}</span>
                        <span className="bid-amount">{formatAmount(bid.amount)}</span>
                        <span className="bid-time">{new Date(bid.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                  {auction.bids.length > 5 && (
                    <div className="more-bids">
                      <small>... and {auction.bids.length - 5} more bids</small>
                    </div>
                  )}
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