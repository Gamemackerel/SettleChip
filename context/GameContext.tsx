import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define player type
export type Player = {
  id: string;
  name: string;
  buyIn: number;
  finalAmount?: number;
  isComplete?: boolean;
};

// Define game state
type GameState = {
  players: Player[];
  buyInAmount: number;
  isGameFinished: boolean;
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
};

// Create context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    buyInAmount: 20,
    isGameFinished: false,
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
    const players = playerNames.map(name => ({
      id: Date.now() + Math.random().toString(),
      name,
      buyIn: buyInAmount,
    }));

    setGameState({
      players,
      buyInAmount,
      isGameFinished: false,
    });
  };

  const finishGame = () => {
    setGameState(prev => ({
      ...prev,
      isGameFinished: true,
      players: prev.players.map(player => ({
        ...player,
        isComplete: false,
        finalAmount: undefined,
      })),
    }));
  };

  const updatePlayerFinalAmount = (id: string, amount: number) => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(player =>
        player.id === id
          ? { ...player, finalAmount: amount, isComplete: true }
          : player
      ),
    }));
  };

  const areAllPlayersComplete = () => {
    return gameState.players.length > 0 &&
           gameState.players.every(player => player.isComplete);
  };

  const getPlayerProfit = (player: Player) => {
    if (player.finalAmount === undefined) return 0;
    return player.finalAmount - player.buyIn;
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
