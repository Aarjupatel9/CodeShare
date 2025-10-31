import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import gamesConfig from './games.json';
import GameNavbar from './components/GameNavbar';
import { GameProvider } from './context/GameContext';
import useSafeNavigate from './hooks/useSafeNavigate';

function GamePageContent() {
  const [gameData, setGameData] = useState([]);
  const [selectedGameData, setSelectedGameData] = useState([]);
  const [gameRoutes, setGameRoutes] = useState([]); // Array of route configs for nested routing
  const [componentsLoaded, setComponentsLoaded] = useState(false);
  const [loadedGameName, setLoadedGameName] = useState(null);

  const { gameName, routeName } = useParams();
  const location = useLocation();
  const { safeNavigate, NavigationWarningModal } = useSafeNavigate();

  // Load all components upfront when game is selected
  useEffect(() => {
    setGameData(gamesConfig);

    if (gameName) {
      const game = gamesConfig.find(g => g.name === gameName);
      if (game) {
        setSelectedGameData(game);

        // Only load routes if not already loaded for this game
        if (!componentsLoaded || loadedGameName !== game.name) {
          const routes = [];
          const routeConfigs = []; // For nested Routes
          
          if (typeof game.component === 'object') {
            Object.entries(game.component).forEach(([routeName, routeConfig]) => {
              let componentPath, routePath, displayName;
              
              if (typeof routeConfig === 'object' && routeConfig.component) {
                componentPath = routeConfig.component;
                displayName = routeConfig.displayName;
                routePath = routeConfig.path || `/${routeName.toLowerCase()}`;
              } else {
                return; // Skip invalid entries
              }
              
              const DynamicComponent = lazy(() => import(`./games/${game.name}/${componentPath}`));
              
              routeConfigs.push({
                path: routePath === '/' ? '' : routePath.replace(/^\//, ''), // Remove leading slash for nested route
                element: DynamicComponent,
                routeName: routeName,
                displayName: displayName
              });
              
              routes[routePath] = {routeName: routeName, displayName: displayName, routePath: routePath} ;
            });
          }


          setGameRoutes(routeConfigs);
          setSelectedGameData({ ...game, routes });
          setComponentsLoaded(true);
          setLoadedGameName(game.name);
        } else {
          // Still update selectedGameData with latest game config while preserving routePaths
          setSelectedGameData(prev => ({ 
            ...prev, 
            ...game, 
            routes: prev.routes || {} 
          }));
        }

      }
    } else {
      // Reset when no game selected
      setGameRoutes([]);
      setComponentsLoaded(false);
      setLoadedGameName(null);
    }
  }, [gameName]);
  
  // Determine current view from URL for navbar highlighting
  const getCurrentView = () => {
    if (!gameName || !selectedGameData?.routes) return null;
    
    const currentPath = location.pathname;
    const basePath = `/game/${gameName}`;
    
    if (routeName) {
      if (selectedGameData?.routes[routeName]) {
        return selectedGameData?.routes[routeName].displayName;
      }
    }
    
    return "*";
  };
  
  const currentView = getCurrentView();

  // Internal router navigation function (no component reload)
  const navigateToRoute = (route) => {
    if (!selectedGameData?.routes[route]) return;
    
    // Update URL based on route path from config - React Router will handle rendering
    const routePath = selectedGameData?.routes?.[route]?.routePath || selectedGameData?.routes?.['*']?.routePath;
    if (routePath) {
      const basePath = `/game/${gameName}`;
      const fullPath = routePath === '/' ? basePath : `${basePath}${routePath}`;
      safeNavigate(fullPath, { replace: true });
    } 
  };


  return (
    <div className="h-full w-full min-h-full max-h-full min-w-full max-w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      <GameNavbar 
        currentView={currentView}
        onNavigateToRoute={navigateToRoute}
        safeNavigate={safeNavigate}
        selectedGameData={selectedGameData}
      />
      <NavigationWarningModal />
      {componentsLoaded && gameName && gameRoutes.length > 0 ? (
        <Routes>
          {/* Dynamic routes from config - sort so non-empty paths come first, then empty path (Home) */}
          {gameRoutes
            .sort((a, b) => {
              // Put empty path (Home) at the end
              if (a.path === '' && b.path !== '') return 1;
              if (a.path !== '' && b.path === '') return -1;
              return 0;
            })
            .map(({ path, element: Component, routeName }) => (
              <Route
                key={routeName}
                path={path === '' ? '/' : path}
                element={
                  <Suspense fallback={
                    <div className="flex items-center justify-center min-h-screen">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading {routeName}...</p>
                      </div>
                    </div>
                  }>
                    <Component gameConfiguration={selectedGameData} />
                  </Suspense>
                }
              />
            ))}
          {/* Catch-all redirect to home */}
          <Route 
            path="*" 
            element={
              <Navigate to="/" replace />
            } 
          />
        </Routes>
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

                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
                style={{ width: '300px', minHeight: '300px' }}
              >
                {/* Gradient Overlay */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                
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
                    {game.description}
                  </p>
                  
                  {/* Play Button */}
                  <div className="mt-auto space-y-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        safeNavigate(`/game/${game.name}`);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      Play Game →
                    </button>
                    {game.component && typeof game.component === 'object' && game.component.Rules && game.component.Rules.path && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          safeNavigate(`/game/${game.name}${game.component.Rules.path}`);
                        }}
                        className="w-full bg-white border-2 border-blue-600 text-blue-600 font-semibold py-2 px-6 rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        📖 View Rules
                      </button>
                    )}
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

// Wrap GamePage with GameProvider
function GamePage() {
  return (
    <GameProvider>
      <GamePageContent />
    </GameProvider>
  );
}

export default GamePage;
