'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Target,
  Star,
  Zap,
  Flame,
  BookOpen,
  TrendingUp,
  CalendarDays,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useGameStore, type PracticeRecord, type Subject } from '@/lib/game-store';
import { playClickSound } from '@/lib/sound';
import BottomNav from './BottomNav';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTimeMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}分${sec}秒` : `${sec}秒`;
}

function getSubjectEmoji(subject: Subject): string {
  switch (subject) {
    case 'math':
      return '🔢';
    case 'chinese':
      return '📖';
    case 'english':
      return '🔤';
  }
}

function getSubjectLabel(subject: Subject): string {
  switch (subject) {
    case 'math':
      return '数学';
    case 'chinese':
      return '语文';
    case 'english':
      return '英语';
  }
}

function getSubjectColor(subject: Subject): string {
  switch (subject) {
    case 'math':
      return 'from-amber-400 to-orange-500';
    case 'chinese':
      return 'from-rose-400 to-pink-500';
    case 'english':
      return 'from-emerald-400 to-teal-500';
  }
}

// Mode name mapping for Chinese modes
const CHINESE_MODE_NAMES: Record<string, string> = {
  'recognize-char': '识字大冒险',
  'recognize-pinyin': '拼音小能手',
  'word-match': '词语消消乐',
  'dictation': '听写小达人',
  'idiom-fill': '成语填空',
  'antonym': '反义词大挑战',
  'poetry-fill': '古诗填空',
  'synonym': '近义词连连看',
};

// Mode name mapping for English modes
const ENGLISH_MODE_NAMES: Record<string, string> = {
  'word-picture': '看图识词',
  'picture-word': '看词选图',
  'listening': '听力挑战',
  'spelling': '拼写大师',
};

function getModeDisplayName(record: PracticeRecord): string {
  // Math modes
  if (record.subject === 'math') {
    switch (record.mode) {
      case 'free': return '自由练习';
      case 'speed': return '速度挑战';
      case 'adventure': return '闯关模式';
      case 'daily': return '每日挑战';
      default: return record.mode;
    }
  }
  // Chinese modes
  if (record.subject === 'chinese') {
    return CHINESE_MODE_NAMES[record.mode] || record.mode;
  }
  // English modes
  if (record.subject === 'english') {
    return ENGLISH_MODE_NAMES[record.mode] || record.mode;
  }
  return record.mode;
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay }}
    >
      <Card className="overflow-hidden border-0 py-0">
        <CardContent className={`bg-gradient-to-br ${color} p-4`}>
          <div className="flex items-center gap-2 mb-1">
            <div className="text-white/80">{icon}</div>
            <span className="text-xs font-medium text-white/80">{label}</span>
          </div>
          <p className="text-2xl font-bold text-white">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Learning Calendar ──────────────────────────────────────────────────────

function LearningCalendar({ records }: { records: PracticeRecord[] }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Group records by date
  const recordsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    records.forEach((r) => {
      map[r.date] = (map[r.date] || 0) + 1;
    });
    return map;
  }, [records]);

  // Calculate streak
  const streakCount = useMemo(() => {
    const today = new Date();
    let count = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (recordsByDate[dateStr] && recordsByDate[dateStr] > 0) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [recordsByDate]);

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const { year, month } = currentMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay(); // 0=Sunday
    const daysInMonth = lastDay.getDate();

    // Adjust for Monday start (Chinese convention)
    const adjustedStart = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const days: (number | null)[] = [];
    // Empty cells before first day
    for (let i = 0; i < adjustedStart; i++) days.push(null);
    // Days of month
    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    return days;
  }, [currentMonth]);

  const navigateMonth = useCallback((direction: -1 | 1) => {
    playClickSound();
    setCurrentMonth((prev) => {
      let newMonth = prev.month + direction;
      let newYear = prev.year;
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
      return { year: newYear, month: newMonth };
    });
  }, []);

  const today = new Date();
  const isCurrentMonth =
    currentMonth.year === today.getFullYear() &&
    currentMonth.month === today.getMonth();

  // Count practice days this month
  const monthlyPracticeDays = useMemo(() => {
    let count = 0;
    const { year, month } = currentMonth;
    for (let d = 1; d <= new Date(year, month + 1, 0).getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (recordsByDate[dateStr] && recordsByDate[dateStr] > 0) {
        count++;
      }
    }
    return count;
  }, [currentMonth, recordsByDate]);

  return (
    <Card className="overflow-hidden border-0 py-0">
      <CardContent className="bg-white p-4 dark:bg-gray-800/50">
        {/* Month header with navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigateMonth(-1)}
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="text-center">
            <span className="font-bold text-sm text-gray-800 dark:text-gray-100">
              {currentMonth.year}年{currentMonth.month + 1}月
            </span>
            {monthlyPracticeDays > 0 && (
              <span className="text-[10px] text-emerald-500 ml-2">
                📝 {monthlyPracticeDays}天练习
              </span>
            )}
          </div>
          <button
            onClick={() => navigateMonth(1)}
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Day headers - Chinese style starting from Monday */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['一', '二', '三', '四', '五', '六', '日'].map((d) => (
            <div
              key={d}
              className="text-center text-[10px] text-gray-400 font-medium"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="h-8" />;
            }
            const dateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const count = recordsByDate[dateStr] || 0;
            const isToday = isCurrentMonth && day === today.getDate();

            return (
              <motion.div
                key={day}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.01, duration: 0.2 }}
                className={`relative flex items-center justify-center h-8 rounded-lg text-xs font-medium transition-all ${
                  isToday
                    ? 'ring-2 ring-emerald-400 ring-offset-1'
                    : ''
                }`}
              >
                <span
                  className={`relative z-10 ${
                    count > 0 ? 'text-white font-bold' : 'text-gray-400'
                  }`}
                >
                  {day}
                </span>
                {count > 0 && (
                  <div
                    className={`absolute inset-0 rounded-lg ${
                      count >= 5
                        ? 'bg-emerald-500'
                        : count >= 3
                          ? 'bg-emerald-400'
                          : 'bg-emerald-300'
                    }`}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Legend & Streak */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-emerald-300" />
              <span className="text-[9px] text-gray-400">1-2次</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-emerald-400" />
              <span className="text-[9px] text-gray-400">3-4次</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-[9px] text-gray-400">5+次</span>
            </div>
          </div>
          {streakCount > 0 && (
            <div className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              <span className="text-[10px] font-bold text-orange-500">
                {streakCount}天连续
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Subject Stats ──────────────────────────────────────────────────────────

function SubjectStats({
  subject,
  records,
  delay,
}: {
  subject: Subject;
  records: PracticeRecord[];
  delay: number;
}) {
  const stats = useMemo(() => {
    if (records.length === 0) return null;
    const totalCorrect = records.reduce((s, r) => s + r.correct, 0);
    const totalQuestions = records.reduce((s, r) => s + r.total, 0);
    const accuracy = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;
    const totalStars = records.reduce((s, r) => s + r.stars, 0);
    const avgTime =
      records.reduce((s, r) => s + r.timeMs, 0) / records.length;
    return { sessions: records.length, accuracy, totalStars, avgTime };
  }, [records]);

  if (!stats) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay }}
        className="flex items-center justify-center rounded-xl border border-dashed p-6 text-sm text-muted-foreground"
      >
        还没有练习记录
      </motion.div>
    );
  }

  const accuracyPercent = Math.round(stats.accuracy * 100);
  const gradientColor = subject === 'math' ? '#f59e0b' : subject === 'chinese' ? '#f43f5e' : '#10b981';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="overflow-hidden border-0 py-0">
        <CardContent className="bg-white p-4 dark:bg-gray-800/50">
          <div className="flex items-center gap-3 mb-3">
            {/* Circular accuracy indicator */}
            <div className="relative flex-shrink-0">
              <svg width="48" height="48" viewBox="0 0 48 48">
                {/* Background circle */}
                <circle
                  cx="24" cy="24" r="20"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="4"
                />
                {/* Progress arc */}
                <motion.circle
                  cx="24" cy="24" r="20"
                  fill="none"
                  stroke={gradientColor}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - stats.accuracy) }}
                  transition={{ duration: 1, delay: delay + 0.2, ease: 'easeOut' }}
                  transform="rotate(-90 24 24)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-black" style={{ color: gradientColor }}>{accuracyPercent}%</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl">{getSubjectEmoji(subject)}</span>
                <span className="font-bold text-gray-800 dark:text-gray-100">
                  {getSubjectLabel(subject)}
                </span>
              </div>
              <p className="text-[10px] text-gray-400">正确率 {accuracyPercent}%</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">练习次数</span>
              <span className="font-medium">{stats.sessions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">正确率</span>
              <span className="font-medium">
                {Math.round(stats.accuracy * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">获得星星</span>
              <span className="font-medium">⭐ {stats.totalStars}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">平均用时</span>
              <span className="font-medium">{formatTimeMs(stats.avgTime)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Weekly Chart ───────────────────────────────────────────────────────────

function WeeklyChart({ records }: { records: PracticeRecord[] }) {
  const weeklyData = useMemo(() => {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const today = new Date();
    const result: { day: string; count: number; stars: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayRecords = records.filter((r) => r.date === dateStr);
      result.push({
        day: days[d.getDay()],
        count: dayRecords.length,
        stars: dayRecords.reduce((s, r) => s + r.stars, 0),
      });
    }

    return result;
  }, [records]);

  const maxCount = Math.max(...weeklyData.map((d) => d.count), 1);

  return (
    <Card className="overflow-hidden border-0 py-0">
      <CardContent className="bg-white p-4 dark:bg-gray-800/50">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
            本周练习
          </span>
        </div>
        <div className="flex items-end gap-2 h-28">
          {weeklyData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              {d.count > 0 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.count / maxCount) * 80}px` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.05 }}
                  className="w-full rounded-t-md bg-gradient-to-t from-amber-400 to-orange-300 dark:from-amber-600 dark:to-orange-500 min-h-[4px]"
                />
              )}
              {d.count === 0 && (
                <div className="w-full h-[4px] rounded-t-md bg-gray-200 dark:bg-gray-700" />
              )}
              <span className="text-[10px] text-muted-foreground">
                周{d.day}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function StatsPage() {
  const practiceHistory = useGameStore((s) => s.practiceHistory);
  const totalStars = useGameStore((s) => s.totalStars);
  const totalXP = useGameStore((s) => s.totalXP);
  const streak = useGameStore((s) => s.streak);
  const setCurrentView = useGameStore((s) => s.setCurrentView);

  const overallStats = useMemo(() => {
    const totalSessions = practiceHistory.length;
    const totalCorrect = practiceHistory.reduce((s, r) => s + r.correct, 0);
    const totalQuestions = practiceHistory.reduce((s, r) => s + r.total, 0);
    const overallAccuracy = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;
    return { totalSessions, overallAccuracy };
  }, [practiceHistory]);

  const mathRecords = useMemo(
    () => practiceHistory.filter((r) => r.subject === 'math'),
    [practiceHistory]
  );
  const chineseRecords = useMemo(
    () => practiceHistory.filter((r) => r.subject === 'chinese'),
    [practiceHistory]
  );
  const englishRecords = useMemo(
    () => practiceHistory.filter((r) => r.subject === 'english'),
    [practiceHistory]
  );

  const recentRecords = useMemo(() => practiceHistory.slice(0, 10), [practiceHistory]);

  const todayDateStr = useMemo(() => {
    return new Date().toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header - emerald/teal gradient */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 pt-3 pb-5 text-white safe-top">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => { playClickSound(); setCurrentView('home'); }}
              className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors active:scale-95 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
            <span className="text-sm font-medium text-white/80">
              {todayDateStr}
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-1">📊 学习统计</h1>
          <p className="text-white/70 text-xs">追踪你的学习进度</p>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pb-28">
        {/* Learning Calendar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="-mt-3 mb-5"
        >
          <LearningCalendar records={practiceHistory} />
        </motion.div>

        {/* Overall Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard
            icon={<BookOpen className="h-4 w-4" />}
            label="练习次数"
            value={overallStats.totalSessions}
            color="from-emerald-400 to-green-500"
            delay={0.1}
          />
          <StatCard
            icon={<Target className="h-4 w-4" />}
            label="总体正确率"
            value={`${Math.round(overallStats.overallAccuracy * 100)}%`}
            color="from-amber-400 to-orange-500"
            delay={0.15}
          />
          <StatCard
            icon={<Star className="h-4 w-4" />}
            label="累计星星"
            value={totalStars}
            color="from-yellow-400 to-amber-500"
            delay={0.2}
          />
          <StatCard
            icon={<Zap className="h-4 w-4" />}
            label="总经验值"
            value={totalXP}
            color="from-violet-400 to-purple-500"
            delay={0.25}
          />
        </div>

        {/* Streak */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card className="overflow-hidden border-0 py-0">
            <CardContent className="bg-gradient-to-r from-rose-400 to-orange-400 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-white" />
                  <span className="font-bold text-white">连续练习</span>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-white">{streak}</span>
                  <span className="text-sm text-white/80 ml-1">天</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Chart */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mb-6"
        >
          <WeeklyChart records={practiceHistory} />
        </motion.div>

        {/* Personal Bests */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.38 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              个人最佳 🏆
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {/* Best accuracy */}
            {(() => {
              const validRecords = practiceHistory.filter(r => r.total >= 5);
              const accuracyList = validRecords.map(r => r.correct / r.total);
              const bestAccuracy = accuracyList.length > 0
                ? Math.round(Math.max(...accuracyList) * 100)
                : 0;
              return (
                <Card className="overflow-hidden border-0 py-0">
                  <CardContent className="bg-gradient-to-br from-amber-50 to-orange-50 p-3">
                    <p className="text-[10px] text-amber-500 font-medium mb-1">🎯 最高正确率</p>
                    <p className="text-xl font-black text-amber-700">{bestAccuracy > 0 ? `${bestAccuracy}%` : '—'}</p>
                    <p className="text-[9px] text-amber-400">5题以上</p>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Best stars in one session */}
            {(() => {
              const starsList = practiceHistory.map(r => r.stars);
              const bestStars = starsList.length > 0
                ? Math.max(...starsList)
                : 0;
              return (
                <Card className="overflow-hidden border-0 py-0">
                  <CardContent className="bg-gradient-to-br from-yellow-50 to-amber-50 p-3">
                    <p className="text-[10px] text-yellow-600 font-medium mb-1">⭐ 单次最多星星</p>
                    <p className="text-xl font-black text-yellow-700">{bestStars > 0 ? `${bestStars}⭐` : '—'}</p>
                    <p className="text-[9px] text-yellow-400">单次练习</p>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Fastest session */}
            {(() => {
              const validRecords = practiceHistory.filter(r => r.correct >= 5 && r.total >= 5);
              const timeList = validRecords.map(r => r.timeMs / r.total);
              const fastest = timeList.length > 0
                ? Math.min(...timeList)
                : 0;
              return (
                <Card className="overflow-hidden border-0 py-0">
                  <CardContent className="bg-gradient-to-br from-cyan-50 to-teal-50 p-3">
                    <p className="text-[10px] text-cyan-600 font-medium mb-1">⚡ 最快答题</p>
                    <p className="text-xl font-black text-cyan-700">{fastest > 0 ? `${Math.round(fastest / 1000)}秒/题` : '—'}</p>
                    <p className="text-[9px] text-cyan-400">平均用时</p>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Longest streak */}
            {(() => {
              return (
                <Card className="overflow-hidden border-0 py-0">
                  <CardContent className="bg-gradient-to-br from-rose-50 to-orange-50 p-3">
                    <p className="text-[10px] text-rose-500 font-medium mb-1">🔥 当前连续</p>
                    <p className="text-xl font-black text-rose-700">{streak > 0 ? `${streak}天` : '—'}</p>
                    <p className="text-[9px] text-rose-400">连续学习</p>
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        </motion.div>

        {/* Per-Subject Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              科目统计
            </h2>
          </div>
          <div className="space-y-3">
            <SubjectStats subject="math" records={mathRecords} delay={0.45} />
            <SubjectStats subject="chinese" records={chineseRecords} delay={0.5} />
            <SubjectStats subject="english" records={englishRecords} delay={0.55} />
          </div>
        </motion.div>

        {/* Recent History */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              最近记录
            </h2>
          </div>

          {recentRecords.length === 0 ? (
            <div className="flex items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
              还没有练习记录，快去练习吧！
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {recentRecords.map((record, i) => (
                <motion.div
                  key={`${record.date}-${i}`}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.03 }}
                >
                  <Card className="overflow-hidden border-0 py-0">
                    <CardContent className="bg-white p-3 dark:bg-gray-800/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {getSubjectEmoji(record.subject)}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                              {getSubjectLabel(record.subject)} ·{' '}
                              {getModeDisplayName(record)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {record.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={`text-xs bg-gradient-to-r ${getSubjectColor(record.subject)} text-white border-0`}
                          >
                            {Math.round(
                              (record.correct / Math.max(record.total, 1)) * 100
                            )}
                            %
                          </Badge>
                          <span className="text-sm">
                            {'⭐'.repeat(record.stars)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
}
