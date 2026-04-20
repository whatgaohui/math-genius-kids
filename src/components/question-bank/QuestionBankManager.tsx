'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Download,
  Trash2,
  Check,
  CheckCircle2,
  XCircle,
  Upload,
  FileSpreadsheet,
  ClipboardPaste,
  FileJson,
  RefreshCw,
  Package,
  Loader2,
  Plus,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import BottomNav from '@/components/math/BottomNav';

// ─── Preset Bank Data ─────────────────────────────────────────────────────────

interface PresetBank {
  id: string;
  subject: 'math' | 'chinese' | 'english';
  emoji: string;
  name: string;
  desc: string;
  grades: number[];
  count: number;
  semester: string;
}

const PRESET_BANKS: PresetBank[] = [
  { id: 'math-g1', subject: 'math', emoji: '🔢', name: '一年级数学', desc: '10以内加减法、认识图形', grades: [1], count: 120, semester: '上册' },
  { id: 'math-g2', subject: 'math', emoji: '➕', name: '二年级数学', desc: '乘法口诀、100以内加减法', grades: [2], count: 150, semester: '上册' },
  { id: 'math-g3', subject: 'math', emoji: '✖️', name: '三年级数学', desc: '多位数乘除法、分数初步', grades: [3], count: 180, semester: '上册' },
  { id: 'math-g4', subject: 'math', emoji: '📐', name: '四年级数学', desc: '四则运算、小数认识与计算', grades: [4], count: 200, semester: '上册' },
  { id: 'math-g5', subject: 'math', emoji: '📊', name: '五年级数学', desc: '简易方程、多边形面积', grades: [5], count: 200, semester: '上册' },
  { id: 'math-g6', subject: 'math', emoji: '📏', name: '六年级数学', desc: '分数百分数、比和比例', grades: [6], count: 180, semester: '上册' },
  { id: 'cn-g1', subject: 'chinese', emoji: '📝', name: '一年级语文', desc: '拼音认读、简单汉字识别', grades: [1], count: 100, semester: '上册' },
  { id: 'cn-g2', subject: 'chinese', emoji: '📖', name: '二年级语文', desc: '词语搭配、近反义词', grades: [2], count: 120, semester: '上册' },
  { id: 'cn-g3', subject: 'chinese', emoji: '🎭', name: '三年级语文', desc: '成语填空、古诗默写', grades: [3], count: 130, semester: '上册' },
  { id: 'cn-g4', subject: 'chinese', emoji: '📜', name: '四年级语文', desc: '成语进阶、句子练习', grades: [4], count: 140, semester: '上册' },
  { id: 'cn-g5', subject: 'chinese', emoji: '🏫', name: '五年级语文', desc: '古诗词、阅读理解', grades: [5], count: 130, semester: '上册' },
  { id: 'cn-g6', subject: 'chinese', emoji: '🎯', name: '六年级语文', desc: '综合语文、毕业复习', grades: [6], count: 150, semester: '上册' },
  { id: 'en-g1', subject: 'english', emoji: '🔤', name: '一年级英语', desc: '基础单词、简单问候语', grades: [1], count: 80, semester: '上册' },
  { id: 'en-g2', subject: 'english', emoji: '🎨', name: '二年级英语', desc: '颜色数字、家庭成员', grades: [2], count: 90, semester: '上册' },
  { id: 'en-g3', subject: 'english', emoji: '🌍', name: '三年级英语', desc: '动物食物、日常用品', grades: [3], count: 100, semester: '上册' },
  { id: 'en-g4', subject: 'english', emoji: '✏️', name: '四年级英语', desc: '学科词汇、天气季节', grades: [4], count: 110, semester: '上册' },
  { id: 'en-g5', subject: 'english', emoji: '🎓', name: '五年级英语', desc: '方位介词、时间表达', grades: [5], count: 120, semester: '上册' },
  { id: 'en-g6', subject: 'english', emoji: '🏆', name: '六年级英语', desc: '综合词汇、语法复习', grades: [6], count: 130, semester: '上册' },
];

// ─── Subject / Grade Config ───────────────────────────────────────────────────

const SUBJECT_CONFIG: Record<string, { label: string; emoji: string; color: string; bgColor: string; borderColor: string; badgeBg: string; badgeText: string }> = {
  math: { label: '数学', emoji: '🧮', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', badgeBg: 'bg-amber-100', badgeText: 'text-amber-700' },
  chinese: { label: '语文', emoji: '📖', color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', badgeBg: 'bg-rose-100', badgeText: 'text-rose-700' },
  english: { label: '英语', emoji: '🔤', color: 'text-cyan-700', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200', badgeBg: 'bg-cyan-100', badgeText: 'text-cyan-700' },
};

const GRADE_LABELS: Record<number, string> = {
  1: '一年级', 2: '二年级', 3: '三年级',
  4: '四年级', 5: '五年级', 6: '六年级',
};

const DIFFICULTY_LABELS: Record<string, { label: string; emoji: string }> = {
  easy: { label: '简单', emoji: '😊' },
  medium: { label: '中等', emoji: '🤔' },
  hard: { label: '困难', emoji: '💪' },
};

const CHINESE_MODES = [
  { value: 'recognize-pinyin', label: '拼音识别' },
  { value: 'recognize-char', label: '汉字识别' },
  { value: 'word-match', label: '词语搭配' },
  { value: 'dictation', label: '听写练习' },
  { value: 'idiom-fill', label: '成语填空' },
  { value: 'antonym', label: '反义词' },
  { value: 'synonym', label: '近义词' },
  { value: 'poetry-fill', label: '古诗填空' },
  { value: 'sentence-fill', label: '句子填空' },
  { value: 'reading-comp', label: '阅读理解' },
];

const ENGLISH_MODES = [
  { value: 'word-picture', label: '看词选义' },
  { value: 'picture-word', label: '看义选词' },
  { value: 'listening', label: '听力挑战' },
  { value: 'spelling', label: '拼写达人' },
];

// ─── Bank Info Type ───────────────────────────────────────────────────────────

interface BankInfo {
  id: string;
  name: string;
  version: string;
  subject: string;
  description: string;
  source: string;
  enabled: boolean;
  priority: number;
  registeredAt: number;
  questionCount: number;
  supportedGrades: number[];
}

// ─── Manual Question Types ───────────────────────────────────────────────────

interface ManualMathQuestion {
  expression: string;
  answer: number;
  options: [number, number, number, number];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ManualChineseQuestion {
  prompt: string;
  correctAnswer: string;
  options: [string, string, string, string];
  mode: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ManualEnglishQuestion {
  word: string;
  meaning: string;
  emoji: string;
  options: [string, string, string, string];
  mode: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function QuestionBankManager() {
  const setCurrentView = useGameStore((s) => s.setCurrentView);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-sky-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-orange-100">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center justify-center h-10 w-10 rounded-xl bg-gray-100 active:bg-gray-200 transition-colors min-h-[44px]"
            aria-label="返回首页"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-800">📚 题库管理</h1>
            <p className="text-xs text-gray-500">为宝贝选好练习题</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 pt-4 pb-24 max-w-lg mx-auto w-full">
        <Tabs defaultValue="store" className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-auto p-1 bg-white rounded-2xl shadow-sm border border-orange-100 mb-4">
            <TabsTrigger
              value="store"
              className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-[11px] data-[state=active]:bg-gradient-to-b data-[state=active]:from-amber-400 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-sm min-h-[44px]"
            >
              <span className="text-base">📚</span>
              <span>题库商店</span>
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-[11px] data-[state=active]:bg-gradient-to-b data-[state=active]:from-rose-400 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-sm min-h-[44px]"
            >
              <span className="text-base">✏️</span>
              <span>手动出题</span>
            </TabsTrigger>
            <TabsTrigger
              value="import"
              className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-[11px] data-[state=active]:bg-gradient-to-b data-[state=active]:from-cyan-400 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-sm min-h-[44px]"
            >
              <span className="text-base">📥</span>
              <span>导入题目</span>
            </TabsTrigger>
            <TabsTrigger
              value="banks"
              className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-[11px] data-[state=active]:bg-gradient-to-b data-[state=active]:from-emerald-400 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-sm min-h-[44px]"
            >
              <span className="text-base">📊</span>
              <span>我的题库</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="store">
            <StoreTab />
          </TabsContent>
          <TabsContent value="manual">
            <ManualTab />
          </TabsContent>
          <TabsContent value="import">
            <ImportTab />
          </TabsContent>
          <TabsContent value="banks">
            <MyBanksTab />
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 1: 题库商店
// ═══════════════════════════════════════════════════════════════════════════════

function StoreTab() {
  const [filterSubject, setFilterSubject] = useState<'all' | 'math' | 'chinese' | 'english'>('all');
  const [filterGrade, setFilterGrade] = useState<number>(0);
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set());
  const [installingId, setInstallingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Check which presets are already installed
  const checkInstalled = useCallback(async () => {
    try {
      const res = await fetch('/api/question-bank/list');
      const data = await res.json();
      if (data.success) {
        const bankSubjects = new Set<string>();
        for (const bank of data.banks as BankInfo[]) {
          if (bank.enabled) bankSubjects.add(bank.subject);
        }
        // A preset is "installed" if its subject bank exists
        const installed = new Set<string>();
        for (const preset of PRESET_BANKS) {
          if (bankSubjects.has(preset.subject)) {
            installed.add(preset.id);
          }
        }
        setInstalledIds(installed);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    checkInstalled();
  }, [checkInstalled]);

  const handleInstall = useCallback(async (preset: PresetBank) => {
    if (installedIds.has(preset.id)) {
      toast({
        title: `${preset.emoji} ${preset.name}`,
        description: '这个题库已经安装好了哦～',
      });
      return;
    }

    setInstallingId(preset.id);
    try {
      const res = await fetch('/api/question-bank/install-preset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presetId: preset.id }),
      });
      const data = await res.json();

      if (data.success) {
        setInstalledIds((prev) => new Set([...prev, preset.id]));
        toast({
          title: `🎉 安装成功！`,
          description: `${preset.emoji} ${preset.name} 已就绪`,
        });
      } else {
        toast({
          title: '安装失败',
          description: data.error || '请稍后重试',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: '网络错误',
        description: '请检查网络后重试',
        variant: 'destructive',
      });
    } finally {
      setInstallingId(null);
    }
  }, [installedIds, toast]);

  const filteredBanks = PRESET_BANKS.filter((bank) => {
    if (filterSubject !== 'all' && bank.subject !== filterSubject) return false;
    if (filterGrade !== 0 && !bank.grades.includes(filterGrade)) return false;
    return true;
  });

  const subjectCounts = {
    all: PRESET_BANKS.length,
    math: PRESET_BANKS.filter((b) => b.subject === 'math').length,
    chinese: PRESET_BANKS.filter((b) => b.subject === 'chinese').length,
    english: PRESET_BANKS.filter((b) => b.subject === 'english').length,
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Welcome Banner */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 text-white overflow-hidden">
          <CardContent className="p-4 relative">
            <div className="absolute -right-4 -top-4 text-7xl opacity-20">📚</div>
            <h2 className="text-base font-bold mb-1">为宝贝挑选练习题吧！</h2>
            <p className="text-xs text-white/80">点击「一键安装」即可使用，无需任何技术操作</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subject Filter */}
      <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-1">
        {([
          { key: 'all', label: '全部', emoji: '🌈' },
          { key: 'math', label: '数学', emoji: '🧮' },
          { key: 'chinese', label: '语文', emoji: '📖' },
          { key: 'english', label: '英语', emoji: '🔤' },
        ] as const).map((s) => (
          <button
            key={s.key}
            onClick={() => setFilterSubject(s.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all min-h-[44px] ${
              filterSubject === s.key
                ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md scale-105'
                : 'bg-white text-gray-600 border border-gray-200 active:scale-95'
            }`}
          >
            <span>{s.emoji}</span>
            <span>{s.label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              filterSubject === s.key ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              {subjectCounts[s.key]}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Grade Filter */}
      <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterGrade(0)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all min-h-[36px] ${
            filterGrade === 0
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-500 active:bg-gray-200'
          }`}
        >
          全部年级
        </button>
        {[1, 2, 3, 4, 5, 6].map((g) => (
          <button
            key={g}
            onClick={() => setFilterGrade(g)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all min-h-[36px] ${
              filterGrade === g
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-500 active:bg-gray-200'
            }`}
          >
            {g}年级
          </button>
        ))}
      </motion.div>

      {/* Package Grid */}
      {filteredBanks.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <span className="text-4xl mb-3 block">🔍</span>
              <p className="text-sm text-gray-500">没有找到匹配的题库</p>
              <p className="text-xs text-gray-400 mt-1">试试切换筛选条件</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {filteredBanks.map((preset) => {
              const isInstalled = installedIds.has(preset.id);
              const isInstalling = installingId === preset.id;
              const cfg = SUBJECT_CONFIG[preset.subject];

              return (
                <motion.div
                  key={preset.id}
                  variants={itemVariants}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                >
                  <Card className={`border ${cfg.borderColor} ${cfg.bgColor} overflow-hidden hover:shadow-md transition-shadow`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl flex-shrink-0">{preset.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-sm text-gray-800 truncate">{preset.name}</h3>
                            <Badge className={`${cfg.badgeBg} ${cfg.badgeText} text-[10px] border-0 px-1.5`}>
                              {cfg.emoji} {cfg.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{preset.desc}</p>
                          <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3">
                            <span>📋 {preset.count}题</span>
                            <span>📖 {preset.semester}</span>
                            <span>🎓 {preset.grades.map((g) => `${g}年级`).join('、')}</span>
                          </div>
                          <Button
                            size="sm"
                            className={`w-full h-9 rounded-lg text-xs font-bold transition-all min-h-[36px] ${
                              isInstalled
                                ? 'bg-gray-100 text-gray-500 hover:bg-gray-200 border-0'
                                : 'bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:from-amber-500 hover:to-orange-500 border-0 shadow-sm'
                            }`}
                            onClick={() => handleInstall(preset)}
                            disabled={isInstalling}
                          >
                            {isInstalling ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                            ) : isInstalled ? (
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            ) : (
                              <Sparkles className="h-3.5 w-3.5 mr-1" />
                            )}
                            {isInstalling ? '安装中...' : isInstalled ? '已安装 ✓' : '一键安装'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 2: 手动出题
// ═══════════════════════════════════════════════════════════════════════════════

type CreatorStep = 1 | 2 | 3 | 4;

function ManualTab() {
  const [step, setStep] = useState<CreatorStep>(1);
  const [subject, setSubject] = useState<'math' | 'chinese' | 'english' | null>(null);
  const [grade, setGrade] = useState<number>(0);
  const [addedQuestions, setAddedQuestions] = useState<(ManualMathQuestion | ManualChineseQuestion | ManualEnglishQuestion)[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Math form state
  const [mathExpr, setMathExpr] = useState('');
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathOptions, setMathOptions] = useState(['', '', '', '']);
  const [mathDifficulty, setMathDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  // Chinese form state
  const [cnPrompt, setCnPrompt] = useState('');
  const [cnAnswer, setCnAnswer] = useState('');
  const [cnOptions, setCnOptions] = useState(['', '', '', '']);
  const [cnMode, setCnMode] = useState('recognize-pinyin');
  const [cnDifficulty, setCnDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  // English form state
  const [enWord, setEnWord] = useState('');
  const [enMeaning, setEnMeaning] = useState('');
  const [enEmoji, setEnEmoji] = useState('');
  const [enOptions, setEnOptions] = useState(['', '', '', '']);
  const [enMode, setEnMode] = useState('word-picture');
  const [enDifficulty, setEnDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  const resetForm = useCallback(() => {
    setMathExpr(''); setMathAnswer(''); setMathOptions(['', '', '', '']); setMathDifficulty('easy');
    setCnPrompt(''); setCnAnswer(''); setCnOptions(['', '', '', '']); setCnMode('recognize-pinyin'); setCnDifficulty('easy');
    setEnWord(''); setEnMeaning(''); setEnEmoji(''); setEnOptions(['', '', '', '']); setEnMode('word-picture'); setEnDifficulty('easy');
  }, []);

  const goBack = useCallback(() => {
    if (step === 1) { /* stay */ }
    else if (step === 2) { setStep(1); setSubject(null); }
    else if (step === 3) { setStep(2); setGrade(0); }
    else if (step === 4) { setStep(3); resetForm(); }
  }, [step, resetForm]);

  const addQuestion = useCallback(() => {
    if (!subject || grade === 0) return;

    if (subject === 'math') {
      const answer = Number(mathAnswer);
      if (!mathExpr || isNaN(answer) || mathOptions.some((o) => o === '')) {
        toast({ title: '请填写完整', description: '算式、答案和四个选项都不能为空哦', variant: 'destructive' });
        return;
      }
      setAddedQuestions((prev) => [...prev, {
        expression: mathExpr,
        answer,
        options: mathOptions.map(Number) as [number, number, number, number],
        difficulty: mathDifficulty,
      }]);
      toast({ title: '✅ 添加成功', description: `第 ${addedQuestions.length + 1} 道数学题` });
    } else if (subject === 'chinese') {
      if (!cnPrompt || !cnAnswer || cnOptions.some((o) => o === '')) {
        toast({ title: '请填写完整', description: '题目、答案和四个选项都不能为空哦', variant: 'destructive' });
        return;
      }
      setAddedQuestions((prev) => [...prev, {
        prompt: cnPrompt,
        correctAnswer: cnAnswer,
        options: cnOptions as [string, string, string, string],
        mode: cnMode,
        difficulty: cnDifficulty,
      }]);
      toast({ title: '✅ 添加成功', description: `第 ${addedQuestions.length + 1} 道语文题` });
    } else if (subject === 'english') {
      if (!enWord || !enMeaning || enOptions.some((o) => o === '')) {
        toast({ title: '请填写完整', description: '单词、释义和四个选项都不能为空哦', variant: 'destructive' });
        return;
      }
      setAddedQuestions((prev) => [...prev, {
        word: enWord,
        meaning: enMeaning,
        emoji: enEmoji,
        options: enOptions as [string, string, string, string],
        mode: enMode,
        difficulty: enDifficulty,
      }]);
      toast({ title: '✅ 添加成功', description: `第 ${addedQuestions.length + 1} 道英语题` });
    }

    resetForm();
    setStep(3); // Go back to form
  }, [subject, grade, mathExpr, mathAnswer, mathOptions, mathDifficulty,
    cnPrompt, cnAnswer, cnOptions, cnMode, cnDifficulty,
    enWord, enMeaning, enEmoji, enOptions, enMode, enDifficulty,
    addedQuestions.length, resetForm, toast]);

  const saveToBank = useCallback(async () => {
    if (addedQuestions.length === 0 || !subject || grade === 0) return;

    setIsSaving(true);
    try {
      const subjectMap = { math: 'math', chinese: 'chinese', english: 'english' };
      const nameMap = { math: '自定义数学题库', chinese: '自定义语文题库', english: '自定义英语题库' };

      // Build import payload
      const importData: Record<string, unknown> = {
        meta: {
          id: `custom-${subject}-g${grade}-${Date.now()}`,
          name: `${GRADE_LABELS[grade]}${nameMap[subject]}`,
          subject: subjectMap[subject],
          version: '1.0.0',
          description: `手动创建的${GRADE_LABELS[grade]}${SUBJECT_CONFIG[subject].label}题库`,
          source: '家长手动创建',
        },
        data: {
          [String(grade)]: {
            '上册': addedQuestions.map((q, i) => {
              if (subject === 'math') {
                const mq = q as ManualMathQuestion;
                return {
                  topicId: `${subject}-${grade}a-custom`,
                  expression: mq.expression,
                  answer: mq.answer,
                  options: mq.options,
                  difficulty: mq.difficulty,
                  type: 'add',
                };
              } else if (subject === 'chinese') {
                const cq = q as ManualChineseQuestion;
                return {
                  topicId: `${subject}-${grade}a-custom`,
                  mode: cq.mode,
                  prompt: cq.prompt,
                  correctAnswer: cq.correctAnswer,
                  options: cq.options,
                  difficulty: cq.difficulty,
                };
              } else {
                const eq = q as ManualEnglishQuestion;
                return {
                  topicId: `${subject}-${grade}a-custom`,
                  mode: eq.mode,
                  word: eq.word,
                  meaning: eq.meaning,
                  emoji: eq.emoji,
                  options: eq.options,
                  difficulty: eq.difficulty,
                };
              }
            }),
          },
        },
      };

      const res = await fetch('/api/question-bank/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importData),
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: '🎉 保存成功！',
          description: `共 ${addedQuestions.length} 道题目已添加到题库`,
        });
        setAddedQuestions([]);
        resetForm();
        setStep(1);
        setSubject(null);
        setGrade(0);
      } else {
        toast({
          title: '保存失败',
          description: data.error || '请检查题目格式后重试',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: '网络错误',
        description: '请检查网络后重试',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [addedQuestions, subject, grade, resetForm, toast]);

  const steps = [
    { num: 1, label: '选科目', done: step > 1 },
    { num: 2, label: '选年级', done: step > 2 },
    { num: 3, label: '填题目', done: step > 3 },
    { num: 4, label: '预览', done: false },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Progress Steps */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {steps.map((s, i) => (
                <React.Fragment key={s.num}>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                        step === s.num
                          ? 'bg-gradient-to-b from-rose-400 to-rose-500 text-white shadow-md scale-110'
                          : s.done
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {s.done ? <Check className="h-4 w-4" /> : s.num}
                    </div>
                    <span className={`text-[10px] ${step === s.num ? 'text-rose-600 font-bold' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 rounded mx-1 ${s.done ? 'bg-emerald-200' : 'bg-gray-100'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Step 1: Choose Subject */}
      {step === 1 && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          <motion.div variants={itemVariants}>
            <h3 className="text-base font-bold text-gray-800 mb-1">🎯 第一步：选择科目</h3>
            <p className="text-xs text-gray-500">选一个科目开始出题</p>
          </motion.div>
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
            {(['math', 'chinese', 'english'] as const).map((sub) => {
              const cfg = SUBJECT_CONFIG[sub];
              return (
                <motion.button
                  key={sub}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setSubject(sub); setStep(2); }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all min-h-[100px] ${
                    subject === sub
                      ? `border-current ${cfg.bgColor} ${cfg.color}`
                      : 'border-transparent bg-white hover:border-gray-200'
                  }`}
                >
                  <span className="text-3xl">{cfg.emoji}</span>
                  <span className={`text-sm font-bold ${subject === sub ? cfg.color : 'text-gray-600'}`}>
                    {cfg.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>
      )}

      {/* Step 2: Choose Grade */}
      {step === 2 && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-1">
              <button onClick={goBack} className="text-sm text-gray-400 hover:text-gray-600">
                ← 返回
              </button>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">
              {SUBJECT_CONFIG[subject!].emoji} 第二步：选择年级
            </h3>
            <p className="text-xs text-gray-500">选择适合宝贝的年级</p>
          </motion.div>
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((g) => (
              <motion.button
                key={g}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setGrade(g); setStep(3); }}
                className={`flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border-2 transition-all min-h-[80px] ${
                  grade === g
                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                    : 'border-transparent bg-white hover:border-gray-200 text-gray-600'
                }`}
              >
                <span className="text-2xl font-bold">{g}</span>
                <span className="text-xs">{GRADE_LABELS[g]}</span>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Step 3: Fill Question Form */}
      {step === 3 && subject && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-1">
              <button onClick={goBack} className="text-sm text-gray-400 hover:text-gray-600">
                ← 返回
              </button>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">
              ✏️ 第三步：填写题目
            </h3>
            <p className="text-xs text-gray-500">
              {SUBJECT_CONFIG[subject].emoji} {SUBJECT_CONFIG[subject].label} · {GRADE_LABELS[grade]}
            </p>
          </motion.div>

          {subject === 'math' && (
            <motion.div variants={itemVariants} className="space-y-3">
              <Card className="border-0 shadow-sm bg-amber-50/50">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                      📝 算式 <span className="text-gray-400 font-normal text-xs">（如：3 + 5）</span>
                    </Label>
                    <Input
                      value={mathExpr}
                      onChange={(e) => setMathExpr(e.target.value)}
                      placeholder="例：3 + 5"
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                      ✅ 答案
                    </Label>
                    <Input
                      type="number"
                      value={mathAnswer}
                      onChange={(e) => setMathAnswer(e.target.value)}
                      placeholder="例：8"
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                      🔘 四个选项
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {mathOptions.map((opt, i) => (
                        <div key={i} className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <Input
                            type="number"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...mathOptions];
                              newOpts[i] = e.target.value;
                              setMathOptions(newOpts);
                            }}
                            placeholder={`选项 ${String.fromCharCode(65 + i)}`}
                            className="h-11 pl-8 text-base"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                      🎯 难度
                    </Label>
                    <RadioGroup value={mathDifficulty} onValueChange={(v) => setMathDifficulty(v as typeof mathDifficulty)} className="flex gap-2">
                      {Object.entries(DIFFICULTY_LABELS).map(([key, val]) => (
                        <label
                          key={key}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all min-h-[44px] ${
                            mathDifficulty === key ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <RadioGroupItem value={key} />
                          <span className="text-sm">{val.emoji} {val.label}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {subject === 'chinese' && (
            <motion.div variants={itemVariants} className="space-y-3">
              <Card className="border-0 shadow-sm bg-rose-50/50">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                      📝 题目描述 <span className="text-gray-400 font-normal text-xs">（如：选择正确的拼音）</span>
                    </Label>
                    <Input
                      value={cnPrompt}
                      onChange={(e) => setCnPrompt(e.target.value)}
                      placeholder="例：选择正确的拼音"
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                      ✅ 正确答案
                    </Label>
                    <Input
                      value={cnAnswer}
                      onChange={(e) => setCnAnswer(e.target.value)}
                      placeholder="例：dà"
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                      🔘 四个选项
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {cnOptions.map((opt, i) => (
                        <div key={i} className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <Input
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...cnOptions];
                              newOpts[i] = e.target.value;
                              setCnOptions(newOpts);
                            }}
                            placeholder={`选项 ${String.fromCharCode(65 + i)}`}
                            className="h-11 pl-8 text-base"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                      🎮 练习模式
                    </Label>
                    <Select value={cnMode} onValueChange={setCnMode}>
                      <SelectTrigger className="h-11 w-full text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CHINESE_MODES.map((m) => (
                          <SelectItem key={m.value} value={m.value} className="text-sm">
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                      🎯 难度
                    </Label>
                    <RadioGroup value={cnDifficulty} onValueChange={(v) => setCnDifficulty(v as typeof cnDifficulty)} className="flex gap-2">
                      {Object.entries(DIFFICULTY_LABELS).map(([key, val]) => (
                        <label
                          key={key}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all min-h-[44px] ${
                            cnDifficulty === key ? 'border-rose-400 bg-rose-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <RadioGroupItem value={key} />
                          <span className="text-sm">{val.emoji} {val.label}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {subject === 'english' && (
            <motion.div variants={itemVariants} className="space-y-3">
              <Card className="border-0 shadow-sm bg-cyan-50/50">
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                        🔤 英文单词
                      </Label>
                      <Input
                        value={enWord}
                        onChange={(e) => setEnWord(e.target.value)}
                        placeholder="例：apple"
                        className="h-12 text-base"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                        📖 中文释义
                      </Label>
                      <Input
                        value={enMeaning}
                        onChange={(e) => setEnMeaning(e.target.value)}
                        placeholder="例：苹果"
                        className="h-12 text-base"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                      😀 提示表情 <span className="text-gray-400 font-normal text-xs">（选填）</span>
                    </Label>
                    <Input
                      value={enEmoji}
                      onChange={(e) => setEnEmoji(e.target.value)}
                      placeholder="例：🍎"
                      className="h-11 text-base"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                      🔘 四个选项
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {enOptions.map((opt, i) => (
                        <div key={i} className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <Input
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...enOptions];
                              newOpts[i] = e.target.value;
                              setEnOptions(newOpts);
                            }}
                            placeholder={`选项 ${String.fromCharCode(65 + i)}`}
                            className="h-11 pl-8 text-base"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                      🎮 练习模式
                    </Label>
                    <Select value={enMode} onValueChange={setEnMode}>
                      <SelectTrigger className="h-11 w-full text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ENGLISH_MODES.map((m) => (
                          <SelectItem key={m.value} value={m.value} className="text-sm">
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                      🎯 难度
                    </Label>
                    <RadioGroup value={enDifficulty} onValueChange={(v) => setEnDifficulty(v as typeof enDifficulty)} className="flex gap-2">
                      {Object.entries(DIFFICULTY_LABELS).map(([key, val]) => (
                        <label
                          key={key}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all min-h-[44px] ${
                            enDifficulty === key ? 'border-cyan-400 bg-cyan-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <RadioGroupItem value={key} />
                          <span className="text-sm">{val.emoji} {val.label}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex gap-3">
            <Button
              variant="outline"
              onClick={goBack}
              className="flex-1 h-12 rounded-xl text-sm border-gray-200"
            >
              返回
            </Button>
            <Button
              onClick={() => { addQuestion(); setStep(4); }}
              className="flex-1 h-12 rounded-xl text-sm font-bold bg-gradient-to-r from-rose-400 to-rose-500 text-white border-0 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              添加并预览
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Step 4: Preview & Save */}
      {step === 4 && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-1">
              <button onClick={goBack} className="text-sm text-gray-400 hover:text-gray-600">
                ← 继续出题
              </button>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">
              👀 预览 & 保存
            </h3>
            <p className="text-xs text-gray-500">
              已添加 {addedQuestions.length} 道题目
            </p>
          </motion.div>

          {addedQuestions.length === 0 ? (
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8 text-center">
                  <span className="text-4xl mb-3 block">📝</span>
                  <p className="text-sm text-gray-500">还没有添加题目</p>
                  <p className="text-xs text-gray-400 mt-1">点击「继续出题」添加更多题目</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <>
              <motion.div variants={itemVariants} className="space-y-2 max-h-64 overflow-y-auto">
                {addedQuestions.map((q, i) => (
                  <Card key={i} className="border-0 shadow-sm bg-gray-50">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <Badge variant="secondary" className="flex-shrink-0 mt-0.5 text-[10px]">
                          #{i + 1}
                        </Badge>
                        <div className="text-xs text-gray-600 flex-1 min-w-0">
                          {subject === 'math' && (
                            <span className="font-mono">{(q as ManualMathQuestion).expression} = {(q as ManualMathQuestion).answer}</span>
                          )}
                          {subject === 'chinese' && (
                            <span>{(q as ManualChineseQuestion).prompt} → {(q as ManualChineseQuestion).correctAnswer}</span>
                          )}
                          {subject === 'english' && (
                            <span>{(q as ManualEnglishQuestion).word} = {(q as ManualEnglishQuestion).meaning}</span>
                          )}
                          <span className="text-gray-400 ml-2">
                            {DIFFICULTY_LABELS[q.difficulty].emoji}
                          </span>
                        </div>
                        <button
                          onClick={() => setAddedQuestions((prev) => prev.filter((_, j) => j !== i))}
                          className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
                          aria-label="删除此题"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>

              <motion.div variants={itemVariants} className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => { setStep(3); resetForm(); }}
                  className="flex-1 h-12 rounded-xl text-sm border-gray-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  继续出题
                </Button>
                <Button
                  onClick={saveToBank}
                  disabled={isSaving || addedQuestions.length === 0}
                  className="flex-1 h-12 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-0 shadow-sm"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <BookOpen className="h-4 w-4 mr-1" />
                  )}
                  保存到题库
                </Button>
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 3: 导入题目
// ═══════════════════════════════════════════════════════════════════════════════

type ImportMethod = 'excel' | 'text' | 'json';

function ImportTab() {
  const [method, setMethod] = useState<ImportMethod>('excel');
  const [importing, setImporting] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Excel file upload handler
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
      toast({ title: '文件格式不对', description: '请上传 .xlsx 或 .csv 文件', variant: 'destructive' });
      return;
    }

    // For CSV files, we can parse directly
    if (file.name.endsWith('.csv')) {
      const text = await file.text();
      const lines = text.trim().split('\n').map((l) => l.split('\t').length > 1 ? l.split('\t') : l.split(','));
      if (lines.length > 0) {
        setPreviewHeaders(lines[0].map((h) => h.trim().replace(/^"|"$/g, '')));
        setPreviewData(lines.slice(1, 6).map((l) => l.map((c) => c.trim().replace(/^"|"$/g, ''))));
      }
      toast({ title: '文件已读取', description: `共 ${lines.length - 1} 行数据` });
    } else {
      // For xlsx, read as ArrayBuffer and use a basic approach
      try {
        const buffer = await file.arrayBuffer();
        // Simple check - we'll treat xlsx as requiring the text paste or JSON method
        toast({
          title: 'xlsx 文件已选择',
          description: '由于浏览器限制，请将内容复制粘贴到下方文本框中',
        });
        setMethod('text');
        // Try to read as text (may not work for all xlsx files)
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(buffer);
        if (text.includes('\t') || text.includes('\n')) {
          setTextInput(text);
        }
      } catch {
        toast({
          title: '文件读取失败',
          description: '请将内容复制粘贴到文本框中',
          variant: 'destructive',
        });
      }
    }
    e.target.value = '';
  }, [toast]);

  // Parse text input
  const parseTextInput = useCallback(() => {
    if (!textInput.trim()) {
      toast({ title: '请先粘贴内容', variant: 'destructive' });
      return;
    }
    const lines = textInput.trim().split('\n');
    const data = lines.map((l) => l.split('\t').length > 1 ? l.split('\t') : l.split(','));
    if (data.length > 0) {
      setPreviewHeaders(data[0].map((h) => h.trim()));
      setPreviewData(data.slice(1, 6).map((l) => l.map((c) => c.trim())));
      toast({ title: '解析成功', description: `共 ${data.length - 1} 行数据，预览前5行` });
    }
  }, [textInput, toast]);

  // JSON validation
  const handleJsonValidate = useCallback(() => {
    if (!jsonText.trim()) {
      toast({ title: '请先粘贴内容', variant: 'destructive' });
      return;
    }
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.meta && parsed.data) {
        toast({ title: '✅ 格式正确', description: '数据已准备好导入' });
      } else {
        toast({ title: '格式不完整', description: '需要包含 meta 和 data 两个字段', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: '格式错误', description: `无法解析：${(err as Error).message}`, variant: 'destructive' });
    }
  }, [jsonText, toast]);

  // Import action
  const handleImport = useCallback(async () => {
    setImporting(true);
    try {
      let body = jsonText;

      // If using text method, we need to convert to JSON format
      if (method === 'text' && textInput.trim()) {
        // Build a simple JSON from tab-separated text
        const lines = textInput.trim().split('\n');
        if (lines.length < 2) {
          toast({ title: '数据太少', description: '至少需要标题行和一行数据', variant: 'destructive' });
          setImporting(false);
          return;
        }
        // Try to detect subject from headers
        const headers = lines[0].toLowerCase();
        let detectedSubject = 'math';
        if (headers.includes('单词') || headers.includes('word')) detectedSubject = 'english';
        else if (headers.includes('拼音') || headers.includes('汉字') || headers.includes('答案')) detectedSubject = 'chinese';

        const questions = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split('\t').length > 1 ? lines[i].split('\t') : lines[i].split(',');
          if (cols.length < 3) continue;

          if (detectedSubject === 'math') {
            questions.push({
              topicId: 'custom-import',
              expression: cols[0]?.trim() || '',
              answer: Number(cols[1]?.trim()) || 0,
              options: [Number(cols[2]?.trim()) || 0, Number(cols[3]?.trim()) || 0, Number(cols[4]?.trim()) || 0, Number(cols[5]?.trim()) || 0].filter(n => n !== 0),
              difficulty: cols[6]?.trim() || 'easy',
              type: 'add',
            });
          } else if (detectedSubject === 'chinese') {
            questions.push({
              topicId: 'custom-import',
              mode: cols[0]?.trim() || 'word-match',
              prompt: cols[1]?.trim() || '',
              correctAnswer: cols[2]?.trim() || '',
              options: [cols[3]?.trim(), cols[4]?.trim(), cols[5]?.trim(), cols[6]?.trim()].filter(Boolean),
              difficulty: cols[7]?.trim() || 'easy',
            });
          } else {
            questions.push({
              topicId: 'custom-import',
              mode: 'word-picture',
              word: cols[0]?.trim() || '',
              meaning: cols[1]?.trim() || '',
              emoji: cols[2]?.trim() || '',
              options: [cols[3]?.trim(), cols[4]?.trim(), cols[5]?.trim(), cols[6]?.trim()].filter(Boolean),
              difficulty: cols[7]?.trim() || 'easy',
            });
          }
        }

        body = JSON.stringify({
          meta: {
            id: `import-${detectedSubject}-${Date.now()}`,
            name: `导入${SUBJECT_CONFIG[detectedSubject].label}题库`,
            subject: detectedSubject,
            version: '1.0.0',
            description: '从文本导入的题库',
            source: '文本导入',
          },
          data: {
            '1': {
              '上册': questions,
            },
          },
        });
      }

      if (!body || !body.trim()) {
        toast({ title: '没有数据可导入', variant: 'destructive' });
        setImporting(false);
        return;
      }

      const res = await fetch('/api/question-bank/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: '🎉 导入成功！',
          description: `题库「${data.bankName}」已就绪，共 ${data.questionCount} 道题`,
        });
        setTextInput('');
        setJsonText('');
        setPreviewData([]);
        setPreviewHeaders([]);
      } else {
        toast({
          title: '导入失败',
          description: data.error || '请检查格式后重试',
          variant: 'destructive',
        });
      }
    } catch {
      toast({ title: '网络错误', description: '请检查网络后重试', variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  }, [method, textInput, jsonText, toast]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Method Selection */}
      <motion.div variants={itemVariants} className="space-y-2">
        <h3 className="text-base font-bold text-gray-800 mb-1">📥 选择导入方式</h3>
        <div className="grid grid-cols-3 gap-2">
          {([
            { key: 'excel' as const, emoji: '📊', label: '上传表格', desc: 'xlsx / csv' },
            { key: 'text' as const, emoji: '📋', label: '粘贴文本', desc: '每行一题' },
            { key: 'json' as const, emoji: '⚙️', label: '高级导入', desc: '格式化数据' },
          ]).map((m) => (
            <motion.button
              key={m.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMethod(m.key)}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all min-h-[80px] ${
                method === m.key
                  ? 'border-cyan-400 bg-cyan-50'
                  : 'border-transparent bg-white hover:border-gray-200'
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className={`text-xs font-bold ${method === m.key ? 'text-cyan-700' : 'text-gray-600'}`}>
                {m.label}
              </span>
              <span className="text-[10px] text-gray-400">{m.desc}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Excel Upload */}
      {method === 'excel' && (
        <motion.div variants={itemVariants} className="space-y-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="text-center py-8">
                <FileSpreadsheet className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-700">上传 Excel 或 CSV 文件</p>
                <p className="text-xs text-gray-400 mt-1">支持 .xlsx 和 .csv 格式</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full h-12 rounded-xl border-dashed border-2 border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100"
              >
                <Upload className="h-4 w-4 mr-2" />
                选择文件
              </Button>

              <Card className="bg-amber-50 border-0 p-3">
                <p className="text-xs text-amber-700 font-bold mb-1">📋 表格格式说明</p>
                <div className="text-[11px] text-amber-600 space-y-1">
                  <p><strong>数学：</strong>算式 | 答案 | 选项A | 选项B | 选项C | 选项D | 难度</p>
                  <p><strong>语文：</strong>模式 | 题目 | 答案 | 选项A | 选项B | 选项C | 选项D | 难度</p>
                  <p><strong>英语：</strong>单词 | 释义 | 表情 | 选项A | 选项B | 选项C | 选项D | 难度</p>
                </div>
              </Card>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Text Paste */}
      {method === 'text' && (
        <motion.div variants={itemVariants} className="space-y-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <ClipboardPaste className="h-5 w-5 text-cyan-500" />
                <h4 className="text-sm font-bold text-gray-700">粘贴题目内容</h4>
              </div>
              <p className="text-xs text-gray-400">
                每行一道题，用 Tab 键或逗号分隔各字段。第一行为标题行。
              </p>
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={`示例（数学）：\n算式\t答案\t选项1\t选项2\t选项3\t选项4\n3 + 5\t8\t6\t7\t8\t9\n12 - 4\t8\t6\t7\t8\t10`}
                className="min-h-[150px] max-h-[300px] text-sm font-mono"
              />
              <Button
                variant="outline"
                onClick={parseTextInput}
                className="w-full h-10 rounded-xl text-sm"
              >
                解析并预览
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* JSON Upload */}
      {method === 'json' && (
        <motion.div variants={itemVariants} className="space-y-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <FileJson className="h-5 w-5 text-gray-500" />
                <h4 className="text-sm font-bold text-gray-700">格式化数据导入</h4>
              </div>
              <p className="text-xs text-gray-400">
                粘贴完整的题库数据（适合有经验的用户）
              </p>
              <Textarea
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  setPreviewData([]);
                  setPreviewHeaders([]);
                }}
                placeholder='{"meta": { "id": "...", "name": "...", "subject": "math" }, "data": { ... }}'
                className="min-h-[150px] max-h-[300px] text-xs font-mono"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleJsonValidate}
                  className="flex-1 h-10 rounded-xl text-sm"
                >
                  验证格式
                </Button>
                <label className="flex-1">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const text = ev.target?.result as string;
                        setJsonText(text);
                        toast({ title: '文件已加载', description: file.name });
                      };
                      reader.readAsText(file);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                  <Button variant="outline" className="w-full h-10 rounded-xl text-sm" asChild>
                    <span><Upload className="h-3.5 w-3.5 mr-1" />上传文件</span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Preview Table */}
      {previewData.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                👀 数据预览
                <Badge variant="secondary" className="text-[10px]">前 {previewData.length} 行</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="overflow-x-auto max-h-48">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-2 py-1.5 text-left text-gray-500 font-medium">#</th>
                      {previewHeaders.map((h, i) => (
                        <th key={i} className="px-2 py-1.5 text-left text-gray-500 font-medium whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, ri) => (
                      <tr key={ri} className="border-t border-gray-50">
                        <td className="px-2 py-1 text-gray-400">{ri + 1}</td>
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-2 py-1 text-gray-700 whitespace-nowrap max-w-[120px] truncate">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Import Button */}
      <motion.div variants={itemVariants}>
        <Button
          onClick={handleImport}
          disabled={importing || (method === 'text' && !textInput.trim()) || (method === 'json' && !jsonText.trim())}
          className="w-full h-12 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-400 to-teal-500 text-white border-0 shadow-sm"
        >
          {importing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <Package className="h-4 w-4 mr-1" />
          )}
          {importing ? '导入中...' : '开始导入'}
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 4: 我的题库
// ═══════════════════════════════════════════════════════════════════════════════

function MyBanksTab() {
  const [banks, setBanks] = useState<BankInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchBanks = useCallback(async () => {
    try {
      const res = await fetch('/api/question-bank/list');
      const data = await res.json();
      if (data.success) {
        setBanks(data.banks);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  const handleToggle = useCallback(async (bankId: string, enabled: boolean) => {
    try {
      const res = await fetch('/api/question-bank/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankId, action: enabled ? 'enable' : 'disable' }),
      });
      const data = await res.json();
      if (data.success) {
        setBanks((prev) =>
          prev.map((b) => (b.id === bankId ? { ...b, enabled: !enabled } : b))
        );
        toast({
          title: enabled ? '已停用' : '已启用',
          description: enabled ? '做题时将不会使用这个题库' : '做题时可以使用这个题库了',
        });
      }
    } catch {
      toast({ title: '操作失败', variant: 'destructive' });
    }
  }, [toast]);

  const handleExport = useCallback(async (bank: BankInfo) => {
    try {
      const res = await fetch('/api/question-bank/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankId: bank.id }),
      });
      const data = await res.json();
      if (data.success) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${bank.name}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: '导出成功', description: `${bank.name}.json 已下载` });
      } else {
        toast({ title: '导出失败', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: '导出失败', description: '网络错误', variant: 'destructive' });
    }
  }, [toast]);

  const handleDelete = useCallback(async (bankId: string) => {
    try {
      const res = await fetch('/api/question-bank/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankId, action: 'remove' }),
      });
      const data = await res.json();
      if (data.success) {
        setBanks((prev) => prev.filter((b) => b.id !== bankId));
        toast({ title: '已删除', description: '题库已从列表中移除' });
      } else {
        toast({ title: '删除失败', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: '操作失败', variant: 'destructive' });
    }
    setDeleteDialogId(null);
  }, [toast]);

  const deleteBank = banks.find((b) => b.id === deleteDialogId);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-800">已安装的题库</h3>
          <p className="text-xs text-gray-400">共 {banks.length} 个题库</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchBanks}
          className="gap-1.5 h-9 rounded-lg"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
        </div>
      )}

      {/* Empty State */}
      {!loading && banks.length === 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500">还没有安装题库</p>
              <p className="text-xs text-gray-400 mt-1">去「题库商店」安装一些题库吧！</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Bank List */}
      {!loading && banks.map((bank) => {
        const cfg = SUBJECT_CONFIG[bank.subject] || SUBJECT_CONFIG.math;
        return (
          <motion.div key={bank.id} variants={itemVariants}>
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${cfg.bgColor} text-2xl flex-shrink-0`}>
                    {cfg.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm text-gray-800 truncate">{bank.name}</h4>
                      <Badge className={`${cfg.badgeBg} ${cfg.badgeText} text-[10px] border-0 px-1.5`}>
                        {cfg.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mb-2 line-clamp-1">{bank.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span>📋 {bank.questionCount}题</span>
                      <span>🎓 {bank.supportedGrades?.map((g) => `${g}年级`).join('、') || '未知'}</span>
                      <span>📦 {bank.source}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`switch-${bank.id}`} className="text-xs text-gray-500">
                      {bank.enabled ? '已启用' : '已停用'}
                    </Label>
                    <Switch
                      id={`switch-${bank.id}`}
                      checked={bank.enabled}
                      onCheckedChange={(checked) => handleToggle(bank.id, checked)}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleExport(bank)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-emerald-600"
                      aria-label="导出"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteDialogId(bank.id)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                      aria-label="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialogId} onOpenChange={(open) => !open && setDeleteDialogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteBank && (
                <>即将删除题库「{deleteBank.name}」，删除后将无法使用这个题库的题目。</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialogId && handleDelete(deleteDialogId)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
