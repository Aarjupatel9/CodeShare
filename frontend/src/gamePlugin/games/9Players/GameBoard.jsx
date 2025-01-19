import React, { useEffect, useState } from 'react'
import Player from './Player'
import { initialPlayerPositions, initialState, edges, pattern } from './constants/constants.jsx'

const GameBoard = ({ players, setPlayers }) => {
  const [playerState, setPlayerState] = useState(initialState)
  const [playerPositions, setPlayerPositions] = useState(initialPlayerPositions)
  const [gamePhase, setGamePhase] = useState('initialize')
  const [isAdvantage, setIsAdvantage] = useState(false)
  const [lastMove, setLastMove] = useState(-1)
  const [isPlayerTouchedForMove, setIsPlayerTouchedForMove] = useState(false)

  useEffect(() => {
    if (players[0].placedPlayer === 9 && players[1].placedPlayer === 9) {
      setGamePhase('start')
    }
    if (players[0].retirePlayer === 9 || players[1].retirePlayer === 9) {
      setGamePhase('end')
    }
  }, [players])

  useEffect(() => {
    if (isAdvantage) {
      if (gamePhase === 'initialize') {
      }
      populatePosiblePlayerRemove(false)
      setSecondPlayerTurn()
    }
    console.log('in use Effect : ', isAdvantage)
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
      console.log('Player is blocked')
      //have to decide how to display it to user
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
    var activePlayer = players[0].isActive ? 1 : 2 // 1 for player1, 2 for player2
    console.log('populatePosiblePlayerRemove : ', isRevert, activePlayer)
    if (isRevert) {
      setPlayerState((old) => {
        return old.map((o) => {
          o.isRemovable = false
          return o
        })
      })
      return
    }
    // Function to find if a player is part of a triplet
    const findAllTriplets = (playerState) => {
      let triplets = []

      // Find row triplets
      for (let row = 0; row <= 6; row++) {
        const rowElements = playerState.filter((c) => c.row === row) // Get all elements in the same row for active player
        for (let i = 0; i <= rowElements.length - 3; i += 3) {
          if (rowElements[i].player === activePlayer && rowElements[i].player === rowElements[i + 1].player && rowElements[i].player === rowElements[i + 2].player) {
            console.log('triplets found for row ', rowElements)
            triplets.push(rowElements[i], rowElements[i + 1], rowElements[i + 2])
          }
        }
      }

      // Find column triplets
      for (let col = 0; col <= 6; col++) {
        const colElements = playerState.filter((c) => c.col === col) // Get all elements in the same column for active player
        for (let i = 0; i <= colElements.length - 3; i += 3) {
          if (colElements[i].player === activePlayer && colElements[i].player === colElements[i + 1].player && colElements[i].player === colElements[i + 2].player) {
            console.log('triplets found for col ', colElements)
            triplets.push(colElements[i], colElements[i + 1], colElements[i + 2])
          }
        }
      }

      return triplets
    }

    // Get all triplets for the active player
    const tripletPlayers = findAllTriplets(playerState)

    // Get players not part of any triplet
    const playersToRemove = playerState.filter((child) => {
      return child.player === activePlayer && !tripletPlayers.includes(child)
    })

    console.log('Players that can be removed: ', playersToRemove, tripletPlayers)

    setPlayerState((old) => {
      old = structuredClone(old)
      playersToRemove.forEach((p) => {
        old[p.index].isRemovable = true
      })
      return old
    })
  }

  const removeSpecificPlayer = (index) => {
    console.log('removeSpecificPlayer : ', index)

    setPlayerState((old) => {
      old = structuredClone(old)
      old[index].player = 0
      return old
    })
    setPlayerPositions((old) => {
      old = structuredClone(old)
      for (var counter = 0; counter < 18; counter++) {
        console.log('removeSpecificPlayer setPlayerPositions : ', index, counter)
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
    console.log('handlePlayerChange playerIndexToMove ', playerIndexToMove, data, index, playerPositions)

    if (playerIndexToMove === -1) {
      console.log('handlePlayerChange playerIndexToMove ', playerIndexToMove, 'returning')
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
        console.log('handlePlayerChange setPlayerPositions : ', index, counter)
        if (old[counter].index == playerIndexToMove) {
          old[counter].top = `${(data.row * 100) / 6}%`
          old[counter].left = `${(data.col * 100) / 6}%`
        }
      }
      console.log('setPlayerPositions : ', old)
      return old
    })

    clearPosibleMoves()
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
    console.log('handlePlayerClick index : ', index, data, gamePhase, isAdvantage, isPlayerTouchedForMove)
    if (gamePhase == 'end') {
      return
    }

    if (isAdvantage) {
      // console.log("handlePlayerClick index : ", index, data, gamePhase)
      if (data.isRemovable === true) {
        setLastMove(index)
        removeSpecificPlayer(index)
        return
      }
      return
    }

    if (isPlayerTouchedForMove && !data.isMovable) {
      return
    }

    if (gamePhase === 'initialize') {
      console.log('inside initialize')

      if (data.player > 0) return

      setLastMove(index)
      var nextToInsert = players[0].isActive ? 0 : 9
      setPlayerPositions((old) => {
        old = structuredClone(old)
        console.log('setPlayerPositions nextToInsert : ', nextToInsert)
        while (old[nextToInsert].isBind) {
          nextToInsert++
        }
        old[nextToInsert].index = index
        old[nextToInsert].isBind = true
        old[nextToInsert].top = `${(data.row * 100) / 6}%`
        old[nextToInsert].left = `${(data.col * 100) / 6}%`
        console.log('setPlayerPositions : ', old)
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
      console.log('inside start')
      if (data.isMovable) {
        console.log('handlePlahyerClick start movable ', index, data)
        setLastMove(index)
        handlePlayerChange(data, index)
      } else if ((data.player === 1 || data.player === 2) && players[data.player - 1].isActive) {
        console.log('handlePlahyerClick start touch ', index, data)
        populatePosibleMoves(data, index)
      }
    }
  }

  useEffect(() => {
    var isAdvantage = checkPlayerAdvantage()
    setIsAdvantage(isAdvantage)
    console.log('isAdvantage : ', isAdvantage)
  }, [playerState])

  useEffect(() => {
    // console.log("players : ", players);
  }, [players])

  const checkPlayerAdvantage = () => {
    for (let row = 0; row <= 6; row++) {
      const rowElements = playerState.filter((child) => child.row === row) // Get all elements in the same row
      for (let i = 0; i <= rowElements.length - 3; i += 3) {
        // console.log("colElements : ",i,rowElements);
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
        // console.log("colElements : ",i,colElements);
        if (colElements[i].player !== 0 && colElements[i].player === colElements[i + 1].player && colElements[i].player === colElements[i + 2].player) {
          if ([colElements[i].index, colElements[i + 1].index, colElements[i + 2].index].includes(lastMove)) {
            return true
          }
        }
      }
    }
    return false
  }

  useEffect(() => {
    console.log('playerState changed : ', playerState)
  }, [playerState])
  useEffect(() => {
    console.log('playerPositions changed : ', playerPositions)
  }, [playerPositions])

  return (
    <div className="flex flex-col mx-auto py-2 px-3 jsutify-center">
      {/* Grid container with relative positioning */}
      <div className="relative sm:max-h-[270px] sm:max-w-[270px] sm:min-h-[270px] sm:min-w-[270px]  md:max-h-[600px] md:max-w-[600px] md:min-h-[500px] md:min-w-[500px] mx-auto ">
        {/* Horizontal lines */}
        {pattern.map((conf, rowIndex) => getHorizontalRow(conf, rowIndex))}

        {/* Vertical lines */}
        {pattern.map((conf, rowIndex) => getVerticalRow(conf, rowIndex))}

        {/* Circles at intersections */}
        {getCirclesAtIntersections()}

        {getPlayersCircles()}

        {gamePhase == 'end' && (
          <div
            key={`win-div-container`}
            className={`absolute rounded cursor-pointer font-bold text-xl bg-green-300 flex flex-col justify-around items-center`}
            style={{
              width: '200px',
              height: '200px',
              top: `50%`,
              left: `50%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div>{players[0].retirePlayer > players[1].retirePlayer ? 'Player 2' : 'Player 1'} Won </div>
            <div>
              <div className="px-2 py-1 bg-green-600 rounded" onClick={() => {}}>
                Restart the Game
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-around content-around mt-10">
        <Player user1={players[0]} user2={players[1]} possition={'left'} />
        <Player user1={players[1]} user2={players[0]} possition={'right'} />
      </div>
    </div>
  )
}

export default GameBoard
