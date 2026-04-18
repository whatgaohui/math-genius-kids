'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Volume2, Zap, Check, X, Flame } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import {
  generateChineseQuestions,
  MODE_CONFIG,
  type ChineseQuestion,
  type ChineseMode,
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

export default function ChinesePlay() {
  const { setCurrentView, completeSubjectSession, soundEnabled } = useGameStore();

  // Read config from shared mutable object
  const config = chinesePlayConfig;

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

  const modeConfig = MODE_CONFIG[config.mode as ChineseMode];
  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;

  // Generate questions on mount
  useEffect(() => {
    const qs = generateChineseQuestions(
      config.mode as ChineseMode,
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

  const handleBack = () => {
    stopSpeaking();
    playClickSound();
    setCurrentView('chinese-home');
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
    const qs = generateChineseQuestions(
      config.mode as ChineseMode,
      config.grade as 1 | 2 | 3,
      config.count
    );
    setQuestions(qs);
  };

  const handleFinish = () => {
    const totalTimeMs = Date.now() - startTime;
    const stars = calculateStars(correct, questions.length);
    const xp = calculateXP(correct, questions.length, totalTimeMs, stars, maxCombo);
    completeSubjectSession(correct, questions.length, totalTimeMs);
    // results shown via isFinished state
  };

  // When finished is triggered, record the session
  useEffect(() => {
    if (isFinished) {
      handleFinish();
    }
  }, [isFinished]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}:${(s % 60).toString().padStart(2, '0')}` : `${s}s`;
  };

  if (isFinished) {
    return (
      <PracticeResult
        correct={correct}
        total={questions.length}
        timeMs={elapsed || (Date.now() - startTime)}
        maxCombo={maxCombo}
        stars={calculateStars(correct, questions.length)}
        xp={calculateXP(correct, questions.length, elapsed || (Date.now() - startTime), calculateStars(correct, questions.length), maxCombo)}
        subject="chinese"
        modeName={modeConfig?.name ?? ''}
        onBack={handleBack}
        onRetry={handleRetry}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-4 border-red-200 border-t-red-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-red-50 via-orange-50 to-white">
      {/* Top Bar */}
      <header className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-gray-500 hover:text-gray-700 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600">
                {modeConfig?.name}
              </span>
              <span className="text-xs text-gray-400">
                {currentIndex + 1}/{questions.length}
              </span>
            </div>
          </div>
          {config.mode === 'dictation' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const prompt = currentQuestion.prompt;
                const match = prompt.match(/\(([^)]+)\)/);
                const textToSpeak = match ? match[1] : prompt;
                setIsSpeaking(true);
                speakChinese(textToSpeak, 0.7).finally(() => setIsSpeaking(false));
              }}
              className="text-orange-500"
            >
              <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="h-2" />

        {/* Stats Row */}
        <div className="flex items-center justify-between mt-2 px-1">
          <Badge variant="secondary" className="bg-red-100 text-red-600 text-xs">
            ✓ {correct}
          </Badge>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">{formatTime(elapsed)}</span>
          </div>
          <Badge variant="secondary" className="bg-gray-100 text-gray-500 text-xs">
            ✗ {wrong}
          </Badge>
        </div>
      </header>

      {/* Question Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
        {/* Combo Popup */}
        <AnimatePresence>
          {combo >= 3 && (
            <motion.div
              key={combo}
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="mb-4 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-400 to-red-400 text-white shadow-lg"
            >
              <Flame className="w-5 h-5" />
              <span className="font-bold text-lg">{combo}</span>
              <span className="text-sm font-medium">连击!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Card */}
        <motion.div
          key={currentIndex}
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full max-w-sm"
          ref={cardRef}
        >
          <Card
            className={`relative overflow-hidden border-2 transition-all duration-300 ${
              feedback === 'correct'
                ? 'border-green-400 shadow-lg shadow-green-100'
                : feedback === 'wrong'
                  ? 'border-red-400 shadow-lg shadow-red-100'
                  : 'border-red-100'
            }`}
          >
            <CardContent className="p-8 text-center">
              {/* Question Prompt */}
              <div className="mb-2">
                <span className="text-xs text-gray-400 font-medium">
                  {config.mode === 'recognize-char' && '选择正确的汉字'}
                  {config.mode === 'recognize-pinyin' && '选择正确的拼音'}
                  {config.mode === 'word-match' && '选择正确的词语'}
                  {config.mode === 'dictation' && '听发音，选出正确的汉字'}
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
                <p className="text-4xl font-bold text-gray-800 my-6">
                  {config.mode === 'dictation'
                    ? currentQuestion.prompt
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
                    className="absolute top-4 right-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                  </motion.div>
                )}
                {feedback === 'wrong' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-4 right-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                      <X className="w-6 h-6 text-white" />
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

        {/* Answer Options (2x2 Grid) */}
        <div className="w-full max-w-sm mt-6 grid grid-cols-2 gap-3">
          {currentQuestion.options.map((option, idx) => {
            const isCorrectOption = idx === currentQuestion.correctIndex;
            const isSelected = feedback !== 'idle' && hasAnswered;

            let optionStyle = 'bg-white border-2 border-gray-100 hover:border-red-200 active:scale-95';
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
                key={`${currentIndex}-${idx}`}
                whileTap={{ scale: 0.95 }}
                disabled={hasAnswered}
                className={`rounded-xl p-4 text-center transition-all duration-200 ${optionStyle}`}
                onClick={() => handleAnswer(idx)}
              >
                <span
                  className={`text-xl font-bold ${
                    isCorrectOption && isSelected
                      ? 'text-green-600'
                      : 'text-gray-700'
                  }`}
                >
                  {option}
                </span>
                <div className="text-xs text-gray-400 mt-1">{idx + 1}</div>
              </motion.button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
