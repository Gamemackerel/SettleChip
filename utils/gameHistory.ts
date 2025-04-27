// app/utils/gameHistory.ts
// Utility for saving and retrieving settled game history from AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for game and player result
type PlayerHistory = {
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

const STORAGE_KEY = 'splitChipGameHistory';

// Save a new game result to history
export async function saveGameToHistory(entry: GameHistoryEntry) {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    let history: GameHistoryEntry[] = [];
    if (raw) {
      history = JSON.parse(raw);
    }
    history.unshift(entry); // newest first
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    // Optionally log error
    console.error('Failed to save game history', err);
  }
}

// Retrieve all game history
export async function getGameHistory(): Promise<GameHistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Optional: clear all history
export async function clearGameHistory() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {}
}