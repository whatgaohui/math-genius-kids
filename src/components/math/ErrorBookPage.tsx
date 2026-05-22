'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Trash2,
  CheckCircle2,
  XCircle,
  BookOpen,
  Brain,
  Target,
  Filter,
  RotateCcw,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useGameStore, type Subject } from '@/lib/game-store';
import {
  getErrorBook,
  getPendingReviews,
  getStats,
  markReviewed,
  removeError,
  clearMastered,
  resetErrorBook,
  formatRelativeTime,
  type WrongQuestion,
} from '@/lib/error-book';
import { playClickSound } from '@/lib/sound';
import BottomNav from './BottomNav';

// ─── Subject Config ─────────────────────────────────────────────────────────

const SUBJECT_CONFIG: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  math: { emoji: '🧮', label: '数学', color: 'text-amber-600', bg: 'bg-amber-50' },
  chinese: { emoji: '📖', label: '语文', color: 'text-rose-600', bg: 'bg-rose-50' },
  english: { emoji: '🔤', label: '英语', color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

// ─── Filter Tabs ────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'math' | 'chinese' | 'english' | 'pending' | 'mastered';

const FILTER_TABS: { key: FilterKey; label: string; emoji: string }[] = [
  { key: 'all', label: '全部', emoji: '📋' },
  { key: 'pending', label: '待复习', emoji: '📝' },
  { key: 'mastered', label: '已掌握', emoji: '✅' },
  { key: 'math', label: '数学', emoji: '🧮' },
  { key: 'chinese', label: '语文', emoji: '📖' },
  { key: 'english', label: '英语', emoji: '🔤' },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function ErrorBookPage() {
  const setCurrentView = useGameStore((s) => s.setCurrentView);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewQuestions, setReviewQuestions] = useState<WrongQuestion[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Force re-read on refreshKey change
  const allErrors = useMemo(() => getErrorBook(), [refreshKey]);
  const stats = useMemo(() => getStats(), [refreshKey]);
  const pendingReviews = useMemo(() => getPendingReviews(), [refreshKey]);

  const filteredErrors = useMemo(() => {
    let list = allErrors;
    switch (activeFilter) {
      case 'pending':
        list = allErrors.filter((e) => !e.mastered);
        break;
      case 'mastered':
        list = allErrors.filter((e) => e.mastered);
        break;
      case 'math':
        list = allErrors.filter((e) => e.subject === 'math');
        break;
      case 'chinese':
        list = allErrors.filter((e) => e.subject === 'chinese');
        break;
      case 'english':
        list = allErrors.filter((e) => e.subject === 'english');
        break;
      default:
        break;
    }
    return list;
  }, [allErrors, activeFilter]);

  const startReview = useCallback(() => {
    const subject = activeFilter === 'math' || activeFilter === 'chinese' || activeFilter === 'english'
      ? (activeFilter as Subject)
      : undefined;
    const questions = getPendingReviews().slice(0, 10);
    if (questions.length === 0) return;
    setReviewQuestions(questions);
    setReviewIndex(0);
    setShowAnswer(false);
    setReviewMode(true);
    playClickSound();
  }, [activeFilter]);

  const handleReviewAnswer = useCallback((correct: boolean) => {
    if (reviewQuestions.length === 0) return;
    const question = reviewQuestions[reviewIndex];
    markReviewed(question.id, correct);
    playClickSound();

    if (reviewIndex < reviewQuestions.length - 1) {
      setReviewIndex((i) => i + 1);
      setShowAnswer(false);
    } else {
      // Review complete
      setReviewMode(false);
      setRefreshKey((k) => k + 1);
    }
  }, [reviewQuestions, reviewIndex]);

  const handleRemove = useCallback((id: string) => {
    removeError(id);
    setRefreshKey((k) => k + 1);
  }, []);

  const handleClearMastered = useCallback(() => {
    clearMastered();
    setRefreshKey((k) => k + 1);
    playClickSound();
  }, []);

  const handleReset = useCallback(() => {
    resetErrorBook();
    setRefreshKey((k) => k + 1);
    playClickSound();
  }, []);

  // ── Review Mode ──
  if (reviewMode && reviewQuestions.length > 0) {
    const currentQ = reviewQuestions[reviewIndex];
    const subjectConf = SUBJECT_CONFIG[currentQ.subject] || SUBJECT_CONFIG.math;

    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 via-orange-50/30 to-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 px-4 pt-3 pb-5 text-white safe-top">
          <div className="mx-auto max-w-md">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => { setReviewMode(false); setRefreshKey((k) => k + 1); }}
                className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors active:scale-95 min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" />
                退出复习
              </button>
              <span className="text-sm font-medium text-white/80">
                {reviewIndex + 1} / {reviewQuestions.length}
              </span>
            </div>
            <h1 className="text-xl font-bold">📝 错题复习</h1>
            <p className="text-white/70 text-xs mt-1">答对 3 次即可标记为已掌握</p>
          </div>
        </div>

        <div className="mx-auto max-w-md px-4 pb-28 pt-5">
          {/* Progress bar */}
          <div className="mb-5">
            <div className="h-2 rounded-full bg-red-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-red-400 to-orange-400"
                animate={{ width: `${((reviewIndex + 1) / reviewQuestions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question Card */}
          <motion.div
            key={reviewIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg py-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={`${subjectConf.bg} ${subjectConf.color} border-0 text-[10px]`}>
                    {subjectConf.emoji} {subjectConf.label}
                  </Badge>
                  {currentQ.operation && (
                    <Badge className="bg-gray-50 text-gray-500 border-0 text-[10px]">
                      {currentQ.operation}
                    </Badge>
                  )}
                  <Badge className="bg-red-50 text-red-500 border-0 text-[10px]">
                    复习 {currentQ.reviewCount}/3
                  </Badge>
                </div>

                {/* Question Content */}
                <div className="text-center py-6">
                  <p className="text-2xl font-bold text-gray-800 mb-2">
                    {currentQ.expression || currentQ.prompt || '题目'}
                  </p>
                  {currentQ.userAnswer !== undefined && (
                    <p className="text-sm text-red-400">
                      你的答案：{String(currentQ.userAnswer)}{currentQ.userOption ? ` (${currentQ.userOption})` : ''}
                    </p>
                  )}
                </div>

                {/* Show Answer Button / Answer */}
                {!showAnswer ? (
                  <Button
                    onClick={() => setShowAnswer(true)}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-bold shadow-md"
                  >
                    查看正确答案 👀
                  </Button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="rounded-xl bg-emerald-50 p-4 text-center mb-4 border border-emerald-100">
                      <p className="text-xs text-emerald-600 mb-1">正确答案</p>
                      <p className="text-xl font-bold text-emerald-700">
                        {currentQ.correctAnswer !== undefined
                          ? String(currentQ.correctAnswer)
                          : currentQ.correctOption || '—'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => handleReviewAnswer(false)}
                        className="h-12 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold border border-red-100"
                      >
                        <XCircle className="w-4 h-4 mr-1.5" />
                        还是不会
                      </Button>
                      <Button
                        onClick={() => handleReviewAnswer(true)}
                        className="h-12 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold border border-emerald-100"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        已经会了
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <BottomNav />
      </div>
    );
  }

  // ── Normal Mode ──
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-orange-50/30 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 px-4 pt-3 pb-5 text-white safe-top">
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
              {stats.pendingCount} 题待复习
            </span>
          </div>
          <h1 className="text-2xl font-bold">📒 错题本</h1>
          <p className="text-white/70 text-xs mt-1">复习做错的题目，巩固薄弱环节</p>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pb-28">
        {/* Stats Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="-mt-3 mb-5"
        >
          <Card className="overflow-hidden border-0 shadow-lg py-0">
            <CardContent className="bg-gradient-to-r from-red-500 to-orange-500 p-4 text-white">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-2xl font-black">{stats.totalWrong}</p>
                  <p className="text-[10px] text-white/70">错题总数</p>
                </div>
                <div>
                  <p className="text-2xl font-black">{stats.pendingCount}</p>
                  <p className="text-[10px] text-white/70">待复习</p>
                </div>
                <div>
                  <p className="text-2xl font-black">{stats.masteredCount}</p>
                  <p className="text-[10px] text-white/70">已掌握</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weakest Areas */}
        {stats.weakestAreas.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-5"
          >
            <h3 className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
              <Target className="size-3 text-red-400" />
              薄弱环节
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {stats.weakestAreas.map((area) => (
                <div
                  key={area.name}
                  className="flex-shrink-0 rounded-lg bg-red-50 px-3 py-2 border border-red-100/60"
                >
                  <p className="text-xs font-bold text-red-600">{area.name}</p>
                  <p className="text-[10px] text-red-400">错 {area.count} 题</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Start Review Button */}
        {pendingReviews.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-5"
          >
            <Button
              onClick={startReview}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold text-base shadow-lg shadow-red-200/50 active:scale-95 transition-transform"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              开始复习（{Math.min(pendingReviews.length, 10)} 题待复习）
            </Button>
          </motion.div>
        )}

        {/* Filter Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mb-4"
        >
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveFilter(tab.key); playClickSound(); }}
                className={`flex-shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-medium transition-all active:scale-95 ${
                  activeFilter === tab.key
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-100 shadow-sm hover:bg-red-50'
                }`}
              >
                <span className="text-xs">{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Error List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {filteredErrors.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-12"
            >
              <span className="text-5xl block mb-3">
                {activeFilter === 'mastered' ? '🎉' : '🌟'}
              </span>
              <p className="text-sm text-gray-400">
                {activeFilter === 'mastered'
                  ? '还没有掌握的错题'
                  : '太棒了！没有错题！'}
              </p>
              <p className="text-xs text-gray-300 mt-1">
                {activeFilter === 'mastered'
                  ? '继续复习错题来掌握它们'
                  : '继续保持，争取不出错'}
              </p>
            </motion.div>
          ) : (
            filteredErrors.map((entry) => {
              const subjectConf = SUBJECT_CONFIG[entry.subject] || SUBJECT_CONFIG.math;
              return (
                <motion.div key={entry.id} variants={itemVariants}>
                  <Card
                    className={`overflow-hidden border-0 py-0 transition-all ${
                      entry.mastered ? 'opacity-60' : 'shadow-sm hover:shadow-md'
                    }`}
                  >
                    <CardContent className="p-3 bg-white">
                      <div className="flex items-center gap-3">
                        {/* Subject Icon */}
                        <div
                          className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl text-lg ${subjectConf.bg}`}
                        >
                          {subjectConf.emoji}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">
                            {entry.expression || entry.prompt || '题目'}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-emerald-500">
                              ✓ {entry.correctAnswer !== undefined ? String(entry.correctAnswer) : entry.correctOption || '—'}
                            </span>
                            <span className="text-[10px] text-red-400">
                              ✗ {entry.userAnswer !== undefined ? String(entry.userAnswer) : entry.userOption || '—'}
                            </span>
                            <span className="text-[9px] text-gray-300 ml-auto">
                              {formatRelativeTime(entry.timestamp)}
                            </span>
                          </div>
                        </div>

                        {/* Status / Actions */}
                        <div className="flex-shrink-0 flex items-center gap-1.5">
                          {entry.mastered ? (
                            <Badge className="bg-emerald-50 text-emerald-600 border-0 text-[8px] px-1.5 py-0">
                              <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                              掌握
                            </Badge>
                          ) : (
                            <Badge className="bg-red-50 text-red-500 border-0 text-[8px] px-1.5 py-0">
                              {entry.reviewCount}/3
                            </Badge>
                          )}
                          <button
                            onClick={() => handleRemove(entry.id)}
                            className="p-1 text-gray-300 hover:text-red-400 transition-colors active:scale-90"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </motion.div>

        {/* Action Buttons */}
        {allErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex gap-2"
          >
            {stats.masteredCount > 0 && (
              <Button
                onClick={handleClearMastered}
                variant="outline"
                className="flex-1 h-10 rounded-xl text-xs font-medium"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                清除已掌握 ({stats.masteredCount})
              </Button>
            )}
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 h-10 rounded-xl text-xs font-medium text-red-500 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              清空错题本
            </Button>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
