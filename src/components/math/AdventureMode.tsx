'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, Lock, Play } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { playClickSound } from '@/lib/sound';
import type { Difficulty } from '@/lib/math-utils';

// ─── Level Definitions ──────────────────────────────────────────────────────

interface AdventureLevel {
  id: number;
  name: string;
  emoji: string;
  operation: 'add' | 'subtract' | 'multiply' | 'divide' | 'mix' | 'compare';
  difficulty: Difficulty;
  questionCount: number;
  desc: string;
  requiredStars: number; // Total stars needed to unlock
}

const LEVELS: AdventureLevel[] = [
  { id: 1, name: '数字启蒙', emoji: '🌱', operation: 'add', difficulty: 'easy', questionCount: 5, desc: '10以内加法', requiredStars: 0 },
  { id: 2, name: '减法入门', emoji: '📝', operation: 'subtract', difficulty: 'easy', questionCount: 5, desc: '10以内减法', requiredStars: 1 },
  { id: 3, name: '加法小达人', emoji: '⭐', operation: 'add', difficulty: 'medium', questionCount: 8, desc: '50以内加法', requiredStars: 3 },
  { id: 4, name: '减法小达人', emoji: '🎯', operation: 'subtract', difficulty: 'medium', questionCount: 8, desc: '50以内减法', requiredStars: 5 },
  { id: 5, name: '乘法口诀', emoji: '🔢', operation: 'multiply', difficulty: 'easy', questionCount: 10, desc: '乘法表练习', requiredStars: 7 },
  { id: 6, name: '除法初探', emoji: '🧩', operation: 'divide', difficulty: 'easy', questionCount: 10, desc: '整除练习', requiredStars: 10 },
  { id: 7, name: '混合运算', emoji: '🔄', operation: 'mix', difficulty: 'medium', questionCount: 10, desc: '四则混合', requiredStars: 13 },
  { id: 8, name: '大小比较', emoji: '⚖️', operation: 'compare', difficulty: 'medium', questionCount: 10, desc: '比大小挑战', requiredStars: 16 },
  { id: 9, name: '进阶加法', emoji: '🚀', operation: 'add', difficulty: 'hard', questionCount: 12, desc: '100以内加法', requiredStars: 20 },
  { id: 10, name: '进阶减法', emoji: '🌟', operation: 'subtract', difficulty: 'hard', questionCount: 12, desc: '100以内减法', requiredStars: 24 },
  { id: 11, name: '乘法高手', emoji: '💪', operation: 'multiply', difficulty: 'hard', questionCount: 15, desc: '大数乘法', requiredStars: 28 },
  { id: 12, name: '终极挑战', emoji: '👑', operation: 'mix', difficulty: 'hard', questionCount: 20, desc: '全面大考验', requiredStars: 33 },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function isLevelUnlocked(level: AdventureLevel, totalStars: number): boolean {
  return totalStars >= level.requiredStars;
}

// ─── Animation ──────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdventureMode() {
  const {
    totalStars,
    adventureStars,
    setCurrentView,
    startMathSession,
    setSelectedOperation,
    setSelectedDifficulty,
    setAdventureLevel,
    setLastGameSource,
    setLastLevelName,
    setLastLevelEmoji,
  } = useGameStore();

  // Use direct setters — these exist on the store
  const store = useGameStore();

  const handleBack = () => {
    playClickSound();
    setCurrentView('math-home');
  };

  const handleStartLevel = (level: AdventureLevel) => {
    if (!isLevelUnlocked(level, totalStars)) return;
    playClickSound();

    setSelectedOperation(level.operation);
    setSelectedDifficulty(level.difficulty);
    setAdventureLevel(level.id);

    // Set game source info via set function
    useGameStore.setState({
      lastGameSource: 'math-adventure',
      lastLevelName: level.name,
      lastLevelEmoji: level.emoji,
    });

    startMathSession('adventure', level.operation, level.difficulty, level.questionCount);
    setCurrentView('playing');
  };

  const unlockedCount = LEVELS.filter((l) => isLevelUnlocked(l, totalStars)).length;
  const earnedStarsTotal = Object.values(adventureStars).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-5 text-white">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-white/80 hover:text-white mb-3 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">🗺️ 闯关模式</h1>
              <p className="text-white/80 text-sm mt-1">
                已解锁 {unlockedCount}/{LEVELS.length} 关
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                <Star className="w-4 h-4 fill-white" />
                <span className="text-sm font-bold">{totalStars}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Level Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-lg mx-auto px-4 py-6"
      >
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {LEVELS.map((level) => {
            const unlocked = isLevelUnlocked(level, totalStars);
            const stars = adventureStars[level.id] ?? 0;

            return (
              <motion.button
                key={level.id}
                variants={itemVariants}
                whileTap={unlocked ? { scale: 0.92 } : {}}
                onClick={() => unlocked && handleStartLevel(level)}
                disabled={!unlocked}
                className={`
                  relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all
                  ${unlocked
                    ? 'bg-white border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-300 cursor-pointer'
                    : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
                  }
                `}
              >
                {/* Level number */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  unlocked
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'
                    : 'bg-gray-300 text-gray-500'
                }`}>
                  {unlocked ? level.id : <Lock className="w-3 h-3" />}
                </div>

                {/* Emoji */}
                <span className="text-2xl">{unlocked ? level.emoji : '🔒'}</span>

                {/* Name */}
                <span className={`text-xs font-medium text-center leading-tight ${
                  unlocked ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  {level.name}
                </span>

                {/* Stars */}
                <div className="flex gap-0.5">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        s <= stars
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Lock overlay hint */}
                {!unlocked && level.requiredStars > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -bottom-1 text-[10px] px-1.5 py-0 bg-gray-200 text-gray-500"
                  >
                    ⭐{level.requiredStars}
                  </Badge>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Level Detail Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Card className="border-emerald-100 shadow-sm">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-emerald-800 mb-2">
                📊 闯关进度
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>已通过关卡</span>
                  <span className="font-medium text-emerald-600">
                    {Object.keys(adventureStars).filter((k) => (adventureStars[Number(k)] ?? 0) > 0).length}/{LEVELS.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>获得星星</span>
                  <span className="font-medium text-amber-600">⭐ {earnedStarsTotal}</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tips */}
        <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <p className="text-sm text-emerald-800">
            💡 <span className="font-medium">提示：</span>
            每关获得足够星星可以解锁下一关。获得更多总星可以提前解锁后面的关卡！
          </p>
        </div>
      </motion.div>
    </div>
  );
}
