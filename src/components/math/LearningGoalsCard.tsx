'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Target, CheckCircle2 } from 'lucide-react';
import { useLearningGoalsStore, type LearningGoal } from '@/lib/learning-goals';
import { useGameStore } from '@/lib/game-store';
import { playClickSound } from '@/lib/sound';

const GOAL_ICONS: Record<string, string> = {
  sessions: '📝',
  questions: '🔢',
  stars: '⭐',
};

const GOAL_COLORS: Record<string, { bar: string; bg: string; text: string }> = {
  sessions: { bar: 'bg-amber-400', bg: 'bg-amber-100', text: 'text-amber-700' },
  questions: { bar: 'bg-emerald-400', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  stars: { bar: 'bg-yellow-400', bg: 'bg-yellow-100', text: 'text-yellow-700' },
};

function getGoalType(goal: LearningGoal): string {
  if (goal.targetSessions > 0) return 'sessions';
  if (goal.targetQuestions > 0) return 'questions';
  if (goal.targetStars > 0) return 'stars';
  return 'sessions';
}

function getGoalLabel(goal: LearningGoal): string {
  const type = getGoalType(goal);
  const labels: Record<string, string> = {
    sessions: '完成练习',
    questions: '答题数量',
    stars: '获得星星',
  };
  return labels[type];
}

export default function LearningGoalsCard() {
  const goals = useLearningGoalsStore((s) => s.goals);
  const getGoalProgress = useLearningGoalsStore((s) => s.getGoalProgress);
  const setCurrentView = useGameStore((s) => s.setCurrentView);

  const activeDailyGoals = goals.filter(g => g.isActive && g.type === 'daily');

  if (activeDailyGoals.length === 0) return null;

  const allCompleted = activeDailyGoals.every((goal) => {
    const progress = getGoalProgress(goal);
    return progress.percent >= 100;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <button
        onClick={() => { playClickSound(); setCurrentView('learning-goals'); }}
        className="w-full rounded-2xl bg-white p-3.5 shadow-sm border border-amber-100/60 text-left transition-all hover:shadow-md active:scale-[0.98]"
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
              <Target className="text-amber-500" size={14} />
            </div>
            <h3 className="text-sm font-bold text-gray-800">今日目标</h3>
            {allCompleted && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs"
              >
                🎉
              </motion.span>
            )}
          </div>
          <ChevronRight className="size-4 text-gray-300" />
        </div>
        
        <div className="space-y-2.5">
          {activeDailyGoals.map((goal) => {
            const progress = getGoalProgress(goal);
            const type = getGoalType(goal);
            const colors = GOAL_COLORS[type];
            const icon = GOAL_ICONS[type];
            const isCompleted = progress.percent >= 100;

            return (
              <div key={goal.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{icon}</span>
                    <span className="text-[10px] font-medium text-gray-600">{getGoalLabel(goal)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      </motion.div>
                    )}
                    <span className={`text-[10px] font-bold ${isCompleted ? 'text-emerald-600' : colors.text}`}>
                      {progress.current}/{progress.target}
                    </span>
                  </div>
                </div>
                <div className={`h-1.5 rounded-full ${colors.bg}`}>
                  <motion.div
                    className={`h-full rounded-full ${colors.bar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.percent}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </button>
    </motion.div>
  );
}
