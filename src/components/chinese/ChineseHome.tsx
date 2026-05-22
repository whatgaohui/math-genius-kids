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
  BookOpen,
  Zap,
  Lock,
  ChevronDown,
  Settings,
  Target,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { MODE_CONFIG, getModesForGrade, type ChineseMode, type ChineseGrade } from '@/lib/chinese-utils';
import { getGradeLabel } from '@/lib/curriculum-config';
import { playClickSound, resumeAudioContext } from '@/lib/sound';
import { cn } from '@/lib/utils';
import BottomNav from '@/components/math/BottomNav';

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

const TABS: { key: ChineseTab; label: string; emoji: string; color: string; desc: string }[] = [
  { key: 'free', label: '自由练习', emoji: '✏️', color: 'rose', desc: '按自己的节奏练习' },
  { key: 'speed', label: '限时挑战', emoji: '⚡', color: 'amber', desc: '在限时内答对更多' },
  { key: 'adventure', label: '闯关模式', emoji: '🗺️', color: 'emerald', desc: '逐层挑战冒险' },
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

const TOTAL_FLOORS = 150;

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
      const tierProgress = i / count;

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

      const modeIndex = i % tier.modes.length;
      const mode = tier.modes[modeIndex];

      const gradeIndex = Math.min(Math.floor(i / 5), tier.grades.length - 1);
      const grade = tier.grades[gradeIndex];

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

// ─── Floating emoji animation ──────────────────────────────────────────────

function FloatingEmoji({ emoji, className }: { emoji: string; className?: string }) {
  return (
    <motion.span
      className={className}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {emoji}
    </motion.span>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ChineseHome() {
  const {
    setCurrentView,
    totalStars,
    streak,
    practiceHistory,
    chineseAdventureLevel,
    chineseAdventureStars,
    chineseSpeedTimeLimit,
    setChineseSpeedTimeLimit,
    selectedChineseGrade,
    selectedChineseSemester,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<ChineseTab>('free');
  const [tabDirection, setTabDirection] = useState(0);

  // ── Grade-based auto-match logic ──
  const chineseGradeSet = selectedChineseGrade > 0;

  // Free practice state
  const [selectedMode, setSelectedMode] = useState<ChineseMode>('recognize-pinyin');
  const [selectedGrade, setSelectedGrade] = useState<ChineseGrade>(() =>
    chineseGradeSet ? (selectedChineseGrade as ChineseGrade) : 1
  );
  const [selectedCount, setSelectedCount] = useState(10);

  // Auto-update grade when store changes
  const effectiveGrade = chineseGradeSet ? (selectedChineseGrade as ChineseGrade) : selectedGrade;

  // Speed challenge state
  const [speedMode, setSpeedMode] = useState<ChineseMode>('recognize-pinyin');

  // ── Practice stats ──
  const chineseSessions = useMemo(() => {
    return practiceHistory.filter((r) => r.subject === 'chinese').length;
  }, [practiceHistory]);

  const bestAccuracy = useMemo(() => {
    const chineseRecords = practiceHistory.filter((r) => r.subject === 'chinese' && r.total > 0);
    if (chineseRecords.length === 0) return 0;
    return Math.round(Math.max(...chineseRecords.map((r) => (r.correct / r.total) * 100)));
  }, [practiceHistory]);

  const lastChineseMode = useMemo(() => {
    const chineseRecords = practiceHistory.filter((r) => r.subject === 'chinese');
    if (chineseRecords.length === 0) return null;
    return chineseRecords[0].mode as ChineseTab;
  }, [practiceHistory]);

  // ── Adventure computed values ──
  const ALL_LEVELS = useMemo(() => generateAdventureLevels(), []);

  const highestCompletedFloor = useMemo(() => {
    return Object.entries(chineseAdventureStars)
      .filter(([, stars]) => stars >= 1)
      .reduce((max, [floor]) => Math.max(max, Number(floor)), 0);
  }, [chineseAdventureStars]);

  const nextFloor = Math.min(highestCompletedFloor + 1, TOTAL_FLOORS);
  const isFloorUnlocked = useCallback(
    (floor: number) => floor <= nextFloor,
    [nextFloor]
  );

  const totalAdventureStars = useMemo(
    () => Object.values(chineseAdventureStars).reduce((sum, s) => sum + s, 0),
    [chineseAdventureStars]
  );

  // ── Auto-expand the tier containing the next floor ──
  const [expandedTiers, setExpandedTiers] = useState<Set<string>>(() => {
    const highest = Object.entries(chineseAdventureStars)
      .filter(([, s]) => s >= 1)
      .reduce((max, [f]) => Math.max(max, Number(f)), 0);
    const next = highest + 1;
    const tier = TIERS.find(
      (t) => next >= t.startFloor && next <= t.endFloor
    );
    return tier ? new Set([tier.name]) : new Set([TIERS[0].name]);
  });

  const availableModes = getModesForGrade(effectiveGrade);
  const isModeAvailable = (mode: ChineseMode) => availableModes.some((m) => m.mode === mode);
  const activeMode = isModeAvailable(selectedMode) ? selectedMode : (availableModes[0]?.mode ?? 'recognize-char');
  const activeSpeedMode = isModeAvailable(speedMode) ? speedMode : (availableModes[0]?.mode ?? 'recognize-char');

  // ── Handlers ──
  const handleBack = () => { playClickSound(); setCurrentView('home'); };
  const handleHelp = () => { playClickSound(); setCurrentView('help'); };

  const handleTabSwitch = (tab: ChineseTab) => {
    const tabIndex = TABS.findIndex((t) => t.key === tab);
    const currentIndex = TABS.findIndex((t) => t.key === activeTab);
    setTabDirection(tabIndex > currentIndex ? 1 : -1);
    setActiveTab(tab);
    playClickSound();
  };

  // ── Free Practice ──
  const handleFreeStart = () => {
    playClickSound();
    resumeAudioContext();
    setChinesePlayConfig({ mode: activeMode, grade: effectiveGrade, count: selectedCount, isSpeed: false, speedTimeLimit: 60, isAdventure: false, adventureFloor: 0 });
    setCurrentView('chinese-play');
  };

  // ── Speed Challenge ──
  const handleSpeedStart = () => {
    playClickSound();
    resumeAudioContext();
    setChinesePlayConfig({ mode: activeSpeedMode, grade: effectiveGrade, count: 50, isSpeed: true, speedTimeLimit: chineseSpeedTimeLimit, isAdventure: false, adventureFloor: 0 });
    setCurrentView('chinese-play');
  };

  // ── Adventure Mode ──
  const handleStartLevel = (level: ChineseAdventureLevel) => {
    if (!isFloorUnlocked(level.id)) return;
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

  // ── Quick Start handler ──
  const handleQuickStart = () => {
    playClickSound();
    resumeAudioContext();
    const mode = lastChineseMode || 'free';
    if (mode === 'free') {
      setChinesePlayConfig({ mode: activeMode, grade: effectiveGrade, count: selectedCount, isSpeed: false, speedTimeLimit: 60, isAdventure: false, adventureFloor: 0 });
      setCurrentView('chinese-play');
    } else if (mode === 'speed') {
      setChinesePlayConfig({ mode: activeSpeedMode, grade: effectiveGrade, count: 50, isSpeed: true, speedTimeLimit: chineseSpeedTimeLimit, isAdventure: false, adventureFloor: 0 });
      setCurrentView('chinese-play');
    } else if (mode === 'adventure') {
      const level = ALL_LEVELS.find((l) => l.id === nextFloor);
      if (level) handleStartLevel(level);
    }
  };

  // ── Render helpers ──
  const renderFreeTab = () => (
    <div className="space-y-5">
      {/* Grade-matched info banner (replaces grade selector when grade is set) */}
      {chineseGradeSet && (
        <div className="flex items-center justify-between bg-rose-50 border border-rose-200/60 rounded-xl px-3.5 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base flex-shrink-0">📚</span>
            <span className="text-xs text-rose-800 font-medium truncate">
              当前题库：{getGradeLabel(selectedChineseGrade as 1|2|3|4|5|6, selectedChineseSemester as '上册'|'下册')}
            </span>
          </div>
          <button
            onClick={handleGoSettings}
            className="flex items-center gap-0.5 shrink-0 text-xs text-rose-600 hover:text-rose-800 font-medium transition-colors active:scale-95 ml-2"
          >
            <Settings className="w-3 h-3" />
            去设置
          </button>
        </div>
      )}

      {/* Mode Selection — 2-row compact grid */}
      <div>
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
                      ? 'bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow-sm'
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
      </div>

      {/* Grade Selection — hidden when grade is set */}
      {!chineseGradeSet && (
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-2 px-1">选择年级</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {GRADES.map((g) => (
              <button
                key={g.value}
                onClick={() => { setSelectedGrade(g.value); playClickSound(); }}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 ${
                  selectedGrade === g.value
                    ? 'bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow-sm'
                    : 'bg-white text-gray-600 shadow-sm border border-gray-100 hover:border-rose-200'
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
                  ? 'bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow-sm'
                  : 'bg-white text-gray-600 shadow-sm border border-gray-100 hover:border-rose-200'
              }`}
            >
              {c}题
            </button>
          ))}
        </div>
      </div>

      {/* Inline Start Button */}
      <div className="pt-2">
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            onClick={handleFreeStart}
            className="w-full h-14 text-base font-bold text-white border-0 shadow-lg bg-gradient-to-r from-rose-400 to-orange-500 shadow-rose-200/60"
          >
            <Play className="w-5 h-5 mr-2" /> 开始练习
          </Button>
        </motion.div>
      </div>
    </div>
  );

  const renderSpeedTab = () => (
    <div className="space-y-5">
      {/* Grade-matched info banner (replaces grade selector when grade is set) */}
      {chineseGradeSet && (
        <div className="flex items-center justify-between bg-rose-50 border border-rose-200/60 rounded-xl px-3.5 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base flex-shrink-0">📚</span>
            <span className="text-xs text-rose-800 font-medium truncate">
              当前题库：{getGradeLabel(selectedChineseGrade as 1|2|3|4|5|6, selectedChineseSemester as '上册'|'下册')}
            </span>
          </div>
          <button
            onClick={handleGoSettings}
            className="flex items-center gap-0.5 shrink-0 text-xs text-rose-600 hover:text-rose-800 font-medium transition-colors active:scale-95 ml-2"
          >
            <Settings className="w-3 h-3" />
            去设置
          </button>
        </div>
      )}

      {/* Time Selection */}
      <div>
        <p className="text-xs font-semibold text-gray-400 mb-2 px-1">挑战时长</p>
        <div className="grid grid-cols-2 gap-2">
          {TIME_OPTIONS.map((t) => (
            <button
              key={t.value}
              onClick={() => { setChineseSpeedTimeLimit(t.value); playClickSound(); }}
              className={`flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                chineseSpeedTimeLimit === t.value
                  ? 'bg-gradient-to-r from-red-400 to-rose-400 text-white shadow-sm'
                  : 'bg-white text-gray-600 shadow-sm border border-gray-100 hover:border-rose-200'
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Speed Mode Selection — same as free practice, filtered by grade */}
      <div>
        <p className="text-xs font-semibold text-gray-400 mb-2 px-1">练习模式</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.values(MODE_CONFIG) as typeof MODE_CONFIG[ChineseMode][]).map((modeConfig) => {
            const available = isModeAvailable(modeConfig.mode);
            const isSelected = activeSpeedMode === modeConfig.mode;
            return (
              <button
                key={modeConfig.mode}
                onClick={() => { if (available) { setSpeedMode(modeConfig.mode); playClickSound(); } }}
                disabled={!available}
                className={`flex items-center gap-2 py-3 px-3 rounded-xl text-left transition-all active:scale-95 ${
                  !available
                    ? 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100'
                    : isSelected
                      ? 'bg-gradient-to-r from-red-400 to-rose-400 text-white shadow-sm'
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
      </div>

      {/* Rules hint card */}
      <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
        <p className="text-xs text-rose-700 leading-relaxed">
          ⏱️ 在限定时间内尽量多答题，答对自动跳题，限时挑战金币奖励×1.5！
        </p>
      </div>

      {/* Inline Start Button */}
      <div className="pt-2">
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            onClick={handleSpeedStart}
            className="w-full h-14 text-base font-bold text-white border-0 shadow-lg bg-gradient-to-r from-red-400 to-rose-400 shadow-rose-200/60"
          >
            <Zap className="w-5 h-5 mr-2" /> 开始挑战
          </Button>
        </motion.div>
      </div>
    </div>
  );

  const renderAdventureTab = () => {
    const progressPercent = (highestCompletedFloor / TOTAL_FLOORS) * 100;

    return (
      <div className="space-y-4">
        {/* Progress Banner */}
        <div className="bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 rounded-2xl p-4 border border-rose-200/60">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-semibold text-rose-600/70">闯关进度</p>
              <p className="text-xl font-bold text-rose-800">
                第 {highestCompletedFloor > 0 ? highestCompletedFloor : 0} 层
                <span className="text-sm font-normal text-rose-500 ml-1">/ {TOTAL_FLOORS}</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 bg-white/70 rounded-full px-2 py-0.5">
                <Star className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                <span className="text-xs font-bold text-rose-700">{totalAdventureStars}</span>
              </div>
              {highestCompletedFloor > 0 && (
                <Badge className="bg-rose-500/15 text-rose-700 border-rose-200 text-[10px] px-1.5 py-0">
                  下层: {nextFloor}
                </Badge>
              )}
            </div>
          </div>
          <Progress value={progressPercent} className="h-2 bg-rose-200/50" />
          <p className="text-[10px] text-rose-600/60 mt-1.5">
            {highestCompletedFloor === 0
              ? '🌱 开始你的语文冒险之旅吧！'
              : highestCompletedFloor >= 150
                ? '🌟 恭喜通关全部关卡！'
                : `距离下一层还有 ${nextFloor} 层，继续加油！`}
          </p>
        </div>

        {/* Quick Continue Button */}
        {nextFloor <= TOTAL_FLOORS && (
          <Button
            onClick={handleContinueAdventure}
            className="w-full h-12 text-base font-bold bg-gradient-to-r from-rose-400 to-orange-500 text-white border-0 shadow-lg shadow-rose-200/60 hover:shadow-xl hover:shadow-rose-200/80 transition-shadow active:scale-[0.98]"
          >
            <Play className="w-5 h-5 mr-2" />
            {highestCompletedFloor === 0 ? '开始冒险' : `挑战第 ${nextFloor} 层`}
          </Button>
        )}

        {/* Tier Sections */}
        <div className="space-y-2">
          {TIERS.map((tier) => {
            const isExpanded = expandedTiers.has(tier.name);
            const tierFloors = ALL_LEVELS.filter((l) => l.id >= tier.startFloor && l.id <= tier.endFloor);
            const completedInTier = tierFloors.filter(
              (l) => (chineseAdventureStars[l.id] ?? 0) >= 1
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
                            const stars = chineseAdventureStars[floor.id] ?? 0;
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
                                  !unlocked && 'bg-gray-50 text-gray-300',
                                  unlocked && !completed && !isCurrent && 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300',
                                  isCurrent && 'bg-white border-2 border-orange-400 text-orange-600 shadow-md shadow-orange-200/60 ring-2 ring-orange-200/40',
                                  completed && stars === 3 && !isCurrent && 'bg-emerald-50 border border-emerald-200 text-emerald-700',
                                  completed && stars > 0 && stars < 3 && !isCurrent && 'bg-amber-50 border border-amber-200 text-amber-700',
                                  bossFloor && unlocked && !isCurrent && 'ring-1 ring-rose-300'
                                )}
                                title={
                                  !unlocked
                                    ? `需要先通过第${floor.id - 1}层`
                                    : `${floor.name}`
                                }
                              >
                                {bossFloor && unlocked && (
                                  <span className="absolute -top-2 -right-1 text-[10px] leading-none drop-shadow-sm">
                                    👑
                                  </span>
                                )}

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
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50/30 to-white relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-20 -left-20 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-60 -right-20 w-48 h-48 bg-pink-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-1/2 -translate-x-1/2 w-72 h-72 bg-rose-100/20 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle dot pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #f43f5e 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-4 pt-3 pb-5 text-white safe-top relative">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px, 60px 60px',
        }} />
        <div className="max-w-md mx-auto relative">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors active:scale-95 min-h-[44px]"
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
              <h1 className="text-2xl font-bold">
                <FloatingEmoji emoji="📖" className="inline-block mr-1" />
                语文天地
              </h1>
              <p className="text-white/80 text-xs mt-0.5">探索汉字的奥秘</p>
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
        className="max-w-md mx-auto px-4 pt-4 pb-28 relative"
      >
        {/* Practice Stats Summary */}
        {chineseSessions > 0 && (
          <motion.div variants={itemVariants} className="mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200/60 rounded-full px-3 py-1">
                <Target className="w-3 h-3 text-rose-500" />
                <span className="text-[11px] font-bold text-rose-700">{chineseSessions}次练习</span>
              </div>
              {bestAccuracy > 0 && (
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 rounded-full px-3 py-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-[11px] font-bold text-emerald-700">最高 {bestAccuracy}%</span>
                </div>
              )}
              {streak > 0 && (
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 rounded-full px-3 py-1">
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span className="text-[11px] font-bold text-amber-700">连续 {streak}天</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Quick Start Section */}
        <motion.div variants={itemVariants} className="mb-4">
          <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 rounded-2xl p-4 border border-rose-200/50 shadow-sm relative overflow-hidden">
            {/* Subtle dot pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'radial-gradient(circle, #f43f5e 1px, transparent 1px)',
              backgroundSize: '12px 12px',
            }} />
            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 shadow-sm">
                  <FloatingEmoji emoji={lastChineseMode === 'speed' ? '⚡' : lastChineseMode === 'adventure' ? '🗺️' : '✏️'} className="text-xl" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">快速开始</p>
                  <p className="text-[11px] text-gray-500">
                    {lastChineseMode === 'speed'
                      ? '继续限时挑战'
                      : lastChineseMode === 'adventure'
                        ? `继续闯关 第${nextFloor}层`
                        : '开始自由练习'}
                  </p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={handleQuickStart}
                className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-rose-200/50 active:shadow-sm transition-shadow"
              >
                <Play className="w-4 h-4" />
                {lastChineseMode ? '继续上次' : '开始练习'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Mode Cards Grid */}
        <motion.div variants={itemVariants} className="mb-4">
          <div className="grid grid-cols-3 gap-2">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const modeColorMap: Record<string, { bg: string; border: string; shadow: string; iconBg: string }> = {
                rose: { bg: 'from-rose-50 to-pink-50', border: 'border-rose-200', shadow: 'shadow-rose-100/50', iconBg: 'from-rose-100 to-pink-100' },
                amber: { bg: 'from-amber-50 to-orange-50', border: 'border-amber-200', shadow: 'shadow-amber-100/50', iconBg: 'from-amber-100 to-orange-100' },
                emerald: { bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-200', shadow: 'shadow-emerald-100/50', iconBg: 'from-emerald-100 to-teal-100' },
              };
              const colors = modeColorMap[tab.color];

              return (
                <motion.button
                  key={tab.key}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => handleTabSwitch(tab.key)}
                  className={cn(
                    'relative rounded-2xl p-3 border-2 transition-all overflow-hidden',
                    isActive
                      ? `${colors.border} shadow-md ${colors.shadow} bg-gradient-to-br ${colors.bg}`
                      : 'border-gray-100 bg-white shadow-sm hover:border-gray-200'
                  )}
                >
                  {/* Subtle pattern for active card */}
                  {isActive && (
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                      backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                      backgroundSize: '8px 8px',
                    }} />
                  )}
                  <div className="relative flex flex-col items-center gap-1.5">
                    <div className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl transition-all',
                      isActive
                        ? `bg-gradient-to-br ${colors.iconBg} shadow-sm`
                        : 'bg-gray-50'
                    )}>
                      <FloatingEmoji emoji={tab.emoji} className="text-lg" />
                    </div>
                    <span className={cn(
                      'text-[11px] font-bold transition-colors',
                      isActive ? 'text-gray-800' : 'text-gray-500'
                    )}>
                      {tab.label}
                    </span>
                    {/* Description indicator for active tab */}
                    {isActive && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-[9px] text-gray-400"
                      >
                        {tab.desc}
                      </motion.span>
                    )}
                  </div>
                </motion.button>
              );
            })}
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
          >
            {activeTab === 'free' && renderFreeTab()}
            {activeTab === 'speed' && renderSpeedTab()}
            {activeTab === 'adventure' && renderAdventureTab()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
      <BottomNav />
    </div>
  );
}
