'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Coins,
  Heart,
  Apple,
  Gamepad2,
  PawPrint,
  ShoppingBag,
  Undo2,
  Check,
  Sparkles,
  ShoppingCart,
  Lock,
  Zap,
  Shield,
  Star,
  TrendingUp,
  Crown,
  Sun,
  Moon,
  Cloud,
  Store,
  Filter,
} from 'lucide-react';
import {
  usePetStore,
  PET_CONFIGS,
  PET_ABILITIES,
  FURNITURE_SHOP,
  LEVEL_UNLOCKS,
  getPetXPForNextLevel,
  getCoinBonusPercent,
  getXPBonusPercent,
  getCriticalHitChance,
  getComboMultiplier,
  getNextUnlock,
  getPetTalent,
  FurnitureCategory as FurnitureCategoryType,
} from '@/lib/pet-store';
import { useGameStore } from '@/lib/game-store';
import { playClickSound } from '@/lib/sound';
import BottomNav from './BottomNav';
import PetRoomScene from './PetRoomScene';

type Tab = 'home' | 'skills' | 'adopt' | 'shop' | 'room';
type FurnitureCategory = 'all' | 'bed' | 'food' | 'toy' | 'decor' | 'wallpaper' | 'flooring' | 'lighting';

// ─── Floating Particle Component ──────────────────────────────────────────────
function FloatingParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      duration: Math.random() * 4 + 5,
      delay: Math.random() * 3,
      opacity: Math.random() * 0.3 + 0.15,
    })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-amber-300/60 dark:bg-amber-200/40"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Window with Sky Component ────────────────────────────────────────────────
function RoomWindow() {
  const isNight = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const hour = new Date().getHours();
    return hour < 6 || hour >= 19;
  }, []);

  const skyGradient = isNight
    ? 'from-indigo-900 via-slate-800 to-slate-900'
    : 'from-sky-300 via-sky-200 to-blue-100';

  return (
    <div className={`absolute top-[8%] left-1/2 -translate-x-1/2 w-[40%] h-[50%] rounded-md overflow-hidden shadow-lg border-2 border-amber-700/30 ${skyGradient} transition-colors duration-1000`}>
      {/* Window frame cross */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-amber-700/25" />
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-amber-700/25" />
      </div>

      {/* Clouds */}
      {!isNight && (
        <>
          <motion.div
            className="absolute bg-white/70 rounded-full"
            style={{ width: 28, height: 12, top: '20%', left: '10%' }}
            animate={{ x: [0, 40, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute bg-white/50 rounded-full"
            style={{ width: 22, height: 9, top: '55%', left: '50%' }}
            animate={{ x: [0, -35, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          />
        </>
      )}

      {/* Stars at night */}
      {isNight && (
        <>
          <div className="absolute w-1 h-1 bg-white rounded-full top-[20%] left-[25%] animate-pulse" />
          <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-[40%] left-[60%] animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute w-1 h-1 bg-white rounded-full top-[30%] left-[75%] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[60%] left-[30%] animate-pulse" style={{ animationDelay: '1.5s' }} />
          {/* Moon */}
          <div className="absolute top-[15%] right-[20%] w-5 h-5 bg-yellow-100 rounded-full shadow-lg shadow-yellow-200/50" />
        </>
      )}

      {/* Sun/Moon icon */}
      <div className="absolute top-[15%] left-[15%]">
        {isNight ? (
          <Moon className="w-3 h-3 text-yellow-200 opacity-60" />
        ) : (
          <Sun className="w-3 h-3 text-yellow-400 opacity-70" />
        )}
      </div>
    </div>
  );
}

// ─── Light Rays from Window ───────────────────────────────────────────────────
function LightRays() {
  return (
    <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[60%] h-[85%] pointer-events-none overflow-hidden">
      <div
        className="absolute top-0 left-[20%] w-[60%] h-full bg-gradient-to-b from-amber-200/15 via-amber-100/8 to-transparent"
        style={{
          clipPath: 'polygon(35% 0%, 65% 0%, 85% 100%, 15% 100%)',
        }}
      />
    </div>
  );
}

// ─── Mood Bar with Gradient ───────────────────────────────────────────────────
function MoodBar({ mood }: { mood: number }) {
  const moodColor = useMemo(() => {
    if (mood >= 80) return 'from-emerald-400 to-green-400';
    if (mood >= 60) return 'from-lime-400 to-emerald-400';
    if (mood >= 40) return 'from-yellow-400 to-lime-400';
    if (mood >= 20) return 'from-orange-400 to-yellow-400';
    return 'from-red-400 to-orange-400';
  }, [mood]);

  const moodEmoji = useMemo(() => {
    if (mood >= 80) return '😄';
    if (mood >= 60) return '😊';
    if (mood >= 40) return '😐';
    if (mood >= 20) return '😢';
    return '😭';
  }, [mood]);

  const moodText = useMemo(() => {
    if (mood >= 80) return '超开心';
    if (mood >= 60) return '很开心';
    if (mood >= 40) return '还不错';
    if (mood >= 20) return '有点闷';
    return '不开心';
  }, [mood]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-lg">{moodEmoji}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">心情</span>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{moodText} ({mood}/100)</span>
        </div>
        <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${moodColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${mood}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Decorative Floating Hearts ───────────────────────────────────────────────
function FloatingDecorations() {
  const items = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      emoji: ['💕', '✨', '⭐', '💖', '🌟', '💫'][i],
      x: 10 + (i * 15) % 80,
      delay: i * 0.8,
      duration: 3 + (i % 3),
    })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {items.map((item) => (
        <motion.div
          key={item.id}
          className="absolute text-sm opacity-20"
          style={{ left: `${item.x}%`, top: '10%' }}
          animate={{
            y: [0, -12, 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {item.emoji}
        </motion.div>
      ))}
    </div>
  );
}

function BuffItem({ emoji, label, value, active }: { emoji: string; label: string; value: string; active: boolean }) {
  return (
    <div className={`rounded-xl px-4 py-3 ${active ? 'bg-white/80 shadow-sm' : 'bg-white/40'}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm">{emoji}</span>
        <span className={`text-[11px] ${active ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>{label}</span>
      </div>
      <p className={`text-sm font-bold mt-0.5 ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>{value}</p>
    </div>
  );
}

// ─── Tier Badge Component ─────────────────────────────────────────────────────
function TierBadge({ tier }: { tier: number }) {
  const config = [
    { label: '普通', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    { label: '优质', color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
    { label: '精良', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' },
    { label: '传说', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
  ][tier - 1] ?? [
    { label: '普通', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  ][0];
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${config.color}`}>
      {config.label}
    </span>
  );
}

export default function PetPage() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [tempName, setTempName] = useState('');
  const [purchaseFeedback, setPurchaseFeedback] = useState<{ id: string; success: boolean } | null>(null);
  const [furnitureFilter, setFurnitureFilter] = useState<FurnitureCategory>('all');
  const [shopFilter, setShopFilter] = useState<FurnitureCategory>('all');

  const petType = usePetStore((s) => s.petType);
  const petName = usePetStore((s) => s.petName);
  const petLevel = usePetStore((s) => s.petLevel);
  const petXP = usePetStore((s) => s.petXP);
  const petMood = usePetStore((s) => s.petMood);
  const coins = usePetStore((s) => s.coins);
  const furniture = usePetStore((s) => s.furniture);
  const equippedFurniture = usePetStore((s) => s.equippedFurniture);

  const adoptPet = usePetStore((s) => s.adoptPet);
  const renamePet = usePetStore((s) => s.renamePet);
  const feedPet = usePetStore((s) => s.feedPet);
  const playWithPet = usePetStore((s) => s.playWithPet);
  const buyFurniture = usePetStore((s) => s.buyFurniture);
  const equipFurniture = usePetStore((s) => s.equipFurniture);
  const unequipFurniture = usePetStore((s) => s.unequipFurniture);
  const petProgressMap = usePetStore((s) => s.petProgressMap);

  const petConfig = useMemo(
    () => (petType ? PET_CONFIGS.find((p) => p.id === petType) : null),
    [petType]
  );

  const petTalent = useMemo(
    () => (petType ? getPetTalent(petType) : null),
    [petType]
  );

  const petProgress = useMemo(() => getPetXPForNextLevel(petXP), [petXP]);

  const moodEmoji = useMemo(() => {
    if (petMood >= 80) return '😄';
    if (petMood >= 60) return '😊';
    if (petMood >= 40) return '😐';
    if (petMood >= 20) return '😢';
    return '😭';
  }, [petMood]);

  const moodText = useMemo(() => {
    if (petMood >= 80) return '超开心';
    if (petMood >= 60) return '很开心';
    if (petMood >= 40) return '还不错';
    if (petMood >= 20) return '有点闷';
    return '不开心';
  }, [petMood]);

  const handleRename = () => {
    if (tempName.trim()) {
      renamePet(tempName.trim());
      setEditNameOpen(false);
    }
  };

  const handleAdopt = (petId: string) => {
    const config = PET_CONFIGS.find((p) => p.id === petId);
    if (config) {
      const isAlreadyAdopted = !!petProgressMap[petId];
      adoptPet(petId);
      // Only show naming dialog for newly adopted pets
      if (!isAlreadyAdopted) {
        setTempName(config.name);
        setEditNameOpen(true);
      }
    }
  };

  const furnitureByCategory = useMemo(() => {
    const categoryLabels: Record<string, { emoji: string; label: string }> = {
      bed: { emoji: '🛏️', label: '小床' },
      food: { emoji: '🍽️', label: '餐具' },
      toy: { emoji: '🎾', label: '玩具' },
      decor: { emoji: '🏮', label: '装饰' },
      wallpaper: { emoji: '🎨', label: '壁纸' },
      flooring: { emoji: '🪵', label: '地板' },
      lighting: { emoji: '💡', label: '灯光' },
    };
    const result: Record<string, { items: typeof FURNITURE_SHOP; emoji: string; label: string }> = {};
    for (const item of FURNITURE_SHOP) {
      const cat = item.category;
      if (!result[cat]) {
        const meta = categoryLabels[cat] ?? { emoji: '📦', label: cat };
        result[cat] = { items: [], emoji: meta.emoji, label: meta.label };
      }
      result[cat].items.push(item);
    }
    return result;
  }, []);

  const equippedItems = useMemo(() => {
    const items: typeof FURNITURE_SHOP = [];
    Object.entries(equippedFurniture).forEach(([, id]) => {
      if (id) {
        const item = FURNITURE_SHOP.find((f) => f.id === id);
        if (item) items.push(item);
      }
    });
    return items;
  }, [equippedFurniture]);

  // Categorize equipped furniture for room placement
  const roomFurniture = useMemo(() => {
    const bed = equippedItems.find((i) => i.category === 'bed');
    const food = equippedItems.find((i) => i.category === 'food');
    const toy = equippedItems.find((i) => i.category === 'toy');
    const decor = equippedItems.find((i) => i.category === 'decor');
    const lighting = equippedItems.find((i) => i.category === 'lighting');
    const wallpaper = equippedItems.find((i) => i.category === 'wallpaper');
    const flooring = equippedItems.find((i) => i.category === 'flooring');
    return { bed, food, toy, decor, lighting, wallpaper, flooring };
  }, [equippedItems]);

  // Filtered furniture for room inventory
  const filteredFurniture = useMemo(() => {
    if (furnitureFilter === 'all') return furniture;
    return furniture.filter((itemId) => {
      const item = FURNITURE_SHOP.find((f) => f.id === itemId);
      return item?.category === furnitureFilter;
    });
  }, [furniture, furnitureFilter]);

  const setCurrentView = useGameStore((s) => s.setCurrentView);

  // ─── No Pet View (DO NOT CHANGE) ──────────────────────────────────────────────
  if (!petType || !petConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-4 pt-3 pb-5 text-white safe-top">
          <div className="mx-auto max-w-md">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => { playClickSound(); setCurrentView('home'); }} className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors active:scale-95 min-h-[44px]">
                <ArrowLeft className="w-4 h-4" />
                返回
              </button>
            </div>
            <h1 className="text-2xl font-bold mb-1">🐾 宠物小屋</h1>
            <p className="text-white/70 text-xs">领养一个小伙伴，陪你一起学习</p>
          </div>
        </div>

        <div className="mx-auto max-w-md px-4 py-6 pb-28">
          <div className="grid grid-cols-1 gap-4">
            {PET_CONFIGS.map((pet, i) => {
              // Each pet type gets a unique color theme for their talent badge
              const talentColors: Record<string, { bg: string; text: string; border: string }> = {
                '财运亨通': { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-700' },
                '暴击之王': { bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-700' },
                '学霸附体': { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-700' },
                '连击达人': { bg: 'bg-rose-50 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-700' },
                '聚宝盆': { bg: 'bg-yellow-50 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-700' },
                '外语天才': { bg: 'bg-cyan-50 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-700' },
                '全能学霸': { bg: 'bg-violet-50 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-700' },
              };
              const tc = talentColors[pet.talent.name] ?? { bg: 'bg-violet-50 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-700' };
              return (
                <motion.div
                  key={pet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card
                    className="cursor-pointer border-0 py-0 shadow-sm transition-all hover:scale-[1.02] hover:shadow-lg"
                    onClick={() => handleAdopt(pet.id)}
                  >
                    <CardContent className="bg-white p-5 dark:bg-gray-800/50">
                      <div className="flex items-start gap-4">
                        <motion.div
                          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 dark:from-rose-900/20 dark:to-amber-900/20 text-4xl shadow-sm"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          {pet.emoji}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                              {pet.name}
                            </p>
                            <span className={`flex items-center gap-0.5 rounded-full ${tc.bg} ${tc.border} border px-2 py-0.5`}>
                              <span className="text-xs">{pet.talent.emoji}</span>
                              <span className={`text-[10px] font-bold ${tc.text}`}>{pet.talent.name}</span>
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {pet.description}
                          </p>
                          <p className={`text-[11px] ${tc.text} mt-1 font-medium`}>
                            {pet.talent.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ─── Has Pet View ────────────────────────────────────────────────────────────
  const tabs: { key: Tab; label: string; emoji: string }[] = [
    { key: 'home', label: '宠物', emoji: '🏠' },
    { key: 'skills', label: '技能', emoji: '⚡' },
    { key: 'adopt', label: '领养', emoji: '🐾' },
    { key: 'shop', label: '商店', emoji: '🛒' },
    { key: 'room', label: '房间', emoji: '🏡' },
  ];

  const categoryChips: { key: FurnitureCategory; label: string; emoji: string }[] = [
    { key: 'all', label: '全部', emoji: '📦' },
    { key: 'bed', label: '小床', emoji: '🛏️' },
    { key: 'food', label: '餐具', emoji: '🍽️' },
    { key: 'toy', label: '玩具', emoji: '🎾' },
    { key: 'decor', label: '装饰', emoji: '🏮' },
    { key: 'wallpaper', label: '壁纸', emoji: '🎨' },
    { key: 'flooring', label: '地板', emoji: '🪵' },
    { key: 'lighting', label: '灯光', emoji: '💡' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-4 pt-3 pb-5 text-white safe-top">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => { playClickSound(); setCurrentView('home'); }} className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors active:scale-95 min-h-[44px]">
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
            <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1">
              <Coins className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">{coins}</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-1">🐾 宠物小屋</h1>
          <p className="text-white/70 text-xs">和你的小伙伴一起成长</p>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 py-6 pb-28">

        {/* Tab Bar */}
        <div className="flex gap-1 rounded-xl bg-white/60 p-1 mb-6 dark:bg-gray-800/60 backdrop-blur-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-0 rounded-lg py-2 px-1 text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-gray-800 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <span className="block text-center truncate">
                <span className="mr-0.5">{tab.emoji}</span>{tab.label}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ═══════════════════════════════════════════════════════════════════════
              HOME TAB - Redesigned with more space & airiness
              ═══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5"
            >
              {/* Pet Display - More Spacious with depth */}
              <Card className="overflow-hidden border-0 py-0 shadow-md">
                <CardContent className="bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 dark:from-rose-950/40 dark:via-pink-950/40 dark:to-amber-950/40 p-8 relative">
                  <FloatingDecorations />
                  <div className="text-center relative z-10">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-8xl mb-4 drop-shadow-sm"
                    >
                      {petConfig?.emoji ?? '🐾'}
                    </motion.div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {petName}
                      </h2>
                      <button
                        onClick={() => {
                          setTempName(petName);
                          setEditNameOpen(true);
                        }}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        ✏️
                      </button>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 text-xs px-3 py-1"
                    >
                      Lv.{petLevel}
                    </Badge>
                  </div>

                  {/* XP Progress - More Breathing Room */}
                  <div className="mt-6">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                      <span>经验值</span>
                      <span>
                        {petProgress.current} / {petProgress.needed}
                      </span>
                    </div>
                    <Progress value={petProgress.progress * 100} className="h-2.5" />
                  </div>

                  {/* Mood Bar - Visual Gradient */}
                  <div className="mt-5">
                    <MoodBar mood={petMood} />
                  </div>
                </CardContent>
              </Card>

              {/* Current Buffs Summary - More Padding & Depth */}
              <Card className="border-0 py-0 overflow-hidden shadow-sm">
                <CardContent className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-violet-500" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">当前加成</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <BuffItem emoji="💰" label="金币加成" value={`+${getCoinBonusPercent(petLevel, petType)}%`} active={getCoinBonusPercent(petLevel, petType) > 0} />
                    <BuffItem emoji="📖" label="经验加成" value={`+${getXPBonusPercent(petLevel, petType)}%`} active={getXPBonusPercent(petLevel, petType) > 0} />
                    <BuffItem emoji="⚡" label="暴击率" value={`${Math.round(getCriticalHitChance(petLevel, petType) * 100)}%`} active={getCriticalHitChance(petLevel, petType) > 0} />
                    <BuffItem emoji="🔥" label="连击倍率" value={`×${getComboMultiplier(petLevel, petType).toFixed(1)}`} active={getComboMultiplier(petLevel, petType) > 1} />
                  </div>
                </CardContent>
              </Card>

              {/* Pet Talent Card */}
              {petTalent && (
                <Card className="border-0 py-0 overflow-hidden shadow-sm">
                  <CardContent className="bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-rose-950/30 p-5 border border-amber-100/50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 shadow-sm">
                        <span className="text-2xl">{petTalent?.emoji ?? '✨'}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{petTalent?.name ?? ''}</span>
                          <span className="text-[10px] rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 font-medium">天赋</span>
                        </div>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
                          {petTalent?.description ?? ''}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Next Unlock Hint */}
              {(() => {
                const next = getNextUnlock(petLevel);
                if (!next) return null;
                const xpNeeded = petProgress.needed - petProgress.current;
                return (
                  <Card className="border-0 py-0 overflow-hidden">
                    <CardContent className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 p-5 border border-amber-100">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                          <Lock className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
                            {next.emoji} {next.name}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                            Lv.{next.level} 解锁 · {next.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-600">
                          还需 {xpNeeded} XP
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Actions - More Spacious with shadow */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-0 py-0 cursor-pointer transition-all hover:scale-[1.02] shadow-sm hover:shadow-md">
                  <CardContent
                    className="bg-white p-5 dark:bg-gray-800/50"
                    onClick={feedPet}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/30">
                        <Apple className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                          喂食
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          消耗 5 🪙
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 py-0 cursor-pointer transition-all hover:scale-[1.02] shadow-sm hover:shadow-md">
                  <CardContent
                    className="bg-white p-5 dark:bg-gray-800/50"
                    onClick={playWithPet}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-900/30">
                        <Gamepad2 className="h-5 w-5 text-violet-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                          玩耍
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          消耗 3 🪙
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                {petConfig?.description ?? ''}
              </p>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              SKILLS TAB - UNCHANGED
              ═══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Skill Tree */}
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-violet-500" />
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  技能树
                </h2>
                <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                  Lv.{petLevel}
                </Badge>
              </div>

              <div className="space-y-3">
                {PET_ABILITIES.map((ability, idx) => {
                  const unlocked = petLevel >= ability.level;
                  const isNext = !unlocked && (idx === 0 || petLevel >= PET_ABILITIES[idx - 1].level);
                  return (
                    <motion.div
                      key={ability.level}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      {/* Timeline connector */}
                      {idx > 0 && (
                        <div className={`ml-5 h-4 w-0.5 ${unlocked ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-gray-200 dark:bg-gray-700'}`} />
                      )}
                      <Card className={`border-0 py-0 overflow-hidden transition-all ${unlocked ? 'shadow-sm' : isNext ? 'ring-1 ring-amber-200 shadow-sm' : ''}`}>
                        <CardContent className={`p-3 ${unlocked ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30' : isNext ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30' : 'bg-gray-50 dark:bg-gray-800/30'}`}>
                          <div className="flex items-center gap-3">
                            {/* Level Circle */}
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                              unlocked
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : isNext
                                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300 ring-2 ring-amber-300'
                                  : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                            }`}>
                              {unlocked ? ability.emoji : <Lock className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-bold ${unlocked ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
                                  {ability.name}
                                </p>
                                {unlocked && (
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">已解锁</span>
                                )}
                                {isNext && (
                                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">即将解锁</span>
                                )}
                              </div>
                              <p className={`text-[11px] mt-0.5 ${unlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                                {ability.description}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <Badge variant="outline" className={`text-[10px] ${unlocked ? 'border-emerald-200 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400' : 'border-gray-200 text-gray-400 dark:border-gray-700 dark:text-gray-500'}`}>
                                Lv.{ability.level}
                              </Badge>
                              {unlocked && (
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                                  {ability.effect}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Unlocked Content Section */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="h-5 w-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    等级奖励
                  </h2>
                </div>
                <div className="space-y-2">
                  {LEVEL_UNLOCKS.map((unlock, idx) => {
                    const unlocked = petLevel >= unlock.level;
                    return (
                      <motion.div
                        key={`${unlock.level}-${unlock.name}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
                          unlocked
                            ? 'bg-white shadow-sm dark:bg-gray-800/50'
                            : 'bg-gray-50 dark:bg-gray-800/30'
                        }`}
                      >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-base ${
                          unlocked
                            ? 'bg-amber-100 dark:bg-amber-900/40'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          {unlocked ? unlock.emoji : <Lock className="h-3 w-3 text-gray-300" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold ${unlocked ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
                            {unlock.name}
                          </p>
                          <p className={`text-[10px] ${unlocked ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>
                            {unlock.description}
                          </p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${unlocked ? 'border-amber-200 text-amber-600' : 'border-gray-200 text-gray-400'}`}>
                          Lv.{unlock.level}
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              ADOPT TAB - UNCHANGED
              ═══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'adopt' && (
            <motion.div
              key="adopt"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
                切换不同的小伙伴（等级和装备独立保存）
              </p>
              <div className="grid grid-cols-1 gap-3">
                {PET_CONFIGS.map((pet, i) => {
                  const saved = petProgressMap[pet.id];
                  const isCurrent = pet.id === petType;
                  return (
                  <motion.div
                    key={pet.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card
                      className={`cursor-pointer border-0 py-0 transition-all hover:scale-[1.02] hover:shadow-md ${
                        isCurrent
                          ? 'ring-2 ring-rose-400 dark:ring-rose-600'
                          : ''
                      }`}
                      onClick={() => handleAdopt(pet.id)}
                    >
                      <CardContent className={`${isCurrent ? 'bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30' : 'bg-white dark:bg-gray-800/50'} p-4`}>
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <p className="text-4xl">{pet.emoji}</p>
                            {isCurrent && (
                              <Badge className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] px-1.5 py-0">
                                当前
                              </Badge>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                {pet.name}
                              </p>
                              <span className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 px-2 py-0.5">
                                <span className="text-[10px]">{pet.talent.emoji}</span>
                                <span className="text-[10px] font-bold text-violet-700 dark:text-violet-300">{pet.talent.name}</span>
                              </span>
                              {saved && !isCurrent && (
                                <Badge variant="outline" className="text-[9px] border-amber-200 text-amber-600 dark:border-amber-800 dark:text-amber-400">
                                  Lv.{saved.petLevel}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {pet.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[11px] text-violet-600 dark:text-violet-400 font-medium">
                                {pet.talent.description}
                              </p>
                            </div>
                            {saved && !isCurrent && (
                              <p className="text-[10px] text-emerald-500 dark:text-emerald-400 mt-1">
                                🏠 已有房间 · {Object.values(saved.equippedFurniture).filter(Boolean).length}件家具
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              SHOP TAB - Minor spacing improvements
              ═══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  家具商店
                </h2>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-hide">
                {categoryChips.map((chip) => {
                  const count = chip.key === 'all'
                    ? FURNITURE_SHOP.length
                    : FURNITURE_SHOP.filter((f) => f.category === chip.key).length;
                  return (
                    <button
                      key={chip.key}
                      onClick={() => setShopFilter(chip.key)}
                      className={`flex-shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
                        shopFilter === chip.key
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-sm'
                          : 'bg-white/70 dark:bg-gray-800/70 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 border border-gray-200/50 dark:border-gray-700/50'
                      }`}
                    >
                      <span className="text-sm">{chip.emoji}</span>
                      <span>{chip.label}</span>
                      <span className={`text-[10px] ${shopFilter === chip.key ? 'text-white/70' : 'text-gray-400'}`}>({count})</span>
                    </button>
                  );
                })}
              </div>

              {(shopFilter === 'all' ? Object.entries(furnitureByCategory) : Object.entries(furnitureByCategory).filter(([cat]) => cat === shopFilter)).map(([category, { items, emoji, label }]) => (
                <div key={category} className="mb-7">
                  {shopFilter === 'all' && (
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                      {emoji}{' '}{label}
                    </h3>
                  )}
                  <div className="space-y-2.5">
                    {items.map((item) => {
                      const owned = furniture.includes(item.id);
                      const equipped = Object.values(equippedFurniture).includes(item.id);
                      const canAfford = coins >= item.price;
                      const levelLocked = petLevel < item.levelRequired;
                      const showFeedback = purchaseFeedback?.id === item.id;
                      return (
                        <Card
                          key={item.id}
                          className={`border-0 py-0 transition-all ${
                            equipped
                              ? 'ring-2 ring-emerald-400 shadow-md'
                              : owned
                                ? 'hover:scale-[1.01] cursor-pointer shadow-sm'
                                : levelLocked
                                  ? 'opacity-60'
                                  : 'hover:scale-[1.01] shadow-sm'
                          }`}
                        >
                          <CardContent className={`p-3.5 ${
                            equipped
                              ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30'
                              : 'bg-white dark:bg-gray-800/50'
                          }`}>
                            <div className="flex items-start gap-3">
                              {/* Item emoji */}
                              <div className="flex-shrink-0 text-center">
                                <span className="text-3xl block">{item.emoji}</span>
                                <TierBadge tier={item.tier} />
                              </div>

                              {/* Item info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                                    {item.name}
                                  </p>
                                </div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">
                                  {item.description}
                                </p>
                                <p className="text-[11px] text-violet-600 dark:text-violet-400 font-medium">
                                  {item.effect}
                                </p>
                                {levelLocked && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Lock className="h-3 w-3 text-gray-400" />
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                      需要 Lv.{item.levelRequired}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Price & action */}
                              <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                                <div className="flex items-center gap-1">
                                  <Coins className="h-3.5 w-3.5 text-amber-500" />
                                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                    {item.price}
                                  </span>
                                </div>

                                {showFeedback && purchaseFeedback?.success ? (
                                  <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex items-center gap-1 text-emerald-600"
                                  >
                                    <Check className="h-3 w-3" />
                                    <span className="text-[10px] font-medium">购买成功!</span>
                                  </motion.div>
                                ) : showFeedback && !purchaseFeedback?.success ? (
                                  <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-[10px] text-red-500"
                                  >
                                    {levelLocked ? '等级不足' : '金币不足'}
                                  </motion.div>
                                ) : equipped ? (
                                  <div className="flex items-center gap-1">
                                    <Check className="h-3 w-3 text-emerald-500" />
                                    <span className="text-[10px] text-emerald-600">
                                      已装备
                                    </span>
                                  </div>
                                ) : owned ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-[11px] px-3 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                    onClick={() =>
                                      equipFurniture(item.id, item.category as FurnitureCategoryType)
                                    }
                                  >
                                    装备
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant={canAfford && !levelLocked ? 'default' : 'secondary'}
                                    className={`h-7 text-[11px] px-3 gap-1 ${
                                      canAfford && !levelLocked
                                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                    onClick={() => {
                                      if (levelLocked) {
                                        setPurchaseFeedback({ id: item.id, success: false });
                                        setTimeout(() => setPurchaseFeedback(null), 1500);
                                        return;
                                      }
                                      if (canAfford) {
                                        const success = buyFurniture(item.id);
                                        setPurchaseFeedback({ id: item.id, success });
                                        setTimeout(() => setPurchaseFeedback(null), 1500);
                                      } else {
                                        setPurchaseFeedback({ id: item.id, success: false });
                                        setTimeout(() => setPurchaseFeedback(null), 1500);
                                      }
                                    }}
                                    disabled={!canAfford || levelLocked}
                                  >
                                    <ShoppingCart className="h-3 w-3" />
                                    购买
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              ROOM TAB - Uses PetRoomScene component
              ═══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'room' && (
            <motion.div
              key="room"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <PetRoomScene onCategoryClick={(cat) => {
                setShopFilter(cat as FurnitureCategory);
                setActiveTab('shop');
              }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rename Dialog */}
        <Dialog open={editNameOpen} onOpenChange={setEditNameOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>给宠物取名字</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2">
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="宠物名字"
                maxLength={8}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              />
              <Button onClick={handleRename} size="sm">
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <BottomNav />
    </div>
  );
}
