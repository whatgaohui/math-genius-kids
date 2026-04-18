'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Pencil,
  Timer,
  Map,
  Star,
  ChevronRight,
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { playClickSound } from '@/lib/sound';

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function MathHome() {
  const { setCurrentView, totalStars, streak } = useGameStore();

  const handleBack = () => {
    playClickSound();
    setCurrentView('home');
  };

  const handleFreePractice = () => {
    playClickSound();
    setCurrentView('math-free-setup');
  };

  const handleSpeedChallenge = () => {
    playClickSound();
    setCurrentView('math-speed-setup');
  };

  const handleAdventure = () => {
    playClickSound();
    setCurrentView('math-adventure');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-5 text-white">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-white/80 hover:text-white mb-3 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                🧮 数学乐园
              </h1>
              <p className="text-white/80 text-sm mt-1">快乐学习，轻松进步</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                <Star className="w-4 h-4 fill-white" />
                <span className="text-sm font-bold">{totalStars}</span>
              </div>
              {streak > 0 && (
                <Badge className="bg-white/20 text-white border-none">
                  🔥 {streak}天
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mode Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-lg mx-auto px-4 py-6 space-y-4"
      >
        {/* Free Practice */}
        <motion.div variants={itemVariants}>
          <Card
            className="border-none shadow-lg cursor-pointer hover:shadow-xl transition-all active:scale-[0.98] overflow-hidden"
            onClick={handleFreePractice}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shrink-0 shadow-md">
                  <Pencil className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-gray-800">自由练习</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    选择运算和难度，按照自己的节奏练习
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Speed Challenge */}
        <motion.div variants={itemVariants}>
          <Card
            className="border-none shadow-lg cursor-pointer hover:shadow-xl transition-all active:scale-[0.98] overflow-hidden"
            onClick={handleSpeedChallenge}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shrink-0 shadow-md">
                  <Timer className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-gray-800">限时挑战</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    限定时间内答题，挑战你的速度极限
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Adventure */}
        <motion.div variants={itemVariants}>
          <Card
            className="border-none shadow-lg cursor-pointer hover:shadow-xl transition-all active:scale-[0.98] overflow-hidden"
            onClick={handleAdventure}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-md">
                  <Map className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-gray-800">闯关模式</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    逐关挑战，收集星星，成为数学小达人
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          variants={itemVariants}
          className="bg-amber-50 border border-amber-100 rounded-xl p-4"
        >
          <p className="text-sm text-amber-800">
            💡 <span className="font-medium">小提示：</span>
            每天坚持练习可以积累连续天数奖励哦！连续练习3天、7天还有额外成就等你解锁！
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
