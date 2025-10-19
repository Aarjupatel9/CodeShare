import React, { useRef, useState, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import useClickOutside from '../../hooks/useClickOutside';
import { userProfileIcon } from '../../assets/svgs';

/**
 * AuctionNavbar - Navigation bar for auction pages
 * Shows: Logo, User Profile, Logout
 */
const AuctionNavbar = ({ onNavigate, onLogout }) => {
  const { currUser } = useContext(UserContext);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useClickOutside(profileDropdownRef, () => setShowProfileDropdown(false), showProfileDropdown);

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const closeProfileDropdown = () => {
    setShowProfileDropdown(false);
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

