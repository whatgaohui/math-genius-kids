'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { usePetStore } from '@/lib/pet-store';

const AVATAR_OPTIONS = [
  '😀', '😎', '🤩', '🥳', '🧑‍🎓', '👩‍🎓',
  '🦸', '🧙', '😺', '🐶', '🦊', '🐼',
  '🌟', '🌈', '🎨', '🎸',
];

export default function SettingsPage() {
  const playerName = useGameStore((s) => s.playerName);
  const playerAvatar = useGameStore((s) => s.playerAvatar);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const setPlayerAvatar = useGameStore((s) => s.setPlayerAvatar);
  const toggleSound = useGameStore((s) => s.toggleSound);

  const [nameInput, setNameInput] = useState(playerName);
  const [nameSaved, setNameSaved] = useState(false);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setPlayerName(nameInput.trim());
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 1500);
    }
  };

  const handleClearData = () => {
    localStorage.removeItem('math-genius-game-store');
    localStorage.removeItem('math-genius-pet-store');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-md px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            ⚙️ 设置
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            个性化你的学习伙伴
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Player Name */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="overflow-hidden border-0 py-0">
              <CardHeader className="bg-white dark:bg-gray-800/50 pb-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4 text-amber-500" />
                  玩家名称
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-white dark:bg-gray-800/50 pt-4">
                <div className="flex gap-2">
                  <Input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="输入你的名字"
                    maxLength={12}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSaveName}
                    size="sm"
                    className="gap-1 bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {nameSaved ? (
                      <>
                        <Check className="h-4 w-4" />
                        已保存
                      </>
                    ) : (
                      '保存'
                    )}
                  </Button>
                </div>
                {playerName && (
                  <p className="text-xs text-muted-foreground mt-2">
                    当前名称: {playerName}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Avatar Selection */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="overflow-hidden border-0 py-0">
              <CardHeader className="bg-white dark:bg-gray-800/50 pb-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="text-lg">🎨</span>
                  选择头像
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-white dark:bg-gray-800/50 pt-4">
                <div className="grid grid-cols-8 gap-2">
                  {AVATAR_OPTIONS.map((avatar) => {
                    const isSelected = playerAvatar === avatar;
                    return (
                      <motion.button
                        key={avatar}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setPlayerAvatar(avatar)}
                        className={`flex items-center justify-center w-10 h-10 rounded-xl text-xl transition-all ${
                          isSelected
                            ? 'bg-amber-100 ring-2 ring-amber-400 dark:bg-amber-900/30 dark:ring-amber-600 scale-110'
                            : 'bg-gray-100 hover:bg-amber-50 dark:bg-gray-700 dark:hover:bg-gray-600'
                        }`}
                      >
                        {avatar}
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sound Toggle */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="overflow-hidden border-0 py-0">
              <CardContent className="bg-white dark:bg-gray-800/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {soundEnabled ? (
                      <Volume2 className="h-5 w-5 text-amber-500" />
                    ) : (
                      <VolumeX className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <Label className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        音效
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {soundEnabled ? '已开启' : '已关闭'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={soundEnabled}
                    onCheckedChange={toggleSound}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Clear Data */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="overflow-hidden border-0 py-0">
              <CardContent className="bg-white dark:bg-gray-800/50 p-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      清除所有数据
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确定要清除所有数据吗？</AlertDialogTitle>
                      <AlertDialogDescription>
                        此操作将删除所有学习记录、成就、宠物数据等，且无法恢复。请谨慎操作。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearData}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        确定清除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  删除后将无法恢复，请谨慎操作
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* About */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="overflow-hidden border-0 py-0">
              <CardContent className="bg-white dark:bg-gray-800/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    关于
                  </span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      应用名称：
                    </span>
                    数学小达人
                  </p>
                  <p>
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      版本号：
                    </span>
                    v1.0.0
                  </p>
                  <p>
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      说明：
                    </span>
                    专为小朋友设计的趣味学习应用，包含数学、语文、英语三大科目练习。
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
