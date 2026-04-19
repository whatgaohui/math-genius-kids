'use client';

import { Home, BarChart3, Heart, Settings } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { cn } from '@/lib/utils';

interface NavItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'stats', label: '统计', icon: BarChart3 },
  { key: 'pet', label: '宠物', icon: Heart },
  { key: 'settings', label: '设置', icon: Settings },
];

export default function BottomNav() {
  const currentView = useGameStore((s) => s.currentView);
  const setCurrentView = useGameStore((s) => s.setCurrentView);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/95 backdrop-blur-sm"
      aria-label="底部导航"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex h-14 max-w-lg items-stretch">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = currentView === key;
          return (
            <button
              key={key}
              onClick={() => setCurrentView(key)}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-all duration-200',
                'min-h-[44px]',
                isActive
                  ? 'text-amber-600'
                  : 'text-gray-400 active:text-gray-600 active:scale-95'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
            >
              <Icon
                className={cn(
                  'size-5 transition-transform duration-200',
                  isActive && 'scale-110'
                )}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span
                className={cn(
                  'text-[10px] font-medium leading-tight transition-all',
                  isActive && 'font-bold'
                )}
              >
                {label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-amber-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
