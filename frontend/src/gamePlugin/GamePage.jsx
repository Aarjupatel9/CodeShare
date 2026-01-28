import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, Routes, Route, Navigate } from 'react-router-dom';
import gamesConfig from './games.json';
import GameNavbar from './components/GameNavbar';
import Footer from '../components/common/Footer';
import { GameProvider } from './context/GameContext';
import useSafeNavigate from './hooks/useSafeNavigate';

function GamePageContent() {
  const [gameData, setGameData] = useState([]);
  const [selectedGameData, setSelectedGameData] = useState([]);
  const [gameRoutes, setGameRoutes] = useState([]); // Array of route configs for nested routing
  const [componentsLoaded, setComponentsLoaded] = useState(false);
  const [loadedGameName, setLoadedGameName] = useState(null);

  const { gameName, routeName } = useParams();
  const { safeNavigate, NavigationWarningModal } = useSafeNavigate();

  useEffect(() => {
    if (gameName) {
      const game = gamesConfig.find(g => g.name === gameName);
      if (game) {
        document.title = `${game.displayName} - CodeShare Games`;
      } else {
        document.title = "Games - CodeShare";
      }
    } else {
      document.title = "Break Room - Developer Mini-Games | CodeShare";
    }
  }, [gameName]);

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

              routes[routePath] = { routeName: routeName, displayName: displayName, routePath: routePath };
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
      ) : (<>
        {/* // Game Selection Home Page */}
        <div className="container mx-auto px-6 py-12 md:py-20">
          {/* Hero Section */}
          <div className="text-left max-w-4xl mb-16 md:mb-24">
            <h1 className="text-4xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
              Developer <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Break Room</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl font-medium">
              Step away from the code for a moment. Challenge your logic and strategic thinking with our collection of classic mid-session games.
            </p>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {gameData && gameData.map((game, index) => (
              <div
                key={index}
                className="group bg-white rounded-[32px] shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden flex flex-col h-full"
              >
                {/* Visual Header */}
                <div className="h-48 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20 group-hover:scale-110 transition-transform duration-700">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mt-16 blur-2xl"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-300 rounded-full -mr-16 -mb-16 blur-2xl"></div>
                  </div>
                  <span className="text-7xl relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-500">🎯</span>
                </div>

                {/* Card Content */}
                <div className="p-8 flex flex-col flex-grow text-left">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-black text-gray-900 capitalize">
                      {game.displayName}
                    </h3>
                    <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full">Active</span>
                  </div>

                  <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8 flex-grow">
                    {game.description}
                  </p>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        safeNavigate(`/game/${game.name}`);
                      }}
                      className="w-full bg-gray-900 text-white font-bold py-4 px-6 rounded-2xl hover:bg-blue-600 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                    >
                      Play Now
                      <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                    </button>
                    {game.component?.Rules?.path && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          safeNavigate(`/game/${game.name}${game.component.Rules.path}`);
                        }}
                        className="w-full text-gray-400 font-bold py-2 text-sm hover:text-gray-600 transition-colors"
                      >
                        Read Rules
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Coming Soon Cards */}
            <div className="group bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
              <span className="text-4xl mb-4 opacity-40">🧩</span>
              <h3 className="text-xl font-black text-slate-400 mb-2">Reflex Training</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Coming Soon</p>
            </div>
          </div>

          {/* New Informational Section */}
          <div className="mt-24 md:mt-40 border-t border-gray-100 pt-16 md:pt-24">
            <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-start">
              <div className="text-left">
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Why a Break Room?</h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  I've always believed that the best coding happens when you take short, focused breaks. Logic games like 9 VS 9 aren't just for fun—they keep your brain in a problem-solving state without the stress of a debugger.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  CodeShare is about productivity, and sometimes the most productive thing you can do is step away from the IDE for ten minutes. These games are built to be fast, account-free, and always available when you need a mental reset.
                </p>
              </div>
              <div className="bg-slate-900 rounded-[40px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <h3 className="text-xl md:text-2xl font-black mb-6 tracking-tight">Platform Highlights</h3>
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <span className="text-blue-400 font-bold">01</span>
                    <div>
                      <h4 className="font-bold mb-1">Zero Latency</h4>
                      <p className="text-gray-400 text-sm">Powered by the same real-time WebSocket engine as our main document editor.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-blue-400 font-bold">02</span>
                    <div>
                      <h4 className="font-bold mb-1">Private Sessions</h4>
                      <p className="text-gray-400 text-sm">No shared lobbies. Play with colleagues using private, high-security slugs.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-blue-400 font-bold">03</span>
                    <div>
                      <h4 className="font-bold mb-1">Open Source DNA</h4>
                      <p className="text-gray-400 text-sm">Built using modern React 18 patterns, optimized for every browser.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
         <Footer />
         </>
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
