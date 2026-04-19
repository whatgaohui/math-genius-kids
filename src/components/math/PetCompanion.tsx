'use client';

import { motion } from 'framer-motion';
import { PET_CONFIGS } from '@/lib/pet-store';

interface PetCompanionBadgeProps {
  petType: string | null;
  petName?: string | null;
  size?: 'sm' | 'md';
}

export function PetCompanionBadge({ petType, petName, size = 'sm' }: PetCompanionBadgeProps) {
  if (!petType) return null;

  const config = PET_CONFIGS.find((p) => p.id === petType);
  if (!config) return null;

  const isSm = size === 'sm';

  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }}
      className={`
        inline-flex items-center gap-1.5 rounded-full
        bg-gradient-to-r from-rose-100 to-pink-100
        dark:from-rose-950/50 dark:to-pink-950/50
        border border-rose-200 dark:border-rose-800
        ${isSm ? 'px-2.5 py-0.5 text-xs' : 'px-3.5 py-1 text-sm'}
      `}
    >
      <motion.span
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className={isSm ? 'text-base' : 'text-xl'}
      >
        {config.emoji}
      </motion.span>
      <span className="font-medium text-rose-700 dark:text-rose-300">
        {petName || config.name}
      </span>
    </motion.span>
  );
}
