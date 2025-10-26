import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GameNavbar = ({ setGameComponent }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isInGame = location.pathname.includes('/game/');

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky z-50">
      <div className="px-2 sm:px-4 lg:px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Logo & Navigation */}
          <div className="flex items-center space-x-8">
            <button
              onClick={() => navigate('/games')}
              className="flex items-center space-x-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              <span className="text-2xl">🎮</span>
              <span>Games</span>
            </button>

            <div className="flex items-center space-x-1">
              {isInGame && (
                <button
                  onClick={() => {setGameComponent(null); navigate(-1);}}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  ← Back
                </button>
              )}
            </div>
          </div>

          {/* Right Side - Navigation Links */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors hidden sm:block"
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

