'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Play,
  Star,
  BookOpen,
  Zap,
  Lock,
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { MODE_CONFIG, getModesForGrade, type ChineseMode, type ChineseGrade } from '@/lib/chinese-utils';
import { playClickSound, resumeAudioContext } from '@/lib/sound';

// ── Shared mutable config for ChinesePlay ──
let _chinesePlayConfig = {
  mode: 'recognize-pinyin' as ChineseMode,
  grade: 1 as ChineseGrade,
  count: 10,
  isSpeed: false,
  speedTimeLimit: 60,
  isAdventure: false,
  adventureFloor: 0,
};
export const chinesePlayConfig = _chinesePlayConfig;
export function setChinesePlayConfig(cfg: Partial<typeof _chinesePlayConfig>) {
  Object.assign(_chinesePlayConfig, cfg);
}

// ─── Types ──────────────────────────────────────────────────────────────────

type ChineseTab = 'free' | 'speed' | 'adventure';

interface ChineseAdventureLevel {
  id: number;
  name: string;
  emoji: string;
  modes: ChineseMode[];
  grades: ChineseGrade[];
  questionCount: number;
  isBoss: boolean;
}

// ─── Config ─────────────────────────────────────────────────────────────────

const TABS: { key: ChineseTab; label: string; emoji: string }[] = [
  { key: 'free', label: '自由练习', emoji: '✏️' },
  { key: 'speed', label: '限时挑战', emoji: '⚡' },
  { key: 'adventure', label: '闯关模式', emoji: '🗺️' },
];

const GRADES: { value: ChineseGrade; label: string }[] = [
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

// Speed mode only supports these Chinese modes
const SPEED_MODES: ChineseMode[] = ['recognize-char', 'recognize-pinyin', 'word-match', 'dictation'];

// ─── Adventure Tiers ────────────────────────────────────────────────────────

interface AdventureTier {
  name: string;
  startFloor: number;
  endFloor: number;
  grades: ChineseGrade[];
  modes: ChineseMode[];
  emoji: string;
}

const TIERS: AdventureTier[] = [
  { name: '识字启蒙', startFloor: 1, endFloor: 15, grades: [1], modes: ['recognize-char', 'recognize-pinyin'], emoji: '🌱' },
  { name: '拼音乐园', startFloor: 16, endFloor: 30, grades: [1, 2], modes: ['recognize-pinyin', 'word-match'], emoji: '📝' },
  { name: '词语世界', startFloor: 31, endFloor: 45, grades: [2, 3], modes: ['word-match', 'dictation'], emoji: '🧩' },
  { name: '听写达人', startFloor: 46, endFloor: 60, grades: [2, 3], modes: ['dictation'], emoji: '👂' },
  { name: '成语挑战', startFloor: 61, endFloor: 75, grades: [3, 4, 5], modes: ['idiom-fill'], emoji: '📚' },
  { name: '诗词大会', startFloor: 76, endFloor: 90, grades: [4, 5, 6], modes: ['poetry-fill'], emoji: '🌸' },
  { name: '词语大师', startFloor: 91, endFloor: 110, grades: [3, 4, 5, 6], modes: ['antonym', 'synonym', 'idiom-fill'], emoji: '🎓' },
  { name: '语文传奇', startFloor: 111, endFloor: 150, grades: [4, 5, 6], modes: ['poetry-fill', 'antonym', 'synonym'], emoji: '👑' },
];

// Level names per tier for variety
const LEVEL_NAMES: Record<string, string[]> = {
  '识字启蒙': ['认一认', '学一学', '读一读', '写一写', '看一看'],
  '拼音乐园': ['声母关', '韵母关', '整体关', '拼读关', '连读关'],
  '词语世界': ['词语配对', '组词达人', '词语接龙', '词语理解', '词语运用'],
  '听写达人': ['基础听写', '进阶听写', '词语听写', '短句听写', '终极听写'],
  '成语挑战': ['成语入门', '成语进阶', '成语高手', '成语达人', '成语大师'],
  '诗词大会': ['古诗初识', '古诗品读', '古诗背诵', '古诗理解', '古诗鉴赏'],
  '词语大师': ['反义词汇', '近义词汇', '成语运用', '综合练习', '高级挑战'],
  '语文传奇': ['诗词巅峰', '词语精通', '全面考核', '大师之路', '传奇终章'],
};

// Generate 150 adventure levels
function generateAdventureLevels(): ChineseAdventureLevel[] {
  const levels: ChineseAdventureLevel[] = [];

  for (const tier of TIERS) {
    const names = LEVEL_NAMES[tier.name] ?? [];
    const count = tier.endFloor - tier.startFloor + 1;

    for (let i = 0; i < count; i++) {
      const floor = tier.startFloor + i;
      const isBoss = floor % 25 === 0;
      const tierProgress = i / count; // 0..1

      // Question count ramps up within tier, boss levels get more
      let questionCount: number;
      if (isBoss) {
        questionCount = 15;
      } else if (tierProgress < 0.3) {
        questionCount = 5;
      } else if (tierProgress < 0.6) {
        questionCount = 8;
      } else {
        questionCount = 10;
      }

      // Pick mode: cycle through tier modes
      const modeIndex = i % tier.modes.length;
      const mode = tier.modes[modeIndex];

      // Pick grade: cycle through tier grades, later tiers use harder grades more
      const gradeIndex = Math.min(Math.floor(i / 5), tier.grades.length - 1);
      const grade = tier.grades[gradeIndex];

      // Pick name: cycle through tier names
      const nameIndex = i % names.length;
      const levelName = names[nameIndex] ?? `${tier.name} 第${i + 1}关`;

      levels.push({
        id: floor,
        name: isBoss ? `BOSS·${tier.name}` : levelName,
        emoji: isBoss ? '🐉' : tier.emoji,
        modes: [mode],
        grades: [grade],
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

export default function ChineseHome() {
  const {
    setCurrentView,
    totalStars,
    streak,
    chineseAdventureLevel,
    chineseAdventureStars,
    chineseSpeedTimeLimit,
    setChineseSpeedTimeLimit,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<ChineseTab>('free');

  // Free practice state
  const [selectedMode, setSelectedMode] = useState<ChineseMode>('recognize-pinyin');
  const [selectedGrade, setSelectedGrade] = useState<ChineseGrade>(1);
  const [selectedCount, setSelectedCount] = useState(10);

  // Speed challenge state
  const [speedMode, setSpeedMode] = useState<ChineseMode>('recognize-pinyin');

  const availableModes = getModesForGrade(selectedGrade);
  const isModeAvailable = (mode: ChineseMode) => availableModes.some((m) => m.mode === mode);
  const activeMode = isModeAvailable(selectedMode) ? selectedMode : (availableModes[0]?.mode ?? 'recognize-char');

  const handleBack = () => { playClickSound(); setCurrentView('home'); };
  const handleHelp = () => { playClickSound(); setCurrentView('help'); };

  // ── Free Practice ──
  const handleFreeStart = () => {
    playClickSound();
    resumeAudioContext();
    setChinesePlayConfig({ mode: activeMode, grade: selectedGrade, count: selectedCount, isSpeed: false, speedTimeLimit: 60, isAdventure: false, adventureFloor: 0 });
    setCurrentView('chinese-play');
  };

  // ── Speed Challenge ──
  const handleSpeedStart = () => {
    playClickSound();
    resumeAudioContext();
    setChinesePlayConfig({ mode: speedMode, grade: selectedGrade, count: 50, isSpeed: true, speedTimeLimit: chineseSpeedTimeLimit, isAdventure: false, adventureFloor: 0 });
    setCurrentView('chinese-play');
  };

  // ── Adventure Mode ──
  const handleStartLevel = (level: ChineseAdventureLevel) => {
    if (chineseAdventureLevel < level.id - 1 && level.id > 1) return; // sequential unlock
    playClickSound();
    resumeAudioContext();
    setChinesePlayConfig({
      mode: level.modes[0] as ChineseMode,
      grade: level.grades[0] as ChineseGrade,
      count: level.questionCount,
      isSpeed: false,
      speedTimeLimit: 60,
      isAdventure: true,
      adventureFloor: level.id,
    });
    useGameStore.setState({
      lastGameSource: 'chinese-adventure',
      lastLevelName: level.name,
      lastLevelEmoji: level.emoji,
    });
    setCurrentView('chinese-play');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-orange-50/30 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-orange-500 px-4 pb-5 text-white">
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
              <h1 className="text-2xl font-bold">📖 语文乐园</h1>
              <p className="text-white/80 text-xs mt-0.5">识字拼音，趣味学习</p>
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
                    ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.emoji} {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ═══════════════════ Free Practice ═══════════════════ */}
          {activeTab === 'free' && (
            <motion.div key="free" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="mt-5 space-y-5">
              {/* Mode Selection — 2-row compact grid */}
              <motion.div variants={itemVariants}>
                <p className="text-xs font-semibold text-gray-400 mb-2 px-1">练习模式</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.values(MODE_CONFIG) as typeof MODE_CONFIG[ChineseMode][]).map((modeConfig) => {
                    const available = isModeAvailable(modeConfig.mode);
                    const isSelected = activeMode === modeConfig.mode;
                    return (
                      <button
                        key={modeConfig.mode}
                        onClick={() => { if (available) { setSelectedMode(modeConfig.mode); playClickSound(); } }}
                        disabled={!available}
                        className={`flex items-center gap-2 py-3 px-3 rounded-xl text-left transition-all active:scale-95 ${
                          !available
                            ? 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100'
                            : isSelected
                              ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm'
                              : 'bg-white text-gray-700 shadow-sm border border-gray-100 hover:border-rose-200'
                        }`}
                      >
                        <span className="text-lg">{modeConfig.emoji}</span>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${!available ? 'text-gray-300' : ''}`}>
                            {modeConfig.name}
                          </p>
                          {!available && (
                            <p className="text-[10px] text-gray-300">{modeConfig.minGrade}年级+</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Grade Selection — horizontal scroll */}
              <motion.div variants={itemVariants}>
                <p className="text-xs font-semibold text-gray-400 mb-2 px-1">选择年级</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {GRADES.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => { setSelectedGrade(g.value); playClickSound(); }}
                      className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 ${
                        selectedGrade === g.value
                          ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm'
                          : 'bg-white text-gray-600 shadow-sm border border-gray-100 hover:border-rose-200'
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
                          ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm'
                          : 'bg-white text-gray-600 shadow-sm border border-gray-100 hover:border-rose-200'
                      }`}
                    >
                      {c}题
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ═══════════════════ Speed Challenge ═══════════════════ */}
          {activeTab === 'speed' && (
            <motion.div key="speed" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="mt-5 space-y-5">
              {/* Time Selection */}
              <motion.div variants={itemVariants}>
                <p className="text-xs font-semibold text-gray-400 mb-2 px-1">挑战时长</p>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => { setChineseSpeedTimeLimit(t.value); playClickSound(); }}
                      className={`flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                        chineseSpeedTimeLimit === t.value
                          ? 'bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-sm'
                          : 'bg-white text-gray-600 shadow-sm border border-gray-100 hover:border-rose-200'
                      }`}
                    >
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Speed Mode Selection */}
              <motion.div variants={itemVariants}>
                <p className="text-xs font-semibold text-gray-400 mb-2 px-1">练习模式</p>
                <div className="grid grid-cols-2 gap-2">
                  {SPEED_MODES.map((mode) => {
                    const modeConfig = MODE_CONFIG[mode];
                    const isSelected = speedMode === mode;
                    return (
                      <button
                        key={mode}
                        onClick={() => { setSpeedMode(mode); playClickSound(); }}
                        className={`flex items-center gap-2 py-3 px-3 rounded-xl text-left transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-sm'
                            : 'bg-white text-gray-700 shadow-sm border border-gray-100 hover:border-rose-200'
                        }`}
                      >
                        <span className="text-lg">{modeConfig.emoji}</span>
                        <span className="text-xs font-bold">{modeConfig.name}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Rules hint card */}
              <motion.div variants={itemVariants} className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                <p className="text-xs text-rose-700 leading-relaxed">
                  ⏱️ 在限定时间内尽量多答题，答对自动跳题，限时挑战金币奖励×1.5！
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* ═══════════════════ Adventure Mode ═══════════════════ */}
          {activeTab === 'adventure' && (
            <motion.div key="adventure" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="mt-5">
              {/* Progress Banner */}
              <motion.div variants={itemVariants} className="bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl p-4 mb-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">🗺️ 语文闯关之旅</p>
                    <p className="text-xs text-white/80 mt-0.5">
                      已通过 <span className="font-bold text-white">{chineseAdventureLevel}</span> / {ADVENTURE_LEVELS.length} 关
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                    <Star className="w-3.5 h-3.5 fill-white" />
                    <span className="text-sm font-bold">{chineseAdventureLevel}</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/80 rounded-full transition-all duration-500"
                    style={{ width: `${(chineseAdventureLevel / ADVENTURE_LEVELS.length) * 100}%` }}
                  />
                </div>
              </motion.div>

              {/* Tier Sections */}
              <div className="space-y-5">
                {TIERS.map((tier) => {
                  const tierLevels = ADVENTURE_LEVELS.filter((l) => l.id >= tier.startFloor && l.id <= tier.endFloor);
                  return (
                    <div key={tier.name}>
                      {/* Tier Header */}
                      <div className="flex items-center justify-between mb-2 px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{tier.emoji}</span>
                          <span className="text-xs font-bold text-gray-600">{tier.name}</span>
                          <span className="text-[10px] text-gray-400">第{tier.startFloor}-{tier.endFloor}关</span>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {tierLevels.filter((l) => chineseAdventureLevel >= l.id).length}/{tierLevels.length} ✓
                        </span>
                      </div>

                      {/* Floor Grid */}
                      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                        {tierLevels.map((level) => {
                          const unlocked = chineseAdventureLevel >= level.id - 1 || level.id === 1;
                          const completed = chineseAdventureLevel >= level.id;
                          const stars = chineseAdventureStars[level.id] ?? 0;

                          return (
                            <motion.button
                              key={level.id}
                              whileTap={unlocked ? { scale: 0.88 } : {}}
                              onClick={() => handleStartLevel(level)}
                              disabled={!unlocked}
                              className={`relative flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border-2 transition-all min-h-[52px] sm:min-h-[60px] ${
                                level.isBoss && unlocked
                                  ? 'bg-gradient-to-br from-rose-50 to-orange-50 border-rose-300 shadow-sm'
                                  : completed
                                    ? 'bg-emerald-50 border-emerald-200'
                                    : unlocked
                                      ? 'bg-white border-rose-100 shadow-sm hover:border-rose-300 hover:shadow-md'
                                      : 'bg-gray-50 border-gray-100 opacity-40 cursor-not-allowed'
                              }`}
                            >
                              {/* Floor number */}
                              <span className={`text-[10px] font-bold ${
                                completed
                                  ? 'text-emerald-600'
                                  : unlocked
                                    ? level.isBoss ? 'text-rose-600' : 'text-gray-600'
                                    : 'text-gray-300'
                              }`}>
                                {level.id}
                              </span>

                              {/* Emoji */}
                              <span className="text-sm sm:text-base leading-none mt-0.5">
                                {unlocked ? level.emoji : '🔒'}
                              </span>

                              {/* Stars for completed levels */}
                              {completed && stars > 0 && (
                                <div className="flex gap-px mt-0.5">
                                  {[1, 2, 3].map((s) => (
                                    <Star
                                      key={s}
                                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${s <= stars ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
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
                    ? 'bg-gradient-to-r from-rose-500 to-orange-500 shadow-rose-200/60'
                    : 'bg-gradient-to-r from-red-500 to-rose-600 shadow-rose-300/60'
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
