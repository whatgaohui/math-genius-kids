'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Play,
  Star,
  Lock,
  Zap,
  BookOpen,
  Trophy,
  ChevronRight,
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { ALL_ENGLISH_MODES, type EnglishMode, type EnglishGrade } from '@/lib/english-utils';
import { playClickSound, resumeAudioContext } from '@/lib/sound';

// ── Shared mutable config for EnglishPlay ──
let _englishPlayConfig = {
  mode: 'word-picture' as EnglishMode,
  grade: 1 as EnglishGrade,
  count: 10,
  isSpeed: false,
  speedTimeLimit: 60,
  isAdventure: false,
  adventureFloor: 0,
};
export const englishPlayConfig = _englishPlayConfig;
export function setEnglishPlayConfig(cfg: Partial<typeof _englishPlayConfig>) {
  Object.assign(_englishPlayConfig, cfg);
}

// ─── Types ──────────────────────────────────────────────────────────────────

type EnglishTab = 'free' | 'speed' | 'adventure';

interface EnglishAdventureLevel {
  id: number;
  name: string;
  emoji: string;
  modes: string[];
  grades: number[];
  questionCount: number;
  isBoss: boolean;
}

// ─── Config ─────────────────────────────────────────────────────────────────

const TABS: { key: EnglishTab; label: string; emoji: string }[] = [
  { key: 'free', label: '自由练习', emoji: '✏️' },
  { key: 'speed', label: '限时挑战', emoji: '⚡' },
  { key: 'adventure', label: '闯关模式', emoji: '🗺️' },
];

const GRADES: { value: EnglishGrade; label: string }[] = [
  { value: 1, label: '1年级' },
  { value: 2, label: '2年级' },
  { value: 3, label: '3年级' },
  { value: 4, label: '4年级' },
  { value: 5, label: '5年级' },
  { value: 6, label: '6年级' },
];

const COUNTS = [5, 10, 15, 20];

const TIME_OPTIONS = [
  { value: 30, label: '30秒', emoji: '🐇' },
  { value: 60, label: '60秒', emoji: '🏃' },
  { value: 90, label: '90秒', emoji: '🚴' },
  { value: 120, label: '120秒', emoji: '🏃‍♂️' },
];

// ─── Adventure Tiers ──────────────────────────────────────────────────────

const TIERS = [
  { name: '字母乐园', startFloor: 1, endFloor: 15, grades: [1], modes: ['word-picture', 'picture-word'], emoji: '🔤' },
  { name: '词汇启蒙', startFloor: 16, endFloor: 30, grades: [1, 2], modes: ['word-picture', 'picture-word'], emoji: '📝' },
  { name: '听力训练', startFloor: 31, endFloor: 45, grades: [1, 2], modes: ['listening'], emoji: '🎧' },
  { name: '拼写达人', startFloor: 46, endFloor: 60, grades: [2, 3], modes: ['spelling'], emoji: '✏️' },
  { name: '词汇进阶', startFloor: 61, endFloor: 80, grades: [2, 3, 4], modes: ['word-picture', 'picture-word', 'listening'], emoji: '📚' },
  { name: '英语大师', startFloor: 81, endFloor: 110, grades: [3, 4, 5], modes: ['spelling', 'listening', 'word-picture'], emoji: '🎓' },
  { name: '英语传奇', startFloor: 111, endFloor: 150, grades: [4, 5, 6], modes: ['spelling', 'listening'], emoji: '👑' },
];

const BOSS_FLOORS = [25, 50, 75, 100, 125, 150];

const BOSS_NAMES: Record<number, string> = {
  25: '词汇王者·壹',
  50: '听力王者·壹',
  75: '拼写王者·壹',
  100: '英语宗师·壹',
  125: '英语宗师·贰',
  150: '传奇·终极',
};

function generateAdventureLevels(): EnglishAdventureLevel[] {
  const levels: EnglishAdventureLevel[] = [];
  for (const tier of TIERS) {
    for (let floor = tier.startFloor; floor <= tier.endFloor; floor++) {
      const isBoss = BOSS_FLOORS.includes(floor);
      let questionCount: number;
      if (floor <= 15) questionCount = 5;
      else if (floor <= 45) questionCount = 6;
      else if (floor <= 80) questionCount = 8;
      else if (floor <= 110) questionCount = 10;
      else questionCount = 12;
      if (isBoss) questionCount += 5;

      levels.push({
        id: floor,
        name: isBoss ? BOSS_NAMES[floor] : `第${floor}关`,
        emoji: isBoss ? '🐉' : tier.emoji,
        modes: tier.modes,
        grades: tier.grades,
        questionCount,
        isBoss,
      });
    }
  }
  return levels;
}

const ADVENTURE_LEVELS = generateAdventureLevels();

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
  const {
    setCurrentView, totalStars, streak,
    englishAdventureLevel, englishAdventureStars, englishSpeedTimeLimit,
    setEnglishSpeedTimeLimit,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<EnglishTab>('free');
  const [selectedMode, setSelectedMode] = useState<EnglishMode>('word-picture');
  const [selectedGrade, setSelectedGrade] = useState<EnglishGrade>(1);
  const [selectedCount, setSelectedCount] = useState(10);
  const [speedMode, setSpeedMode] = useState<EnglishMode>('word-picture');

  // ── Current tier info for adventure progress ──
  const currentTier = useMemo(() => {
    for (const tier of TIERS) {
      if (englishAdventureLevel >= tier.startFloor && englishAdventureLevel <= tier.endFloor) {
        return tier;
      }
    }
    return TIERS[TIERS.length - 1];
  }, [englishAdventureLevel]);

  const handleBack = () => { playClickSound(); setCurrentView('home'); };
  const handleHelp = () => { playClickSound(); setCurrentView('help'); };

  const handleFreeStart = () => {
    playClickSound();
    resumeAudioContext();
    setEnglishPlayConfig({ mode: selectedMode, grade: selectedGrade, count: selectedCount, isSpeed: false, isAdventure: false });
    setCurrentView('english-play');
  };

  const handleSpeedStart = () => {
    playClickSound();
    resumeAudioContext();
    setEnglishPlayConfig({ mode: speedMode, grade: selectedGrade, count: 50, isSpeed: true, speedTimeLimit: englishSpeedTimeLimit });
    setCurrentView('english-play');
  };

  const handleStartLevel = (level: EnglishAdventureLevel) => {
    if (englishAdventureLevel < level.id - 1 && level.id > 1) return;
    playClickSound();
    resumeAudioContext();
    setEnglishPlayConfig({
      mode: level.modes[0] as EnglishMode,
      grade: level.grades[0] as EnglishGrade,
      count: level.questionCount,
      isAdventure: true,
      adventureFloor: level.id,
    });
    useGameStore.setState({
      lastGameSource: 'english-adventure',
      lastLevelName: level.name,
      lastLevelEmoji: level.emoji,
    });
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
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.emoji} {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── Tab 1: Free Practice ── */}
          {activeTab === 'free' && (
            <motion.div
              key="free"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="mt-5 space-y-5"
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
          )}

          {/* ── Tab 2: Speed Challenge ── */}
          {activeTab === 'speed' && (
            <motion.div
              key="speed"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="mt-5 space-y-5"
            >
              {/* Time Selection */}
              <motion.div variants={itemVariants}>
                <p className="text-xs font-semibold text-gray-400 mb-2 px-1">挑战时长</p>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => { setEnglishSpeedTimeLimit(t.value); playClickSound(); }}
                      className={`flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                        englishSpeedTimeLimit === t.value
                          ? 'bg-gradient-to-r from-teal-400 to-emerald-500 text-white shadow-sm'
                          : 'bg-white text-gray-600 shadow-sm border border-gray-100 hover:border-emerald-200'
                      }`}
                    >
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Mode Selection for Speed */}
              <motion.div variants={itemVariants}>
                <p className="text-xs font-semibold text-gray-400 mb-2 px-1">练习模式</p>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_ENGLISH_MODES.map((modeConfig) => (
                    <button
                      key={modeConfig.mode}
                      onClick={() => { setSpeedMode(modeConfig.mode as EnglishMode); playClickSound(); }}
                      className={`flex items-center gap-2 py-3 px-3 rounded-xl text-left transition-all active:scale-95 ${
                        speedMode === modeConfig.mode
                          ? 'bg-gradient-to-r from-teal-400 to-emerald-500 text-white shadow-sm'
                          : 'bg-white text-gray-700 shadow-sm border border-gray-100 hover:border-emerald-200'
                      }`}
                    >
                      <span className="text-lg">{modeConfig.emoji}</span>
                      <p className="text-xs font-bold truncate">{modeConfig.name}</p>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Rules hint */}
              <motion.div variants={itemVariants} className="bg-teal-50 border border-teal-100 rounded-xl p-3">
                <p className="text-xs text-teal-700 leading-relaxed">
                  ⏱️ 在限定时间内尽量多答题，答对自动跳题，限时挑战金币奖励×1.5！
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* ── Tab 3: Adventure Mode ── */}
          {activeTab === 'adventure' && (
            <motion.div
              key="adventure"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="mt-5 space-y-4"
            >
              {/* Progress Banner */}
              <motion.div variants={itemVariants} className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white shadow-lg shadow-emerald-200/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{currentTier.emoji}</span>
                    <span className="text-sm font-bold">{currentTier.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm font-bold">{englishAdventureLevel}</span>
                    <span className="text-white/60 text-xs">/150</span>
                  </div>
                </div>
                <Progress
                  value={(englishAdventureLevel / 150) * 100}
                  className="h-2 bg-white/20"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px] text-white/70">
                    {englishAdventureLevel >= 150 ? '🎉 全部通关！' : `下一关：第${englishAdventureLevel + 1}关`}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-white/70">
                    <ChevronRight className="w-3 h-3" />
                    {englishAdventureLevel >= 150 ? '已完成' : TIERS.find(t => englishAdventureLevel + 1 >= t.startFloor && englishAdventureLevel + 1 <= t.endFloor)?.name ?? ''}
                  </div>
                </div>
              </motion.div>

              {/* Tier Sections */}
              {TIERS.map((tier) => {
                const tierLevels = ADVENTURE_LEVELS.filter(
                  (l) => l.id >= tier.startFloor && l.id <= tier.endFloor
                );
                const tierCleared = englishAdventureLevel >= tier.endFloor;
                const tierStarted = englishAdventureLevel >= tier.startFloor;

                return (
                  <div key={tier.name}>
                    {/* Tier Header */}
                    <div className="flex items-center justify-between mb-2 px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{tier.emoji}</span>
                        <span className="text-xs font-bold text-gray-600">{tier.name}</span>
                        <span className="text-[10px] text-gray-400">
                          {tier.startFloor}-{tier.endFloor}
                        </span>
                      </div>
                      {tierCleared && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-none text-[10px] px-1.5 py-0">
                          ✓ 已通关
                        </Badge>
                      )}
                      {!tierStarted && (
                        <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                          <Lock className="w-3 h-3" />
                          未解锁
                        </span>
                      )}
                    </div>

                    {/* Level Grid */}
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                      {tierLevels.map((level) => {
                        const unlocked = englishAdventureLevel >= level.id - 1 || level.id === 1;
                        const stars = englishAdventureStars[level.id] ?? 0;

                        return (
                          <motion.button
                            key={level.id}
                            whileTap={unlocked ? { scale: 0.9 } : {}}
                            onClick={() => handleStartLevel(level)}
                            disabled={!unlocked}
                            className={`relative flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl border transition-all ${
                              level.isBoss
                                ? unlocked
                                  ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-sm hover:shadow-md hover:border-amber-300 active:scale-95'
                                  : 'bg-gray-50 border-gray-100 opacity-40 cursor-not-allowed'
                                : unlocked
                                  ? 'bg-white border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-300 active:scale-95'
                                  : 'bg-gray-50 border-gray-100 opacity-40 cursor-not-allowed'
                            }`}
                          >
                            {/* Level Number / Lock */}
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                              level.isBoss
                                ? unlocked
                                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                                  : 'bg-gray-200 text-gray-400'
                                : unlocked
                                  ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'
                                  : 'bg-gray-200 text-gray-400'
                            }`}>
                              {unlocked ? level.id : <Lock className="w-2.5 h-2.5" />}
                            </div>

                            {/* Emoji */}
                            <span className="text-base leading-none">{unlocked ? level.emoji : '🔒'}</span>

                            {/* Boss label */}
                            {level.isBoss && unlocked && (
                              <span className="text-[8px] font-bold text-amber-600 leading-none">BOSS</span>
                            )}

                            {/* Stars */}
                            {unlocked && stars > 0 && (
                              <div className="flex gap-px">
                                {[1, 2, 3].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-2 h-2 ${s <= stars ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                                  />
                                ))}
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-200/60'
                    : 'bg-gradient-to-r from-teal-400 to-emerald-500 shadow-teal-200/60'
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
