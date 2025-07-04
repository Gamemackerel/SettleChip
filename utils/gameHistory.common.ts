// app/utils/gameHistory.common.ts
// Shared types and constants

export type PlayerHistory = {
  name: string;
  initialBuyIn: number;
  totalBuyIn: number;
  finalAmount: number;
  profitLoss: number;
};

export type GameHistoryEntry = {
  id: string;
  date: string;
  players: PlayerHistory[];
};

export interface DatabaseOperations {
  setupDatabase(): Promise<void>;
  saveGameToHistory(entry: GameHistoryEntry): Promise<void>;
  deleteGameFromHistory(gameId: string): Promise<void>;
  getGameHistory(): Promise<GameHistoryEntry[]>;
  clearGameHistory(): Promise<void>;
  getSessionsForPlayer(name: string): Promise<PlayerHistory[]>;
}