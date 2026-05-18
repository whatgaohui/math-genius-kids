'use client';

import { Home, BarChart3, Heart, Award, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/game-store';
import { playClickSound } from '@/lib/sound';
import { cn } from '@/lib/utils';

interface NavItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: '首页', icon: Home, color: '#667eea' },
  { key: 'stats', label: '统计', icon: BarChart3, color: '#00B894' },
  { key: 'achievements', label: '成就', icon: Award, color: '#6C5CE7' },
  { key: 'pet', label: '宠物', icon: Heart, color: '#FD79A8' },
  { key: 'settings', label: '设置', icon: Settings, color: '#764ba2' },
];

const VIEW_TO_NAV: Record<string, string> = {
  home: 'home',
  stats: 'stats',
  achievements: 'achievements',
  pet: 'pet',
  settings: 'settings',
  'math-home': 'home',
  'math-free-setup': 'home',
  'math-speed-setup': 'home',
  'math-adventure': 'home',
  adventure: 'home',
  playing: 'home',
  speed: 'home',
  result: 'home',
  chinese: 'home',
  'chinese-home': 'home',
  'chinese-play': 'home',
  english: 'home',
  'english-home': 'home',
  'english-play': 'home',
  help: 'home',
  'curriculum-test': 'home',
  'question-bank-manager': 'home',
  'error-book': 'home',
  'daily-challenge': 'home',
  'learning-goals': 'home',
  'parent-dashboard': 'home',
  'onboarding': 'home',
};

export default function BottomNav() {
  const currentView = useGameStore((s) => s.currentView);
  const setCurrentView = useGameStore((s) => s.setCurrentView);
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const activeNav = VIEW_TO_NAV[currentView] ?? 'home';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100/80"
      aria-label="底部导航"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex h-14 max-w-lg items-stretch">
        {NAV_ITEMS.map(({ key, label, icon: Icon, color }) => {
          const isActive = activeNav === key;
          return (
            <button
              key={key}
              onClick={() => { setCurrentView(key); playClickSound(); }}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-all duration-200 min-h-[44px]',
                isActive ? '' : 'text-gray-400/60 active:scale-95'
              )}
              style={isActive ? { color } : undefined}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
            >
              <div className="relative">
                <Icon
                  className={cn('size-5 transition-all duration-200', isActive && 'scale-110')}
                  strokeWidth={isActive ? 2.2 : 1.5}
                />
                {key === 'achievements' && unlockedAchievements.length > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[7px] font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {unlockedAchievements.length}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[9px] leading-tight transition-all duration-200',
                isActive ? 'font-bold' : 'font-medium'
              )}>
                {label}
              </span>
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute -top-px left-1/2 -translate-x-1/2 h-[3px] w-5 rounded-full"
                  style={{ backgroundColor: color }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
