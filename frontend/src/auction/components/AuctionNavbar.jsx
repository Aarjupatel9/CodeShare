import React, { useRef, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import useClickOutside from '../../hooks/useClickOutside';
import { userProfileIcon } from '../../assets/svgs';
import toast from 'react-hot-toast';

/**
 * AuctionNavbar - Navigation bar for auction pages
 * Shows: Logo, Quick Links, User Profile, Logout
 */
const AuctionNavbar = ({ onNavigate, onLogout, auction }) => {
  const { currUser } = useContext(UserContext);
  const { auctionId } = useParams();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showQuickLinks, setShowQuickLinks] = useState(false);
  const profileDropdownRef = useRef(null);
  const quickLinksRef = useRef(null);

  // Close dropdowns when clicking outside
  useClickOutside(profileDropdownRef, () => setShowProfileDropdown(false), showProfileDropdown);
  useClickOutside(quickLinksRef, () => setShowQuickLinks(false), showQuickLinks);

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const closeProfileDropdown = () => {
    setShowProfileDropdown(false);
  };

  const handleQuickLinksClick = () => {
    setShowQuickLinks(!showQuickLinks);
  };

  const closeQuickLinks = () => {
    setShowQuickLinks(false);
  };

  // Quick navigation functions
  const navigateToDashboard = () => {
    closeQuickLinks();
    onNavigate(`/p/${currUser?._id}/t/auction/${auctionId}`);
  };

  const navigateToBidding = () => {
    closeQuickLinks();
    onNavigate(`/p/${currUser?._id}/t/auction/${auctionId}/bidding`);
  };

  const navigateToSetup = () => {
    closeQuickLinks();
    onNavigate(`/p/${currUser?._id}/t/auction/${auctionId}/manage`);
  };

  const navigateToLiveView = () => {
    closeQuickLinks();
    
    // Check if live view is enabled
    if (!auction?.auctionLiveEnabled) {
      toast.error('Live view is disabled! Please enable it in Auction Settings first.', {
        duration: 4000,
        icon: '🔒',
      });
      return;
    }
    
    onNavigate(`/t/auction/${auctionId}/live`);
  };

  const navigateToAuctionHome = () => {
    closeQuickLinks();
    onNavigate(`/p/${currUser?._id}/t/auction`);
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
      {/* Left: Logo */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => onNavigate('/')} 
          className="text-xl font-bold text-blue-600 hover:text-blue-700 transition"
        >
          CodeShare
        </button>
      </div>

      {/* Center: Quick Links (only show if auctionId exists) */}
      {auctionId && (
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={handleQuickLinksClick}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-2"
            >
              <span>⚡</span>
              <span>Quick Links</span>
              <span className={`transform transition-transform ${showQuickLinks ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {/* Quick Links Dropdown */}
            {showQuickLinks && (
              <div
                ref={quickLinksRef}
                className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
              >
                {/* Quick Navigation Items */}
                <div className="py-1">
                  <button
                    onClick={navigateToDashboard}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-3"
                  >
                    <span className="text-lg">📊</span>
                    <div>
                      <div className="font-medium">Dashboard</div>
                      <div className="text-xs text-gray-500">Overview & Stats</div>
                    </div>
                  </button>

                  <button
                    onClick={navigateToBidding}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-3"
                  >
                    <span className="text-lg">🎮</span>
                    <div>
                      <div className="font-medium">Live Bidding</div>
                      <div className="text-xs text-gray-500">Start/Continue Auction</div>
                    </div>
                  </button>

                  <button
                    onClick={navigateToSetup}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-3"
                  >
                    <span className="text-lg">⚙️</span>
                    <div>
                      <div className="font-medium">Setup & Manage</div>
                      <div className="text-xs text-gray-500">Teams, Players, Sets</div>
                    </div>
                  </button>

                  <button
                    onClick={navigateToLiveView}
                    className={`w-full text-left px-4 py-2 text-sm transition flex items-center gap-3 ${
                      !auction?.auctionLiveEnabled 
                        ? 'text-gray-400 hover:bg-red-50 cursor-not-allowed' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{auction?.auctionLiveEnabled ? '📺' : '🔒'}</span>
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        Live View
                        {!auction?.auctionLiveEnabled && (
                          <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded">Disabled</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {auction?.auctionLiveEnabled ? 'Public Spectator Page' : 'Enable in Settings first'}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Separator */}
                <div className="border-t border-gray-100 my-1"></div>

                {/* Back to Auctions */}
                <div className="py-1">
                  <button
                    onClick={navigateToAuctionHome}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition flex items-center gap-3"
                  >
                    <span className="text-lg">🏠</span>
                    <div>
                      <div className="font-medium">All Auctions</div>
                      <div className="text-xs text-gray-500">Back to auction list</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right: User Profile */}
      <div className="flex items-center gap-4">
        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={handleProfileClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title={currUser?.username || 'User Profile'}
          >
            {userProfileIcon}
          </button>

          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div
              ref={profileDropdownRef}
              className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
            >
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">
                  {currUser?.username || 'User'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {currUser?.email || ''}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    closeProfileDropdown();
                    onNavigate(`/p/${currUser?._id}/profile`);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  👤 My Profile
                </button>

                <button
                  onClick={() => {
                    closeProfileDropdown();
                    onNavigate(`/p/${currUser?._id}/help`);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  ❓ Help
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    closeProfileDropdown();
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition font-medium"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AuctionNavbar;

