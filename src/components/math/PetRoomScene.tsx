'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  usePetStore,
  FURNITURE_SHOP,
  PET_CONFIGS,
  ROOM_LEVELS,
  getRoomLevel,
  FurnitureCategory,
  FurnitureItem,
} from '@/lib/pet-store';
import { Progress } from '@/components/ui/progress';

// ─── Pet-Specific Room Themes ─────────────────────────────────────────────

interface PetRoomTheme {
  wallGradient: string;
  floorGradient: string;
  accentEmoji: string;
  windowCurtainGradient: string;
}

const PET_ROOM_THEMES: Record<string, PetRoomTheme> = {
  ragdoll: {
    wallGradient: 'from-rose-100 via-pink-50 to-amber-50',
    floorGradient: 'from-amber-200 to-amber-300',
    accentEmoji: '🌸',
    windowCurtainGradient: 'from-rose-300/80 to-rose-200/40',
  },
  shiba: {
    wallGradient: 'from-orange-100 via-amber-50 to-yellow-50',
    floorGradient: 'from-amber-300 to-yellow-200',
    accentEmoji: '🍂',
    windowCurtainGradient: 'from-orange-300/80 to-amber-200/40',
  },
  golden: {
    wallGradient: 'from-amber-100 via-yellow-50 to-lime-50',
    floorGradient: 'from-yellow-200 to-lime-200',
    accentEmoji: '🌻',
    windowCurtainGradient: 'from-amber-300/80 to-yellow-200/40',
  },
  rabbit: {
    wallGradient: 'from-pink-100 via-rose-50 to-fuchsia-50',
    floorGradient: 'from-rose-200 to-pink-200',
    accentEmoji: '🥕',
    windowCurtainGradient: 'from-pink-300/80 to-rose-200/40',
  },
  hamster: {
    wallGradient: 'from-yellow-100 via-amber-50 to-orange-50',
    floorGradient: 'from-amber-200 to-orange-200',
    accentEmoji: '🌰',
    windowCurtainGradient: 'from-yellow-300/80 to-amber-200/40',
  },
  parrot: {
    wallGradient: 'from-emerald-100 via-teal-50 to-cyan-50',
    floorGradient: 'from-teal-200 to-emerald-200',
    accentEmoji: '🦜',
    windowCurtainGradient: 'from-emerald-300/80 to-teal-200/40',
  },
  panda: {
    wallGradient: 'from-gray-100 via-emerald-50 to-lime-50',
    floorGradient: 'from-lime-200 to-green-200',
    accentEmoji: '🎋',
    windowCurtainGradient: 'from-gray-300/80 to-emerald-200/40',
  },
};

const DEFAULT_THEME: PetRoomTheme = {
  wallGradient: 'from-amber-50 to-orange-50',
  floorGradient: 'from-amber-200 to-amber-300',
  accentEmoji: '🏠',
  windowCurtainGradient: 'from-rose-300/80 to-rose-200/40',
};

// ─── Room Furniture Zone Mapping ──────────────────────────────────────────

interface ZoneConfig {
  category: FurnitureCategory;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  emojiSize: string;
  decoEmoji?: string;
  hint?: string;
}

const ROOM_ZONES: ZoneConfig[] = [
  { category: 'bed', label: '床铺', x: 4, y: 46, width: 30, height: 40, emojiSize: 'text-5xl', decoEmoji: '🧸', hint: '点击卸下家具' },
  { category: 'food', label: '餐具', x: 35, y: 56, width: 28, height: 30, emojiSize: 'text-3xl', hint: '点击卸下家具' },
  { category: 'toy', label: '玩具', x: 67, y: 54, width: 29, height: 32, emojiSize: 'text-3xl', decoEmoji: '⚡', hint: '点击卸下家具' },
  { category: 'decor', label: '装饰', x: 3, y: 8, width: 16, height: 24, emojiSize: 'text-2xl', hint: '点击卸下家具' },
];

// ─── Room Environment Computation ─────────────────────────────────────────

interface RoomEnvironment {
  wallColor: string;
  wallGradient: string;
  floorColor: string;
  floorGradient: string;
  lightColor: string;
  lightOverlay: string;
  lightIntensity: number;
  hasWallpaper: boolean;
  hasFlooring: boolean;
  hasLighting: boolean;
  wallpaperPattern: string | null;
  rugEmoji: string | null;
  curtainGradient: string;
  accentEmoji: string;
}

function getRoomEnvironment(equippedFurniture: Record<string, string | undefined>, petType: string | null): RoomEnvironment {
  const theme = (petType && PET_ROOM_THEMES[petType]) || DEFAULT_THEME;

  const env: RoomEnvironment = {
    wallColor: '#FFF7ED',
    wallGradient: theme.wallGradient,
    floorColor: '#D4A373',
    floorGradient: theme.floorGradient,
    lightColor: 'transparent',
    lightOverlay: '',
    lightIntensity: 0,
    hasWallpaper: false,
    hasFlooring: false,
    hasLighting: false,
    wallpaperPattern: null,
    rugEmoji: null,
    curtainGradient: theme.windowCurtainGradient,
    accentEmoji: theme.accentEmoji,
  };

  // Wallpaper overrides default wall gradient
  const wallpaperId = equippedFurniture.wallpaper;
  if (wallpaperId) {
    const item = FURNITURE_SHOP.find((f) => f.id === wallpaperId);
    if (item?.roomStyle?.wallColor) {
      env.wallColor = item.roomStyle.wallColor;
      env.hasWallpaper = true;
      if (wallpaperId === 'wallpaper-stars') {
        env.wallpaperPattern = 'stars';
        env.wallGradient = 'from-indigo-950 to-indigo-900';
      } else if (wallpaperId === 'wallpaper-forest') {
        env.wallpaperPattern = 'forest';
        env.wallGradient = 'from-emerald-950 to-emerald-900';
      } else {
        env.wallGradient = 'from-amber-100 to-yellow-50';
      }
    }
  }

  // Flooring overrides default floor gradient
  const flooringId = equippedFurniture.flooring;
  if (flooringId) {
    const item = FURNITURE_SHOP.find((f) => f.id === flooringId);
    if (item?.roomStyle?.floorColor) {
      env.floorColor = item.roomStyle.floorColor;
      env.hasFlooring = true;
      if (flooringId === 'flooring-wood') env.floorGradient = 'from-amber-700 to-amber-600';
      else if (flooringId === 'flooring-tile') env.floorGradient = 'from-violet-300 to-purple-300';
      else if (flooringId === 'flooring-cloud') env.floorGradient = 'from-blue-100 to-sky-100';
    }
  }

  // Lighting
  const lightingId = equippedFurniture.lighting;
  if (lightingId) {
    const item = FURNITURE_SHOP.find((f) => f.id === lightingId);
    if (item?.roomStyle) {
      env.lightColor = item.roomStyle.lightColor || 'transparent';
      env.lightIntensity = item.roomStyle.lightIntensity || 0;
      env.hasLighting = true;
      if (env.lightIntensity > 0) {
        env.lightOverlay = `rgba(${hexToRgb(env.lightColor)}, ${env.lightIntensity * 0.15})`;
      }
    }
  }

  // Rug based on decor
  const decorId = equippedFurniture.decor;
  if (decorId) {
    const item = FURNITURE_SHOP.find((f) => f.id === decorId);
    if (item?.tier === 1) env.rugEmoji = '🏮';
    else if (item?.tier === 2) env.rugEmoji = '🪴';
    else if (item?.tier === 3) env.rugEmoji = '🌈';
  }

  return env;
}

function hexToRgb(hex: string): string {
  if (!hex || !hex.startsWith('#')) return '255,255,200';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ─── Star Pattern Component ───────────────────────────────────────────────

function StarPattern() {
  const stars = useMemo(() =>
    Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${(i * 37 + 13) % 95 + 2}%`,
      top: `${(i * 23 + 7) % 75 + 5}%`,
      size: `${(i % 5) * 2 + 6}px`,
      delay: `${(i * 0.3) % 4}s`,
      duration: `${2 + (i % 3)}s`,
    })),
  []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.span
          key={star.id}
          className="absolute text-yellow-300"
          style={{ left: star.left, top: star.top, fontSize: star.size }}
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: parseFloat(star.duration), repeat: Infinity, delay: parseFloat(star.delay) }}
        >
          ✦
        </motion.span>
      ))}
    </div>
  );
}

function ForestPattern() {
  const trees = useMemo(() =>
    Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      left: `${i * 10 + 1}%`,
      size: `${20 + (i % 3) * 8}px`,
    })),
  []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-25 pointer-events-none">
      {trees.map((tree) => (
        <span key={tree.id} className="absolute bottom-0" style={{ left: tree.left, fontSize: tree.size }}>
          🌲
        </span>
      ))}
      <span className="absolute text-sm" style={{ left: '20%', bottom: '15%', fontSize: '10px' }}>🦊</span>
      <span className="absolute text-sm" style={{ left: '65%', bottom: '20%', fontSize: '10px' }}>🦋</span>
    </div>
  );
}

// ─── Furniture Zone Component ─────────────────────────────────────────────

function FurnitureZone({
  zone,
  item,
  onUnequip,
}: {
  zone: ZoneConfig;
  item: FurnitureItem | null;
  onUnequip: (category: FurnitureCategory) => void;
}) {
  const [showUnequip, setShowUnequip] = useState(false);

  if (!item) {
    return (
      <div
        className="absolute flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 hover:border-white/30 transition-all cursor-default group"
        style={{
          left: `${zone.x}%`,
          top: `${zone.y}%`,
          width: `${zone.width}%`,
          height: `${zone.height}%`,
        }}
      >
        <div className="opacity-0 group-hover:opacity-30 transition-opacity">
          <span className="text-white/30 text-2xl">📦</span>
        </div>
        <span className="text-white/20 text-[9px] mt-1 group-hover:text-white/40 transition-colors">
          空{zone.label}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      className="absolute flex flex-col items-center justify-center cursor-pointer"
      style={{
        left: `${zone.x}%`,
        top: `${zone.y}%`,
        width: `${zone.width}%`,
        height: `${zone.height}%`,
      }}
      initial={{ scale: 0, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
      onClick={() => setShowUnequip(!showUnequip)}
    >
      <motion.div
        className={`relative rounded-2xl p-2 ${
          item.tier >= 3
            ? 'bg-gradient-to-br from-amber-100/40 to-yellow-100/30 shadow-lg shadow-amber-200/20'
            : item.tier >= 2
              ? 'bg-white/20 backdrop-blur-sm shadow-md'
              : 'bg-white/10'
        }`}
        animate={item.tier >= 3 ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <span className={zone.emojiSize}>{item.emoji}</span>
        {zone.decoEmoji && item.tier >= 2 && (
          <motion.span
            className="absolute -bottom-1 -left-1 text-sm"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {zone.decoEmoji}
          </motion.span>
        )}
        {item.tier >= 3 && (
          <>
            <motion.span
              className="absolute -top-2 -right-2 text-xs"
              animate={{ rotate: [0, 360], scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨
            </motion.span>
            <motion.span
              className="absolute -bottom-1 -left-1 text-[8px]"
              animate={{ rotate: [0, -360], scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            >
              💫
            </motion.span>
          </>
        )}
      </motion.div>

      <span className="text-[10px] text-white/60 mt-1 truncate max-w-full font-medium">{item.name}</span>

      <div className="flex gap-0.5 mt-0.5">
        {[1, 2, 3].map((t) => (
          <span key={t} className={`w-1 h-1 rounded-full ${t <= item.tier ? 'bg-amber-400/60' : 'bg-white/15'}`} />
        ))}
      </div>

      <AnimatePresence>
        {showUnequip && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 5 }}
            className="absolute -top-3 -right-3 bg-rose-400 hover:bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg z-10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onUnequip(zone.category);
              setShowUnequip(false);
            }}
          >
            <span className="text-xs font-bold">✕</span>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Pet in Room ──────────────────────────────────────────────────────────

function RoomPet({
  emoji,
  mood,
  petName,
  bedEquipped,
  toyEquipped,
  foodEquipped,
}: {
  emoji: string;
  mood: number;
  petName: string;
  bedEquipped: boolean;
  toyEquipped: boolean;
  foodEquipped: boolean;
}) {
  const petX = 50;
  const petY = 62;

  const thoughtEmoji = useMemo(() => {
    if (foodEquipped && mood < 50) return '🍖';
    if (toyEquipped && mood >= 80) return '🎾';
    if (bedEquipped && mood >= 70) return '💤';
    if (mood >= 80) return '💕';
    if (mood >= 50) return '🎵';
    if (mood >= 30) return '🤔';
    return '😢';
  }, [mood, bedEquipped, toyEquipped, foodEquipped]);

  const animation = useMemo(() => {
    if (mood >= 80) return { y: [0, -6, 0], rotate: [0, 2, -2, 0] };
    if (mood >= 50) return { y: [0, -4, 0] };
    return { y: [0, -2, 0] };
  }, [mood]);

  return (
    <motion.div
      className="absolute flex flex-col items-center z-20"
      style={{ left: `${petX}%`, top: `${petY}%`, transform: 'translate(-50%, -50%)' }}
      animate={animation}
      transition={{ duration: mood >= 80 ? 1.8 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.div
        className="bg-white/95 dark:bg-gray-800/95 rounded-full px-2.5 py-1 mb-1.5 shadow-sm relative"
        initial={{ opacity: 0, y: 5, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-sm">{thoughtEmoji}</span>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/95 dark:bg-gray-800/95 rotate-45" />
      </motion.div>
      <div className="relative">
        <span className="text-5xl drop-shadow-lg select-none">{emoji}</span>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-gray-700/80 rounded-full px-2 py-0.5 whitespace-nowrap">
          <span className="text-[8px] text-gray-600 dark:text-gray-300 font-medium">{petName}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Window Component ─────────────────────────────────────────────────────

function RoomWindow({ hasLighting, lightColor, curtainGradient }: { hasLighting: boolean; lightColor: string; curtainGradient: string }) {
  return (
    <div className="absolute" style={{ left: '38%', top: '5%', width: '24%', height: '30%' }}>
      <div className="absolute inset-1 bg-black/5 rounded" />
      <div className="relative w-full h-full bg-gradient-to-b from-sky-300 via-sky-200 to-blue-100 dark:from-sky-900 dark:via-sky-800 dark:to-sky-700 rounded-md border-[3px] border-amber-300/80 dark:border-amber-600/80 overflow-hidden shadow-inner">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-[3px] bg-amber-300/80 dark:bg-amber-600/80" />
        </div>
        <div className="absolute inset-0 flex justify-center">
          <div className="h-full w-[3px] bg-amber-300/80 dark:bg-amber-600/80" />
        </div>

        <div className="absolute inset-[2px] bg-gradient-to-b from-sky-300 to-sky-100 dark:from-sky-800 dark:to-sky-600 rounded-sm overflow-hidden">
          <div className="absolute top-1 right-2">
            <span className="text-sm">☀️</span>
          </div>
          <motion.span
            className="absolute text-sm top-1"
            animate={{ x: ['-20px', '120px'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            ☁️
          </motion.span>
          <motion.span
            className="absolute text-[10px] top-4"
            animate={{ x: ['60px', '200px'] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear', delay: 5 }}
          >
            ☁️
          </motion.span>
          <motion.span
            className="absolute text-[8px] top-2"
            animate={{ x: ['-10px', '100px'], y: [0, -3, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          >
            🐦
          </motion.span>
        </div>

        {/* Curtains — pet-themed */}
        <div className="absolute top-0 left-0 w-[18%] h-full">
          <div className={`w-full h-full bg-gradient-to-r ${curtainGradient} dark:from-rose-900/60 dark:to-rose-800/30 rounded-r-lg`} />
        </div>
        <div className="absolute top-0 right-0 w-[18%] h-full">
          <div className={`w-full h-full bg-gradient-to-l ${curtainGradient} dark:from-rose-900/60 dark:to-rose-800/30 rounded-l-lg`} />
        </div>
        <div className="absolute top-0 left-[-4px] right-[-4px] h-[4px] bg-amber-400/60 dark:bg-amber-600/60 rounded-full" />

        {hasLighting && (
          <motion.div
            className="absolute inset-0 rounded-sm"
            style={{ backgroundColor: `${lightColor}33` }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}
      </div>
      <div className="absolute -bottom-1 left-[-4px] right-[-4px] h-[6px] bg-amber-400/50 dark:bg-amber-600/50 rounded-b-sm" />
    </div>
  );
}

// ─── Ceiling Light Component ──────────────────────────────────────────────

function CeilingLight({
  hasLighting,
  lightColor,
  lightIntensity,
  lightingEmoji,
}: {
  hasLighting: boolean;
  lightColor: string;
  lightIntensity: number;
  lightingEmoji?: string;
}) {
  return (
    <div className="absolute left-1/2 top-0 -translate-x-1/2 flex flex-col items-center z-10">
      <div className="w-[1px] h-4 bg-gray-400/60" />
      {hasLighting ? (
        <motion.div
          className="relative"
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <span className="text-2xl">{lightingEmoji || '💡'}</span>
          <div
            className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              width: '120px',
              height: '80px',
              background: `radial-gradient(ellipse at top, ${lightColor}44, transparent 70%)`,
            }}
          />
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none rounded-full"
            style={{
              width: '40px',
              height: '40px',
              background: `radial-gradient(circle, ${lightColor}33, transparent 60%)`,
            }}
          />
        </motion.div>
      ) : (
        <div className="opacity-25">
          <span className="text-lg">💡</span>
        </div>
      )}
    </div>
  );
}

// ─── Door Component ───────────────────────────────────────────────────────

function RoomDoor() {
  return (
    <div className="absolute" style={{ right: '2%', top: '12%', width: '12%', height: '50%' }}>
      <div className="relative w-full h-full bg-amber-100/30 dark:bg-amber-900/20 rounded-t-lg border-2 border-amber-300/40 dark:border-amber-600/30 overflow-hidden">
        <div className="absolute top-[8%] left-[10%] right-[10%] h-[35%] border border-amber-300/30 dark:border-amber-600/20 rounded-sm" />
        <div className="absolute top-[50%] left-[10%] right-[10%] h-[35%] border border-amber-300/30 dark:border-amber-600/20 rounded-sm" />
        <div className="absolute right-[15%] top-[48%] w-2 h-2 bg-amber-400/50 dark:bg-amber-500/40 rounded-full" />
        <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-amber-300/20 dark:bg-amber-600/20" />
      </div>
      <div className="absolute -top-1 left-[-3px] right-[-3px] h-[4px] bg-amber-300/40 dark:bg-amber-600/30 rounded-t" />
    </div>
  );
}

// ─── Wall Picture Frame Component ─────────────────────────────────────────

function PictureFrame({ position, emoji }: { position: { left: string; top: string }; emoji: string }) {
  return (
    <div
      className="absolute w-[10%] h-[12%] bg-white/20 dark:bg-white/10 rounded border border-amber-200/40 dark:border-amber-600/30 flex items-center justify-center"
      style={{ left: position.left, top: position.top }}
    >
      <span className="text-sm">{emoji}</span>
    </div>
  );
}

// ─── Rug Component ────────────────────────────────────────────────────────

function RugOnFloor({ rugEmoji }: { rugEmoji: string | null }) {
  if (!rugEmoji) return null;
  return (
    <motion.div
      className="absolute z-[5] flex items-center justify-center"
      style={{ left: '30%', bottom: '8%', width: '40%', height: '15%' }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
    >
      <div className="w-full h-[60%] bg-gradient-to-r from-rose-200/30 via-amber-200/30 to-rose-200/30 rounded-full flex items-center justify-center border border-rose-200/20">
        <span className="text-2xl opacity-40">{rugEmoji}</span>
      </div>
    </motion.div>
  );
}

// ─── Category Info Card Component ─────────────────────────────────────────

const CATEGORY_META: Record<string, { emoji: string; label: string; activeBg: string; activeBorder: string; activeText: string }> = {
  bed: { emoji: '🛏️', label: '小床', activeBg: 'bg-rose-50 dark:bg-rose-950/30', activeBorder: 'border-rose-200 dark:border-rose-800', activeText: 'text-rose-600 dark:text-rose-400' },
  food: { emoji: '🍽️', label: '餐具', activeBg: 'bg-orange-50 dark:bg-orange-950/30', activeBorder: 'border-orange-200 dark:border-orange-800', activeText: 'text-orange-600 dark:text-orange-400' },
  toy: { emoji: '🎾', label: '玩具', activeBg: 'bg-cyan-50 dark:bg-cyan-950/30', activeBorder: 'border-cyan-200 dark:border-cyan-800', activeText: 'text-cyan-600 dark:text-cyan-400' },
  decor: { emoji: '🏮', label: '装饰', activeBg: 'bg-pink-50 dark:bg-pink-950/30', activeBorder: 'border-pink-200 dark:border-pink-800', activeText: 'text-pink-600 dark:text-pink-400' },
  wallpaper: { emoji: '🎨', label: '壁纸', activeBg: 'bg-amber-50 dark:bg-amber-950/30', activeBorder: 'border-amber-200 dark:border-amber-800', activeText: 'text-amber-600 dark:text-amber-400' },
  flooring: { emoji: '🪵', label: '地板', activeBg: 'bg-emerald-50 dark:bg-emerald-950/30', activeBorder: 'border-emerald-200 dark:border-emerald-800', activeText: 'text-emerald-600 dark:text-emerald-400' },
  lighting: { emoji: '💡', label: '灯光', activeBg: 'bg-violet-50 dark:bg-violet-950/30', activeBorder: 'border-violet-200 dark:border-violet-800', activeText: 'text-violet-600 dark:text-violet-400' },
};

function CategoryCard({
  category,
  equippedItem,
  ownedItems,
  onEquip,
  onUnequip,
  onCategoryClick,
}: {
  category: FurnitureCategory;
  equippedItem: FurnitureItem | null;
  ownedItems: FurnitureItem[];
  onEquip: (itemId: string, category: FurnitureCategory) => void;
  onUnequip: (category: FurnitureCategory) => void;
  onCategoryClick?: (category: FurnitureCategory) => void;
}) {
  const meta = CATEGORY_META[category];
  if (!meta) return null;
  const isEquipped = !!equippedItem;

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className={`rounded-xl p-2 text-center transition-all duration-300 cursor-pointer active:shadow-md ${
        isEquipped
          ? `${meta.activeBg} border ${meta.activeBorder} shadow-sm hover:shadow-md`
          : 'bg-gray-50 dark:bg-gray-800/30 border border-dashed border-gray-200 dark:border-gray-700 hover:border-gray-300'
      }`}
      onClick={() => {
        if (!isEquipped && ownedItems.length === 0) {
          onCategoryClick?.(category);
        }
      }}
    >
      <div className="flex items-center justify-center gap-1">
        <span className="text-base">{isEquipped ? equippedItem.emoji : meta.emoji}</span>
        {isEquipped && (
          <motion.button
            whileTap={{ scale: 0.85 }}
            className="w-4 h-4 flex items-center justify-center rounded-full bg-rose-400 text-white text-[8px] hover:bg-rose-500 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onUnequip(category);
            }}
            title="卸下"
          >
            ✕
          </motion.button>
        )}
      </div>
      <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium truncate">
        {isEquipped ? equippedItem.name : meta.label}
      </p>
      {isEquipped ? (
        <p className={`text-[8px] ${meta.activeText} mt-0.5`}>{equippedItem.effect}</p>
      ) : ownedItems.length > 0 ? (
        <div className="mt-0.5 space-y-0.5">
          {ownedItems.slice(0, 2).map((item) => (
            <button
              key={item.id}
              className={`text-[8px] ${meta.activeText} hover:underline block w-full truncate`}
              onClick={(e) => {
                e.stopPropagation();
                onEquip(item.id, category);
              }}
            >
              {item.emoji} {item.name}
            </button>
          ))}
          {ownedItems.length > 2 && (
            <p className="text-[7px] text-gray-400">+{ownedItems.length - 2}更多</p>
          )}
        </div>
      ) : (
        <p className="text-[8px] text-amber-400 dark:text-amber-500 mt-0.5">去购买</p>
      )}
    </motion.div>
  );
}

// ─── Main PetRoomScene Component ──────────────────────────────────────────

interface PetRoomSceneProps {
  onCategoryClick?: (category: FurnitureCategory) => void;
}

export default function PetRoomScene({ onCategoryClick }: PetRoomSceneProps = {}) {
  const petType = usePetStore((s) => s.petType);
  const petName = usePetStore((s) => s.petName);
  const petMood = usePetStore((s) => s.petMood);
  const furniture = usePetStore((s) => s.furniture);
  const equippedFurniture = usePetStore((s) => s.equippedFurniture);
  const equipFurniture = usePetStore((s) => s.equipFurniture);
  const unequipFurniture = usePetStore((s) => s.unequipFurniture);

  // Compute room environment (pet-specific themes)
  const env = useMemo(() => getRoomEnvironment(equippedFurniture, petType), [equippedFurniture, petType]);

  // Compute room coziness and level
  const coziness = useMemo(() => {
    const categories: FurnitureCategory[] = ['bed', 'food', 'toy', 'decor', 'wallpaper', 'flooring', 'lighting'];
    let score = 0;
    for (const cat of categories) {
      const itemId = equippedFurniture[cat];
      if (!itemId) continue;
      const item = FURNITURE_SHOP.find((f) => f.id === itemId);
      if (!item) continue;
      if (item.tier === 1) score += 8;
      else if (item.tier === 2) score += 14;
      else if (item.tier === 3) score += 22;
    }
    if (categories.every((cat) => equippedFurniture[cat])) score += 10;
    return Math.min(100, score);
  }, [equippedFurniture]);

  const roomLevel = useMemo(() => getRoomLevel(coziness), [coziness]);

  // Get equipped items for each zone
  const equippedItems = useMemo(() => {
    const result: Record<string, FurnitureItem | null> = {};
    const categories: FurnitureCategory[] = ['bed', 'food', 'toy', 'decor', 'wallpaper', 'flooring', 'lighting'];
    for (const cat of categories) {
      const itemId = equippedFurniture[cat];
      result[cat] = itemId ? FURNITURE_SHOP.find((f) => f.id === itemId) ?? null : null;
    }
    return result;
  }, [equippedFurniture]);

  // Get owned items per category (not currently equipped)
  const ownedItemsByCategory = useMemo(() => {
    const result: Record<string, FurnitureItem[]> = {};
    const categories: FurnitureCategory[] = ['bed', 'food', 'toy', 'decor', 'wallpaper', 'flooring', 'lighting'];
    for (const cat of categories) {
      result[cat] = furniture
        .map((id) => FURNITURE_SHOP.find((f) => f.id === id))
        .filter((item): item is FurnitureItem => !!item && item.category === cat && equippedFurniture[cat] !== item.id);
    }
    return result;
  }, [furniture, equippedFurniture]);

  // Pet emoji
  const petEmoji = useMemo(() => {
    if (!petType) return '🐾';
    const config = PET_CONFIGS.find((p) => p.id === petType);
    return config?.emoji ?? '🐾';
  }, [petType]);

  // Only show zones for bed/food/toy/decor in the room
  const zoneCategories: FurnitureCategory[] = ['bed', 'food', 'toy', 'decor'];

  // Room mood text
  const roomMoodText = useMemo(() => {
    if (coziness >= 85) return '梦幻乐园！✨';
    if (coziness >= 65) return '好漂亮！🌸';
    if (coziness >= 45) return '很舒适~ 🏡';
    if (coziness >= 25) return '越来越温馨 💕';
    if (coziness >= 10) return '有家的感觉 🌱';
    return '还需要装扮 🏚️';
  }, [coziness]);

  // Coziness bar color
  const cozinessColor = useMemo(() => {
    if (coziness >= 85) return 'from-amber-400 to-yellow-400';
    if (coziness >= 65) return 'from-rose-400 to-pink-400';
    if (coziness >= 45) return 'from-emerald-400 to-green-400';
    if (coziness >= 25) return 'from-cyan-400 to-teal-400';
    return 'from-gray-300 to-gray-400';
  }, [coziness]);

  // Count equipped categories
  const equippedCount = useMemo(() => {
    const cats: FurnitureCategory[] = ['bed', 'food', 'toy', 'decor', 'wallpaper', 'flooring', 'lighting'];
    return cats.filter((cat) => equippedFurniture[cat]).length;
  }, [equippedFurniture]);

  // Picture frame emojis based on room level
  const frameEmojis = useMemo(() => {
    if (coziness >= 65) return ['🌟', '🎨'];
    if (coziness >= 25) return ['📸', '🖼️'];
    return ['📋', '📝'];
  }, [coziness]);

  return (
    <div className="space-y-3">
      {/* ── Room Level & Coziness Bar ── */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-white/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <motion.span
              className="text-2xl"
              animate={coziness >= 65 ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {roomLevel.emoji}
            </motion.span>
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                {roomLevel.name}
              </h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                {coziness}/100 温馨度
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500 dark:text-gray-400">{roomMoodText}</span>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">
              已装备 {equippedCount}/7 类
            </p>
          </div>
        </div>
        <div className="relative">
          <Progress value={coziness} className="h-2.5" />
          <div
            className={`absolute top-0 left-0 h-2.5 rounded-full bg-gradient-to-r ${cozinessColor} transition-all duration-500 pointer-events-none`}
            style={{ width: `${coziness}%` }}
          />
        </div>
        {roomLevel.nextAt < 100 && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 text-center">
            距离「{ROOM_LEVELS.find((l) => l.minCoziness === roomLevel.nextAt)?.name ?? '下一级'}」还需 {roomLevel.nextAt - coziness} 温馨度
          </p>
        )}
      </div>

      {/* ── Room Scene ── */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-xl border border-white/30 dark:border-gray-700/30"
        style={{ aspectRatio: '4/3' }}
      >
        <div className={`absolute inset-0 bg-gradient-to-b ${env.wallGradient} transition-all duration-700`}>
          {/* ── Wallpaper Pattern ── */}
          {env.wallpaperPattern === 'stars' && <StarPattern />}
          {env.wallpaperPattern === 'forest' && <ForestPattern />}

          {/* ── Wall Texture ── */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,0,0,0.08) 20px, rgba(0,0,0,0.08) 21px)`,
            }}
          />

          {/* ── Ceiling ── */}
          <div className="absolute top-0 left-0 right-0 h-[5%] bg-gradient-to-b from-white/30 to-transparent" />

          {/* ── Ceiling Light ── */}
          <CeilingLight
            hasLighting={env.hasLighting}
            lightColor={env.lightColor}
            lightIntensity={env.lightIntensity}
            lightingEmoji={equippedItems.lighting?.emoji}
          />

          {/* ── Window ── */}
          <RoomWindow hasLighting={env.hasLighting} lightColor={env.lightColor} curtainGradient={env.curtainGradient} />

          {/* ── Door ── */}
          <RoomDoor />

          {/* ── Picture Frames ── */}
          <PictureFrame position={{ left: '68%', top: '8%' }} emoji={frameEmojis[0]} />
          <PictureFrame position={{ left: '4%', top: '35%' }} emoji={frameEmojis[1]} />

          {/* ── Wall Wainscoting Line ── */}
          <div className="absolute" style={{ top: '42%', left: 0, right: 0 }}>
            <div className="w-full h-[2px] bg-white/15" />
            <div className="w-full h-[1px] bg-white/5 mt-[2px]" />
          </div>

          {/* ── Baseboard ── */}
          <div className="absolute" style={{ bottom: '32%', left: 0, right: 0, height: '3.5%' }}>
            <div className="w-full h-full bg-gradient-to-b from-amber-300/40 to-amber-200/25 dark:from-amber-800/40 dark:to-amber-700/25 rounded-t-sm" />
          </div>

          {/* ── Floor ── */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-b ${env.floorGradient} transition-all duration-700`}
            style={{ height: '32%' }}
          >
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: env.hasFlooring
                  ? `repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(255,255,255,0.25) 28px, rgba(255,255,255,0.25) 29px)`
                  : `repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(0,0,0,0.04) 35px, rgba(0,0,0,0.04) 36px), repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(0,0,0,0.04) 35px, rgba(0,0,0,0.04) 36px)`,
              }}
            />
            <div className="absolute top-0 left-0 right-0 h-5 bg-gradient-to-b from-black/12 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-white/5 to-transparent" />
            <RugOnFloor rugEmoji={env.rugEmoji} />
          </div>

          {/* ── Furniture Zones ── */}
          {ROOM_ZONES.filter((z) => zoneCategories.includes(z.category)).map((zone, idx) => (
            <FurnitureZone
              key={`${zone.category}-${idx}`}
              zone={zone}
              item={equippedItems[zone.category]}
              onUnequip={unequipFurniture}
            />
          ))}

          {/* ── Pet ── */}
          {petType && (
            <RoomPet
              emoji={petEmoji}
              mood={petMood}
              petName={petName || '小伙伴'}
              bedEquipped={!!equippedFurniture.bed}
              toyEquipped={!!equippedFurniture.toy}
              foodEquipped={!!equippedFurniture.food}
            />
          )}

          {/* ── Lighting Overlay ── */}
          {env.hasLighting && env.lightIntensity > 0 && (
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{ backgroundColor: env.lightOverlay }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {/* ── Coziness Sparkle Overlay ── */}
          {coziness >= 65 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: Math.min(Math.floor(coziness / 12), 8) }).map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute text-yellow-300/50"
                  style={{
                    left: `${8 + ((i * 13 + 5) % 85)}%`,
                    top: `${8 + ((i * 17 + 3) % 60)}%`,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.3, 0.5],
                    rotate: [0, 180],
                  }}
                  transition={{
                    duration: 2.5 + (i % 3),
                    repeat: Infinity,
                    delay: i * 0.7,
                  }}
                >
                  ✦
                </motion.span>
              ))}
            </div>
          )}

          {/* ── Empty room guide text ── */}
          {coziness === 0 && petType && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-4xl mb-2">🏠</span>
              <p className="text-white/50 text-sm font-medium">房间空空如也...</p>
              <p className="text-white/30 text-xs mt-1">去商店买些家具装扮吧！</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── All 7 Category Cards with Quick Actions ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-gray-600 dark:text-gray-300">家具管理</h4>
          <span className="text-[10px] text-gray-400">{equippedCount}/7 已装备</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {(['bed', 'food', 'toy', 'decor', 'wallpaper', 'flooring', 'lighting'] as FurnitureCategory[]).map((cat) => (
            <CategoryCard
              key={cat}
              category={cat}
              equippedItem={equippedItems[cat]}
              ownedItems={ownedItemsByCategory[cat] || []}
              onEquip={equipFurniture}
              onUnequip={unequipFurniture}
              onCategoryClick={onCategoryClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
