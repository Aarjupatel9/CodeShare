import React from 'react';
import { useLocation } from 'react-router-dom';

const GameNavbar = ({ selectedGameData, currentView, onNavigateToRoute, safeNavigate: externalSafeNavigate }) => {
  const location = useLocation();

  // Use external safeNavigate if provided (from GamePage), otherwise fallback to regular navigate
  const safeNavigate = externalSafeNavigate;
  const isInGame = location.pathname.includes('/game/');
  

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky z-50 w-full max-w-full">
      <div className="px-2 sm:px-2 lg:px-4">
        <div className="flex justify-between items-center h-16 w-full max-w-full">
          {/* Left Side - Logo & Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => safeNavigate('/games')}
              className="flex items-center text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              <span className="text-2xl">🎮</span>
              <span>Games</span>
            </button>

            <div className="flex items-center">
              {isInGame && (
                <button
                  onClick={() => safeNavigate('/games')}
                  className="px-2 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  ← Back
                </button>
              )}
            </div>
          </div>

          {/* Right Side - Navigation Links */}
          <div className="flex items-center space-x-2">
            {isInGame && selectedGameData?.routes && Object.keys(selectedGameData?.routes).length > 0 && (
              <div className="flex items-center  border-r border-gray-200 pr-2 sm:pr-0 mr-2 sm:mr-0">
                {Object.values(selectedGameData?.routes).filter((route) => route.routeName === 'Home' || route.routeName === 'Rules').map((route) => (
                  <button
                    key={route.routeName}
                    onClick={() => onNavigateToRoute && onNavigateToRoute(route.routePath)}
                    className={`px-3 sm:px-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      currentView === route.routeName
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    title={`Navigate to ${route.displayName}`}
                  >
                    {route.displayName}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => safeNavigate('/')}
              className="py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors hidden sm:block"
            >
              🏠 Main Site
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GameNavbar;

