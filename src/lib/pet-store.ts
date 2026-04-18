// Pet system store for 数学小达人
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PetConfig {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export interface FurnitureItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  category: 'bed' | 'food' | 'toy' | 'decor';
}

interface PetState {
  // Pet info
  petType: string | null;
  petName: string;
  petLevel: number;
  petXP: number;
  petMood: number; // 0-100

  // Currency
  coins: number;

  // Furniture (purchased item IDs)
  furniture: string[];

  // Equipped furniture
  equippedFurniture: {
    bed?: string;
    food?: string;
    toy?: string;
    decor?: string;
  };
}

interface PetActions {
  adoptPet: (petId: string) => void;
  renamePet: (name: string) => void;
  feedPet: () => void;
  playWithPet: () => void;
  rewardFromPractice: (xp: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  buyFurniture: (itemId: string) => boolean;
  equipFurniture: (itemId: string, category: 'bed' | 'food' | 'toy' | 'decor') => void;
  unequipFurniture: (category: 'bed' | 'food' | 'toy' | 'decor') => void;
  resetPet: () => void;
}

// ─── Pet Configurations ─────────────────────────────────────────────────────

export const PET_CONFIGS: PetConfig[] = [
  {
    id: 'ragdoll',
    name: '布偶猫',
    emoji: '🐱',
    description: '温柔可爱的小猫咪，最爱被摸摸头~',
  },
  {
    id: 'shiba',
    name: '柴犬',
    emoji: '🐕',
    description: '活泼开朗的柴柴，永远元气满满！',
  },
  {
    id: 'golden',
    name: '金毛',
    emoji: '🦮',
    description: '聪明温顺的大金毛，最好的学习伙伴！',
  },
  {
    id: 'rabbit',
    name: '兔子',
    emoji: '🐰',
    description: '毛茸茸的小兔子，安安静静陪着你~',
  },
  {
    id: 'hamster',
    name: '仓鼠',
    emoji: '🐹',
    description: '圆滚滚的小仓鼠，吃瓜子超可爱！',
  },
  {
    id: 'parrot',
    name: '鹦鹉',
    emoji: '🦜',
    description: '会说英语的小鹦鹉，帮你背单词！',
  },
  {
    id: 'panda',
    name: '小熊猫',
    emoji: '🐼',
    description: '国宝级小伙伴，陪你一起努力！',
  },
];

// ─── Furniture Shop ─────────────────────────────────────────────────────────

export const FURNITURE_SHOP: FurnitureItem[] = [
  // Beds
  { id: 'bed-basic', name: '小窝', emoji: '🛏️', price: 50, category: 'bed' },
  { id: 'bed-fluffy', name: '毛绒窝', emoji: '🧸', price: 150, category: 'bed' },
  { id: 'bed-castle', name: '小城堡', emoji: '🏰', price: 500, category: 'bed' },
  // Food
  { id: 'food-basic', name: '小碗', emoji: '🥣', price: 30, category: 'food' },
  { id: 'food-fancy', name: '精致餐具', emoji: '🍽️', price: 120, category: 'food' },
  { id: 'food-feast', name: '大餐台', emoji: '🎉', price: 400, category: 'food' },
  // Toys
  { id: 'toy-ball', name: '小球', emoji: '🎾', price: 40, category: 'toy' },
  { id: 'toy-puzzle', name: '益智玩具', emoji: '🧩', price: 100, category: 'toy' },
  { id: 'toy-slide', name: '小滑梯', emoji: '🎢', price: 350, category: 'toy' },
  // Decor
  { id: 'decor-lamp', name: '小夜灯', emoji: '🏮', price: 60, category: 'decor' },
  { id: 'decor-plant', name: '小盆栽', emoji: '🪴', price: 80, category: 'decor' },
  { id: 'decor-rainbow', name: '彩虹地毯', emoji: '🌈', price: 300, category: 'decor' },
];

// ─── Level Calculation ──────────────────────────────────────────────────────

function getPetLevel(xp: number): number {
  // Each level needs level * 50 XP
  let level = 1;
  let needed = 0;
  while (true) {
    needed += level * 50;
    if (xp < needed) break;
    level++;
  }
  return level;
}

function getPetXPForNextLevel(xp: number): { current: number; needed: number; progress: number } {
  let level = 1;
  let accumulated = 0;
  while (true) {
    const needed = level * 50;
    if (xp < accumulated + needed) {
      return {
        current: xp - accumulated,
        needed,
        progress: (xp - accumulated) / needed,
      };
    }
    accumulated += needed;
    level++;
  }
}

export { getPetLevel, getPetXPForNextLevel };

// ─── Initial State ──────────────────────────────────────────────────────────

const initialState: PetState = {
  petType: null,
  petName: '',
  petLevel: 1,
  petXP: 0,
  petMood: 80,
  coins: 0,
  furniture: [],
  equippedFurniture: {},
};

// ─── Store ──────────────────────────────────────────────────────────────────

export const usePetStore = create<PetState & PetActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      adoptPet: (petId: string) => {
        const petConfig = PET_CONFIGS.find((p) => p.id === petId);
        set({
          petType: petId,
          petName: petConfig?.name ?? '小伙伴',
          petLevel: 1,
          petXP: 0,
          petMood: 100,
        });
      },

      renamePet: (name: string) => {
        set({ petName: name });
      },

      feedPet: () => {
        const state = get();
        if (state.coins < 5) return; // Feeding costs 5 coins
        const newXP = state.petXP + 10;
        const newMood = Math.min(100, state.petMood + 10);
        set({
          coins: state.coins - 5,
          petXP: newXP,
          petLevel: getPetLevel(newXP),
          petMood: newMood,
        });
      },

      playWithPet: () => {
        const state = get();
        if (state.coins < 3) return; // Playing costs 3 coins
        const newXP = state.petXP + 5;
        const newMood = Math.min(100, state.petMood + 15);
        set({
          coins: state.coins - 3,
          petXP: newXP,
          petLevel: getPetLevel(newXP),
          petMood: newMood,
        });
      },

      rewardFromPractice: (xp: number) => {
        const state = get();
        const newXP = state.petXP + xp;
        set({
          petXP: newXP,
          petLevel: getPetLevel(newXP),
          // Practice also slightly boosts mood
          petMood: Math.min(100, state.petMood + 5),
        });
      },

      addCoins: (amount: number) => {
        const state = get();
        set({ coins: state.coins + amount });
      },

      spendCoins: (amount: number): boolean => {
        const state = get();
        if (state.coins < amount) return false;
        set({ coins: state.coins - amount });
        return true;
      },

      buyFurniture: (itemId: string): boolean => {
        const state = get();
        if (state.furniture.includes(itemId)) return false; // Already owned

        const item = FURNITURE_SHOP.find((f) => f.id === itemId);
        if (!item) return false;
        if (state.coins < item.price) return false;

        set({
          coins: state.coins - item.price,
          furniture: [...state.furniture, itemId],
        });
        return true;
      },

      equipFurniture: (itemId: string, category: 'bed' | 'food' | 'toy' | 'decor') => {
        const state = get();
        if (!state.furniture.includes(itemId)) return;
        set({
          equippedFurniture: {
            ...state.equippedFurniture,
            [category]: itemId,
          },
        });
      },

      unequipFurniture: (category: 'bed' | 'food' | 'toy' | 'decor') => {
        const state = get();
        const newEquipped = { ...state.equippedFurniture };
        delete newEquipped[category];
        set({ equippedFurniture: newEquipped });
      },

      resetPet: () => {
        set(initialState);
      },
    }),
    {
      name: 'math-genius-pet-store',
    }
  )
);
