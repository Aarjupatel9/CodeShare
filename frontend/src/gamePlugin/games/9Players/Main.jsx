import React, { useState } from 'react'
import GameBoard from './GameBoard'
import Player from './Player'

export default function Main({gameConfiguration}) {
  const [players, setPlayers] = useState([
    { name: 'player 1', isActive: true, color: 'bg-blue-500', placedPlayer: 0, retirePlayer: 0 },
    { name: 'player 2', isActive: false, color: 'bg-yellow-300', placedPlayer: 0, retirePlayer: 0 },
  ])

  const currentPlayer = players.find(p => p.isActive);
  const gamePhase = players[0].placedPlayer === 9 && players[1].placedPlayer === 9 ? 'playing' : 'placing';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      <div className="py-8 px-4 flex-grow">
        {/* Header Section */}
        <div className="max-w-6xl mx-auto mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            {gameConfiguration && gameConfiguration.displayName}
          </h1>
          <p className="text-gray-600">Make rows of 3 to capture opponent pieces</p>
        </div>

        {/* Game Board Container */}
        <div className="max-w-6xl mx-auto">
          <GameBoard players={players} setPlayers={setPlayers} />
        </div>
      </div>

      {/* Combined Bottom Status Bar */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="px-2 sm:px-4 py-2 sm:py-3">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
