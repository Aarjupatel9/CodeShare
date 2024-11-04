import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gamesConfig from './games.json';

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

  const handleGameSelect = (index) => {
    const game = gameData[index];
    // Navigate to /game/{gameName} when a game is selected
    navigate(`/game/${game.name}`);
  };

  return (
    <div className='flex flex-col p-2 h-full w-full'>
      {GameComponent ? (
        <Suspense fallback={<div>Loading...</div>}>
          <GameComponent gameConfiguration={selectedGameData} />
        </Suspense>
      ) : (
        <div className='flex flex-col jsutify-center mt-2'>
          <div className='p-2 text-xl font-bold my-5'>Games</div>
          <div className='flex flex-row justify-center flex-wrap'>
            {gameData && gameData.map((game, index) => (
              <div
                key={index}
                className='font-bold text-xl  flex p-3 min-h-36 min-w-36 max-h-48 max-w-48 bg-gray-200 justify-center items-center capitalize cursor-pointer rounded'
                onClick={() => handleGameSelect(index)}
              >
                {game.displayName}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GamePage ;
