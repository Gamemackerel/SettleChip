// app/utils/databaseService.ts
// Platform-agnostic database service with dependency injection

import { Platform } from 'react-native';
import type {
  PlayerHistory,
  GameHistoryEntry
} from './gameHistory.common';

export interface DatabaseAdapter {
  setupDatabase(): Promise<void>;
  saveGameToHistory(entry: GameHistoryEntry): Promise<void>;
  deleteGameFromHistory(gameId: string): Promise<void>;
  getGameHistory(): Promise<GameHistoryEntry[]>;
  clearGameHistory(): Promise<void>;
  getSessionsForPlayer(name: string): Promise<PlayerHistory[]>;
}

// Web implementation
class WebDatabaseAdapter implements DatabaseAdapter {
  private mockGames: GameHistoryEntry[] = [
    {
      id: "game1",
      date: "2023-06-15T18:25:43.511Z",
      players: [
        { name: "Alice", initialBuyIn: 100, totalBuyIn: 150, finalAmount: 200, profitLoss: 50 },
        { name: "Bob", initialBuyIn: 100, totalBuyIn: 120, finalAmount: 80, profitLoss: -40 },
        { name: "Charlie", initialBuyIn: 100, totalBuyIn: 100, finalAmount: 70, profitLoss: -30 }
      ]
    },
    {
      id: "game2",
      date: "2023-06-20T19:30:22.123Z",
      players: [
        { name: "Alice", initialBuyIn: 100, totalBuyIn: 130, finalAmount: 180, profitLoss: 50 },
        { name: "Dave", initialBuyIn: 100, totalBuyIn: 100, finalAmount: 60, profitLoss: -40 },
        { name: "Eve", initialBuyIn: 100, totalBuyIn: 120, finalAmount: 110, profitLoss: -10 }
      ]
    }
  ];

  async setupDatabase() {}

  async saveGameToHistory(entry: GameHistoryEntry) {
    this.mockGames.push(entry);
  }

  async deleteGameFromHistory(gameId: string) {
    this.mockGames = this.mockGames.filter(game => game.id !== gameId);
  }

  async getGameHistory() {
    return [...this.mockGames].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async clearGameHistory() {
    this.mockGames = [];
  }

  async getSessionsForPlayer(name: string) {
    return this.mockGames.flatMap(game =>
      game.players.filter(player => player.name === name)
    );
  }
}


// Export singleton instance
export default new WebDatabaseAdapter()