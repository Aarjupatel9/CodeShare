import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gamesConfig from './games.json';
import GameNavbar from './components/GameNavbar';

function GamePage() {
  const [gameData, setGameData] = useState([]);
  const [selectedGameData, setSelectedGameData] = useState([]);
  const [GameComponent, setGameComponent] = useState(null);

  const { gameName } = useParams(); // Get the game name from the URL
  const navigate = useNavigate(); // Used to programmatically navigate

  // Load the JSON file and handle dynamic component loading
  useEffect(() => {
    setGameData(gamesConfig);

    if (gameName) {
      const game = gamesConfig.find(g => g.name === gameName);
      if (game) {
        setSelectedGameData(game);
        const DynamicComponent = lazy(() => import(`./games/${game.name}/${game.component}`));
        setGameComponent(() => DynamicComponent);
      }
    }
  }, [gameName]);

  const handleGameSelect = (game) => {
    // Navigate to /game/{gameName} when a game is selected
    navigate(`/game/${game.name}`);
  };

  return (
    <div className="min-h-full min-w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <GameNavbar setGameComponent={setGameComponent} />
      {GameComponent ? (
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading game...</p>
            </div>
          </div>
        }>
          <GameComponent gameConfiguration={selectedGameData} />
        </Suspense>
      ) : (
        // Game Selection Home Page
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              🎮 Available Games
            </h1>
            <p className="text-gray-600 text-lg">
              Choose a game to play
            </p>
          </div>

          {/* Games Grid */}
          <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
            {gameData && gameData.map((game, index) => (
              <div
                key={index}
                onClick={() => handleGameSelect(game)}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
                style={{ width: '300px', minHeight: '300px' }}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                
                {/* Card Content */}
                <div className="flex flex-col h-full p-8">
                  {/* Game Icon/Emoji */}
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl shadow-lg">
                      🎯
                    </div>
                  </div>
                  
                  {/* Game Name */}
                  <h3 className="text-2xl font-bold text-center text-gray-800 mb-4 capitalize">
                    {game.displayName}
                  </h3>
                  
                  {/* Game Description/Placeholder */}
                  <p className="text-gray-600 text-center mb-6 flex-grow">
                    Play {game.displayName} and have fun!
                  </p>
                  
                  {/* Play Button */}
                  <div className="mt-auto">
                    <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
                      Play Game →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {gameData.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">No games available</h3>
              <p className="text-gray-600">Check back later for new games!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GamePage;
