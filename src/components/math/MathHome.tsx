'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Star,
  Lock,
  Play,
  Plus,
  Minus,
  X,
  Divide,
  Shuffle,
  GitCompareArrows,
  Zap,
  BookOpen,
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { playClickSound } from '@/lib/sound';
import type { Operation, Difficulty } from '@/lib/math-utils';

// ─── Types ──────────────────────────────────────────────────────────────────

type MathTab = 'free' | 'speed' | 'adventure';

// ─── Config ─────────────────────────────────────────────────────────────────

const TABS: { key: MathTab; label: string; emoji: string }[] = [
  { key: 'free', label: '自由练习', emoji: '✏️' },
  { key: 'speed', label: '限时挑战', emoji: '⚡' },
  { key: 'adventure', label: '闯关模式', emoji: '🗺️' },
];

const OPERATIONS: { value: Operation; label: string; icon: React.ReactNode }[] = [
  { value: 'add', label: '加法', icon: <Plus className="h-3.5 w-3.5" /> },
  { value: 'subtract', label: '减法', icon: <Minus className="h-3.5 w-3.5" /> },
  { value: 'multiply', label: '乘法', icon: <X className="h-3.5 w-3.5" /> },
  { value: 'divide', label: '除法', icon: <Divide className="h-3.5 w-3.5" /> },
  { value: 'mix', label: '混合', icon: <Shuffle className="h-3.5 w-3.5" /> },
  { value: 'compare', label: '比较', icon: <GitCompareArrows className="h-3.5 w-3.5" /> },
];

const DIFFICULTIES: { value: Difficulty; label: string; emoji: string }[] = [
  { value: 'easy', label: '简单', emoji: '🌱' },
  { value: 'medium', label: '中等', emoji: '🌿' },
  { value: 'hard', label: '困难', emoji: '🌳' },
];

const COUNTS = [5, 10, 15, 20];

const TIME_OPTIONS = [
  { value: 30, label: '30秒', emoji: '🐇' },
  { value: 60, label: '60秒', emoji: '🏃' },
  { value: 90, label: '90秒', emoji: '🚴' },
  { value: 120, label: '120秒', emoji: '🏃‍♂️' },
];

// ─── Adventure Levels ──────────────────────────────────────────────────────

interface AdventureLevel {
  id: number;
  name: string;
  emoji: string;
  operation: 'add' | 'subtract' | 'multiply' | 'divide' | 'mix' | 'compare';
  difficulty: Difficulty;
  questionCount: number;
  desc: string;
  requiredStars: number;
}

const LEVELS: AdventureLevel[] = [
  { id: 1, name: '数字启蒙', emoji: '🌱', operation: 'add', difficulty: 'easy', questionCount: 5, desc: '10以内加法', requiredStars: 0 },
  { id: 2, name: '减法入门', emoji: '📝', operation: 'subtract', difficulty: 'easy', questionCount: 5, desc: '10以内减法', requiredStars: 1 },
  { id: 3, name: '加法达人', emoji: '⭐', operation: 'add', difficulty: 'medium', questionCount: 8, desc: '50以内加法', requiredStars: 3 },
  { id: 4, name: '减法达人', emoji: '🎯', operation: 'subtract', difficulty: 'medium', questionCount: 8, desc: '50以内减法', requiredStars: 5 },
  { id: 5, name: '乘法口诀', emoji: '🔢', operation: 'multiply', difficulty: 'easy', questionCount: 10, desc: '乘法表练习', requiredStars: 7 },
  { id: 6, name: '除法初探', emoji: '🧩', operation: 'divide', difficulty: 'easy', questionCount: 10, desc: '整除练习', requiredStars: 10 },
  { id: 7, name: '混合运算', emoji: '🔄', operation: 'mix', difficulty: 'medium', questionCount: 10, desc: '四则混合', requiredStars: 13 },
  { id: 8, name: '大小比较', emoji: '⚖️', operation: 'compare', difficulty: 'medium', questionCount: 10, desc: '比大小挑战', requiredStars: 16 },
  { id: 9, name: '进阶加法', emoji: '🚀', operation: 'add', difficulty: 'hard', questionCount: 12, desc: '100以内加法', requiredStars: 20 },
  { id: 10, name: '进阶减法', emoji: '🌟', operation: 'subtract', difficulty: 'hard', questionCount: 12, desc: '100以内减法', requiredStars: 24 },
  { id: 11, name: '乘法高手', emoji: '💪', operation: 'multiply', difficulty: 'hard', questionCount: 15, desc: '大数乘法', requiredStars: 28 },
  { id: 12, name: '终极挑战', emoji: '👑', operation: 'mix', difficulty: 'hard', questionCount: 20, desc: '全面大考验', requiredStars: 33 },
];

// ─── Animation ──────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function MathHome() {
  const {
    totalStars, streak, adventureStars,
    selectedOperation, selectedDifficulty, speedTimeLimit, speedOperation,
    setSelectedOperation, setSelectedDifficulty, setSpeedTimeLimit, setSpeedOperation,
    setCurrentView, startMathSession, setAdventureLevel,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<MathTab>('free');
  const [questionCount, setQuestionCount] = useState(10);

  const handleBack = () => { playClickSound(); setCurrentView('home'); };
  const handleHelp = () => { playClickSound(); setCurrentView('help'); };

  const handleFreeStart = () => {
    playClickSound();
    startMathSession('free', selectedOperation, selectedDifficulty, questionCount);
    setCurrentView('playing');
  };

  const handleSpeedStart = () => {
    playClickSound();
    startMathSession('speed', speedOperation, 'easy', 50);
    setSpeedTimeLimit(speedTimeLimit);
    setCurrentView('speed');
  };

  const handleStartLevel = (level: AdventureLevel) => {
    if (totalStars < level.requiredStars) return;
    playClickSound();
    setSelectedOperation(level.operation);
    setSelectedDifficulty(level.difficulty);
    setAdventureLevel(level.id);
    useGameStore.setState({
      lastGameSource: 'math-adventure',
      lastLevelName: level.name,
      lastLevelEmoji: level.emoji,
    });
    startMathSession('adventure', level.operation, level.difficulty, level.questionCount);
    setCurrentView('playing');
  };

  const unlockedCount = LEVELS.filter((l) => totalStars >= l.requiredStars).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/30 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 pb-5 text-white">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button onClick={handleBack} className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
            <button onClick={handleHelp} className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white/90 hover:bg-white/30 transition-colors active:scale-95">
              <BookOpen className="w-3.5 h-3.5" />
              攻略
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">🧮 数学乐园</h1>
              <p className="text-white/80 text-xs mt-0.5">快乐学习，轻松进步</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1">
                <Star className="w-3.5 h-3.5 fill-white" />
                <span className="text-sm font-bold">{totalStars}</span>
              </div>
              {streak > 0 && (
                <Badge className="bg-white/20 text-white border-none text-xs px-2 py-0.5">
                  🔥 {streak}天
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-md mx-auto px-4 pt-4 pb-28"
      >
        {/* Tab Bar */}
        <motion.div variants={itemVariants}>
          <div className="flex gap-2 p-1 rounded-2xl bg-white shadow-sm">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); playClickSound(); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.emoji} {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── Free Practice ── */}
          {activeTab === 'free' && (
            <motion.div key="free" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="mt-5 space-y-5">
              {/* Operations */}
              <motion.div variants={itemVariants}>
                <p className="text-xs font-semibold text-gray-400 mb-2 px-1">运算类型</p>
                <div className="grid grid-cols-3 gap-2">
                  {OPERATIONS.map((op) => (
                    <button
                      key={op.value}
                      onClick={() => { setSelectedOperation(op.value); playClickSound(); }}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                        selectedOperation === op.value
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-white text-gray-600 shadow-sm border border-gray-100 hover:border-amber-200'
                      }`}
                    >
                      {op.icon} {op.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Difficulty */}
              <motion.div variants={itemVariants}>
                <p className="text-xs font-semibold text-gray-400 mb-2 px-1">难度选择</p>
                <div className="grid grid-cols-3 gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => { setSelectedDifficulty(d.value); playClickSound(); }}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                        selectedDifficulty === d.value
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-white text-gray-600 shadow-sm border border-gray-100 hover:border-amber-200'
                      }`}
                    >
                      {d.emoji} {d.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Count */}
              <motion.div variants={itemVariants}>
                <p className="text-xs font-semibold text-gray-400 mb-2 px-1">题目数量</p>
                <div className="grid grid-cols-4 gap-2">
                  {COUNTS.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setQuestionCount(c); playClickSound(); }}
                      className={`py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                        questionCount === c
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-white text-gray-600 shadow-sm border border-gray-100 hover:border-amber-200'
                      }`}
                    >
                      {c}题
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ── Speed Challenge ── */}
          {activeTab === 'speed' && (
            <motion.div key="speed" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="mt-5 space-y-5">
              {/* Time */}
              <motion.div variants={itemVariants}>
                <p className="text-xs font-semibold text-gray-400 mb-2 px-1">挑战时长</p>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => { setSpeedTimeLimit(t.value); playClickSound(); }}
                      className={`flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                        speedTimeLimit === t.value
                          ? 'bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-sm'
                          : 'bg-white text-gray-600 shadow-sm border border-gray-100 hover:border-rose-200'
                      }`}
                    >
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Operations */}
              <motion.div variants={itemVariants}>
                <p className="text-xs font-semibold text-gray-400 mb-2 px-1">运算类型</p>
                <div className="grid grid-cols-3 gap-2">
                  {OPERATIONS.filter(o => o.value !== 'compare').map((op) => (
                    <button
                      key={op.value}
                      onClick={() => { setSpeedOperation(op.value); playClickSound(); }}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                        speedOperation === op.value
                          ? 'bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-sm'
                          : 'bg-white text-gray-600 shadow-sm border border-gray-100 hover:border-rose-200'
                      }`}
                    >
                      {op.icon} {op.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Rules hint */}
              <motion.div variants={itemVariants} className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                <p className="text-xs text-rose-700 leading-relaxed">
                  ⏱️ 在选定时间内尽量多答题，答对自动跳题，答错不跳但消耗时间
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* ── Adventure Mode ── */}
          {activeTab === 'adventure' && (
            <motion.div key="adventure" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="mt-5">
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-xs font-semibold text-gray-400">关卡选择</p>
                <p className="text-xs text-gray-400">已解锁 {unlockedCount}/{LEVELS.length}</p>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {LEVELS.map((level) => {
                  const unlocked = totalStars >= level.requiredStars;
                  const stars = adventureStars[level.id] ?? 0;
                  return (
                    <motion.button
                      key={level.id}
                      whileTap={unlocked ? { scale: 0.92 } : {}}
                      onClick={() => handleStartLevel(level)}
                      disabled={!unlocked}
                      className={`relative flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${
                        unlocked
                          ? 'bg-white border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-300 active:scale-95'
                          : 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        unlocked ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {unlocked ? level.id : <Lock className="w-2.5 h-2.5" />}
                      </div>
                      <span className="text-xl">{unlocked ? level.emoji : '🔒'}</span>
                      <span className={`text-[11px] font-medium text-center leading-tight ${unlocked ? 'text-gray-700' : 'text-gray-400'}`}>
                        {level.name}
                      </span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star key={s} className={`w-2.5 h-2.5 ${s <= stars ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      {!unlocked && level.requiredStars > 0 && (
                        <span className="text-[9px] text-gray-400">⭐{level.requiredStars}</span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Floating Start Button ── */}
      {activeTab !== 'adventure' && (
        <div className="fixed bottom-20 left-0 right-0 z-30 px-4 pb-2">
          <div className="max-w-md mx-auto">
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                onClick={activeTab === 'free' ? handleFreeStart : handleSpeedStart}
                className={`w-full h-13 text-base font-bold text-white border-0 shadow-lg transition-shadow ${
                  activeTab === 'free'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-amber-200/60'
                    : 'bg-gradient-to-r from-red-400 to-rose-500 shadow-rose-200/60'
                }`}
              >
                {activeTab === 'free' ? (
                  <><Play className="w-5 h-5 mr-2" /> 开始练习</>
                ) : (
                  <><Zap className="w-5 h-5 mr-2" /> 开始挑战</>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
