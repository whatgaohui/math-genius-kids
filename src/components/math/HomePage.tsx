'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, Flame, ChevronRight, Trophy, Coins, X, BookOpen, Target, BarChart3, Sparkles, ArrowRight, Clock, TrendingUp, BookOpenCheck, PawPrint, Award, ListChecks, FileBarChart } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { useOnboardingStore } from '@/lib/onboarding-store';
import { usePetStore, PET_CONFIGS, getPetEmoji } from '@/lib/pet-store';
import { getXPForNextLevel } from '@/lib/math-utils';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { playClickSound } from '@/lib/sound';
import { getCurrentRank, getNextRank, getUnlockedBonusTitles } from '@/lib/rank-system';
import { useLearningGoalsStore } from '@/lib/learning-goals';
import { getPendingReviews } from '@/lib/error-book';
import BottomNav from './BottomNav';

// ─── Animations ─────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

// ─── Component ─────────────────────────────────────────────────────────────

export default function HomePage() {
  const playerName = useGameStore((s) => s.playerName);
  const playerAvatar = useGameStore((s) => s.playerAvatar);
  const playerLevel = useGameStore((s) => s.playerLevel);
  const totalXP = useGameStore((s) => s.totalXP);
  const totalStars = useGameStore((s) => s.totalStars);
  const streak = useGameStore((s) => s.streak);
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const dailyChallengeCompletedDates = useGameStore((s) => s.dailyChallengeCompletedDates);
  const practiceHistory = useGameStore((s) => s.practiceHistory);
  const setCurrentView = useGameStore((s) => s.setCurrentView);
  const setCurrentSubject = useGameStore((s) => s.setCurrentSubject);

  const petType = usePetStore((s) => s.petType);
  const petLevel = usePetStore((s) => s.petLevel);
  const petName = usePetStore((s) => s.petName);
  const coins = usePetStore((s) => s.coins);
  const loginStreak = usePetStore((s) => s.loginStreak);
  const checkAndClaimLoginReward = usePetStore((s) => s.checkAndClaimLoginReward);

  const [loginReward, setLoginReward] = useState<{ coins: number; isNewLogin: boolean } | null>(null);

  const goals = useLearningGoalsStore((s) => s.goals);
  const getGoalProgress = useLearningGoalsStore((s) => s.getGoalProgress);

  const petConfig = petType ? PET_CONFIGS.find((p) => p.id === petType) ?? null : null;
  const displayName = playerName || '小朋友';
  const xpInfo = getXPForNextLevel(totalXP);
  const xpPercent = Math.round(xpInfo.progress * 100);
  const currentRank = getCurrentRank(playerLevel);
  const nextRank = getNextRank(playerLevel);
  const bonusTitles = getUnlockedBonusTitles(unlockedAchievements, totalStars, streak);

  const achievementCount = unlockedAchievements.length;
  const achievementTotal = ACHIEVEMENTS.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayPracticeCount = useMemo(() => practiceHistory.filter(r => r.date === todayStr).length, [practiceHistory, todayStr]);
  const dailyCompleted = dailyChallengeCompletedDates.includes(todayStr);
  const pendingErrors = useMemo(() => getPendingReviews().length, []);

  const goalPercent = useMemo(() => {
    const activeDailyGoals = goals.filter(g => g.isActive && g.type === 'daily');
    if (activeDailyGoals.length === 0) return 0;
    const totalPercent = activeDailyGoals.reduce((sum, g) => sum + getGoalProgress(g).percent, 0);
    return Math.round(totalPercent / activeDailyGoals.length);
  }, [goals, getGoalProgress]);

  const smartAccessData = useMemo(() => ({ pendingErrors, achievementCount, achievementTotal, dailyCompleted, goalPercent }),
    [pendingErrors, achievementCount, achievementTotal, dailyCompleted, goalPercent]);

  const hasCompletedOnboarding = useOnboardingStore((s) => s.hasCompletedOnboarding);

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      const timer = setTimeout(() => setCurrentView('onboarding'), 500);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding, setCurrentView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const result = checkAndClaimLoginReward();
      if (result.isNewLogin) setLoginReward(result);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loginReward?.isNewLogin) {
      const autoDismiss = setTimeout(() => setLoginReward(null), 6000);
      return () => clearTimeout(autoDismiss);
    }
  }, [loginReward]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了 🌙';
    if (hour < 12) return '早上好 ☀️';
    if (hour < 14) return '中午好 🌤';
    if (hour < 18) return '下午好 🌅';
    return '晚上好 🌆';
  };

  // ─── Subject data ───
  const subjects = [
    { key: 'math', emoji: '🧮', title: '数学', desc: '加减乘除', color: '#FF6B35', bg: '#FFF4EE', view: 'math-home' },
    { key: 'chinese', emoji: '📖', title: '语文', desc: '拼音汉字', color: '#E84393', bg: '#FFF0F6', view: 'chinese' },
    { key: 'english', emoji: '🔤', title: '英语', desc: 'ABC字母', color: '#00B894', bg: '#EFFEFA', view: 'english' },
  ] as const;

  // ─── Quick actions ───
  const quickActions = [
    { key: 'daily', icon: Clock, title: '每日挑战', view: 'daily-challenge', color: '#FF6B35', sub: dailyCompleted ? '已完成' : '去挑战' },
    { key: 'errors', icon: BookOpenCheck, title: '错题本', view: 'error-book', color: '#E17055', sub: pendingErrors > 0 ? `${pendingErrors}题` : '无错题' },
    { key: 'achieve', icon: Award, title: '成就', view: 'achievements', color: '#6C5CE7', sub: `${achievementCount}/${achievementTotal}` },
    { key: 'goals', icon: ListChecks, title: '学习目标', view: 'learning-goals', color: '#00CEC9', sub: goalPercent >= 100 ? '✓ 达成' : `${goalPercent}%` },
    { key: 'report', icon: FileBarChart, title: '家长报告', view: 'parent-dashboard', color: '#0984E3', sub: '查看' },
    { key: 'pet', icon: PawPrint, title: '宠物小屋', view: 'pet', color: '#FD79A8', sub: '成长' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      {/* ═══════════════════ HERO HEADER ═══════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb] pb-16 pt-6 px-4">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 w-20 h-20 rounded-full bg-white/5" />

        <div className="mx-auto max-w-md">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="relative z-10">
          {/* Top row: avatar + name + actions */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => { playClickSound(); setCurrentView('settings'); }}
                className="relative"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl ring-2 ring-white/30">
                  {playerAvatar}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#00E676] flex items-center justify-center text-[8px] font-black text-white ring-2 ring-[#764ba2]">
                  {playerLevel}
                </div>
              </motion.button>
              <div>
                <h1 className="text-white text-lg font-bold">{getGreeting()}</h1>
                <p className="text-white/60 text-xs font-medium">{displayName} · {currentRank.emoji} {currentRank.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/15 backdrop-blur-md rounded-full px-3 py-1.5">
                <Coins className="w-3.5 h-3.5 text-yellow-300" />
                <span className="text-white text-xs font-bold">{coins}</span>
              </div>
              <button
                onClick={() => { playClickSound(); setCurrentView('help'); }}
                className="flex items-center gap-1 bg-white/15 backdrop-blur-md rounded-full px-2.5 py-2 active:scale-95 transition-transform min-h-[44px]"
              >
                <BookOpen className="w-3 h-3 text-white/80" />
                <span className="text-white/80 text-[10px] font-semibold">攻略</span>
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Star, label: '星星', value: totalStars },
              { icon: Zap, label: '经验', value: totalXP },
              { icon: Flame, label: '连续', value: `${streak}天` },
              { icon: TrendingUp, label: '今日', value: `${todayPracticeCount}次` },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-md rounded-2xl py-2.5 px-2 text-center">
                <s.icon className="w-3.5 h-3.5 text-white/70 mx-auto mb-1" />
                <p className="text-white text-sm font-bold">{s.value}</p>
                <p className="text-white/50 text-[9px] font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
        </div>
      </div>

      {/* ═══════════════════ XP PROGRESS (overlapping card) ═══════════════════ */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="mx-auto max-w-md px-4 -mt-8 relative z-20 mb-4">
        <button
          onClick={() => { playClickSound(); setCurrentView('stats'); }}
          className="w-full bg-white rounded-2xl p-4 shadow-lg shadow-gray-200/50 text-left active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#667eea]" />
              <span className="text-xs font-bold text-gray-800">经验进度</span>
              <span className="text-[9px] text-[#667eea] bg-[#667eea]/10 rounded-md px-1.5 py-0.5 font-bold">Lv.{playerLevel}</span>
            </div>
            <div className="flex items-center gap-0.5 text-[10px] text-gray-400">
              详情 <ChevronRight className="w-3 h-3" />
            </div>
          </div>
          <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2]"
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-gray-400">
            <span>{xpInfo.currentLevelXP} / {xpInfo.nextLevelXP} XP</span>
            {nextRank && <span>下一: {nextRank.emoji} {nextRank.name}</span>}
          </div>
          {/* Goal mini progress */}
          {goalPercent > 0 && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
              <Target className="w-3 h-3 text-[#FF6B35]" />
              <span className="text-[10px] text-gray-500 flex-1">今日目标 {goalPercent >= 100 ? '🎉 达成！' : `${goalPercent}%`}</span>
              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[#FF6B35]"
                  initial={{ width: 0 }}
                  animate={{ width: `${goalPercent}%` }}
                />
              </div>
            </div>
          )}
        </button>
      </motion.div>

      {/* ═══════════════════ SUBJECTS ═══════════════════ */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="mx-auto max-w-md px-4 mb-4">
        <h2 className="text-sm font-bold text-gray-800 mb-3">学习科目</h2>
        <div className="grid grid-cols-3 gap-3">
          {subjects.map((sub, i) => (
            <motion.button
              key={sub.key}
              whileTap={{ scale: 0.93 }}
              onClick={() => { setCurrentSubject(sub.key); setCurrentView(sub.view); playClickSound(); }}
              className="relative overflow-hidden rounded-2xl p-4 text-center active:shadow-lg transition-shadow"
              style={{ backgroundColor: sub.bg, boxShadow: `0 2px 12px ${sub.color}15` }}
            >
              <motion.div
                className="text-3xl mb-2"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
              >
                {sub.emoji}
              </motion.div>
              <p className="text-sm font-bold" style={{ color: sub.color }}>{sub.title}</p>
              <p className="text-[9px] text-gray-400 mt-0.5 font-medium">{sub.desc}</p>
              {/* Corner decoration */}
              <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full" style={{ backgroundColor: `${sub.color}10` }} />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ═══════════════════ QUICK ACTIONS ═══════════════════ */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="mx-auto max-w-md px-4 mb-4">
        <h2 className="text-sm font-bold text-gray-800 mb-3">快捷入口</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const isActive = action.key === 'daily' && dailyCompleted || action.key === 'goals' && goalPercent >= 100;
            return (
              <motion.button
                key={action.key}
                whileTap={{ scale: 0.93 }}
                onClick={() => { playClickSound(); setCurrentView(action.view); }}
                className="bg-white rounded-2xl p-3 text-center shadow-sm hover:shadow-md transition-all relative group"
              >
                {isActive && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00E676]" />
                )}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${action.color}12` }}
                >
                  <Icon className="w-4.5 h-4.5" style={{ color: action.color }} />
                </div>
                <p className="text-[11px] font-bold text-gray-800">{action.title}</p>
                <p className="text-[9px] font-medium mt-0.5" style={{ color: action.color }}>{action.sub}</p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ═══════════════════ PET CARD ═══════════════════ */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="mx-auto max-w-md px-4 pb-28">
        {!petType ? (
          <button
            onClick={() => { playClickSound(); setCurrentView('pet'); }}
            className="w-full bg-white rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform text-left flex items-center gap-3 border-2 border-dashed border-[#FD79A8]/30"
          >
            <div className="w-12 h-12 rounded-xl bg-[#FFF0F6] flex items-center justify-center text-2xl">
              🐾
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">领养学习伙伴</p>
              <p className="text-[10px] text-gray-400">完成练习赚金币，养一只可爱宠物吧</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        ) : petConfig ? (
          <button
            onClick={() => { playClickSound(); setCurrentView('pet'); }}
            className="w-full bg-white rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform text-left flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl bg-[#FFF0F6] flex items-center justify-center text-2xl">
              <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                {getPetEmoji(petType, petLevel)}
              </motion.span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-gray-800">{petName || petConfig.name}</p>
                <span className="text-[9px] font-bold text-[#FD79A8] bg-[#FFF0F6] rounded-md px-1.5 py-0.5">Lv.{petLevel}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">{petConfig.talent.emoji} {petConfig.talent.name}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        ) : null}
      </motion.div>

      {/* ═══════════════════ LOGIN REWARD ═══════════════════ */}
      <AnimatePresence>
        {loginReward && loginReward.isNewLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6"
            onClick={() => setLoginReward(null)}
          >
            <motion.div
              initial={{ scale: 0.7, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setLoginReward(null)} className="absolute right-4 top-4 text-gray-300 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
              <div className="text-center">
                <motion.span
                  className="text-5xl block mb-3"
                  animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >🎁</motion.span>
                <h3 className="text-xl font-bold text-gray-800 mb-1">签到奖励</h3>
                <p className="text-sm text-gray-400 mb-5">连续 <span className="font-bold text-[#667eea]">{loginStreak}</span> 天</p>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2, stiffness: 300 }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#667eea]/10 to-[#764ba2]/10 px-6 py-3 mb-5"
                >
                  <Coins className="w-6 h-6 text-[#FF6B35]" />
                  <span className="text-2xl font-black text-[#667eea]">+{loginReward.coins}</span>
                </motion.div>
                <button
                  onClick={() => setLoginReward(null)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white text-sm font-bold shadow-lg shadow-[#667eea]/30 active:scale-95 transition-transform"
                >
                  收下奖励 🎉
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
