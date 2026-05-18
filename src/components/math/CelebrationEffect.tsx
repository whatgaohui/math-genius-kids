'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface CelebrationEffectProps {
  show: boolean
  message?: string
  emoji?: string
  duration?: number
  onComplete?: () => void
}

// ─── Confetti Colors ────────────────────────────────────────────────────────

const COLORS = ['#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

// ─── Confetti Particle ──────────────────────────────────────────────────────

function ConfettiParticle({
  delay,
  color,
  left,
  shape,
}: {
  delay: number
  color: string
  left: number
  shape: 'square' | 'circle' | 'triangle'
}) {
  const xDrift = (Math.random() - 0.5) * 200
  const fallDuration = 2 + Math.random() * 1.5
  const rotation = 360 * (Math.random() > 0.5 ? 1 : -1)

  return (
    <motion.div
      initial={{
        opacity: 1,
        y: -20,
        x: 0,
        rotate: 0,
        scale: 1,
      }}
      animate={{
        opacity: [1, 1, 0],
        y: typeof window !== 'undefined' ? [0, window.innerHeight ?? 600] : [0, 600],
        x: [0, xDrift],
        rotate: [0, rotation],
        scale: [1, 0.4],
      }}
      transition={{
        duration: fallDuration,
        delay,
        ease: 'easeOut',
      }}
      className="absolute top-0"
      style={{ left: `${left}%` }}
    >
      {shape === 'circle' ? (
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      ) : shape === 'triangle' ? (
        <div
          className="w-0 h-0"
          style={{
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderBottom: `8px solid ${color}`,
          }}
        />
      ) : (
        <div
          className="w-2 h-2 rounded-sm"
          style={{ backgroundColor: color }}
        />
      )}
    </motion.div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function CelebrationEffect({
  show,
  message = '太棒了！',
  emoji = '🎉',
  duration = 3000,
  onComplete,
}: CelebrationEffectProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Generate confetti particles once
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        delay: Math.random() * 0.5,
        color: COLORS[i % COLORS.length],
        left: Math.random() * 100,
        shape: (['square', 'circle', 'triangle'] as const)[i % 3],
      })),
    [],
  )

  // Auto-dismiss after duration
  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, duration)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [show, duration, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center"
        >
          {/* Confetti particles */}
          <div className="absolute inset-0 overflow-hidden">
            {particles.map((p) => (
              <ConfettiParticle key={p.id} {...p} />
            ))}
          </div>

          {/* Central congratulatory message */}
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl px-8 py-5 shadow-2xl text-center border border-amber-100"
          >
            <motion.span
              className="text-5xl block mb-2"
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: 2 }}
            >
              {emoji}
            </motion.span>
            <p className="text-lg font-bold text-gray-800">{message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
