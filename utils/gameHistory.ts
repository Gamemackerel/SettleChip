// app/utils/gameHistory.ts
// Utility for saving and retrieving settled game history from SQLite

import * as SQLite from 'expo-sqlite';

// Types for game and player result
export type PlayerHistory = {
  name: string;
  initialBuyIn: number;
  totalBuyIn: number;
  finalAmount: number;
  profitLoss: number;
};

export type GameHistoryEntry = {
  id: string; // unique id for the game
  date: string; // ISO string
  players: PlayerHistory[];
};

let db: SQLite.SQLiteDatabase | null = null;

// Internal: get or open the database
async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('splitChip.db');
  }
  return db;
}

// Call this once at app startup
export async function setupDatabase() {
  console.log('Setting up database...');
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Games (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT
    );
    CREATE TABLE IF NOT EXISTS PlayerSessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id TEXT,
      name TEXT,
      initialBuyIn REAL,
      totalBuyIn REAL,
      finalAmount REAL,
      profitLoss REAL,
      FOREIGN KEY (game_id) REFERENCES Games(id)
    );
    CREATE INDEX IF NOT EXISTS idx_player_name ON PlayerSessions (name);
  `);
}

// Save a new game result to history
export async function saveGameToHistory(entry: GameHistoryEntry): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT INTO Games (id, date) VALUES (?, ?);', [entry.id, entry.date]);
  for (const player of entry.players) {
    await db.runAsync(
      'INSERT INTO PlayerSessions (game_id, name, initialBuyIn, totalBuyIn, finalAmount, profitLoss) VALUES (?, ?, ?, ?, ?, ?);',
      [entry.id, player.name, player.initialBuyIn, player.totalBuyIn, player.finalAmount, player.profitLoss]
    );
  }
}

// Delete a game from history
export async function deleteGameFromHistory(gameId: string): Promise<void> {
  const db = await getDb();
  // Delete player sessions first to maintain referential integrity
  await db.runAsync('DELETE FROM PlayerSessions WHERE game_id = ?', [gameId]);
  // Then delete the game
  await db.runAsync('DELETE FROM Games WHERE id = ?', [gameId]);
}

// Retrieve all game history with player sessions
export async function getGameHistory(): Promise<GameHistoryEntry[]> {
  const db = await getDb();
  const gamesResult = await db.getAllAsync('SELECT * FROM Games ORDER BY date DESC;');
  const gameIds = gamesResult.map((g: any) => g.id);
  if (gameIds.length === 0) return [];
  const placeholders = gameIds.map(() => '?').join(',');
  const playersResult = await db.getAllAsync(
    `SELECT * FROM PlayerSessions WHERE game_id IN (${placeholders});`,
    gameIds
  );
  const playersByGame: { [key: string]: PlayerHistory[] } = {};
  for (const row of playersResult) {
    const r = row as any;
    if (!playersByGame[r.game_id]) playersByGame[r.game_id] = [];
    playersByGame[r.game_id].push({
      name: r.name,
      initialBuyIn: r.initialBuyIn,
      totalBuyIn: r.totalBuyIn,
      finalAmount: r.finalAmount,
      profitLoss: r.profitLoss,
    });
  }
  return gamesResult.map((gameRow: any) => ({
    id: gameRow.id,
    date: gameRow.date,
    players: playersByGame[gameRow.id] || [],
  }));
}

// Optional: clear all history
enum Table {
  Games = 'Games',
  PlayerSessions = 'PlayerSessions',
}
export async function clearGameHistory(): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM ${Table.PlayerSessions};`);
  await db.runAsync(`DELETE FROM ${Table.Games};`);
}

// Get all sessions for a particular player name
export async function getSessionsForPlayer(name: string): Promise<PlayerHistory[]> {
  const db = await getDb();
  const result = await db.getAllAsync(
    'SELECT * FROM PlayerSessions WHERE name = ? ORDER BY id DESC;',
    [name]
  );
  return result.map((row: any) => {
    const r = row as any;
    return {
      name: r.name,
      initialBuyIn: r.initialBuyIn,
      totalBuyIn: r.totalBuyIn,
      finalAmount: r.finalAmount,
      profitLoss: r.profitLoss,
    };
  });
}