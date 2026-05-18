'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Trophy,
  Star,
  Zap,
  Flame,
  Target,
  Crown,
  Medal,
  ChevronRight,
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { useLeaderboardStore, type LeaderboardEntry, type LeaderboardPeriod, type LeaderboardCategory } from '@/lib/leaderboard-store';
import { playClickSound } from '@/lib/sound';
import BottomNav from './BottomNav';

// ─── Config ────────────────────────────────────────────────────────────────

const PERIOD_TABS: { key: LeaderboardPeriod; label: string; emoji: string }[] = [
  { key: 'daily', label: '今日', emoji: '📅' },
  { key: 'weekly', label: '本周', emoji: '📊' },
  { key: 'alltime', label: '总榜', emoji: '🏆' },
];

const CATEGORY_TABS: { key: LeaderboardCategory; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'xp', label: '经验', icon: <Zap className="w-3.5 h-3.5" />, color: 'text-orange-500' },
  { key: 'stars', label: '星星', icon: <Star className="w-3.5 h-3.5" />, color: 'text-amber-500' },
  { key: 'streak', label: '连续', icon: <Flame className="w-3.5 h-3.5" />, color: 'text-rose-500' },
  { key: 'accuracy', label: '正确率', icon: <Target className="w-3.5 h-3.5" />, color: 'text-emerald-500' },
];

const SUBJECT_EMOJIS: Record<string, string> = {
  math: '🧮',
  chinese: '📖',
  english: '🔤',
  all: '🌟',
};

const RANK_STYLES: Record<number, { bg: string; border: string; icon: React.ReactNode; text: string }> = {
  1: { bg: 'bg-gradient-to-r from-amber-50 to-yellow-50', border: 'border-amber-300', icon: <Crown className="w-5 h-5 text-amber-500" />, text: 'text-amber-700' },
  2: { bg: 'bg-gradient-to-r from-gray-50 to-slate-50', border: 'border-gray-300', icon: <Medal className="w-5 h-5 text-gray-500" />, text: 'text-gray-700' },
  3: { bg: 'bg-gradient-to-r from-orange-50 to-amber-50', border: 'border-orange-300', icon: <Medal className="w-5 h-5 text-orange-500" />, text: 'text-orange-700' },
};

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const setCurrentView = useGameStore((s) => s.setCurrentView);
  const totalXP = useGameStore((s) => s.totalXP);
  const totalStars = useGameStore((s) => s.totalStars);
  const streak = useGameStore((s) => s.streak);
  const playerLevel = useGameStore((s) => s.playerLevel);
  const practiceHistory = useGameStore((s) => s.practiceHistory);

  const period = useLeaderboardStore((s) => s.period);
  const category = useLeaderboardStore((s) => s.category);
  const setPeriod = useLeaderboardStore((s) => s.setPeriod);
  const setCategory = useLeaderboardStore((s) => s.setCategory);
  const getLeaderboard = useLeaderboardStore((s) => s.getLeaderboard);

  // Calculate player accuracy
  const playerAccuracy = useMemo(() => {
    if (practiceHistory.length === 0) return 0;
    const totalQ = practiceHistory.reduce((sum, r) => sum + r.total, 0);
    const totalCorrect = practiceHistory.reduce((sum, r) => sum + r.correct, 0);
    return totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;
  }, [practiceHistory]);

  const playerSessions = practiceHistory.length;

  const leaderboard = useMemo(
    () => getLeaderboard(totalXP, totalStars, streak, playerLevel, playerAccuracy, playerSessions),
    [getLeaderboard, totalXP, totalStars, streak, playerLevel, playerAccuracy, playerSessions, period, category]
  );

  const myRank = useMemo(
    () => leaderboard.findIndex((e) => e.id === 'current-player') + 1,
    [leaderboard]
  );

  const myEntry = useMemo(
    () => leaderboard.find((e) => e.id === 'current-player'),
    [leaderboard]
  );

  const getCategoryValue = (entry: LeaderboardEntry) => {
    switch (category) {
      case 'xp': return entry.totalXP;
      case 'stars': return entry.totalStars;
      case 'streak': return entry.streak;
      case 'accuracy': return entry.accuracy;
    }
  };

  const getCategoryLabel = (entry: LeaderboardEntry) => {
    switch (category) {
      case 'xp': return `${entry.totalXP} XP`;
      case 'stars': return `${entry.totalStars} ⭐`;
      case 'streak': return `${entry.streak} 天`;
      case 'accuracy': return `${entry.accuracy}%`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/20 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 pb-5 text-white relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px, 60px 60px',
        }} />
        <div className="max-w-md mx-auto relative">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => { playClickSound(); setCurrentView('home'); }}
              className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
            <Badge className="bg-white/20 text-white border-none text-xs">
              我的排名: 第{myRank}名
            </Badge>
          </div>
          <h1 className="text-2xl font-bold">🏆 排行榜</h1>
          <p className="text-white/70 text-xs mt-0.5">和小伙伴们比拼学习成果</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pb-24">
        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="-mt-3 mb-5"
          >
            <Card className="overflow-hidden border-0 shadow-lg py-0">
              <CardContent className="bg-gradient-to-r from-amber-100 via-yellow-50 to-orange-100 p-5">
                <div className="flex items-end justify-center gap-3">
                  {/* 2nd place */}
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-xl shadow-sm mb-1">
                      {leaderboard[1].avatar}
                    </div>
                    <p className="text-xs font-bold text-gray-700 max-w-[60px] truncate">{leaderboard[1].name}</p>
                    <p className="text-[10px] text-gray-500">{getCategoryLabel(leaderboard[1])}</p>
                    <div className="mt-1 w-16 h-14 bg-gradient-to-t from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                      <Medal className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* 1st place */}
                  <div className="flex flex-col items-center -mt-3">
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Crown className="w-6 h-6 text-amber-500 mb-0.5" />
                    </motion.div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-yellow-300 text-2xl shadow-lg ring-2 ring-amber-300 mb-1">
                      {leaderboard[0].avatar}
                    </div>
                    <p className="text-xs font-bold text-amber-700 max-w-[60px] truncate">{leaderboard[0].name}</p>
                    <p className="text-[10px] text-amber-600">{getCategoryLabel(leaderboard[0])}</p>
                    <div className="mt-1 w-16 h-20 bg-gradient-to-t from-amber-100 to-amber-200 rounded-t-lg flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-amber-500" />
                    </div>
                  </div>

                  {/* 3rd place */}
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-200 to-amber-200 text-xl shadow-sm mb-1">
                      {leaderboard[2].avatar}
                    </div>
                    <p className="text-xs font-bold text-gray-700 max-w-[60px] truncate">{leaderboard[2].name}</p>
                    <p className="text-[10px] text-gray-500">{getCategoryLabel(leaderboard[2])}</p>
                    <div className="mt-1 w-16 h-10 bg-gradient-to-t from-orange-100 to-orange-200 rounded-t-lg flex items-center justify-center">
                      <Medal className="w-5 h-5 text-orange-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Period Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-3"
        >
          <div className="flex gap-1.5">
            {PERIOD_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setPeriod(tab.key); playClickSound(); }}
                className={`flex-1 flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-bold transition-all active:scale-95 ${
                  period === tab.key
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-100 shadow-sm hover:border-amber-200'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <div className="flex gap-1.5">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setCategory(tab.key); playClickSound(); }}
                className={`flex-1 flex items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-medium transition-all active:scale-95 ${
                  category === tab.key
                    ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm'
                    : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* My Card (sticky) */}
        {myEntry && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mb-4 sticky top-0 z-10"
          >
            <Card className="overflow-hidden border-0 shadow-md py-0 ring-2 ring-amber-300/50">
              <CardContent className="bg-gradient-to-r from-amber-50 to-orange-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 text-sm font-black text-amber-600">
                    #{myRank}
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-orange-300 text-lg shadow-sm">
                    {myEntry.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-gray-800">我</p>
                      <Badge className="bg-amber-100 text-amber-700 border-0 text-[9px] px-1.5 py-0">
                        Lv.{playerLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-500">
                        {SUBJECT_EMOJIS[myEntry.bestSubject]} {getCategoryLabel(myEntry)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Leaderboard List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {leaderboard.map((entry, index) => {
            const rank = index + 1;
            const isMe = entry.id === 'current-player';
            const rankStyle = RANK_STYLES[rank];

            return (
              <motion.div key={entry.id} variants={itemVariants}>
                <Card className={`overflow-hidden border-0 py-0 transition-all ${
                  isMe ? 'ring-2 ring-amber-300/30' : ''
                }`}>
                  <CardContent className={`p-3 ${
                    rankStyle ? rankStyle.bg : isMe ? 'bg-amber-50/50' : 'bg-white'
                  }`}>
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-8">
                        {rank <= 3 ? (
                          rankStyle!.icon
                        ) : (
                          <span className="text-sm font-bold text-gray-400">{rank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg shadow-sm ${
                        rank === 1 ? 'bg-gradient-to-br from-amber-200 to-yellow-300 ring-2 ring-amber-300' :
                        rank === 2 ? 'bg-gradient-to-br from-gray-200 to-gray-300' :
                        rank === 3 ? 'bg-gradient-to-br from-orange-200 to-amber-200' :
                        'bg-gray-100'
                      }`}>
                        {entry.avatar}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-sm font-bold truncate ${isMe ? 'text-amber-700' : 'text-gray-800'}`}>
                            {isMe ? '我' : entry.name}
                          </p>
                          {isMe && (
                            <Badge className="bg-amber-200 text-amber-800 border-0 text-[8px] px-1 py-0">
                              你
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-gray-400">
                            {entry.rankEmoji} {entry.rankTitle}
                          </span>
                          <span className="text-[9px] text-gray-300">·</span>
                          <span className="text-[9px] text-gray-400">
                            Lv.{entry.level}
                          </span>
                          <span className="text-[9px] text-gray-300">·</span>
                          <span className="text-[9px] text-gray-400">
                            {SUBJECT_EMOJIS[entry.bestSubject]}
                          </span>
                        </div>
                      </div>

                      {/* Value */}
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-bold ${
                          category === 'xp' ? 'text-orange-600' :
                          category === 'stars' ? 'text-amber-600' :
                          category === 'streak' ? 'text-rose-600' :
                          'text-emerald-600'
                        }`}>
                          {getCategoryLabel(entry)}
                        </p>
                        <p className="text-[9px] text-gray-400">
                          {entry.sessions}次练习
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-5"
        >
          <Card className="overflow-hidden border-0 shadow-sm py-0">
            <CardContent className="bg-gradient-to-r from-sky-50 to-cyan-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💡</span>
                <p className="text-xs font-bold text-sky-700">如何提升排名？</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] text-sky-600 leading-relaxed">
                  🎯 每天坚持练习，积累更多经验和星星
                </p>
                <p className="text-[11px] text-sky-600 leading-relaxed">
                  ⚡ 尝试限时挑战，正确率越高排名越靠前
                </p>
                <p className="text-[11px] text-sky-600 leading-relaxed">
                  🔥 保持连续学习，连续天数也是排名指标
                </p>
                <p className="text-[11px] text-sky-600 leading-relaxed">
                  🏆 完成每日挑战和闯关模式获得额外奖励
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
