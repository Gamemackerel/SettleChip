import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define game phases
export type GamePhase = 'setup' | 'inprogress' | 'tallyup' | 'settle';

// Define player type
export type Player = {
  id: string;
  name: string;
  buyIn: number;
  finalAmount?: number;
  isComplete?: boolean;
  hasError?: boolean;
};

// Define game state
type GameState = {
  players: Player[];
  buyInAmount: number;
  isGameFinished: boolean;
  isTallyBalanced: boolean;
  gamePhase: GamePhase;
};

// Define context type
type GameContextType = {
  gameState: GameState;
  setPlayers: (players: Player[]) => void;
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  addFunds: (id: string, amount: number) => void;
  setBuyInAmount: (amount: number) => void;
  startGame: (playerNames: string[], buyInAmount: number) => void;
  finishGame: () => void;
  updatePlayerFinalAmount: (id: string, amount: number) => void;
  areAllPlayersComplete: () => boolean;
  getPlayerProfit: (player: Player) => number;
  getTotalBuyIn: () => number;
  getTotalCashOut: () => number;
  validateTallyBalance: () => boolean;
  setGamePhase: (phase: GamePhase) => void;
  goToNextPhase: () => void;
  goToPreviousPhase: () => void;
  resetGame: () => void;
};

// Create context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    buyInAmount: 20,
    isGameFinished: false,
    isTallyBalanced: true,
    gamePhase: 'setup',
  });

  const setPlayers = (players: Player[]) => {
    setGameState(prev => ({ ...prev, players }));
  };

  const addPlayer = (name: string) => {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name,
      buyIn: gameState.buyInAmount,
    };
    setGameState(prev => ({
      ...prev,
      players: [...prev.players, newPlayer],
    }));
  };

  const removePlayer = (id: string) => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.filter(player => player.id !== id),
    }));
  };

  const addFunds = (id: string, amount: number) => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(player =>
        player.id === id
          ? { ...player, buyIn: player.buyIn + amount }
          : player
      ),
    }));
  };

  const setBuyInAmount = (amount: number) => {
    setGameState(prev => ({ ...prev, buyInAmount: amount }));
  };

  const startGame = (playerNames: string[], buyInAmount: number) => {
    console.log('Starting game with players:', playerNames);
    const players = playerNames.map(name => ({
      id: Date.now() + Math.random().toString(),
      name,
      buyIn: buyInAmount,
    }));
    console.log('Generated players:', players);
    console.log('setting game state');
    setGameState(prev => ({
      ...prev,
      players,
      buyInAmount,
      isGameFinished: false,
      isTallyBalanced: true,
      gamePhase: 'inprogress',
    }));
  };

  const finishGame = () => {
    setGameState(prev => ({
      ...prev,
      isGameFinished: true,
      gamePhase: 'tallyup',
      players: prev.players.map(player => ({
        ...player,
        isComplete: false,
        finalAmount: undefined,
        hasError: false,
      })),
    }));
  };

  const getTotalBuyIn = () => {
    return gameState.players.reduce((total, player) => total + player.buyIn, 0);
  };

  const getTotalCashOut = () => {
    return gameState.players.reduce((total, player) => {
      return total + (player.finalAmount || 0);
    }, 0);
  };

  const validateTallyBalance = () => {
    const totalBuyIn = getTotalBuyIn();
    const totalCashOut = getTotalCashOut();
    const isBalanced = Math.abs(totalBuyIn - totalCashOut) < 0.01; // Allow for tiny floating point differences

    setGameState(prev => ({
      ...prev,
      isTallyBalanced: isBalanced,
      players: prev.players.map(player => ({
        ...player,
        hasError: player.isComplete ? !isBalanced : false,
      })),
    }));

    return isBalanced;
  };

  const updatePlayerFinalAmount = (id: string, amount: number) => {
    setGameState(prev => {
      const updatedPlayers = prev.players.map(player =>
        player.id === id
          ? { ...player, finalAmount: amount, isComplete: true, hasError: false }
          : player
      );

      const updatedState = {
        ...prev,
        players: updatedPlayers,
      };

      // Check if all players have completed their tally
      const allComplete = updatedPlayers.every(player => player.isComplete);

      if (allComplete) {
        const totalBuyIn = updatedPlayers.reduce((total, p) => total + p.buyIn, 0);
        const totalCashOut = updatedPlayers.reduce((total, p) => total + (p.finalAmount || 0), 0);
        const isBalanced = Math.abs(totalBuyIn - totalCashOut) < 0.01;

        return {
          ...updatedState,
          isTallyBalanced: isBalanced,
          players: updatedPlayers.map(p => ({
            ...p,
            hasError: !isBalanced,
          })),
        };
      }

      return updatedState;
    });
  };

  const areAllPlayersComplete = () => {
    return gameState.players.length > 0 &&
           gameState.players.every(player => player.isComplete) &&
           gameState.isTallyBalanced;
  };

  const getPlayerProfit = (player: Player) => {
    if (player.finalAmount === undefined) return 0;
    return player.finalAmount - player.buyIn;
  };

  // New phase management methods
  const setGamePhase = (phase: GamePhase) => {
    setGameState(prev => ({ ...prev, gamePhase: phase }));
  };

  const goToNextPhase = () => {
    setGameState(prev => {
      let nextPhase: GamePhase = prev.gamePhase;

      switch (prev.gamePhase) {
        case 'setup':
          nextPhase = 'inprogress';
          break;
        case 'inprogress':
          nextPhase = 'tallyup';
          break;
        case 'tallyup':
          nextPhase = 'settle';
          break;
        case 'settle':
          // Stay at settle or could reset to setup
          nextPhase = 'settle';
          break;
      }

      return { ...prev, gamePhase: nextPhase };
    });
  };

  const goToPreviousPhase = () => {
    setGameState(prev => {
      let previousPhase: GamePhase = prev.gamePhase;

      switch (prev.gamePhase) {
        case 'inprogress':
          previousPhase = 'setup';
          break;
        case 'tallyup':
          previousPhase = 'inprogress';
          break;
        case 'settle':
          previousPhase = 'tallyup';
          break;
        case 'setup':
          // Stay at setup
          previousPhase = 'setup';
          break;
      }

      return { ...prev, gamePhase: previousPhase };
    });
  };

  const resetGame = () => {
    setGameState({
      players: [],
      buyInAmount: 20,
      isGameFinished: false,
      isTallyBalanced: true,
      gamePhase: 'setup',
    });
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        setPlayers,
        addPlayer,
        removePlayer,
        addFunds,
        setBuyInAmount,
        startGame,
        finishGame,
        updatePlayerFinalAmount,
        areAllPlayersComplete,
        getPlayerProfit,
        getTotalBuyIn,
        getTotalCashOut,
        validateTallyBalance,
        setGamePhase,
        goToNextPhase,
        goToPreviousPhase,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

// Custom hook to use the game context
export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}