import React, { useState } from 'react'
import GameBoard from './GameBoard'
import Player from './Player'

export default function Main({gameConfiguration}) {
  const [players, setPlayers] = useState([
    { name: 'player 1', isActive: true, color: 'bg-blue-500', placedPlayer: 0, retirePlayer: 0 },
    { name: 'player 2', isActive: false, color: 'bg-yellow-300', placedPlayer: 0, retirePlayer: 0 },
  ])

  return (
    <div className="w-full h-full flex flex-col  px-1">
        <div className='font-bold text-2xl mb-2'>{gameConfiguration && gameConfiguration.displayName} </div>
      <GameBoard players={players} setPlayers={setPlayers} />
    </div>
  )
}
