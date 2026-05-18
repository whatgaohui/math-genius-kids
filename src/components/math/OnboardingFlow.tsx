'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useOnboardingStore } from '@/lib/onboarding-store';
import { useGameStore } from '@/lib/game-store';
import { playClickSound } from '@/lib/sound';

// ─── Onboarding Steps Config ────────────────────────────────────────────────

interface OnboardingStep {
  emoji: string;
  title: string;
  description: string;
  gradient: string; // background gradient class
  dotColor: string; // active dot color
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    emoji: '👋',
    title: '欢迎来到知识小勇士！',
    description: '在这里，你可以学习数学、语文和英语，还能领养可爱的学习伙伴！',
    gradient: 'from-amber-400 via-orange-400 to-yellow-300',
    dotColor: 'bg-amber-400',
  },
  {
    emoji: '📚',
    title: '三大科目等你探索',
    description: '数学天地有自由练习、限时挑战和闯关模式；语文和英语也有丰富的练习',
    gradient: 'from-rose-400 via-pink-400 to-red-300',
    dotColor: 'bg-rose-400',
  },
  {
    emoji: '🎯',
    title: '设定你的学习目标',
    description: '每天完成小目标，就能获得星星和金币奖励！',
    gradient: 'from-emerald-400 via-teal-400 to-green-300',
    dotColor: 'bg-emerald-400',
  },
  {
    emoji: '🐾',
    title: '领养学习伙伴',
    description: '用金币领养可爱的小宠物，它们会给你加成和陪伴！',
    gradient: 'from-sky-400 via-blue-400 to-cyan-300',
    dotColor: 'bg-sky-400',
  },
  {
    emoji: '🏆',
    title: '成就和排名',
    description: '完成成就解锁称号，看看你能达到什么等级！',
    gradient: 'from-violet-400 via-purple-400 to-fuchsia-300',
    dotColor: 'bg-violet-400',
  },
];

// ─── Animation Variants ─────────────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
};

// ─── Component ─────────────────────────────────────────────────────────────

export default function OnboardingFlow() {
  const currentStep = useOnboardingStore((s) => s.currentStep);
  const setStep = useOnboardingStore((s) => s.setStep);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const setCurrentView = useGameStore((s) => s.setCurrentView);

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const totalSteps = ONBOARDING_STEPS.length;

  const handleNext = () => {
    playClickSound();
    if (isLastStep) {
      completeOnboarding();
      setCurrentView('home');
    } else {
      setStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    playClickSound();
    completeOnboarding();
    setCurrentView('home');
  };

  const handleDotClick = (index: number) => {
    playClickSound();
    setStep(index);
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col">
      {/* ── Skip Button ── */}
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/30 hover:text-white active:scale-95 transition-all"
        >
          跳过
        </Button>
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex flex-1 items-center justify-center px-6">
        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={currentStep}
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            className="flex w-full max-w-sm flex-col items-center text-center"
          >
            {/* Emoji Illustration */}
            <motion.div
              className={`mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br ${step.gradient} shadow-2xl`}
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: 0.1,
              }}
            >
              <motion.span
                className="text-7xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {step.emoji}
              </motion.span>
            </motion.div>

            {/* Title */}
            <motion.h2
              className="mb-3 text-2xl font-black text-gray-800"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {step.title}
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-base leading-relaxed text-gray-500"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {step.description}
            </motion.p>

            {/* Feature highlights card (for step 2-5) */}
            {currentStep >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mt-5 w-full"
              >
                <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                  <CardContent className="p-4">
                    {currentStep === 1 && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-sm">🧮</span>
                          <span>数学 — 自由练习 / 限时挑战 / 闯关</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-sm">📖</span>
                          <span>语文 — 拼音 / 词语 / 古诗</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-sm">🔤</span>
                          <span>英语 — 字母 / 单词 / 句子</span>
                        </div>
                      </div>
                    )}
                    {currentStep === 2 && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>📝</span>
                          <span>设定每日练习次数目标</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>🔢</span>
                          <span>设定每日答题数量目标</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>⭐</span>
                          <span>设定每日获得星星目标</span>
                        </div>
                      </div>
                    )}
                    {currentStep === 3 && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>🐱</span>
                          <span>小猫 — 增加金币奖励</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>🐶</span>
                          <span>小狗 — 增加经验加成</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>🦊</span>
                          <span>狐狸 — 暴击概率提升</span>
                        </div>
                      </div>
                    )}
                    {currentStep === 4 && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>🌱</span>
                          <span>初学者 → 📝 小学徒 → 🗺️ 探险家</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>⚔️</span>
                          <span>知识骑士 → 🎓 小大师 → 🧙 智慧贤者</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>👑</span>
                          <span>传奇勇士 — 最高等级称号！</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom Controls ── */}
      <div className="pb-8 pt-4 px-6 sm:pb-10">
        <div className="mx-auto max-w-sm flex flex-col items-center gap-5">
          {/* Progress Dots */}
          <div className="flex items-center gap-2.5">
            {ONBOARDING_STEPS.map((s, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className="transition-all active:scale-90"
                aria-label={`跳转到第${index + 1}步`}
              >
                <motion.div
                  className={`rounded-full ${
                    index === currentStep
                      ? `${s.dotColor}`
                      : 'bg-gray-200'
                  }`}
                  animate={{
                    width: index === currentStep ? 24 : 10,
                    height: 10,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              </button>
            ))}
          </div>

          {/* Next / Start Button */}
          <motion.div className="w-full">
            <Button
              onClick={handleNext}
              className={`w-full h-14 rounded-2xl text-base font-bold shadow-lg transition-all active:scale-[0.97] bg-gradient-to-r ${step.gradient} text-white hover:opacity-90 border-0`}
            >
              {isLastStep ? '开始学习！🚀' : '下一步 →'}
            </Button>
          </motion.div>

          {/* Step indicator */}
          <p className="text-xs text-gray-400">
            {currentStep + 1} / {totalSteps}
          </p>
        </div>
      </div>

      {/* ── Decorative background ── */}
      <div
        className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br ${step.gradient} opacity-10 transition-opacity duration-500`}
      />
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-amber-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-violet-200/20 blur-3xl" />
    </div>
  );
}
