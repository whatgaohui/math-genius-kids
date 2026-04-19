'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  User,
  Volume2,
  VolumeX,
  Trash2,
  Info,
  Check,
  ChevronRight,
  Star,
  Zap,
  Trophy,
  Coins,
  Flame,
  Sparkles,
  BookOpen,
  Palette,
  Shield,
  Heart,
  X,
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { usePetStore, PET_CONFIGS, getPetEmoji } from '@/lib/pet-store';
import { getXPForNextLevel } from '@/lib/math-utils';
import BottomNav from './BottomNav';

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

// ─── Avatar Options ─────────────────────────────────────────────────────────

const AVATAR_CATEGORIES = [
  {
    label: '表情',
    emojis: ['😀', '😎', '🤩', '🥳'],
  },
  {
    label: '人物',
    emojis: ['🧑‍🎓', '👩‍🎓', '🦸', '🧙'],
  },
  {
    label: '动物',
    emojis: ['😺', '🐶', '🦊', '🐼'],
  },
  {
    label: '物品',
    emojis: ['🌟', '🌈', '🎨', '🎸'],
  },
];

// ─── Setting Row Component ──────────────────────────────────────────────────

function SettingRow({
  icon,
  iconBg,
  title,
  subtitle,
  children,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full rounded-2xl px-4 py-3.5 text-left transition-colors hover:bg-white/80 active:bg-white/100"
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg} shadow-sm flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</p>
        {subtitle && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </button>
  );
}

// ─── Edit Name Dialog ──────────────────────────────────────────────────────

function EditNameDialog({
  open,
  onClose,
  currentName,
}: {
  open: boolean;
  onClose: () => void;
  currentName: string;
}) {
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const [tempName, setTempName] = useState(currentName);

  const handleSave = () => {
    if (tempName.trim()) {
      setPlayerName(tempName.trim());
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">修改昵称</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <Input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="输入你的名字"
              maxLength={12}
              className="text-base h-12 rounded-xl mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <Button
              onClick={handleSave}
              disabled={!tempName.trim()}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-md"
            >
              保存
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Avatar Picker Dialog ──────────────────────────────────────────────────

function AvatarPickerDialog({
  open,
  onClose,
  currentAvatar,
}: {
  open: boolean;
  onClose: () => void;
  currentAvatar: string;
}) {
  const setPlayerAvatar = useGameStore((s) => s.setPlayerAvatar);
  const [selected, setSelected] = useState(currentAvatar);

  const handleConfirm = () => {
    setPlayerAvatar(selected);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">选择头像</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview */}
            <div className="flex justify-center mb-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-200 to-orange-300 text-4xl shadow-lg shadow-amber-200/50">
                {selected}
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {AVATAR_CATEGORIES.map((cat) => (
                <div key={cat.label}>
                  <p className="text-xs font-semibold text-gray-400 mb-2 px-1">{cat.label}</p>
                  <div className="grid grid-cols-4 gap-2.5">
                    {cat.emojis.map((emoji) => (
                      <motion.button
                        key={emoji}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelected(emoji)}
                        className={`flex items-center justify-center h-14 rounded-2xl text-2xl transition-all ${
                          selected === emoji
                            ? 'bg-gradient-to-br from-amber-100 to-orange-100 ring-2 ring-amber-400 dark:from-amber-900/40 dark:to-orange-900/40 dark:ring-amber-600 shadow-sm'
                            : 'bg-gray-50 hover:bg-amber-50 dark:bg-gray-800 dark:hover:bg-gray-700'
                        }`}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleConfirm}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-md mt-5"
            >
              确认选择
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Settings Page ────────────────────────────────────────────────────

export default function SettingsPage() {
  const playerName = useGameStore((s) => s.playerName);
  const playerAvatar = useGameStore((s) => s.playerAvatar);
  const playerLevel = useGameStore((s) => s.playerLevel);
  const totalXP = useGameStore((s) => s.totalXP);
  const totalStars = useGameStore((s) => s.totalStars);
  const streak = useGameStore((s) => s.streak);
  const practiceHistory = useGameStore((s) => s.practiceHistory);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const toggleSound = useGameStore((s) => s.toggleSound);

  const petType = usePetStore((s) => s.petType);
  const petLevel = usePetStore((s) => s.petLevel);
  const coins = usePetStore((s) => s.coins);

  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

  const displayName = playerName || '小朋友';
  const xpInfo = useMemo(() => getXPForNextLevel(totalXP), [totalXP]);
  const petConfig = petType ? PET_CONFIGS.find((p) => p.id === petType) : null;

  // Stats
  const totalPractices = practiceHistory.length;
  const totalCorrect = practiceHistory.reduce((sum, r) => sum + r.correct, 0);
  const totalQuestions = practiceHistory.reduce((sum, r) => sum + r.total, 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const handleClearData = () => {
    localStorage.removeItem('math-genius-game-store');
    localStorage.removeItem('math-genius-pet-store');
    window.location.reload();
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 via-amber-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-16 h-56 w-56 rounded-full bg-amber-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-16 h-64 w-64 rounded-full bg-rose-200/15 blur-3xl" />

      <motion.main
        className="relative z-10 mx-auto max-w-lg px-4 pb-24 pt-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Header ── */}
        <motion.div variants={itemVariants} className="mb-5">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            ⚙️ 设置
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            个性化你的学习伙伴
          </p>
        </motion.div>

        {/* ── Profile Card ── */}
        <motion.div variants={itemVariants} className="mb-5">
          <Card className="overflow-hidden border-0 py-0">
            <CardContent className="bg-gradient-to-br from-amber-100 via-orange-50 to-rose-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-rose-950/30 p-5">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAvatarDialogOpen(true)}
                  className="relative flex-shrink-0"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 text-3xl shadow-lg shadow-amber-200/50">
                    {playerAvatar}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                    <Palette className="h-3 w-3 text-amber-500" />
                  </div>
                </motion.button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setNameDialogOpen(true)}
                    className="flex items-center gap-1.5 group"
                  >
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate">
                      {displayName}
                    </h2>
                    <span className="text-gray-300 group-hover:text-gray-500 transition-colors">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                  </motion.button>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-bold text-amber-700 shadow-sm">
                      <Trophy className="size-3" />
                      Lv.{playerLevel}
                    </span>
                    {petConfig && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-rose-600 shadow-sm">
                        {getPetEmoji(petType, petLevel)} {petConfig.name} Lv.{petLevel}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* XP Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1.5">
                  <span>⭐ 经验进度</span>
                  <span>{xpInfo.currentLevelXP} / {xpInfo.nextLevelXP} XP</span>
                </div>
                <div className="relative h-2.5 overflow-hidden rounded-full bg-white/60">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(xpInfo.progress * 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Quick Stats Row ── */}
        <motion.div variants={itemVariants} className="mb-5">
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Star, label: '星星', value: totalStars, color: 'text-amber-500', bg: 'bg-amber-50' },
              { icon: Zap, label: '经验', value: totalXP, color: 'text-orange-500', bg: 'bg-orange-50' },
              { icon: Flame, label: '连续', value: `${streak}天`, color: 'text-rose-500', bg: 'bg-rose-50' },
              { icon: Coins, label: '金币', value: coins, color: 'text-yellow-500', bg: 'bg-yellow-50' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex flex-col items-center gap-1 rounded-2xl bg-white p-3 shadow-sm">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${item.bg}`}>
                    <Icon className={`${item.color} size-4`} />
                  </div>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{item.value}</span>
                  <span className="text-[10px] text-gray-400">{item.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Settings Groups ── */}
        <motion.div variants={itemVariants} className="mb-5">
          <Card className="overflow-hidden border-0 py-0">
            <CardContent className="bg-white p-2 dark:bg-gray-800/50">
              {/* Avatar */}
              <SettingRow
                icon={<Palette className="h-4 w-4 text-violet-500" />}
                iconBg="bg-violet-50 dark:bg-violet-900/30"
                title="更换头像"
                subtitle="选择一个喜欢的头像"
                onClick={() => setAvatarDialogOpen(true)}
              >
                <div className="flex items-center gap-1">
                  <span className="text-lg">{playerAvatar}</span>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
              </SettingRow>

              {/* Name */}
              <SettingRow
                icon={<User className="h-4 w-4 text-amber-500" />}
                iconBg="bg-amber-50 dark:bg-amber-900/30"
                title="修改昵称"
                subtitle={playerName || '点击设置你的名字'}
                onClick={() => setNameDialogOpen(true)}
              >
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </SettingRow>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Learning Stats ── */}
        <motion.div variants={itemVariants} className="mb-5">
          <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-2 px-1">📊 学习数据</h3>
          <Card className="overflow-hidden border-0 py-0">
            <CardContent className="bg-white p-2 dark:bg-gray-800/50">
              <SettingRow
                icon={<BookOpen className="h-4 w-4 text-emerald-500" />}
                iconBg="bg-emerald-50 dark:bg-emerald-900/30"
                title="练习次数"
                subtitle={`共完成 ${totalPractices} 次练习`}
              >
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                  {totalPractices}
                </Badge>
              </SettingRow>
              <SettingRow
                icon={<Zap className="h-4 w-4 text-orange-500" />}
                iconBg="bg-orange-50 dark:bg-orange-900/30"
                title="答题总数"
                subtitle={`答对 ${totalCorrect} 题 / 共 ${totalQuestions} 题`}
              >
                <Badge variant="secondary" className="bg-orange-50 text-orange-700 text-[11px] font-bold">
                  {totalCorrect}
                </Badge>
              </SettingRow>
              <SettingRow
                icon={<Heart className="h-4 w-4 text-rose-500" />}
                iconBg="bg-rose-50 dark:bg-rose-900/30"
                title="正确率"
                subtitle={totalQuestions > 0 ? '继续保持哦！' : '还没有练习记录'}
              >
                <Badge variant="secondary" className="bg-rose-50 text-rose-700 text-[11px] font-bold">
                  {accuracy}%
                </Badge>
              </SettingRow>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Preferences ── */}
        <motion.div variants={itemVariants} className="mb-5">
          <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-2 px-1">🎨 偏好设置</h3>
          <Card className="overflow-hidden border-0 py-0">
            <CardContent className="bg-white p-2 dark:bg-gray-800/50">
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 shadow-sm flex-shrink-0 dark:bg-cyan-900/30">
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4 text-cyan-500" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Label className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    音效
                  </Label>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {soundEnabled ? '已开启，答题有声音反馈' : '已关闭，安静模式'}
                  </p>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={toggleSound}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Danger Zone ── */}
        <motion.div variants={itemVariants} className="mb-5">
          <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-2 px-1">🔒 数据管理</h3>
          <Card className="overflow-hidden border-0 py-0">
            <CardContent className="bg-white p-2 dark:bg-gray-800/50">
              <div className="px-4 py-3.5">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full h-auto p-0 flex items-center gap-3 hover:bg-transparent text-left"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 shadow-sm flex-shrink-0 dark:bg-red-900/30">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                          清除所有数据
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          删除学习记录、成就、宠物数据等
                        </p>
                      </div>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                          <Shield className="h-5 w-5 text-red-500" />
                        </div>
                        <AlertDialogTitle className="text-left">
                          确定要清除所有数据吗？
                        </AlertDialogTitle>
                      </div>
                      <AlertDialogDescription className="text-left pl-[52px]">
                        此操作将删除以下所有数据，且无法恢复：
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="pl-[52px] space-y-1.5 mb-4">
                      {['学习记录和统计数据', '成就和里程碑', '宠物、金币和家具', '连续学习天数'].map((item) => (
                        <div key={item} className="flex items-center gap-2 text-sm text-red-600">
                          <X className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <AlertDialogFooter className="flex-row gap-2 sm:flex-row">
                      <AlertDialogCancel className="flex-1 rounded-xl h-11">
                        取消
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearData}
                        className="flex-1 rounded-xl h-11 bg-red-500 text-white hover:bg-red-600"
                      >
                        确定清除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── About ── */}
        <motion.div variants={itemVariants} className="mb-5">
          <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-2 px-1">ℹ️ 关于</h3>
          <Card className="overflow-hidden border-0 py-0">
            <CardContent className="bg-white p-4 dark:bg-gray-800/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 shadow-sm">
                  <span className="text-2xl">📚</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-800 dark:text-gray-100">
                    数学小达人
                  </h4>
                  <p className="text-[11px] text-gray-400">v1.0.0</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                专为小朋友设计的趣味学习应用，包含数学、语文、英语三大科目练习。
                养宠物、赚金币、解锁成就，让学习变得更有趣！
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {['🧮 数学', '📖 语文', '🔤 英语', '🐾 宠物', '🏆 成就'].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-gray-50 dark:bg-gray-700/50 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Made with Love ── */}
        <motion.div variants={itemVariants} className="text-center py-4">
          <p className="text-xs text-gray-300 dark:text-gray-600">
            Made with ❤️ for kids
          </p>
        </motion.div>
      </motion.main>

      {/* ── Dialogs ── */}
      <EditNameDialog
        open={nameDialogOpen}
        onClose={() => setNameDialogOpen(false)}
        currentName={playerName}
      />
      <AvatarPickerDialog
        open={avatarDialogOpen}
        onClose={() => setAvatarDialogOpen(false)}
        currentAvatar={playerAvatar}
      />

      <BottomNav />
    </div>
  );
}
