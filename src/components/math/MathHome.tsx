'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  ChevronDown,
  Trophy,
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { playClickSound } from '@/lib/sound';
import { cn } from '@/lib/utils';
import type { Operation, Difficulty } from '@/lib/math-utils';

// ─── Types ──────────────────────────────────────────────────────────────────

type MathTab = 'free' | 'speed' | 'adventure';

interface AdventureLevel {
  id: number;
  name: string;
  emoji: string;
  operation: Operation;
  difficulty: Difficulty;
  questionCount: number;
  desc: string;
  isBoss: boolean;
  tierName: string;
  tierEmoji: string;
}

interface TierConfig {
  name: string;
  startFloor: number;
  endFloor: number;
  operations: Operation[];
  difficulty: Difficulty;
  emoji: string;
}

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

// ─── Adventure Tier & Level Generation ──────────────────────────────────────

const TIER_CONFIGS: TierConfig[] = [
  { name: '新手村', startFloor: 1, endFloor: 10, operations: ['add', 'subtract'], difficulty: 'easy', emoji: '🌱' },
  { name: '初学者平原', startFloor: 11, endFloor: 20, operations: ['add', 'subtract'], difficulty: 'easy', emoji: '🌿' },
  { name: '运算森林', startFloor: 21, endFloor: 30, operations: ['add', 'subtract', 'multiply'], difficulty: 'medium', emoji: '🌲' },
  { name: '乘除山谷', startFloor: 31, endFloor: 40, operations: ['multiply', 'divide'], difficulty: 'medium', emoji: '⛰️' },
  { name: '混合峡谷', startFloor: 41, endFloor: 50, operations: ['add', 'subtract', 'multiply', 'divide'], difficulty: 'medium', emoji: '🏔️' },
  { name: '比较之塔', startFloor: 51, endFloor: 60, operations: ['compare', 'mix'], difficulty: 'hard', emoji: '🏰' },
  { name: '速度风暴', startFloor: 61, endFloor: 70, operations: ['mix'], difficulty: 'hard', emoji: '⚡' },
  { name: '大师殿堂', startFloor: 71, endFloor: 80, operations: ['mix'], difficulty: 'hard', emoji: '🎓' },
  { name: '传奇深渊', startFloor: 81, endFloor: 100, operations: ['mix'], difficulty: 'hard', emoji: '🐉' },
  { name: '神话秘境', startFloor: 101, endFloor: 150, operations: ['mix'], difficulty: 'hard', emoji: '🌟' },
];

const TOTAL_FLOORS = 150;

function generateAdventureLevels(): AdventureLevel[] {
  const levels: AdventureLevel[] = [];

  for (const tier of TIER_CONFIGS) {
    for (let floor = tier.startFloor; floor <= tier.endFloor; floor++) {
      const questionCount = Math.min(5 + Math.floor(floor / 10) * 2, 20);
      const isBoss = floor % 25 === 0;
      const operationIndex = (floor - tier.startFloor) % tier.operations.length;
      const operation = tier.operations[operationIndex];

      levels.push({
        id: floor,
        name: isBoss ? `${tier.name}·BOSS` : `${tier.name}·第${floor}层`,
        emoji: isBoss ? '👑' : tier.emoji,
        operation,
        difficulty: tier.difficulty,
        questionCount,
        desc: `${tier.operations.join('/')} · ${questionCount}题`,
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

export default function MathHome() {
  const {
    totalStars, streak, adventureStars,
    selectedOperation, selectedDifficulty, speedTimeLimit, speedOperation,
    setSelectedOperation, setSelectedDifficulty, setSpeedTimeLimit, setSpeedOperation,
    setCurrentView, startMathSession, setAdventureLevel,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<MathTab>('free');
  const [questionCount, setQuestionCount] = useState(10);
  const [tabDirection, setTabDirection] = useState(0);

  // ── Adventure computed values ──
  const ALL_LEVELS = useMemo(() => generateAdventureLevels(), []);

  const highestCompletedFloor = useMemo(() => {
    return Object.entries(adventureStars)
      .filter(([, stars]) => stars >= 1)
      .reduce((max, [floor]) => Math.max(max, Number(floor)), 0);
  }, [adventureStars]);

  const nextFloor = Math.min(highestCompletedFloor + 1, TOTAL_FLOORS);
  const isFloorUnlocked = useCallback(
    (floor: number) => floor <= nextFloor,
    [nextFloor]
  );

  // Adventure stats
  const totalAdventureStars = useMemo(
    () => Object.values(adventureStars).reduce((sum, s) => sum + s, 0),
    [adventureStars]
  );

  // ── Auto-expand the tier containing the next floor (computed on mount) ──
  // Use a ref to track the initial tier so we don't need useEffect
  const [expandedTiers, setExpandedTiers] = useState<Set<string>>(() => {
    const highest = Object.entries(adventureStars)
      .filter(([, s]) => s >= 1)
      .reduce((max, [f]) => Math.max(max, Number(f)), 0);
    const next = highest + 1;
    const tier = TIER_CONFIGS.find(
      (t) => next >= t.startFloor && next <= t.endFloor
    );
    return tier ? new Set([tier.name]) : new Set([TIER_CONFIGS[0].name]);
  });

  // ── Handlers ──
  const handleBack = () => { playClickSound(); setCurrentView('home'); };
  const handleHelp = () => { playClickSound(); setCurrentView('help'); };

  const handleTabSwitch = (tab: MathTab) => {
    const tabIndex = TABS.findIndex((t) => t.key === tab);
    const currentIndex = TABS.findIndex((t) => t.key === activeTab);
    setTabDirection(tabIndex > currentIndex ? 1 : -1);
    setActiveTab(tab);
    playClickSound();
  };

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
    if (!isFloorUnlocked(level.id)) return;
    playClickSound();
    setSelectedOperation(level.operation);
    setSelectedDifficulty(level.difficulty);
    // Track highest attempted floor for achievements
    const currentMax = useGameStore.getState().adventureLevel;
    setAdventureLevel(Math.max(currentMax, level.id));
    useGameStore.setState({
      lastGameSource: 'math-adventure',
      lastLevelName: level.name,
      lastLevelEmoji: level.emoji,
    });
    startMathSession('adventure', level.operation, level.difficulty, level.questionCount);
    setCurrentView('playing');
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

  // ── Render helpers ──
  const renderFreeTab = () => (
    <div className="space-y-5">
      {/* Operations */}
      <div>
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
      </div>

      {/* Difficulty */}
      <div>
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
      </div>

      {/* Count */}
      <div>
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
      </div>
    </div>
  );

  const renderSpeedTab = () => (
    <div className="space-y-5">
      {/* Time */}
      <div>
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
      </div>

      {/* Operations */}
      <div>
        <p className="text-xs font-semibold text-gray-400 mb-2 px-1">运算类型</p>
        <div className="grid grid-cols-3 gap-2">
          {OPERATIONS.filter((o) => o.value !== 'compare').map((op) => (
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
      </div>

      {/* Rules hint */}
      <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
        <p className="text-xs text-rose-700 leading-relaxed">
          ⏱️ 在选定时间内尽量多答题，答对自动跳题，答错不跳但消耗时间
        </p>
      </div>
    </div>
  );

  const renderAdventureTab = () => {
    const progressPercent = (highestCompletedFloor / TOTAL_FLOORS) * 100;

    return (
      <div className="space-y-4">
        {/* Progress Banner */}
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-2xl p-4 border border-amber-200/60">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-semibold text-amber-600/70">闯关进度</p>
              <p className="text-xl font-bold text-amber-800">
                第 {highestCompletedFloor > 0 ? highestCompletedFloor : 0} 层
                <span className="text-sm font-normal text-amber-500 ml-1">/ {TOTAL_FLOORS}</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 bg-white/70 rounded-full px-2 py-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-amber-700">{totalAdventureStars}</span>
              </div>
              {highestCompletedFloor > 0 && (
                <Badge className="bg-amber-500/15 text-amber-700 border-amber-200 text-[10px] px-1.5 py-0">
                  下层: {nextFloor}
                </Badge>
              )}
            </div>
          </div>
          <Progress value={progressPercent} className="h-2 bg-amber-200/50" />
          <p className="text-[10px] text-amber-600/60 mt-1.5">
            {highestCompletedFloor === 0
              ? '🌱 开始你的冒险之旅吧！'
              : highestCompletedFloor >= 150
                ? '🌟 恭喜通关全部关卡！'
                : `距离下一层还有 ${nextFloor} 层，继续加油！`}
          </p>
        </div>

        {/* Quick Continue Button */}
        {nextFloor <= TOTAL_FLOORS && (
          <Button
            onClick={handleContinueAdventure}
            className="w-full h-12 text-base font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-lg shadow-amber-200/60 hover:shadow-xl hover:shadow-amber-200/80 transition-shadow active:scale-[0.98]"
          >
            <Play className="w-5 h-5 mr-2" />
            {highestCompletedFloor === 0 ? '开始冒险' : `挑战第 ${nextFloor} 层`}
          </Button>
        )}

        {/* Tier Sections */}
        <div className="space-y-2">
          {TIER_CONFIGS.map((tier) => {
            const isExpanded = expandedTiers.has(tier.name);
            const tierFloors = ALL_LEVELS.filter((l) => l.tierName === tier.name);
            const completedInTier = tierFloors.filter(
              (l) => (adventureStars[l.id] ?? 0) >= 1
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
                    ? 'border-orange-200 shadow-sm shadow-orange-100/50'
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
                            const stars = adventureStars[floor.id] ?? 0;
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
                                  isCurrent && 'bg-white border-2 border-orange-400 text-orange-600 shadow-md shadow-orange-200/60 ring-2 ring-orange-200/40',
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
                                    : `${floor.name} (${floor.desc})`
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
                                  <span className="absolute inset-0 rounded-xl animate-ping bg-orange-200/30 pointer-events-none" />
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
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-amber-50 via-orange-50/30 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 pb-5 text-white">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
            <button
              onClick={handleHelp}
              className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white/90 hover:bg-white/30 transition-colors active:scale-95"
            >
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
                onClick={() => handleTabSwitch(tab.key)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
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
