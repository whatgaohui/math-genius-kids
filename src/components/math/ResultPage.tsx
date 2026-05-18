'use client'

import { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/game-store'
import { usePetStore } from '@/lib/pet-store'
import { getEncouragement, getSpeedEncouragement } from '@/lib/math-utils'
import { playCompleteSound } from '@/lib/sound'
import PracticeResult from '@/components/shared/PracticeResult'
import type { QuestionReviewItem } from '@/components/shared/PracticeResult'
import CelebrationEffect from '@/components/math/CelebrationEffect'
import { toast } from '@/hooks/use-toast'

// ─── Helper: Compute level from XP ─────────────────────────────────────────

function getLevelFromXP(totalXP: number): number {
  let level = 1
  let accumulated = 0
  while (true) {
    const needed = level * 100
    if (totalXP < accumulated + needed) {
      return level
    }
    accumulated += needed
    level++
  }
}

// ─── Coin Fly Animation ────────────────────────────────────────────────────

function CoinFlyAnimation({ count, onComplete }: { count: number; onComplete?: () => void }) {
  const coins = useMemo(
    () =>
      Array.from({ length: Math.min(count, 8) }, (_, i) => ({
        id: i,
        delay: i * 0.12,
        x: (Math.random() - 0.5) * 80,
      })),
    [count],
  )

  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 2500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-end justify-center pb-32">
      {coins.map((coin) => (
        <motion.div
          key={coin.id}
          initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
          animate={{ y: -120, x: coin.x, opacity: 0, scale: 0.6 }}
          transition={{ duration: 1.2, delay: coin.delay + 0.8, ease: 'easeOut' }}
          className="absolute"
        >
          <span className="text-xl">🪙</span>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ResultPage() {
  const session = useGameStore((s) => s.session)
  const lastResult = useGameStore((s) => s.lastResult)
  const lastGameSource = useGameStore((s) => s.lastGameSource)
  const lastLevelName = useGameStore((s) => s.lastLevelName)
  const lastLevelEmoji = useGameStore((s) => s.lastLevelEmoji)
  const selectedOperation = useGameStore((s) => s.selectedOperation)
  const selectedDifficulty = useGameStore((s) => s.selectedDifficulty)
  const speedOperation = useGameStore((s) => s.speedOperation)
  const setCurrentView = useGameStore((s) => s.setCurrentView)
  const startMathSession = useGameStore((s) => s.startMathSession)
  const resetGame = useGameStore((s) => s.resetGame)
  const soundEnabled = useGameStore((s) => s.soundEnabled)
  const playerLevel = useGameStore((s) => s.playerLevel)
  const totalXP = useGameStore((s) => s.totalXP)
  const practiceHistory = useGameStore((s) => s.practiceHistory)
  const { petType, petName } = usePetStore()

  // ─── Celebration state ──────────────────────────────────────────────────

  const [celebration, setCelebration] = useState<{
    show: boolean
    message: string
    emoji: string
  }>({ show: false, message: '', emoji: '' })

  const [showCoinAnimation, setShowCoinAnimation] = useState(false)
  const celebrationShown = useRef(false)

  // ─── Play sound on mount ───────────────────────────────────────────────

  useEffect(() => {
    if (soundEnabled) playCompleteSound()
  }, [soundEnabled])

  // ─── Use lastResult as primary source ──────────────────────────────────

  const resultCorrect = session?.sessionCorrect ?? lastResult?.correct ?? 0
  const resultWrong = session?.sessionWrong ?? lastResult?.wrong ?? 0
  const resultTotal = session
    ? session.sessionCorrect + session.sessionWrong
    : lastResult?.total ?? 0
  const resultTimeMs = lastResult?.timeMs ?? session?.sessionTimeMs ?? 0
  const resultStars = lastResult?.stars ?? session?.sessionStars ?? 0
  const resultMaxCombo = lastResult?.maxCombo ?? session?.sessionMaxCombo ?? 0
  const resultXP = lastResult?.xp ?? session?.sessionXP ?? 0
  const questions = session?.questions ?? []

  const accuracy = resultTotal > 0 ? Math.min(resultCorrect / resultTotal, 1) : 0
  const encouragement = getEncouragement(Math.round(accuracy * 100))

  const answeredQuestions = questions.filter((q: any) => q.userAnswer !== undefined)
  const avgTimeMs =
    answeredQuestions.length > 0
      ? answeredQuestions.reduce((sum: number, q: any) => sum + (q.timeMs || 0), 0) /
        answeredQuestions.length
      : 0
  const speedEnc = avgTimeMs > 0 ? getSpeedEncouragement(avgTimeMs) : null

  // ─── Detect level-up ───────────────────────────────────────────────────

  const earnedXP = resultXP
  const previousLevel = getLevelFromXP(totalXP - earnedXP)
  const didLevelUp = previousLevel < playerLevel

  // ─── Trigger celebrations on mount ─────────────────────────────────────

  useEffect(() => {
    if (celebrationShown.current) return
    celebrationShown.current = true

    // Delay celebration slightly so the page renders first
    const timer = setTimeout(() => {
      if (didLevelUp) {
        setCelebration({
          show: true,
          message: `升级了！Lv.${playerLevel} 🎊`,
          emoji: '🎊',
        })
      } else if (resultStars === 3) {
        setCelebration({
          show: true,
          message: '太棒了！满分！',
          emoji: '🎉',
        })
      } else if (resultStars === 2) {
        setCelebration({
          show: true,
          message: '很棒！',
          emoji: '🌟',
        })
      }

      // Show coin animation if coins were earned
      if (lastResult?.coinsEarned && lastResult.coinsEarned > 0) {
        setShowCoinAnimation(true)
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [didLevelUp, playerLevel, resultStars, lastResult?.coinsEarned])

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handlePlayAgain = useCallback(() => {
    resetGame()
    const mode = lastResult?.mode
    if (mode === 'speed') {
      startMathSession('speed', speedOperation, 'easy', 50)
      setCurrentView('speed')
    } else if (mode === 'adventure') {
      setCurrentView('math-home')
    } else {
      const op = (lastResult?.operation as any) || selectedOperation
      const diff = (lastResult?.difficulty as any) || selectedDifficulty
      startMathSession('free', op, diff, 10)
      setCurrentView('playing')
    }
  }, [
    resetGame,
    setCurrentView,
    startMathSession,
    lastResult,
    selectedOperation,
    selectedDifficulty,
    speedOperation,
  ])

  const handleGoMathHome = useCallback(() => {
    resetGame()
    setCurrentView('math-home')
  }, [resetGame, setCurrentView])

  const handleGoHome = useCallback(() => {
    resetGame()
    setCurrentView('home')
  }, [resetGame, setCurrentView])

  const handleShare = useCallback(() => {
    toast({
      title: '🎉 分享功能即将上线！',
      description: `本次成绩：${resultCorrect}/${resultTotal}，获得 ${resultStars} 颗星星！`,
    })
  }, [resultCorrect, resultTotal, resultStars])

  // ─── Build question review items ───────────────────────────────────────

  const reviewItems: QuestionReviewItem[] = answeredQuestions.map(
    (q: any, idx: number) => ({
      id: q.id || idx,
      questionText:
        q.operation === 'compare'
          ? `${q.compareLeft} ? ${q.compareRight}`
          : q.expression
            ? `${q.expression} = ?`
            : `${q.num1} ${q.displayOp} ${q.num2} = ?`,
      userAnswer:
        q.operation === 'compare'
          ? q.userAnswer === 1
            ? '>'
            : q.userAnswer === -1
              ? '<'
              : q.userAnswer === 0
                ? '='
                : String(q.userAnswer ?? '')
          : String(q.userAnswer ?? ''),
      correctAnswer:
        q.operation === 'compare'
          ? q.correctAnswer === 1
            ? '>'
            : q.correctAnswer === -1
              ? '<'
              : '='
          : String(q.correctAnswer),
      isCorrect: q.isCorrect ?? false,
      timeMs: q.timeMs,
    }),
  )

  // ─── Mode label ────────────────────────────────────────────────────────

  const modeLabel = (() => {
    if (lastGameSource === 'math-adventure') {
      return `闯关 · ${lastLevelEmoji} ${lastLevelName}`
    }
    if (lastResult?.mode === 'speed') {
      return '速度模式'
    }
    if (lastResult?.mode === 'daily') {
      return '每日挑战'
    }
    return '自由练习'
  })()

  const modeEmoji = (() => {
    if (lastGameSource === 'math-adventure') return '🏆'
    if (lastResult?.mode === 'speed') return '⚡'
    if (lastResult?.mode === 'daily') return '📅'
    return '📖'
  })()

  // ─── Render ────────────────────────────────────────────────────────────

  const total = resultCorrect + resultWrong

  // Fallback: if no result data at all, use latest practice record
  if (total === 0 && practiceHistory.length > 0) {
    const latest = practiceHistory[0]
    const fallbackAccuracy = latest.total > 0 ? latest.correct / latest.total : 0
    const fallbackEncouragement = getEncouragement(
      Math.round(fallbackAccuracy * 100),
    )
    return (
      <>
        <CelebrationEffect
          show={celebration.show}
          message={celebration.message}
          emoji={celebration.emoji}
          onComplete={() => setCelebration((c) => ({ ...c, show: false }))}
        />
        <PracticeResult
          correct={latest.correct}
          wrong={latest.total - latest.correct}
          total={latest.total}
          stars={latest.stars}
          xp={latest.xp}
          timeMs={latest.timeMs}
          maxCombo={0}
          subject="math"
          modeLabel={modeLabel}
          modeEmoji={modeEmoji}
          encouragementEmoji={fallbackEncouragement.emoji}
          encouragementText={fallbackEncouragement.text}
          onReplay={handlePlayAgain}
          onHome={handleGoMathHome}
          onShare={handleShare}
        />
      </>
    )
  }

  return (
    <>
      {/* Celebration overlay for special achievements */}
      <CelebrationEffect
        show={celebration.show}
        message={celebration.message}
        emoji={celebration.emoji}
        onComplete={() => setCelebration((c) => ({ ...c, show: false }))}
      />

      {/* Coin flying animation */}
      <AnimatePresence>
        {showCoinAnimation && (
          <CoinFlyAnimation
            count={lastResult?.coinsEarned ?? 0}
            onComplete={() => setShowCoinAnimation(false)}
          />
        )}
      </AnimatePresence>

      <PracticeResult
        correct={resultCorrect}
        wrong={resultWrong}
        total={resultTotal}
        stars={resultStars}
        xp={resultXP}
        timeMs={resultTimeMs}
        maxCombo={resultMaxCombo}
        accuracy={accuracy}
        subject="math"
        modeLabel={modeLabel}
        modeEmoji={modeEmoji}
        petType={petType}
        petName={petName}
        coinsEarned={lastResult?.coinsEarned}
        petXPEarned={lastResult?.petXPEarned}
        isCriticalHit={lastResult?.isCriticalHit ?? false}
        bonusDetails={lastResult?.bonusDetails}
        encouragementEmoji={encouragement.emoji}
        encouragementText={encouragement.text}
        speedEncouragement={speedEnc}
        adventureSuccess={
          lastGameSource === 'math-adventure' && resultStars >= 1
            ? true
            : undefined
        }
        adventureLevelName={
          lastGameSource === 'math-adventure' ? lastLevelName : undefined
        }
        adventureLevelEmoji={
          lastGameSource === 'math-adventure' ? lastLevelEmoji : undefined
        }
        leveledUp={didLevelUp}
        playerLevel={previousLevel}
        questions={reviewItems}
        onReplay={handlePlayAgain}
        onHome={handleGoMathHome}
        onBack={handleGoHome}
        onShare={handleShare}
      />
    </>
  )
}
