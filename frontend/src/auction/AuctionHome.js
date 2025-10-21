import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import AuctionService from '../services/auctionService';
import auctionApi from '../services/api/auctionApi';
import authService from '../services/authService';
import { UserContext } from '../context/UserContext';
import AuctionNavbar from './components/AuctionNavbar';
import PasswordModal from './components/PasswordModal';

// Modal Component - defined outside to prevent re-creation
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 sticky top-0">
            <h3 className="text-2xl font-bold text-white">{title}</h3>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default function AuctionHome() {
  const navigate = useNavigate();
  const { currUser, setCurrUser } = useContext(UserContext);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [joinTab, setJoinTab] = useState('myAuctions'); // 'myAuctions' or 'joinOther'
  const [myAuctions, setMyAuctions] = useState([]);
  const [loadingAuctions, setLoadingAuctions] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    organizer: '',
    password: '',
    confirmPassword: ''
  });

  const [joinOtherData, setJoinOtherData] = useState({
    name: '',
    organizerId: '',
    password: ''
  });

  // Real stats from API
  const [auctionStats, setAuctionStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    setup: 0
  });

  // Get status badge color and text
  const getStatusBadge = (state) => {
    switch(state) {
      case 'running':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Running', icon: '⚡' };
      case 'completed':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed', icon: '✅' };
      case 'setup':
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Setup', icon: '⚙️' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Unknown', icon: '❓' };
    }
  };

  // Handle logout
  const handleLogout = () => {
    authService.logout()
      .then(() => {
        toast.success("Logged out successfully");
        setCurrUser(null);
        navigate('/auth/login');
      })
      .catch((error) => {
        toast.error("Failed to logout");
      });
  };

  // Check authentication on mount
  useEffect(() => {
    authService.checkUserLogInStatus()
      .then((res) => {
        setCurrUser(res.user);
        setIsAuthChecking(false);
      })
      .catch((error) => {
        console.error('Auth check failed:', error);
        if (error === "TokenExpiredError" || error === "jwt expired") {
          toast.error("Session expired. Please login again.");
        }
        navigate('/auth/login');
      });
  }, [navigate, setCurrUser]);

  const fetchMyAuctions = useCallback(async () => {
    try {
      setLoadingAuctions(true);
      
      // Fetch auctions with summary data (includes team/player counts)
      const res = await auctionApi.getAuctions(true);
      
      if (res.success) {
        setMyAuctions(res.data || []);
      }
    } catch (error) {
      console.error('Error fetching auctions:', error);
      toast.error('Failed to load auctions');
    } finally {
      setLoadingAuctions(false);
    }
  }, []);

  const fetchAuctionStats = useCallback(async () => {
    try {
      const res = await auctionApi.getAuctionStats();
      
      if (res.success) {
        setAuctionStats(res.data);
      }
    } catch (error) {
      console.error('Error fetching auction stats:', error);
    }
  }, []);

  // Fetch user's auctions and stats once authenticated
  useEffect(() => {
    if (currUser && !isAuthChecking) {
      fetchMyAuctions();
      fetchAuctionStats();
    }
  }, [currUser, isAuthChecking, fetchMyAuctions, fetchAuctionStats]);

  const resetForm = () => {
    setFormData({ 
      name: '', 
      organizer: '', 
      password: '', 
      confirmPassword: '' 
    });
    setJoinOtherData({ name: '', organizerId: '', password: '' });
    setSelectedAuction(null);
  };

  const validateCreateData = (data) => {
    if (!data.name || data.name.length < 3) {
      toast.error("Auction name must be at least 3 characters", { duration: 3000 });
      return false;
    }
    if (!data.password || data.password.length < 3) {
      toast.error("Password must be at least 3 characters", { duration: 3000 });
      return false;
    }
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match", { duration: 3000 });
      return false;
    }
    return true;
  };

  const validateJoinData = (data) => {
    if (!data.name || data.name.length < 3) {
      toast.error("Auction name must be at least 3 characters", { duration: 3000 });
      return false;
    }
    if (!data.organizerId || data.organizerId.length < 10) {
      toast.error("Please enter a valid Organizer ID", { duration: 3000 });
      return false;
    }
    if (!data.password || data.password.length < 3) {
      toast.error("Password must be at least 3 characters", { duration: 3000 });
      return false;
    }
    return true;
  };

  const handleCreateAuction = (e) => {
    e.preventDefault();
    if (!validateCreateData(formData)) return;

    const toastId = toast.loading("Creating auction...");
    
    // No need to pass organizer - backend will use authenticated user's ID
    AuctionService.createAuction({ 
      name: formData.name,
      password: formData.password 
    })
      .then((res) => {
        toast.dismiss(toastId);
        if (res.result && res.result._id) {
          toast.success("Auction created successfully! Join it from 'My Auctions' to proceed.", { duration: 3000 });
          setShowCreateModal(false);
          resetForm();
          // Refresh the auction list to show new auction
          fetchMyAuctions();
          // Switch to join modal, My Auctions tab
          setTimeout(() => {
            setJoinTab('myAuctions');
            setShowJoinModal(true);
          }, 500);
        }
      })
      .catch((error) => {
        toast.dismiss(toastId);
        if (error === "TokenExpiredError" || error.toString().includes("TokenExpiredError") || error.toString().includes("token expired")) {
          toast.error("Your session has expired. Please login again to continue.");
          navigate('/auth/login');
        } else {
          toast.error(error.toString(), { duration: 3000 });
        }
        console.error(error);
      });
  };

  // Handle opening password modal for joining
  const handleOpenPasswordModal = (auction) => {
    setSelectedAuction(auction);
    setShowPasswordModal(true);
  };

  // Handle password submission from password modal
  const handlePasswordSubmit = (password) => {
    if (!selectedAuction) return;
    
    setIsJoining(true);
    const organizerName = currUser?.username || currUser?.email?.split('@')[0] || '';
    
    AuctionService.getAuction({
      name: selectedAuction.name,
      organizer: organizerName,
      password: password
    })
      .then((res) => {
        toast.success(res.message, { duration: 2000 });
        if (res.auction && res.auction._id) {
          localStorage.setItem("currentAuction", JSON.stringify(res.auction));
          setShowPasswordModal(false);
          setShowJoinModal(false);
          setSelectedAuction(null);
          resetForm();
          navigate(`/p/${currUser._id}/t/auction/${res.auction._id}`);
        }
      })
      .catch((error) => {
        if (error === "TokenExpiredError" || error.toString().includes("TokenExpiredError") || error.toString().includes("token expired")) {
          toast.error("Your session has expired. Please login again to continue.");
          navigate('/auth/login');
        } else {
          toast.error(error.toString(), { duration: 3000 });
        }
        console.error(error);
      })
      .finally(() => {
        setIsJoining(false);
      });
  };

  // Handle quick join from recent auction cards
  const handleQuickJoinAuction = (auction) => {
    // Directly open password modal for quick join
    setSelectedAuction(auction);
    setShowPasswordModal(true);
  };

  const handleJoinOtherAuction = (e) => {
    e.preventDefault();
    if (!validateJoinData(joinOtherData)) return;

    const toastId = toast.loading("Joining auction...");
    // Pass organizerId as organizer to match backend expectations
    AuctionService.getAuction({
      name: joinOtherData.name,
      organizer: joinOtherData.organizerId,
      password: joinOtherData.password
    })
      .then((res) => {
        toast.dismiss(toastId);
        toast.success(res.message, { duration: 2000 });
        if (res.auction && res.auction._id) {
          localStorage.setItem("currentAuction", JSON.stringify(res.auction));
          setShowJoinModal(false);
          resetForm();
          navigate(`/p/${currUser._id}/t/auction/${res.auction._id}`);
        }
      })
      .catch((error) => {
        toast.dismiss(toastId);
        if (error === "TokenExpiredError" || error.toString().includes("TokenExpiredError") || error.toString().includes("token expired")) {
          toast.error("Your session has expired. Please login again to continue.");
          navigate('/auth/login');
        } else {
          toast.error(error.toString(), { duration: 3000 });
        }
        console.error(error);
      });
  };

  // Show loading while checking authentication
  if (isAuthChecking) {
    return (
      <div className="min-h-full min-w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full min-w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Header with AuctionNavbar */}
      <AuctionNavbar 
        onNavigate={navigate}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-6">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Auctions</p>
                <p className="text-3xl font-bold text-gray-900">{auctionStats.total}</p>
              </div>
              <div className="text-4xl">🏏</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Active Now</p>
                <p className="text-3xl font-bold text-green-600">{auctionStats.active}</p>
              </div>
              <div className="text-4xl">⚡</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-600 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{auctionStats.completed}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>

        {/* Recent Auctions */}
        {myAuctions && myAuctions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Your Auctions</h2>
              {myAuctions.length > 3 && (
                <span className="text-blue-600 text-sm font-medium">{myAuctions.length} total</span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {myAuctions.slice(0, 6).map((auction) => {
                const badge = getStatusBadge(auction.state);
                // Use real data from API summary
                const teamCount = auction.summary?.teamCount || 0;
                const playerCount = auction.summary?.playerCount || 0;
                
                return (
                  <div key={auction._id} className="flex flex-col bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-5 border border-gray-100 cursor-pointer" onClick={() => handleQuickJoinAuction(auction)}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-left text-lg mb-1">{auction.name}</h3>
                        <p className="text-sm text-gray-600 text-left ">Organizer: {currUser?.username || 'You'}</p>
                      </div>
                      <span className={`px-3 py-1 ${badge.bg} ${badge.text} rounded-full text-xs font-semibold flex items-center gap-1 flex-shrink-0`}>
                        <span>{badge.icon}</span>
                        <span>{badge.label}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span>👥 {teamCount} Teams</span>
                      <span>🎯 {playerCount} Players</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickJoinAuction(auction);
                      }}
                      className={`mt-auto w-full px-4 py-2.5 ${
                        auction.state === 'running' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : auction.state === 'setup'
                          ? 'bg-gray-600 hover:bg-gray-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white rounded-lg font-semibold transition shadow-sm`}
                    >
                      {auction.state === 'running' ? 'Continue →' : auction.state === 'setup' ? 'Setup →' : 'View Results →'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Create Auction Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
                <div className="text-5xl mb-3">🎯</div>
                <h2 className="text-2xl font-bold mb-2">Create New Auction</h2>
                <p className="text-blue-100">Start a fresh auction and invite participants</p>
              </div>
            <div className="p-6">
              <ul className="space-y-2.5 mb-6">
                <li className="flex items-start gap-2 text-gray-700 text-sm">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Set up teams and budgets</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700 text-sm">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Add players to auction pool</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700 text-sm">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Control the bidding process</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700 text-sm">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Real-time updates</span>
                </li>
              </ul>
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg transition transform hover:scale-105"
              >
                🎯 Create Auction
              </button>
            </div>
          </div>

          {/* Join Auction Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white">
              <div className="text-5xl mb-3">🤝</div>
              <h2 className="text-2xl font-bold mb-2">Join Existing Auction</h2>
              <p className="text-indigo-100">Continue an ongoing auction session</p>
            </div>
            <div className="p-6">
              <ul className="space-y-2.5 mb-6">
                <li className="flex items-start gap-2 text-gray-700 text-sm">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Resume where you left off</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700 text-sm">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>View live bidding updates</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700 text-sm">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Manage your auction data</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700 text-sm">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Access all features</span>
                </li>
              </ul>
              <button
                onClick={() => {
                  resetForm();
                  setJoinTab('myAuctions');
                  setShowJoinModal(true);
                }}
                className="w-full px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transition transform hover:scale-105"
              >
                🤝 Join Auction
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Auction Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create New Auction"
      >
        <form onSubmit={handleCreateAuction} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 text-left">
              <span className="font-semibold">Organizer:</span> {currUser?.username || currUser?.email?.split('@')[0] || 'You'}
            </p>
        </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Auction Name *
            </label>
          <input
            type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., IPL 2025 Auction"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Password *
            </label>
          <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Secure password for auction access"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Confirm Password *
            </label>
          <input
            type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Re-enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
          />
        </div>
          
          <div className="flex gap-3 mt-6">
          <button
              type="button"
            onClick={() => {
                setShowCreateModal(false);
                resetForm();
            }}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition"
          >
            Cancel
          </button>
          <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-bold transition shadow-lg"
          >
              Create Auction
          </button>
        </div>
      </form>
      </Modal>

      {/* Join Auction Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          resetForm();
        }}
        title="Join Auction"
      >
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setJoinTab('myAuctions')}
            className={`flex-1 py-3 px-4 font-semibold transition ${
              joinTab === 'myAuctions'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Auctions ({myAuctions.length})
          </button>
          <button
            type="button"
            onClick={() => setJoinTab('joinOther')}
            className={`flex-1 py-3 px-4 font-semibold transition ${
              joinTab === 'joinOther'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Join Other's Auction
          </button>
        </div>

        {/* My Auctions Tab */}
        {joinTab === 'myAuctions' && (
          <div>
            {loadingAuctions ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                Loading your auctions...
              </div>
            ) : myAuctions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-gray-600 mb-4">You haven't created any auctions yet.</p>
                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setShowCreateModal(true);
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  Create Your First Auction
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {myAuctions.map((auction) => {
                  const badge = getStatusBadge(auction.state);
                  return (
                    <div key={auction._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg mb-1">{auction.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Created: {new Date(auction.createdAt).toLocaleDateString()}
                          </p>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 ${badge.bg} ${badge.text} rounded-full text-xs font-semibold`}>
                            <span>{badge.icon}</span>
                            <span>{badge.label}</span>
                          </span>
                        </div>
                        <button
                          onClick={() => handleOpenPasswordModal(auction)}
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm whitespace-nowrap self-start"
                        >
                          Join →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Join Other's Auction Tab */}
        {joinTab === 'joinOther' && (
          <form onSubmit={handleJoinOtherAuction} className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-indigo-800">
                Enter the auction details provided by the organizer to join their auction.
              </p>
        </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Auction Name *
              </label>
          <input
            type="text"
                value={joinOtherData.name}
                onChange={(e) => setJoinOtherData({ ...joinOtherData, name: e.target.value })}
                placeholder="Enter auction name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-700 text-left">
                  Organizer ID *
                </label>
                <div className="group relative">
                  <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-10">
                    <p className="font-semibold mb-1">How to find Organizer ID:</p>
                    <p>Ask the auction organizer to share their User ID from their profile page (click profile icon → My Profile → copy User ID)</p>
                    <div className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                  </div>
                </div>
              </div>
          <input
            type="text"
                value={joinOtherData.organizerId}
                onChange={(e) => setJoinOtherData({ ...joinOtherData, organizerId: e.target.value })}
                placeholder="e.g., 676ea66aea46eee8df13e77b"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Password *
              </label>
          <input
                type="password"
                value={joinOtherData.password}
                onChange={(e) => setJoinOtherData({ ...joinOtherData, password: e.target.value })}
                placeholder="Enter auction password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
          />
        </div>
            
            <div className="flex gap-3 mt-6">
          <button
                type="button"
            onClick={() => {
                  setShowJoinModal(false);
                  resetForm();
            }}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition"
          >
            Cancel
          </button>
          <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-bold transition shadow-lg"
              >
                Join Auction
          </button>
        </div>
          </form>
        )}
      </Modal>

      {/* Password Modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setSelectedAuction(null);
        }}
        onSubmit={handlePasswordSubmit}
        auctionName={selectedAuction?.name || ''}
        isLoading={isJoining}
      />
      </div>
  );
}
