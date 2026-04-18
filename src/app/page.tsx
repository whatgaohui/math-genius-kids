'use client'

import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '@/lib/game-store'

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
const ChineseHome = dynamic(() => import('@/components/chinese/ChineseHome'), { ssr: false })
const ChinesePlay = dynamic(() => import('@/components/chinese/ChinesePlay'), { ssr: false })
const EnglishHome = dynamic(() => import('@/components/english/EnglishHome'), { ssr: false })
const EnglishPlay = dynamic(() => import('@/components/english/EnglishPlay'), { ssr: false })

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
  chinese: ChineseHome,
  'chinese-play': ChinesePlay,
  english: EnglishHome,
  'english-play': EnglishPlay,
}

export default function Home() {
  const currentView = useGameStore((s) => s.currentView)

  const PageComponent = viewComponents[currentView] || HomePage

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentView}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        <PageComponent />
      </motion.div>
    </AnimatePresence>
  )
}
