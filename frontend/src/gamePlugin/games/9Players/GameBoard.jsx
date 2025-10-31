import React, { useEffect, useState } from 'react'
import { initialPlayerPositions, initialState, edges, pattern } from './constants/constants.jsx'

const GameBoard = ({ players, setPlayers, resignRequest, onResignHandled }) => {
  const [playerState, setPlayerState] = useState(initialState)
  const [playerPositions, setPlayerPositions] = useState(initialPlayerPositions)
  const [gamePhase, setGamePhase] = useState('initialize')
  const [isAdvantage, setIsAdvantage] = useState(false)
  const [lastMove, setLastMove] = useState(-1)
  const [isPlayerTouchedForMove, setIsPlayerTouchedForMove] = useState(false)
  const [winner, setWinner] = useState(null)
  const [infoMessage, setInfoMessage] = useState('')
  const showMessage = (msg) => {
    setInfoMessage(msg)
    window.clearTimeout(showMessage._t)
    showMessage._t = window.setTimeout(() => setInfoMessage(''), 1500)
  }

  useEffect(() => {
    // Transition from placement to move phase strictly after both placed all 9
    if (players[0].placedPlayer === 9 && players[1].placedPlayer === 9 && gamePhase !== 'end') {
      setGamePhase('start')
    }
    // End game when a player is reduced to 2 pieces (retired >= 7)
    if ((players[0].retirePlayer >= 7 || players[1].retirePlayer >= 7) && gamePhase !== 'end') {
      const p1Remaining = 9 - players[0].retirePlayer
      const p2Remaining = 9 - players[1].retirePlayer
      if (p1Remaining <= 2) setWinner('Player 2')
      if (p2Remaining <= 2) setWinner('Player 1')
      setGamePhase('end')
    }
  }, [players])

  useEffect(() => {
    if (isAdvantage) {
      populatePosiblePlayerRemove(false)
      setSecondPlayerTurn()
    }
  }, [isAdvantage])

  const getHorizontalRow = (configuration, rowIndex) => {
    var margin = ''
    if (rowIndex === 3) {
      margin = (4 * 100) / 6 + '%'
      return (
        <div key={`h1x-${rowIndex}`}>
          <div
            key={`h1-${rowIndex}`}
            className="absolute left-0 h-px bg-black"
            style={{
              top: `${(rowIndex * 100) / 6}%`,
              width: `${configuration[0]}%`,
              marginLeft: '0px',
            }}
          />
          <div
            key={`h2-${rowIndex}-1`}
            className="absolute left-0 h-px bg-black"
            style={{
              top: `${(rowIndex * 100) / 6}%`,
              width: `${configuration[0]}%`,
              marginLeft: margin,
            }}
          />
        </div>
      )
    }

    if (rowIndex < 3) {
      margin = (rowIndex * 100) / 6 + '%'
    } else {
      margin = ((6 - rowIndex) * 100) / 6 + '%'
    }

    return (
      <div
        key={`h-${rowIndex}`}
        className="absolute left-0 h-px bg-black"
        style={{
          top: `${(rowIndex * 100) / 6}%`,
          width: `${configuration[0]}%`,
          marginLeft: margin,
        }}
      />
    )
  }
  const getVerticalRow = (configuration, rowIndex) => {
    var margin = ''
    if (rowIndex === 3) {
      margin = (4 * 100) / 6 + '%'
      return (
        <div key={`v1x-${rowIndex}`}>
          <div
            key={`v1-${rowIndex}`}
            className="absolute top-0 w-px bg-black"
            style={{
              left: `${(rowIndex * 100) / 6}%`,
              height: `${configuration[0]}%`,
              marginTop: '0px',
            }}
          />
          <div
            key={`v2-${rowIndex}-1`}
            className="absolute top-0 w-px bg-black"
            style={{
              left: `${(rowIndex * 100) / 6}%`,
              height: `${configuration[0]}%`,
              marginTop: margin,
            }}
          />
        </div>
      )
    }

    if (rowIndex < 3) {
      margin = (rowIndex * 100) / 6 + '%'
    } else {
      margin = ((6 - rowIndex) * 100) / 6 + '%'
    }

    return (
      <div
        key={`v-${rowIndex}`}
        className="absolute top-0 w-px bg-black"
        style={{
          left: `${(rowIndex * 100) / 6}%`,
          height: `${configuration[0]}%`,
          marginTop: margin,
        }}
      />
    )
  }
  // New function to render circles at intersections
  const getCirclesAtIntersections = () => {
    return playerState.map((data, index) => {
      var color = ''
      switch (data.player) {
        case 0: {
          color = 'bg-slate-300'
          break
        }
        case 1:
        case 2: {
          color = 'bg-transparent'
          break
        }
        case 3: {
          color = 'bg-green-800'
          break
        }
        case 4: {
          color = 'bg-red-600'
          break
        }
        default: {
          color = 'bg-black'
        }
      }

      if (data.isRemovable && data.player !== 0) {
        color = 'bg-red-600'
      }
      if (data.isMovable) {
        color = 'bg-green-800'
      }

      return (
        <div
          key={`circle-${data.row}-${data.col}-${index}`}
          className={`absolute sm:w-[16px] md:w-[20px] sm:h-[16px] md:h-[20px] rounded-full cursor-pointer ${color} 
                                transition-all duration-1000 ease-in-out`} // Transition on all properties
          style={{
            top: `${(data.row * 100) / 6}%`,
            left: `${(data.col * 100) / 6}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 100,
          }}
          onClick={() => {
            handlePlayerClick(data, index)
          }}
        ></div>
      )
    })
  }
  const getPlayersCircles = () => {
    return playerPositions.map((circle, index) => {
      var color = players[index > 8 ? 1 : 0].color
      if (!circle.isRemoved) {
        return (
          <div
            key={`playerCircle-${index}`}
            className={`playersCircle sm:w-[16px] md:w-[20px] sm:h-[16px] md:h-[20px] absolute rounded-full cursor-pointer ${color} 
                                    transition-all duration-1000 ease-in-out  ${circle.isBind && playerState[circle.index].isSelectedForMove ? 'rounded shadow-cyan-500/50 shadow-xl animate-bounce' : 'shadow-sm'} `} // Transition for all properties
            style={{
              top: `${parseFloat(circle.top)}%`, // Ensure top is percentage
              left: `${parseFloat(circle.left)}%`, // Ensure left is percentage
              transform: 'translate(-50%, -50%)',
              zIndex: 99,
            }}
          ></div>
        )
      }
    })
  }

  const populatePosibleMoves = (data, index) => {
    //[0, 0, 0]
    if (data.player === 0 || data.player === 3) {
      return //returning for empty
    }
    if (data.isSelectedForMove) {
      clearPosibleMoves()
      return
    }
    var points_to_highlight = edges[index].filter((p) => {
      return playerState[p].player === 0
    })
    if (points_to_highlight && points_to_highlight.length > 0) {
      //only populate if player is not blocked
      setIsPlayerTouchedForMove(true)
      setPlayerState((old) => {
        old = structuredClone(old)
        for (var i = 0; i < points_to_highlight.length; i++) {
          old[points_to_highlight[i]].isMovable = true
        }
        old[index].isSelectedForMove = true
        return old
      })
    } else {
      // Player is blocked
      showMessage('Selected piece is blocked')
    }
  }
  const clearPosibleMoves = () => {
    setIsPlayerTouchedForMove(false)
    setPlayerState((old) => {
      old = old.map((p) => {
        if (p.isMovable) {
          p.isMovable = false
        }
        p.isSelectedForMove = false
        return p
      })
      return old
    })
  }

  const populatePosiblePlayerRemove = (isRevert) => {
    // Opponent pieces are candidates for removal
    var opponentPlayer = players[0].isActive ? 2 : 1 // 1 for player1, 2 for player2
    if (isRevert) {
      setPlayerState((old) => {
        return old.map((o) => {
          o.isRemovable = false
          return o
        })
      })
      return
    }
    // Function to find all triplet members for a given player
    const findAllTriplets = (state, player) => {
      let triplets = []
      // Find row triplets
      for (let row = 0; row <= 6; row++) {
        const rowElements = state.filter((c) => c.row === row)
        const sorted = rowElements.slice().sort((a, b) => a.col - b.col)
        for (let i = 0; i <= sorted.length - 3; i++) {
          const a = sorted[i], b = sorted[i + 1], c = sorted[i + 2]
          if (a.player === player && a.player === b.player && a.player === c.player) {
            triplets.push(a, b, c)
          }
        }
      }
      // Find column triplets
      for (let col = 0; col <= 6; col++) {
        const colElements = state.filter((c) => c.col === col)
        const sorted = colElements.slice().sort((a, b) => a.row - b.row)
        for (let i = 0; i <= sorted.length - 3; i++) {
          const a = sorted[i], b = sorted[i + 1], c = sorted[i + 2]
          if (a.player === player && a.player === b.player && a.player === c.player) {
            triplets.push(a, b, c)
          }
        }
      }
      return triplets
    }
    // Triplets for the opponent
    const tripletMembers = findAllTriplets(playerState, opponentPlayer)
    const tripletIndexes = new Set(tripletMembers.map(t => t.index))
    const opponentPieces = playerState.filter((c) => c.player === opponentPlayer)
    const removable = opponentPieces.filter((c) => !tripletIndexes.has(c.index))
    const targets = removable.length > 0 ? removable : opponentPieces

    setPlayerState((old) => {
      old = structuredClone(old)
      targets.forEach((p) => {
        old[p.index].isRemovable = true
      })
      return old
    })
  }

  const removeSpecificPlayer = (index) => {
    setPlayerState((old) => {
      old = structuredClone(old)
      old[index].player = 0
      return old
    })
    setPlayerPositions((old) => {
      old = structuredClone(old)
      for (var counter = 0; counter < 18; counter++) {
        if (old[counter].index === index) {
          old[counter].isRemoved = true
        }
      }
      return old
    })

    setPlayers((old) => {
      old = structuredClone(old)
      for (var i = 0; i < old.length; i++) {
        if (!old[i].isActive) {
          old[i].retirePlayer += 1
        }
      }
      return old
    })
    setIsAdvantage(false)
    populatePosiblePlayerRemove(true)
    setSecondPlayerTurn()
  }
  const handlePlayerChange = (data, index) => {
    var playerIndexToMove = playerState.findIndex((p) => p.isSelectedForMove) // Find the active player to move

    if (playerIndexToMove === -1) {
      return
    }
    setPlayerState((prevState) => {
      const newState = [...prevState]
      newState[playerIndexToMove].player = 0 // Clear old position
      if (players[0].isActive) {
        newState[index].player = 1 // Set new position
      } else {
        newState[index].player = 2 // Set new position
      }
      return newState
    })

    setPlayerPositions((old) => {
      old = structuredClone(old)

      for (var counter = 0; counter < 18; counter++) {
        if (old[counter].index === playerIndexToMove) {
          old[counter].top = `${(data.row * 100) / 6}%`
          old[counter].left = `${(data.col * 100) / 6}%`
        }
      }
      return old
    })

    clearPosibleMoves()
    // After a move, check if opponent has any valid moves; if none, current player wins
    setSecondPlayerTurn()
  }
  const setSecondPlayerTurn = () => {
    setPlayers((old) => {
      old = structuredClone(old)
      old[0].isActive = !old[0].isActive
      old[1].isActive = !old[1].isActive
      return old
    })
  }

  const handlePlayerClick = (data, index) => {
    if (gamePhase === 'end') {
      return
    }

    if (isAdvantage) {
      if (data.isRemovable === true) {
        setLastMove(index)
        removeSpecificPlayer(index)
        return
      }
      return
    }

    if (isPlayerTouchedForMove && !data.isMovable) {
      showMessage('Choose a highlighted spot')
      return
    }

    if (gamePhase === 'initialize') {
      if (data.player > 0) {
        showMessage('Spot occupied')
        return
      }

      setLastMove(index)
      var nextToInsert = players[0].isActive ? 0 : 9
      setPlayerPositions((old) => {
        old = structuredClone(old)
        while (old[nextToInsert].isBind) {
          nextToInsert++
        }
        old[nextToInsert].index = index
        old[nextToInsert].isBind = true
        old[nextToInsert].top = `${(data.row * 100) / 6}%`
        old[nextToInsert].left = `${(data.col * 100) / 6}%`
        return old
      })

      setPlayerState((old) => {
        var activePlayer = players[0].isActive ? 1 : 2
        old = structuredClone(old)
        old[index].player = activePlayer
        return old
      })
      setPlayers((old) => {
        var activePlayer = players[0].isActive ? 0 : 1
        old = structuredClone(old)
        old[activePlayer].placedPlayer += 1
        return old
      })
      setSecondPlayerTurn()
    } else if (gamePhase === 'start') {
      if (data.isMovable) {
        setLastMove(index)
        handlePlayerChange(data, index)
      } else if ((data.player === 1 || data.player === 2) && players[data.player - 1].isActive) {
        populatePosibleMoves(data, index)
      } else if (data.player === 0) {
        showMessage('Select your piece to move')
      } else {
        showMessage('Not your piece')
      }
    }
  }

  useEffect(() => {
    var isAdvantage = checkPlayerAdvantage()
    setIsAdvantage(isAdvantage)
  }, [playerState])

  const checkPlayerAdvantage = () => {
    for (let row = 0; row <= 6; row++) {
      const rowElements = playerState.filter((child) => child.row === row) // Get all elements in the same row
      for (let i = 0; i <= rowElements.length - 3; i += 3) {
        if (rowElements[i].player !== 0 && rowElements[i].player === rowElements[i + 1].player && rowElements[i].player === rowElements[i + 2].player) {
          if ([rowElements[i].index, rowElements[i + 1].index, rowElements[i + 2].index].includes(lastMove)) {
            return true
          }
        }
      }
    }
    for (let col = 0; col <= 6; col++) {
      const colElements = playerState.filter((child) => child.col === col) // Get all elements in the same column
      for (let i = 0; i <= colElements.length - 3; i += 3) {
        if (colElements[i].player !== 0 && colElements[i].player === colElements[i + 1].player && colElements[i].player === colElements[i + 2].player) {
          if ([colElements[i].index, colElements[i + 1].index, colElements[i + 2].index].includes(lastMove)) {
            return true
          }
        }
      }
    }
    return false
  }

  // Determine if the specified player has any legal moves (used for stalemate detection)
  const hasAnyValidMove = (playerNumber) => {
    // For each piece of playerNumber, see if any adjacent edge is empty
    for (let i = 0; i < playerState.length; i++) {
      if (playerState[i].player === playerNumber) {
        const adj = edges[i] || []
        if (adj.some((idx) => playerState[idx].player === 0)) {
          return true
        }
      }
    }
    return false
  }

  // React to resignRequest from parent
  useEffect(() => {
    if (!resignRequest || gamePhase === 'end') return
    const resignedPlayer = resignRequest === 'p1' ? 'Player 1' : 'Player 2'
    const winnerPlayer = resignRequest === 'p1' ? 'Player 2' : 'Player 1'
    setWinner(winnerPlayer)
    setGamePhase('end')
    onResignHandled && onResignHandled()
  }, [resignRequest])

  // After each playerState change in move phase, check stalemate for next player
  useEffect(() => {
    if (gamePhase !== 'start') return
    const nextPlayer = players[0].isActive ? 1 : 2
    if (!hasAnyValidMove(nextPlayer)) {
      setWinner(nextPlayer === 1 ? 'Player 2' : 'Player 1')
      setGamePhase('end')
    }
  }, [playerState, gamePhase, players])

  // Warn before leaving active game
  useEffect(() => {
    const placed = (players?.[0]?.placedPlayer || 0) + (players?.[1]?.placedPlayer || 0)
    const shouldWarn = (gamePhase === 'initialize' || gamePhase === 'start') && placed > 0
    if (!shouldWarn) return
    const handler = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [gamePhase, players])


  return (
    <div className="flex flex-col mx-auto py-2 px-3 justify-center">
      {/* Grid container with relative positioning */}
      <div className="relative sm:max-h-[260px] sm:max-w-[260px] sm:min-h-[240px] sm:min-w-[240px]  md:max-h-[520px] md:max-w-[520px] md:min-h-[420px] md:min-w-[420px] mx-auto ">
        {/* Horizontal lines */}
        {pattern.map((conf, rowIndex) => getHorizontalRow(conf, rowIndex))}

        {/* Vertical lines */}
        {pattern.map((conf, rowIndex) => getVerticalRow(conf, rowIndex))}

        {/* Circles at intersections */}
        {getCirclesAtIntersections()}

        {getPlayersCircles()}

        {gamePhase === 'end' && (
          <div
            key={`win-div-container`}
            className={`absolute rounded-2xl cursor-pointer bg-white shadow-2xl border-2 border-green-400 flex flex-col justify-center items-center p-8`}
            style={{
              width: '280px',
              minHeight: '250px',
              top: `50%`,
              left: `50%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
            }}
          >
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              Game Over!
            </h2>
            <p className="text-xl font-semibold text-gray-800 mb-6">
              {(winner || (players[0].retirePlayer > players[1].retirePlayer ? 'Player 2' : 'Player 1'))} Wins!
            </p>
            <button 
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              onClick={() => window.location.reload()}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      {infoMessage && (
        <div className="mt-3 text-center text-sm text-gray-700 bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2">
          {infoMessage}
        </div>
      )}
    </div>
  )
}

export default GameBoard
