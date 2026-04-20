'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Volume2, Zap, Check, X, Flame, Trophy } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { usePetStore, getCoinBonusPercent, getCriticalHitChance } from '@/lib/pet-store';
import {
  generateEnglishQuestions,
  getEnglishModeConfig,
  type EnglishQuestion,
  type EnglishMode,
} from '@/lib/english-utils';
import { englishPlayConfig } from '@/components/english/EnglishHome';
import { calculateStars, calculateXP } from '@/lib/math-utils';
import { playCorrectSound, playWrongSound, playComboSound, playClickSound } from '@/lib/sound';
import { speakEnglish, stopSpeaking } from '@/lib/tts';
import PracticeResult from '@/components/shared/PracticeResult';

type FeedbackState = 'idle' | 'correct' | 'wrong';

interface FloatingXP {
  id: number;
  x: number;
  y: number;
}

// ─── Confetti Particles (for speed mode) ─────────────────────────────────────

const CONFETTI = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 0.2,
  color: ['#10b981', '#14b8a6', '#f59e0b', '#ef4444', '#3b82f6'][i % 5],
  size: 6 + Math.random() * 6,
}));

export default function EnglishPlay() {
  const { setCurrentView, completeSubjectSession, soundEnabled, lastLevelName, lastLevelEmoji } = useGameStore();
  const [rewardInfo, setRewardInfo] = useState<{
    coins: number;
    petXP: number;
    isCriticalHit: boolean;
    bonusDetails?: {
      base: number;
      star: number;
      combo: number;
      perfect: number;
      speed: number;
      streak: number;
      petBonus: number;
      critical: number;
      petLevel: number;
      coinBonusPercent: number;
      critChance: number;
    };
  } | null>(null);

  // Read config from shared mutable object
  const config = englishPlayConfig;
  const isSpeedMode = config.isSpeed === true;

  const [questions, setQuestions] = useState<EnglishQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>('idle');
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [floatingXP, setFloatingXP] = useState<FloatingXP[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const xpIdRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // ── Speed mode specific state ──
  const [timeLeft, setTimeLeft] = useState(isSpeedMode ? config.speedTimeLimit : 0);
  const [showConfetti, setShowConfetti] = useState(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const modeConfig = getEnglishModeConfig(config.mode as EnglishMode);
  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;

  // Generate questions on mount
  useEffect(() => {
    const qs = generateEnglishQuestions(
      config.mode as EnglishMode,
      config.grade as 1 | 2 | 3,
      config.count
    );
    setQuestions(qs);
    setStartTime(Date.now());
    if (isSpeedMode) {
      setTimeLeft(config.speedTimeLimit);
    }
  }, [config.mode, config.grade, config.count, isSpeedMode, config.speedTimeLimit]);

  // Timer for normal mode (elapsed time counter)
  useEffect(() => {
    if (isSpeedMode || isFinished || !startTime) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, isFinished, isSpeedMode]);

  // Countdown timer for speed mode
  useEffect(() => {
    if (!isSpeedMode || isFinished || !startTime) return;

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
  }, [startTime, isFinished, isSpeedMode]);

  // ── Infinite question generation for speed mode ──
  useEffect(() => {
    if (!isSpeedMode || questions.length === 0) return;
    const remaining = questions.length - currentIndex;
    if (remaining <= 5) {
      const more = generateEnglishQuestions(
        config.mode as EnglishMode,
        config.grade as 1 | 2 | 3,
        20
      );
      setQuestions((prev) => [...prev, ...more]);
    }
  }, [currentIndex, questions.length, isSpeedMode, config.mode, config.grade]);

  // Cleanup feedback timer on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const addFloatingXP = useCallback(() => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const id = ++xpIdRef.current;
    setFloatingXP((prev) => [...prev, { id, x: rect.width / 2, y: rect.height / 2 }]);
    setTimeout(() => {
      setFloatingXP((prev) => prev.filter((xp) => xp.id !== id));
    }, 1000);
  }, []);

  const handleSpeak = useCallback(() => {
    if (!currentQuestion) return;
    setIsSpeaking(true);
    speakEnglish(currentQuestion.correctAnswer, 0.8).finally(() => setIsSpeaking(false));
  }, [currentQuestion]);

  const handleAnswer = useCallback(
    (selectedIndex: number) => {
      if (!currentQuestion || hasAnswered || feedback !== 'idle') return;

      setHasAnswered(true);
      stopSpeaking();

      const isCorrect = selectedIndex === currentQuestion.correctIndex;

      if (isCorrect) {
        if (soundEnabled) playCorrectSound();
        setCorrect((c) => c + 1);
        const newCombo = combo + 1;
        setCombo(newCombo);
        if (newCombo > maxCombo) setMaxCombo(newCombo);
        if (newCombo >= 3 && soundEnabled) playComboSound(newCombo);
        setFeedback('correct');
        addFloatingXP();

        if (isSpeedMode) {
          setShowConfetti(true);
        }
      } else {
        if (soundEnabled) playWrongSound();
        setWrong((w) => w + 1);
        setCombo(0);
        setFeedback('wrong');
      }

      if (isSpeedMode) {
        // Speed mode: different timing for correct vs wrong
        feedbackTimerRef.current = setTimeout(() => {
          setFeedback('idle');
          setHasAnswered(false);
          setShowConfetti(false);

          if (isCorrect) {
            // Advance to next question immediately
            const nextIndex = currentIndex + 1;
            if (nextIndex >= questions.length) {
              // Shouldn't happen with infinite generation, but handle gracefully
              const more = generateEnglishQuestions(
                config.mode as EnglishMode,
                config.grade as 1 | 2 | 3,
                20
              );
              setQuestions((prev) => [...prev, ...more]);
              setCurrentIndex(nextIndex);
            } else {
              setCurrentIndex(nextIndex);
            }
          }
          // Wrong: stay on the same question, user retries
        }, isCorrect ? 300 : 800);
      } else {
        // Normal mode: always advance after 1.2s
        setTimeout(() => {
          const nextIndex = currentIndex + 1;
          if (nextIndex >= questions.length) {
            setIsFinished(true);
          } else {
            setCurrentIndex(nextIndex);
            setFeedback('idle');
            setHasAnswered(false);
          }
        }, 1200);
      }
    },
    [currentQuestion, hasAnswered, feedback, combo, maxCombo, soundEnabled, currentIndex, questions.length, addFloatingXP, isSpeedMode, config.mode, config.grade]
  );

  // Auto-speak for listening mode - skipped on mobile to avoid autoplay restrictions
  // User needs to tap the play button to hear the word (more reliable)

  // Keyboard support (1-4 keys)
  useEffect(() => {
    if (isFinished || !currentQuestion || hasAnswered) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 4) {
        e.preventDefault();
        handleAnswer(num - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFinished, currentQuestion, hasAnswered, currentIndex, handleAnswer]);

  const handleBack = () => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    stopSpeaking();
    playClickSound();
    setCurrentView('english-home');
  };

  const handleRetry = () => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    stopSpeaking();
    playClickSound();
    setIsFinished(false);
    setCorrect(0);
    setWrong(0);
    setCombo(0);
    setMaxCombo(0);
    setFeedback('idle');
    setHasAnswered(false);
    setCurrentIndex(0);
    setStartTime(Date.now());
    setElapsed(0);
    setShowConfetti(false);
    if (isSpeedMode) {
      setTimeLeft(config.speedTimeLimit);
    }
    const qs = generateEnglishQuestions(
      config.mode as EnglishMode,
      config.grade as 1 | 2 | 3,
      config.count
    );
    setQuestions(qs);
  };

  const handleFinish = useCallback(() => {
    const totalTimeMs = Date.now() - startTime;
    const totalAnswered = correct + wrong;
    const result = completeSubjectSession({
      correct,
      total: isSpeedMode ? totalAnswered : questions.length,
      timeMs: totalTimeMs,
      maxCombo,
      subject: 'english',
      mode: isSpeedMode ? 'speed' : (config.isAdventure ? 'adventure' : config.mode),
      difficulty: String(config.grade),
      floorLevel: config.isAdventure ? config.adventureFloor : undefined,
    });
    if (result) {
      setRewardInfo({
        coins: result.reward.coins,
        petXP: result.reward.petXP,
        isCriticalHit: result.reward.isCriticalHit,
        bonusDetails: {
          ...result.reward.bonuses,
          petLevel: usePetStore.getState().petLevel,
          coinBonusPercent: getCoinBonusPercent(usePetStore.getState().petLevel),
          critChance: getCriticalHitChance(usePetStore.getState().petLevel),
        },
      });
    }
  }, [correct, wrong, questions.length, maxCombo, startTime, config.mode, config.grade, completeSubjectSession, isSpeedMode, config.isAdventure, config.adventureFloor]);

  useEffect(() => {
    if (isFinished) {
      handleFinish();
    }
  }, [isFinished, handleFinish]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}:${(s % 60).toString().padStart(2, '0')}` : `${s}s`;
  };

  // ── Speed mode helpers ──
  const timerPercent = isSpeedMode ? (timeLeft / config.speedTimeLimit) * 100 : 0;
  const isUrgent = isSpeedMode && timeLeft <= 10;

  if (isFinished) {
    const totalTime = elapsed || (Date.now() - startTime);
    const totalAnswered = correct + wrong;
    const effectiveTotal = isSpeedMode ? totalAnswered : questions.length;
    const stars = calculateStars(correct, effectiveTotal);
    const xp = calculateXP(correct, effectiveTotal, totalTime, stars, maxCombo);

    // Speed encouragement based on performance
    const speedEncouragement = isSpeedMode
      ? (() => {
          const rate = effectiveTotal > 0 ? correct / effectiveTotal : 0;
          if (rate >= 0.9 && correct >= 20) return { emoji: '🚀', text: '速度之王！太厉害了！' };
          if (rate >= 0.8 && correct >= 15) return { emoji: '⚡', text: '手速惊人！继续保持！' };
          if (rate >= 0.6 && correct >= 10) return { emoji: '💪', text: '表现不错，再接再厉！' };
          return null;
        })()
      : undefined;

    // Explicit encouragement based on accuracy
    const accuracy = effectiveTotal > 0 ? correct / effectiveTotal : 0;
    let encouragementEmoji = '🎉';
    let encouragementText = 'Practice complete!';
    if (accuracy >= 1.0) {
      encouragementEmoji = '🏆'; encouragementText = '满分！你是英语小高手！Perfect！';
    } else if (accuracy >= 0.9) {
      encouragementEmoji = '🌟'; encouragementText = 'Great job！你的英语真棒！';
    } else if (accuracy >= 0.75) {
      encouragementEmoji = '😊'; encouragementText = '不错哦！多听多说，你会更棒的！';
    } else if (accuracy >= 0.6) {
      encouragementEmoji = '💪'; encouragementText = 'Keep going！继续努力就更好了！';
    } else if (accuracy >= 0.4) {
      encouragementEmoji = '🤔'; encouragementText = '没关系，多读几遍就记住了！';
    } else {
      encouragementEmoji = '🤗'; encouragementText = '没关系，每个单词多看几遍就会了！加油！';
    }

    return (
      <PracticeResult
        correct={correct}
        total={effectiveTotal}
        timeMs={totalTime}
        maxCombo={maxCombo}
        stars={stars}
        xp={xp}
        subject="english"
        modeName={isSpeedMode ? `速度模式 · ${modeConfig?.name ?? ''}` : (config.isAdventure ? '闯关模式' : (modeConfig?.name ?? ''))}
        modeEmoji={isSpeedMode ? '⚡' : (config.isAdventure ? '🗺️' : modeConfig?.emoji)}
        adventureSuccess={config.isAdventure ? stars >= 1 : undefined}
        adventureLevelName={config.isAdventure ? lastLevelName : undefined}
        adventureLevelEmoji={config.isAdventure ? lastLevelEmoji : undefined}
        coinsEarned={rewardInfo?.coins}
        petXPEarned={rewardInfo?.petXP}
        isCriticalHit={rewardInfo?.isCriticalHit ?? false}
        bonusDetails={rewardInfo?.bonusDetails}
        encouragementEmoji={encouragementEmoji}
        encouragementText={encouragementText}
        speedEncouragement={speedEncouragement}
        onBack={handleBack}
        onRetry={handleRetry}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full"
        />
      </div>
    );
  }

  // ── Speed Mode UI ──
  if (isSpeedMode) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50 to-white relative overflow-hidden">
        {/* Confetti */}
        <AnimatePresence>
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none z-50">
              {CONFETTI.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 1, top: '40%', left: `${p.x}%`, scale: 0 }}
                  animate={{ opacity: 0, top: '120%', left: `${p.x + (Math.random() - 0.5) * 20}%`, scale: 1 }}
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
        <div className={`bg-gradient-to-r px-4 py-3 text-white transition-colors duration-500 ${
          isUrgent ? 'from-red-500 to-rose-600' : 'from-emerald-400 to-teal-500'
        }`}>
          <div className="max-w-md mx-auto">
            {/* Row 1: Back / Trophy / Volume */}
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={handleBack}
                className="text-white/80 hover:text-white text-sm flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                退出
              </button>
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-bold">{correct} 题</span>
              </div>
              <button
                onClick={handleSpeak}
                className="text-white/80 hover:text-white transition-colors"
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
              </button>
            </div>

            {/* Timer Display */}
            <div className="flex flex-col items-center mb-2">
              <motion.span
                key={timeLeft}
                animate={{
                  scale: isUrgent ? [1, 1.1, 1] : 1,
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
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 max-w-lg mx-auto w-full">
          {/* Speed Badge */}
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3"
            >
              <Badge className="bg-gradient-to-r from-rose-400 to-red-500 text-white border-none px-3 py-1 shadow-lg gap-1">
                <Zap className="w-4 h-4" />
                速度模式
              </Badge>
            </motion.div>
          </AnimatePresence>

          {/* Combo Popup */}
          <AnimatePresence>
            {combo >= 3 && (
              <motion.div
                key={combo}
                initial={{ scale: 0, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="mb-3"
              >
                <Badge className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-none px-3 py-1.5 text-sm gap-1 shadow-lg">
                  <Flame className="w-4 h-4" />
                  {combo} 连击
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Question Card */}
          <motion.div
            key={currentIndex}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full mb-5"
            ref={cardRef}
          >
            <Card
              className={`relative overflow-hidden border-2 transition-all duration-300 shadow-lg ${
                feedback === 'correct'
                  ? 'border-green-400 shadow-green-100'
                  : feedback === 'wrong'
                    ? 'border-red-400 shadow-red-100'
                    : 'border-emerald-100'
              }`}
            >
              <CardContent className="p-6 sm:p-8 text-center">
                {/* Question Prompt */}
                <div className="mb-2">
                  <span className="text-xs text-gray-400 font-medium">
                    {config.mode === 'word-picture' && '选择正确的含义'}
                    {config.mode === 'picture-word' && '选择正确的单词'}
                    {config.mode === 'listening' && '听发音，选出正确的单词'}
                    {config.mode === 'spelling' && '选择正确的拼写'}
                  </span>
                </div>

                <motion.div
                  animate={
                    feedback === 'correct'
                      ? { scale: [1, 1.1, 1] }
                      : feedback === 'wrong'
                        ? { x: [0, -8, 8, -8, 8, 0] }
                        : {}
                  }
                  transition={{ duration: 0.4 }}
                >
                  {config.mode === 'listening' ? (
                    <div className="my-4 sm:my-6 flex flex-col items-center gap-3">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleSpeak}
                        className={`flex items-center justify-center w-20 h-20 rounded-full shadow-lg transition-all ${isSpeaking ? 'bg-emerald-500 shadow-emerald-200' : 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-200/50 hover:shadow-emerald-300'}`}
                      >
                        <Volume2 className={`w-8 h-8 text-white ${isSpeaking ? 'animate-pulse' : ''}`} />
                      </motion.button>
                      <p className="text-sm text-gray-500 font-medium">点击播放发音</p>
                    </div>
                  ) : (
                    <p className="text-3xl sm:text-4xl font-bold text-gray-800 my-4 sm:my-6 leading-relaxed">
                      {currentQuestion.prompt}
                    </p>
                  )}
                </motion.div>

                {/* Feedback Icons */}
                <AnimatePresence>
                  {feedback === 'correct' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-3 right-3"
                    >
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                    </motion.div>
                  )}
                  {feedback === 'wrong' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-3 right-3"
                    >
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-500 flex items-center justify-center">
                        <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
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
                      className="absolute text-emerald-500 font-bold text-lg pointer-events-none"
                      style={{ left: xp.x - 15, top: xp.y - 10 }}
                    >
                      +10 XP
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Speed Stats Row */}
          <div className="flex items-center justify-center gap-4 mb-4 text-sm">
            <span className="text-emerald-600 font-semibold">✓ {correct}</span>
            <span className="text-red-500 font-semibold">✗ {wrong}</span>
            {combo >= 3 && (
              <span className="text-amber-500 font-semibold">
                <Flame className="w-3 h-3 inline mr-1" />{combo}
              </span>
            )}
          </div>

          {/* Answer Options (2x2 Grid) */}
          <div className="w-full grid grid-cols-2 gap-3">
            {currentQuestion.options.map((option, idx) => {
              const isCorrectOption = idx === currentQuestion.correctIndex;
              const isSelected = feedback !== 'idle' && hasAnswered;

              let optionStyle = 'bg-white border-2 border-gray-100 hover:border-emerald-200 active:scale-95';
              if (isSelected) {
                if (isCorrectOption) {
                  optionStyle = 'bg-green-50 border-2 border-green-400';
                } else {
                  optionStyle = 'bg-gray-50 border-2 border-gray-100 opacity-50';
                }
              }

              return (
                <motion.button
                  key={`${currentIndex}-${idx}`}
                  whileTap={{ scale: 0.95 }}
                  disabled={hasAnswered}
                  className={`rounded-xl py-4 px-3 min-h-[44px] text-center transition-all duration-200 shadow-sm ${optionStyle}`}
                  onClick={() => handleAnswer(idx)}
                >
                  <span
                    className={`text-lg sm:text-xl font-bold ${
                      isCorrectOption && isSelected
                        ? 'text-green-600'
                        : 'text-gray-700'
                    }`}
                  >
                    {option}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // ── Normal Mode UI (free / adventure) — unchanged behavior ──
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 to-white relative overflow-hidden">
      {/* Top Bar — gradient banner matching GamePlay style */}
      <div className="bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-3 text-white">
        <div className="max-w-md mx-auto">
          {/* Row 1: Back / Mode / Volume */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handleBack}
              className="text-white/80 hover:text-white text-sm flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              退出
            </button>
            <span className="text-sm font-semibold truncate max-w-[40%]">
              {modeConfig?.name}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSpeak}
                className="text-white/80 hover:text-white transition-colors"
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
              </button>
              <div className="flex items-center gap-1 text-sm">
                <Zap className="w-4 h-4" />
                <span className="font-mono font-medium">{formatTime(elapsed)}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress
            value={progress}
            className="h-2 bg-white/30"
          />

          {/* Row 2: Stats */}
          <div className="flex items-center justify-between text-xs text-white/70 mt-1">
            <span>{currentIndex + 1}/{questions.length}</span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-200">✓ {correct}</span>
              <span className="text-red-200">✗ {wrong}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 max-w-lg mx-auto w-full">
        {/* Combo Popup */}
        <AnimatePresence>
          {combo >= 3 && (
            <motion.div
              key={combo}
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="mb-3"
            >
              <Badge className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-none px-3 py-1.5 text-sm gap-1 shadow-lg">
                <Flame className="w-4 h-4" />
                {combo} 连击
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Card */}
        <motion.div
          key={currentIndex}
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full mb-5"
          ref={cardRef}
        >
          <Card
            className={`relative overflow-hidden border-2 transition-all duration-300 shadow-lg ${
              feedback === 'correct'
                ? 'border-green-400 shadow-green-100'
                : feedback === 'wrong'
                  ? 'border-red-400 shadow-red-100'
                  : 'border-emerald-100'
            }`}
          >
            <CardContent className="p-6 sm:p-8 text-center">
              {/* Question Prompt */}
              <div className="mb-2">
                <span className="text-xs text-gray-400 font-medium">
                  {config.mode === 'word-picture' && '选择正确的含义'}
                  {config.mode === 'picture-word' && '选择正确的单词'}
                  {config.mode === 'listening' && '听发音，选出正确的单词'}
                  {config.mode === 'spelling' && '选择正确的拼写'}
                </span>
              </div>

              <motion.div
                animate={
                  feedback === 'correct'
                    ? { scale: [1, 1.1, 1] }
                    : feedback === 'wrong'
                      ? { x: [0, -8, 8, -8, 8, 0] }
                      : {}
                }
                transition={{ duration: 0.4 }}
              >
                {config.mode === 'listening' ? (
                    <div className="my-4 sm:my-6 flex flex-col items-center gap-3">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleSpeak}
                        className={`flex items-center justify-center w-20 h-20 rounded-full shadow-lg transition-all ${isSpeaking ? 'bg-emerald-500 shadow-emerald-200' : 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-200/50 hover:shadow-emerald-300'}`}
                      >
                        <Volume2 className={`w-8 h-8 text-white ${isSpeaking ? 'animate-pulse' : ''}`} />
                      </motion.button>
                      <p className="text-sm text-gray-500 font-medium">点击播放发音</p>
                    </div>
                  ) : (
                    <p className="text-3xl sm:text-4xl font-bold text-gray-800 my-4 sm:my-6 leading-relaxed">
                      {currentQuestion.prompt}
                    </p>
                  )}
              </motion.div>

              {/* Feedback Icons */}
              <AnimatePresence>
                {feedback === 'correct' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-3 right-3"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </motion.div>
                )}
                {feedback === 'wrong' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-3 right-3"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-500 flex items-center justify-center">
                      <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
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
                    className="absolute text-emerald-500 font-bold text-lg pointer-events-none"
                    style={{ left: xp.x - 15, top: xp.y - 10 }}
                  >
                    +10 XP
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Answer Options (2x2 Grid) — touch-friendly min 44px height */}
        <div className="w-full grid grid-cols-2 gap-3">
          {currentQuestion.options.map((option, idx) => {
            const isCorrectOption = idx === currentQuestion.correctIndex;
            const isSelected = feedback !== 'idle' && hasAnswered;

            let optionStyle = 'bg-white border-2 border-gray-100 hover:border-emerald-200 active:scale-95';
            if (isSelected) {
              if (isCorrectOption) {
                optionStyle = 'bg-green-50 border-2 border-green-400';
              } else {
                optionStyle = 'bg-gray-50 border-2 border-gray-100 opacity-50';
              }
            }

            return (
              <motion.button
                key={`${currentIndex}-${idx}`}
                whileTap={{ scale: 0.95 }}
                disabled={hasAnswered}
                className={`rounded-xl py-4 px-3 min-h-[44px] text-center transition-all duration-200 shadow-sm ${optionStyle}`}
                onClick={() => handleAnswer(idx)}
              >
                <span
                  className={`text-lg sm:text-xl font-bold ${
                    isCorrectOption && isSelected
                      ? 'text-green-600'
                      : 'text-gray-700'
                  }`}
                >
                  {option}
                </span>
              </motion.button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
