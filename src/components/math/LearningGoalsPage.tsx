'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Target, CheckCircle2, Sparkles } from 'lucide-react';
import { useLearningGoalsStore, type LearningGoal } from '@/lib/learning-goals';
import { useGameStore } from '@/lib/game-store';
import { playClickSound } from '@/lib/sound';
import BottomNav from './BottomNav';

// ─── Constants ──────────────────────────────────────────────────────────

const GOAL_ICONS: Record<string, string> = {
  sessions: '📝',
  questions: '🔢',
  stars: '⭐',
};

const GOAL_COLORS: Record<string, { bar: string; bg: string; text: string; gradient: string }> = {
  sessions: { bar: 'bg-amber-400', bg: 'bg-amber-100', text: 'text-amber-700', gradient: 'from-amber-400 to-orange-400' },
  questions: { bar: 'bg-emerald-400', bg: 'bg-emerald-100', text: 'text-emerald-700', gradient: 'from-emerald-400 to-teal-400' },
  stars: { bar: 'bg-yellow-400', bg: 'bg-yellow-100', text: 'text-yellow-700', gradient: 'from-yellow-400 to-amber-400' },
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

function getGoalUnit(goal: LearningGoal): string {
  const type = getGoalType(goal);
  const units: Record<string, string> = {
    sessions: '次',
    questions: '题',
    stars: '颗',
  };
  return units[type];
}

const SUBJECT_LABELS: Record<string, string> = {
  all: '全部科目',
  math: '数学',
  chinese: '语文',
  english: '英语',
};

const TYPE_LABELS: Record<string, string> = {
  daily: '每日目标',
  weekly: '每周目标',
};

function getMotivationalMessage(goals: LearningGoal[], getGoalProgress: (goal: LearningGoal) => { current: number; target: number; percent: number }): string {
  const activeGoals = goals.filter(g => g.isActive);
  if (activeGoals.length === 0) return '设定一个目标，开始你的学习之旅吧！🎯';

  const completedCount = activeGoals.filter(g => getGoalProgress(g).percent >= 100).length;
  const total = activeGoals.length;

  if (completedCount === total) return '太厉害了！今日目标全部完成！🎉🏆';
  if (completedCount > 0) return `已完成 ${completedCount}/${total} 个目标，继续加油！💪`;
  
  const minPercent = Math.min(...activeGoals.map(g => getGoalProgress(g).percent));
  if (minPercent >= 50) return '已经过半了，再坚持一下！🔥';
  if (minPercent > 0) return '好的开始是成功的一半！加油！✨';
  return '新的一天，新的目标！开始练习吧！🚀';
}

// ─── Component ──────────────────────────────────────────────────────────

export default function LearningGoalsPage() {
  const goals = useLearningGoalsStore((s) => s.goals);
  const addGoal = useLearningGoalsStore((s) => s.addGoal);
  const removeGoal = useLearningGoalsStore((s) => s.removeGoal);
  const toggleGoal = useLearningGoalsStore((s) => s.toggleGoal);
  const getGoalProgress = useLearningGoalsStore((s) => s.getGoalProgress);
  const todayCompletedSessions = useLearningGoalsStore((s) => s.todayCompletedSessions);
  const todayCompletedQuestions = useLearningGoalsStore((s) => s.todayCompletedQuestions);
  const todayEarnedStars = useLearningGoalsStore((s) => s.todayEarnedStars);
  const weekCompletedSessions = useLearningGoalsStore((s) => s.weekCompletedSessions);
  const weekCompletedQuestions = useLearningGoalsStore((s) => s.weekCompletedQuestions);
  const weekEarnedStars = useLearningGoalsStore((s) => s.weekEarnedStars);
  const setCurrentView = useGameStore((s) => s.setCurrentView);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoalType, setNewGoalType] = useState<'daily' | 'weekly'>('daily');
  const [newGoalMetric, setNewGoalMetric] = useState<'sessions' | 'questions' | 'stars'>('sessions');
  const [newGoalTarget, setNewGoalTarget] = useState(3);
  const [newGoalSubject, setNewGoalSubject] = useState<'all' | 'math' | 'chinese' | 'english'>('all');

  const dailyGoals = goals.filter(g => g.type === 'daily');
  const weeklyGoals = goals.filter(g => g.type === 'weekly');

  const handleAddGoal = () => {
    const goalData: Omit<LearningGoal, 'id'> = {
      type: newGoalType,
      targetSessions: newGoalMetric === 'sessions' ? newGoalTarget : 0,
      targetQuestions: newGoalMetric === 'questions' ? newGoalTarget : 0,
      targetStars: newGoalMetric === 'stars' ? newGoalTarget : 0,
      subject: newGoalSubject,
      isActive: true,
    };
    addGoal(goalData);
    setShowAddForm(false);
    setNewGoalTarget(3);
    playClickSound();
  };

  const motivationalMsg = getMotivationalMessage(goals, getGoalProgress);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white">
      {/* ── Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 pb-6 pt-3 px-4 safe-top">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -left-4 bottom-0 h-20 w-20 rounded-full bg-white/5" />
        
        <div className="relative z-10 mx-auto max-w-md">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => { playClickSound(); setCurrentView('home'); }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-all hover:bg-white/30 active:scale-90"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">🎯 学习目标</h1>
              <p className="text-[10px] text-amber-100">设定目标，坚持每天进步</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Motivational Banner ── */}
      <div className="mx-auto max-w-md px-4 -mt-3 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 p-3 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <motion.span
              className="text-xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🎯
            </motion.span>
            <p className="text-xs font-medium text-amber-800 flex-1">{motivationalMsg}</p>
          </div>
        </motion.div>
      </div>

      {/* ── Today's Progress Overview ── */}
      <div className="mx-auto max-w-md px-4 mt-4">
        <h2 className="text-sm font-bold text-gray-800 mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          今日进度
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white p-3 shadow-sm border border-amber-100/60 text-center">
            <span className="text-lg block mb-0.5">📝</span>
            <span className="text-lg font-bold text-amber-600">{todayCompletedSessions}</span>
            <span className="text-[9px] text-gray-400 block">次练习</span>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm border border-emerald-100/60 text-center">
            <span className="text-lg block mb-0.5">🔢</span>
            <span className="text-lg font-bold text-emerald-600">{todayCompletedQuestions}</span>
            <span className="text-[9px] text-gray-400 block">道题</span>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm border border-yellow-100/60 text-center">
            <span className="text-lg block mb-0.5">⭐</span>
            <span className="text-lg font-bold text-yellow-600">{todayEarnedStars}</span>
            <span className="text-[9px] text-gray-400 block">颗星</span>
          </div>
        </div>
      </div>

      {/* ── Weekly Progress (if weekly goals exist) ── */}
      {weeklyGoals.length > 0 && (
        <div className="mx-auto max-w-md px-4 mt-4">
          <h2 className="text-sm font-bold text-gray-800 mb-2.5 flex items-center gap-1.5">
            📅 本周进度
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white p-3 shadow-sm border border-amber-100/60 text-center">
              <span className="text-lg font-bold text-amber-600">{weekCompletedSessions}</span>
              <span className="text-[9px] text-gray-400 block">次练习</span>
            </div>
            <div className="rounded-xl bg-white p-3 shadow-sm border border-emerald-100/60 text-center">
              <span className="text-lg font-bold text-emerald-600">{weekCompletedQuestions}</span>
              <span className="text-[9px] text-gray-400 block">道题</span>
            </div>
            <div className="rounded-xl bg-white p-3 shadow-sm border border-yellow-100/60 text-center">
              <span className="text-lg font-bold text-yellow-600">{weekEarnedStars}</span>
              <span className="text-[9px] text-gray-400 block">颗星</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Daily Goals List ── */}
      <div className="mx-auto max-w-md px-4 mt-5">
        <h2 className="text-sm font-bold text-gray-800 mb-2.5 flex items-center gap-1.5">
          <Target className="w-4 h-4 text-amber-500" />
          每日目标
        </h2>
        <AnimatePresence>
          {dailyGoals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl bg-white p-6 shadow-sm border border-dashed border-amber-200 text-center"
            >
              <span className="text-3xl block mb-2">📋</span>
              <p className="text-xs text-gray-400">还没有每日目标，添加一个吧！</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {dailyGoals.map((goal) => (
                <GoalItem
                  key={goal.id}
                  goal={goal}
                  progress={getGoalProgress(goal)}
                  onToggle={() => { toggleGoal(goal.id); playClickSound(); }}
                  onRemove={() => { removeGoal(goal.id); playClickSound(); }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Weekly Goals List ── */}
      {weeklyGoals.length > 0 && (
        <div className="mx-auto max-w-md px-4 mt-5">
          <h2 className="text-sm font-bold text-gray-800 mb-2.5 flex items-center gap-1.5">
            📅 每周目标
          </h2>
          <div className="space-y-2">
            {weeklyGoals.map((goal) => (
              <GoalItem
                key={goal.id}
                goal={goal}
                progress={getGoalProgress(goal)}
                onToggle={() => { toggleGoal(goal.id); playClickSound(); }}
                onRemove={() => { removeGoal(goal.id); playClickSound(); }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Add New Goal ── */}
      <div className="mx-auto max-w-md px-4 mt-5 pb-28">
        {!showAddForm ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { setShowAddForm(true); playClickSound(); }}
            className="w-full rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-3.5 text-center transition-all hover:border-amber-300 hover:bg-amber-50"
          >
            <div className="flex items-center justify-center gap-2">
              <Plus className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-bold text-amber-600">添加新目标</span>
            </div>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-4 shadow-sm border border-amber-100/60"
          >
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-500" />
              新建目标
            </h3>

            {/* Goal Type */}
            <div className="mb-3">
              <label className="text-[10px] font-medium text-gray-500 mb-1 block">目标周期</label>
              <div className="flex gap-2">
                {(['daily', 'weekly'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setNewGoalType(type)}
                    className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                      newGoalType === type
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* Metric Type */}
            <div className="mb-3">
              <label className="text-[10px] font-medium text-gray-500 mb-1 block">目标类型</label>
              <div className="flex gap-2">
                {([
                  { key: 'sessions' as const, label: '📝 完成练习' },
                  { key: 'questions' as const, label: '🔢 答题数量' },
                  { key: 'stars' as const, label: '⭐ 获得星星' },
                ]).map(metric => (
                  <button
                    key={metric.key}
                    onClick={() => setNewGoalMetric(metric.key)}
                    className={`flex-1 rounded-lg py-2 text-[10px] font-medium transition-all ${
                      newGoalMetric === metric.key
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {metric.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Value */}
            <div className="mb-3">
              <label className="text-[10px] font-medium text-gray-500 mb-1 block">目标数量</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setNewGoalTarget(Math.max(1, newGoalTarget - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 active:scale-90"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <span className="text-2xl font-bold text-amber-600">{newGoalTarget}</span>
                  <span className="text-[10px] text-gray-400 ml-1">
                    {newGoalMetric === 'sessions' ? '次' : newGoalMetric === 'questions' ? '题' : '颗'}
                  </span>
                </div>
                <button
                  onClick={() => setNewGoalTarget(Math.min(50, newGoalTarget + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 active:scale-90"
                >
                  +
                </button>
              </div>
            </div>

            {/* Subject */}
            <div className="mb-4">
              <label className="text-[10px] font-medium text-gray-500 mb-1 block">适用科目</label>
              <div className="flex gap-1.5 flex-wrap">
                {(['all', 'math', 'chinese', 'english'] as const).map(subj => (
                  <button
                    key={subj}
                    onClick={() => setNewGoalSubject(subj)}
                    className={`rounded-lg px-3 py-1.5 text-[10px] font-medium transition-all ${
                      newGoalSubject === subj
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {SUBJECT_LABELS[subj]}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => { setShowAddForm(false); playClickSound(); }}
                className="flex-1 rounded-xl bg-gray-100 py-2.5 text-xs font-medium text-gray-500 transition-all hover:bg-gray-200 active:scale-95"
              >
                取消
              </button>
              <button
                onClick={handleAddGoal}
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
              >
                确认添加
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

// ─── Goal Item Sub-component ────────────────────────────────────────────

function GoalItem({
  goal,
  progress,
  onToggle,
  onRemove,
}: {
  goal: LearningGoal;
  progress: { current: number; target: number; percent: number };
  onToggle: () => void;
  onRemove: () => void;
}) {
  const type = getGoalType(goal);
  const colors = GOAL_COLORS[type];
  const icon = GOAL_ICONS[type];
  const isCompleted = progress.percent >= 100;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`rounded-xl bg-white p-3 shadow-sm border transition-all ${
        !goal.isActive ? 'border-gray-100 opacity-50' : isCompleted ? 'border-emerald-200' : 'border-amber-100/60'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors.bg}`}>
          <span className="text-base">{icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`text-xs font-bold ${goal.isActive ? 'text-gray-800' : 'text-gray-400'}`}>
              {getGoalLabel(goal)}
            </span>
            {isCompleted && goal.isActive && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </motion.span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] ${goal.isActive ? 'text-gray-500' : 'text-gray-300'}`}>
              {SUBJECT_LABELS[goal.subject]} · {TYPE_LABELS[goal.type]}
            </span>
          </div>
        </div>

        {/* Progress + Controls */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className={`text-xs font-bold ${isCompleted ? 'text-emerald-600' : colors.text}`}>
              {progress.current}/{progress.target}
            </span>
            <span className="text-[9px] text-gray-400 block">{getGoalUnit(goal)}</span>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={onToggle}
            className={`relative h-5 w-9 rounded-full transition-colors ${
              goal.isActive ? 'bg-amber-400' : 'bg-gray-200'
            }`}
            aria-label={goal.isActive ? '关闭目标' : '开启目标'}
          >
            <motion.div
              className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
              animate={{ left: goal.isActive ? '18px' : '2px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>

          {/* Delete */}
          <button
            onClick={onRemove}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition-all hover:bg-red-50 hover:text-red-400 active:scale-90"
            aria-label="删除目标"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {goal.isActive && (
        <div className="mt-2">
          <div className={`h-2 rounded-full ${colors.bg}`}>
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${colors.gradient}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress.percent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[9px] text-gray-300">{progress.percent}%</span>
            {isCompleted && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[9px] text-emerald-500 font-medium"
              >
                已完成 ✅
              </motion.span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
