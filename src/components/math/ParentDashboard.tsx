'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Target,
  BookOpen,
  Star,
  Zap,
  Lightbulb,
  CalendarDays,
} from 'lucide-react';
import { useGameStore, type PracticeRecord, type Subject } from '@/lib/game-store';
import { playClickSound } from '@/lib/sound';
import BottomNav from './BottomNav';

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTimeMs(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes < 1) return `${Math.floor(ms / 1000)}秒`;
  if (totalMinutes < 60) return `${totalMinutes}分钟`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours}小时${mins > 0 ? `${mins}分` : ''}`;
}

function getSubjectEmoji(subject: Subject): string {
  switch (subject) {
    case 'math': return '🧮';
    case 'chinese': return '📖';
    case 'english': return '🔤';
  }
}

function getSubjectLabel(subject: Subject): string {
  switch (subject) {
    case 'math': return '数学';
    case 'chinese': return '语文';
    case 'english': return '英语';
  }
}

function getSubjectGradient(subject: Subject): string {
  switch (subject) {
    case 'math': return 'from-amber-400 to-orange-500';
    case 'chinese': return 'from-rose-400 to-pink-500';
    case 'english': return 'from-emerald-400 to-teal-500';
  }
}

function getSubjectBg(subject: Subject): string {
  switch (subject) {
    case 'math': return 'bg-amber-50';
    case 'chinese': return 'bg-rose-50';
    case 'english': return 'bg-emerald-50';
  }
}

function getSubjectAccent(subject: Subject): string {
  switch (subject) {
    case 'math': return 'text-amber-600';
    case 'chinese': return 'text-rose-600';
    case 'english': return 'text-emerald-600';
  }
}

type TrendDirection = 'up' | 'down' | 'stable';

function getTrendIcon(trend: TrendDirection) {
  switch (trend) {
    case 'up': return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
    case 'down': return <TrendingDown className="w-3.5 h-3.5 text-rose-500" />;
    case 'stable': return <Minus className="w-3.5 h-3.5 text-gray-400" />;
  }
}

function getTrendLabel(trend: TrendDirection): string {
  switch (trend) {
    case 'up': return '上升';
    case 'down': return '下降';
    case 'stable': return '平稳';
  }
}

// ─── Compute Weekly Data ────────────────────────────────────────────────────

function computeWeeklyData(records: PracticeRecord[]) {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weekRecords = records.filter((r) => {
    const d = new Date(r.date);
    return d >= weekAgo && d <= today;
  });

  const sessions = weekRecords.length;
  const totalTime = weekRecords.reduce((s, r) => s + r.timeMs, 0);
  const totalCorrect = weekRecords.reduce((s, r) => s + r.correct, 0);
  const totalQuestions = weekRecords.reduce((s, r) => s + r.total, 0);
  const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return { sessions, totalTime, avgAccuracy, weekRecords };
}

// ─── Compute Subject Stats ──────────────────────────────────────────────────

interface SubjectStatsData {
  subject: Subject;
  sessions: number;
  accuracy: number;
  trend: TrendDirection;
  recentActivity: boolean;
  totalStars: number;
  totalTime: number;
}

function computeSubjectStats(records: PracticeRecord[], subject: Subject): SubjectStatsData {
  const subjectRecords = records.filter((r) => r.subject === subject);
  const sessions = subjectRecords.length;
  const totalCorrect = subjectRecords.reduce((s, r) => s + r.correct, 0);
  const totalQuestions = subjectRecords.reduce((s, r) => s + r.total, 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const totalStars = subjectRecords.reduce((s, r) => s + r.stars, 0);
  const totalTime = subjectRecords.reduce((s, r) => s + r.timeMs, 0);

  // Compute trend: compare last 3 sessions vs previous 3
  let trend: TrendDirection = 'stable';
  if (subjectRecords.length >= 4) {
    const recent = subjectRecords.slice(0, 3);
    const older = subjectRecords.slice(3, 6);
    const recentAcc = recent.reduce((s, r) => s + r.correct, 0) / Math.max(recent.reduce((s, r) => s + r.total, 0), 1);
    const olderAcc = older.reduce((s, r) => s + r.correct, 0) / Math.max(older.reduce((s, r) => s + r.total, 0), 1);
    const diff = recentAcc - olderAcc;
    if (diff > 0.05) trend = 'up';
    else if (diff < -0.05) trend = 'down';
  }

  // Recent activity: has the child practiced in last 2 days?
  const today = new Date();
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const recentActivity = subjectRecords.some((r) => {
    const d = new Date(r.date);
    return d >= twoDaysAgo;
  });

  return { subject, sessions, accuracy, trend, recentActivity, totalStars, totalTime };
}

// ─── Compute 7-Day Accuracy Trend ──────────────────────────────────────────

function computeDailyAccuracy(records: PracticeRecord[]): { day: string; accuracy: number; label: string }[] {
  const today = new Date();
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
  const result: { day: string; accuracy: number; label: string }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayRecords = records.filter((r) => r.date === dateStr);
    const totalCorrect = dayRecords.reduce((s, r) => s + r.correct, 0);
    const totalQuestions = dayRecords.reduce((s, r) => s + r.total, 0);
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    result.push({
      day: dayNames[d.getDay()],
      accuracy,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
    });
  }

  return result;
}

// ─── Compute Strengths & Weaknesses ─────────────────────────────────────────

interface StrengthWeakness {
  strongest: { label: string; emoji: string; accuracy: number };
  weakest: { label: string; emoji: string; accuracy: number };
}

function computeStrengthsWeaknesses(
  records: PracticeRecord[],
  subjectStats: SubjectStatsData[]
): StrengthWeakness {
  const validStats = subjectStats.filter((s) => s.sessions > 0);

  if (validStats.length === 0) {
    // Try by mode
    const mathRecords = records.filter((r) => r.subject === 'math');
    const modeMap: Record<string, { correct: number; total: number; label: string; emoji: string }> = {};

    // Math operations
    mathRecords.forEach((r) => {
      const key = r.operation || r.mode;
      if (!modeMap[key]) {
        const labels: Record<string, string> = {
          add: '加法', subtract: '减法', multiply: '乘法', divide: '除法',
          free: '自由练习', speed: '速度挑战', adventure: '闯关模式', daily: '每日挑战',
        };
        const emojis: Record<string, string> = {
          add: '➕', subtract: '➖', multiply: '✖️', divide: '➗',
          free: '📝', speed: '⚡', adventure: '🏰', daily: '🎯',
        };
        modeMap[key] = { correct: 0, total: 0, label: labels[key] || key, emoji: emojis[key] || '📝' };
      }
      modeMap[key].correct += r.correct;
      modeMap[key].total += r.total;
    });

    const modeEntries = Object.entries(modeMap).filter(([, v]) => v.total >= 3);
    if (modeEntries.length >= 2) {
      const sorted = modeEntries.sort((a, b) =>
        (b[1].correct / b[1].total) - (a[1].correct / a[1].total)
      );
      const best = sorted[0][1];
      const worst = sorted[sorted.length - 1][1];
      return {
        strongest: { label: best.label, emoji: best.emoji, accuracy: Math.round((best.correct / best.total) * 100) },
        weakest: { label: worst.label, emoji: worst.emoji, accuracy: Math.round((worst.correct / worst.total) * 100) },
      };
    }

    return {
      strongest: { label: '暂无数据', emoji: '🌟', accuracy: 0 },
      weakest: { label: '暂无数据', emoji: '📝', accuracy: 0 },
    };
  }

  const sorted = [...validStats].sort((a, b) => b.accuracy - a.accuracy);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  return {
    strongest: {
      label: getSubjectLabel(best.subject),
      emoji: getSubjectEmoji(best.subject),
      accuracy: best.accuracy,
    },
    weakest: {
      label: getSubjectLabel(worst.subject),
      emoji: getSubjectEmoji(worst.subject),
      accuracy: worst.accuracy,
    },
  };
}

// ─── Compute Recommendations ────────────────────────────────────────────────

function computeRecommendations(
  records: PracticeRecord[],
  subjectStats: SubjectStatsData[],
  streak: number,
  sw: StrengthWeakness
): { emoji: string; text: string; type: 'warning' | 'encouragement' | 'suggestion' }[] {
  const recommendations: { emoji: string; text: string; type: 'warning' | 'encouragement' | 'suggestion' }[] = [];

  // Check accuracy for each subject
  subjectStats.forEach((s) => {
    if (s.sessions > 0 && s.accuracy < 60) {
      const opLabel = s.subject === 'math' ? '加法' : getSubjectLabel(s.subject);
      recommendations.push({
        emoji: '📉',
        text: `${getSubjectLabel(s.subject)}正确率偏低(${s.accuracy}%)，建议多练习${opLabel}，从简单难度开始`,
        type: 'warning',
      });
    }
  });

  // Check streak
  if (streak >= 3) {
    recommendations.push({
      emoji: '🔥',
      text: `已连续${streak}天练习，保持良好习惯！坚持就是胜利`,
      type: 'encouragement',
    });
  } else if (streak === 0 && records.length > 0) {
    recommendations.push({
      emoji: '💪',
      text: '最近没有连续练习，建议每天花10分钟练习，养成好习惯',
      type: 'suggestion',
    });
  }

  // Check balance
  const activeSubjects = subjectStats.filter((s) => s.sessions > 0);
  if (activeSubjects.length === 1) {
    recommendations.push({
      emoji: '📚',
      text: `目前只练习了${getSubjectLabel(activeSubjects[0].subject)}，建议也尝试其他科目，全面发展`,
      type: 'suggestion',
    });
  } else if (activeSubjects.length >= 3) {
    recommendations.push({
      emoji: '🌟',
      text: '三大科目都有练习，全面发展很棒！继续保持',
      type: 'encouragement',
    });
  }

  // Strength-based recommendation
  if (sw.strongest.accuracy >= 80 && sw.weakest.accuracy < sw.strongest.accuracy - 20) {
    recommendations.push({
      emoji: '🎯',
      text: `${sw.strongest.label}很棒！${sw.weakest.label}可以多加练习，争取也变强`,
      type: 'suggestion',
    });
  }

  // Check practice frequency
  const today = new Date();
  const recentWeek = records.filter((r) => {
    const d = new Date(r.date);
    const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 7;
  });
  if (recentWeek.length >= 7) {
    recommendations.push({
      emoji: '⭐',
      text: '本周练习非常活跃！适度休息也很重要哦',
      type: 'encouragement',
    });
  } else if (recentWeek.length === 0 && records.length > 0) {
    recommendations.push({
      emoji: '📅',
      text: '这周还没有练习，快来开始今天的练习吧！',
      type: 'suggestion',
    });
  }

  // If no data
  if (records.length === 0) {
    recommendations.push({
      emoji: '🚀',
      text: '还没有练习记录，快去开始第一次练习吧！',
      type: 'suggestion',
    });
  }

  return recommendations.slice(0, 4);
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function WeeklySummaryCard({ records }: { records: PracticeRecord[] }) {
  const data = useMemo(() => computeWeeklyData(records), [records]);

  return (
    <motion.div variants={itemVariants}>
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardContent className="bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100">
              <CalendarDays className="w-4 h-4 text-sky-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">本周总结</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-black text-sky-600">{data.sessions}</p>
              <p className="text-[10px] text-gray-400">练习次数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-cyan-600">
                {data.sessions > 0 ? formatTimeMs(data.totalTime) : '0'}
              </p>
              <p className="text-[10px] text-gray-400">总时长</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-teal-600">{data.avgAccuracy}%</p>
              <p className="text-[10px] text-gray-400">平均正确率</p>
            </div>
          </div>
          {/* Mini bar chart of last 7 days */}
          {data.sessions > 0 && (
            <div className="flex items-end gap-1 mt-3 h-12">
              {(() => {
                const today = new Date();
                const bars: { count: number; isToday: boolean }[] = [];
                for (let i = 6; i >= 0; i--) {
                  const d = new Date(today);
                  d.setDate(d.getDate() - i);
                  const dateStr = d.toISOString().split('T')[0];
                  const count = records.filter((r) => r.date === dateStr).length;
                  bars.push({ count, isToday: i === 0 });
                }
                const maxCount = Math.max(...bars.map((b) => b.count), 1);
                return bars.map((b, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: b.count > 0 ? `${Math.max((b.count / maxCount) * 32, 4)}px` : '2px' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.05 }}
                      className={`w-full rounded-sm ${
                        b.count > 0
                          ? b.isToday
                            ? 'bg-gradient-to-t from-sky-500 to-cyan-400'
                            : 'bg-gradient-to-t from-sky-300 to-cyan-200'
                          : 'bg-gray-100'
                      }`}
                    />
                  </div>
                ));
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SubjectBreakdownCard({ stats }: { stats: SubjectStatsData }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardContent className={`${getSubjectBg(stats.subject)} p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getSubjectEmoji(stats.subject)}</span>
            <h4 className="text-sm font-bold text-gray-800">{getSubjectLabel(stats.subject)}</h4>
            {stats.recentActivity && (
              <span className="flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                近期活跃
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">{stats.sessions}次</span>
            </div>
            <div className="flex items-center gap-1.5">
              {getTrendIcon(stats.trend)}
              <span className="text-xs text-gray-500">
                正确率{stats.accuracy}%
                <span className={`ml-0.5 text-[10px] ${stats.trend === 'up' ? 'text-emerald-500' : stats.trend === 'down' ? 'text-rose-500' : 'text-gray-400'}`}>
                  {getTrendLabel(stats.trend)}
                </span>
              </span>
            </div>
          </div>
          {/* Accuracy bar */}
          <div className="mt-2 h-1.5 w-full rounded-full bg-white/60">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${getSubjectGradient(stats.subject)}`}
              initial={{ width: 0 }}
              animate={{ width: `${stats.accuracy}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AccuracyTrendChart({ records }: { records: PracticeRecord[] }) {
  const data = useMemo(() => computeDailyAccuracy(records), [records]);

  const hasData = data.some((d) => d.accuracy > 0);
  const maxAcc = 100;

  return (
    <motion.div variants={itemVariants}>
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardContent className="bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-100">
              <TrendingUp className="w-4 h-4 text-cyan-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">正确率趋势</h3>
            <span className="text-[10px] text-gray-400">近7天</span>
          </div>
          {!hasData ? (
            <div className="flex items-center justify-center py-8 text-sm text-gray-300">
              暂无数据
            </div>
          ) : (
            <div className="relative h-32">
              {/* SVG Line Chart */}
              <svg
                viewBox="0 0 280 100"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((val) => (
                  <line
                    key={val}
                    x1="0"
                    y1={100 - val}
                    x2="280"
                    y2={100 - val}
                    stroke="#f3f4f6"
                    strokeWidth="1"
                  />
                ))}
                {/* Area fill */}
                <motion.path
                  d={
                    data.reduce((path, d, i) => {
                      const x = (i / 6) * 280;
                      const y = 100 - (d.accuracy / maxAcc) * 100;
                      return i === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
                    }, '') + ` L 280 100 L 0 100 Z`
                  }
                  fill="url(#areaGradient)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
                {/* Line */}
                <motion.path
                  d={data.reduce((path, d, i) => {
                    const x = (i / 6) * 280;
                    const y = 100 - (d.accuracy / maxAcc) * 100;
                    return i === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
                  }, '')}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
                {/* Data points */}
                {data.map((d, i) => {
                  const x = (i / 6) * 280;
                  const y = 100 - (d.accuracy / maxAcc) * 100;
                  return (
                    <g key={i}>
                      <motion.circle
                        cx={x}
                        cy={y}
                        r="3.5"
                        fill="white"
                        stroke="#0ea5e9"
                        strokeWidth="2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.08 }}
                      />
                      {d.accuracy > 0 && (
                        <motion.text
                          x={x}
                          y={y - 8}
                          textAnchor="middle"
                          className="text-[8px] fill-gray-500"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 + i * 0.08 }}
                        >
                          {d.accuracy}%
                        </motion.text>
                      )}
                    </g>
                  );
                })}
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}
          {/* Day labels */}
          <div className="flex justify-between mt-1">
            {data.map((d, i) => (
              <span key={i} className="text-[9px] text-gray-400">{d.day}</span>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StrengthWeaknessCard({ sw }: { sw: StrengthWeakness }) {
  const hasData = sw.strongest.label !== '暂无数据';

  return (
    <motion.div variants={itemVariants}>
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardContent className="bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
              <Target className="w-4 h-4 text-violet-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">能力分析</h3>
          </div>
          {!hasData ? (
            <div className="flex items-center justify-center py-6 text-sm text-gray-300">
              需要更多练习数据
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {/* Strongest */}
              <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-3 text-center">
                <p className="text-[10px] font-medium text-emerald-500 mb-1">🏆 最擅长</p>
                <span className="text-2xl block mb-1">{sw.strongest.emoji}</span>
                <p className="text-xs font-bold text-gray-800">{sw.strongest.label}</p>
                <p className="text-[10px] text-emerald-600 font-medium">{sw.strongest.accuracy}%正确率</p>
              </div>
              {/* Weakest */}
              <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-3 text-center">
                <p className="text-[10px] font-medium text-amber-500 mb-1">📝 需要加强</p>
                <span className="text-2xl block mb-1">{sw.weakest.emoji}</span>
                <p className="text-xs font-bold text-gray-800">{sw.weakest.label}</p>
                <p className="text-[10px] text-amber-600 font-medium">{sw.weakest.accuracy}%正确率</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TimeDistributionCard({ subjectStats }: { subjectStats: SubjectStatsData[] }) {
  const totalTime = subjectStats.reduce((s, st) => s + st.totalTime, 0);

  return (
    <motion.div variants={itemVariants}>
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardContent className="bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100">
              <Clock className="w-4 h-4 text-teal-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">时间分布</h3>
          </div>
          {totalTime === 0 ? (
            <div className="flex items-center justify-center py-6 text-sm text-gray-300">
              暂无练习数据
            </div>
          ) : (
            <>
              {/* Stacked bar */}
              <div className="h-4 w-full rounded-full overflow-hidden flex">
                {subjectStats.map((st) => {
                  const percent = totalTime > 0 ? (st.totalTime / totalTime) * 100 : 0;
                  if (percent === 0) return null;
                  return (
                    <motion.div
                      key={st.subject}
                      className={`bg-gradient-to-r ${getSubjectGradient(st.subject)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex justify-between mt-2">
                {subjectStats.map((st) => {
                  const percent = totalTime > 0 ? Math.round((st.totalTime / totalTime) * 100) : 0;
                  return (
                    <div key={st.subject} className="flex items-center gap-1">
                      <span className="text-xs">{getSubjectEmoji(st.subject)}</span>
                      <span className={`text-[10px] font-medium ${getSubjectAccent(st.subject)}`}>
                        {percent > 0 ? `${percent}%` : '—'}
                      </span>
                      <span className="text-[9px] text-gray-400">
                        {st.totalTime > 0 ? formatTimeMs(st.totalTime) : '0'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RecommendationsCard({
  recommendations,
}: {
  recommendations: { emoji: string; text: string; type: 'warning' | 'encouragement' | 'suggestion' }[];
}) {
  const typeStyles: Record<string, { bg: string; border: string }> = {
    warning: { bg: 'bg-rose-50', border: 'border-l-rose-400' },
    encouragement: { bg: 'bg-emerald-50', border: 'border-l-emerald-400' },
    suggestion: { bg: 'bg-sky-50', border: 'border-l-sky-400' },
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardContent className="bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
              <Lightbulb className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">智能建议</h3>
          </div>
          <div className="space-y-2">
            {recommendations.map((rec, i) => {
              const style = typeStyles[rec.type];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className={`flex items-start gap-2 rounded-xl ${style.bg} p-2.5 border-l-2 ${style.border}`}
                >
                  <span className="text-sm flex-shrink-0 mt-0.5">{rec.emoji}</span>
                  <p className="text-xs text-gray-600 leading-relaxed">{rec.text}</p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DailyActivityGrid({ records }: { records: PracticeRecord[] }) {
  const gridData = useMemo(() => {
    const today = new Date();
    const days: { date: string; count: number; isToday: boolean; dayOfWeek: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = records.filter((r) => r.date === dateStr).length;
      days.push({
        date: dateStr,
        count,
        isToday: i === 0,
        dayOfWeek: d.getDay(),
      });
    }
    return days;
  }, [records]);

  const dayLabels = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <motion.div variants={itemVariants}>
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardContent className="bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
              <CalendarDays className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">近7天活动</h3>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {gridData.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-gray-400">{dayLabels[i]}</span>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 300 }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    day.isToday
                      ? 'ring-2 ring-sky-400 ring-offset-1'
                      : ''
                  } ${
                    day.count >= 5
                      ? 'bg-sky-500'
                      : day.count >= 3
                        ? 'bg-sky-400'
                        : day.count >= 1
                          ? 'bg-sky-200'
                          : 'bg-gray-100'
                  }`}
                >
                  {day.count > 0 ? (
                    <span className={`text-[10px] font-bold ${day.count >= 3 ? 'text-white' : 'text-sky-600'}`}>
                      {day.count}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-300">—</span>
                  )}
                </motion.div>
                <span className="text-[8px] text-gray-400">
                  {day.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded bg-gray-100" />
              <span className="text-[9px] text-gray-400">0次</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded bg-sky-200" />
              <span className="text-[9px] text-gray-400">1-2次</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded bg-sky-400" />
              <span className="text-[9px] text-gray-400">3-4次</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded bg-sky-500" />
              <span className="text-[9px] text-gray-400">5+次</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ParentDashboard() {
  const practiceHistory = useGameStore((s) => s.practiceHistory);
  const totalStars = useGameStore((s) => s.totalStars);
  const totalXP = useGameStore((s) => s.totalXP);
  const streak = useGameStore((s) => s.streak);
  const setCurrentView = useGameStore((s) => s.setCurrentView);

  // Compute subject stats
  const subjectStats = useMemo(() => {
    const subjects: Subject[] = ['math', 'chinese', 'english'];
    return subjects.map((s) => computeSubjectStats(practiceHistory, s));
  }, [practiceHistory]);

  // Compute strengths & weaknesses
  const strengthWeakness = useMemo(
    () => computeStrengthsWeaknesses(practiceHistory, subjectStats),
    [practiceHistory, subjectStats]
  );

  // Compute recommendations
  const recommendations = useMemo(
    () => computeRecommendations(practiceHistory, subjectStats, streak, strengthWeakness),
    [practiceHistory, subjectStats, streak, strengthWeakness]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/60 via-cyan-50/30 to-white">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-sky-500 to-cyan-600 px-4 pt-3 pb-6 text-white safe-top">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => { playClickSound(); setCurrentView('home'); }}
              className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors active:scale-95 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-0 text-[10px]">
                <Star className="w-3 h-3 mr-0.5" /> {totalStars}
              </Badge>
              <Badge className="bg-white/20 text-white border-0 text-[10px]">
                <Zap className="w-3 h-3 mr-0.5" /> {totalXP} XP
              </Badge>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-1">家长报告 📋</h1>
          <p className="text-white/70 text-xs">了解孩子的学习情况</p>
        </div>
      </div>

      <motion.main
        className="mx-auto max-w-md px-4 pb-28 -mt-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Weekly Summary */}
        <WeeklySummaryCard records={practiceHistory} />

        {/* Subject Breakdown */}
        <motion.div variants={itemVariants} className="mb-1">
          <h2 className="text-sm font-bold text-gray-800 mb-2">科目表现 📊</h2>
        </motion.div>
        <div className="grid grid-cols-1 gap-2 mb-1">
          {subjectStats.map((st) => (
            <SubjectBreakdownCard key={st.subject} stats={st} />
          ))}
        </div>

        {/* Accuracy Trend Chart */}
        <AccuracyTrendChart records={practiceHistory} />

        {/* Strengths & Weaknesses */}
        <StrengthWeaknessCard sw={strengthWeakness} />

        {/* Time Distribution */}
        <TimeDistributionCard subjectStats={subjectStats} />

        {/* Recommendations */}
        <RecommendationsCard recommendations={recommendations} />

        {/* Daily Activity Grid */}
        <DailyActivityGrid records={practiceHistory} />

        {/* Footer info */}
        <motion.div variants={itemVariants} className="text-center py-4 mt-2">
          <p className="text-[10px] text-gray-300">
            数据基于孩子近期的练习记录自动生成
          </p>
        </motion.div>
      </motion.main>

      <BottomNav />
    </div>
  );
}
