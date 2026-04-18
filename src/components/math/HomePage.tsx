'use client';

import { motion } from 'framer-motion';
import { Star, Zap, Flame, ChevronRight, Trophy } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { usePetStore, PET_CONFIGS } from '@/lib/pet-store';
import { getXPForNextLevel } from '@/lib/math-utils';
import { Card, CardContent } from '@/components/ui/card';
import BottomNav from './BottomNav';

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

// ─── Subject Cards Config ───────────────────────────────────────────────────

interface SubjectCard {
  key: string;
  emoji: string;
  title: string;
  subtitle: string;
  view: string;
  gradient: string;
  hoverShadow: string;
}

const SUBJECT_CARDS: SubjectCard[] = [
  {
    key: 'math',
    emoji: '🧮',
    title: '数学',
    subtitle: '加减乘除，快乐计算',
    view: 'math-home',
    gradient: 'from-amber-400 via-orange-400 to-yellow-300',
    hoverShadow: 'hover:shadow-amber-200/80',
  },
  {
    key: 'chinese',
    emoji: '📖',
    title: '语文',
    subtitle: '拼音汉字，趣味学习',
    view: 'chinese',
    gradient: 'from-rose-400 via-pink-400 to-red-300',
    hoverShadow: 'hover:shadow-rose-200/80',
  },
  {
    key: 'english',
    emoji: '🔤',
    title: '英语',
    subtitle: 'ABC字母，轻松掌握',
    view: 'english',
    gradient: 'from-emerald-400 via-teal-400 to-green-300',
    hoverShadow: 'hover:shadow-emerald-200/80',
  },
];

// ─── Stat Pill Config ──────────────────────────────────────────────────────

interface StatItem {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function HomePage() {
  const playerName = useGameStore((s) => s.playerName);
  const playerAvatar = useGameStore((s) => s.playerAvatar);
  const playerLevel = useGameStore((s) => s.playerLevel);
  const totalXP = useGameStore((s) => s.totalXP);
  const totalStars = useGameStore((s) => s.totalStars);
  const streak = useGameStore((s) => s.streak);
  const setCurrentView = useGameStore((s) => s.setCurrentView);
  const setCurrentSubject = useGameStore((s) => s.setCurrentSubject);

  const petType = usePetStore((s) => s.petType);
  const petConfig = petType
    ? PET_CONFIGS.find((p) => p.id === petType) ?? null
    : null;

  const displayName = playerName || '小朋友';
  const xpInfo = getXPForNextLevel(totalXP);
  const xpPercent = Math.round(xpInfo.progress * 100);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white">
      {/* ── Decorative blobs ── */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-rose-200/20 blur-3xl" />

      <motion.main
        className="relative z-10 mx-auto max-w-lg px-4 pb-24 pt-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Header: Avatar + Name + Level ── */}
        <motion.div variants={itemVariants} className="mb-6 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 text-2xl shadow-lg shadow-amber-200/50">
            {playerAvatar}
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-800">
              你好，{displayName}！👋
            </h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                <Trophy className="size-3" />
                Lv.{playerLevel}
              </span>
              {petConfig && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-600">
                  {petConfig.emoji} {petConfig.name}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── XP Progress Bar ── */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-amber-100/60">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                ⭐ 经验进度
              </span>
              <span className="text-xs text-gray-500">
                {xpInfo.currentLevelXP} / {xpInfo.nextLevelXP} XP
              </span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full bg-amber-100">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
              />
            </div>
            <p className="mt-1.5 text-right text-[10px] text-gray-400">
              再获得 {xpInfo.nextLevelXP - xpInfo.currentLevelXP} XP 升级
            </p>
          </div>
        </motion.div>

        {/* ── Streak Banner ── */}
        {streak > 0 && (
          <motion.div
            variants={itemVariants}
            className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 p-4 text-white shadow-lg shadow-rose-200/40"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl backdrop-blur-sm">
                🔥
              </div>
              <div>
                <p className="text-sm font-bold">连续学习 {streak} 天！</p>
                <p className="text-xs opacity-90">
                  {streak >= 7
                    ? '太厉害了！坚持就是胜利！🏆'
                    : streak >= 3
                      ? '很棒哦！继续加油！💪'
                      : '每天进步一点点！✨'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Subject Cards ── */}
        <motion.div variants={itemVariants} className="mb-6">
          <h2 className="mb-3 text-base font-bold text-gray-800">
            选择科目 📚
          </h2>
          <div className="flex flex-col gap-3">
            {SUBJECT_CARDS.map((card) => (
              <motion.button
                key={card.key}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setCurrentSubject(card.key as 'math' | 'chinese' | 'english');
                  setCurrentView(card.view);
                }}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-r ${card.gradient} p-4 text-left text-white shadow-md transition-shadow duration-200 ${card.hoverShadow} hover:shadow-lg active:scale-[0.98]`}
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{card.emoji}</span>
                    <div>
                      <h3 className="text-lg font-bold">{card.title}</h3>
                      <p className="text-xs opacity-90">{card.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="size-5 opacity-70 transition-transform group-hover:translate-x-1" />
                </div>
                {/* Decorative circle */}
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Quick Stats ── */}
        <motion.div variants={itemVariants} className="mb-6">
          <h2 className="mb-3 text-base font-bold text-gray-800">
            学习统计 📊
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                {
                  icon: Star,
                  label: '星星',
                  value: totalStars,
                  color: 'text-amber-500',
                  bgColor: 'bg-amber-50',
                },
                {
                  icon: Zap,
                  label: '经验',
                  value: totalXP,
                  color: 'text-orange-500',
                  bgColor: 'bg-orange-50',
                },
                {
                  icon: Flame,
                  label: '连续',
                  value: `${streak}天`,
                  color: 'text-rose-500',
                  bgColor: 'bg-rose-50',
                },
              ] as StatItem[]
            ).map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.label}
                  className="border-0 bg-white py-3 shadow-sm"
                >
                  <CardContent className="flex flex-col items-center gap-1 p-0">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.bgColor}`}
                    >
                      <Icon className={item.color} size={18} />
                    </div>
                    <span className="text-lg font-bold text-gray-800">
                      {item.value}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {item.label}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* ── Pet Reminder ── */}
        {!petType && (
          <motion.div variants={itemVariants}>
            <Card
              className="cursor-pointer border-2 border-dashed border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 py-4 transition-colors hover:border-rose-300 hover:from-rose-100/60 hover:to-pink-100/60"
              onClick={() => setCurrentView('pet')}
            >
              <CardContent className="flex items-center gap-3 p-0">
                <span className="text-3xl">🐾</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-700">
                    领养你的学习小伙伴！
                  </p>
                  <p className="text-xs text-gray-500">
                    完成练习获得金币，养一只可爱的小宠物吧~
                  </p>
                </div>
                <ChevronRight className="size-4 text-gray-400" />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.main>

      {/* ── Bottom Navigation ── */}
      <BottomNav />
    </div>
  );
}
