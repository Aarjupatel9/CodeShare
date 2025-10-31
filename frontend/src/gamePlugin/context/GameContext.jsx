import { createContext, useContext, useState } from 'react'

const GameContext = createContext(null)

export const GameProvider = ({ children }) => {
  const [shouldBlockNavigation, setShouldBlockNavigation] = useState(false)
  const [navigationWarningConfig, setNavigationWarningConfig] = useState({
    title: 'Leave Game?',
    message: 'You have an active game in progress. Are you sure you want to leave? Your progress will be lost.',
    confirmText: 'Leave Game',
    cancelText: 'Stay'
  })

  return (
    <GameContext.Provider value={{ 
      shouldBlockNavigation, 
      setShouldBlockNavigation,
      navigationWarningConfig,
      setNavigationWarningConfig
    }}>
      {children}
    </GameContext.Provider>
  )
}

export const useGameContext = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGameContext must be used within GameProvider')
  }
  return context
}

export default GameContext

