'use client'

import { Component, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useGameStore } from '@/lib/game-store'
import { resumeAudioForMobile } from '@/lib/tts'

// Lazy load all page components for performance
const HomePage = dynamic(() => import('@/components/math/HomePage'), { ssr: false })
const MathHome = dynamic(() => import('@/components/math/MathHome'), { ssr: false })
const PracticeSetup = dynamic(() => import('@/components/math/PracticeSetup'), { ssr: false })
const SpeedSetup = dynamic(() => import('@/components/math/SpeedSetup'), { ssr: false })
const AdventureMode = dynamic(() => import('@/components/math/AdventureMode'), { ssr: false })
const GamePlay = dynamic(() => import('@/components/math/GamePlay'), { ssr: false })
const SpeedGamePlay = dynamic(() => import('@/components/math/SpeedGamePlay'), { ssr: false })
const ResultPage = dynamic(() => import('@/components/math/ResultPage'), { ssr: false })
const StatsPage = dynamic(() => import('@/components/math/StatsPage'), { ssr: false })
const AchievementsPage = dynamic(() => import('@/components/math/AchievementsPage'), { ssr: false })
const PetPage = dynamic(() => import('@/components/math/PetPage'), { ssr: false })
const SettingsPage = dynamic(() => import('@/components/math/SettingsPage'), { ssr: false })
const HelpGuide = dynamic(() => import('@/components/math/HelpGuide'), { ssr: false })
const ChineseHome = dynamic(() => import('@/components/chinese/ChineseHome'), { ssr: false })
const ChinesePlay = dynamic(() => import('@/components/chinese/ChinesePlay'), { ssr: false })
const EnglishHome = dynamic(() => import('@/components/english/EnglishHome'), { ssr: false })
const EnglishPlay = dynamic(() => import('@/components/english/EnglishPlay'), { ssr: false })
const CurriculumTestTool = dynamic(() => import('@/components/math/CurriculumTestTool'), { ssr: false })
const QuestionBankManager = dynamic(() => import('@/components/question-bank/QuestionBankManager'), { ssr: false })
const ErrorBookPage = dynamic(() => import('@/components/math/ErrorBookPage'), { ssr: false })
const DailyChallengePage = dynamic(() => import('@/components/math/DailyChallengePage'), { ssr: false })
const LearningGoalsPage = dynamic(() => import('@/components/math/LearningGoalsPage'), { ssr: false })
const ParentDashboard = dynamic(() => import('@/components/math/ParentDashboard'), { ssr: false })
const OnboardingFlow = dynamic(() => import('@/components/math/OnboardingFlow'), { ssr: false })

// ─── View Router ────────────────────────────────────────────────────────────

const viewComponents: Record<string, React.ComponentType> = {
  home: HomePage,
  'math-home': MathHome,
  'math-free-setup': PracticeSetup,
  'math-speed-setup': SpeedSetup,
  adventure: AdventureMode,
  'math-adventure': AdventureMode,
  playing: GamePlay,
  speed: SpeedGamePlay,
  result: ResultPage,
  stats: StatsPage,
  achievements: AchievementsPage,
  pet: PetPage,
  settings: SettingsPage,
  help: HelpGuide,
  chinese: ChineseHome,
  'chinese-home': ChineseHome,
  'chinese-play': ChinesePlay,
  english: EnglishHome,
  'english-home': EnglishHome,
  'english-play': EnglishPlay,
  'curriculum-test': CurriculumTestTool,
  'question-bank-manager': QuestionBankManager,
  'error-book': ErrorBookPage,
  'daily-challenge': DailyChallengePage,
  'learning-goals': LearningGoalsPage,
  'parent-dashboard': ParentDashboard,
  'onboarding': OnboardingFlow,
}

// ─── Error Boundary ────────────────────────────────────────────────────────

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  handleReset = () => {
    // Clear potentially corrupted localStorage data
    try {
      localStorage.removeItem('math-genius-game-store')
      localStorage.removeItem('math-genius-pet-store')
      localStorage.removeItem('math-genius-onboarding')
      localStorage.removeItem('math-genius-learning-goals')
      localStorage.removeItem('math-genius-error-book')
    } catch {
      // ignore
    }
    window.location.reload()
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50 p-6">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl text-center">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">页面出错了</h1>
            <p className="text-sm text-gray-500 mb-2">
              加载页面时遇到了问题
            </p>
            {this.state.error && (
              <p className="text-xs text-red-400 bg-red-50 rounded-lg p-2 mb-4 break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={this.handleRetry}
                className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 py-3 text-sm font-bold text-white shadow-md active:scale-95 transition-transform"
              >
                🔄 重试
              </button>
              <button
                onClick={this.handleReset}
                className="w-full rounded-xl bg-gray-100 py-3 text-sm font-medium text-gray-600 active:scale-95 transition-transform"
              >
                🗑️ 清除数据并重新加载
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// ─── Loading Fallback ──────────────────────────────────────────────────────

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🏰</div>
        <p className="text-sm text-gray-500">加载中...</p>
      </div>
    </div>
  )
}

// ─── Main Page Component ───────────────────────────────────────────────────

function PageRouter() {
  const currentView = useGameStore((s) => s.currentView)

  const PageComponent = viewComponents[currentView] || HomePage

  // Unlock AudioContext on first touch/click for mobile browsers
  // This is critical for TTS to work on Honor/Huawei and other Android devices
  useEffect(() => {
    let unlocked = false;
    const unlock = () => {
      if (!unlocked) {
        unlocked = true;
        resumeAudioForMobile();
      }
    };
    // Listen for first user interaction to unlock audio
    document.addEventListener('touchstart', unlock, { once: true, passive: true });
    document.addEventListener('touchend', unlock, { once: true, passive: true });
    document.addEventListener('click', unlock, { once: true, passive: true });
    return () => {
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('touchend', unlock);
      document.removeEventListener('click', unlock);
    };
  }, []);

  return (
    <motion.div
      key={currentView}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="w-full"
    >
      <PageComponent />
    </motion.div>
  )
}

export default function Home() {
  return (
    <ErrorBoundary>
      <PageRouter />
    </ErrorBoundary>
  )
}
