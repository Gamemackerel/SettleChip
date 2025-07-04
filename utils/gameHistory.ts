// app/utils/gameHistory.ts
// Simplified game history service using database adapter

import DatabaseService from './databaseService';
import type {
  PlayerHistory,
  GameHistoryEntry
} from './gameHistory.common';

// Export database operations directly
export const setupDatabase = DatabaseService.setupDatabase.bind(DatabaseService);
export const saveGameToHistory = DatabaseService.saveGameToHistory.bind(DatabaseService);
export const deleteGameFromHistory = DatabaseService.deleteGameFromHistory.bind(DatabaseService);
export const getGameHistory = DatabaseService.getGameHistory.bind(DatabaseService);
export const clearGameHistory = DatabaseService.clearGameHistory.bind(DatabaseService);
export const getSessionsForPlayer = DatabaseService.getSessionsForPlayer.bind(DatabaseService);

// Export types for external use
export type { PlayerHistory, GameHistoryEntry };