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
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur-sm safe-area-inset-bottom"
      aria-label="底部导航"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = currentView === key;
          return (
            <button
              key={key}
              onClick={() => setCurrentView(key)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-2 transition-all duration-200',
                'min-w-[56px] min-h-[44px]',
                isActive
                  ? 'text-amber-600'
                  : 'text-gray-400 hover:text-gray-600 active:scale-95'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
            >
              <Icon
                className={cn(
                  'size-5 transition-transform duration-200',
                  isActive && 'scale-110'
                )}
                strokeWidth={isActive ? 2.5 : 2}
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
                <span className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-amber-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
