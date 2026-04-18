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
  BookOpen,
  FileText,
  Puzzle,
  Ear,
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { MODE_CONFIG, getModesForGrade, type ChineseMode, type ChineseGrade } from '@/lib/chinese-utils';
import { playClickSound, resumeAudioContext } from '@/lib/sound';

// ── Shared mutable config for ChinesePlay to read ──
let _chinesePlayConfig = { mode: 'recognize-pinyin' as ChineseMode, grade: 1 as ChineseGrade, count: 10 };
export const chinesePlayConfig = _chinesePlayConfig;
export function setChinesePlayConfig(cfg: Partial<typeof _chinesePlayConfig>) {
  Object.assign(_chinesePlayConfig, cfg);
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

// ─── Data ───────────────────────────────────────────────────────────────────

const GRADES: { value: ChineseGrade; label: string; desc: string }[] = [
  { value: 1, label: '1年级', desc: '基础识字' },
  { value: 2, label: '2年级', desc: '词语积累' },
  { value: 3, label: '3年级', desc: '理解表达' },
  { value: 4, label: '4年级', desc: '成语反义' },
  { value: 5, label: '5年级', desc: '古诗谚语' },
  { value: 6, label: '6年级', desc: '文学素养' },
];

const COUNTS = [5, 10, 15, 20];

// Icon + gradient mapping per mode
const MODE_ICONS: Record<ChineseMode, { icon: typeof BookOpen; gradient: string }> = {
  'recognize-char': { icon: BookOpen, gradient: 'from-rose-400 to-red-500' },
  'recognize-pinyin': { icon: FileText, gradient: 'from-orange-400 to-amber-500' },
  'word-match': { icon: Puzzle, gradient: 'from-pink-400 to-rose-500' },
  'dictation': { icon: Ear, gradient: 'from-red-400 to-orange-500' },
  'idiom-fill': { icon: BookOpen, gradient: 'from-amber-400 to-orange-500' },
  'antonym': { icon: Puzzle, gradient: 'from-teal-400 to-emerald-500' },
  'poetry-fill': { icon: BookOpen, gradient: 'from-purple-400 to-pink-500' },
  'synonym': { icon: FileText, gradient: 'from-cyan-400 to-blue-500' },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function ChineseHome() {
  const { setCurrentView, totalStars, streak } = useGameStore();
  const [selectedMode, setSelectedMode] = useState<ChineseMode>('recognize-pinyin');
  const [selectedGrade, setSelectedGrade] = useState<ChineseGrade>(1);

  const availableModes = getModesForGrade(selectedGrade);
  const isModeAvailable = (mode: ChineseMode) => availableModes.some((m) => m.mode === mode);

  // If selected mode is not available for current grade, auto-switch to first available
  const activeMode = isModeAvailable(selectedMode) ? selectedMode : (availableModes[0]?.mode ?? 'recognize-char');
  const [selectedCount, setSelectedCount] = useState(10);

  const handleStart = () => {
    playClickSound();
    resumeAudioContext();
    setChinesePlayConfig({ mode: activeMode, grade: selectedGrade, count: selectedCount });
    setCurrentView('chinese-play');
  };

  const handleBack = () => {
    playClickSound();
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-orange-50 to-white">
      {/* ── Gradient Header Banner ── */}
      <div className="bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-5 text-white">
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
                📖 语文乐园
              </h1>
              <p className="text-white/80 text-sm mt-1">识字拼音，趣味学习</p>
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

      {/* ── Main Content ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-md mx-auto px-4 py-6 space-y-5"
      >
        {/* Mode Selection Section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-sm font-semibold text-gray-500 mb-3 px-1">选择模式</h2>
          <div className="space-y-3">
            {(Object.values(MODE_CONFIG) as typeof MODE_CONFIG[ChineseMode][]).map((modeConfig) => {
              const available = isModeAvailable(modeConfig.mode);
              const isSelected = activeMode === modeConfig.mode;
              const { icon: ModeIcon, gradient } = MODE_ICONS[modeConfig.mode];
              return (
                <Card
                  key={modeConfig.mode}
                  className={`border-none shadow-lg transition-all active:scale-[0.98] overflow-hidden ${
                    !available
                      ? 'opacity-40 cursor-not-allowed grayscale'
                      : `cursor-pointer hover:shadow-xl ${isSelected ? 'ring-2 ring-rose-400 shadow-rose-100' : ''}`
                  }`}
                  onClick={() => {
                    if (!available) return;
                    setSelectedMode(modeConfig.mode);
                    playClickSound();
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-md`}
                      >
                        <ModeIcon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-800">
                          {modeConfig.name}
                          {!available && (
                            <span className="text-xs font-normal text-gray-400 ml-2">
                              {modeConfig.minGrade}年级+
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {modeConfig.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Grade Selection */}
        <motion.div variants={itemVariants}>
          <h2 className="text-sm font-semibold text-gray-500 mb-3 px-1">选择年级</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
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
                  className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-200'
                      : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-600'
                  }`}
                >
                  {g.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Question Count */}
        <motion.div variants={itemVariants}>
          <h2 className="text-sm font-semibold text-gray-500 mb-3 px-1">题目数量</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
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
                  className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-200'
                      : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-600'
                  }`}
                >
                  {count}题
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.div variants={itemVariants}>
          <motion.div whileTap={{ scale: 0.97 }} className="px-2 pt-2">
            <Button
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-rose-500 to-orange-500 text-white border-0 shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 hover:opacity-95 transition-shadow"
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
          className="bg-rose-50 border border-rose-100 rounded-xl p-4"
        >
          <p className="text-sm text-rose-800">
            💡 <span className="font-medium">小提示：</span>
            每天坚持练习可以积累连续天数奖励哦！从一年级开始，逐步认识更多汉字，你也可以成为识字小达人！
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
