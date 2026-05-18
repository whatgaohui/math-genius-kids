// Rank/Title system for 知识小勇士 (Knowledge Little Warrior)

// Rank definitions based on total XP/level
export interface Rank {
  id: string;
  name: string;
  emoji: string;
  minLevel: number;
  description: string;
  color: string; // tailwind color class
  bg: string; // tailwind bg class
}

export const RANKS: Rank[] = [
  { id: 'novice', name: '初学者', emoji: '🌱', minLevel: 1, description: '刚开始学习之旅', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'learner', name: '小学徒', emoji: '📝', minLevel: 3, description: '逐渐掌握基础', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { id: 'explorer', name: '探险家', emoji: '🗺️', minLevel: 5, description: '勇敢探索新知识', color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'scholar', name: '小学者', emoji: '📚', minLevel: 8, description: '知识面不断扩展', color: 'text-violet-600', bg: 'bg-violet-50' },
  { id: 'knight', name: '知识骑士', emoji: '⚔️', minLevel: 12, description: '用知识武装自己', color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'master', name: '小大师', emoji: '🎓', minLevel: 16, description: '精通多门学科', color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'sage', name: '智慧贤者', emoji: '🧙', minLevel: 20, description: '学识渊博', color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'legend', name: '传奇勇士', emoji: '👑', minLevel: 25, description: '传说中的知识勇士', color: 'text-yellow-600', bg: 'bg-yellow-50' },
];

export function getCurrentRank(playerLevel: number): Rank {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (playerLevel >= rank.minLevel) {
      current = rank;
    }
  }
  return current;
}

export function getNextRank(playerLevel: number): Rank | null {
  for (const rank of RANKS) {
    if (rank.minLevel > playerLevel) {
      return rank;
    }
  }
  return null;
}

// Achievement-based bonus titles
export interface BonusTitle {
  id: string;
  name: string;
  emoji: string;
  condition: string;
  description: string;
  check: (unlockedAchievements: string[], totalStars: number, streak: number) => boolean;
}

export const BONUS_TITLES: BonusTitle[] = [
  { id: 'streak-7', name: '坚持不懈', emoji: '🔥', condition: '连续学习7天', description: '坚持就是胜利', check: (_, __, streak) => streak >= 7 },
  { id: 'stars-50', name: '星星收集者', emoji: '⭐', condition: '累计50颗星星', description: '闪闪发光', check: (_, stars) => stars >= 50 },
  { id: 'stars-100', name: '星光璀璨', emoji: '🌟', condition: '累计100颗星星', description: '星光闪耀', check: (_, stars) => stars >= 100 },
  { id: 'first-perfect', name: '完美主义', emoji: '💯', condition: '获得一次满分', description: '追求完美', check: (achievements) => achievements.some(a => a.startsWith('perfect-')) },
  { id: 'all-subject', name: '全面发展', emoji: '🎓', condition: '三科都练习过', description: '文理兼修', check: (achievements) => achievements.some(a => a.startsWith('all-subject')) },
  { id: 'speed-master', name: '闪电侠', emoji: '⚡', condition: '速度挑战达人', description: '快如闪电', check: (achievements) => achievements.some(a => a.startsWith('speed-')) },
  { id: 'combo-king', name: '连击之王', emoji: '🔥', condition: '超高连击', description: '势不可挡', check: (achievements) => achievements.some(a => a.startsWith('combo-')) },
];

export function getUnlockedBonusTitles(unlockedAchievements: string[], totalStars: number, streak: number): BonusTitle[] {
  return BONUS_TITLES.filter(t => t.check(unlockedAchievements, totalStars, streak));
}
