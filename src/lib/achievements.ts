// Achievement definitions for 学习小达人 (Learning Genius)

export interface Achievement {
  id: string;
  emoji: string;
  name: string;
  description: string;
  /** Function to check if the achievement should be unlocked */
  check: (context: AchievementContext) => boolean;
}

export interface AchievementContext {
  totalStars: number;
  totalXP: number;
  streak: number;
  practiceHistory: PracticeRecordSummary[];
  unlockedAchievements: string[];
  petLevel: number;
  maxCombo: number;
  adventureMaxFloor: number;
  chineseAdventureMaxFloor: number;
  englishAdventureMaxFloor: number;
}

export interface PracticeRecordSummary {
  correct: number;
  total: number;
  stars: number;
  mode: string;
  subject: string;
}

// ─── Achievement Definitions ────────────────────────────────────────────────

export const ACHIEVEMENTS: Achievement[] = [
  // ── Practice Milestones ──
  {
    id: 'first-practice',
    emoji: '🌟',
    name: '初露锋芒',
    description: '完成第一次练习',
    check: (ctx) => ctx.practiceHistory.length >= 1,
  },
  {
    id: 'practice-10',
    emoji: '🔥',
    name: '勤学苦练',
    description: '累计完成10次练习',
    check: (ctx) => ctx.practiceHistory.length >= 10,
  },
  {
    id: 'practice-50',
    emoji: '💎',
    name: '学海无涯',
    description: '累计完成50次练习',
    check: (ctx) => ctx.practiceHistory.length >= 50,
  },
  {
    id: 'practice-100',
    emoji: '👑',
    name: '百战百胜',
    description: '累计完成100次练习',
    check: (ctx) => ctx.practiceHistory.length >= 100,
  },

  // ── Star Milestones ──
  {
    id: 'stars-10',
    emoji: '⭐',
    name: '十星闪耀',
    description: '累计获得10颗星星',
    check: (ctx) => ctx.totalStars >= 10,
  },
  {
    id: 'stars-50',
    emoji: '🌠',
    name: '星光灿烂',
    description: '累计获得50颗星星',
    check: (ctx) => ctx.totalStars >= 50,
  },
  {
    id: 'stars-200',
    emoji: '🌌',
    name: '银河卫士',
    description: '累计获得200颗星星',
    check: (ctx) => ctx.totalStars >= 200,
  },

  // ── Perfect Scores ──
  {
    id: 'perfect-score',
    emoji: '🎯',
    name: '一鸣惊人',
    description: '获得一次满分（全部答对）',
    check: (ctx) => ctx.practiceHistory.some((r) => r.correct === r.total && r.total > 0),
  },
  {
    id: 'perfect-5',
    emoji: '🏅',
    name: '五连满分',
    description: '获得5次满分',
    check: (ctx) =>
      ctx.practiceHistory.filter((r) => r.correct === r.total && r.total > 0).length >= 5,
  },

  // ── Streak ──
  {
    id: 'streak-3',
    emoji: '📅',
    name: '三天坚持',
    description: '连续练习3天',
    check: (ctx) => ctx.streak >= 3,
  },
  {
    id: 'streak-7',
    emoji: '🔥',
    name: '一周达人',
    description: '连续练习7天',
    check: (ctx) => ctx.streak >= 7,
  },
  {
    id: 'streak-30',
    emoji: '🏆',
    name: '月度冠军',
    description: '连续练习30天',
    check: (ctx) => ctx.streak >= 30,
  },

  // ── Combo ──
  {
    id: 'combo-5',
    emoji: '⚡',
    name: '五连击',
    description: '单次练习中连续答对5题',
    check: (ctx) => ctx.maxCombo >= 5,
  },
  {
    id: 'combo-10',
    emoji: '💥',
    name: '十连击',
    description: '单次练习中连续答对10题',
    check: (ctx) => ctx.maxCombo >= 10,
  },

  // ── XP Milestones ──
  {
    id: 'xp-500',
    emoji: '📈',
    name: '经验新手',
    description: '累计获得500经验值',
    check: (ctx) => ctx.totalXP >= 500,
  },
  {
    id: 'xp-2000',
    emoji: '🚀',
    name: '经验达人',
    description: '累计获得2000经验值',
    check: (ctx) => ctx.totalXP >= 2000,
  },
  {
    id: 'xp-10000',
    emoji: '🌈',
    name: '经验大师',
    description: '累计获得10000经验值',
    check: (ctx) => ctx.totalXP >= 10000,
  },

  // ── Pet ──
  {
    id: 'pet-level-5',
    emoji: '🐾',
    name: '宠物伙伴',
    description: '宠物达到5级',
    check: (ctx) => ctx.petLevel >= 5,
  },

  // ── Speed Challenge Achievements ──
  {
    id: 'speed-first',
    emoji: '⚡',
    name: '速度新星',
    description: '完成第一次限时挑战',
    check: (ctx) => ctx.practiceHistory.some(r => r.mode === 'speed'),
  },
  {
    id: 'speed-10',
    emoji: '🚀',
    name: '速度达人',
    description: '累计完成10次限时挑战',
    check: (ctx) => ctx.practiceHistory.filter(r => r.mode === 'speed').length >= 10,
  },
  {
    id: 'speed-perfect',
    emoji: '💨',
    name: '闪电满分',
    description: '限时挑战中获得满分',
    check: (ctx) => ctx.practiceHistory.some(r => r.mode === 'speed' && r.correct === r.total && r.total >= 5),
  },

  // ── Adventure Achievements - Math ──
  {
    id: 'math-adventure-10',
    emoji: '🏰',
    name: '数学探险家',
    description: '数学闯关到达第10层',
    check: (ctx) => ctx.adventureMaxFloor >= 10,
  },
  {
    id: 'math-adventure-50',
    emoji: '🐉',
    name: '数学屠龙者',
    description: '数学闯关到达第50层',
    check: (ctx) => ctx.adventureMaxFloor >= 50,
  },
  {
    id: 'math-adventure-100',
    emoji: '👑',
    name: '数学传奇',
    description: '数学闯关到达第100层',
    check: (ctx) => ctx.adventureMaxFloor >= 100,
  },
  {
    id: 'math-adventure-150',
    emoji: '🌟',
    name: '数学之神',
    description: '数学通关全部150层',
    check: (ctx) => ctx.adventureMaxFloor >= 150,
  },

  // ── Adventure Achievements - Chinese ──
  {
    id: 'chinese-adventure-10',
    emoji: '📖',
    name: '语文探险家',
    description: '语文闯关到达第10层',
    check: (ctx) => ctx.chineseAdventureMaxFloor >= 10,
  },
  {
    id: 'chinese-adventure-25',
    emoji: '📜',
    name: '语文诗人',
    description: '语文闯关到达第25层',
    check: (ctx) => ctx.chineseAdventureMaxFloor >= 25,
  },
  {
    id: 'chinese-adventure-50',
    emoji: '🐉',
    name: '语文大师',
    description: '语文闯关到达第50层',
    check: (ctx) => ctx.chineseAdventureMaxFloor >= 50,
  },
  {
    id: 'chinese-adventure-100',
    emoji: '👑',
    name: '语文传奇',
    description: '语文闯关到达第100层',
    check: (ctx) => ctx.chineseAdventureMaxFloor >= 100,
  },

  // ── Adventure Achievements - English ──
  {
    id: 'english-adventure-10',
    emoji: '🔤',
    name: '英语探险家',
    description: '英语闯关到达第10层',
    check: (ctx) => ctx.englishAdventureMaxFloor >= 10,
  },
  {
    id: 'english-adventure-25',
    emoji: '🌍',
    name: '英语旅行家',
    description: '英语闯关到达第25层',
    check: (ctx) => ctx.englishAdventureMaxFloor >= 25,
  },
  {
    id: 'english-adventure-50',
    emoji: '🐉',
    name: '英语大师',
    description: '英语闯关到达第50层',
    check: (ctx) => ctx.englishAdventureMaxFloor >= 50,
  },
  {
    id: 'english-adventure-100',
    emoji: '👑',
    name: '英语传奇',
    description: '英语闯关到达第100层',
    check: (ctx) => ctx.englishAdventureMaxFloor >= 100,
  },

  // ── Multi-subject Achievements ──
  {
    id: 'all-subject-10',
    emoji: '🎓',
    name: '全科达人',
    description: '三科闯关都到达第10层',
    check: (ctx) => ctx.adventureMaxFloor >= 10 && ctx.chineseAdventureMaxFloor >= 10 && ctx.englishAdventureMaxFloor >= 10,
  },
  {
    id: 'all-subject-50',
    emoji: '🏆',
    name: '全科大师',
    description: '三科闯关都到达第50层',
    check: (ctx) => ctx.adventureMaxFloor >= 50 && ctx.chineseAdventureMaxFloor >= 50 && ctx.englishAdventureMaxFloor >= 50,
  },
];

// ─── Achievement Checker ────────────────────────────────────────────────────

/**
 * Computes which achievements should be unlocked based on the current context.
 * Returns an array of achievement IDs that are newly unlocked.
 */
export function computeUnlockedAchievements(context: AchievementContext): string[] {
  const newlyUnlocked: string[] = [];

  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (context.unlockedAchievements.includes(achievement.id)) {
      continue;
    }
    // Check if should be unlocked
    if (achievement.check(context)) {
      newlyUnlocked.push(achievement.id);
    }
  }

  return newlyUnlocked;
}

/**
 * Get the full achievement object by ID.
 */
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
