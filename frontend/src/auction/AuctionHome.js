import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import AuctionService from '../services/auctionService';
import authService from '../services/authService';
import { UserContext } from '../context/UserContext';
import AuctionNavbar from './components/AuctionNavbar';

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
  const [joinTab, setJoinTab] = useState('myAuctions'); // 'myAuctions' or 'joinOther'
  const [myAuctions, setMyAuctions] = useState([]);
  const [loadingAuctions, setLoadingAuctions] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState(null);
  
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
      const response = await fetch((await (await fetch('/config.json')).json()).backend_url + '/api/v1/auctions', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const res = await response.json();
      if (res.success) {
        setMyAuctions(res.data || []);
      }
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoadingAuctions(false);
    }
  }, []);

  // Fetch user's auctions once authenticated
  useEffect(() => {
    if (currUser && !isAuthChecking) {
      fetchMyAuctions();
    }
  }, [currUser, isAuthChecking, fetchMyAuctions]);

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
        if (error === "TokenExpiredError" || error.toString().includes("TokenExpiredError")) {
          toast.error("Session expired. Please login again.");
          navigate('/auth/login');
        } else {
          toast.error(error.toString(), { duration: 3000 });
        }
        console.error(error);
      });
  };

  const handleJoinMyAuction = (auction, password) => {
    const toastId = toast.loading("Joining auction...");
    const organizerName = currUser?.username || currUser?.email?.split('@')[0] || '';
    AuctionService.getAuction({
      name: auction.name,
      organizer: organizerName,
      password: password
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
        if (error === "TokenExpiredError" || error.toString().includes("TokenExpiredError")) {
          toast.error("Session expired. Please login again.");
          navigate('/auth/login');
        } else {
          toast.error(error.toString(), { duration: 3000 });
        }
        console.error(error);
      });
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
        if (error === "TokenExpiredError" || error.toString().includes("TokenExpiredError")) {
          toast.error("Session expired. Please login again.");
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
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero Widget */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-2xl p-8 md:p-12 mb-12 overflow-hidden">
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -ml-48 -mb-48"></div>
          </div>
          
          <div className="relative text-center">
            <div className="text-6xl md:text-7xl mb-6">🏏</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Auction Management
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
              Create and manage cricket/sports auctions with real-time bidding and team management
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Create Auction Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-white">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-3xl font-bold mb-2">Create New Auction</h2>
              <p className="text-blue-100">Start a fresh auction and invite participants</p>
            </div>
            <div className="p-8">
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Set up teams and budgets</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Add players to auction pool</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Control the bidding process</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Real-time updates for all participants</span>
                </li>
              </ul>
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg transition transform hover:scale-105"
              >
                Create Auction
              </button>
            </div>
          </div>

          {/* Join Auction Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white">
              <div className="text-6xl mb-4">🤝</div>
              <h2 className="text-3xl font-bold mb-2">Join Existing Auction</h2>
              <p className="text-indigo-100">Continue an ongoing auction session</p>
            </div>
            <div className="p-8">
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Resume where you left off</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>View live bidding updates</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Manage your auction data</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Access all auction features</span>
                </li>
              </ul>
              <button
                onClick={() => {
                  resetForm();
                  setJoinTab('myAuctions');
                  setShowJoinModal(true);
                }}
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-lg transition transform hover:scale-105"
              >
                Join Auction
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            ✨ Auction Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="font-bold text-gray-900 mb-2">Team Management</h3>
              <p className="text-sm text-gray-600">Create teams, set budgets, and track spending in real-time</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="text-4xl mb-3">🎮</div>
              <h3 className="font-bold text-gray-900 mb-2">Live Bidding</h3>
              <p className="text-sm text-gray-600">Real-time bidding interface with instant updates</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-bold text-gray-900 mb-2">Player Analytics</h3>
              <p className="text-sm text-gray-600">Detailed player stats and auction analytics</p>
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
                {myAuctions.map((auction) => (
                  <div key={auction._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg mb-1">{auction.name}</h4>
                        <p className="text-sm text-gray-600">
                          Created: {new Date(auction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const password = e.target.elements.password.value;
                      handleJoinMyAuction(auction, password);
                    }}>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          name="password"
                          placeholder="Enter password"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          required
                        />
                        <button
                          type="submit"
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm"
          >
            Join
          </button>
        </div>
      </form>
                  </div>
                ))}
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
    </div>
  );
}
