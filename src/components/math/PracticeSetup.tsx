'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Play, Plus, Minus, X, Divide, Shuffle, GitCompareArrows } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { playClickSound } from '@/lib/sound';
import type { Operation, Difficulty } from '@/lib/math-utils';

// ─── Config ─────────────────────────────────────────────────────────────────

const OPERATIONS: {
  value: Operation;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}[] = [
  { value: 'add', label: '加法', icon: <Plus className="w-5 h-5" />, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  { value: 'subtract', label: '减法', icon: <Minus className="w-5 h-5" />, color: 'text-sky-600', bgColor: 'bg-sky-50', borderColor: 'border-sky-200' },
  { value: 'multiply', label: '乘法', icon: <X className="w-5 h-5" />, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  { value: 'divide', label: '除法', icon: <Divide className="w-5 h-5" />, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  { value: 'mix', label: '混合', icon: <Shuffle className="w-5 h-5" />, color: 'text-rose-600', bgColor: 'bg-rose-50', borderColor: 'border-rose-200' },
  { value: 'compare', label: '比较', icon: <GitCompareArrows className="w-5 h-5" />, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
];

const DIFFICULTIES: {
  value: Difficulty;
  label: string;
  desc: string;
  emoji: string;
}[] = [
  { value: 'easy', label: '简单', desc: '10以内', emoji: '🌱' },
  { value: 'medium', label: '中等', desc: '50以内', emoji: '🌿' },
  { value: 'hard', label: '困难', desc: '100以内', emoji: '🌳' },
];

const QUESTION_COUNTS = [5, 10, 15, 20];

// ─── Animation ──────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function PracticeSetup() {
  const {
    selectedOperation,
    selectedDifficulty,
    setSelectedOperation,
    setSelectedDifficulty,
    setCurrentView,
    startMathSession,
    lastGameSource,
    lastLevelEmoji,
  } = useGameStore();

  const [questionCount, setQuestionCount] = useState(10);

  const handleBack = () => {
    playClickSound();
    setCurrentView(lastGameSource === 'math-adventure' ? 'math-adventure' : 'math-home');
  };

  const handleStart = () => {
    playClickSound();
    startMathSession('free', selectedOperation, selectedDifficulty, questionCount);
    setCurrentView('playing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-5 text-white">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-white/80 hover:text-white mb-3 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <h1 className="text-xl font-bold">
            {lastGameSource === 'math-adventure' ? `${lastLevelEmoji} 关卡设置` : '✏️ 自由练习'}
          </h1>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-lg mx-auto px-4 py-6 space-y-6"
      >
        {/* Operation Selection */}
        <motion.div variants={itemVariants}>
          <h2 className="text-base font-semibold text-gray-700 mb-3">选择运算</h2>
          <div className="grid grid-cols-3 gap-3">
            {OPERATIONS.map((op) => (
              <button
                key={op.value}
                onClick={() => {
                  playClickSound();
                  setSelectedOperation(op.value);
                }}
                className={`
                  relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all active:scale-95
                  ${selectedOperation === op.value
                    ? `${op.bgColor} ${op.borderColor} shadow-md`
                    : 'bg-white border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <span className={selectedOperation === op.value ? op.color : 'text-gray-400'}>
                  {op.icon}
                </span>
                <span className={`text-sm font-medium ${selectedOperation === op.value ? op.color : 'text-gray-600'}`}>
                  {op.label}
                </span>
                {selectedOperation === op.value && (
                  <motion.div
                    layoutId="op-check"
                    className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-xs">✓</span>
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Difficulty Selection */}
        <motion.div variants={itemVariants}>
          <h2 className="text-base font-semibold text-gray-700 mb-3">选择难度</h2>
          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff.value}
                onClick={() => {
                  playClickSound();
                  setSelectedDifficulty(diff.value);
                }}
                className={`
                  relative flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all active:scale-95
                  ${selectedDifficulty === diff.value
                    ? 'bg-amber-50 border-amber-300 shadow-md'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <span className="text-2xl">{diff.emoji}</span>
                <span className={`text-sm font-medium ${selectedDifficulty === diff.value ? 'text-amber-700' : 'text-gray-600'}`}>
                  {diff.label}
                </span>
                <span className="text-xs text-gray-400">{diff.desc}</span>
                {selectedDifficulty === diff.value && (
                  <motion.div
                    layoutId="diff-check"
                    className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-xs">✓</span>
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Question Count */}
        <motion.div variants={itemVariants}>
          <h2 className="text-base font-semibold text-gray-700 mb-3">题目数量</h2>
          <div className="grid grid-cols-4 gap-3">
            {QUESTION_COUNTS.map((count) => (
              <button
                key={count}
                onClick={() => {
                  playClickSound();
                  setQuestionCount(count);
                }}
                className={`
                  py-3 rounded-xl border-2 font-semibold text-sm transition-all active:scale-95
                  ${questionCount === count
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                {count}题
              </button>
            ))}
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.div variants={itemVariants} className="pt-2">
          <Button
            onClick={handleStart}
            className="w-full h-13 text-base font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg hover:opacity-90"
          >
            <Play className="w-5 h-5" />
            开始练习
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
