import React, { useRef } from 'react';
import useClickOutside from '../../../hooks/useClickOutside';
import { getAuctionUrl } from '../../../hooks/useConfig';

/**
 * EditorNavbar - Top navigation bar
 * Shows CodeShare logo, nav links, and login/profile actions
 */
const EditorNavbar = ({ 
  currUser, 
  username,
  dropdownVisibility,
  setDropdownVisibility,
  userProfileIcon,
  profilePicture,
  onNavigate,
  onLogout,
  onShowSubscription,
  RedirectUrlComponent,
  MobileMenuComponent
}) => {
  const profileDropdownRef = useRef(null);
  const auctionUrl = getAuctionUrl();
  
  const handleProfileClick = () => {
    setDropdownVisibility((prev) => {
      var val = structuredClone(prev);
      val.file = false;
      val.history = false;
      val.profile = !val.profile;
      return val;
    });
  };

  const closeProfileDropdown = () => {
    setDropdownVisibility((prev) => ({
      ...prev,
      profile: false
    }));
  };

  // Close dropdown when clicking outside
  useClickOutside(profileDropdownRef, closeProfileDropdown, dropdownVisibility.profile);

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-4">
        {MobileMenuComponent}
        <div className="text-xl font-bold text-blue-600">CodeShare</div>
      </div>
      
      <div className="hidden md:flex items-center gap-6 text-sm">
        {!currUser ? (
          <>
            <button onClick={() => onNavigate("/games")} className="text-gray-700 hover:text-blue-600 transition">Games</button>
            <a 
              href={auctionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-blue-600 flex items-center gap-1 transition"
            >
              Auctions <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">New</span>
            </a>
            <button onClick={() => onNavigate("/help")} className="text-gray-700 hover:text-blue-600 transition">Help</button>
            <button onClick={() => onNavigate("/about")} className="text-gray-700 hover:text-blue-600 transition">About</button>
          </>
        ) : (
          <>
            <button onClick={() => onNavigate("/games")} className="text-gray-700 hover:text-blue-600 transition">Games</button>
            <a 
              href={auctionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-blue-600 flex items-center gap-1 transition"
            >
              Auctions <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full ml-1">New</span>
            </a>
            {(currUser.role === 'admin' || currUser.role === 'moderator') && (
              <button 
                onClick={() => onNavigate(`/p/${currUser._id}/admin`)} 
                className="text-gray-700 hover:text-purple-600 font-semibold transition"
              >
                Admin Panel
              </button>
            )}
            <button onClick={() => onNavigate(`/p/${currUser._id}/help`)} className="text-gray-700 hover:text-blue-600 transition">Help</button>
            <button onClick={() => onNavigate(`/p/${currUser._id}/about`)} className="text-gray-700 hover:text-blue-600 transition">About</button>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {!currUser && <div className="hidden md:block">{RedirectUrlComponent}</div>}
        
        {/* Login/Profile Button */}
        <div className="flex items-center gap-2">
          <div
            onClick={!currUser ? () => onNavigate("/auth/login") : handleProfileClick}
            className={`${currUser ? "p-2 hover:bg-gray-100 rounded-lg" : "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"} text-sm font-medium cursor-pointer transition`}
          >
            {currUser ? userProfileIcon : "Login"}
          </div>
          {!currUser && (
            <button onClick={() => onNavigate("/auth/register")} className="hidden md:inline-flex px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
              Sign Up
            </button>
          )}
          
          {/* Profile Dropdown - Modern Design (Option 1) */}
          {currUser && dropdownVisibility.profile && (
            <div
              ref={profileDropdownRef}
              className="absolute right-0 top-16 z-10 mt-2 w-80 origin-top-right rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden"
              role="menu"
            >
              {/* User Info Header with Gradient */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex-shrink-0">
                    {profilePicture}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-white font-semibold text-left">{username}</div>
                    <div className="text-blue-100 text-xs text-left">{currUser.email || 'user@example.com'}</div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <a 
                  onClick={() => onNavigate(`/p/${currUser._id}/profile`)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition cursor-pointer text-left"
                >
                  <span className="text-xl">👤</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900">My Profile</div>
                    <div className="text-xs text-gray-500">Account settings</div>
                  </div>
                </a>
                
                <a 
                  onClick={() => onNavigate(`/p/${currUser._id}/new`)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition cursor-pointer text-left"
                >
                  <span className="text-xl">📄</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900">My Documents</div>
                    <div className="text-xs text-gray-500">View all pages</div>
                  </div>
                </a>

                <a 
                  href={auctionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition cursor-pointer text-left"
                >
                  <span className="text-xl">🏏</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      Auctions 
                      <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">New</span>
                    </div>
                    <div className="text-xs text-green-600">Visit New Site →</div>
                  </div>
                </a>

                <a 
                  onClick={() => onNavigate("/games")}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition cursor-pointer text-left"
                >
                  <span className="text-xl">🎮</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900">Games</div>
                    <div className="text-xs text-gray-500">Play games</div>
                  </div>
                </a>

                {/* Admin Panel Link - Only for Admin/Moderator */}
                {(currUser.role === 'admin' || currUser.role === 'moderator') && (
                  <>
                    <div className="border-t border-gray-200 my-2"></div>
                    <a 
                      onClick={() => onNavigate(`/p/${currUser._id}/admin`)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 transition cursor-pointer text-left border-l-4 border-purple-600"
                    >
                      <span className="text-xl">⚙️</span>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-semibold text-purple-700">Admin Panel</div>
                        <div className="text-xs text-purple-500">Manage system & users</div>
                      </div>
                    </a>
                  </>
                )}

                <div className="border-t border-gray-200 my-2"></div>

                <a 
                  onClick={() => onNavigate(`/p/${currUser._id}/help`)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition cursor-pointer text-left"
                >
                  <span className="text-xl">❓</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900">Help</div>
                  </div>
                </a>

                <a 
                  onClick={() => onNavigate(`/p/${currUser._id}/about`)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition cursor-pointer text-left"
                >
                  <span className="text-xl">ℹ️</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900">About</div>
                  </div>
                </a>

                <a 
                  onClick={onLogout}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition cursor-pointer text-red-600 text-left"
                >
                  <span className="text-xl">🚪</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold">Logout</div>
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default EditorNavbar;

