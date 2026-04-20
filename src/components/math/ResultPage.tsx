'use client'

import { useCallback, useMemo, useEffect } from 'react'
import { useGameStore } from '@/lib/game-store'
import { usePetStore } from '@/lib/pet-store'
import { generateQuestions, getEncouragement, getSpeedEncouragement } from '@/lib/math-utils'
import { playCompleteSound } from '@/lib/sound'
import PracticeResult from '@/components/shared/PracticeResult'
import type { QuestionReviewItem } from '@/components/shared/PracticeResult'

export default function ResultPage() {
  const session = useGameStore((s) => s.session)
  const lastResult = useGameStore((s) => s.lastResult)
  const lastGameSource = useGameStore((s) => s.lastGameSource)
  const lastLevelName = useGameStore((s) => s.lastLevelName)
  const lastLevelEmoji = useGameStore((s) => s.lastLevelEmoji)
  const selectedOperation = useGameStore((s) => s.selectedOperation)
  const selectedDifficulty = useGameStore((s) => s.selectedDifficulty)
  const setCurrentView = useGameStore((s) => s.setCurrentView)
  const startMathSession = useGameStore((s) => s.startMathSession)
  const resetGame = useGameStore((s) => s.resetGame)
  const soundEnabled = useGameStore((s) => s.soundEnabled)
  const playerLevel = useGameStore((s) => s.playerLevel)
  const practiceHistory = useGameStore((s) => s.practiceHistory)
  const { petType, petName } = usePetStore()

  // Play sound on mount
  useEffect(() => {
    if (soundEnabled) playCompleteSound()
  }, [soundEnabled])

  // Use lastResult (saved before session cleared) as primary source
  const resultCorrect = session?.sessionCorrect ?? lastResult?.correct ?? 0
  const resultWrong = session?.sessionWrong ?? lastResult?.wrong ?? 0
  // Use actual answered count (correct + wrong), not the question pool size
  const resultTotal = session ? (session.sessionCorrect + session.sessionWrong) : (lastResult?.total ?? 0)
  const resultTimeMs = lastResult?.timeMs ?? session?.sessionTimeMs ?? 0
  const resultStars = lastResult?.stars ?? session?.sessionStars ?? 0
  const resultMaxCombo = lastResult?.maxCombo ?? session?.sessionMaxCombo ?? 0
  const resultXP = lastResult?.xp ?? session?.sessionXP ?? 0
  const questions = session?.questions ?? []

  const accuracy = resultTotal > 0 ? Math.min(resultCorrect / resultTotal, 1) : 0
  const encouragement = getEncouragement(Math.round(accuracy * 100))

  const answeredQuestions = questions.filter((q: any) => q.userAnswer !== undefined)
  const avgTimeMs = answeredQuestions.length > 0
    ? answeredQuestions.reduce((sum: number, q: any) => sum + (q.timeMs || 0), 0) / answeredQuestions.length
    : 0
  const speedEnc = avgTimeMs > 0 ? getSpeedEncouragement(avgTimeMs) : null

  const handlePlayAgain = useCallback(() => {
    resetGame()
    // Always go to math-home which has tabs for all modes
    setCurrentView('math-home')
  }, [resetGame, setCurrentView])

  const handleGoMathHome = useCallback(() => {
    resetGame()
    setCurrentView('math-home')
  }, [resetGame, setCurrentView])

  const handleGoHome = useCallback(() => {
    resetGame()
    setCurrentView('home')
  }, [resetGame, setCurrentView])

  // Build question review items
  const reviewItems: QuestionReviewItem[] = answeredQuestions.map((q: any, idx: number) => ({
    id: q.id || idx,
    questionText: q.operation === 'compare'
      ? `${q.compareLeft} ? ${q.compareRight}`
      : q.expression ? `${q.expression} = ?` : `${q.num1} ${q.displayOp} ${q.num2} = ?`,
    userAnswer: q.operation === 'compare'
      ? q.userAnswer === 1 ? '>' : q.userAnswer === -1 ? '<' : q.userAnswer === 0 ? '=' : String(q.userAnswer ?? '')
      : String(q.userAnswer ?? ''),
    correctAnswer: q.operation === 'compare'
      ? q.correctAnswer === 1 ? '>' : q.correctAnswer === -1 ? '<' : '='
      : String(q.correctAnswer),
    isCorrect: q.isCorrect ?? false,
    timeMs: q.timeMs,
  }))

  // Determine mode label from lastResult or lastGameSource
  const modeLabel = (() => {
    if (lastGameSource === 'math-adventure') {
      return `闯关 · ${lastLevelEmoji} ${lastLevelName}`;
    }
    if (lastResult?.mode === 'speed') {
      return '速度模式';
    }
    if (lastResult?.mode === 'daily') {
      return '每日挑战';
    }
    return '自由练习';
  })();
  const modeEmoji = (() => {
    if (lastGameSource === 'math-adventure') return '🏆';
    if (lastResult?.mode === 'speed') return '⚡';
    if (lastResult?.mode === 'daily') return '📅';
    return '📖';
  })();

  // Primary render: use lastResult if session is null
  const total = resultCorrect + resultWrong

  // Fallback: if no result data at all, use latest practice record
  if (total === 0 && practiceHistory.length > 0) {
    const latest = practiceHistory[0]
    const fallbackAccuracy = latest.total > 0 ? latest.correct / latest.total : 0
    const fallbackEncouragement = getEncouragement(Math.round(fallbackAccuracy * 100))
    return (
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
      />
    )
  }

  return (
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
      adventureSuccess={lastGameSource === 'math-adventure' && resultStars >= 1 ? true : undefined}
      adventureLevelName={lastGameSource === 'math-adventure' ? lastLevelName : undefined}
      adventureLevelEmoji={lastGameSource === 'math-adventure' ? lastLevelEmoji : undefined}
      questions={reviewItems}
      onReplay={handlePlayAgain}
      onHome={handleGoMathHome}
      onBack={handleGoHome}
    />
  )
}
