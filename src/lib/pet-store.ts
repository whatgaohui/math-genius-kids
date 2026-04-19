// Pet system store for 学习小达人 — Comprehensive pet growth & reward system
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PetConfig {
  id: string;
  name: string;
  emoji: string;
  description: string;
  talent: PetTalent;
}

export interface PetTalent {
  name: string;
  emoji: string;
  description: string;
  // Bonus modifiers (added on top of level bonuses)
  coinBonusExtra: number;     // extra % coin bonus
  critChanceExtra: number;    // extra crit chance (0.xx)
  xpBonusExtra: number;       // extra % xp bonus
  comboMultiplierExtra: number; // extra combo multiplier (e.g. 0.5 means +50%)
  perfectBonusExtra: number;  // extra perfect score coins
  speedBonusExtra: number;    // extra speed bonus coins
  englishBonusExtra: number;  // extra % coins for english subject
  allBonusExtra: number;      // extra % for ALL bonuses
}

export interface FurnitureItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  category: 'bed' | 'food' | 'toy' | 'decor';
}

export interface PetAbility {
  level: number;
  name: string;
  emoji: string;
  description: string;
  effect: string; // e.g. "+10% 经验加成"
}

export interface PracticeReward {
  coins: number;
  petXP: number;
  isCriticalHit: boolean;
  criticalMultiplier: number;
  modeMultiplier: number;
  bonuses: {
    base: number;
    star: number;
    combo: number;
    perfect: number;
    speed: number;
    streak: number;
    petBonus: number;
    critical: number;
    modeMultiplier: number;
  };
  talentBonus: number;
  talentName?: string;
  talentEmoji?: string;
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
  totalCoinsEarned: number; // lifetime coins

  // Furniture (purchased item IDs)
  furniture: string[];

  // Equipped furniture
  equippedFurniture: {
    bed?: string;
    food?: string;
    toy?: string;
    decor?: string;
  };

  // Streak login
  lastLoginDate: string;
  loginStreak: number;
  todayLoginClaimed: boolean;

  // Practice tracking
  totalPracticeSessions: number;
}

interface PetActions {
  adoptPet: (petId: string) => void;
  renamePet: (name: string) => void;
  feedPet: () => void;
  playWithPet: () => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  buyFurniture: (itemId: string) => boolean;
  equipFurniture: (itemId: string, category: 'bed' | 'food' | 'toy' | 'decor') => void;
  unequipFurniture: (category: 'bed' | 'food' | 'toy' | 'decor') => void;
  resetPet: () => void;

  // Reward system
  calculatePracticeReward: (params: {
    correct: number;
    total: number;
    stars: number;
    maxCombo: number;
    timeMs: number;
    playerStreak: number;
    subject?: string;
    mode?: string;
    floorLevel?: number;
  }) => PracticeReward;
  awardPracticeReward: (reward: PracticeReward) => void;

  // Streak login
  checkAndClaimLoginReward: () => { coins: number; isNewLogin: boolean };
}

// ─── Pet Configurations ─────────────────────────────────────────────────────

export const PET_CONFIGS: PetConfig[] = [
  {
    id: 'ragdoll',
    name: '布偶猫',
    emoji: '🐱',
    description: '温柔可爱的小猫咪，最爱被摸摸头~',
    talent: {
      name: '财运亨通',
      emoji: '💰',
      description: '天生聚财体质，金币获取额外+20%',
      coinBonusExtra: 20,
      critChanceExtra: 0,
      xpBonusExtra: 0,
      comboMultiplierExtra: 0,
      perfectBonusExtra: 0,
      speedBonusExtra: 0,
      englishBonusExtra: 0,
      allBonusExtra: 0,
    },
  },
  {
    id: 'shiba',
    name: '柴犬',
    emoji: '🐕',
    description: '活泼开朗的柴柴，永远元气满满！',
    talent: {
      name: '暴击之王',
      emoji: '⚡',
      description: '天生好运连连，暴击率额外+8%',
      coinBonusExtra: 0,
      critChanceExtra: 0.08,
      xpBonusExtra: 0,
      comboMultiplierExtra: 0,
      perfectBonusExtra: 0,
      speedBonusExtra: 0,
      englishBonusExtra: 0,
      allBonusExtra: 0,
    },
  },
  {
    id: 'golden',
    name: '金毛',
    emoji: '🦮',
    description: '聪明温顺的大金毛，最好的学习伙伴！',
    talent: {
      name: '学霸附体',
      emoji: '🎓',
      description: '学习效率超高，经验获取额外+15%',
      coinBonusExtra: 0,
      critChanceExtra: 0,
      xpBonusExtra: 15,
      comboMultiplierExtra: 0,
      perfectBonusExtra: 0,
      speedBonusExtra: 0,
      englishBonusExtra: 0,
      allBonusExtra: 0,
    },
  },
  {
    id: 'rabbit',
    name: '兔子',
    emoji: '🐰',
    description: '毛茸茸的小兔子，安安静静陪着你~',
    talent: {
      name: '连击达人',
      emoji: '🔥',
      description: '连续答对奖励更丰厚，连击加成额外+50%',
      coinBonusExtra: 0,
      critChanceExtra: 0,
      xpBonusExtra: 0,
      comboMultiplierExtra: 0.5,
      perfectBonusExtra: 0,
      speedBonusExtra: 0,
      englishBonusExtra: 0,
      allBonusExtra: 0,
    },
  },
  {
    id: 'hamster',
    name: '仓鼠',
    emoji: '🐹',
    description: '圆滚滚的小仓鼠，吃瓜子超可爱！',
    talent: {
      name: '聚宝盆',
      emoji: '🎁',
      description: '满分奖励额外+15，速度奖励额外+8',
      coinBonusExtra: 0,
      critChanceExtra: 0,
      xpBonusExtra: 0,
      comboMultiplierExtra: 0,
      perfectBonusExtra: 15,
      speedBonusExtra: 8,
      englishBonusExtra: 0,
      allBonusExtra: 0,
    },
  },
  {
    id: 'parrot',
    name: '鹦鹉',
    emoji: '🦜',
    description: '会说英语的小鹦鹉，帮你背单词！',
    talent: {
      name: '外语天才',
      emoji: '🔤',
      description: '英语练习金币额外+25%',
      coinBonusExtra: 0,
      critChanceExtra: 0,
      xpBonusExtra: 0,
      comboMultiplierExtra: 0,
      perfectBonusExtra: 0,
      speedBonusExtra: 0,
      englishBonusExtra: 25,
      allBonusExtra: 0,
    },
  },
  {
    id: 'panda',
    name: '小熊猫',
    emoji: '🐼',
    description: '国宝级小伙伴，陪你一起努力！',
    talent: {
      name: '全能学霸',
      emoji: '🌟',
      description: '各方面都很优秀，所有加成额外+8%',
      coinBonusExtra: 0,
      critChanceExtra: 0,
      xpBonusExtra: 0,
      comboMultiplierExtra: 0,
      perfectBonusExtra: 0,
      speedBonusExtra: 0,
      englishBonusExtra: 0,
      allBonusExtra: 8,
    },
  },
];

// ─── Pet Abilities (unlocked by level) ──────────────────────────────────────

export const PET_ABILITIES: PetAbility[] = [
  { level: 1, name: '学习伙伴', emoji: '🐾', description: '和你一起学习的小伙伴', effect: '陪伴加成' },
  { level: 3, name: '学习助手', emoji: '📚', description: '宠物帮你整理笔记，提升学习效率', effect: '+10% 经验加成' },
  { level: 5, name: '金币猎人', emoji: '💰', description: '宠物帮你找到更多金币', effect: '+15% 金币加成' },
  { level: 8, name: '连击守护', emoji: '🛡️', description: '宠物的鼓励让你更专注，连击不易断', effect: '连击奖励翻倍' },
  { level: 10, name: '幸运星', emoji: '⭐', description: '宠物带来好运，暴击概率提升', effect: '暴击率+5%' },
  { level: 13, name: '经验大师', emoji: '🎓', description: '宠物已成为学习大师', effect: '+20% 经验加成' },
  { level: 16, name: '财富之友', emoji: '👑', description: '宠物带来丰厚回报', effect: '+25% 金币加成' },
  { level: 20, name: '满级大师', emoji: '🏆', description: '宠物已达到最高境界！所有加成+30%！', effect: '全属性+30%' },
];

// ─── Level Unlock Content ──────────────────────────────────────────────────

export interface LevelUnlock {
  level: number;
  name: string;
  emoji: string;
  description: string;
  category: 'mode' | 'reward' | 'feature';
}

export const LEVEL_UNLOCKS: LevelUnlock[] = [
  { level: 3, name: '成语填空', emoji: '📝', description: '解锁语文成语填空模式', category: 'mode' },
  { level: 3, name: '反义词大挑战', emoji: '🔄', description: '解锁语文反义词模式', category: 'mode' },
  { level: 3, name: '近义词连连看', emoji: '🔗', description: '解锁语文近义词模式', category: 'mode' },
  { level: 5, name: '每日奖励翻倍', emoji: '🎁', description: '每日登录奖励金币×2', category: 'reward' },
  { level: 5, name: '古诗填空', emoji: '📜', description: '解锁语文古诗填空模式', category: 'mode' },
  { level: 8, name: '进阶闯关', emoji: '🏰', description: '解锁数学进阶闯关难度', category: 'mode' },
  { level: 10, name: '暴击强化', emoji: '⚡', description: '暴击率提升到15%', category: 'reward' },
  { level: 10, name: '宠物称号', emoji: '🏅', description: '解锁自定义宠物称号', category: 'feature' },
  { level: 13, name: '经验大师', emoji: '🎓', description: '经验加成提升到20%', category: 'reward' },
  { level: 15, name: '专属宠物皮肤', emoji: '🎨', description: '解锁宠物彩虹特效', category: 'feature' },
  { level: 16, name: '财富之友', emoji: '👑', description: '金币加成提升到25%', category: 'reward' },
  { level: 20, name: '满级大师', emoji: '🏆', description: '全属性加成+30%！传说称号', category: 'feature' },
];

export function getUnlocksForLevel(level: number): LevelUnlock[] {
  return LEVEL_UNLOCKS.filter((u) => u.level <= level);
}

export function getNextUnlock(level: number): LevelUnlock | null {
  return LEVEL_UNLOCKS.find((u) => u.level > level) ?? null;
}

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

// ─── Pet Evolution Emojis ───────────────────────────────────────────────────

export const PET_EVOLUTION: Record<string, Record<number, string>> = {
  ragdoll: { 1: '🐱', 8: '😺', 15: '😸', 20: '😻' },
  shiba: { 1: '🐕', 8: '🐶', 15: '🐕‍🦺', 20: '🦮' },
  golden: { 1: '🐕', 8: '🦮', 15: '🦮', 20: '🐕‍🦺' },
  rabbit: { 1: '🐰', 8: '🐇', 15: '🐇', 20: '🐇' },
  hamster: { 1: '🐹', 8: '🐁', 15: '🐿️', 20: '🐿️' },
  parrot: { 1: '🦜', 8: '🦜', 15: '🦚', 20: '🦚' },
  panda: { 1: '🐼', 8: '🐼', 15: '🐼', 20: '🐼' },
};

export function getPetTalent(petType: string | null): PetTalent | null {
  if (!petType) return null;
  const config = PET_CONFIGS.find(p => p.id === petType);
  return config?.talent ?? null;
}

export function getPetEmoji(petType: string | null, petLevel: number): string {
  if (!petType) return '🐾';
  const evolutions = PET_EVOLUTION[petType];
  if (!evolutions) return '🐾';
  let emoji = evolutions[1] || '🐾';
  for (const [lvl, e] of Object.entries(evolutions)) {
    if (petLevel >= Number(lvl)) {
      emoji = e;
    }
  }
  return emoji;
}

// ─── Level Calculation ──────────────────────────────────────────────────────

const MAX_PET_LEVEL = 20;

function getPetLevel(xp: number): number {
  let level = 1;
  let needed = 0;
  while (level < MAX_PET_LEVEL) {
    needed += level * 40 + 20;
    if (xp < needed) break;
    level++;
  }
  return level;
}

function getPetXPForNextLevel(xp: number): { current: number; needed: number; progress: number } {
  let level = 1;
  let accumulated = 0;
  while (level < MAX_PET_LEVEL) {
    const needed = level * 40 + 20;
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
  return { current: xp - accumulated, needed: 0, progress: 1 };
}

export { getPetLevel, getPetXPForNextLevel };

// ─── Pet Bonus Helpers ──────────────────────────────────────────────────────

export function getCoinBonusPercent(petLevel: number, petType?: string | null): number {
  let base = 0;
  if (petLevel >= 20) base = 30;
  else if (petLevel >= 16) base = 25;
  else if (petLevel >= 5) base = 15;

  // Add talent bonus
  const talent = getPetTalent(petType ?? null);
  if (talent) {
    base += talent.coinBonusExtra;
    base += talent.allBonusExtra;
  }
  return base;
}

export function getXPBonusPercent(petLevel: number, petType?: string | null): number {
  let base = 0;
  if (petLevel >= 20) base = 30;
  else if (petLevel >= 13) base = 20;
  else if (petLevel >= 3) base = 10;

  // Add talent bonus
  const talent = getPetTalent(petType ?? null);
  if (talent) {
    base += talent.xpBonusExtra;
    base += talent.allBonusExtra;
  }
  return base;
}

export function getCriticalHitChance(petLevel: number, petType?: string | null): number {
  let base = 0.10;
  if (petLevel >= 10) base += 0.05;

  // Add talent bonus
  const talent = getPetTalent(petType ?? null);
  if (talent) {
    base += talent.critChanceExtra;
  }
  return base;
}

export function getComboMultiplier(petLevel: number, petType?: string | null): number {
  let base: number;
  if (petLevel >= 8) base = 2;
  else base = 1;

  // Add talent bonus
  const talent = getPetTalent(petType ?? null);
  if (talent) {
    base += talent.comboMultiplierExtra;
  }
  return base;
}

// ─── Reward Calculation ─────────────────────────────────────────────────────

function calculatePracticeReward(
  params: {
    correct: number;
    total: number;
    stars: number;
    maxCombo: number;
    timeMs: number;
    playerStreak: number;
    subject?: string;
    mode?: string;
    floorLevel?: number;
  },
  petLevel: number,
  petType?: string | null
): PracticeReward {
  const { correct, total, stars, maxCombo, timeMs, playerStreak, subject, mode, floorLevel } = params;
  const accuracy = total > 0 ? correct / total : 0;
  const talent = getPetTalent(petType ?? null);

  // Base coins
  const base = correct * 2;

  // Star bonus
  const star = stars * 5;

  // Combo bonus
  const comboMultiplier = getComboMultiplier(petLevel, petType);
  let combo = 0;
  if (maxCombo >= 10) combo = Math.floor(25 * comboMultiplier);
  else if (maxCombo >= 5) combo = Math.floor(10 * comboMultiplier);
  else if (maxCombo >= 3) combo = Math.floor(5 * comboMultiplier);

  // Perfect score bonus (with talent extra)
  let perfect = accuracy >= 1.0 && total >= 5 ? 20 : 0;
  if (perfect > 0 && talent) {
    perfect += talent.perfectBonusExtra;
  }

  // Speed bonus (< 30 seconds for 10+ questions, with talent extra)
  let speed = (timeMs < 30000 && total >= 5) ? 10 : 0;
  if (speed > 0 && talent) {
    speed += talent.speedBonusExtra;
  }

  // Streak login bonus
  const streak = Math.min(playerStreak * 3, 30);

  // Subtotal before pet bonus
  const subtotal = base + star + combo + perfect + speed + streak;

  // Pet coin bonus
  const coinBonusPercent = getCoinBonusPercent(petLevel, petType);
  let petBonus = Math.floor(subtotal * coinBonusPercent / 100);

  // English talent bonus (apply as extra coins after pet bonus)
  let englishBonus = 0;
  if (talent && talent.englishBonusExtra > 0 && subject === 'english') {
    englishBonus = Math.floor((subtotal + petBonus) * talent.englishBonusExtra / 100);
  }

  // All-around talent bonus
  let allBonus = 0;
  if (talent && talent.allBonusExtra > 0) {
    allBonus = Math.floor((subtotal + petBonus) * talent.allBonusExtra / 100);
  }

  // Talent total
  const talentTotal = englishBonus + allBonus;

  // Subtotal before critical hit
  const beforeCritical = subtotal + petBonus + talentTotal;

  // Mode multiplier
  let modeMultiplierValue = 1;
  if (mode === 'speed') {
    modeMultiplierValue = 1.5;
  } else if (mode === 'adventure' && typeof floorLevel === 'number') {
    modeMultiplierValue = Math.min(floorLevel / 10 + 1, 10);
  }
  const modeBonus = Math.floor(beforeCritical * (modeMultiplierValue - 1));

  // Critical hit
  const critChance = getCriticalHitChance(petLevel, petType);
  const isCriticalHit = Math.random() < critChance;
  const criticalMultiplier = isCriticalHit ? 2 : 1;
  const critical = isCriticalHit ? (beforeCritical + modeBonus) : 0;

  const totalCoins = Math.floor((beforeCritical + modeBonus + critical));

  // Pet XP = correct * 3 + stars * 10
  const petXP = correct * 3 + stars * 10;

  return {
    coins: totalCoins,
    petXP,
    isCriticalHit,
    criticalMultiplier,
    modeMultiplier: modeMultiplierValue,
    bonuses: {
      base,
      star,
      combo,
      perfect,
      speed,
      streak,
      petBonus,
      critical,
      modeMultiplier: modeBonus,
    },
    talentBonus: talentTotal,
  };
}

// ─── Login Streak ───────────────────────────────────────────────────────────

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

// ─── Initial State ──────────────────────────────────────────────────────────

const initialState: PetState = {
  petType: null,
  petName: '',
  petLevel: 1,
  petXP: 0,
  petMood: 80,
  coins: 0,
  totalCoinsEarned: 0,
  furniture: [],
  equippedFurniture: {},
  lastLoginDate: '',
  loginStreak: 0,
  todayLoginClaimed: false,
  totalPracticeSessions: 0,
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
          // Keep coins and furniture when adopting new pet
        });
      },

      renamePet: (name: string) => {
        set({ petName: name });
      },

      feedPet: () => {
        const state = get();
        if (state.coins < 5) return;
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
        if (state.coins < 3) return;
        const newXP = state.petXP + 5;
        const newMood = Math.min(100, state.petMood + 15);
        set({
          coins: state.coins - 3,
          petXP: newXP,
          petLevel: getPetLevel(newXP),
          petMood: newMood,
        });
      },

      addCoins: (amount: number) => {
        const state = get();
        set({
          coins: state.coins + amount,
          totalCoinsEarned: state.totalCoinsEarned + amount,
        });
      },

      spendCoins: (amount: number): boolean => {
        const state = get();
        if (state.coins < amount) return false;
        set({ coins: state.coins - amount });
        return true;
      },

      buyFurniture: (itemId: string): boolean => {
        const state = get();
        if (state.furniture.includes(itemId)) return false;

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
        // Keep coins and furniture, reset pet progress
        const state = get();
        set({
          petType: null,
          petName: '',
          petLevel: 1,
          petXP: 0,
          petMood: 80,
        });
      },

      // ── Reward System ──

      calculatePracticeReward: (params) => {
        const state = get();
        const reward = calculatePracticeReward(params, state.petLevel, state.petType);
        // Attach talent info
        const talent = getPetTalent(state.petType);
        if (talent) {
          reward.talentName = talent.name;
          reward.talentEmoji = talent.emoji;
        }
        return reward;
      },

      awardPracticeReward: (reward: PracticeReward) => {
        const state = get();
        const newXP = state.petXP + reward.petXP;
        const newLevel = getPetLevel(newXP);
        set({
          coins: state.coins + reward.coins,
          totalCoinsEarned: state.totalCoinsEarned + reward.coins,
          petXP: newXP,
          petLevel: newLevel,
          petMood: Math.min(100, state.petMood + 3),
          totalPracticeSessions: state.totalPracticeSessions + 1,
        });
      },

      // ── Login Streak ──

      checkAndClaimLoginReward: (): { coins: number; isNewLogin: boolean } => {
        const state = get();
        const today = getTodayStr();

        // Already claimed today
        if (state.todayLoginClaimed && state.lastLoginDate === today) {
          return { coins: 0, isNewLogin: false };
        }

        // Calculate new streak
        let newStreak = 1;
        if (state.lastLoginDate) {
          const lastDate = new Date(state.lastLoginDate);
          const todayDate = new Date(today);
          const diffDays = Math.floor(
            (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diffDays === 1) {
            newStreak = state.loginStreak + 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        }

        // Calculate login coins: base 5 + streak bonus
        const loginCoins = 5 + Math.min(newStreak * 2, 20);

        set({
          lastLoginDate: today,
          loginStreak: newStreak,
          todayLoginClaimed: true,
          coins: state.coins + loginCoins,
          totalCoinsEarned: state.totalCoinsEarned + loginCoins,
        });

        return { coins: loginCoins, isNewLogin: true };
      },
    }),
    {
      name: 'math-genius-pet-store',
    }
  )
);
