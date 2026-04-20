'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Delete,
  Zap,
  Trophy,
  Flame,
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { playCorrectSound, playWrongSound, playComboSound, resumeAudioContext } from '@/lib/sound';
import { generateQuestions } from '@/lib/math-utils';
import { generateCurriculumQuestions, type Grade, type Semester } from '@/lib/math-curriculum';
import type { MathQuestion } from '@/lib/math-utils';

// ─── Confetti Particles ─────────────────────────────────────────────────────

const CONFETTI = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 0.2,
  color: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'][i % 5],
  size: 6 + Math.random() * 6,
}));

// ─── Component ──────────────────────────────────────────────────────────────

export default function SpeedGamePlay() {
  const {
    session,
    speedTimeLimit,
    setCurrentView,
    answerQuestion,
    endSession,
    soundEnabled,
    startMathSession,
    speedOperation,
  } = useGameStore();

  const [inputValue, setInputValue] = useState('');
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState(speedTimeLimit);
  const [isFinished, setIsFinished] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const currentCombo = session?.sessionCurrentCombo ?? 0;
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [floatingXP, setFloatingXP] = useState<{ id: number; x: number; y: number }[]>([]);
  const xpIdRef = useRef(0);

  // Resume audio
  useEffect(() => {
    const handler = () => resumeAudioContext();
    document.addEventListener('touchstart', handler, { once: true });
    document.addEventListener('click', handler, { once: true });
    return () => {
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('click', handler);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!gameStarted || isFinished) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, isFinished]);

  // When finished, go to result
  useEffect(() => {
    if (!isFinished) return;

    // Small delay before transitioning
    const timer = setTimeout(() => {
      // Save wrong answers before session is cleared
      const allQuestions = useGameStore.getState().session?.questions as MathQuestion[] | undefined;
      const wrongs = allQuestions
        ? allQuestions.filter((q) => q.isCorrect === false).map((q) => ({
            expression: q.expression ?? `${q.num1} ${q.displayOp} ${q.num2}`,
            correctAnswer: q.correctAnswer,
            userAnswer: q.userAnswer ?? 0,
          }))
        : [];
      try { sessionStorage.setItem('math-wrong-answers', JSON.stringify(wrongs)); } catch { /* ignore */ }

      endSession();
      setCurrentView('result');
    }, 100);

    return () => clearTimeout(timer);
  }, [isFinished, endSession, setCurrentView]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
    };
  }, []);

  const currentQuestion = session
    ? (session.questions[session.currentQuestionIndex] as MathQuestion)
    : null;

  // Auto-start the game
  useEffect(() => {
    if (session && !gameStarted) {
      setGameStarted(true);
    }
  }, [session, gameStarted]);

  const addFloatingXP = useCallback(() => {
    const card = document.querySelector('[data-question-card]');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const id = ++xpIdRef.current;
    setFloatingXP((prev) => [...prev, { id, x: rect.width / 2, y: rect.height / 2 }]);
    setTimeout(() => {
      setFloatingXP((prev) => prev.filter((xp) => xp.id !== id));
    }, 1000);
  }, []);

  const handleNumPress = useCallback((num: string) => {
    if (showFeedback || isFinished || !currentQuestion) return;
    if (currentQuestion.operation === 'compare') return;

    setInputValue((prev) => {
      const newVal = prev + num;
      if (newVal.length > 6) return prev;
      return newVal;
    });
  }, [currentQuestion, showFeedback, isFinished]);

  const handleDelete = useCallback(() => {
    if (showFeedback || isFinished) return;
    setInputValue((prev) => prev.slice(0, -1));
  }, [showFeedback, isFinished]);

  const handleToggleNegative = useCallback(() => {
    if (showFeedback || isFinished || !currentQuestion) return;
    if (currentQuestion.operation === 'compare') return;
    setInputValue((prev) => {
      if (prev.startsWith('-')) return prev.slice(1);
      return '-' + prev;
    });
  }, [currentQuestion, showFeedback, isFinished]);

  const handleSubmit = useCallback((answer: number | boolean) => {
    if (!session || !currentQuestion || showFeedback || isFinished) return;

    const questionTime = Date.now() - session.questionStartTime;
    const isCorrect =
      typeof answer === 'boolean'
        ? answer === currentQuestion.correctAnswer
        : Number(answer) === Number(currentQuestion.correctAnswer);

    answerQuestion(currentQuestion.id, answer, questionTime);

    if (soundEnabled) {
      if (isCorrect) {
        playCorrectSound();
        const newCombo = (useGameStore.getState().session?.sessionCurrentCombo ?? 0);
        if (newCombo >= 3) playComboSound(newCombo);
      } else {
        playWrongSound();
      }
    }

    setShowFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setShowConfetti(true);
      addFloatingXP();
      if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
      confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 1000);
    }

    feedbackTimerRef.current = setTimeout(() => {
      setShowFeedback(null);
      setInputValue('');

      // Always advance to next question in speed mode (racing against time)
      const latestSession = useGameStore.getState().session;
      if (!latestSession) return;

      const nextIndex = latestSession.currentQuestionIndex + 1;
      if (nextIndex < latestSession.questions.length) {
        useGameStore.setState({
          session: {
            ...latestSession,
            currentQuestionIndex: nextIndex,
            questionStartTime: Date.now(),
          },
        });
      } else {
        // All questions exhausted - regenerate more (use curriculum if configured)
        const newQuestions = [...(latestSession.questions as MathQuestion[])];
        let more: MathQuestion[];
        const mathGrade = useGameStore.getState().selectedMathGrade;
        const mathSemester = useGameStore.getState().selectedMathSemester;
        if (mathGrade > 0 && mathSemester) {
          const curriculumMore = generateCurriculumQuestions(mathGrade as Grade, mathSemester as Semester, 20);
          more = curriculumMore.length > 0 ? curriculumMore : generateQuestions(speedOperation, 'easy', 20);
        } else {
          more = generateQuestions(speedOperation, 'easy', 20);
        }
        const updatedSession = {
          ...latestSession,
          questions: [...newQuestions, ...more],
          currentQuestionIndex: nextIndex,
          questionStartTime: Date.now(),
        };
        useGameStore.setState({ session: updatedSession });
      }
    }, isCorrect ? 300 : 800);
  }, [session, currentQuestion, showFeedback, isFinished, soundEnabled, answerQuestion, speedOperation]);

  const handleNumericSubmit = useCallback(() => {
    if (!inputValue || !currentQuestion) return;
    const num = parseInt(inputValue, 10);
    if (isNaN(num)) return;
    handleSubmit(num);
  }, [inputValue, currentQuestion, handleSubmit]);

  const handleCompare = useCallback((answer: boolean) => {
    handleSubmit(answer);
  }, [handleSubmit]);

  const handleBack = () => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    useGameStore.getState().resetGame();
    setCurrentView('math-home');
  };

  if (!session || !currentQuestion) {
    const isEmpty = session && session.questions.length === 0;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 to-white">
        {isEmpty ? (
          <div className="text-center">
            <p className="text-gray-400 mb-4">题目加载失败</p>
            <button
              onClick={handleBack}
              className="text-rose-500 underline text-sm"
            >
              返回重试
            </button>
          </div>
        ) : (
          <p className="text-gray-400">加载中...</p>
        )}
      </div>
    );
  }

  const isCompare = currentQuestion.operation === 'compare';
  const timerPercent = (timeLeft / speedTimeLimit) * 100;
  const isUrgent = timeLeft <= 10;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col relative overflow-x-hidden">
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {CONFETTI.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 1, top: '20%', left: `${p.x}%`, scale: 0 }}
                animate={{ opacity: 0, top: '110%', left: `${p.x + (Math.random() - 0.5) * 20}%`, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, delay: p.delay }}
                className="absolute rounded-sm"
                style={{ width: p.size, height: p.size, backgroundColor: p.color }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Top Timer Bar */}
      <div className="bg-gradient-to-r from-red-400 to-rose-500 px-4 py-3 text-white">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handleBack}
            className="text-white/80 hover:text-white text-sm flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            退出
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-bold">{session.sessionCorrect} 题</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-emerald-200 font-semibold">✓ {session.sessionCorrect}</span>
              <span className="text-red-200 font-semibold">✗ {session.sessionWrong}</span>
            </div>
          </div>
        </div>

        {/* Timer Display */}
        <div className="flex flex-col items-center mb-2">
          <motion.span
            key={timeLeft}
            animate={{
              scale: isUrgent ? [1, 1.1, 1] : 1,
              color: isUrgent ? '#fef2f2' : '#ffffff',
            }}
            transition={{ duration: 0.3 }}
            className={`text-5xl font-mono font-black tabular-nums ${isUrgent ? 'text-red-100' : 'text-white'}`}
          >
            {timeLeft}
          </motion.span>
          <span className="text-xs text-white/60">秒</span>
        </div>

        {/* Timer progress bar */}
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-all duration-1000 ${
              isUrgent ? 'bg-red-300' : 'bg-white'
            }`}
            animate={{ width: `${timerPercent}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-lg mx-auto w-full">
        {/* Speed indicator */}
        <AnimatePresence>
          {session.sessionCorrect > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Badge className="bg-gradient-to-r from-rose-400 to-red-500 text-white border-none px-3 py-1 shadow-lg gap-1">
                <Zap className="w-4 h-4" />
                速度模式
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Combo Display */}
        <AnimatePresence>
          {currentCombo >= 3 && (
            <motion.div
              key={currentCombo}
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="mb-4"
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
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full mb-6"
        >
          <div className={`
            relative bg-white rounded-2xl shadow-lg border-2 p-6 text-center transition-colors
            ${showFeedback === 'correct'
              ? 'border-emerald-300 bg-emerald-50'
              : showFeedback === 'wrong'
                ? 'border-red-300 bg-red-50'
                : 'border-rose-100'
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

            {/* Floating XP Animation */}
            <AnimatePresence>
              {floatingXP.map((xp) => (
                <motion.div
                  key={xp.id}
                  initial={{ opacity: 1, y: xp.y, x: xp.x }}
                  animate={{ opacity: 0, y: xp.y - 80 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute text-orange-500 font-bold text-lg pointer-events-none z-20"
                  style={{ left: xp.x - 15, top: xp.y - 10 }}
                >
                  +10 XP
                </motion.div>
              ))}
            </AnimatePresence>

            <p className="text-3xl sm:text-4xl font-bold text-gray-800 tracking-wide">
              {isCompare
                ? (currentQuestion.expression || `${currentQuestion.compareLeft ?? 0}  ○  ${currentQuestion.compareRight ?? 0}`)
                : (currentQuestion.expression
                    ? (currentQuestion.expression.includes('=') || currentQuestion.expression.includes('？')
                      ? currentQuestion.expression
                      : `${currentQuestion.expression} = ?`)
                    : `${currentQuestion.num1}  ${currentQuestion.displayOp}  ${currentQuestion.num2}  =  ?`)
              }
            </p>

            {!isCompare && (
              <div className="mt-4 min-h-[48px] flex items-center justify-center">
                <span className="text-4xl font-bold text-rose-500 font-mono">
                  {inputValue || <span className="text-gray-300">_</span>}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Compare Buttons */}
        {isCompare ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full grid grid-cols-2 gap-3"
          >
            <Button
              onClick={() => handleCompare(true)}
              disabled={!!showFeedback || isFinished}
              className="h-16 text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-lg"
            >
              {'>'} 大于
            </Button>
            <Button
              onClick={() => handleCompare(false)}
              disabled={!!showFeedback || isFinished}
              className="h-16 text-xl font-bold bg-gradient-to-r from-rose-400 to-red-500 text-white shadow-lg"
            >
              {'≤'} 不大于
            </Button>
          </motion.div>
        ) : (
          /* Number Pad */
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
                  disabled={!!showFeedback || isFinished}
                  className="h-14 rounded-xl bg-white border-2 border-gray-200 text-gray-800 font-bold text-xl shadow-sm hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              <button
                onClick={handleDelete}
                disabled={!!showFeedback || isFinished}
                className="h-14 rounded-xl bg-red-50 border-2 border-red-200 text-red-500 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
              >
                <Delete className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleNumPress('0')}
                disabled={!!showFeedback || isFinished}
                className="h-14 rounded-xl bg-white border-2 border-gray-200 text-gray-800 font-bold text-xl shadow-sm hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
              >
                0
              </button>
              <button
                onClick={handleToggleNegative}
                disabled={!!showFeedback || isFinished}
                className="h-14 rounded-xl bg-indigo-50 border-2 border-indigo-200 text-indigo-600 font-bold text-lg shadow-sm hover:bg-indigo-100 transition-all active:scale-95 disabled:opacity-50"
              >
                ±
              </button>
              <button
                onClick={handleNumericSubmit}
                disabled={!!showFeedback || isFinished || !inputValue}
                className="h-14 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-xl shadow-md hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
              >
                ✓
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
