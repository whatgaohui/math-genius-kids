'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Theme Types ────────────────────────────────────────────────────────────

export type ThemeId = 'default' | 'ocean' | 'forest' | 'starry' | 'sakura';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  emoji: string;
  /** Primary gradient for headers */
  gradient: string;
  /** Accent color for buttons and highlights */
  accent: string;
  /** Light accent background */
  accentLight: string;
  /** Text color for accent elements */
  accentText: string;
  /** Preview colors for the theme card */
  previewColors: string[];
  /** Background gradient for pages (light mode) */
  bgGradient: string;
  /** Header gradient */
  headerGradient: string;
  /** Card border color */
  cardBorder: string;
  /** Progress bar gradient */
  progressGradient: string;
  /** Accent hex for CSS variables */
  accentHex: string;
  /** Tab indicator color */
  tabIndicator: string;
  /** Decorative blob colors */
  blob1: string;
  blob2: string;
}

// ─── Theme Definitions ──────────────────────────────────────────────────────

export const THEMES: ThemeConfig[] = [
  {
    id: 'default',
    name: '默认',
    emoji: '🌟',
    gradient: 'from-amber-400 via-orange-400 to-yellow-300',
    accent: 'from-amber-400 to-orange-400',
    accentLight: 'bg-amber-50',
    accentText: 'text-amber-600',
    previewColors: ['#f59e0b', '#f97316', '#fbbf24'],
    bgGradient: 'from-amber-50/60 via-orange-50/30 to-white',
    headerGradient: 'from-amber-400 to-orange-500',
    cardBorder: 'border-amber-100/60',
    progressGradient: 'from-amber-400 to-orange-400',
    accentHex: '#f59e0b',
    tabIndicator: 'bg-amber-500',
    blob1: 'bg-amber-200/30',
    blob2: 'bg-rose-200/20',
  },
  {
    id: 'ocean',
    name: '海洋',
    emoji: '🌊',
    gradient: 'from-cyan-400 via-teal-400 to-emerald-300',
    accent: 'from-cyan-400 to-teal-400',
    accentLight: 'bg-cyan-50',
    accentText: 'text-cyan-600',
    previewColors: ['#22d3ee', '#14b8a6', '#34d399'],
    bgGradient: 'from-cyan-50/60 via-teal-50/30 to-white',
    headerGradient: 'from-cyan-500 to-teal-500',
    cardBorder: 'border-cyan-100/60',
    progressGradient: 'from-cyan-400 to-teal-400',
    accentHex: '#06b6d4',
    tabIndicator: 'bg-cyan-500',
    blob1: 'bg-cyan-200/30',
    blob2: 'bg-teal-200/20',
  },
  {
    id: 'forest',
    name: '森林',
    emoji: '🌲',
    gradient: 'from-emerald-400 via-green-400 to-lime-300',
    accent: 'from-emerald-400 to-green-400',
    accentLight: 'bg-emerald-50',
    accentText: 'text-emerald-600',
    previewColors: ['#34d399', '#22c55e', '#a3e635'],
    bgGradient: 'from-emerald-50/60 via-green-50/30 to-white',
    headerGradient: 'from-emerald-500 to-green-500',
    cardBorder: 'border-emerald-100/60',
    progressGradient: 'from-emerald-400 to-green-400',
    accentHex: '#10b981',
    tabIndicator: 'bg-emerald-500',
    blob1: 'bg-emerald-200/30',
    blob2: 'bg-lime-200/20',
  },
  {
    id: 'starry',
    name: '星空',
    emoji: '✨',
    gradient: 'from-violet-500 via-purple-500 to-indigo-400',
    accent: 'from-violet-400 to-purple-400',
    accentLight: 'bg-violet-50',
    accentText: 'text-violet-600',
    previewColors: ['#8b5cf6', '#a855f7', '#818cf8'],
    bgGradient: 'from-violet-50/60 via-purple-50/30 to-white',
    headerGradient: 'from-violet-500 to-purple-600',
    cardBorder: 'border-violet-100/60',
    progressGradient: 'from-violet-400 to-purple-400',
    accentHex: '#8b5cf6',
    tabIndicator: 'bg-violet-500',
    blob1: 'bg-violet-200/30',
    blob2: 'bg-indigo-200/20',
  },
  {
    id: 'sakura',
    name: '樱花',
    emoji: '🌸',
    gradient: 'from-pink-400 via-rose-400 to-red-200',
    accent: 'from-pink-400 to-rose-400',
    accentLight: 'bg-pink-50',
    accentText: 'text-pink-600',
    previewColors: ['#f472b6', '#fb7185', '#fda4af'],
    bgGradient: 'from-pink-50/60 via-rose-50/30 to-white',
    headerGradient: 'from-pink-400 to-rose-500',
    cardBorder: 'border-pink-100/60',
    progressGradient: 'from-pink-400 to-rose-400',
    accentHex: '#ec4899',
    tabIndicator: 'bg-pink-500',
    blob1: 'bg-pink-200/30',
    blob2: 'bg-rose-200/20',
  },
];

// ─── Store Interface ────────────────────────────────────────────────────────

interface ThemeState {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  getThemeConfig: () => ThemeConfig;
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'default',

      setTheme: (theme: ThemeId) => {
        set({ theme });
      },

      getThemeConfig: () => {
        const { theme } = get();
        return THEMES.find((t) => t.id === theme) ?? THEMES[0];
      },
    }),
    {
      name: 'math-genius-theme-store',
    }
  )
);

// ─── Helper Hooks ───────────────────────────────────────────────────────────

/** Get the current theme config object */
export function getCurrentThemeConfig(): ThemeConfig {
  const theme = useThemeStore.getState().theme;
  return THEMES.find((t) => t.id === theme) ?? THEMES[0];
}
