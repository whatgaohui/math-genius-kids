'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Lock, Unlock } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { ACHIEVEMENTS } from '@/lib/achievements';

export default function AchievementsPage() {
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;
  const progressPercent =
    totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const sortedAchievements = useMemo(() => {
    return [...ACHIEVEMENTS].sort((a, b) => {
      const aUnlocked = unlockedAchievements.includes(a.id);
      const bUnlocked = unlockedAchievements.includes(b.id);
      if (aUnlocked && !bUnlocked) return -1;
      if (!aUnlocked && bUnlocked) return 1;
      return 0;
    });
  }, [unlockedAchievements]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-purple-50 to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-md px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            🏅 成就殿堂
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            完成挑战，收集所有成就！
          </p>
        </motion.div>

        {/* Progress Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="overflow-hidden border-0 py-0">
            <CardContent className="bg-gradient-to-r from-violet-500 to-purple-600 p-5 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span className="font-bold">收集进度</span>
                </div>
                <span className="text-sm font-medium text-white/80">
                  {unlockedCount} / {totalCount}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-3 w-full rounded-full bg-white/20">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-300"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-white/70 mt-2 text-right">
                {progressPercent}% 完成
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 gap-3">
          {sortedAchievements.map((achievement, i) => {
            const isUnlocked = unlockedAchievements.includes(achievement.id);

            return (
              <motion.div
                key={achievement.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                  delay: 0.15 + i * 0.03,
                }}
              >
                <Card
                  className={`overflow-hidden border-0 py-0 transition-all ${
                    isUnlocked
                      ? 'shadow-md'
                      : 'opacity-60 grayscale'
                  }`}
                >
                  <CardContent
                    className={`p-4 ${
                      isUnlocked
                        ? 'bg-white dark:bg-gray-800/50'
                        : 'bg-gray-50 dark:bg-gray-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Emoji */}
                      <div
                        className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl text-2xl ${
                          isUnlocked
                            ? 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        {isUnlocked ? (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 15,
                            }}
                          >
                            {achievement.emoji}
                          </motion.span>
                        ) : (
                          <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`font-bold text-sm ${
                              isUnlocked
                                ? 'text-gray-800 dark:text-gray-100'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {achievement.name}
                          </p>
                          {isUnlocked && (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-[10px] px-1.5 py-0 border-0">
                              <Unlock className="h-2.5 w-2.5 mr-0.5" />
                              已解锁
                            </Badge>
                          )}
                        </div>
                        <p
                          className={`text-xs mt-0.5 ${
                            isUnlocked
                              ? 'text-gray-500 dark:text-gray-400'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {achievement.description}
                        </p>
                      </div>

                      {/* Status indicator */}
                      <div className="flex-shrink-0">
                        {isUnlocked ? (
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                            className="text-lg"
                          >
                            ✨
                          </motion.div>
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
