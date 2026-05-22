'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Lock, Unlock, ArrowLeft, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { playClickSound } from '@/lib/sound';
import { getCurrentRank, getNextRank, getUnlockedBonusTitles } from '@/lib/rank-system';
import BottomNav from './BottomNav';

// ─── Achievement Category Definitions ────────────────────────────────────────

interface AchievementCategory {
  id: string;
  name: string;
  emoji: string;
  filter: (id: string) => boolean;
}

const CATEGORIES: AchievementCategory[] = [
  { id: 'all', name: '全部', emoji: '🏅', filter: () => true },
  { id: 'practice', name: '练习', emoji: '✏️', filter: (id) => id.startsWith('practice-') || id === 'first-practice' },
  { id: 'stars', name: '星星', emoji: '⭐', filter: (id) => id.startsWith('stars-') },
  { id: 'perfect', name: '满分', emoji: '🎯', filter: (id) => id.startsWith('perfect-') },
  { id: 'streak', name: '连续', emoji: '🔥', filter: (id) => id.startsWith('streak-') },
  { id: 'combo', name: '连击', emoji: '⚡', filter: (id) => id.startsWith('combo-') },
  { id: 'xp', name: '经验', emoji: '📈', filter: (id) => id.startsWith('xp-') },
  { id: 'adventure', name: '闯关', emoji: '🏰', filter: (id) => id.includes('adventure') },
  { id: 'speed', name: '速度', emoji: '🚀', filter: (id) => id.startsWith('speed-') },
  { id: 'pet', name: '宠物', emoji: '🐾', filter: (id) => id.startsWith('pet-') },
  { id: 'multi', name: '全科', emoji: '🎓', filter: (id) => id.startsWith('all-subject') },
];

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

// ─── Component ─────────────────────────────────────────────────────────────

export default function AchievementsPage() {
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const playerLevel = useGameStore((s) => s.playerLevel);
  const totalStars = useGameStore((s) => s.totalStars);
  const streak = useGameStore((s) => s.streak);
  const setCurrentView = useGameStore((s) => s.setCurrentView);
  const [activeCategory, setActiveCategory] = useState('all');

  const currentRank = getCurrentRank(playerLevel);
  const nextRank = getNextRank(playerLevel);
  const bonusTitles = getUnlockedBonusTitles(unlockedAchievements, totalStars, streak);

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Get the active filter
  const activeFilter = CATEGORIES.find((c) => c.id === activeCategory)?.filter ?? (() => true);

  // Filtered and sorted achievements
  const filteredAchievements = useMemo(() => {
    return [...ACHIEVEMENTS]
      .filter((a) => activeFilter(a.id))
      .sort((a, b) => {
        const aUnlocked = unlockedAchievements.includes(a.id);
        const bUnlocked = unlockedAchievements.includes(b.id);
        if (aUnlocked && !bUnlocked) return -1;
        if (!aUnlocked && bUnlocked) return 1;
        return 0;
      });
  }, [unlockedAchievements, activeFilter]);

  // Category-specific counts
  const categoryStats = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const catAchievements = ACHIEVEMENTS.filter((a) => cat.filter(a.id));
      const catUnlocked = catAchievements.filter((a) => unlockedAchievements.includes(a.id)).length;
      return { id: cat.id, total: catAchievements.length, unlocked: catUnlocked };
    });
  }, [unlockedAchievements]);

  // Recently unlocked (last 3)
  const recentlyUnlocked = useMemo(() => {
    return unlockedAchievements
      .slice(-3)
      .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
      .filter(Boolean);
  }, [unlockedAchievements]);

  // Filtered counts
  const filteredUnlocked = filteredAchievements.filter((a) => unlockedAchievements.includes(a.id)).length;
  const filteredTotal = filteredAchievements.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-purple-50/30 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-4 pt-3 pb-5 text-white safe-top">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => { playClickSound(); setCurrentView('home'); }}
              className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors active:scale-95 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
            <span className="text-sm font-medium text-white/80">
              {unlockedCount} / {totalCount}
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-1">🏅 成就殿堂</h1>
          <p className="text-white/70 text-xs">完成挑战，收集所有成就！</p>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pb-28">
        {/* Progress Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="-mt-3 mb-5"
        >
          <Card className="overflow-hidden border-0 shadow-lg py-0">
            <CardContent className="bg-gradient-to-r from-violet-500 to-purple-600 p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span className="font-bold text-sm">收集进度</span>
                </div>
                <span className="text-xs font-medium text-white/80">
                  {progressPercent}% 完成
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2.5 w-full rounded-full bg-white/20">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-300"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-white/60">
                  {unlockedCount > 0 ? `已解锁 ${unlockedCount} 个成就` : '开始练习即可解锁成就'}
                </span>
                {unlockedCount > 0 && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-sm"
                  >
                    ✨
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rank & Title Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-5"
        >
          <Card className="overflow-hidden border-0 shadow-sm py-0">
            <CardContent className="bg-gradient-to-r from-amber-50 to-orange-50 p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${currentRank.bg} shadow-sm`}>
                  <span className="text-2xl">{currentRank.emoji}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${currentRank.color}`}>{currentRank.name}</span>
                    <span className="text-[10px] text-gray-400">Lv.{playerLevel}</span>
                  </div>
                  <p className="text-[10px] text-gray-500">{currentRank.description}</p>
                  {nextRank && (
                    <p className="text-[9px] text-gray-400 mt-0.5">
                      下一称号: {nextRank.emoji} {nextRank.name} (Lv.{nextRank.minLevel})
                    </p>
                  )}
                </div>
              </div>
              {bonusTitles.length > 0 && (
                <div className="flex gap-1 flex-wrap mt-3 pt-3 border-t border-amber-100/60">
                  {bonusTitles.map(t => (
                    <span key={t.id} className="inline-flex items-center gap-0.5 rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-medium text-amber-600 shadow-sm">
                      {t.emoji} {t.name}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recently Unlocked Section */}
        {recentlyUnlocked.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-5"
          >
            <h3 className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
              <Sparkles className="size-3 text-amber-400" />
              最近解锁
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {recentlyUnlocked.map((achievement) => (
                <motion.div
                  key={achievement!.id}
                  whileTap={{ scale: 0.95 }}
                  className="flex-shrink-0 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-3 border border-amber-200/60 shadow-sm min-w-[110px]"
                >
                  <span className="text-2xl block text-center mb-1">{achievement!.emoji}</span>
                  <p className="text-[10px] font-bold text-gray-700 text-center truncate">{achievement!.name}</p>
                  <p className="text-[8px] text-gray-400 text-center truncate">{achievement!.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Category Filter Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mb-4"
        >
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const stats = categoryStats.find((s) => s.id === cat.id);
              const isActive = activeCategory === cat.id;
              const isComplete = stats && stats.unlocked === stats.total && stats.total > 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); playClickSound(); }}
                  className={`flex-shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-medium transition-all active:scale-95 ${
                    isActive
                      ? 'bg-violet-500 text-white shadow-sm shadow-violet-200/50'
                      : 'bg-white text-gray-600 border border-gray-100 shadow-sm hover:bg-violet-50 hover:border-violet-200'
                  }`}
                >
                  <span className="text-xs">{isComplete ? '✅' : cat.emoji}</span>
                  <span>{cat.name}</span>
                  <span className={isActive ? 'text-white/70' : 'text-gray-300'}>
                    {stats?.unlocked ?? 0}/{stats?.total ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Filtered Results Header */}
        {activeCategory !== 'all' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-3 flex items-center justify-between"
          >
            <p className="text-[11px] text-gray-400">
              {CATEGORIES.find((c) => c.id === activeCategory)?.emoji}{' '}
              {CATEGORIES.find((c) => c.id === activeCategory)?.name} · {filteredUnlocked}/{filteredTotal} 已解锁
            </p>
            <button
              onClick={() => { setActiveCategory('all'); playClickSound(); }}
              className="text-[10px] text-violet-500 hover:text-violet-700 font-medium"
            >
              查看全部
            </button>
          </motion.div>
        )}

        {/* Achievement List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {filteredAchievements.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <span className="text-3xl block mb-2">📭</span>
                <p className="text-sm text-gray-400">该分类暂无成就</p>
              </motion.div>
            ) : (
              filteredAchievements.map((achievement) => {
                const isUnlocked = unlockedAchievements.includes(achievement.id);

                return (
                  <motion.div
                    key={achievement.id}
                    variants={itemVariants}
                    layout
                  >
                    <Card
                      className={`overflow-hidden border-0 py-0 transition-all ${
                        isUnlocked
                          ? 'shadow-sm hover:shadow-md'
                          : 'opacity-50'
                      }`}
                    >
                      <CardContent
                        className={`p-3 ${
                          isUnlocked
                            ? 'bg-white'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Emoji */}
                          <div
                            className={`flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl text-xl ${
                              isUnlocked
                                ? 'bg-gradient-to-br from-amber-100 to-orange-100'
                                : 'bg-gray-200'
                            }`}
                          >
                            {isUnlocked ? (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  type: 'spring',
                                  stiffness: 400,
                                  damping: 15,
                                }}
                              >
                                {achievement.emoji}
                              </motion.span>
                            ) : (
                              <Lock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p
                                className={`font-bold text-xs ${
                                  isUnlocked
                                    ? 'text-gray-800'
                                    : 'text-gray-500'
                                }`}
                              >
                                {achievement.name}
                              </p>
                              {isUnlocked && (
                                <Badge className="bg-emerald-50 text-emerald-600 text-[8px] px-1 py-0 border-0 h-4">
                                  <CheckCircle2 className="h-2 w-2 mr-0.5" />
                                  已解锁
                                </Badge>
                              )}
                            </div>
                            <p className="text-[10px] mt-0.5 text-gray-400">
                              {achievement.description}
                            </p>
                          </div>

                          {/* Status indicator */}
                          <div className="flex-shrink-0">
                            {isUnlocked ? (
                              <motion.div
                                animate={{ scale: [1, 1.15, 1] }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                }}
                                className="text-sm"
                              >
                                ✨
                              </motion.div>
                            ) : (
                              <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer message */}
        {unlockedCount === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <span className="text-4xl block mb-2">🌟</span>
            <p className="text-sm text-gray-400">开始你的第一次练习吧！</p>
            <p className="text-xs text-gray-300 mt-1">完成练习即可解锁第一个成就</p>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
