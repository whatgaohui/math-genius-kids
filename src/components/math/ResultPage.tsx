'use client'

import { useCallback, useMemo } from 'react'
import { useGameStore } from '@/lib/game-store'
import { usePetStore } from '@/lib/pet-store'
import { generateQuestions, getEncouragement, getSpeedEncouragement } from '@/lib/math-utils'
import { playCompleteSound } from '@/lib/sound'
import PracticeResult from '@/components/shared/PracticeResult'
import type { QuestionReviewItem } from '@/components/shared/PracticeResult'

export default function ResultPage() {
  const session = useGameStore((s) => s.session)
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
  useMemo(() => {
    if (soundEnabled) playCompleteSound()
  }, [])

  const sessionCorrect = session?.sessionCorrect ?? 0
  const sessionWrong = session?.sessionWrong ?? 0
  const sessionTimeMs = session?.sessionTimeMs ?? 0
  const sessionStars = session?.sessionStars ?? 0
  const sessionMaxCombo = session?.sessionMaxCombo ?? 0
  const sessionXP = session?.sessionXP ?? 0
  const questions = session?.questions ?? []

  const total = sessionCorrect + sessionWrong
  const accuracy = total > 0 ? sessionCorrect / total : 0
  const encouragement = getEncouragement(accuracy)

  const answeredQuestions = questions.filter((q: any) => q.userAnswer !== undefined)
  const avgTimeMs = answeredQuestions.length > 0
    ? answeredQuestions.reduce((sum: number, q: any) => sum + (q.timeMs || 0), 0) / answeredQuestions.length
    : 0
  const speedEnc = avgTimeMs > 0 ? getSpeedEncouragement(avgTimeMs) : null

  const handlePlayAgain = useCallback(() => {
    resetGame()
    if (lastGameSource === 'math-adventure') {
      setCurrentView('adventure')
    } else {
      startMathSession('free', selectedOperation, selectedDifficulty, 10)
      setCurrentView('playing')
    }
  }, [resetGame, setCurrentView, startMathSession, lastGameSource, selectedOperation, selectedDifficulty])

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

  const modeLabel = lastGameSource === 'math-adventure'
    ? `闯关 · ${lastLevelEmoji} ${lastLevelName}`
    : '自由练习'
  const modeEmoji = lastGameSource === 'math-adventure' ? '🏆' : '📖'

  // Fallback: if no session data, use latest practice record
  if (total === 0 && practiceHistory.length > 0) {
    const latest = practiceHistory[0]
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
        onReplay={handlePlayAgain}
        onHome={handleGoMathHome}
      />
    )
  }

  return (
    <PracticeResult
      correct={sessionCorrect}
      wrong={sessionWrong}
      total={total}
      stars={sessionStars}
      xp={sessionXP}
      timeMs={sessionTimeMs}
      maxCombo={sessionMaxCombo}
      accuracy={accuracy}
      subject="math"
      modeLabel={modeLabel}
      modeEmoji={modeEmoji}
      petType={petType}
      petName={petName}
      encouragementEmoji={encouragement.emoji}
      encouragementText={encouragement.text}
      speedEncouragement={speedEnc}
      adventureSuccess={lastGameSource === 'math-adventure' && sessionStars >= 1 ? true : undefined}
      adventureLevelName={lastGameSource === 'math-adventure' ? lastLevelName : undefined}
      adventureLevelEmoji={lastGameSource === 'math-adventure' ? lastLevelEmoji : undefined}
      questions={reviewItems}
      onReplay={handlePlayAgain}
      onHome={handleGoMathHome}
      onBack={handleGoHome}
    />
  )
}
