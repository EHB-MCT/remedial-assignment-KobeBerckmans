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
    
    // Set up real-time updates every 5 seconds
    const interval = setInterval(fetchAuctions, 5000);
    setRefreshInterval(interval);

    // Set up live countdown timer every second
    const timer = setInterval(() => {
      setAuctions(prevAuctions => 
        prevAuctions.map(auction => ({
          ...auction,
          timeLeft: calculateTimeLeft(auction.endTime)
        }))
      );
    }, 1000);
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
      const response = await axios.get('http://localhost:3000/api/auctions');
      const auctions = response.data;
      
      // Add timeLeft to each auction
      const auctionsWithTime = auctions.map(auction => ({
        ...auction,
        timeLeft: calculateTimeLeft(auction.endTime)
      }));
      
      // Process any ended auctions
      for (const auction of auctionsWithTime) {
        if (auction.status === 'active' && auction.timeLeft <= 0) {
          try {
            console.log(`Processing ended auction for ${auction.playerName}`);
            const processResponse = await axios.post(`http://localhost:3000/api/auctions/${auction._id}/process`);
            console.log('Auction processed:', processResponse.data);
            
            // Refresh user club data after processing
            if (userClub && onClubUpdate) {
              try {
                console.log('Refreshing club data after auction processing...');
                const clubResponse = await axios.get(`http://localhost:3000/api/clubs/${userClub._id}`);
                console.log('Updated club data:', clubResponse.data);
                onClubUpdate(clubResponse.data);
              } catch (clubError) {
                console.error('Failed to refresh club data:', clubError);
              }
            }
          } catch (error) {
            console.error(`Failed to process auction ${auction._id}:`, error);
          }
        }
      }
      
      // Fetch updated auctions after processing
      const updatedResponse = await axios.get('http://localhost:3000/api/auctions');
      const updatedAuctions = updatedResponse.data.map(auction => ({
        ...auction,
        timeLeft: calculateTimeLeft(auction.endTime)
      }));
      
      setAuctions(updatedAuctions);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch auctions:', error);
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
      setMessage('✅ Player purchased successfully!');
      
      // Refresh auctions and club data
      fetchAuctions();
      
      // Update club data if onClubUpdate is available
      if (onClubUpdate) {
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
    }
  };

  const manuallyProcessAuction = async (auctionId) => {
    try {
      console.log('Manually processing auction:', auctionId);
      const response = await axios.post(`http://localhost:3000/api/auctions/${auctionId}/process`);
      console.log('Manual process response:', response.data);
      
      // Refresh auctions and club data
      fetchAuctions();
      
      if (onClubUpdate && userClub) {
        try {
          const clubResponse = await axios.get(`http://localhost:3000/api/clubs/${userClub._id}`);
          onClubUpdate(clubResponse.data);
        } catch (clubError) {
          console.error('Failed to refresh club data:', clubError);
        }
      }
      
      setMessage('✅ Auction manually processed!');
    } catch (error) {
      console.error('Manual process error:', error);
      setMessage(`❌ ${error.response?.data?.message || 'Failed to process auction'}`);
    }
  };

  const triggerAutoBidding = async (auctionId) => {
    try {
      console.log('Triggering auto bidding for auction:', auctionId);
      const response = await axios.post(`http://localhost:3000/api/auctions/${auctionId}/auto-bid`);
      console.log('Auto bidding response:', response.data);
      
      // Refresh auctions to show new bids
      fetchAuctions();
      
      setMessage(`🤖 Auto bidding triggered! ${response.data.totalBids} clubs placed bids.`);
    } catch (error) {
      console.error('Auto bidding error:', error);
      setMessage(`❌ ${error.response?.data?.message || 'Failed to trigger auto bidding'}`);
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
                  
                  {/* Test button for manual processing */}
                  <button 
                    onClick={() => manuallyProcessAuction(auction._id)}
                    className="process-btn"
                    style={{ 
                      background: '#6c757d', 
                      color: 'white', 
                      border: 'none', 
                      padding: '5px 10px', 
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Test Process
                  </button>
                  
                  {/* Auto bid button */}
                  <button 
                    onClick={() => triggerAutoBidding(auction._id)}
                    className="auto-bid-btn"
                    style={{ 
                      background: '#17a2b8', 
                      color: 'white', 
                      border: 'none', 
                      padding: '5px 10px', 
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      marginLeft: '5px'
                    }}
                  >
                    🤖 Auto Bid
                  </button>
                </div>
              )}

              {auction.bids.length > 0 && (
                <div className="bid-history">
                  <h4>Recent Bids</h4>
                  <div className="bids-list">
                    {auction.bids.slice(-3).reverse().map((bid, index) => (
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