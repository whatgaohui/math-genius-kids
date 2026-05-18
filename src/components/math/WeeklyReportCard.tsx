'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronRight, TrendingUp } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { useThemeStore, THEMES } from '@/lib/theme-store';
import { playClickSound } from '@/lib/sound';

// ─── Animation Variants ─────────────────────────────────────────────────────

const barVariants = {
  hidden: { scaleY: 0 },
  visible: (i: number) => ({
    scaleY: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
      delay: i * 0.06,
    },
  }),
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function WeeklyReportCard() {
  const practiceHistory = useGameStore((s) => s.practiceHistory);
  const setCurrentView = useGameStore((s) => s.setCurrentView);

  const themeConfig = useThemeStore((s) => {
    const t = s.theme;
    return THEMES.find((th) => th.id === t) ?? THEMES[0];
  });

  // Calculate weekly data
  const { weekBars, totalSessions, totalStars, bestSubject } = useMemo(() => {
    const dayNames = ['一', '二', '三', '四', '五', '六', '日'];
    const today = new Date();

    // Get Monday of current week
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    // Build 7-day data (Mon-Sun)
    let sessions = 0;
    let stars = 0;
    const subjectCounts: Record<string, number> = {};
    const bars: { label: string; count: number; isToday: boolean }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayRecords = practiceHistory.filter((r) => r.date === dateStr);
      const count = dayRecords.length;
      const isToday = dateStr === today.toISOString().split('T')[0];

      bars.push({
        label: dayNames[i],
        count,
        isToday,
      });

      sessions += count;
      dayRecords.forEach((r) => {
        stars += r.stars;
        const subj = r.subject || 'math';
        subjectCounts[subj] = (subjectCounts[subj] || 0) + 1;
      });
    }

    // Find best subject
    let best = '';
    let maxCount = 0;
    for (const [subj, cnt] of Object.entries(subjectCounts)) {
      if (cnt > maxCount) {
        maxCount = cnt;
        best = subj;
      }
    }

    const subjectLabels: Record<string, string> = {
      math: '🧮 数学',
      chinese: '📖 语文',
      english: '🔤 英语',
    };

    return {
      weekBars: bars,
      totalSessions: sessions,
      totalStars: stars,
      bestSubject: best ? subjectLabels[best] || best : '暂无',
    };
  }, [practiceHistory]);

  const maxCount = Math.max(...weekBars.map((d) => d.count), 1);

  return (
    <motion.button
      onClick={() => {
        playClickSound();
        setCurrentView('stats');
      }}
      className={`w-full rounded-2xl bg-white p-4 shadow-sm border ${themeConfig.cardBorder} text-left transition-all hover:shadow-md active:scale-[0.98]`}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${themeConfig.accentLight}`}>
            <TrendingUp className={`size-3.5 ${themeConfig.accentText}`} />
          </div>
          <span className="text-xs font-bold text-gray-700">📋 本周学习周报</span>
        </div>
        <ChevronRight className="size-4 text-gray-300" />
      </div>

      {/* Mini bar chart (Mon-Sun) */}
      <div className="flex items-end gap-1.5 h-20 mb-3">
        {weekBars.map((day, i) => {
          const heightPercent = day.count > 0 ? Math.max(15, (day.count / maxCount) * 100) : 4;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="relative w-full flex justify-center" style={{ height: '64px' }}>
                <motion.div
                  custom={i}
                  variants={barVariants}
                  initial="hidden"
                  animate="visible"
                  className={`w-full max-w-[20px] rounded-t-md origin-bottom ${
                    day.isToday
                      ? `bg-gradient-to-t ${themeConfig.accent}`
                      : day.count > 0
                        ? `bg-gradient-to-t ${themeConfig.accentLight}`
                        : 'bg-gray-100'
                  }`}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    height: `${heightPercent}%`,
                  }}
                />
                {day.count > 0 && (
                  <motion.span
                    className={`absolute -top-0.5 text-[8px] font-bold ${themeConfig.accentText}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.06 }}
                  >
                    {day.count}
                  </motion.span>
                )}
              </div>
              <span
                className={`text-[8px] font-medium ${
                  day.isToday ? `${themeConfig.accentText} font-bold` : 'text-gray-400'
                }`}
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary stats row */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <span className="text-xs">📝</span>
          <span className="text-[10px] text-gray-500">练习</span>
          <span className="text-[11px] font-bold text-gray-700">{totalSessions}次</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="size-3 text-amber-400 fill-amber-400" />
          <span className="text-[10px] text-gray-500">星星</span>
          <span className="text-[11px] font-bold text-gray-700">{totalStars}颗</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs">🏆</span>
          <span className="text-[10px] text-gray-500">最擅长</span>
          <span className="text-[11px] font-bold text-gray-700">{bestSubject}</span>
        </div>
      </div>
    </motion.button>
  );
}
