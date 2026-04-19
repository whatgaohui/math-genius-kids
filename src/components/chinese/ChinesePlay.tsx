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
  generateChineseQuestions,
  getAvailableMode,
  MODE_CONFIG,
  type ChineseQuestion,
  type ChineseMode,
  type ChineseGrade,
} from '@/lib/chinese-utils';
import { chinesePlayConfig } from '@/components/chinese/ChineseHome';
import { calculateStars, calculateXP } from '@/lib/math-utils';
import { playCorrectSound, playWrongSound, playComboSound, playClickSound } from '@/lib/sound';
import { speakChinese, stopSpeaking } from '@/lib/tts';
import PracticeResult from '@/components/shared/PracticeResult';

type FeedbackState = 'idle' | 'correct' | 'wrong';

interface FloatingXP {
  id: number;
  x: number;
  y: number;
}

// ─── Confetti Particles for Speed Mode ───────────────────────────────────

const CONFETTI = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 0.2,
  color: ['#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899'][i % 5],
  size: 6 + Math.random() * 6,
}));

export default function ChinesePlay() {
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
  const config = chinesePlayConfig;
  const isSpeedMode = config.isSpeed === true;

  const [questions, setQuestions] = useState<ChineseQuestion[]>([]);
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

  // Speed mode specific state
  const [timeLeft, setTimeLeft] = useState(isSpeedMode ? config.speedTimeLimit : 0);
  const [showConfetti, setShowConfetti] = useState(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const modeConfig = MODE_CONFIG[config.mode as ChineseMode];
  const currentQuestion = questions[currentIndex];
  const progress = isSpeedMode
    ? 100
    : questions.length > 0
      ? ((currentIndex) / questions.length) * 100
      : 0;

  // Generate questions on mount
  useEffect(() => {
    const resolvedMode = getAvailableMode(config.mode as ChineseMode, config.grade as ChineseGrade);
    const qs = generateChineseQuestions(
      resolvedMode,
      config.grade as ChineseGrade,
      config.count
    );
    setQuestions(qs);
    setStartTime(Date.now());
  }, [config.mode, config.grade, config.count]);

  // Timer — speed mode uses countdown, normal mode uses elapsed
  useEffect(() => {
    if (isFinished || !startTime) return;

    if (isSpeedMode) {
      // Countdown timer for speed mode
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
    } else {
      // Elapsed timer for normal mode
      const interval = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, isFinished, isSpeedMode]);

  // Speed mode: infinite question generation when approaching end of array
  useEffect(() => {
    if (!isSpeedMode || questions.length === 0) return;
    const remaining = questions.length - currentIndex;
    if (remaining <= 5) {
      const resolvedMode = getAvailableMode(config.mode as ChineseMode, config.grade as ChineseGrade);
      const more = generateChineseQuestions(resolvedMode, config.grade as ChineseGrade, 20);
      setQuestions((prev) => [...prev, ...more]);
    }
  }, [currentIndex, isSpeedMode, config.mode, config.grade, questions.length]);

  const addFloatingXP = useCallback(() => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const id = ++xpIdRef.current;
    setFloatingXP((prev) => [...prev, { id, x: rect.width / 2, y: rect.height / 2 }]);
    setTimeout(() => {
      setFloatingXP((prev) => prev.filter((xp) => xp.id !== id));
    }, 1000);
  }, []);

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
        if (isSpeedMode) setShowConfetti(true);
      } else {
        if (soundEnabled) playWrongSound();
        setWrong((w) => w + 1);
        setCombo(0);
        setFeedback('wrong');
      }

      if (isSpeedMode) {
        // Speed mode: fast advance on correct, retry on wrong
        feedbackTimerRef.current = setTimeout(() => {
          setShowConfetti(false);
          if (isCorrect) {
            // Advance to next question immediately
            setCurrentIndex((prev) => prev + 1);
            setFeedback('idle');
            setHasAnswered(false);
          } else {
            // Stay on same question — clear feedback so user can retry
            setFeedback('idle');
            setHasAnswered(false);
          }
        }, isCorrect ? 300 : 800);
      } else {
        // Normal mode: fixed delay then advance
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
    [currentQuestion, hasAnswered, feedback, combo, maxCombo, soundEnabled, currentIndex, questions.length, addFloatingXP, isSpeedMode]
  );

  // TTS for dictation mode on question appear
  useEffect(() => {
    if (!currentQuestion || config.mode !== 'dictation') return;
    // For dictation, speak the pinyin part (extract from prompt)
    const prompt = currentQuestion.prompt;
    // prompt format: "meaning (pinyin)"
    const match = prompt.match(/\(([^)]+)\)/);
    const textToSpeak = match ? match[1] : prompt;
    setIsSpeaking(true);
    speakChinese(textToSpeak, 0.7).finally(() => setIsSpeaking(false));
    return () => {
      stopSpeaking();
      setIsSpeaking(false);
    };
  }, [currentIndex, currentQuestion, config.mode]);

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

  // Cleanup feedback timer on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const handleBack = () => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    stopSpeaking();
    playClickSound();
    setCurrentView('chinese-home');
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
    const resolvedMode = getAvailableMode(config.mode as ChineseMode, config.grade as ChineseGrade);
    const qs = generateChineseQuestions(
      resolvedMode,
      config.grade as ChineseGrade,
      config.count
    );
    setQuestions(qs);
  };

  const handleFinish = useCallback(() => {
    const totalTimeMs = isSpeedMode ? config.speedTimeLimit * 1000 : Date.now() - startTime;
    const totalAnswered = correct + wrong;
    const result = completeSubjectSession({
      correct,
      total: totalAnswered,
      timeMs: totalTimeMs,
      maxCombo,
      subject: 'chinese',
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
  }, [correct, wrong, maxCombo, startTime, config.mode, config.grade, completeSubjectSession, isSpeedMode, config.speedTimeLimit, config.isAdventure, config.adventureFloor]);

  // When finished is triggered, record the session
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

  if (isFinished) {
    const totalTime = isSpeedMode ? config.speedTimeLimit * 1000 : (elapsed || (Date.now() - startTime));
    const totalAnswered = correct + wrong;
    const stars = calculateStars(correct, totalAnswered);
    const xp = calculateXP(correct, totalAnswered, totalTime, stars, maxCombo);
    return (
      <PracticeResult
        correct={correct}
        wrong={wrong}
        total={totalAnswered}
        timeMs={totalTime}
        maxCombo={maxCombo}
        stars={stars}
        xp={xp}
        subject="chinese"
        modeLabel={isSpeedMode ? '速度模式' : (config.isAdventure ? '闯关模式' : (modeConfig?.name ?? ''))}
        modeEmoji={isSpeedMode ? '⚡' : (config.isAdventure ? '🗺️' : modeConfig?.emoji)}
        adventureSuccess={config.isAdventure ? stars >= 1 : undefined}
        adventureLevelName={config.isAdventure ? lastLevelName : undefined}
        adventureLevelEmoji={config.isAdventure ? lastLevelEmoji : undefined}
        coinsEarned={rewardInfo?.coins}
        petXPEarned={rewardInfo?.petXP}
        isCriticalHit={rewardInfo?.isCriticalHit ?? false}
        bonusDetails={rewardInfo?.bonusDetails}
        speedEncouragement={isSpeedMode ? {
          emoji: '⚡',
          text: `限时${config.speedTimeLimit}秒内答对 ${correct} 题！`,
        } : null}
        onBack={handleBack}
        onRetry={handleRetry}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full"
        />
      </div>
    );
  }

  // Speed mode derived values
  const timerPercent = isSpeedMode ? (timeLeft / config.speedTimeLimit) * 100 : 0;
  const isUrgent = isSpeedMode && timeLeft <= 10;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50 to-white relative overflow-hidden">
      {/* Confetti for Speed Mode */}
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

      {/* Top Bar — gradient banner matching GamePlay style */}
      <div className={`px-4 py-3 text-white ${isSpeedMode ? 'bg-gradient-to-r from-red-400 to-rose-500' : 'bg-gradient-to-r from-rose-400 to-orange-500'}`}>
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
              {config.mode === 'dictation' && (
                <button
                  onClick={() => {
                    const prompt = currentQuestion.prompt;
                    const match = prompt.match(/\(([^)]+)\)/);
                    const textToSpeak = match ? match[1] : prompt;
                    setIsSpeaking(true);
                    speakChinese(textToSpeak, 0.7).finally(() => setIsSpeaking(false));
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
                </button>
              )}
              {!isSpeedMode && (
                <div className="flex items-center gap-1 text-sm">
                  <Zap className="w-4 h-4" />
                  <span className="font-mono font-medium">{formatTime(elapsed)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Speed Mode: Big Countdown Timer */}
          {isSpeedMode && (
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
          )}

          {/* Progress Bar */}
          {isSpeedMode ? (
            // Speed mode: countdown progress bar
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full transition-all duration-1000 ${
                  isUrgent ? 'bg-red-300' : 'bg-white'
                }`}
                animate={{ width: `${timerPercent}%` }}
              />
            </div>
          ) : (
            <Progress
              value={progress}
              className="h-2 bg-white/30"
            />
          )}

          {/* Row 2: Stats */}
          <div className="flex items-center justify-between text-xs text-white/70 mt-1">
            {isSpeedMode ? (
              <>
                <div className="flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  <span className="font-bold">{correct} 题</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-200">✓ {correct}</span>
                  <span className="text-red-200">✗ {wrong}</span>
                </div>
              </>
            ) : (
              <>
                <span>{currentIndex + 1}/{questions.length}</span>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-200">✓ {correct}</span>
                  <span className="text-red-200">✗ {wrong}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 max-w-lg mx-auto w-full">
        {/* Speed Mode Badge */}
        {isSpeedMode && (
          <AnimatePresence>
            {correct > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3"
              >
                <Badge className="bg-gradient-to-r from-rose-400 to-red-500 text-white border-none px-3 py-1.5 text-sm gap-1 shadow-lg">
                  <Zap className="w-4 h-4" />
                  速度模式
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        )}

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
              <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-white border-none px-3 py-1.5 text-sm gap-1 shadow-lg">
                <Flame className="w-4 h-4" />
                {combo} 连击
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Card */}
        <motion.div
          key={isSpeedMode ? currentQuestion.id : currentIndex}
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
                  : 'border-rose-100'
            }`}
          >
            <CardContent className="p-6 sm:p-8 text-center">
              {/* Question Prompt */}
              <div className="mb-2">
                <span className="text-xs text-gray-400 font-medium">
                  {config.mode === 'recognize-char' && '选择正确的汉字'}
                  {config.mode === 'recognize-pinyin' && '选择正确的拼音'}
                  {config.mode === 'word-match' && '选择正确的词语'}
                  {config.mode === 'dictation' && '听发音，选出正确的汉字'}
                  {config.mode === 'idiom-fill' && '选择正确的字补全成语'}
                  {config.mode === 'antonym' && '选择正确的反义词'}
                  {config.mode === 'poetry-fill' && '选择正确的字补全诗句'}
                  {config.mode === 'synonym' && '选择正确的近义词'}
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
                <p className="text-3xl sm:text-4xl font-bold text-gray-800 my-4 sm:my-6">
                  {currentQuestion.prompt}
                </p>
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
                    className="absolute text-orange-500 font-bold text-lg pointer-events-none"
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

            let optionStyle = 'bg-white border-2 border-gray-100 hover:border-rose-200 active:scale-95';
            if (isSelected) {
              if (isCorrectOption) {
                optionStyle = 'bg-green-50 border-2 border-green-400';
              } else if (feedback === 'wrong' && idx === currentQuestion.correctIndex) {
                optionStyle = 'bg-green-50 border-2 border-green-400';
              } else {
                optionStyle = 'bg-gray-50 border-2 border-gray-100 opacity-50';
              }
            }

            return (
              <motion.button
                key={`${isSpeedMode ? currentQuestion.id : currentIndex}-${idx}`}
                whileTap={{ scale: 0.95 }}
                disabled={hasAnswered}
                className={`rounded-xl py-4 px-3 min-h-[44px] text-center transition-all duration-200 shadow-sm ${optionStyle}`}
                onClick={() => handleAnswer(idx)}
              >
                <span
                  className={`text-xl sm:text-2xl font-bold ${
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
