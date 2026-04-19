'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  RotateCcw,
  Home,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Trophy,
  Clock,
  Target,
  Flame,
  Zap,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Coins,
  Gift,
  Sparkles,
  Lock,
  TrendingUp,
  Shield,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { usePetStore, PET_CONFIGS, getPetEmoji } from '@/lib/pet-store'
import { PetCompanionBadge } from '@/components/math/PetCompanion'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface QuestionReviewItem {
  id: number
  questionText: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  timeMs?: number
}

export interface PracticeResultProps {
  correct: number
  wrong: number
  total: number
  stars: number
  xp: number
  timeMs: number
  maxCombo: number
  accuracy?: number // 0-1, auto-calculated if not provided
  leveledUp?: boolean
  playerLevel?: number

  // Subject info
  subject?: 'math' | 'chinese' | 'english'
  subjectName?: string
  subjectColor?: string // Tailwind gradient: "from-amber-400 to-orange-400"
  modeLabel?: string
  modeEmoji?: string
  modeName?: string // legacy prop alias for modeLabel

  // Pet
  petType?: string | null
  petName?: string | null

  // Rewards
  coinsEarned?: number
  petXPEarned?: number
  isCriticalHit?: boolean
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
    talentBonus: number;
    talentName?: string;
    talentEmoji?: string;
  };

  // Encouragement
  encouragementEmoji?: string
  encouragementText?: string
  speedEncouragement?: { emoji: string; text: string } | null

  // Adventure
  adventureSuccess?: boolean
  adventureLevelName?: string
  adventureLevelEmoji?: string
  levelName?: string // legacy prop alias

  // Question review
  questions?: QuestionReviewItem[]
  wrongAnswers?: { expression: string; correctAnswer: number | string; userAnswer: number | string }[]

  // Callbacks
  onReplay?: () => void
  onRetry?: () => void // legacy alias for onReplay
  onBack?: () => void // legacy alias for onHome
  onGoSubjectHome?: () => void
  onHome?: () => void
  onReview?: () => void
  onReviewWrong?: () => void
}

// ─── Confetti ───────────────────────────────────────────────────────────────

function ConfettiPiece({ delay }: { delay: number }) {
  const colors = ['#f97316', '#ec4899', '#a855f7', '#facc15', '#34d399', '#60a5fa']
  const color = colors[Math.floor(Math.random() * colors.length)]
  const left = Math.random() * 100
  const size = 6 + Math.random() * 8

  return (
    <motion.div
      className="pointer-events-none fixed"
      initial={{ top: '-5%', left: `${left}%`, opacity: 1, scale: 0 }}
      animate={{ top: '110%', opacity: [1, 1, 0], scale: [0, 1, 0.5], rotate: [0, 720] }}
      transition={{ duration: 2 + Math.random(), delay, ease: 'easeIn' }}
      style={{ zIndex: 100 }}
    >
      <div className="rounded-sm" style={{ width: size, height: size, backgroundColor: color }} />
    </motion.div>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTimeDisplay(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  if (totalSec >= 60) {
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${m}分${s.toString().padStart(2, '0')}秒`
  }
  return `${totalSec}秒`
}

function getAccuracyColor(acc: number) {
  if (acc >= 0.8) return 'text-emerald-500'
  if (acc >= 0.6) return 'text-amber-500'
  return 'text-rose-500'
}

function getAccuracyBg(acc: number) {
  if (acc >= 0.8) return 'bg-emerald-50 border-emerald-200'
  if (acc >= 0.6) return 'bg-amber-50 border-amber-200'
  return 'bg-rose-50 border-rose-200'
}

const SUBJECT_COLORS: Record<string, string> = {
  math: 'from-amber-400 to-orange-400',
  chinese: 'from-red-500 to-orange-500',
  english: 'from-emerald-500 to-teal-500',
}

const SUBJECT_NAMES: Record<string, string> = {
  math: '数学',
  chinese: '语文',
  english: '英语',
}

const SUBJECT_ENCOURAGEMENT: Record<string, { emoji: string; text: string }> = {
  math: { emoji: '🧮', text: '' },
  chinese: { emoji: '📖', text: '' },
  english: { emoji: '🔤', text: '' },
}

function getDefaultEncouragement(acc: number, subjectName?: string): { emoji: string; text: string } {
  const name = subjectName || '练习'
  if (acc >= 0.95) return { emoji: '🎉', text: `太棒了！你是${name}小天才！` }
  if (acc >= 0.8) return { emoji: '🌟', text: '非常优秀！继续保持！' }
  if (acc >= 0.6) return { emoji: '💪', text: '不错哦！再练练会更好！' }
  if (acc >= 0.4) return { emoji: '📚', text: '加油！多多练习就能进步！' }
  return { emoji: '🤗', text: '没关系，我们一起来学习吧！' }
}

// ─── Animation variants ──────────────────────────────────────────────────────

const starContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
}

const starVariants = {
  hidden: { scale: 0, rotate: -180, opacity: 0 },
  visible: {
    scale: 1, rotate: 0, opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 12 },
  },
}

const cardSlideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.1 * i + 0.4, duration: 0.5, ease: 'easeOut' },
  }),
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
}

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════

function BonusRow({ emoji, label, value, color, highlight }: { emoji: string; label: string; value: number; color: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 py-2 ${highlight ? 'bg-emerald-50/50' : ''}`}>
      <span className="flex items-center gap-2 text-xs text-gray-500">
        <span>{emoji}</span>
        {label}
      </span>
      <span className={`text-xs font-bold ${color}`}>+{value}</span>
    </div>
  )
}

export function PracticeResult(props: PracticeResultProps) {
  const {
    correct,
    wrong = 0,
    total,
    stars,
    xp,
    timeMs,
    maxCombo,
    accuracy: accuracyProp,
    leveledUp = false,
    playerLevel = 1,
    subject,
    subjectName: subjectNameProp,
    subjectColor,
    modeLabel: modeLabelProp,
    modeEmoji,
    modeName, // legacy
    petType,
    petName,
    coinsEarned,
    petXPEarned,
    isCriticalHit = false,
    bonusDetails,
    encouragementEmoji: encEmoji,
    encouragementText: encText,
    speedEncouragement,
    adventureSuccess,
    adventureLevelName,
    adventureLevelEmoji,
    levelName, // legacy
    questions,
    wrongAnswers,
    onReplay: onReplayProp,
    onRetry, // legacy
    onBack, // legacy
    onGoSubjectHome: onGoSubjectHomeProp,
    onHome: onHomeProp,
    onReview,
    onReviewWrong,
  } = props

  const [showConfetti] = useState(stars >= 2)
  const [showQuestionReview, setShowQuestionReview] = useState(false)

  // Resolve legacy prop aliases
  const onReplay = onReplayProp || onRetry
  const onHome = onGoSubjectHomeProp || onHomeProp || onBack
  const resolvedSubjectName = subjectNameProp || SUBJECT_NAMES[subject || ''] || '练习'
  const resolvedColor = subjectColor || SUBJECT_COLORS[subject || ''] || 'from-amber-400 to-orange-400'
  const resolvedModeLabel = modeLabelProp || modeName

  const acc = accuracyProp ?? (total > 0 ? correct / total : 0)
  const accPercent = Math.round(acc * 100)
  const accuracyColor = getAccuracyColor(acc)
  const accuracyBg = getAccuracyBg(acc)

  // Get pet info
  const petStore = petType ? usePetStore.getState() : null
  const effectivePetType = petType || null
  const effectivePetName = petName || null
  const petConfig = effectivePetType ? PET_CONFIGS.find(p => p.id === effectivePetType) : null

  // Get encouragement
  const encouragement = (encEmoji || encText)
    ? { emoji: encEmoji || '🎉', text: encText || '练习完成！' }
    : getDefaultEncouragement(acc, resolvedSubjectName)

  // Wrong answer count
  const effectiveWrong = wrong || (total - correct)
  const hasWrongAnswers = (wrongAnswers && wrongAnswers.length > 0) || effectiveWrong > 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 px-4 py-6 pb-24">
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 100 }}>
            {Array.from({ length: 15 }, (_, i) => (
              <ConfettiPiece key={i} delay={i * 0.08} />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-lg space-y-5">
        {/* Mode Badge */}
        {resolvedModeLabel && (
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex justify-center items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm border border-amber-100 backdrop-blur-sm">
              {modeEmoji && <span className="text-lg">{modeEmoji}</span>}
              <span className="text-sm font-semibold text-gray-600">{resolvedModeLabel}</span>
            </div>
            <PetCompanionBadge />
          </motion.div>
        )}

        {/* Animated Star Rating */}
        <motion.div className="flex flex-col items-center" initial="hidden" animate="visible" variants={starContainer}>
          <motion.p className="mb-2 text-sm font-medium text-amber-600" variants={fadeIn}>本轮评价</motion.p>
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <motion.div key={i} variants={starVariants} className="flex h-16 w-16 items-center justify-center rounded-full">
                <Star
                  className={`h-12 w-12 ${i < stars
                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.7)]'
                    : 'fill-gray-200 text-gray-300'
                  }`}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Encouragement */}
        <motion.div className="text-center" initial="hidden" animate="visible" variants={fadeIn}>
          <motion.span
            className="text-4xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
          >
            {encouragement.emoji}
          </motion.span>
          <p className="mt-2 text-lg font-bold text-gray-800">{encouragement.text}</p>
          {speedEncouragement && (
            <p className="mt-1 text-sm text-gray-500">{speedEncouragement.emoji} {speedEncouragement.text}</p>
          )}
        </motion.div>

        {/* Score Card */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={cardSlideUp}>
          <Card className={`overflow-hidden border-0 bg-gradient-to-r ${resolvedColor} shadow-lg`}>
            <CardContent className="flex items-center justify-center gap-3 py-8">
              <motion.div
                className="text-6xl font-black text-white tabular-nums"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.6 }}
              >
                {correct}
              </motion.div>
              <div className="text-3xl font-light text-white/80">/</div>
              <div className="text-3xl font-bold text-white/90">{total}</div>
              <div className="ml-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <Trophy className="h-6 w-6 text-white" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div className="grid grid-cols-2 gap-3" custom={2} initial="hidden" animate="visible" variants={cardSlideUp}>
          <Card className={`border ${accuracyBg}`}>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500">正确率</span>
              </div>
              <p className={`mt-1 text-2xl font-bold tabular-nums ${accuracyColor}`}>{accPercent}%</p>
            </CardContent>
          </Card>
          <Card className="border bg-sky-50 border-sky-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500">用时</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-sky-600">{formatTimeDisplay(timeMs)}</p>
            </CardContent>
          </Card>
          <Card className="border bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium text-gray-500">获得星星</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-amber-500">+{stars}</p>
            </CardContent>
          </Card>
          <Card className="border bg-violet-50 border-violet-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Zap className="h-4 w-4 text-violet-400" />
                <span className="text-xs font-medium text-gray-500">获得经验</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-violet-500">+{xp}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Level Up Banner */}
        {leveledUp && (
          <motion.div custom={2.3} initial="hidden" animate="visible" variants={cardSlideUp}>
            <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white shadow-lg text-center">
              <p className="text-lg font-black">🎉 升级啦！Lv.{playerLevel} → Lv.{playerLevel + 1}</p>
            </div>
          </motion.div>
        )}

        {/* Adventure Banner */}
        {(adventureSuccess || levelName) && (
          <motion.div custom={2.5} initial="hidden" animate="visible" variants={cardSlideUp}>
            <div className="rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 p-4 text-white shadow-md">
              <div className="flex items-center gap-2">
                <motion.span className="text-3xl" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>🎉</motion.span>
                <div>
                  <p className="font-bold text-base">
                    {(adventureLevelEmoji || '')} {adventureLevelName || levelName || ''} 通关成功！
                  </p>
                  <p className="text-sm text-white/80 mt-0.5">获得 {stars} 颗星星，继续挑战下一关吧！</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pet Reward Banner */}
        {coinsEarned !== undefined && coinsEarned > 0 && (
          <motion.div custom={2.6} initial="hidden" animate="visible" variants={cardSlideUp}>
            {/* Critical Hit Banner */}
            {isCriticalHit && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
                className="rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 p-4 text-white shadow-lg mb-3 overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-50" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.span
                      className="text-3xl"
                      animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
                    >
                      ✨
                    </motion.span>
                    <div>
                      <p className="text-base font-black">暴击！金币翻倍！</p>
                      <p className="text-xs text-white/80">宠物的好运让你获得双倍奖励！</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Gift className="h-8 w-8" />
                  </motion.div>
                </div>
              </motion.div>
            )}
            <div className="rounded-2xl bg-gradient-to-r from-amber-100 to-orange-100 p-4 border border-amber-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <motion.span
                    className="text-3xl block"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {effectivePetType
                      ? getPetEmoji(effectivePetType, usePetStore.getState().petLevel)
                      : '🐾'}
                  </motion.span>
                  {isCriticalHit && (
                    <motion.span
                      className="absolute -top-2 -right-2 text-sm"
                      animate={{ scale: [0, 1.2, 1], rotate: [0, 20, -20, 0] }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      ⚡
                    </motion.span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">
                    {effectivePetName || (petConfig?.name ?? '小伙伴')} 获得了奖励！
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                      <Coins className="h-3.5 w-3.5" />+{coinsEarned} 金币
                    </span>
                    {petXPEarned !== undefined && petXPEarned > 0 && (
                      <span className="flex items-center gap-1 text-xs font-medium text-violet-500">
                        <Sparkles className="h-3.5 w-3.5" />+{petXPEarned} 经验
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Combo Banner */}
        {maxCombo >= 3 && (
          <motion.div custom={2.7} initial="hidden" animate="visible" variants={cardSlideUp}>
            <div className={`rounded-2xl p-4 border shadow-sm ${
              maxCombo >= 10 ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200' :
              maxCombo >= 7 ? 'bg-gradient-to-r from-orange-100 to-red-100 border-orange-200' :
              maxCombo >= 5 ? 'bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-200' :
              'bg-gradient-to-r from-emerald-100 to-teal-100 border-emerald-200'
            }`}>
              <div className="flex items-center gap-3">
                <motion.span className="text-3xl" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  {maxCombo >= 10 ? '🔥🔥' : maxCombo >= 7 ? '🔥' : maxCombo >= 5 ? '💥' : '✨'}
                </motion.span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">最高 {maxCombo} 连击！</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {maxCombo >= 10 ? '太厉害了！你是连击大师！' :
                     maxCombo >= 7 ? '超级连击！继续保持！' :
                     maxCombo >= 5 ? '漂亮连击！越来越强了！' :
                     '连续答对了真棒！'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-gray-700">{maxCombo}</p>
                  <p className="text-[10px] text-gray-400">连击</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bonus Breakdown Card */}
        {bonusDetails && coinsEarned !== undefined && coinsEarned > 0 && (
          <motion.div custom={2.75} initial="hidden" animate="visible" variants={cardSlideUp}>
            <Card className="border-0 shadow-md overflow-hidden">
              <button
                onClick={() => setShowQuestionReview(false) || null}
                className="w-full"
              >
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 border-b border-amber-100">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-bold text-gray-700">金币明细</span>
                    </div>
                    <span className="text-sm font-black text-amber-600">+{coinsEarned} 金币</span>
                  </div>
                  {bonusDetails.petLevel > 1 && (
                    <p className="text-[10px] text-gray-400">
                      🐾 宠物 Lv.{bonusDetails.petLevel} 加成中
                      {bonusDetails.coinBonusPercent > 0 && ` · 金币+${bonusDetails.coinBonusPercent}%`}
                      {bonusDetails.critChance > 0 && ` · 暴击率${Math.round(bonusDetails.critChance * 100)}%`}
                      {bonusDetails.talentName && ` · ${bonusDetails.talentEmoji} ${bonusDetails.talentName}`}
                    </p>
                  )}
                </div>
              </button>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-50">
                  <BonusRow emoji="📝" label="答对奖励" value={bonusDetails.base} color="text-gray-600" />
                  {bonusDetails.star > 0 && <BonusRow emoji="⭐" label="星星奖励" value={bonusDetails.star} color="text-amber-500" />}
                  {bonusDetails.combo > 0 && <BonusRow emoji="🔥" label="连击奖励" value={bonusDetails.combo} color="text-orange-500" />}
                  {bonusDetails.perfect > 0 && <BonusRow emoji="💯" label="满分奖励" value={bonusDetails.perfect} color="text-rose-500" />}
                  {bonusDetails.speed > 0 && <BonusRow emoji="⚡" label="速度奖励" value={bonusDetails.speed} color="text-sky-500" />}
                  {bonusDetails.streak > 0 && <BonusRow emoji="📅" label="连续登录" value={bonusDetails.streak} color="text-violet-500" />}
                  {bonusDetails.petBonus > 0 && <BonusRow emoji="🐾" label={`宠物加成 (+${bonusDetails.coinBonusPercent}%)`} value={bonusDetails.petBonus} color="text-emerald-500" highlight />}
                  {bonusDetails.talentBonus > 0 && (
                    <BonusRow
                      emoji={bonusDetails.talentEmoji || '✨'}
                      label={`${bonusDetails.talentName || '天赋'}加成`}
                      value={bonusDetails.talentBonus}
                      color="text-orange-500"
                      highlight
                    />
                  )}
                  {bonusDetails.critical > 0 && <BonusRow emoji="✨" label="暴击翻倍" value={bonusDetails.critical} color="text-yellow-500" highlight />}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Review Wrong Answers Button */}
        {(onReviewWrong || onReview) && hasWrongAnswers && (
          <motion.div custom={2.8} initial="hidden" animate="visible" variants={cardSlideUp}>
            <Button
              onClick={onReviewWrong || onReview}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-rose-400 to-pink-400 text-base font-bold text-white shadow-md hover:from-rose-500 hover:to-pink-500 active:scale-95 transition-transform"
            >
              <BookOpen className="h-5 w-5" />
              复习错题 ({effectiveWrong} 题)
            </Button>
          </motion.div>
        )}

        {/* Wrong Answers Review (legacy format) */}
        {wrongAnswers && wrongAnswers.length > 0 && !questions && (
          <motion.div custom={3} initial="hidden" animate="visible" variants={cardSlideUp}>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <h3 className="text-base font-bold text-gray-700">错题回顾</h3>
                  <Badge variant="destructive">{wrongAnswers.length} 题</Badge>
                </div>
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {wrongAnswers.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{item.expression}</span>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-red-500 line-through">{String(item.userAnswer)}</span>
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                        <span className="text-emerald-600 font-bold">{String(item.correctAnswer)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Question Review (full format, collapsible) */}
        {questions && questions.length > 0 && (
          <motion.div custom={3} initial="hidden" animate="visible" variants={cardSlideUp}>
            <Card className="border-0 shadow-md">
              <button
                onClick={() => setShowQuestionReview(!showQuestionReview)}
                className="w-full p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-700">📝 答题回顾</h3>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{questions.length} 题</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-emerald-500">
                    <CheckCircle2 className="h-3 w-3" />{correct} 对
                  </span>
                  {effectiveWrong > 0 && (
                    <span className="flex items-center gap-1 text-rose-500">
                      <XCircle className="h-3 w-3" />{effectiveWrong} 错
                    </span>
                  )}
                  {showQuestionReview ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </div>
              </button>
              <AnimatePresence>
                {showQuestionReview && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      <div className="border-t border-gray-100 pt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
                        {questions.map((q, idx) => (
                          <motion.div
                            key={q.id}
                            className={`rounded-xl border p-3 transition-colors ${q.isCorrect ? 'border-emerald-200 bg-emerald-50/50' : 'border-rose-200 bg-rose-50/50'}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05, duration: 0.3 }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                <span className={`flex-shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold bg-gray-100 ${q.isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {idx + 1}
                                </span>
                                <div>
                                  <p className="text-sm font-semibold text-gray-700">{q.questionText}</p>
                                  <div className="mt-1 flex items-center gap-2">
                                    <span className={`text-sm font-bold ${q.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>{q.userAnswer}</span>
                                    {q.isCorrect ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-rose-500" />}
                                  </div>
                                  {!q.isCorrect && <p className="mt-0.5 text-xs text-emerald-600">正确答案: {q.correctAnswer}</p>}
                                </div>
                              </div>
                              {q.timeMs !== undefined && q.timeMs > 0 && (
                                <span className="flex-shrink-0 text-xs text-gray-400 mt-1">
                                  {q.timeMs < 1000 ? `${q.timeMs}ms` : `${(q.timeMs / 1000).toFixed(1)}s`}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div className="flex flex-col gap-3 pt-2" custom={4} initial="hidden" animate="visible" variants={cardSlideUp}>
          {onReplay && (
            <Button
              onClick={onReplay}
              className={`w-full h-12 rounded-xl bg-gradient-to-r ${resolvedColor} text-base font-bold text-white shadow-md active:scale-95 transition-transform`}
            >
              <RotateCcw className="h-5 w-5" />
              再来一次
            </Button>
          )}
          {onHome && (
            <Button
              onClick={onHome}
              variant="outline"
              className="w-full h-12 rounded-xl border-2 border-gray-200 text-base font-bold text-gray-600 bg-white shadow-sm hover:bg-gray-50 active:scale-95 transition-transform"
            >
              <Home className="h-5 w-5" />
              返回{resolvedSubjectName}首页
            </Button>
          )}
          {onBack && !onHome && (
            <Button
              onClick={onBack}
              variant="secondary"
              className="w-full h-11 rounded-xl"
            >
              <Home className="h-4 w-4" />
              返回首页
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  )
}

// Default export for convenience
export default PracticeResult
