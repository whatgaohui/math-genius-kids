'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Plus, Minus, X, Divide, Shuffle, Clock } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { playClickSound } from '@/lib/sound';
import type { Operation } from '@/lib/math-utils';

// ─── Config ─────────────────────────────────────────────────────────────────

const TIME_OPTIONS = [
  { value: 30, label: '30秒', emoji: '🐇', desc: '极速挑战' },
  { value: 60, label: '60秒', emoji: '🏃', desc: '经典模式' },
  { value: 90, label: '90秒', emoji: '🚴', desc: '耐力挑战' },
  { value: 120, label: '120秒', emoji: '🏃‍♂️', desc: '持久战' },
];

const SPEED_OPERATIONS: {
  value: Operation;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: 'add', label: '加法', icon: <Plus className="w-4 h-4" /> },
  { value: 'subtract', label: '减法', icon: <Minus className="w-4 h-4" /> },
  { value: 'multiply', label: '乘法', icon: <X className="w-4 h-4" /> },
  { value: 'divide', label: '除法', icon: <Divide className="w-4 h-4" /> },
  { value: 'mix', label: '混合', icon: <Shuffle className="w-4 h-4" /> },
];

// ─── Animation ──────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function SpeedSetup() {
  const {
    speedTimeLimit,
    speedOperation,
    setSpeedTimeLimit,
    setSpeedOperation,
    setCurrentView,
    startMathSession,
  } = useGameStore();

  const handleBack = () => {
    playClickSound();
    setCurrentView('math-home');
  };

  const handleStart = () => {
    playClickSound();
    // Generate many questions for speed mode
    startMathSession('speed', speedOperation, 'easy', 50);
    setCurrentView('speed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-400 to-rose-500 px-4 py-5 text-white">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-white/80 hover:text-white mb-3 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6" />
            限时挑战
          </h1>
          <p className="text-white/80 text-sm mt-1">在限定时间内尽可能多地答对题目</p>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-lg mx-auto px-4 py-6 space-y-6"
      >
        {/* Time Limit */}
        <motion.div variants={itemVariants}>
          <h2 className="text-base font-semibold text-gray-700 mb-3">选择时间</h2>
          <div className="grid grid-cols-2 gap-3">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  playClickSound();
                  setSpeedTimeLimit(opt.value);
                }}
                className={`
                  relative flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all active:scale-95
                  ${speedTimeLimit === opt.value
                    ? 'bg-rose-50 border-rose-300 shadow-md'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <span className="text-3xl">{opt.emoji}</span>
                <span className={`text-lg font-bold ${speedTimeLimit === opt.value ? 'text-rose-600' : 'text-gray-700'}`}>
                  {opt.label}
                </span>
                <span className="text-xs text-gray-400">{opt.desc}</span>
                {speedTimeLimit === opt.value && (
                  <motion.div
                    layoutId="time-check"
                    className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-xs">✓</span>
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Operation */}
        <motion.div variants={itemVariants}>
          <h2 className="text-base font-semibold text-gray-700 mb-3">选择运算</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {SPEED_OPERATIONS.map((op) => (
              <button
                key={op.value}
                onClick={() => {
                  playClickSound();
                  setSpeedOperation(op.value);
                }}
                className={`
                  relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all active:scale-95
                  ${speedOperation === op.value
                    ? 'bg-rose-50 border-rose-300 shadow-md text-rose-600'
                    : 'bg-white border-gray-200 hover:border-gray-300 text-gray-500'
                  }
                `}
              >
                {op.icon}
                <span className="text-xs font-medium">{op.label}</span>
                {speedOperation === op.value && (
                  <motion.div
                    layoutId="speed-op-check"
                    className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-[10px]">✓</span>
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Rules */}
        <motion.div variants={itemVariants} className="bg-rose-50 border border-rose-100 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-rose-800 mb-2">🎯 规则说明</h3>
          <ul className="text-xs text-rose-700 space-y-1">
            <li>• 在选定时间内尽可能多地答题</li>
            <li>• 答对自动跳到下一题</li>
            <li>• 答错不会跳题，会消耗宝贵时间</li>
            <li>• 时间到后显示成绩</li>
          </ul>
        </motion.div>

        {/* Start */}
        <motion.div variants={itemVariants} className="pt-2">
          <Button
            onClick={handleStart}
            className="w-full h-13 text-base font-bold bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-lg hover:opacity-90"
          >
            <Play className="w-5 h-5" />
            开始挑战
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
