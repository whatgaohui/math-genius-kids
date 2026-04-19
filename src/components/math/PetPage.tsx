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
} from '@/lib/pet-store';
import BottomNav from './BottomNav';

type Tab = 'home' | 'skills' | 'adopt' | 'shop' | 'room';

function TalentTag({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50 border border-violet-100 dark:border-violet-900/50 px-2 py-0.5">
      <span className="text-[10px]">{emoji}</span>
      <span className="text-[10px] font-medium text-violet-700 dark:text-violet-300">{label}</span>
      <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">{value}</span>
    </div>
  );
}

function BuffItem({ emoji, label, value, active }: { emoji: string; label: string; value: string; active: boolean }) {
  return (
    <div className={`rounded-lg px-3 py-2 ${active ? 'bg-white/80 shadow-sm' : 'bg-white/40'}`}>
      <div className="flex items-center gap-1.5">
        <span className="text-xs">{emoji}</span>
        <span className={`text-[10px] ${active ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>{label}</span>
      </div>
      <p className={`text-xs font-bold mt-0.5 ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>{value}</p>
    </div>
  );
}

export default function PetPage() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [tempName, setTempName] = useState('');
  const [purchaseFeedback, setPurchaseFeedback] = useState<{ id: string; success: boolean } | null>(null);

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
      adoptPet(petId);
      setTempName(config.name);
      setEditNameOpen(true);
    }
  };

  const furnitureByCategory = useMemo(() => {
    const categories = { bed: '小床', food: '餐具', toy: '玩具', decor: '装饰' };
    const result: Record<string, typeof FURNITURE_SHOP> = {};
    for (const item of FURNITURE_SHOP) {
      if (!result[item.category]) result[item.category] = [];
      result[item.category].push(item);
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

  if (!petType || !petConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="mx-auto max-w-md px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <p className="text-6xl mb-4">🐾</p>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              宠物小屋
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              领养一个小伙伴，陪你一起学习吧！
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-3">
            {PET_CONFIGS.map((pet, i) => (
              <motion.div
                key={pet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card
                  className="cursor-pointer border-0 py-0 transition-all hover:scale-[1.02] hover:shadow-md"
                  onClick={() => handleAdopt(pet.id)}
                >
                  <CardContent className="bg-white p-4 dark:bg-gray-800/50">
                    <div className="flex items-start gap-3">
                      <p className="text-4xl">{pet.emoji}</p>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                            {pet.name}
                          </p>
                          <span className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 px-2 py-0.5">
                            <span className="text-xs">{pet.talent.emoji}</span>
                            <span className="text-[10px] font-bold text-violet-700 dark:text-violet-300">{pet.talent.name}</span>
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {pet.description}
                        </p>
                        <p className="text-[11px] text-violet-600 dark:text-violet-400 mt-1 font-medium">
                          {pet.talent.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Has pet view
  const tabs: { key: Tab; label: string; emoji: string }[] = [
    { key: 'home', label: '我的宠物', emoji: '🏠' },
    { key: 'skills', label: '技能', emoji: '⚡' },
    { key: 'adopt', label: '换宠物', emoji: '🐾' },
    { key: 'shop', label: '商店', emoji: '🛒' },
    { key: 'room', label: '房间', emoji: '🏠' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-md px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            🐾 宠物小屋
          </h1>
          <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 dark:bg-amber-950/50">
            <Coins className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
              {coins}
            </span>
          </div>
        </motion.div>

        {/* Tab Bar */}
        <div className="flex gap-1 rounded-xl bg-white/60 p-1 mb-6 dark:bg-gray-800/60 backdrop-blur-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-gray-800 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <span className="mr-1">{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Pet Display */}
              <Card className="overflow-hidden border-0 py-0 mb-4">
                <CardContent className="bg-gradient-to-br from-rose-100 to-pink-100 p-6 dark:from-rose-950/40 dark:to-pink-950/40">
                  <div className="text-center">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-7xl mb-3"
                    >
                      {petConfig.emoji}
                    </motion.div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        {petName}
                      </h2>
                      <button
                        onClick={() => {
                          setTempName(petName);
                          setEditNameOpen(true);
                        }}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        ✏️
                      </button>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                    >
                      Lv.{petLevel}
                    </Badge>
                  </div>

                  {/* XP Progress */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>经验值</span>
                      <span>
                        {petProgress.current} / {petProgress.needed}
                      </span>
                    </div>
                    <Progress value={petProgress.progress * 100} className="h-2" />
                  </div>

                  {/* Mood */}
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Heart className="h-4 w-4 text-rose-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      心情: {moodEmoji} {moodText}
                    </span>
                    <span className="text-xs text-muted-foreground">({petMood}/100)</span>
                  </div>
                </CardContent>
              </Card>

              {/* Current Buffs Summary */}
              <Card className="border-0 py-0 mb-4 overflow-hidden">
                <CardContent className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-violet-500" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">当前加成</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <BuffItem emoji="💰" label="金币加成" value={`+${getCoinBonusPercent(petLevel, petType)}%`} active={getCoinBonusPercent(petLevel, petType) > 0} />
                    <BuffItem emoji="📖" label="经验加成" value={`+${getXPBonusPercent(petLevel, petType)}%`} active={getXPBonusPercent(petLevel, petType) > 0} />
                    <BuffItem emoji="⚡" label="暴击率" value={`${Math.round(getCriticalHitChance(petLevel, petType) * 100)}%`} active={getCriticalHitChance(petLevel, petType) > 0} />
                    <BuffItem emoji="🔥" label="连击倍率" value={`×${getComboMultiplier(petLevel, petType).toFixed(1)}`} active={getComboMultiplier(petLevel, petType) > 1} />
                  </div>
                </CardContent>
              </Card>

              {/* Pet Talent Card */}
              {petTalent && (
                <Card className="border-0 py-0 mb-4 overflow-hidden">
                  <CardContent className="bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-rose-950/30 p-4 border border-amber-100/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 shadow-sm">
                        <span className="text-2xl">{petTalent.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{petTalent.name}</span>
                          <span className="text-[10px] rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 font-medium">天赋</span>
                        </div>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
                          {petTalent.description}
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
                  <Card className="border-0 py-0 mb-4 overflow-hidden">
                    <CardContent className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 p-4 border border-amber-100">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                          <Lock className="h-4 w-4 text-amber-500" />
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

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Card className="border-0 py-0 cursor-pointer transition-all hover:scale-[1.02]">
                  <CardContent
                    className="bg-white p-4 dark:bg-gray-800/50"
                    onClick={feedPet}
                  >
                    <div className="flex items-center gap-2">
                      <Apple className="h-5 w-5 text-green-500" />
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

                <Card className="border-0 py-0 cursor-pointer transition-all hover:scale-[1.02]">
                  <CardContent
                    className="bg-white p-4 dark:bg-gray-800/50"
                    onClick={playWithPet}
                  >
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="h-5 w-5 text-violet-500" />
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
                {petConfig.description}
              </p>
            </motion.div>
          )}

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

          {activeTab === 'adopt' && (
            <motion.div
              key="adopt"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
                选择一个新的小伙伴（当前宠物等级将重置为1）
              </p>
              <div className="grid grid-cols-1 gap-3">
                {PET_CONFIGS.map((pet, i) => (
                  <motion.div
                    key={pet.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card
                      className={`cursor-pointer border-0 py-0 transition-all hover:scale-[1.02] hover:shadow-md ${
                        pet.id === petType
                          ? 'ring-2 ring-rose-400 dark:ring-rose-600'
                          : ''
                      }`}
                      onClick={() => handleAdopt(pet.id)}
                    >
                      <CardContent className="bg-white p-4 dark:bg-gray-800/50">
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <p className="text-4xl">{pet.emoji}</p>
                            {pet.id === petType && (
                              <Badge className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] px-1.5 py-0">
                                当前
                              </Badge>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                {pet.name}
                              </p>
                              <span className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 px-2 py-0.5">
                                <span className="text-[10px]">{pet.talent.emoji}</span>
                                <span className="text-[10px] font-bold text-violet-700 dark:text-violet-300">{pet.talent.name}</span>
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {pet.description}
                            </p>
                            <p className="text-[11px] text-violet-600 dark:text-violet-400 mt-0.5 font-medium">
                              {pet.talent.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

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

              {Object.entries(furnitureByCategory).map(([category, items]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    {items[0] && (category === 'bed' ? '🛏️' : category === 'food' ? '🍽️' : category === 'toy' ? '🎾' : '🏮')}{' '}
                    {category === 'bed' ? '小床' : category === 'food' ? '餐具' : category === 'toy' ? '玩具' : '装饰'}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {items.map((item) => {
                      const owned = furniture.includes(item.id);
                      const equipped = Object.values(equippedFurniture).includes(item.id);
                      const canAfford = coins >= item.price;
                      const showFeedback = purchaseFeedback?.id === item.id;
                      return (
                        <Card
                          key={item.id}
                          className={`border-0 py-0 transition-all ${
                            equipped
                              ? 'ring-2 ring-emerald-400'
                              : owned
                                ? 'hover:scale-[1.02] cursor-pointer'
                                : 'hover:scale-[1.02]'
                          }`}
                        >
                          <CardContent className="bg-white p-3 dark:bg-gray-800/50">
                            <p className="text-2xl text-center mb-1">
                              {item.emoji}
                            </p>
                            <p className="text-xs font-medium text-center text-gray-800 dark:text-gray-100 mb-1">
                              {item.name}
                            </p>
                            {showFeedback && purchaseFeedback?.success ? (
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center justify-center gap-1 text-emerald-600"
                              >
                                <Check className="h-3 w-3" />
                                <span className="text-[10px] font-medium">购买成功!</span>
                              </motion.div>
                            ) : showFeedback && !purchaseFeedback?.success ? (
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center text-[10px] text-red-500"
                              >
                                金币不足
                              </motion.div>
                            ) : equipped ? (
                              <div className="flex items-center justify-center gap-1">
                                <Check className="h-3 w-3 text-emerald-500" />
                                <span className="text-[10px] text-emerald-600">
                                  已装备
                                </span>
                              </div>
                            ) : owned ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full h-7 text-[11px] px-1"
                                onClick={() =>
                                  equipFurniture(item.id, item.category)
                                }
                              >
                                装备
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant={canAfford ? 'default' : 'secondary'}
                                className={`w-full h-7 text-[11px] px-1 gap-1 ${
                                  canAfford
                                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                                onClick={() => {
                                  if (canAfford) {
                                    const success = buyFurniture(item.id);
                                    setPurchaseFeedback({ id: item.id, success });
                                    setTimeout(() => setPurchaseFeedback(null), 1500);
                                  } else {
                                    setPurchaseFeedback({ id: item.id, success: false });
                                    setTimeout(() => setPurchaseFeedback(null), 1500);
                                  }
                                }}
                                disabled={!canAfford}
                              >
                                <ShoppingCart className="h-3 w-3" />
                                <Coins className="h-3 w-3" />
                                {item.price}
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'room' && (
            <motion.div
              key="room"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
                🏠 {petName}的小房间
              </h2>

              {/* Room Display */}
              <Card className="overflow-hidden border-0 py-0 mb-4">
                <CardContent className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-6 min-h-[200px]">
                  <div className="flex flex-wrap gap-3 justify-center">
                    {equippedItems.length > 0 ? (
                      equippedItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="relative group"
                        >
                          <span className="text-4xl block">{item.emoji}</span>
                          <button
                            onClick={() =>
                              unequipFurniture(item.category)
                            }
                            className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-700 rounded-full p-0.5 shadow-sm"
                          >
                            <Undo2 className="h-3 w-3 text-gray-500" />
                          </button>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center text-gray-400 dark:text-gray-500 py-8">
                        <PawPrint className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">还没有装备家具</p>
                        <p className="text-xs">去商店买一些吧！</p>
                      </div>
                    )}
                  </div>

                  {/* Pet in room */}
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-center mt-4"
                  >
                    <span className="text-5xl">{petConfig.emoji}</span>
                  </motion.div>
                </CardContent>
              </Card>

              {/* My Furniture Inventory */}
              {furniture.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    我的家具 ({furniture.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {furniture.map((itemId) => {
                      const item = FURNITURE_SHOP.find((f) => f.id === itemId);
                      if (!item) return null;
                      const isEquipped = equippedFurniture[item.category] === itemId;
                      return (
                        <motion.div
                          key={itemId}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm ${
                            isEquipped
                              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
                              : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50'
                          }`}
                        >
                          <span>{item.emoji}</span>
                          <span className="text-xs">{item.name}</span>
                          {isEquipped ? (
                            <button
                              onClick={() => unequipFurniture(item.category)}
                              className="ml-1 text-[10px] text-emerald-600"
                            >
                              卸下
                            </button>
                          ) : (
                            <button
                              onClick={() => equipFurniture(item.id, item.category)}
                              className="ml-1 text-[10px] text-amber-600"
                            >
                              装备
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
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
