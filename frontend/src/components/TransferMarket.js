/**
 * Transfer Market Component
 * 
 * This component handles the live auction system for the transfer market.
 * It provides real-time bidding, buy-now functionality, and auction management.
 * 
 * @author Kobe Berckmans
 * @version 1.0.0
 * @license MIT
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TransferMarket.css';

/**
 * Transfer Market Component
 * Manages live auctions, bidding, and buy-now functionality
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object
 * @param {Object} props.club - Current club object
 * @param {Function} props.onClubUpdate - Callback function for club updates
 * @returns {JSX.Element} Transfer market component
 */
function TransferMarket({ user, club, onClubUpdate }) {
  // State management for auctions and bidding
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [userClub, setUserClub] = useState(null);
  const [message, setMessage] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [timerInterval, setTimerInterval] = useState(null);

  /**
   * Effect hook to initialize component and set up real-time updates
   * Fetches auctions and sets up intervals for live updates
   */
  useEffect(() => {
    if (club) {
      setUserClub(club);
      fetchAuctions();
    }
    
    // Set up real-time updates every 10 seconds for live bidding
    const interval = setInterval(fetchAuctions, 10000);
    setRefreshInterval(interval);

    // Set up live countdown timer every 5 seconds
    const timer = setInterval(() => {
      setAuctions(prevAuctions => 
        prevAuctions.map(auction => ({
          ...auction,
          timeLeft: calculateTimeLeft(auction.endTime)
        }))
      );
    }, 5000);
    setTimerInterval(timer);

    // Cleanup intervals on component unmount
    return () => {
      if (interval) clearInterval(interval);
      if (timer) clearInterval(timer);
    };
  }, [club]);

  /**
   * Calculates the time remaining until auction ends
   * 
   * @param {string} endTime - Auction end time as ISO string
   * @returns {number} Time remaining in milliseconds
   */
  const calculateTimeLeft = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const timeLeft = end - now;
    return Math.max(0, timeLeft);
  };

  /**
   * Fetches all active auctions from the API
   * Updates the auctions state with current auction data
   */
  const fetchAuctions = async () => {
    try {
      console.log('Fetching auctions...');
      const response = await axios.get('http://localhost:3000/api/auctions');
      const auctions = response.data;
      
      console.log(`Found ${auctions.length} auctions:`, auctions.map(a => `${a.playerName} (${a.status})`));
      
      // Add timeLeft to each auction
      const auctionsWithTime = auctions.map(auction => ({
        ...auction,
        timeLeft: calculateTimeLeft(auction.endTime)
      }));
      
      // Only show active auctions to prevent confusion
      const activeAuctions = auctionsWithTime.filter(auction => auction.status === 'active');
      
      console.log(`Setting ${activeAuctions.length} active auctions to state`);
      setAuctions(activeAuctions);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch auctions:', error);
      setLoading(false);
    }
  };

  /**
   * Places a bid on an active auction
   * 
   * @param {string} auctionId - ID of the auction to bid on
   */
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
      fetchAuctions(); // Immediate refresh
    } catch (error) {
      console.error('Bid error:', error.response?.data);
      setMessage(`${error.response?.data?.message || 'Failed to place bid'}`);
    }
  };

  /**
   * Executes a buy-now purchase for an auction
   * 
   * @param {string} auctionId - ID of the auction to buy
   */
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
      
      // Update club data if provided in response
      if (response.data.updatedClub) {
        setUserClub(response.data.updatedClub);
        onClubUpdate(response.data.updatedClub);
      } else {
        // Fetch updated club data
        const clubResponse = await axios.get(`http://localhost:3000/api/clubs/${userClub._id}`);
        setUserClub(clubResponse.data);
        onClubUpdate(clubResponse.data);
      }
      
      fetchAuctions(); // Refresh auctions
    } catch (error) {
      console.error('Buy now error:', error.response?.data);
      setMessage(`${error.response?.data?.message || 'Failed to purchase player'}`);
    }
  };

  /**
   * Formats time remaining into a human-readable string
   * 
   * @param {number} timeLeft - Time remaining in milliseconds
   * @returns {string} Formatted time string
   */
  const formatTimeLeft = (timeLeft) => {
    if (timeLeft <= 0) return 'Ended';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  /**
   * Formats currency amounts for display
   * 
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Determines the color class for time remaining display
   * 
   * @param {number} timeLeft - Time remaining in milliseconds
   * @returns {string} CSS class name for color
   */
  const getTimeLeftColor = (timeLeft) => {
    if (timeLeft <= 0) return 'time-ended';
    if (timeLeft < 60000) return 'time-critical'; // Less than 1 minute
    if (timeLeft < 300000) return 'time-warning'; // Less than 5 minutes
    return 'time-normal';
  };

  // Show loading state while fetching data
  if (loading) {
    return <div className="loading">Loading auctions...</div>;
  }

  return (
    <div className="transfer-market">
      <div className="market-header">
        <h2>Live Auctions</h2>
        <p>Bid on players or use Buy Now for immediate purchase</p>
        {message && <div className="message">{message}</div>}
      </div>

      {auctions.length === 0 ? (
        <div className="no-auctions">
          <p>No active auctions at the moment.</p>
          <p>Check back later for new player listings!</p>
        </div>
      ) : (
        <div className="auctions-grid">
          {auctions.map((auction) => (
            <div key={auction._id} className="auction-card">
              <div className="auction-header">
                <h3>{auction.playerName}</h3>
                <span className={`time-left ${getTimeLeftColor(auction.timeLeft)}`}>
                  {formatTimeLeft(auction.timeLeft)}
                </span>
              </div>
              
              <div className="auction-details">
                <p><strong>Current Bid:</strong> {formatAmount(auction.currentPrice)}</p>
                <p><strong>Buy Now:</strong> {formatAmount(auction.buyNowPrice)}</p>
                <p><strong>Seller:</strong> {auction.currentClub?.name || 'Unknown'}</p>
                {auction.highestBidder && (
                  <p><strong>Highest Bidder:</strong> {auction.highestBidder.name}</p>
                )}
              </div>

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
                  >
                    Place Bid
                  </button>
                </div>
                
                <button 
                  className="buy-now-btn"
                  onClick={() => buyNow(auction._id)}
                  disabled={!userClub || userClub.budget < auction.buyNowPrice}
                >
                  Buy Now ({formatAmount(auction.buyNowPrice)})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TransferMarket; 