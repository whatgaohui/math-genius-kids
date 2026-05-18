'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  level: number;
  totalXP: number;
  totalStars: number;
  streak: number;
  /** Subject the entry excels at */
  bestSubject: 'math' | 'chinese' | 'english' | 'all';
  /** Rank title */
  rankTitle: string;
  rankEmoji: string;
  /** Accuracy % */
  accuracy: number;
  /** Practice sessions count */
  sessions: number;
}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'alltime';
export type LeaderboardCategory = 'xp' | 'stars' | 'streak' | 'accuracy';

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_PLAYERS: Omit<LeaderboardEntry, 'id'>[] = [
  { name: '小明同学', avatar: '😎', level: 12, totalXP: 4800, totalStars: 85, streak: 14, bestSubject: 'math', rankTitle: '知识骑士', rankEmoji: '⚔️', accuracy: 92, sessions: 156 },
  { name: '小红花', avatar: '🌸', level: 10, totalXP: 3900, totalStars: 72, streak: 10, bestSubject: 'chinese', rankTitle: '小学者', rankEmoji: '📚', accuracy: 88, sessions: 120 },
  { name: '小刚', avatar: '🤩', level: 8, totalXP: 2800, totalStars: 55, streak: 7, bestSubject: 'english', rankTitle: '探险家', rankEmoji: '🗺️', accuracy: 85, sessions: 89 },
  { name: '乐乐', avatar: '🥳', level: 15, totalXP: 6200, totalStars: 120, streak: 21, bestSubject: 'all', rankTitle: '小大师', rankEmoji: '🎓', accuracy: 95, sessions: 210 },
  { name: '小雪', avatar: '❄️', level: 6, totalXP: 1800, totalStars: 35, streak: 5, bestSubject: 'math', rankTitle: '小学徒', rankEmoji: '📝', accuracy: 80, sessions: 52 },
  { name: '天天', avatar: '☀️', level: 9, totalXP: 3200, totalStars: 60, streak: 8, bestSubject: 'chinese', rankTitle: '探险家', rankEmoji: '🗺️', accuracy: 87, sessions: 98 },
  { name: '月月', avatar: '🌙', level: 7, totalXP: 2200, totalStars: 42, streak: 6, bestSubject: 'english', rankTitle: '小学徒', rankEmoji: '📝', accuracy: 82, sessions: 67 },
  { name: '星星', avatar: '⭐', level: 11, totalXP: 4500, totalStars: 90, streak: 12, bestSubject: 'all', rankTitle: '知识骑士', rankEmoji: '⚔️', accuracy: 91, sessions: 145 },
  { name: '小宇', avatar: '🚀', level: 5, totalXP: 1200, totalStars: 25, streak: 3, bestSubject: 'math', rankTitle: '初学者', rankEmoji: '🌱', accuracy: 76, sessions: 38 },
  { name: '小美', avatar: '🎨', level: 13, totalXP: 5100, totalStars: 100, streak: 16, bestSubject: 'chinese', rankTitle: '知识骑士', rankEmoji: '⚔️', accuracy: 93, sessions: 178 },
];

// ─── Store ──────────────────────────────────────────────────────────────────

interface LeaderboardState {
  period: LeaderboardPeriod;
  category: LeaderboardCategory;
  setPeriod: (period: LeaderboardPeriod) => void;
  setCategory: (category: LeaderboardCategory) => void;
  getLeaderboard: (playerXP: number, playerStars: number, playerStreak: number, playerLevel: number, playerAccuracy: number, playerSessions: number) => LeaderboardEntry[];
}

export const useLeaderboardStore = create<LeaderboardState>()(
  persist(
    (set, get) => ({
      period: 'weekly',
      category: 'xp',

      setPeriod: (period) => set({ period }),
      setCategory: (category) => set({ category }),

      getLeaderboard: (playerXP, playerStars, playerStreak, playerLevel, playerAccuracy, playerSessions) => {
        // Build entries including the current player
        const entries: LeaderboardEntry[] = MOCK_PLAYERS.map((p, i) => ({
          ...p,
          id: `mock-${i}`,
          // Add some randomness based on period
          totalXP: get().period === 'daily' ? Math.floor(p.totalXP * 0.1) : get().period === 'weekly' ? Math.floor(p.totalXP * 0.4) : p.totalXP,
          totalStars: get().period === 'daily' ? Math.floor(p.totalStars * 0.1) : get().period === 'weekly' ? Math.floor(p.totalStars * 0.3) : p.totalStars,
        }));

        // Current player entry
        const currentPlayer: LeaderboardEntry = {
          id: 'current-player',
          name: '我',
          avatar: '😀',
          level: playerLevel,
          totalXP: get().period === 'daily' ? Math.floor(playerXP * 0.1) : get().period === 'weekly' ? Math.floor(playerXP * 0.4) : playerXP,
          totalStars: get().period === 'daily' ? Math.floor(playerStars * 0.1) : get().period === 'weekly' ? Math.floor(playerStars * 0.3) : playerStars,
          streak: playerStreak,
          bestSubject: 'all',
          rankTitle: '初学者',
          rankEmoji: '🌱',
          accuracy: playerAccuracy,
          sessions: playerSessions,
        };

        entries.push(currentPlayer);

        // Sort by category
        const cat = get().category;
        entries.sort((a, b) => {
          switch (cat) {
            case 'xp': return b.totalXP - a.totalXP;
            case 'stars': return b.totalStars - a.totalStars;
            case 'streak': return b.streak - a.streak;
            case 'accuracy': return b.accuracy - a.accuracy;
            default: return b.totalXP - a.totalXP;
          }
        });

        return entries;
      },
    }),
    {
      name: 'math-genius-leaderboard-prefs',
    }
  )
);
