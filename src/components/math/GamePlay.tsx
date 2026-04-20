'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Star,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  Delete,
  Sparkles,
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { playCorrectSound, playWrongSound, playComboSound, resumeAudioContext } from '@/lib/sound';
import { formatTime } from '@/lib/math-utils';
import type { MathQuestion } from '@/lib/math-utils';

// ─── Constants ──────────────────────────────────────────────────────────────

const CONFETTI_PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 0.3,
  color: ['#f59e0b', '#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'][i % 6],
  size: 6 + Math.random() * 8,
  rotation: Math.random() * 360,
}));

// ─── Helper ─────────────────────────────────────────────────────────────────

function getQuestionDisplay(q: MathQuestion): { display: string; isCompare: boolean } {
  if (q.operation === 'compare') {
    // Use expression if available (e.g., fraction comparison "1/4 〇 1/2")
    if (q.expression) {
      return { display: q.expression, isCompare: true };
    }
    return {
      display: `${q.compareLeft ?? q.num1}  ○  ${q.compareRight ?? q.num2}`,
      isCompare: true,
    };
  }
  // For non-compare questions, prefer expression field (handles complex questions
  // like four-ops with parens, equations, fractions where num1/num2 may be 0)
  if (q.expression) {
    // If expression already contains '=' or '？', use it as-is
    if (q.expression.includes('=') || q.expression.includes('？')) {
      return { display: q.expression, isCompare: false };
    }
    // Otherwise append '= ?'
    return { display: `${q.expression} = ?`, isCompare: false };
  }
  // Fallback: construct from num1/displayOp/num2
  return {
    display: `${q.num1}  ${q.displayOp}  ${q.num2}  =  ?`,
    isCompare: false,
  };
}

// ─── Number Pad Button ──────────────────────────────────────────────────────

function NumPadButton({
  label,
  onClick,
  variant = 'default',
  wide = false,
}: {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'delete' | 'submit' | 'compare';
  wide?: boolean;
}) {
  const baseClasses = 'h-14 rounded-xl font-bold text-xl flex items-center justify-center transition-all active:scale-95 select-none';

  const variants = {
    default: 'bg-white border-2 border-gray-200 text-gray-800 hover:bg-gray-50 shadow-sm',
    delete: 'bg-red-50 border-2 border-red-200 text-red-500 hover:bg-red-100',
    submit: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md hover:opacity-90',
    compare: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md hover:opacity-90',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${wide ? 'col-span-2' : ''}`}
    >
      {variant === 'delete' ? <Delete className="w-6 h-6" /> : label}
    </button>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function GamePlay() {
  const {
    session,
    setCurrentView,
    answerQuestion,
    advanceToNextOrEnd,
    endSession,
    soundEnabled,
    lastGameSource,
    lastLevelName,
    setAdventureStars,
    adventureLevel,
  } = useGameStore();

  const [inputValue, setInputValue] = useState('');
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Timer
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - session.sessionStartTime);
    }, 200);
    return () => clearInterval(interval);
  }, [session]);

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

  // Cleanup feedback timer
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const currentQuestion = session
    ? (session.questions[session.currentQuestionIndex] as MathQuestion)
    : null;

  const display = currentQuestion ? getQuestionDisplay(currentQuestion) : null;
  const progress = session
    ? ((session.currentQuestionIndex) / session.questions.length) * 100
    : 0;
  const currentCombo = session?.sessionCurrentCombo ?? 0;

  const handleNumPress = useCallback((num: string) => {
    if (showFeedback) return;
    if (!currentQuestion) return;

    if (currentQuestion.operation === 'compare') {
      // Compare mode: no numeric input
      return;
    }

    setInputValue((prev) => {
      const newVal = prev + num;
      // Limit input length
      if (newVal.length > 6) return prev;
      return newVal;
    });
  }, [currentQuestion, showFeedback]);

  const handleDelete = useCallback(() => {
    if (showFeedback) return;
    setInputValue((prev) => prev.slice(0, -1));
  }, [showFeedback]);

  const handleSubmitAnswer = useCallback((answer: number | boolean) => {
    if (!session || !currentQuestion || showFeedback) return;

    const questionTime = Date.now() - session.questionStartTime;
    const isCorrect =
      typeof answer === 'boolean'
        ? answer === currentQuestion.correctAnswer
        : Number(answer) === Number(currentQuestion.correctAnswer);

    answerQuestion(currentQuestion.id, answer, questionTime);

    if (soundEnabled) {
      if (isCorrect) {
        playCorrectSound();
        const newCombo = session.sessionCurrentCombo + 1;
        if (newCombo >= 3) {
          playComboSound(newCombo);
        }
      } else {
        playWrongSound();
      }
    }

    setShowFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) setShowConfetti(true);

    feedbackTimerRef.current = setTimeout(() => {
      setShowFeedback(null);
      setShowConfetti(false);
      setInputValue('');

      const result = advanceToNextOrEnd();
      if (result === 'end') {
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

        const record = endSession();

        // Update adventure stars if applicable
        if (session.sessionMode === 'adventure' && record) {
          setAdventureStars(adventureLevel, record.stars);
        }

        setCurrentView('result');
      }
    }, isCorrect ? 600 : 1200);
  }, [session, currentQuestion, showFeedback, soundEnabled, answerQuestion, advanceToNextOrEnd, endSession, setCurrentView, adventureLevel, setAdventureStars]);

  const handleCompareAnswer = useCallback((answer: boolean) => {
    handleSubmitAnswer(answer);
  }, [handleSubmitAnswer]);

  const handleNumericSubmit = useCallback(() => {
    if (!inputValue || !currentQuestion) return;
    const num = parseInt(inputValue, 10);
    if (isNaN(num)) return;
    handleSubmitAnswer(num);
  }, [inputValue, currentQuestion, handleSubmitAnswer]);

  const handleBack = () => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    useGameStore.getState().resetGame();
    setCurrentView('math-home');
  };

  if (!session || !currentQuestion || !display) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col relative overflow-hidden max-w-lg mx-auto">
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-50">
            {CONFETTI_PARTICLES.map((p) => (
              <motion.div
                key={p.id}
                initial={{
                  opacity: 1,
                  top: '30%',
                  left: `${p.x}%`,
                  scale: 0,
                }}
                animate={{
                  opacity: 0,
                  top: '120%',
                  left: `${p.x + (Math.random() - 0.5) * 30}%`,
                  scale: 1,
                  rotate: p.rotation + 360,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.2,
                  delay: p.delay,
                  ease: 'easeOut',
                }}
                className="absolute rounded-sm"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3 text-white">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handleBack}
            className="text-white/80 hover:text-white text-sm flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            退出
          </button>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span className="font-mono font-medium">{formatTime(elapsedMs)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 fill-white" />
            <span className="font-medium">{session.sessionCorrect}</span>
          </div>
        </div>
        <Progress
          value={progress}
          className="h-2 bg-white/30"
        />
        <div className="flex justify-between text-xs text-white/70 mt-1">
          <span>{session.currentQuestionIndex + 1}/{session.questions.length}</span>
          <span>{lastGameSource === 'math-adventure' ? lastLevelName : session.sessionMode === 'free' ? '自由练习' : '闯关'}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-lg mx-auto w-full">
        {/* Combo Display */}
        <AnimatePresence>
          {currentCombo >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="mb-4"
            >
              <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-white border-none px-3 py-1.5 text-sm gap-1 shadow-lg">
                <Flame className="w-4 h-4" />
                {currentCombo} 连击
                {currentCombo >= 5 && <Sparkles className="w-3 h-3" />}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Card */}
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full mb-6"
        >
          <div className={`
            relative bg-white rounded-2xl shadow-lg border-2 p-6 text-center transition-all
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
                    rotate: showFeedback === 'correct' ? 0 : [0, -8, 8, -5, 5, 0],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: showFeedback === 'wrong' ? 0.4 : 0.3 }}
                  className="absolute inset-0 flex items-center justify-center z-10 bg-white/80 rounded-2xl"
                >
                  {showFeedback === 'correct' ? (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.4 }}
                    >
                      <CheckCircle2 className="w-20 h-20 text-emerald-500" />
                    </motion.div>
                  ) : (
                    <XCircle className="w-20 h-20 text-red-500" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Question text */}
            <p className="text-3xl sm:text-4xl font-bold text-gray-800 tracking-wide">
              {display.display}
            </p>

            {/* Input display for numeric questions */}
            {!display.isCompare && (
              <div className="mt-4 min-h-[48px] flex items-center justify-center">
                <span className="text-4xl font-bold text-amber-500 font-mono">
                  {inputValue || <span className="text-gray-300">_</span>}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Compare Mode Buttons */}
        {display.isCompare ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full grid grid-cols-2 gap-3"
          >
            <Button
              onClick={() => handleCompareAnswer(true)}
              disabled={!!showFeedback}
              className="h-16 text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-lg hover:opacity-90"
            >
              {'>'} 大于
            </Button>
            <Button
              onClick={() => handleCompareAnswer(false)}
              disabled={!!showFeedback}
              className="h-16 text-xl font-bold bg-gradient-to-r from-rose-400 to-red-500 text-white shadow-lg hover:opacity-90"
            >
              {'≤'} 不大于
            </Button>
          </motion.div>
        ) : (
          /* Number Pad */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="w-full"
          >
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <NumPadButton
                  key={num}
                  label={String(num)}
                  onClick={() => handleNumPress(String(num))}
                />
              ))}
              <NumPadButton label="" onClick={handleDelete} variant="delete" />
              <NumPadButton label="0" onClick={() => handleNumPress('0')} />
              <NumPadButton
                label="✓"
                onClick={handleNumericSubmit}
                variant="submit"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
