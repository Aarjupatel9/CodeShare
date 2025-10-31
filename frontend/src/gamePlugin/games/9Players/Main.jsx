import React, { useState, useEffect } from 'react'
import GameBoard from './GameBoard'
import Player from './Player'
import ConfirmModal from './components/ConfirmModal'
import { useGameContext } from '../../context/GameContext'

export default function Main({gameConfiguration}) {
  const [players, setPlayers] = useState([
    { name: 'player 1', isActive: true, color: 'bg-blue-500', placedPlayer: 0, retirePlayer: 0 },
    { name: 'player 2', isActive: false, color: 'bg-yellow-300', placedPlayer: 0, retirePlayer: 0 },
  ])
  const { setShouldBlockNavigation, setNavigationWarningConfig } = useGameContext()
  const currentPlayer = players.find(p => p.isActive);
  const gamePhase = players[0].placedPlayer === 9 && players[1].placedPlayer === 9 ? 'playing' : 'placing';
  const [resignRequest, setResignRequest] = useState(null)
  const [showOptOutModal, setShowOptOutModal] = useState(false)
  
  // Set custom navigation warning message for this game
  useEffect(() => {
    setNavigationWarningConfig({
      title: 'Leave 9 VS 9 Game?',
      message: 'You have an active game in progress. Are you sure you want to leave? Your progress will be lost.',
      confirmText: 'Leave Game',
      cancelText: 'Stay'
    })
  }, [setNavigationWarningConfig])
  
  // Component tells safeNavigate to block navigation when game is active
  useEffect(() => {
    const placedCount = players[0].placedPlayer + players[1].placedPlayer
    const isGameEnded = players[0].retirePlayer >= 7 || players[1].retirePlayer >= 7
    const shouldBlock = placedCount > 0 && !isGameEnded
    
    setShouldBlockNavigation(shouldBlock)
    
    // Cleanup: unblock navigation when component unmounts
    return () => {
      setShouldBlockNavigation(false)
    }
  }, [players, setShouldBlockNavigation])
  
  const handleOptOut = () => {
    setShowOptOutModal(true)
  }
  
  const confirmOptOut = () => {
    setResignRequest(players[0].isActive ? 'p1' : 'p2')
    setShowOptOutModal(false)
  }
  
  const onResignHandled = () => setResignRequest(null)

  return (
    <div className="justify-between flex-grow max-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      <div className="py-4 px-3 sm:px-4 flex flex-col">
        {/* Header Section */}
        <div className="max-w-6xl mx-auto mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1 sm:mb-2">
            {gameConfiguration && gameConfiguration.displayName}
          </h1>
        </div>

        {/* Game Board Container */}
        <div className="max-w-6xl mx-auto">
          <GameBoard players={players} setPlayers={setPlayers} resignRequest={resignRequest} onResignHandled={onResignHandled} />
        </div>
      </div>

      {/* Combined Bottom Status Bar */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="px-2 sm:px-4 py-2 sm:py-2">
          {/* Desktop: Turn indicator on left, players side by side */}
          <div className="hidden md:flex flex-col justify-center items-center gap-4">
            {/* Turn Indicator */}
            <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${currentPlayer?.color}`}></div>
              <span className="font-semibold text-sm text-gray-800">
                {currentPlayer?.name}'s Turn
              </span>
              <span className="text-xs text-gray-600 px-2 py-0.5 bg-white rounded-full">
                {gamePhase === 'placing' ? 'Placing' : 'Moving'}
              </span>
              <button
                onClick={handleOptOut}
                className="ml-4 px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              >
                Opt Out
              </button>
            </div>

            {/* Player Cards - Side by side */}
            <div className="flex gap-3 flex-grow">
              <Player user1={players[0]} user2={players[1]} possition={'left'} />
              <Player user1={players[1]} user2={players[0]} possition={'right'} />
            </div>
          </div>

          {/* Mobile: Turn indicator on top, players stacked */}
          <div className="md:hidden space-y-2">
            {/* Turn Indicator */}
            <div className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${currentPlayer?.color}`}></div>
              <span className="font-semibold text-sm text-gray-800">
                {currentPlayer?.name}'s Turn
              </span>
              <span className="text-xs text-gray-600 px-2 py-0.5 bg-white rounded-full">
                {gamePhase === 'placing' ? 'Placing' : 'Moving'}
              </span>
            </div>

            {/* Player Cards - Stacked vertically */}
            <div className="flex flex-col gap-2">
              <Player user1={players[0]} user2={players[1]} possition={'left'} />
              <Player user1={players[1]} user2={players[0]} possition={'right'} />
                  <div className="flex justify-center">
                    <button
                      onClick={handleOptOut}
                      className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      Opt Out
                    </button>
                  </div>
                </div>
          </div>
        </div>
      </div>

      {/* Opt-Out Confirmation Modal */}
      <ConfirmModal
        isOpen={showOptOutModal}
        onClose={() => setShowOptOutModal(false)}
        onConfirm={confirmOptOut}
        title="Opt Out?"
        message={`${players[0].isActive ? 'Player 1' : 'Player 2'} - Are you sure you want to opt out? This will end the game.`}
        confirmText="Yes, Opt Out"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  )
}
