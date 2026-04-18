'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Play,
  Star,
  ChevronRight,
  Image as ImageIcon,
  Palette,
  Headphones,
  PencilLine,
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { ALL_ENGLISH_MODES, type EnglishMode, type EnglishGrade } from '@/lib/english-utils';
import { playClickSound, resumeAudioContext } from '@/lib/sound';

// ── Shared mutable config for EnglishPlay to read ──
let _englishPlayConfig = { mode: 'word-picture' as EnglishMode, grade: 1 as EnglishGrade, count: 10 };
export const englishPlayConfig = _englishPlayConfig;
export function setEnglishPlayConfig(cfg: Partial<typeof _englishPlayConfig>) {
  Object.assign(_englishPlayConfig, cfg);
}

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// ─── Data ────────────────────────────────────────────────────────────────────

const GRADES: { value: EnglishGrade; label: string }[] = [
  { value: 1, label: '一年级' },
  { value: 2, label: '二年级' },
  { value: 3, label: '三年级' },
  { value: 4, label: '四年级' },
  { value: 5, label: '五年级' },
  { value: 6, label: '六年级' },
];

const COUNTS = [5, 10, 15, 20];

const MODE_ICONS: Record<EnglishMode, { icon: typeof ImageIcon; gradient: string }> = {
  'word-picture': { icon: ImageIcon, gradient: 'from-emerald-400 to-teal-500' },
  'picture-word': { icon: Palette, gradient: 'from-cyan-400 to-blue-500' },
  'listening': { icon: Headphones, gradient: 'from-teal-400 to-cyan-500' },
  'spelling': { icon: PencilLine, gradient: 'from-green-400 to-emerald-500' },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function EnglishHome() {
  const { setCurrentView, totalStars, streak } = useGameStore();
  const [selectedMode, setSelectedMode] = useState<EnglishMode>('word-picture');
  const [selectedGrade, setSelectedGrade] = useState<EnglishGrade>(1);
  const [selectedCount, setSelectedCount] = useState(10);

  const handleBack = () => {
    playClickSound();
    setCurrentView('home');
  };

  const handleStart = () => {
    playClickSound();
    resumeAudioContext();
    setEnglishPlayConfig({ mode: selectedMode, grade: selectedGrade, count: selectedCount });
    setCurrentView('english-play');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-white">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-5 text-white">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-white/80 hover:text-white mb-3 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                🔤 英语乐园
              </h1>
              <p className="text-white/80 text-sm mt-1">ABC字母，轻松掌握</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                <Star className="w-4 h-4 fill-white" />
                <span className="text-sm font-bold">{totalStars}</span>
              </div>
              {streak > 0 && (
                <Badge className="bg-white/20 text-white border-none">
                  🔥 {streak}天
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-md mx-auto px-4 py-6 space-y-5"
      >
        {/* Section: Mode Selection */}
        <motion.div variants={itemVariants}>
          <h2 className="text-sm font-semibold text-gray-500 mb-3 px-1">练习模式</h2>
          <div className="space-y-3">
            {ALL_ENGLISH_MODES.map((modeConfig) => {
              const isSelected = selectedMode === modeConfig.mode;
              const iconInfo = MODE_ICONS[modeConfig.mode];
              const IconComp = iconInfo.icon;
              return (
                <motion.div
                  key={modeConfig.mode}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`border-none shadow-lg cursor-pointer hover:shadow-xl transition-all active:scale-[0.98] overflow-hidden ${
                      isSelected ? 'ring-2 ring-emerald-400 ring-offset-2' : ''
                    }`}
                    onClick={() => {
                      setSelectedMode(modeConfig.mode as EnglishMode);
                      playClickSound();
                    }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${iconInfo.gradient} flex items-center justify-center shrink-0 shadow-md`}>
                          <IconComp className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-800">
                            {modeConfig.emoji} {modeConfig.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {modeConfig.description}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Section: Grade Selection */}
        <motion.div variants={itemVariants}>
          <h2 className="text-sm font-semibold text-gray-500 mb-3 px-1">选择年级</h2>
          <div className="flex flex-wrap gap-2">
            {GRADES.map((g) => {
              const isSelected = selectedGrade === g.value;
              return (
                <motion.button
                  key={g.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedGrade(g.value);
                    playClickSound();
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
                  }`}
                >
                  {g.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Section: Question Count */}
        <motion.div variants={itemVariants}>
          <h2 className="text-sm font-semibold text-gray-500 mb-3 px-1">题目数量</h2>
          <div className="flex gap-3">
            {COUNTS.map((count) => {
              const isSelected = selectedCount === count;
              return (
                <motion.button
                  key={count}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedCount(count);
                    playClickSound();
                  }}
                  className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
                  }`}
                >
                  {count}题
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.div variants={itemVariants} className="pt-2">
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 hover:opacity-95 transition-shadow"
              onClick={handleStart}
            >
              <Play className="w-5 h-5 mr-2" />
              开始练习
            </Button>
          </motion.div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          variants={itemVariants}
          className="bg-emerald-50 border border-emerald-100 rounded-xl p-4"
        >
          <p className="text-sm text-emerald-800">
            💡 <span className="font-medium">小提示：</span>
            坚持每天练习英语，可以快速提升词汇量！试试听力模式，锻炼你的耳朵吧！
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
