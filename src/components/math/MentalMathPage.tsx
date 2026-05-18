'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Flame,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  Zap,
  Brain,
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { addError } from '@/lib/error-book';
import { generateQuestions, calculateStars, calculateXP, formatTimeChinese } from '@/lib/math-utils';
import type { MathQuestion, Operation, Difficulty } from '@/lib/math-utils';
import { playClickSound, playCorrectSound, playWrongSound, playComboSound, playCompleteSound } from '@/lib/sound';
import CelebrationEffect from './CelebrationEffect';
import BottomNav from './BottomNav';

// ─── Types ──────────────────────────────────────────────────────────────────

type Phase = 'landing' | 'playing' | 'feedback' | 'result';

interface FeedbackData {
  isCorrect: boolean;
  correctAnswer: number;
  userAnswer: number;
}

interface MentalMathState {
  questions: MathQuestion[];
  currentIndex: number;
  correct: number;
  wrong: number;
  startTime: number;
  questionStartTime: number;
  combo: number;
  maxCombo: number;
  phase: Phase;
  feedback: FeedbackData | null;
}

// ─── Config ─────────────────────────────────────────────────────────────────

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; emoji: string; color: string; bg: string; desc: string }[] = [
  { value: 'easy', label: '简单', emoji: '🌱', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', desc: '1-10 以内' },
  { value: 'medium', label: '中等', emoji: '🌿', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', desc: '1-50 以内' },
  { value: 'hard', label: '困难', emoji: '🌳', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', desc: '1-100 以内' },
];

const COUNT_OPTIONS = [10, 20, 30];

const OPERATION_OPTIONS: { value: Operation; label: string }[] = [
  { value: 'add', label: '加法' },
  { value: 'subtract', label: '减法' },
  { value: 'multiply', label: '乘法' },
  { value: 'mix', label: '混合' },
];

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
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

// ─── Accuracy Circle ────────────────────────────────────────────────────────

function AccuracyCircle({ accuracy }: { accuracy: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (accuracy / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="130" height="130" className="-rotate-90">
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth="8"
        />
        <motion.circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke={accuracy >= 80 ? '#8b5cf6' : accuracy >= 60 ? '#f59e0b' : '#ef4444'}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-black text-gray-800"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 300, delay: 0.5 }}
        >
          {accuracy}%
        </motion.span>
        <span className="text-[10px] text-gray-400">正确率</span>
      </div>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function MentalMathPage() {
  const setCurrentView = useGameStore((s) => s.setCurrentView);
  const totalStars = useGameStore((s) => s.totalStars);
  const streak = useGameStore((s) => s.streak);

  // Config state
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [questionCount, setQuestionCount] = useState(10);
  const [operation, setOperation] = useState<Operation>('mix');

  // Game state
  const [gameState, setGameState] = useState<MentalMathState | null>(null);
  const [userInput, setUserInput] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [celebrationEmoji, setCelebrationEmoji] = useState('🎉');

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Timer ──
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 100);
    }, 100);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  // Auto-focus input on question change
  useEffect(() => {
    if (gameState?.phase === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState?.currentIndex, gameState?.phase]);

  // ── Start Game ──
  const startGame = useCallback(() => {
    const questions = generateQuestions(operation, difficulty, questionCount);
    setGameState({
      questions,
      currentIndex: 0,
      correct: 0,
      wrong: 0,
      startTime: Date.now(),
      questionStartTime: Date.now(),
      combo: 0,
      maxCombo: 0,
      phase: 'playing',
      feedback: null,
    });
    setUserInput('');
    setElapsedTime(0);
    startTimer();
    playClickSound();
  }, [operation, difficulty, questionCount, startTimer]);

  // ── Submit Answer ──
  const handleSubmitAnswer = useCallback(() => {
    if (!gameState || gameState.phase !== 'playing' || !userInput.trim()) return;

    const currentQ = gameState.questions[gameState.currentIndex];
    const answer = Number(userInput.trim());
    const isCorrect = answer === Number(currentQ.correctAnswer);
    const timeMs = Date.now() - gameState.questionStartTime;

    if (isCorrect) {
      playCorrectSound();
    } else {
      playWrongSound();
      // Track in error book
      addError({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        subject: 'math',
        expression: currentQ.expression || `${currentQ.num1} ${currentQ.displayOp} ${currentQ.num2}`,
        correctAnswer: Number(currentQ.correctAnswer),
        userAnswer: answer,
        operation: currentQ.operation,
        difficulty,
        mode: 'mental-math',
        timestamp: Date.now(),
        date: new Date().toISOString(),
        reviewCount: 0,
        mastered: false,
      });
    }

    // Combo sound for 3+ streak
    if (isCorrect && gameState.combo + 1 >= 3) {
      playComboSound();
    }

    const newCombo = isCorrect ? gameState.combo + 1 : 0;
    const newMaxCombo = Math.max(gameState.maxCombo, newCombo);
    const newCorrect = gameState.correct + (isCorrect ? 1 : 0);
    const newWrong = gameState.wrong + (isCorrect ? 0 : 1);

    const feedback: FeedbackData = {
      isCorrect,
      correctAnswer: Number(currentQ.correctAnswer),
      userAnswer: answer,
    };

    setGameState({
      ...gameState,
      correct: newCorrect,
      wrong: newWrong,
      combo: newCombo,
      maxCombo: newMaxCombo,
      phase: 'feedback',
      feedback,
    });

    // Auto-advance after 1.5s
    const isLast = gameState.currentIndex >= gameState.questions.length - 1;

    feedbackTimerRef.current = setTimeout(() => {
      if (isLast) {
        // Game over
        stopTimer();
        const finalTimeMs = Date.now() - gameState.startTime;
        const total = newCorrect + newWrong;
        const stars = calculateStars(newCorrect, total);
        const accuracy = total > 0 ? Math.round((newCorrect / total) * 100) : 0;

        // Record result
        useGameStore.getState().completeSubjectSession({
          correct: newCorrect,
          total,
          timeMs: finalTimeMs,
          maxCombo: newMaxCombo,
          subject: 'math',
          mode: 'mental-math',
          difficulty,
        });

        setGameState((prev) =>
          prev ? { ...prev, phase: 'result' } : null
        );

        // Celebration for high accuracy
        if (accuracy >= 80) {
          playCompleteSound();
          if (accuracy === 100) {
            setCelebrationMessage('满分！完美心算！');
            setCelebrationEmoji('🏆');
          } else if (accuracy >= 90) {
            setCelebrationMessage('太厉害了！');
            setCelebrationEmoji('🌟');
          } else {
            setCelebrationMessage('很棒！');
            setCelebrationEmoji('🎉');
          }
          setShowCelebration(true);
        }
      } else {
        // Next question
        setGameState((prev) =>
          prev
            ? {
                ...prev,
                currentIndex: prev.currentIndex + 1,
                phase: 'playing',
                feedback: null,
                questionStartTime: Date.now(),
              }
            : null
        );
        setUserInput('');
      }
    }, 1500);
  }, [gameState, userInput, difficulty, stopTimer]);

  // ── Reset ──
  const handleReset = useCallback(() => {
    stopTimer();
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setGameState(null);
    setUserInput('');
    setElapsedTime(0);
    setShowCelebration(false);
    playClickSound();
  }, [stopTimer]);

  // ── Render: Result View ──
  if (gameState?.phase === 'result') {
    const total = gameState.correct + gameState.wrong;
    const accuracy = total > 0 ? Math.round((gameState.correct / total) * 100) : 0;
    const totalTimeMs = Date.now() - gameState.startTime;
    const avgTimeMs = total > 0 ? Math.round(totalTimeMs / total) : 0;
    const stars = calculateStars(gameState.correct, total);
    const xp = calculateXP(gameState.correct, total, totalTimeMs, stars, gameState.maxCombo);
    const lastResult = useGameStore.getState().lastResult;
    const coinsEarned = lastResult?.coinsEarned ?? 0;

    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 via-purple-50/30 to-white">
        <div className="mx-auto max-w-md px-4 py-6 pb-28">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl mb-3"
              >
                {accuracy >= 90 ? '🏆' : accuracy >= 60 ? '🌟' : '💪'}
              </motion.div>
              <h1 className="text-2xl font-black text-gray-800 mb-1">
                {accuracy >= 90 ? '心算高手！' : accuracy >= 60 ? '不错的表现！' : '继续加油！'}
              </h1>
              <p className="text-sm text-gray-500">心算挑战完成</p>
            </div>

            {/* Accuracy Circle */}
            <div className="flex justify-center mb-6">
              <AccuracyCircle accuracy={accuracy} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <Card className="border-0 shadow-sm py-0">
                <CardContent className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 text-center">
                  <Clock className="w-4 h-4 text-violet-400 mx-auto mb-1" />
                  <p className="text-lg font-black text-violet-600">{formatTimeChinese(avgTimeMs)}</p>
                  <p className="text-[10px] text-violet-400">平均每题</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm py-0">
                <CardContent className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 text-center">
                  <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <p className="text-lg font-black text-amber-600">{formatTimeChinese(totalTimeMs)}</p>
                  <p className="text-[10px] text-amber-400">总用时</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm py-0">
                <CardContent className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 text-center">
                  <Flame className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                  <p className="text-lg font-black text-rose-600">🔥 {gameState.maxCombo}x</p>
                  <p className="text-[10px] text-rose-400">最佳连击</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm py-0">
                <CardContent className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 text-center">
                  <Star className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <p className="text-lg font-black text-emerald-600">{stars}⭐</p>
                  <p className="text-[10px] text-emerald-400">获得星星</p>
                </CardContent>
              </Card>
            </div>

            {/* Rewards Row */}
            <div className="flex justify-center gap-4 mb-6">
              <div className="flex items-center gap-1.5 bg-violet-50 rounded-full px-4 py-2 border border-violet-100">
                <Zap className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-bold text-violet-600">+{xp} XP</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 rounded-full px-4 py-2 border border-amber-100">
                <span className="text-sm">🪙</span>
                <span className="text-sm font-bold text-amber-600">+{coinsEarned}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 rounded-full px-4 py-2 border border-emerald-100">
                <Star className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-emerald-600">+{stars}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={startGame}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold shadow-lg shadow-violet-200/50 active:scale-95 transition-transform"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                再来一次
              </Button>
              <Button
                onClick={() => { playClickSound(); setCurrentView('math-home'); }}
                variant="outline"
                className="w-full h-12 rounded-xl font-medium"
              >
                返回
              </Button>
            </div>
          </motion.div>
        </div>
        <BottomNav />
        <CelebrationEffect
          show={showCelebration}
          message={celebrationMessage}
          emoji={celebrationEmoji}
          duration={3000}
          onComplete={() => setShowCelebration(false)}
        />
      </div>
    );
  }

  // ── Render: Playing View ──
  if (gameState && (gameState.phase === 'playing' || gameState.phase === 'feedback')) {
    const currentQ = gameState.questions[gameState.currentIndex];
    const progress = ((gameState.currentIndex + 1) / gameState.questions.length) * 100;
    const isFeedback = gameState.phase === 'feedback';

    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 via-purple-50/20 to-white">
        {/* Header with timer & progress */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-4 pb-4 text-white">
          <div className="mx-auto max-w-md">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-white/80 hover:text-white text-sm active:scale-95 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                退出
              </button>
              <div className="flex items-center gap-3">
                {/* Combo indicator */}
                {gameState.combo >= 2 && (
                  <motion.span
                    key={gameState.combo}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-xs font-bold bg-orange-400/80 rounded-full px-2.5 py-0.5"
                  >
                    🔥 x{gameState.combo}
                  </motion.span>
                )}
                {/* Timer counting up */}
                <span className="text-sm font-mono font-bold text-white/90">
                  {formatTime(elapsedTime)}
                </span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-white/70">
                {gameState.currentIndex + 1}/{gameState.questions.length}
              </span>
              <div className="flex-1 h-2 rounded-full bg-white/20 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-white"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-md px-4 pb-28 pt-6">
          {/* Question Card */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={gameState.currentIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
              >
                <Card className="overflow-hidden border-0 shadow-lg py-0 mb-5">
                  <CardContent className="p-6">
                    {/* Operation badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-violet-50 text-violet-600 border-0 text-[10px]">
                        🧠 心算
                      </Badge>
                      <Badge className="bg-purple-50 text-purple-500 border-0 text-[10px]">
                        {OPERATION_OPTIONS.find(o => o.value === currentQ.operation)?.label ?? currentQ.operation}
                      </Badge>
                    </div>

                    {/* Question display */}
                    <div className="text-center py-10 relative">
                      <motion.p
                        className="text-5xl font-black text-gray-800 mb-2"
                        animate={isFeedback ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {currentQ.expression || `${currentQ.num1} ${currentQ.displayOp} ${currentQ.num2}`}
                      </motion.p>
                      <p className="text-2xl text-gray-300 font-bold">= ?</p>

                      {/* Feedback overlay */}
                      <AnimatePresence>
                        {isFeedback && gameState.feedback && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <div className={`flex flex-col items-center gap-2 rounded-2xl px-8 py-5 ${
                              gameState.feedback.isCorrect
                                ? 'bg-emerald-50 border border-emerald-200'
                                : 'bg-red-50 border border-red-200'
                            }`}>
                              <motion.span
                                className="text-5xl"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring' as const, delay: 0.1 }}
                              >
                                {gameState.feedback.isCorrect ? '✅' : '❌'}
                              </motion.span>
                              {!gameState.feedback.isCorrect && (
                                <p className="text-sm font-bold text-red-600">
                                  正确答案: {gameState.feedback.correctAnswer}
                                </p>
                              )}
                              {gameState.feedback.isCorrect && (
                                <p className="text-sm font-bold text-emerald-600">
                                  太棒了！
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Answer Input */}
                    {!isFeedback && (
                      <div className="flex gap-2">
                        <input
                          ref={inputRef}
                          type="number"
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                          placeholder="输入答案"
                          className="flex-1 h-14 rounded-xl border-2 border-violet-200 px-4 text-center text-2xl font-black text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent placeholder:text-violet-200 placeholder:font-normal placeholder:text-base"
                          autoFocus
                          inputMode="numeric"
                        />
                        <Button
                          onClick={handleSubmitAnswer}
                          disabled={!userInput.trim()}
                          className="h-14 w-16 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold shadow-md shadow-violet-200/50 p-0 active:scale-95 transition-transform"
                        >
                          ✓
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Stats Row */}
          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="font-bold text-emerald-600">{gameState.correct}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <XIcon className="w-4 h-4 text-red-400" />
              <span className="font-bold text-red-500">{gameState.wrong}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="font-bold text-orange-500">{gameState.combo}</span>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  // ── Render: Landing View ──
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-purple-50/30 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-4 pb-6 text-white">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => { playClickSound(); setCurrentView('math-home'); }}
              className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors active:scale-95 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
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
          <h1 className="text-2xl font-bold">🧠 心算挑战</h1>
          <p className="text-white/70 text-xs mt-1">锻炼你的心算能力</p>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-md px-4 pb-28"
      >
        {/* Explanation */}
        <motion.div variants={itemVariants} className="-mt-3 mb-5">
          <Card className="overflow-hidden border-0 shadow-lg py-0">
            <CardContent className="bg-gradient-to-r from-violet-500 to-purple-600 p-5 text-white">
              <div className="text-center">
                <motion.span
                  className="text-5xl block mb-3"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🧠
                </motion.span>
                <p className="text-base font-bold mb-1">用心算算出答案，越快越好！</p>
                <p className="text-white/70 text-xs">没有选项提示，考验你的真实心算实力</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Difficulty Selector */}
        <motion.div variants={itemVariants} className="mb-5">
          <h3 className="text-xs font-bold text-gray-500 mb-2.5 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-violet-400" />
            选择难度
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <motion.button
                key={opt.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setDifficulty(opt.value); playClickSound(); }}
                className={`rounded-2xl p-3 border-2 transition-all text-center ${
                  difficulty === opt.value
                    ? `${opt.bg} shadow-md`
                    : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'
                }`}
              >
                <span className="text-2xl block mb-1">{opt.emoji}</span>
                <p className={`text-sm font-bold ${difficulty === opt.value ? opt.color : 'text-gray-600'}`}>
                  {opt.label}
                </p>
                <p className="text-[9px] text-gray-400 mt-0.5">{opt.desc}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Operation Selector */}
        <motion.div variants={itemVariants} className="mb-5">
          <h3 className="text-xs font-bold text-gray-500 mb-2.5 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-violet-400" />
            运算类型
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {OPERATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setOperation(opt.value); playClickSound(); }}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                  operation === opt.value
                    ? 'bg-violet-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 shadow-sm border border-gray-100 hover:border-violet-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Question Count Selector */}
        <motion.div variants={itemVariants} className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 mb-2.5 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-violet-400" />
            题目数量
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            {COUNT_OPTIONS.map((count) => (
              <button
                key={count}
                onClick={() => { setQuestionCount(count); playClickSound(); }}
                className={`py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                  questionCount === count
                    ? 'bg-violet-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 shadow-sm border border-gray-100 hover:border-violet-200'
                }`}
              >
                {count}题
              </button>
            ))}
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.div variants={itemVariants}>
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Button
              onClick={startGame}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold text-base shadow-lg shadow-violet-200/50 active:scale-95 transition-transform"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              开始挑战
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      <BottomNav />
    </div>
  );
}

// ─── Helper: Format elapsed time as M:SS.s ──────────────────────────────────

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}`;
  }
  return `${seconds}.${tenths}`;
}

// ─── Simple X icon ──────────────────────────────────────────────────────────

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
