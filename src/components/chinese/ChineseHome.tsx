'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { MODE_CONFIG, type ChineseMode, type ChineseGrade } from '@/lib/chinese-utils';
import { playClickSound } from '@/lib/sound';
import { resumeAudioContext } from '@/lib/sound';

// ── Shared mutable config for ChinesePlay to read ──
let _chinesePlayConfig = { mode: 'recognize-pinyin' as ChineseMode, grade: 1 as ChineseGrade, count: 10 };
export const chinesePlayConfig = _chinesePlayConfig;
export function setChinesePlayConfig(cfg: Partial<typeof _chinesePlayConfig>) {
  Object.assign(_chinesePlayConfig, cfg);
}

const GRADES: { value: ChineseGrade; label: string }[] = [
  { value: 1, label: '1年级' },
  { value: 2, label: '2年级' },
  { value: 3, label: '3年级' },
];

const COUNTS = [5, 10, 15, 20];

export default function ChineseHome() {
  const { setCurrentView } = useGameStore();
  const [selectedMode, setSelectedMode] = useState<ChineseMode>('recognize-pinyin');
  const [selectedGrade, setSelectedGrade] = useState<ChineseGrade>(1);
  const [selectedCount, setSelectedCount] = useState(10);

  const handleStart = () => {
    playClickSound();
    resumeAudioContext();
    setChinesePlayConfig({ mode: selectedMode, grade: selectedGrade, count: selectedCount });
    setCurrentView('chinese-play');
  };

  const handleBack = () => {
    playClickSound();
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-red-50 via-orange-50 to-white">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">语文练习</h1>
          <p className="text-xs text-gray-400">选择练习模式开始学习</p>
        </div>
      </header>

      <main className="flex-1 px-4 pb-6 overflow-y-auto">
        {/* Mode Selection */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-3 px-1">练习模式</h2>
          <div className="grid grid-cols-2 gap-3">
            {(Object.values(MODE_CONFIG) as typeof MODE_CONFIG[ChineseMode][]).map((modeConfig) => {
              const isSelected = selectedMode === modeConfig.mode;
              return (
                <motion.div
                  key={modeConfig.mode}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-200 border-2 ${
                      isSelected
                        ? 'border-red-400 bg-red-50 shadow-md shadow-red-100'
                        : 'border-transparent bg-white hover:border-red-200 hover:shadow-sm'
                    }`}
                    onClick={() => {
                      setSelectedMode(modeConfig.mode);
                      playClickSound();
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="text-3xl mb-2">{modeConfig.emoji}</div>
                      <h3
                        className={`font-bold text-sm ${
                          isSelected ? 'text-red-600' : 'text-gray-700'
                        }`}
                      >
                        {modeConfig.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                        {modeConfig.description}
                      </p>
                      {isSelected && (
                        <motion.div
                          layoutId="chinese-mode-indicator"
                          className="w-full h-1 rounded-full bg-gradient-to-r from-red-400 to-orange-400 mt-3"
                        />
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Grade Selection */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-3 px-1">选择年级</h2>
          <div className="flex gap-3">
            {GRADES.map((g) => {
              const isSelected = selectedGrade === g.value;
              return (
                <motion.div key={g.value} whileTap={{ scale: 0.95 }} className="flex-1">
                  <Card
                    className={`cursor-pointer transition-all duration-200 border-2 text-center ${
                      isSelected
                        ? 'border-orange-400 bg-orange-50 shadow-md shadow-orange-100'
                        : 'border-transparent bg-white hover:border-orange-200'
                    }`}
                    onClick={() => {
                      setSelectedGrade(g.value);
                      playClickSound();
                    }}
                  >
                    <CardContent className="p-3">
                      <span
                        className={`text-base font-bold ${
                          isSelected ? 'text-orange-600' : 'text-gray-600'
                        }`}
                      >
                        {g.label}
                      </span>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Question Count */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 mb-3 px-1">题目数量</h2>
          <div className="flex gap-3">
            {COUNTS.map((count) => {
              const isSelected = selectedCount === count;
              return (
                <motion.div key={count} whileTap={{ scale: 0.95 }} className="flex-1">
                  <Card
                    className={`cursor-pointer transition-all duration-200 border-2 text-center ${
                      isSelected
                        ? 'border-red-400 bg-red-50'
                        : 'border-transparent bg-white hover:border-red-200'
                    }`}
                    onClick={() => {
                      setSelectedCount(count);
                      playClickSound();
                    }}
                  >
                    <CardContent className="p-3">
                      <span
                        className={`text-base font-bold ${
                          isSelected ? 'text-red-600' : 'text-gray-600'
                        }`}
                      >
                        {count}题
                      </span>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Start Button */}
        <motion.div whileTap={{ scale: 0.97 }} className="px-2">
          <Button
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-300 hover:opacity-95 transition-shadow"
            onClick={handleStart}
          >
            <Play className="w-5 h-5 mr-2" />
            开始练习
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
