'use client';

import { useState, useMemo, useCallback } from 'react';
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
  ChevronDown,
  Settings,
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { ALL_ENGLISH_MODES, type EnglishMode, type EnglishGrade } from '@/lib/english-utils';
import { getGradeLabel } from '@/lib/curriculum-config';
import { playClickSound, resumeAudioContext } from '@/lib/sound';
import { cn } from '@/lib/utils';

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
  tierName: string;
  tierEmoji: string;
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

const TOTAL_FLOORS = 150;

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
        tierName: tier.name,
        tierEmoji: tier.emoji,
      });
    }
  }
  return levels;
}

// ─── Animation ──────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const tabContentVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 30 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: -direction * 30 }),
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function EnglishHome() {
  const {
    setCurrentView, totalStars, streak,
    englishAdventureLevel, englishAdventureStars, englishSpeedTimeLimit,
    setEnglishSpeedTimeLimit,
    selectedEnglishGrade,
    selectedEnglishSemester,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<EnglishTab>('free');
  const [selectedMode, setSelectedMode] = useState<EnglishMode>('word-picture');
  const [selectedGrade, setSelectedGrade] = useState<EnglishGrade>(() =>
    selectedEnglishGrade > 0 ? (selectedEnglishGrade as EnglishGrade) : 1
  );
  const [selectedCount, setSelectedCount] = useState(10);
  const [speedMode, setSpeedMode] = useState<EnglishMode>('word-picture');
  const [tabDirection, setTabDirection] = useState(0);

  // ── Grade-based auto-match logic ──
  const englishGradeSet = selectedEnglishGrade > 0;
  const effectiveGrade = englishGradeSet ? (selectedEnglishGrade as EnglishGrade) : selectedGrade;

  // ── Adventure computed values ──
  const ALL_LEVELS = useMemo(() => generateAdventureLevels(), []);

  const highestCompletedFloor = useMemo(() => {
    return Object.entries(englishAdventureStars)
      .filter(([, stars]) => stars >= 1)
      .reduce((max, [floor]) => Math.max(max, Number(floor)), 0);
  }, [englishAdventureStars]);

  const nextFloor = Math.min(highestCompletedFloor + 1, TOTAL_FLOORS);
  const isFloorUnlocked = useCallback(
    (floor: number) => floor <= nextFloor,
    [nextFloor]
  );

  const totalAdventureStars = useMemo(
    () => Object.values(englishAdventureStars).reduce((sum, s) => sum + s, 0),
    [englishAdventureStars]
  );

  // ── Auto-expand the tier containing the next floor ──
  const [expandedTiers, setExpandedTiers] = useState<Set<string>>(() => {
    const highest = Object.entries(englishAdventureStars)
      .filter(([, s]) => s >= 1)
      .reduce((max, [f]) => Math.max(max, Number(f)), 0);
    const next = highest + 1;
    const tier = TIERS.find(
      (t) => next >= t.startFloor && next <= t.endFloor
    );
    return tier ? new Set([tier.name]) : new Set([TIERS[0].name]);
  });

  // ── Handlers ──
  const handleBack = () => { playClickSound(); setCurrentView('home'); };
  const handleHelp = () => { playClickSound(); setCurrentView('help'); };

  const handleTabSwitch = (tab: EnglishTab) => {
    const tabIndex = TABS.findIndex((t) => t.key === tab);
    const currentIndex = TABS.findIndex((t) => t.key === activeTab);
    setTabDirection(tabIndex > currentIndex ? 1 : -1);
    setActiveTab(tab);
    playClickSound();
  };

  const handleFreeStart = () => {
    playClickSound();
    resumeAudioContext();
    setEnglishPlayConfig({ mode: selectedMode, grade: effectiveGrade, count: selectedCount, isSpeed: false, isAdventure: false });
    setCurrentView('english-play');
  };

  const handleSpeedStart = () => {
    playClickSound();
    resumeAudioContext();
    setEnglishPlayConfig({ mode: speedMode, grade: effectiveGrade, count: 50, isSpeed: true, speedTimeLimit: englishSpeedTimeLimit });
    setCurrentView('english-play');
  };

  const handleStartLevel = (level: EnglishAdventureLevel) => {
    if (!isFloorUnlocked(level.id)) return;
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

  const handleContinueAdventure = () => {
    const level = ALL_LEVELS.find((l) => l.id === nextFloor);
    if (level) handleStartLevel(level);
  };

  const toggleTier = (tierName: string) => {
    playClickSound();
    setExpandedTiers((prev) => {
      const next = new Set(prev);
      if (next.has(tierName)) {
        next.delete(tierName);
      } else {
        next.add(tierName);
      }
      return next;
    });
  };

  const handleGoSettings = () => { playClickSound(); setCurrentView('settings'); };

  // ── Render helpers ──
  const renderFreeTab = () => (
    <div className="space-y-5">
      {/* Grade-matched info banner (replaces grade selector when grade is set) */}
      {englishGradeSet && (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/60 rounded-xl px-3.5 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base flex-shrink-0">📚</span>
            <span className="text-xs text-emerald-800 font-medium truncate">
              当前题库：{getGradeLabel(selectedEnglishGrade as 1|2|3|4|5|6, selectedEnglishSemester as '上册'|'下册')}
            </span>
          </div>
          <button
            onClick={handleGoSettings}
            className="flex items-center gap-0.5 shrink-0 text-xs text-emerald-600 hover:text-emerald-800 font-medium transition-colors active:scale-95 ml-2"
          >
            <Settings className="w-3 h-3" />
            去设置
          </button>
        </div>
      )}

      {/* Mode Selection — 2x2 compact grid */}
      <div>
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
      </div>

      {/* Grade Selection — hidden when grade is set */}
      {!englishGradeSet && (
        <div>
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
        </div>
      )}

      {/* Question Count */}
      <div>
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
      </div>
    </div>
  );

  const renderSpeedTab = () => (
    <div className="space-y-5">
      {/* Time Selection */}
      <div>
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
      </div>

      {/* Mode Selection for Speed */}
      <div>
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
      </div>

      {/* Rules hint */}
      <div className="bg-teal-50 border border-teal-100 rounded-xl p-3">
        <p className="text-xs text-teal-700 leading-relaxed">
          ⏱️ 在限定时间内尽量多答题，答对自动跳题，限时挑战金币奖励×1.5！
        </p>
      </div>
    </div>
  );

  const renderAdventureTab = () => {
    const progressPercent = (highestCompletedFloor / TOTAL_FLOORS) * 100;

    return (
      <div className="space-y-4">
        {/* Progress Banner */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 rounded-2xl p-4 border border-emerald-200/60">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-semibold text-emerald-600/70">闯关进度</p>
              <p className="text-xl font-bold text-emerald-800">
                第 {highestCompletedFloor > 0 ? highestCompletedFloor : 0} 层
                <span className="text-sm font-normal text-emerald-500 ml-1">/ {TOTAL_FLOORS}</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 bg-white/70 rounded-full px-2 py-0.5">
                <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-700">{totalAdventureStars}</span>
              </div>
              {highestCompletedFloor > 0 && (
                <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0">
                  下层: {nextFloor}
                </Badge>
              )}
            </div>
          </div>
          <Progress value={progressPercent} className="h-2 bg-emerald-200/50" />
          <p className="text-[10px] text-emerald-600/60 mt-1.5">
            {highestCompletedFloor === 0
              ? '🌱 开始你的英语冒险之旅吧！'
              : highestCompletedFloor >= 150
                ? '🌟 恭喜通关全部关卡！'
                : `距离下一层还有 ${nextFloor} 层，继续加油！`}
          </p>
        </div>

        {/* Quick Continue Button */}
        {nextFloor <= TOTAL_FLOORS && (
          <Button
            onClick={handleContinueAdventure}
            className="w-full h-12 text-base font-bold bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-0 shadow-lg shadow-emerald-200/60 hover:shadow-xl hover:shadow-emerald-200/80 transition-shadow active:scale-[0.98]"
          >
            <Play className="w-5 h-5 mr-2" />
            {highestCompletedFloor === 0 ? '开始冒险' : `挑战第 ${nextFloor} 层`}
          </Button>
        )}

        {/* Tier Sections */}
        <div className="space-y-2">
          {TIERS.map((tier) => {
            const isExpanded = expandedTiers.has(tier.name);
            const tierFloors = ALL_LEVELS.filter((l) => l.tierName === tier.name);
            const completedInTier = tierFloors.filter(
              (l) => (englishAdventureStars[l.id] ?? 0) >= 1
            ).length;
            const totalInTier = tier.endFloor - tier.startFloor + 1;
            const isFullyLocked = nextFloor < tier.startFloor;
            const isFullyCompleted = completedInTier === totalInTier;
            const isCurrentTier =
              nextFloor >= tier.startFloor && nextFloor <= tier.endFloor;
            const hasBossFloor = tierFloors.some((l) => l.isBoss);

            return (
              <div
                key={tier.name}
                className={cn(
                  'bg-white rounded-xl border overflow-hidden transition-all',
                  isCurrentTier
                    ? 'border-emerald-200 shadow-sm shadow-emerald-100/50'
                    : isFullyCompleted
                      ? 'border-emerald-100'
                      : 'border-gray-100'
                )}
              >
                {/* Tier Header */}
                <button
                  onClick={() => toggleTier(tier.name)}
                  className="w-full flex items-center justify-between px-3 py-3 text-left active:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg flex-shrink-0">{tier.emoji}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-gray-800 truncate">
                          {tier.name}
                        </span>
                        {hasBossFloor && (
                          <span className="text-xs">👑</span>
                        )}
                        {isFullyCompleted && (
                          <span className="text-[10px] text-emerald-500 font-medium">✓</span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400">
                        第{tier.startFloor}-{tier.endFloor}层
                        {!isFullyLocked && ` · ${completedInTier}/${totalInTier}`}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2',
                      isExpanded && 'rotate-180'
                    )}
                  />
                </button>

                {/* Tier Body (Collapsible) */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key={`${tier.name}-body`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="px-3 pb-3">
                        {/* Mini progress bar */}
                        {!isFullyLocked && totalInTier > 0 && (
                          <div className="mb-2.5">
                            <Progress
                              value={(completedInTier / totalInTier) * 100}
                              className={cn(
                                'h-1',
                                isFullyCompleted
                                  ? 'bg-emerald-100'
                                  : 'bg-gray-100'
                              )}
                            />
                          </div>
                        )}

                        {/* Floor badges */}
                        <div className="flex flex-wrap gap-1.5">
                          {tierFloors.map((floor) => {
                            const unlocked = isFloorUnlocked(floor.id);
                            const stars = englishAdventureStars[floor.id] ?? 0;
                            const completed = stars >= 1;
                            const isCurrent = floor.id === nextFloor;
                            const bossFloor = floor.isBoss;

                            return (
                              <button
                                key={floor.id}
                                onClick={() => handleStartLevel(floor)}
                                disabled={!unlocked}
                                className={cn(
                                  'relative flex-shrink-0 w-[42px] h-[42px] rounded-xl flex items-center justify-center text-sm font-bold transition-all',
                                  unlocked && 'active:scale-90 cursor-pointer',
                                  !unlocked && 'cursor-not-allowed',
                                  // Locked
                                  !unlocked && 'bg-gray-50 text-gray-300',
                                  // Unlocked but not completed and not current
                                  unlocked && !completed && !isCurrent && 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300',
                                  // Current floor (pulsing highlight)
                                  isCurrent && 'bg-white border-2 border-emerald-400 text-emerald-600 shadow-md shadow-emerald-200/60 ring-2 ring-emerald-200/40',
                                  // Completed 3 stars
                                  completed && stars === 3 && !isCurrent && 'bg-emerald-50 border border-emerald-200 text-emerald-700',
                                  // Completed 1-2 stars
                                  completed && stars > 0 && stars < 3 && !isCurrent && 'bg-amber-50 border border-amber-200 text-amber-700',
                                  // Boss floor accent
                                  bossFloor && unlocked && !isCurrent && 'ring-1 ring-amber-300'
                                )}
                                title={
                                  !unlocked
                                    ? `需要先通过第${floor.id - 1}层`
                                    : `${floor.name}`
                                }
                              >
                                {/* Boss crown badge */}
                                {bossFloor && unlocked && (
                                  <span className="absolute -top-2 -right-1 text-[10px] leading-none drop-shadow-sm">
                                    👑
                                  </span>
                                )}

                                {/* Floor number or lock */}
                                {unlocked ? (
                                  <span className={cn(
                                    'text-[13px]',
                                    bossFloor && 'font-black'
                                  )}>
                                    {floor.id}
                                  </span>
                                ) : (
                                  <Lock className="w-3.5 h-3.5" />
                                )}

                                {/* Star count badge for completed floors */}
                                {completed && (
                                  <span className={cn(
                                    'absolute -bottom-1 -right-1 rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-black shadow-sm border',
                                    stars === 3
                                      ? 'bg-emerald-500 text-white border-emerald-400'
                                      : 'bg-amber-400 text-white border-amber-300'
                                  )}>
                                    {stars}
                                  </span>
                                )}

                                {/* Current floor pulse indicator */}
                                {isCurrent && (
                                  <span className="absolute inset-0 rounded-xl animate-ping bg-emerald-200/30 pointer-events-none" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Spacer for bottom button area */}
        <div className="h-8" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50/30 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 pb-5 text-white">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button onClick={handleBack} className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors active:scale-95">
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
                onClick={() => handleTabSwitch(tab.key)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
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

        {/* Tab Content - Single animated wrapper for reliable switching */}
        <AnimatePresence mode="wait" custom={tabDirection}>
          <motion.div
            key={activeTab}
            custom={tabDirection}
            variants={tabContentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="mt-5"
          >
            {activeTab === 'free' && renderFreeTab()}
            {activeTab === 'speed' && renderSpeedTab()}
            {activeTab === 'adventure' && renderAdventureTab()}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Floating Start Button (Free / Speed only) ── */}
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
