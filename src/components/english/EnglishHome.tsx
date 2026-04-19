'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Play,
  Star,
  BookOpen,
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { ALL_ENGLISH_MODES, type EnglishMode, type EnglishGrade } from '@/lib/english-utils';
import { playClickSound, resumeAudioContext } from '@/lib/sound';

// ── Shared mutable config for EnglishPlay ──
let _englishPlayConfig = { mode: 'word-picture' as EnglishMode, grade: 1 as EnglishGrade, count: 10 };
export const englishPlayConfig = _englishPlayConfig;
export function setEnglishPlayConfig(cfg: Partial<typeof _englishPlayConfig>) {
  Object.assign(_englishPlayConfig, cfg);
}

// ─── Config ─────────────────────────────────────────────────────────────────

const GRADES: { value: EnglishGrade; label: string }[] = [
  { value: 1, label: '1年级' },
  { value: 2, label: '2年级' },
  { value: 3, label: '3年级' },
  { value: 4, label: '4年级' },
  { value: 5, label: '5年级' },
  { value: 6, label: '6年级' },
];

const COUNTS = [5, 10, 15, 20];

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

export default function EnglishHome() {
  const { setCurrentView, totalStars, streak } = useGameStore();
  const [selectedMode, setSelectedMode] = useState<EnglishMode>('word-picture');
  const [selectedGrade, setSelectedGrade] = useState<EnglishGrade>(1);
  const [selectedCount, setSelectedCount] = useState(10);

  const handleBack = () => { playClickSound(); setCurrentView('home'); };
  const handleHelp = () => { playClickSound(); setCurrentView('help'); };
  const handleStart = () => {
    playClickSound();
    resumeAudioContext();
    setEnglishPlayConfig({ mode: selectedMode, grade: selectedGrade, count: selectedCount });
    setCurrentView('english-play');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50/30 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 pb-5 text-white">
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
              <h1 className="text-2xl font-bold">🔤 英语乐园</h1>
              <p className="text-white/80 text-xs mt-0.5">ABC字母，轻松掌握</p>
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
        className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-5"
      >
        {/* Mode Selection — 2x2 compact grid */}
        <motion.div variants={itemVariants}>
          <p className="text-xs font-semibold text-gray-400 mb-2 px-1">练习模式</p>
          <div className="grid grid-cols-2 gap-2">
            {ALL_ENGLISH_MODES.map((modeConfig) => {
              const isSelected = selectedMode === modeConfig.mode;
              return (
                <button
                  key={modeConfig.mode}
                  onClick={() => { setSelectedMode(modeConfig.mode as EnglishMode); playClickSound(); }}
                  className={`flex items-center gap-2 py-3 px-3 rounded-xl text-left transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                      : 'bg-white text-gray-700 shadow-sm border border-gray-100 hover:border-emerald-200'
                  }`}
                >
                  <span className="text-lg">{modeConfig.emoji}</span>
                  <p className="text-xs font-bold truncate">{modeConfig.name}</p>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Grade Selection */}
        <motion.div variants={itemVariants}>
          <p className="text-xs font-semibold text-gray-400 mb-2 px-1">选择年级</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {GRADES.map((g) => (
              <button
                key={g.value}
                onClick={() => { setSelectedGrade(g.value); playClickSound(); }}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 ${
                  selectedGrade === g.value
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 shadow-sm border border-gray-100 hover:border-emerald-200'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Question Count */}
        <motion.div variants={itemVariants}>
          <p className="text-xs font-semibold text-gray-400 mb-2 px-1">题目数量</p>
          <div className="grid grid-cols-4 gap-2">
            {COUNTS.map((c) => (
              <button
                key={c}
                onClick={() => { setSelectedCount(c); playClickSound(); }}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                  selectedCount === c
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 shadow-sm border border-gray-100 hover:border-emerald-200'
                }`}
              >
                {c}题
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ── Floating Start Button ── */}
      <div className="fixed bottom-20 left-0 right-0 z-30 px-4 pb-2">
        <div className="max-w-md mx-auto">
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              onClick={handleStart}
              className="w-full h-13 text-base font-bold text-white border-0 shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-200/60"
            >
              <Play className="w-5 h-5 mr-2" />
              开始练习
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
