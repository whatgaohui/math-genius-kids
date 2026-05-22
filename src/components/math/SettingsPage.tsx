'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
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
  User, Volume2, VolumeX, Trash2, Check, ChevronRight,
  Star, Zap, Trophy, Coins, Flame, Sparkles, Palette, Shield, X,
  Settings, GraduationCap, FileText, Database,
  Download, Smartphone,
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { useOnboardingStore } from '@/lib/onboarding-store';
import { getGradeLabel, GRADE_LABELS, GRADE_EMOJIS, type Grade, type Semester } from '@/lib/curriculum-config';
import { usePetStore, PET_CONFIGS, getPetEmoji } from '@/lib/pet-store';
import { getXPForNextLevel } from '@/lib/math-utils';
import { getCurrentRank } from '@/lib/rank-system';
import BottomNav from './BottomNav';

// ─── Animations ───
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

// ─── Avatar Options ───
const AVATAR_CATEGORIES = [
  { label: '表情', emojis: ['😀', '😎', '🤩', '🥳'] },
  { label: '人物', emojis: ['🧑‍🎓', '👩‍🎓', '🦸', '🧙'] },
  { label: '动物', emojis: ['😺', '🐶', '🦊', '🐼'] },
  { label: '物品', emojis: ['🌟', '🌈', '🎨', '🎸'] },
];

// ─── Setting Item ───
function SettingItem({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  children,
  onClick,
  destructive,
}: {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3.5 text-left transition-colors active:bg-gray-50 ${
        destructive ? '' : ''
      }`}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-semibold ${destructive ? 'text-red-500' : 'text-gray-800'}`}>{title}</p>
        {subtitle && <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{subtitle}</p>}
      </div>
      <div className="flex-shrink-0 flex items-center gap-1">{children}</div>
    </button>
  );
}

// ─── Edit Name Dialog ───
function EditNameDialog({ open, onClose, currentName }: { open: boolean; onClose: () => void; currentName: string }) {
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const [tempName, setTempName] = useState(currentName);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSave = () => { if (tempName.trim()) { setPlayerName(tempName.trim()); onClose(); } };

  React.useEffect(() => {
    if (open) { setTempName(currentName); setTimeout(() => inputRef.current?.focus(), 350); }
  }, [open, currentName]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl safe-bottom"
          >
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200" /></div>
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-800">修改昵称</h3>
                <button onClick={onClose} className="p-1 text-gray-300 hover:text-gray-500 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <Input ref={inputRef} value={tempName} onChange={(e) => setTempName(e.target.value)}
                placeholder="输入你的名字" maxLength={12}
                className="text-base h-12 rounded-xl border-gray-200 focus:border-[#667eea]"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()} enterKeyHint="done"
              />
              <p className="text-[11px] text-gray-300 mt-1.5">最多12个字符</p>
              <Button onClick={handleSave} disabled={!tempName.trim()}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-bold text-sm shadow-lg shadow-[#667eea]/20 mt-4"
              >保存</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Avatar Picker ───
function AvatarPickerDialog({ open, onClose, currentAvatar }: { open: boolean; onClose: () => void; currentAvatar: string }) {
  const setPlayerAvatar = useGameStore((s) => s.setPlayerAvatar);
  const [selected, setSelected] = useState(currentAvatar);
  const handleConfirm = () => { setPlayerAvatar(selected); onClose(); };
  React.useEffect(() => { if (open) setSelected(currentAvatar); }, [open, currentAvatar]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl safe-bottom"
          >
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200" /></div>
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">选择头像</h3>
                <button onClick={onClose} className="p-1 text-gray-300 hover:text-gray-500 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex justify-center mb-5">
                <motion.div key={selected} initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-4xl shadow-lg shadow-[#667eea]/20"
                >{selected}</motion.div>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {AVATAR_CATEGORIES.map((cat) => (
                  <div key={cat.label}>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1.5 px-1">{cat.label}</p>
                    <div className="grid grid-cols-4 gap-2.5">
                      {cat.emojis.map((emoji) => (
                        <motion.button key={emoji} whileTap={{ scale: 0.9 }} onClick={() => setSelected(emoji)}
                          className={`h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                            selected === emoji ? 'bg-[#667eea]/10 ring-2 ring-[#667eea]/40' : 'bg-gray-50'
                          }`}
                        >{emoji}</motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={handleConfirm}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-bold text-sm shadow-lg shadow-[#667eea]/20 mt-5"
              >确认选择</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Grade Picker ───
function GradePickerDialog({ open, onClose, subject, currentGrade, currentSemester, onConfirm }: {
  open: boolean; onClose: () => void; subject: string; currentGrade: number; currentSemester: string;
  onConfirm: (grade: number, semester: string) => void;
}) {
  const grades = [1, 2, 3, 4, 5, 6] as Grade[];
  const semesters: Semester[] = ['上册', '下册'];
  const handleSelect = (grade: number, semester: string) => { onConfirm(grade, semester); onClose(); };
  const handleClear = () => { onConfirm(0, ''); onClose(); };
  const isSelected = (grade: Grade, semester: Semester) => currentGrade === grade && currentSemester === semester;

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl safe-bottom"
          >
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200" /></div>
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-800">选择{subject}年级</h3>
                <button onClick={onClose} className="p-1 text-gray-300 hover:text-gray-500 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleClear}
                className={`w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-medium mb-3 ${
                  currentGrade === 0 ? 'bg-gray-100 ring-2 ring-gray-300 text-gray-700' : 'bg-gray-50 text-gray-400'
                }`}
              >🌐 不限（全部年级）{currentGrade === 0 && <Check className="w-4 h-4" />}</motion.button>
              <div className="grid grid-cols-3 gap-2 max-h-[55vh] overflow-y-auto">
                {grades.map((grade) => semesters.map((semester) => {
                  const selected = isSelected(grade, semester);
                  return (
                    <motion.button key={`${grade}-${semester}`} whileTap={{ scale: 0.9 }} onClick={() => handleSelect(grade, semester)}
                      className={`flex flex-col items-center justify-center gap-0.5 min-h-[4rem] rounded-xl px-2 py-2.5 ${
                        selected ? 'bg-[#667eea]/10 ring-2 ring-[#667eea]/30' : 'bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">{GRADE_EMOJIS[grade]}</span>
                      <span className={`text-[11px] font-bold ${selected ? 'text-[#667eea]' : 'text-gray-600'}`}>{GRADE_LABELS[grade]}</span>
                      <span className={`text-[10px] ${selected ? 'text-[#764ba2]' : 'text-gray-300'}`}>{semester}</span>
                      {selected && <Check className="w-3 h-3 text-[#667eea] mt-0.5" />}
                    </motion.button>
                  );
                }))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════ MAIN ═══════════════════
export default function SettingsPage() {
  const playerName = useGameStore((s) => s.playerName);
  const playerAvatar = useGameStore((s) => s.playerAvatar);
  const playerLevel = useGameStore((s) => s.playerLevel);
  const totalXP = useGameStore((s) => s.totalXP);
  const totalStars = useGameStore((s) => s.totalStars);
  const streak = useGameStore((s) => s.streak);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const petType = usePetStore((s) => s.petType);
  const petLevel = usePetStore((s) => s.petLevel);
  const coins = usePetStore((s) => s.coins);
  const selectedMathGrade = useGameStore((s) => s.selectedMathGrade);
  const selectedMathSemester = useGameStore((s) => s.selectedMathSemester);
  const selectedChineseGrade = useGameStore((s) => s.selectedChineseGrade);
  const selectedChineseSemester = useGameStore((s) => s.selectedChineseSemester);
  const selectedEnglishGrade = useGameStore((s) => s.selectedEnglishGrade);
  const selectedEnglishSemester = useGameStore((s) => s.selectedEnglishSemester);
  const setMathGrade = useGameStore((s) => s.setMathGrade);
  const setChineseGrade = useGameStore((s) => s.setChineseGrade);
  const setEnglishGrade = useGameStore((s) => s.setEnglishGrade);

  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [mathGradeDialogOpen, setMathGradeDialogOpen] = useState(false);
  const [chineseGradeDialogOpen, setChineseGradeDialogOpen] = useState(false);
  const [englishGradeDialogOpen, setEnglishGradeDialogOpen] = useState(false);

  const displayName = playerName || '小朋友';
  const xpInfo = useMemo(() => getXPForNextLevel(totalXP), [totalXP]);
  const petConfig = petType ? PET_CONFIGS.find((p) => p.id === petType) : null;
  const currentRank = getCurrentRank(playerLevel);


  const handleClearData = () => {
    localStorage.removeItem('math-genius-game-store');
    localStorage.removeItem('math-genius-pet-store');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      {/* ═══════════════════ HERO HEADER ═══════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb] pb-20 pt-6 px-4">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4" />

        <div className="mx-auto max-w-md">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="relative z-10">
          <h1 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" /> 设置
          </h1>

          {/* Profile card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-4">
              <motion.button whileTap={{ scale: 0.92 }} onClick={() => setAvatarDialogOpen(true)} className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl ring-2 ring-white/20">
                  {playerAvatar}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Palette className="w-3 h-3 text-white/80" />
                </div>
              </motion.button>
              <div className="flex-1 min-w-0">
                <motion.button whileTap={{ scale: 0.98 }} onClick={() => setNameDialogOpen(true)} className="flex items-center gap-1.5 group">
                  <h2 className="text-white text-lg font-bold truncate">{displayName}</h2>
                  <Sparkles className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70 transition-colors" />
                </motion.button>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-white/15 px-1.5 py-0.5 text-[9px] font-bold text-white/90">
                    {currentRank.emoji} {currentRank.name}
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-white/15 px-1.5 py-0.5 text-[9px] font-bold text-white/90">
                    <Trophy className="size-2" /> Lv.{playerLevel}
                  </span>
                  {petConfig && (
                    <span className="inline-flex items-center gap-0.5 rounded-md bg-white/15 px-1.5 py-0.5 text-[9px] font-bold text-white/90">
                      {getPetEmoji(petType, petLevel)} Lv.{petLevel}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* XP bar */}
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-white/50 mb-1 font-medium">
                <span>经验进度</span>
                <span>{xpInfo.currentLevelXP} / {xpInfo.nextLevelXP} XP</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-white/60 to-white/30"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(xpInfo.progress * 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      </div>

      {/* ═══════════════════ STAT CHIPS (overlapping) ═══════════════════ */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="mx-auto max-w-md px-4 -mt-6 relative z-20 mb-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Star, label: '星星', value: totalStars, color: '#FF6B35' },
            { icon: Zap, label: '经验', value: totalXP, color: '#667eea' },
            { icon: Flame, label: '连续', value: `${streak}天`, color: '#E84393' },
            { icon: Coins, label: '金币', value: coins, color: '#FDCB6E' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl py-2.5 px-2 text-center shadow-md shadow-gray-200/40">
              <s.icon className="w-3.5 h-3.5 mx-auto mb-0.5" style={{ color: s.color }} />
              <p className="text-[12px] font-bold text-gray-800">{s.value}</p>
              <p className="text-[8px] text-gray-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══════════════════ SETTINGS GROUPS ═══════════════════ */}
      <div className="mx-auto max-w-md px-4 pb-28 space-y-4">

        {/* Profile */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-4 pt-3 pb-1">
            <span className="text-[10px] font-bold text-[#667eea] uppercase tracking-widest">个人资料</span>
          </div>
          <SettingItem
            icon={<Palette className="w-4 h-4 text-[#667eea]" />}
            iconColor="#667eea" iconBg="#667eea12"
            title="更换头像" subtitle="选择一个喜欢的头像"
            onClick={() => setAvatarDialogOpen(true)}
          >
            <span className="text-lg">{playerAvatar}</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </SettingItem>
          <div className="mx-4 h-px bg-gray-50" />
          <SettingItem
            icon={<User className="w-4 h-4 text-[#FF6B35]" />}
            iconColor="#FF6B35" iconBg="#FF6B3512"
            title="修改昵称" subtitle={playerName || '点击设置你的名字'}
            onClick={() => setNameDialogOpen(true)}
          >
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </SettingItem>
        </motion.div>

        {/* Preferences */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-4 pt-3 pb-1">
            <span className="text-[10px] font-bold text-[#00B894] uppercase tracking-widest">偏好设置</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: soundEnabled ? '#00B89412' : '#95A5A612' }}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#00B894]" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            </div>
            <div className="flex-1">
              <Label className="text-[13px] font-semibold text-gray-800">音效</Label>
              <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{soundEnabled ? '已开启 · 答题声音反馈' : '已关闭 · 安静模式'}</p>
            </div>
            <Switch checked={soundEnabled} onCheckedChange={toggleSound} />
          </div>
        </motion.div>

        {/* Learning */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-4 pt-3 pb-1">
            <span className="text-[10px] font-bold text-[#E84393] uppercase tracking-widest">学习引导</span>
          </div>
          <SettingItem
            icon={<GraduationCap className="w-4 h-4 text-[#E84393]" />}
            iconColor="#E84393" iconBg="#E8439312"
            title="新手引导" subtitle="重新查看应用功能介绍"
            onClick={() => { useOnboardingStore.getState().resetOnboarding(); useGameStore.getState().setCurrentView('onboarding'); }}
          >
            <Badge className="bg-[#E84393]/10 text-[#E84393] text-[10px] font-bold border-0 rounded-md">5步</Badge>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </SettingItem>
        </motion.div>

        {/* Question Bank */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-4 pt-3 pb-1">
            <span className="text-[10px] font-bold text-[#FF6B35] uppercase tracking-widest">题库设置</span>
          </div>
          <SettingItem
            icon={<span className="text-base">🧮</span>} iconColor="#FF6B35" iconBg="#FF6B3512"
            title="数学"
            subtitle={selectedMathGrade ? getGradeLabel(selectedMathGrade as Grade, selectedMathSemester as Semester) : '点击选择年级'}
            onClick={() => setMathGradeDialogOpen(true)}
          >
            <Badge className={`text-[10px] font-bold border-0 rounded-md ${selectedMathGrade ? 'bg-[#FF6B35]/10 text-[#FF6B35]' : 'bg-gray-100 text-gray-400'}`}>
              {selectedMathGrade ? getGradeLabel(selectedMathGrade as Grade, selectedMathSemester as Semester) : '未设置'}
            </Badge>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </SettingItem>
          <div className="mx-4 h-px bg-gray-50" />
          <SettingItem
            icon={<span className="text-base">📖</span>} iconColor="#E84393" iconBg="#E8439312"
            title="语文"
            subtitle={selectedChineseGrade ? getGradeLabel(selectedChineseGrade as Grade, selectedChineseSemester as Semester) : '点击选择年级'}
            onClick={() => setChineseGradeDialogOpen(true)}
          >
            <Badge className={`text-[10px] font-bold border-0 rounded-md ${selectedChineseGrade ? 'bg-[#E84393]/10 text-[#E84393]' : 'bg-gray-100 text-gray-400'}`}>
              {selectedChineseGrade ? getGradeLabel(selectedChineseGrade as Grade, selectedChineseSemester as Semester) : '未设置'}
            </Badge>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </SettingItem>
          <div className="mx-4 h-px bg-gray-50" />
          <SettingItem
            icon={<span className="text-base">🔤</span>} iconColor="#00B894" iconBg="#00B89412"
            title="英语"
            subtitle={selectedEnglishGrade ? getGradeLabel(selectedEnglishGrade as Grade, selectedEnglishSemester as Semester) : '点击选择年级'}
            onClick={() => setEnglishGradeDialogOpen(true)}
          >
            <Badge className={`text-[10px] font-bold border-0 rounded-md ${selectedEnglishGrade ? 'bg-[#00B894]/10 text-[#00B894]' : 'bg-gray-100 text-gray-400'}`}>
              {selectedEnglishGrade ? getGradeLabel(selectedEnglishGrade as Grade, selectedEnglishSemester as Semester) : '未设置'}
            </Badge>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </SettingItem>
        </motion.div>

        {/* Parent & Extension */}
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-4 pt-3 pb-1">
            <span className="text-[10px] font-bold text-[#0984E3] uppercase tracking-widest">更多</span>
          </div>
          <SettingItem
            icon={<FileText className="w-4 h-4 text-[#0984E3]" />} iconColor="#0984E3" iconBg="#0984E312"
            title="家长报告" subtitle="查看孩子的学习总结"
            onClick={() => useGameStore.getState().setCurrentView('parent-dashboard')}
          >
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </SettingItem>
          <div className="mx-4 h-px bg-gray-50" />
          <SettingItem
            icon={<Database className="w-4 h-4 text-[#6C5CE7]" />} iconColor="#6C5CE7" iconBg="#6C5CE712"
            title="题库管理" subtitle="导入、管理和导出题库"
            onClick={() => useGameStore.getState().setCurrentView('question-bank-manager')}
          >
            <Badge className="bg-[#6C5CE7]/10 text-[#6C5CE7] text-[10px] font-bold border-0 rounded-md">3科</Badge>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </SettingItem>
        </motion.div>

        {/* Tools & Data - compact row layout */}
        <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-4 pt-3 pb-1">
            <span className="text-[10px] font-bold text-[#6C5CE7] uppercase tracking-widest">工具</span>
          </div>
          <div className="grid grid-cols-3 gap-0 border-t border-gray-50">
            {/* Download APK */}
            <a
              href="/app-debug.apk"
              download
              className="flex flex-col items-center justify-center py-3 text-center transition-colors active:bg-gray-50"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#6C5CE7]/10 mb-1">
                <Smartphone className="w-3.5 h-3.5 text-[#6C5CE7]" />
              </div>
              <p className="text-[11px] font-semibold text-gray-700">下载APP</p>
              <p className="text-[9px] text-gray-400">5.2MB</p>
            </a>
            {/* Recharge Coins */}
            <button
              onClick={() => {
                const cur = usePetStore.getState().coins;
                if (cur < 100000) usePetStore.getState().addCoins(100000 - cur);
              }}
              className="flex flex-col items-center justify-center py-3 text-center transition-colors active:bg-gray-50 border-x border-gray-50"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#FDCB6E]/10 mb-1">
                <Coins className="w-3.5 h-3.5 text-[#FDCB6E]" />
              </div>
              <p className="text-[11px] font-semibold text-gray-700">充值金币</p>
              <p className="text-[9px] text-gray-400">{coins}🪙</p>
            </button>
            {/* Clear Data */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex flex-col items-center justify-center py-3 text-center transition-colors active:bg-gray-50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 mb-1">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <p className="text-[11px] font-semibold text-red-400">清除数据</p>
                  <p className="text-[9px] text-gray-400">不可恢复</p>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-red-500" />
                    </div>
                    <AlertDialogTitle className="text-left font-bold">确定要清除所有数据吗？</AlertDialogTitle>
                  </div>
                  <AlertDialogDescription className="text-left pl-[52px] text-gray-500">此操作将删除以下数据且无法恢复：</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="pl-[52px] space-y-1.5 mb-4">
                  {['学习记录和统计数据', '成就和里程碑', '宠物、金币和家具', '连续学习天数'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-red-500">
                      <X className="w-3.5 h-3.5 flex-shrink-0" /><span>{item}</span>
                    </div>
                  ))}
                </div>
                <AlertDialogFooter className="flex-row gap-2">
                  <AlertDialogCancel className="flex-1 rounded-xl h-11 font-semibold">取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearData} className="flex-1 rounded-xl h-11 bg-red-500 text-white hover:bg-red-600 font-semibold">确定清除</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </motion.div>

        {/* About */}
        <motion.div custom={9} variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white rounded-2xl shadow-sm px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-lg shadow-md shadow-[#667eea]/20">
              ⚔️
            </div>
            <div className="flex-1">
              <h4 className="text-[13px] font-bold text-gray-800">知识小勇士</h4>
              <p className="text-[10px] text-gray-400 font-medium">v1.3.0 · 数学·语文·英语·宠物·成就</p>
            </div>
          </div>
        </motion.div>


      </div>

      {/* Dialogs */}
      <EditNameDialog open={nameDialogOpen} onClose={() => setNameDialogOpen(false)} currentName={playerName} />
      <AvatarPickerDialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)} currentAvatar={playerAvatar} />
      <GradePickerDialog open={mathGradeDialogOpen} onClose={() => setMathGradeDialogOpen(false)} subject="数学" currentGrade={selectedMathGrade} currentSemester={selectedMathSemester} onConfirm={setMathGrade} />
      <GradePickerDialog open={chineseGradeDialogOpen} onClose={() => setChineseGradeDialogOpen(false)} subject="语文" currentGrade={selectedChineseGrade} currentSemester={selectedChineseSemester} onConfirm={setChineseGrade} />
      <GradePickerDialog open={englishGradeDialogOpen} onClose={() => setEnglishGradeDialogOpen(false)} subject="英语" currentGrade={selectedEnglishGrade} currentSemester={selectedEnglishSemester} onConfirm={setEnglishGrade} />

      <BottomNav />
    </div>
  );
}
