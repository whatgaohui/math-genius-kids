'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Delete,
  Flame,
  Gift,
  Sparkles,
  Star,
  Target,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { addError } from '@/lib/error-book';
import { generateQuestions, calculateStars, calculateXP } from '@/lib/math-utils';
import type { MathQuestion } from '@/lib/math-utils';
import { playClickSound, playCorrectSound, playWrongSound, resumeAudioContext } from '@/lib/sound';
import { usePetStore } from '@/lib/pet-store';
import BottomNav from './BottomNav';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DailyChallengeState {
  questions: MathQuestion[];
  currentIndex: number;
  correct: number;
  wrong: number;
  startTime: number;
  questionStartTime: number;
  combo: number;
  maxCombo: number;
  answers: { questionId: string; answer: number; correct: boolean; timeMs: number }[];
  completed: boolean;
}

// ─── Daily Challenge Config ─────────────────────────────────────────────────

function getDailySeed(): number {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

function getDailyChallengeConfig(): {
  operation: string;
  difficulty: string;
  count: number;
  label: string;
  emoji: string;
  description: string;
} {
  const seed = getDailySeed();
  const operations = ['add', 'subtract', 'multiply', 'mix'];
  const difficulties = ['easy', 'medium', 'hard'];
  const opIndex = seed % operations.length;
  const diffIndex = seed % difficulties.length;

  const operationLabels: Record<string, string> = {
    add: '加法',
    subtract: '减法',
    multiply: '乘法',
    mix: '混合',
  };

  const diffLabels: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
  };

  return {
    operation: operations[opIndex],
    difficulty: difficulties[diffIndex],
    count: 10,
    label: `${operationLabels[operations[opIndex]]}挑战`,
    emoji: opIndex === 3 ? '🎲' : opIndex === 2 ? '✖️' : opIndex === 1 ? '➖' : '➕',
    description: `今日${diffLabels[difficulties[diffIndex]]}难度 · ${operationLabels[operations[opIndex]]} · 10题`,
  };
}

function generateDailyQuestions(): MathQuestion[] {
  const config = getDailyChallengeConfig();
  return generateQuestions(
    config.operation as 'add' | 'subtract' | 'multiply' | 'mix',
    config.difficulty as 'easy' | 'medium' | 'hard',
    config.count
  );
}

// ─── Confetti Particles ─────────────────────────────────────────────────────

const CONFETTI_PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 0.2,
  color: ['#f59e0b', '#f97316', '#10b981', '#3b82f6', '#8b5cf6'][i % 5],
  size: 6 + Math.random() * 6,
}));

// ─── Component ──────────────────────────────────────────────────────────────

export default function DailyChallengePage() {
  const setCurrentView = useGameStore((s) => s.setCurrentView);
  const dailyChallengeCompletedDates = useGameStore((s) => s.dailyChallengeCompletedDates);
  const streak = useGameStore((s) => s.streak);
  const totalStars = useGameStore((s) => s.totalStars);

  const [challengeState, setChallengeState] = useState<DailyChallengeState | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const config = useMemo(() => getDailyChallengeConfig(), []);
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const isCompleted = dailyChallengeCompletedDates.includes(today);

  // Resume audio context on first interaction
  useEffect(() => {
    const handler = () => resumeAudioContext();
    document.addEventListener('touchstart', handler, { once: true });
    document.addEventListener('click', handler, { once: true });
    return () => {
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('click', handler);
    };
  }, []);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
    };
  }, []);

  const startChallenge = useCallback(() => {
    const questions = generateDailyQuestions();
    setChallengeState({
      questions,
      currentIndex: 0,
      correct: 0,
      wrong: 0,
      startTime: Date.now(),
      questionStartTime: Date.now(),
      combo: 0,
      maxCombo: 0,
      answers: [],
      completed: false,
    });
    setShowResult(false);
    setInputValue('');
    playClickSound();
  }, []);

  const handleSubmitAnswer = useCallback((answer: number) => {
    if (!challengeState || showFeedback) return;

    const currentQ = challengeState.questions[challengeState.currentIndex];
    const isCorrect = Number(answer) === Number(currentQ.correctAnswer);
    const timeMs = Date.now() - challengeState.questionStartTime;

    if (isCorrect) {
      playCorrectSound();
    } else {
      playWrongSound();
      addError({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        subject: 'math',
        expression: currentQ.expression || `${currentQ.num1} ${currentQ.displayOp} ${currentQ.num2}`,
        correctAnswer: Number(currentQ.correctAnswer),
        userAnswer: answer,
        operation: config.operation,
        difficulty: config.difficulty,
        mode: 'daily',
        timestamp: Date.now(),
        date: new Date().toISOString(),
        reviewCount: 0,
        mastered: false,
      });
    }

    // Show feedback animation
    setShowFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setShowConfetti(true);
      if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
      confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 1000);
    }

    feedbackTimerRef.current = setTimeout(() => {
      setShowFeedback(null);

      const newCombo = isCorrect ? challengeState.combo + 1 : 0;
      const newAnswers = [...challengeState.answers, { questionId: currentQ.id, answer, correct: isCorrect, timeMs }];
      const newCorrect = challengeState.correct + (isCorrect ? 1 : 0);
      const newWrong = challengeState.wrong + (isCorrect ? 0 : 1);
      const isLast = challengeState.currentIndex >= challengeState.questions.length - 1;

      if (isLast) {
        const finalMaxCombo = Math.max(challengeState.maxCombo, newCombo);
        const finalTimeMs = Date.now() - challengeState.startTime;
        setChallengeState({
          ...challengeState,
          correct: newCorrect,
          wrong: newWrong,
          combo: newCombo,
          maxCombo: finalMaxCombo,
          answers: newAnswers,
          completed: true,
        });
        setShowResult(true);

        const gameState = useGameStore.getState();
        const isFirstCompletion = !gameState.dailyChallengeCompletedDates.includes(
          new Date().toISOString().split('T')[0]
        );

        useGameStore.getState().completeSubjectSession({
          correct: newCorrect,
          total: challengeState.questions.length,
          timeMs: finalTimeMs,
          maxCombo: finalMaxCombo,
          subject: 'math',
          mode: 'daily',
          difficulty: config.difficulty,
        });

        if (isFirstCompletion) {
          const petStore = usePetStore.getState();
          const resultState = useGameStore.getState();
          const earnedCoins = resultState.lastResult?.coinsEarned ?? 0;
          const bonusCoins = Math.floor(earnedCoins * 0.5);
          if (bonusCoins > 0) {
            petStore.addCoins(bonusCoins);
          }
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const state = useGameStore.getState();
        if (!state.dailyChallengeCompletedDates.includes(todayStr)) {
          useGameStore.setState({
            dailyChallengeCompletedDates: [...state.dailyChallengeCompletedDates, todayStr],
          });
        }
      } else {
        setChallengeState({
          ...challengeState,
          currentIndex: challengeState.currentIndex + 1,
          correct: newCorrect,
          wrong: newWrong,
          combo: newCombo,
          maxCombo: Math.max(challengeState.maxCombo, newCombo),
          answers: newAnswers,
          questionStartTime: Date.now(),
        });
        setInputValue('');
      }
    }, isCorrect ? 400 : 800);
  }, [challengeState, showFeedback, config]);

  // ── Number pad handlers ──
  const handleNumPress = useCallback((num: string) => {
    if (showFeedback || !challengeState) return;
    setInputValue((prev) => {
      const newVal = prev + num;
      if (newVal.length > 6) return prev;
      return newVal;
    });
  }, [challengeState, showFeedback]);

  const handleDelete = useCallback(() => {
    if (showFeedback) return;
    setInputValue((prev) => prev.slice(0, -1));
  }, [showFeedback]);

  const handleToggleNegative = useCallback(() => {
    if (showFeedback || !challengeState) return;
    setInputValue((prev) => {
      if (prev.startsWith('-')) return prev.slice(1);
      return '-' + prev;
    });
  }, [challengeState, showFeedback]);

  const handleNumericSubmit = useCallback(() => {
    if (!inputValue) return;
    const num = parseInt(inputValue, 10);
    if (isNaN(num)) return;
    handleSubmitAnswer(num);
  }, [inputValue, handleSubmitAnswer]);

  // ── Result View ──
  if (showResult && challengeState) {
    const total = challengeState.correct + challengeState.wrong;
    const accuracy = total > 0 ? Math.round((challengeState.correct / total) * 100) : 0;
    const timeMs = Date.now() - challengeState.startTime;
    const stars = calculateStars(challengeState.correct, total);
    const xp = calculateXP(challengeState.correct, total, timeMs, stars, challengeState.maxCombo);

    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50/30 to-white">
        <div className="mx-auto max-w-md px-4 py-6 pb-28">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-center"
          >
            {/* Trophy Animation */}
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              {accuracy >= 90 ? '🏆' : accuracy >= 60 ? '🌟' : '💪'}
            </motion.div>

            <h1 className="text-2xl font-black text-gray-800 mb-1">
              {accuracy >= 90 ? '太厉害了！' : accuracy >= 60 ? '不错的表现！' : '继续加油！'}
            </h1>
            <p className="text-sm text-gray-500 mb-6">每日挑战完成！</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card className="border-0 shadow-sm py-0">
                <CardContent className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 text-center">
                  <p className="text-3xl font-black text-amber-600">{accuracy}%</p>
                  <p className="text-[10px] text-amber-500">正确率</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm py-0">
                <CardContent className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 text-center">
                  <p className="text-3xl font-black text-emerald-600">{stars}⭐</p>
                  <p className="text-[10px] text-emerald-500">获得星星</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm py-0">
                <CardContent className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 text-center">
                  <p className="text-3xl font-black text-violet-600">{xp}</p>
                  <p className="text-[10px] text-violet-500">经验值</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm py-0">
                <CardContent className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 text-center">
                  <p className="text-3xl font-black text-rose-600">{challengeState.maxCombo}x</p>
                  <p className="text-[10px] text-rose-500">最高连击</p>
                </CardContent>
              </Card>
            </div>

            {/* Bonus Info */}
            {!isCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 p-3 mb-6 border border-amber-200"
              >
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-bold text-amber-700">首次完成奖励 ×1.5</span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setChallengeState(null);
                  setShowResult(false);
                }}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-bold shadow-md"
              >
                🔄 再来一次
              </Button>
              <Button
                onClick={() => { setCurrentView('home'); }}
                variant="outline"
                className="w-full h-12 rounded-xl font-medium"
              >
                返回首页
              </Button>
            </div>
          </motion.div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── Playing Mode ── (with number pad, no BottomNav to maximize space)
  if (challengeState && !challengeState.completed) {
    const currentQ = challengeState.questions[challengeState.currentIndex];
    const progress = ((challengeState.currentIndex + 1) / challengeState.questions.length) * 100;
    const currentCombo = challengeState.combo;

    // Get display expression
    const getDisplay = (q: MathQuestion) => {
      if (q.expression) {
        if (q.expression.includes('=') || q.expression.includes('？')) return q.expression;
        return `${q.expression} = ?`;
      }
      return `${q.num1} ${q.displayOp} ${q.num2} = ?`;
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col relative overflow-x-hidden max-w-lg mx-auto">
        {/* Confetti */}
        <AnimatePresence>
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-50">
              {CONFETTI_PARTICLES.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 1, top: '20%', left: `${p.x}%`, scale: 0 }}
                  animate={{ opacity: 0, top: '110%', left: `${p.x + (Math.random() - 0.5) * 30}%`, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, delay: p.delay }}
                  className="absolute rounded-sm"
                  style={{ width: p.size, height: p.size, backgroundColor: p.color }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 pt-3 py-3 text-white safe-top flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => {
                if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
                setChallengeState(null);
                playClickSound();
              }}
              className="flex items-center gap-1 text-white/80 hover:text-white text-sm active:scale-95 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              退出
            </button>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-bold">{challengeState.correct}</span>
              </div>
              <div className="flex items-center gap-1">
                <XIcon className="w-4 h-4" />
                <span className="text-sm font-bold">{challengeState.wrong}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentCombo > 1 && (
                <motion.span
                  key={currentCombo}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs font-bold bg-orange-400/80 rounded-full px-2 py-0.5"
                >
                  🔥 {currentCombo}
                </motion.span>
              )}
              <span className="text-sm font-medium text-white/80">
                {challengeState.currentIndex + 1}/{challengeState.questions.length}
              </span>
            </div>
          </div>
          <div className="h-2 rounded-full bg-white/20 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-white"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 max-w-lg mx-auto w-full">
          {/* Combo Badge */}
          <AnimatePresence>
            {currentCombo >= 3 && (
              <motion.div
                key={currentCombo}
                initial={{ scale: 0, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="mb-3"
              >
                <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-white border-none px-3 py-1.5 text-sm gap-1 shadow-lg">
                  <Flame className="w-4 h-4" />
                  {currentCombo} 连击
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Question Card */}
          <motion.div
            key={challengeState.currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full mb-4"
          >
            <div className={`
              relative bg-white rounded-2xl shadow-lg border-2 p-5 text-center transition-all
              ${showFeedback === 'correct'
                ? 'border-emerald-300 bg-emerald-50'
                : showFeedback === 'wrong'
                  ? 'border-red-300 bg-red-50'
                  : 'border-amber-100'
              }
            `}>
              {/* Feedback overlay */}
              <AnimatePresence>
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: showFeedback === 'correct' ? 0 : [0, -6, 6, -4, 4, 0],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: showFeedback === 'wrong' ? 0.3 : 0.2 }}
                    className="absolute inset-0 flex items-center justify-center z-10 bg-white/70 rounded-2xl"
                  >
                    {showFeedback === 'correct' ? (
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.3 }}>
                        <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                      </motion.div>
                    ) : (
                      <XCircle className="w-16 h-16 text-red-500" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Badges */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <Badge className="bg-amber-50 text-amber-600 border-0 text-[10px]">
                  {config.emoji} {config.label}
                </Badge>
                <Badge className="bg-orange-50 text-orange-500 border-0 text-[10px]">
                  🎯 每日挑战
                </Badge>
              </div>

              {/* Question text */}
              <p className="text-3xl sm:text-4xl font-bold text-gray-800 tracking-wide">
                {getDisplay(currentQ)}
              </p>

              {/* Input display */}
              <div className="mt-3 min-h-[44px] flex items-center justify-center">
                <span className="text-4xl font-bold text-amber-500 font-mono">
                  {inputValue || <span className="text-gray-300">_</span>}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Number Pad */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full"
          >
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumPress(String(num))}
                  disabled={!!showFeedback}
                  className="h-14 rounded-xl bg-white border-2 border-gray-200 text-gray-800 font-bold text-xl shadow-sm hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50 select-none"
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              <button
                onClick={handleDelete}
                disabled={!!showFeedback}
                className="h-14 rounded-xl bg-red-50 border-2 border-red-200 text-red-500 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 select-none"
              >
                <Delete className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleNumPress('0')}
                disabled={!!showFeedback}
                className="h-14 rounded-xl bg-white border-2 border-gray-200 text-gray-800 font-bold text-xl shadow-sm hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50 select-none"
              >
                0
              </button>
              <button
                onClick={handleToggleNegative}
                disabled={!!showFeedback}
                className="h-14 rounded-xl bg-indigo-50 border-2 border-indigo-200 text-indigo-600 font-bold text-lg shadow-sm hover:bg-indigo-100 transition-all active:scale-95 disabled:opacity-50 select-none"
              >
                ±
              </button>
              <button
                onClick={handleNumericSubmit}
                disabled={!!showFeedback || !inputValue}
                className="h-14 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-xl shadow-md hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 select-none"
              >
                ✓
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Landing / Intro View ──
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50/30 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 pt-3 pb-6 text-white safe-top">
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
              {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl font-bold">🎯 每日挑战</h1>
          <p className="text-white/70 text-xs mt-1">每天一道专属练习，保持学习节奏！</p>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pb-28">
        {/* Today's Challenge Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="-mt-3 mb-5"
        >
          <Card className="overflow-hidden border-0 shadow-lg py-0">
            <CardContent className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white">
              <div className="text-center">
                <motion.span
                  className="text-5xl block mb-3"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {config.emoji}
                </motion.span>
                <h2 className="text-lg font-bold mb-1">今日挑战</h2>
                <p className="text-white/80 text-xs mb-3">{config.description}</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" />
                    <span className="text-xs">{config.count}题</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">限时挑战</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" />
                    <span className="text-xs">额外奖励</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-5"
        >
          {isCompleted ? (
            <Card className="overflow-hidden border-0 shadow-sm py-0">
              <CardContent className="bg-emerald-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                    <CheckCircle2 className="text-emerald-500" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-700">今日挑战已完成！✨</p>
                    <p className="text-[10px] text-emerald-500">明天再来挑战新的题目吧</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden border-0 shadow-sm py-0">
              <CardContent className="bg-amber-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                    <Gift className="text-amber-500" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-700">首次完成额外奖励 ×1.5</p>
                    <p className="text-[10px] text-amber-500">完成今日挑战获得更多经验和金币</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-5"
        >
          <div className="grid grid-cols-3 gap-2">
            <Card className="border-0 shadow-sm py-0">
              <CardContent className="p-3 text-center">
                <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                <p className="text-lg font-black text-gray-800">{streak}</p>
                <p className="text-[9px] text-gray-400">连续天数</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm py-0">
              <CardContent className="p-3 text-center">
                <Trophy className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <p className="text-lg font-black text-gray-800">{dailyChallengeCompletedDates.length}</p>
                <p className="text-[9px] text-gray-400">完成次数</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm py-0">
              <CardContent className="p-3 text-center">
                <Star className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                <p className="text-lg font-black text-gray-800">{totalStars}</p>
                <p className="text-[9px] text-gray-400">累计星星</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <Button
            onClick={startChallenge}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-base shadow-lg shadow-amber-200/50 active:scale-95 transition-transform"
          >
            {isCompleted ? '🔄 再来一次' : '🚀 开始挑战'}
          </Button>
        </motion.div>

        {/* Recent completions */}
        {dailyChallengeCompletedDates.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <h3 className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
              <CalendarDays className="size-3 text-amber-400" />
              挑战记录
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {dailyChallengeCompletedDates.slice(-7).reverse().map((date) => (
                <div
                  key={date}
                  className="flex-shrink-0 rounded-lg bg-amber-50 px-3 py-2 border border-amber-100/60 text-center"
                >
                  <p className="text-[10px] font-bold text-amber-600">{date.slice(5)}</p>
                  <p className="text-xs">✅</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

// Simple X icon to avoid import conflicts
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
