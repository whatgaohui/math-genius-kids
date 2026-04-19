'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Volume2, Zap, Check, X, Flame } from 'lucide-react';
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

export default function EnglishPlay() {
  const { setCurrentView, completeSubjectSession, soundEnabled } = useGameStore();
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
  }, [config.mode, config.grade, config.count]);

  // Timer
  useEffect(() => {
    if (isFinished || !startTime) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, isFinished]);

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
      } else {
        if (soundEnabled) playWrongSound();
        setWrong((w) => w + 1);
        setCombo(0);
        setFeedback('wrong');
      }

      // Move to next question after feedback
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
    },
    [currentQuestion, hasAnswered, feedback, combo, maxCombo, soundEnabled, currentIndex, questions.length, addFloatingXP]
  );

  // Auto-speak for listening mode
  useEffect(() => {
    if (!currentQuestion || config.mode !== 'listening') return;
    setIsSpeaking(true);
    speakEnglish(currentQuestion.prompt, 0.8).finally(() => setIsSpeaking(false));
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

  const handleBack = () => {
    stopSpeaking();
    playClickSound();
    setCurrentView('english-home');
  };

  const handleRetry = () => {
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
    const qs = generateEnglishQuestions(
      config.mode as EnglishMode,
      config.grade as 1 | 2 | 3,
      config.count
    );
    setQuestions(qs);
  };

  const handleFinish = useCallback(() => {
    const totalTimeMs = Date.now() - startTime;
    const result = completeSubjectSession({
      correct,
      total: questions.length,
      timeMs: totalTimeMs,
      maxCombo,
      subject: 'english',
      mode: config.mode,
      difficulty: String(config.grade),
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
  }, [correct, questions.length, maxCombo, startTime, config.mode, config.grade, completeSubjectSession]);

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
    const totalTime = elapsed || (Date.now() - startTime);
    const stars = calculateStars(correct, questions.length);
    const xp = calculateXP(correct, questions.length, totalTime, stars, maxCombo);
    return (
      <PracticeResult
        correct={correct}
        total={questions.length}
        timeMs={totalTime}
        maxCombo={maxCombo}
        stars={stars}
        xp={xp}
        subject="english"
        modeName={modeConfig?.name ?? ''}
        coinsEarned={rewardInfo?.coins}
        petXPEarned={rewardInfo?.petXP}
        isCriticalHit={rewardInfo?.isCriticalHit ?? false}
        bonusDetails={rewardInfo?.bonusDetails}
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
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 max-w-md mx-auto w-full">
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
                <p className="text-3xl sm:text-4xl font-bold text-gray-800 my-4 sm:my-6 leading-relaxed">
                  {config.mode === 'listening'
                    ? '🎧 听一听...'
                    : currentQuestion.prompt}
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
