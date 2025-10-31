import React from 'react'
import { useNavigate } from 'react-router-dom'

const GameRules = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            9 VS 9 - Game Rules & How to Play
          </h1>
          <p className="text-gray-600">Learn how to play and master the game</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-8">
          {/* Overview */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-3xl">🎯</span>
              Overview
            </h2>
            <p className="text-gray-700 text-left leading-relaxed">
              9 VS 9 (also known as Nine Men's Morris or Mill) is a classic strategy board game for two players. 
              The goal is to reduce your opponent's pieces to fewer than 3 or block all their moves.
            </p>
          </section>

          {/* How to Play */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-3xl">📚</span>
              How to Play
            </h2>
            
            <div className="space-y-6">
              {/* Phase 1 */}
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <h3 className="text-xl font-semibold text-blue-800 mb-2">Phase 1: Placement</h3>
                <ul className="list-disc text-left list-inside text-gray-700 space-y-2 ml-2">
                  <li>Players take turns placing their 9 pieces one by one on the board intersections</li>
                  <li>You can place a piece on any empty intersection</li>
                  <li>The placement phase continues until both players have placed all 9 pieces</li>
                  <li>During placement, you can already form rows of 3 (triplets/mills) to capture opponent pieces</li>
                </ul>
              </div>

              {/* Phase 2 */}
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <h3 className="text-xl font-semibold text-green-800 mb-2">Phase 2: Movement</h3>
                <ul className="list-disc text-left list-inside text-gray-700 space-y-2 ml-2">
                  <li>After all pieces are placed, players take turns moving their pieces</li>
                  <li>You can move a piece to an adjacent empty intersection (connected by a line)</li>
                  <li>Click on your piece to select it, then click on a highlighted spot to move</li>
                  <li>Moving pieces allows you to form new rows of 3 and capture opponent pieces</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Game Rules */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-3xl">⚖️</span>
              Game Rules
            </h2>
            
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Forming a Row of 3 (Triplet/Mill)</h3>
                <p className="text-gray-700">
                  When you place or move a piece to complete a row of 3 pieces (horizontally or vertically), 
                  you form a "triplet" or "mill". This gives you the advantage to remove one of your opponent's pieces.
                </p>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Capturing Opponent Pieces</h3>
                <ul className="list-disc text-left list-inside text-gray-700 space-y-1 ml-2">
                  <li>When you form a row of 3, you can remove one of your opponent's pieces</li>
                  <li>You can <strong>only remove pieces that are NOT part of a triplet</strong></li>
                  <li>If all of your opponent's remaining pieces are in triplets, you can remove any piece</li>
                  <li>Removed pieces cannot be placed back on the board</li>
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Blocked Pieces</h3>
                <p className="text-gray-700">
                  A piece is "blocked" when all adjacent intersections are occupied. Blocked pieces cannot be moved. 
                  If all your pieces are blocked, you lose the game.
                </p>
              </div>
            </div>
          </section>

          {/* Winning Conditions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-3xl">🏆</span>
              Winning Conditions
            </h2>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-600">
              <p className="text-gray-700 font-medium mb-3">You win the game if:</p>
              <ul className="list-disc text-left list-inside text-gray-700 space-y-2 ml-2">
                <li>Your opponent has fewer than <strong>3 pieces remaining</strong> on the board</li>
                <li>All of your opponent's pieces are <strong>blocked</strong> (no valid moves available)</li>
              </ul>
            </div>
          </section>

          {/* Strategy Tips */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-3xl">💡</span>
              Strategy Tips
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-indigo-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-indigo-800 mb-2">During Placement</h3>
                <ul className="list-disc text-left list-inside text-gray-700 space-y-1 text-sm ml-2">
                  <li>Try to form rows of 3 early to capture opponent pieces</li>
                  <li>Block your opponent from forming rows</li>
                  <li>Place pieces in positions that allow for future moves</li>
                </ul>
              </div>

              <div className="bg-pink-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-pink-800 mb-2">During Movement</h3>
                <ul className="list-disc text-left list-inside text-gray-700 space-y-1 text-sm ml-2">
                  <li>Form rows of 3 frequently to keep capturing</li>
                  <li>Break and reform the same row to capture multiple times</li>
                  <li>Try to block your opponent's moves</li>
                </ul>
              </div>

              <div className="bg-cyan-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-cyan-800 mb-2">Defensive</h3>
                <ul className="list-disc text-left list-inside text-gray-700 space-y-1 text-sm ml-2">
                  <li>Keep your pieces in triplets when possible (they can't be removed)</li>
                  <li>Avoid leaving isolated pieces that can be easily captured</li>
                </ul>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-800 mb-2">Opt Out</h3>
                <p className="text-gray-700 text-sm">
                  If you feel you can't win, you can use the "Opt Out" button to forfeit the game.
                </p>
              </div>
            </div>
          </section>

          {/* Visual Guide */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-3xl">👀</span>
              Visual Indicators
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-800"></div>
                <span className="text-gray-700"><strong>Green circle:</strong> Valid move location</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-red-600"></div>
                <span className="text-gray-700"><strong>Red circle:</strong> Opponent piece that can be removed</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                <span className="text-gray-700"><strong>Blue/Yellow circle:</strong> Your pieces</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-300"></div>
                <span className="text-gray-700"><strong>Gray circle:</strong> Empty intersection</span>
              </div>
            </div>
          </section>

          {/* Action Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => navigate('/game/9Players')}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Playing →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameRules
