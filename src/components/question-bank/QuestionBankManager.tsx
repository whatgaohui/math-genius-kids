'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Upload,
  Download,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  FileJson,
  BookOpen,
  List,
  FileCode,
  ChevronDown,
  RefreshCw,
  Package,
  Loader2,
  Info,
  AlertTriangle,
  Power,
  PowerOff,
  ExternalLink,
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import BottomNav from '@/components/math/BottomNav';

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface ValidationIssue {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

// ─── Subject Config ──────────────────────────────────────────────────────────

const SUBJECT_CONFIG: Record<string, { label: string; emoji: string; color: string; bgColor: string }> = {
  math: { label: '数学', emoji: '🧮', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  chinese: { label: '语文', emoji: '📖', color: 'text-rose-700', bgColor: 'bg-rose-50' },
  english: { label: '英语', emoji: '🔤', color: 'text-cyan-700', bgColor: 'bg-cyan-50' },
};

// ─── Template JSONs ──────────────────────────────────────────────────────────

const MATH_TEMPLATE = `{
  "meta": {
    "id": "math-custom-1",
    "name": "自定义数学题库",
    "subject": "math",
    "version": "1.0.0",
    "description": "自定义数学题库",
    "source": "教师自编"
  },
  "data": {
    "1": {
      "上册": [
        {
          "topicId": "math-1a-add10",
          "expression": "3 + 5",
          "answer": 8,
          "options": [7, 8, 9, 6],
          "difficulty": "easy",
          "type": "add"
        },
        {
          "topicId": "math-1a-add10",
          "expression": "6 + 2",
          "answer": 8,
          "options": [9, 8, 7, 10],
          "difficulty": "easy",
          "type": "add"
        }
      ],
      "下册": [
        {
          "topicId": "math-1b-add20",
          "expression": "12 + 5",
          "answer": 17,
          "options": [16, 17, 18, 15],
          "difficulty": "easy",
          "type": "add"
        }
      ]
    },
    "2": {
      "上册": [
        {
          "topicId": "math-2a-mul9",
          "expression": "3 × 4",
          "answer": 12,
          "options": [11, 12, 13, 14],
          "difficulty": "easy",
          "type": "multiply"
        }
      ]
    }
  }
}`;

const CHINESE_TEMPLATE = `{
  "meta": {
    "id": "chinese-custom-1",
    "name": "自定义语文题库",
    "subject": "chinese",
    "version": "1.0.0",
    "description": "自定义语文题库",
    "source": "教师自编"
  },
  "data": {
    "1": {
      "上册": [
        {
          "topicId": "cn-1a-pinyin",
          "mode": "recognize-pinyin",
          "prompt": "选择正确的拼音",
          "correctAnswer": "dà",
          "options": ["dà", "tài", "dè", "tǎ"],
          "difficulty": "easy"
        },
        {
          "topicId": "cn-1a-pinyin",
          "mode": "recognize-pinyin",
          "prompt": "选择正确的拼音",
          "correctAnswer": "shān",
          "options": ["sān", "shān", "shǎn", "sàn"],
          "difficulty": "easy"
        }
      ]
    },
    "2": {
      "上册": [
        {
          "topicId": "cn-2a-char",
          "mode": "recognize-char",
          "prompt": "选择正确的汉字",
          "correctAnswer": "跑",
          "options": ["跑", "泡", "炮", "抱"],
          "difficulty": "easy"
        }
      ]
    }
  }
}`;

const ENGLISH_TEMPLATE = `{
  "meta": {
    "id": "english-custom-1",
    "name": "自定义英语题库",
    "subject": "english",
    "version": "1.0.0",
    "description": "自定义英语题库",
    "source": "教师自编"
  },
  "data": {
    "1": {
      "上册": [
        {
          "topicId": "en-1a-basic",
          "mode": "word-picture",
          "word": "apple",
          "phonetic": "/ˈæpl/",
          "meaning": "苹果",
          "emoji": "🍎",
          "options": ["苹果", "香蕉", "橘子", "葡萄"],
          "difficulty": "easy"
        },
        {
          "topicId": "en-1a-basic",
          "mode": "word-picture",
          "word": "cat",
          "phonetic": "/kæt/",
          "meaning": "猫",
          "emoji": "🐱",
          "options": ["狗", "猫", "鸟", "鱼"],
          "difficulty": "easy"
        }
      ]
    },
    "3": {
      "上册": [
        {
          "topicId": "en-3a-color",
          "mode": "word-picture",
          "word": "yellow",
          "phonetic": "/ˈjeləʊ/",
          "meaning": "黄色",
          "emoji": "🟡",
          "options": ["红色", "蓝色", "黄色", "绿色"],
          "difficulty": "easy"
        }
      ]
    }
  }
}`;

// ─── TypeScript Interface Definitions ────────────────────────────────────────

const MATH_INTERFACE = `interface MathImportQuestion {
  topicId: string;        // 知识点ID，如 "math-1a-add10"
  expression: string;     // 算式，如 "3 + 5"
  answer: number | boolean; // 答案（比较题用 1/> 0/= -1/<）
  options: number[];      // 四个选项
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'add' | 'subtract' | 'multiply' | 'divide' | 'compare' | 'equation';
}`;

const CHINESE_INTERFACE = `interface ChineseImportQuestion {
  topicId: string;        // 知识点ID，如 "cn-1a-pinyin"
  mode: string;           // 练习模式（见下表）
  prompt: string;         // 题目描述
  correctAnswer: string;  // 正确答案
  options: string[];      // 四个选项
  difficulty: 'easy' | 'medium' | 'hard';
}`;

const ENGLISH_INTERFACE = `interface EnglishImportQuestion {
  topicId: string;        // 知识点ID，如 "en-1a-basic"
  mode: string;           // 练习模式（见下表）
  word: string;           // 英文单词
  phonetic: string;       // 音标
  meaning: string;        // 中文释义
  emoji: string;          // Emoji 提示
  options: string[];      // 四个选项
  difficulty: 'easy' | 'medium' | 'hard';
}`;

// ─── Naming Convention Tables ────────────────────────────────────────────────

const TOPIC_ID_RULES = [
  { prefix: 'math-', example: 'math-1a-add10', desc: '一年级上册 10以内加法' },
  { prefix: 'math-', example: 'math-2a-mul9', desc: '二年级上册 乘法口诀' },
  { prefix: 'math-', example: 'math-3b-frac', desc: '三年级下册 分数' },
  { prefix: 'cn-', example: 'cn-1a-pinyin', desc: '一年级上册 拼音' },
  { prefix: 'cn-', example: 'cn-2a-char', desc: '二年级上册 汉字' },
  { prefix: 'cn-', example: 'cn-3a-idiom', desc: '三年级上册 成语' },
  { prefix: 'en-', example: 'en-1a-basic', desc: '一年级上册 基础词汇' },
  { prefix: 'en-', example: 'en-2a-family', desc: '二年级上册 家庭词汇' },
  { prefix: 'en-', example: 'en-3a-color', desc: '三年级上册 颜色' },
];

const CHINESE_MODES_TABLE = [
  { mode: 'recognize-char', desc: '汉字识别' },
  { mode: 'recognize-pinyin', desc: '拼音识别' },
  { mode: 'word-match', desc: '词语搭配' },
  { mode: 'dictation', desc: '听写' },
  { mode: 'idiom-fill', desc: '成语填空' },
  { mode: 'antonym', desc: '反义词' },
  { mode: 'poetry-fill', desc: '古诗填空' },
  { mode: 'synonym', desc: '近义词' },
  { mode: 'sentence-fill', desc: '句子填空' },
  { mode: 'reading-comp', desc: '阅读理解' },
];

const ENGLISH_MODES_TABLE = [
  { mode: 'word-picture', desc: '看词选图' },
  { mode: 'picture-word', desc: '看图选词' },
  { mode: 'listening', desc: '听力挑战' },
  { mode: 'spelling', desc: '拼写达人' },
];

// ─── Animation ───────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

// ─── Copy Button ─────────────────────────────────────────────────────────────

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: '已复制到剪贴板', description: label || '' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: '复制失败', description: '请手动复制', variant: 'destructive' });
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? '已复制' : '复制'}
    </Button>
  );
}

// ─── Code Block ──────────────────────────────────────────────────────────────

function CodeBlock({ code, maxHeight }: { code: string; maxHeight?: string }) {
  return (
    <pre
      className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs leading-relaxed overflow-auto font-mono"
      style={{ maxHeight: maxHeight || 'max-h-80' }}
    >
      <code>{code}</code>
    </pre>
  );
}

// ─── Tab 1: Integration Guide ────────────────────────────────────────────────

function GuideTab() {
  const [openStep, setOpenStep] = useState<string | null>('step1');

  const steps = [
    {
      id: 'step1',
      title: '第一步：准备JSON数据',
      desc: '按照标准格式准备你的题库JSON文件，包含元信息和题目数据。',
    },
    {
      id: 'step2',
      title: '第二步：通过API导入',
      desc: '将JSON数据通过导入API发送到系统，系统会自动验证和注册。',
    },
    {
      id: 'step3',
      title: '第三步：自动注册到Registry',
      desc: '导入成功后，题库自动注册到 QuestionBankRegistry，立即可用。',
    },
    {
      id: 'step4',
      title: '第四步：游戏中使用',
      desc: '游戏模块会通过 Registry 获取最高优先级的题库来出题。',
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Data Flow Diagram */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">📡 数据流</h3>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {[
                { icon: FileJson, label: 'JSON 文件', bg: 'bg-amber-50', color: 'text-amber-600' },
                { icon: Upload, label: 'API 接口', bg: 'bg-cyan-50', color: 'text-cyan-600' },
                { icon: Package, label: 'Registry 注册', bg: 'bg-violet-50', color: 'text-violet-600' },
                { icon: BookOpen, label: '游戏出题', bg: 'bg-emerald-50', color: 'text-emerald-600' },
              ].map((item, i, arr) => {
                const Icon = item.icon;
                return (
                  <React.Fragment key={item.label}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg} shadow-sm`}>
                        <Icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <span className="text-[10px] font-medium text-gray-500 text-center whitespace-nowrap">
                        {item.label}
                      </span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="text-gray-300 flex-shrink-0">
                        <span className="text-lg">→</span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Steps */}
      {steps.map((step) => (
        <motion.div key={step.id} variants={itemVariants}>
          <Collapsible open={openStep === step.id} onOpenChange={(open) => setOpenStep(open ? step.id : null)}>
            <Card className="border-0 shadow-sm">
              <CollapsibleTrigger className="w-full text-left">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 flex-shrink-0">
                    <span className="text-sm">{step.id === 'step1' ? '📝' : step.id === 'step2' ? '📤' : step.id === 'step3' ? '📦' : '🎮'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-800">{step.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${openStep === step.id ? 'rotate-180' : ''}`} />
                </CardContent>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4">
                  {step.id === 'step1' && (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-600 leading-relaxed">
                        题库数据以 JSON 格式组织，包含 <code className="bg-gray-100 px-1.5 py-0.5 rounded text-amber-600 text-[11px]">meta</code>（元信息）和{' '}
                        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-amber-600 text-[11px]">data</code>（题目数据）两部分。
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-500 text-xs">•</span>
                          <span className="text-xs text-gray-600"><strong>meta</strong>：包含 id、name、subject、version 等基本信息</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-500 text-xs">•</span>
                          <span className="text-xs text-gray-600"><strong>data</strong>：按 年级 → 学期 → 题目数组 组织</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-500 text-xs">•</span>
                          <span className="text-xs text-gray-600">支持 1-6 年级，上册/下册两个学期</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        可在「📋 题库模版」标签页查看各科目的完整模板和示例。
                      </p>
                    </div>
                  )}
                  {step.id === 'step2' && (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-600 leading-relaxed">
                        将 JSON 数据通过 POST 请求发送到导入 API：
                      </p>
                      <CodeBlock code={`POST /api/question-bank/import
Content-Type: application/json

{
  "meta": { ... },
  "data": { ... }
}`} maxHeight="max-h-48" />
                      <p className="text-xs text-gray-600 leading-relaxed">
                        API 会自动验证数据结构，返回验证结果。也可以在「📥 导入题库」标签页直接粘贴或上传文件。
                      </p>
                    </div>
                  )}
                  {step.id === 'step3' && (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-600 leading-relaxed">
                        验证通过后，系统会自动创建 QuestionBank 实例并注册到 <code className="bg-gray-100 px-1.5 py-0.5 rounded text-violet-600 text-[11px]">QuestionBankRegistry</code>：
                      </p>
                      <CodeBlock code={`// 注册过程（系统自动完成）
QuestionBankRegistry.register(bank, {
  priority: 5,    // 自定义题库默认优先级
  enabled: true,  // 默认启用
});

// 之后可以获取该题库
const bank = QuestionBankRegistry.getBank('math');`} maxHeight="max-h-48" />
                      <div className="flex items-start gap-2 bg-amber-50 rounded-xl p-3">
                        <Info className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-700">
                          优先级数字越大，该题库越优先被选中。内置题库优先级为 10，自定义题库默认为 5。
                        </p>
                      </div>
                    </div>
                  )}
                  {step.id === 'step4' && (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-600 leading-relaxed">
                        游戏模块通过 Registry 获取题库，自动使用最高优先级的题库出题：
                      </p>
                      <CodeBlock code={`// 游戏中的调用方式
import { generateQuestions } from '@/lib/question-bank';

const questions = generateQuestions('math', 1, '上册', 10);
// ↑ 自动选择 math 科目中优先级最高、已启用的题库`} maxHeight="max-h-40" />
                      <p className="text-xs text-gray-600 leading-relaxed">
                        你可以在「📋 题库列表」标签页中管理已注册的题库：启用/禁用、导出、删除等。
                      </p>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </motion.div>
      ))}

      {/* Topic ID Naming Convention */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm">🏷️ TopicId 命名规范</CardTitle>
            <CardDescription className="text-xs">每个题目必须关联一个 topicId，用于知识点分类</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">前缀</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">示例</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">说明</th>
                  </tr>
                </thead>
                <tbody>
                  {TOPIC_ID_RULES.map((rule, i) => (
                    <tr key={rule.example} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-3 py-1.5">
                        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-amber-600 font-mono">{rule.prefix}</code>
                      </td>
                      <td className="px-3 py-1.5 font-mono text-gray-700">{rule.example}</td>
                      <td className="px-3 py-1.5 text-gray-600">{rule.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-start gap-2 bg-violet-50 rounded-xl p-3">
              <Info className="h-4 w-4 text-violet-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-violet-700">
                格式：<code className="font-mono bg-white/60 px-1 rounded">科目前缀-年级a/b-知识点</code>，
                其中 a = 上册，b = 下册。
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ─── Tab 2: Import ───────────────────────────────────────────────────────────

function ImportTab() {
  const [jsonText, setJsonText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [validationPassed, setValidationPassed] = useState<boolean | null>(null);
  const { toast } = useToast();

  const validateJSON = useCallback((text: string): { valid: boolean; issues: ValidationIssue[] } => {
    const issues: ValidationIssue[] = [];

    if (!text.trim()) {
      return { valid: false, issues: [{ path: '', message: '请输入JSON数据', severity: 'error' }] };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      return { valid: false, issues: [{ path: '', message: `JSON解析错误: ${(e as Error).message}`, severity: 'error' }] };
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { valid: false, issues: [{ path: '', message: '根元素必须是对象', severity: 'error' }] };
    }

    const obj = parsed as Record<string, unknown>;

    // Check meta
    if (!obj.meta || typeof obj.meta !== 'object') {
      issues.push({ path: 'meta', message: '缺少 meta 字段', severity: 'error' });
    } else {
      const meta = obj.meta as Record<string, unknown>;
      if (!meta.id || typeof meta.id !== 'string') issues.push({ path: 'meta.id', message: '缺少或无效的 id', severity: 'error' });
      if (!meta.name || typeof meta.name !== 'string') issues.push({ path: 'meta.name', message: '缺少或无效的 name', severity: 'error' });
      if (!meta.subject || !['math', 'chinese', 'english'].includes(meta.subject as string)) {
        issues.push({ path: 'meta.subject', message: 'subject 必须是 math / chinese / english', severity: 'error' });
      }
      if (!meta.version || typeof meta.version !== 'string') issues.push({ path: 'meta.version', message: '缺少或无效的 version', severity: 'warning' });
    }

    // Check data
    if (!obj.data || typeof obj.data !== 'object') {
      issues.push({ path: 'data', message: '缺少 data 字段', severity: 'error' });
    } else {
      const data = obj.data as Record<string, unknown>;
      const gradeKeys = Object.keys(data);

      if (gradeKeys.length === 0) {
        issues.push({ path: 'data', message: 'data 中没有年级数据', severity: 'error' });
      }

      for (const gradeKey of gradeKeys) {
        const grade = Number(gradeKey);
        if (isNaN(grade) || grade < 1 || grade > 6) {
          issues.push({ path: `data.${gradeKey}`, message: `年级必须为 1-6 的数字`, severity: 'error' });
          continue;
        }

        const semesterData = data[gradeKey];
        if (typeof semesterData !== 'object' || semesterData === null || Array.isArray(semesterData)) {
          issues.push({ path: `data.${gradeKey}`, message: '年级数据格式错误', severity: 'error' });
          continue;
        }

        const semesters = semesterData as Record<string, unknown>;
        for (const semKey of Object.keys(semesters)) {
          if (semKey !== '上册' && semKey !== '下册') {
            issues.push({ path: `data.${gradeKey}.${semKey}`, message: '学期必须是 上册 或 下册', severity: 'error' });
            continue;
          }

          const questions = semesters[semKey];
          if (!Array.isArray(questions)) {
            issues.push({ path: `data.${gradeKey}.${semKey}`, message: '学期数据必须是数组', severity: 'error' });
            continue;
          }

          const subject = (obj.meta as Record<string, unknown>)?.subject as string;
          questions.forEach((q: unknown, idx: number) => {
            if (typeof q !== 'object' || q === null) {
              issues.push({ path: `data.${gradeKey}.${semKey}[${idx}]`, message: '题目格式错误', severity: 'error' });
              return;
            }
            const question = q as Record<string, unknown>;
            if (!question.topicId) issues.push({ path: `data.${gradeKey}.${semKey}[${idx}].topicId`, message: '缺少 topicId', severity: 'error' });
            if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
              issues.push({ path: `data.${gradeKey}.${semKey}[${idx}].options`, message: '需要至少2个选项', severity: 'warning' });
            }
            if (!question.difficulty || !['easy', 'medium', 'hard'].includes(question.difficulty as string)) {
              issues.push({ path: `data.${gradeKey}.${semKey}[${idx}].difficulty`, message: 'difficulty 应为 easy/medium/hard', severity: 'warning' });
            }

            // Subject-specific validation
            if (subject === 'math') {
              if (!question.expression) issues.push({ path: `data.${gradeKey}.${semKey}[${idx}].expression`, message: '数学题缺少 expression', severity: 'error' });
              if (question.answer === undefined) issues.push({ path: `data.${gradeKey}.${semKey}[${idx}].answer`, message: '缺少 answer', severity: 'error' });
              if (!question.type || !['add', 'subtract', 'multiply', 'divide', 'compare', 'equation', 'mixed'].includes(question.type as string)) {
                issues.push({ path: `data.${gradeKey}.${semKey}[${idx}].type`, message: 'type 无效', severity: 'warning' });
              }
            } else if (subject === 'chinese') {
              if (!question.mode) issues.push({ path: `data.${gradeKey}.${semKey}[${idx}].mode`, message: '缺少 mode', severity: 'error' });
              if (!question.prompt) issues.push({ path: `data.${gradeKey}.${semKey}[${idx}].prompt`, message: '缺少 prompt', severity: 'warning' });
              if (!question.correctAnswer) issues.push({ path: `data.${gradeKey}.${semKey}[${idx}].correctAnswer`, message: '缺少 correctAnswer', severity: 'error' });
            } else if (subject === 'english') {
              if (!question.mode) issues.push({ path: `data.${gradeKey}.${semKey}[${idx}].mode`, message: '缺少 mode', severity: 'error' });
              if (!question.word) issues.push({ path: `data.${gradeKey}.${semKey}[${idx}].word`, message: '缺少 word', severity: 'error' });
            }
          });
        }
      }
    }

    const errors = issues.filter((i) => i.severity === 'error');
    return { valid: errors.length === 0, issues };
  }, []);

  const handleValidate = useCallback(() => {
    const result = validateJSON(jsonText);
    setValidationIssues(result.issues);
    setValidationPassed(result.valid);
  }, [jsonText, validateJSON]);

  const handleImport = useCallback(async () => {
    const result = validateJSON(jsonText);
    if (!result.valid) {
      setValidationIssues(result.issues);
      setValidationPassed(false);
      toast({ title: '验证失败', description: `发现 ${result.issues.filter((i) => i.severity === 'error').length} 个错误`, variant: 'destructive' });
      return;
    }

    setIsImporting(true);
    try {
      const res = await fetch('/api/question-bank/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonText,
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: '✅ 导入成功！',
          description: `题库「${data.bankName}」已成功注册，共 ${data.questionCount} 道题`,
        });
        setJsonText('');
        setValidationIssues([]);
        setValidationPassed(null);
      } else {
        toast({
          title: '❌ 导入失败',
          description: data.error || '未知错误',
          variant: 'destructive',
        });
      }
    } catch {
      toast({ title: '请求失败', description: '网络错误，请重试', variant: 'destructive' });
    } finally {
      setIsImporting(false);
    }
  }, [jsonText, validateJSON, toast]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast({ title: '文件格式错误', description: '请上传 .json 文件', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setJsonText(text);
      toast({ title: '文件已加载', description: file.name });
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  }, [toast]);

  const errorCount = validationIssues.filter((i) => i.severity === 'error').length;
  const warningCount = validationIssues.filter((i) => i.severity === 'warning').length;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Textarea */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm">📥 粘贴JSON数据</CardTitle>
            <CardDescription className="text-xs">粘贴完整的题库JSON，或上传 .json 文件</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <Textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setValidationPassed(null);
                setValidationIssues([]);
              }}
              placeholder='{ "meta": { ... }, "data": { ... } }'
              className="min-h-[200px] max-h-[400px] font-mono text-xs bg-gray-50 resize-y"
            />

            {/* File Upload */}
            <div className="flex items-center gap-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button variant="outline" size="sm" className="gap-1.5" asChild>
                  <span>
                    <Upload className="h-3.5 w-3.5" />
                    上传文件
                  </span>
                </Button>
              </label>

              <Button variant="outline" size="sm" onClick={handleValidate} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                验证格式
              </Button>

              <div className="flex-1" />

              {validationPassed !== null && (
                <div className="flex items-center gap-1.5">
                  {validationPassed ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-xs font-medium text-green-600">验证通过</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-xs font-medium text-red-600">
                        {errorCount} 个错误{warningCount > 0 ? `，${warningCount} 个警告` : ''}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Validation Results */}
      {validationIssues.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className={`border-0 shadow-sm ${errorCount > 0 ? 'bg-red-50/50' : 'bg-amber-50/50'}`}>
            <CardContent className="p-4">
              <h4 className="text-sm font-bold text-gray-800 mb-2">
                验证结果
                {errorCount > 0 && <Badge variant="destructive" className="ml-2 text-[10px]">{errorCount} 错误</Badge>}
                {warningCount > 0 && <Badge variant="secondary" className="ml-2 text-[10px] bg-amber-100 text-amber-700">{warningCount} 警告</Badge>}
              </h4>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {validationIssues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    {issue.severity === 'error' ? (
                      <XCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      {issue.path && (
                        <code className="text-[11px] bg-white/60 px-1 rounded text-gray-500 font-mono">{issue.path}</code>
                      )}
                      <span className="text-gray-700 ml-1">{issue.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Import Button */}
      <motion.div variants={itemVariants}>
        <Button
          onClick={handleImport}
          disabled={isImporting || !jsonText.trim()}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-md gap-2"
        >
          {isImporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              导入中...
            </>
          ) : (
            <>
              <Package className="h-4 w-4" />
              导入题库
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ─── Tab 3: Bank List ────────────────────────────────────────────────────────

function BankListTab() {
  const [banks, setBanks] = useState<BankInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [removeDialogId, setRemoveDialogId] = useState<string | null>(null);
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

  React.useEffect(() => {
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
        toast({ title: enabled ? '已禁用' : '已启用', description: `题库「${bankId}」` });
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
        a.download = `${bank.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: '导出成功', description: `${bank.name}.json` });
      } else {
        toast({ title: '导出失败', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: '导出失败', description: '网络错误', variant: 'destructive' });
    }
  }, [toast]);

  const handleRemove = useCallback(async (bankId: string) => {
    try {
      const res = await fetch('/api/question-bank/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankId, action: 'remove' }),
      });
      const data = await res.json();
      if (data.success) {
        setBanks((prev) => prev.filter((b) => b.id !== bankId));
        toast({ title: '已删除', description: `题库「${bankId}」已从注册表中移除` });
      } else {
        toast({ title: '删除失败', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: '操作失败', variant: 'destructive' });
    }
    setRemoveDialogId(null);
  }, [toast]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Refresh */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800">
          已注册题库 ({banks.length})
        </h3>
        <Button variant="outline" size="sm" onClick={fetchBanks} className="gap-1.5">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {/* Bank Cards */}
      {!loading && banks.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">暂无注册的题库</p>
            <p className="text-xs text-gray-400 mt-1">请先导入题库数据</p>
          </CardContent>
        </Card>
      )}

      {!loading && banks.map((bank) => {
        const config = SUBJECT_CONFIG[bank.subject] || SUBJECT_CONFIG.math;
        return (
          <motion.div key={bank.id} variants={itemVariants}>
            <Card className={`border-0 shadow-sm transition-all ${!bank.enabled ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Subject Icon */}
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${config.bgColor} shadow-sm flex-shrink-0`}>
                    <span className="text-lg">{config.emoji}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-gray-800 truncate">{bank.name}</h4>
                      <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                        v{bank.version}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-2">
                      <span>📁 {bank.id}</span>
                      <span>📊 {bank.questionCount} 题</span>
                      <span>⭐ 优先级 {bank.priority}</span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1">{bank.description}</p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {bank.supportedGrades.map((g) => (
                        <Badge key={g} variant="outline" className="text-[10px] px-1.5 py-0">
                          {g}年级
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Switch
                      checked={bank.enabled}
                      onCheckedChange={(checked) => handleToggle(bank.id, checked)}
                    />
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleExport(bank)}>
                        <Download className="h-3.5 w-3.5 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => setRemoveDialogId(bank.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={!!removeDialogId} onOpenChange={(open) => !open && setRemoveDialogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除题库？</AlertDialogTitle>
            <AlertDialogDescription>
              题库「{removeDialogId}」将从注册表中永久移除，此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeDialogId && handleRemove(removeDialogId)}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

// ─── Tab 4: Templates ────────────────────────────────────────────────────────

function TemplatesTab() {
  const [openSubject, setOpenSubject] = useState<string | null>('math');

  const subjects = [
    {
      id: 'math',
      title: '🧮 数学题库模版',
      iface: MATH_INTERFACE,
      template: MATH_TEMPLATE,
      modes: [
        { mode: 'add', desc: '加法' },
        { mode: 'subtract', desc: '减法' },
        { mode: 'multiply', desc: '乘法' },
        { mode: 'divide', desc: '除法' },
        { mode: 'compare', desc: '比较大小' },
        { mode: 'equation', desc: '方程' },
      ],
    },
    {
      id: 'chinese',
      title: '📖 语文题库模版',
      iface: CHINESE_INTERFACE,
      template: CHINESE_TEMPLATE,
      modes: CHINESE_MODES_TABLE,
    },
    {
      id: 'english',
      title: '🔤 英语题库模版',
      iface: ENGLISH_INTERFACE,
      template: ENGLISH_TEMPLATE,
      modes: ENGLISH_MODES_TABLE,
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Difficulty Guide */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-2">🎯 难度等级说明</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { level: 'easy', label: '简单', desc: '基础知识点', color: 'bg-green-50 text-green-700 border-green-200', emoji: '🌱' },
                { level: 'medium', label: '中等', desc: '综合应用', color: 'bg-amber-50 text-amber-700 border-amber-200', emoji: '🌿' },
                { level: 'hard', label: '困难', desc: '拓展提升', color: 'bg-rose-50 text-rose-700 border-rose-200', emoji: '🌳' },
              ].map((item) => (
                <div key={item.level} className={`rounded-xl border p-3 ${item.color}`}>
                  <div className="text-center">
                    <span className="text-lg">{item.emoji}</span>
                    <p className="text-xs font-bold mt-1">{item.label}</p>
                    <p className="text-[10px] mt-0.5 opacity-70">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subject Templates */}
      {subjects.map((subject) => (
        <motion.div key={subject.id} variants={itemVariants}>
          <Collapsible open={openSubject === subject.id} onOpenChange={(open) => setOpenSubject(open ? subject.id : null)}>
            <Card className="border-0 shadow-sm">
              <CollapsibleTrigger className="w-full text-left">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${(SUBJECT_CONFIG[subject.id] || SUBJECT_CONFIG.math).bgColor} shadow-sm flex-shrink-0`}>
                    <span className="text-base">{(SUBJECT_CONFIG[subject.id] || SUBJECT_CONFIG.math).emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-800">{subject.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{subject.modes.length} 种题型模式</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${openSubject === subject.id ? 'rotate-180' : ''}`} />
                </CardContent>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-4">
                  {/* Interface Definition */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-xs font-bold text-gray-600">📐 TypeScript 接口</h5>
                      <CopyButton text={subject.iface} label="接口定义已复制" />
                    </div>
                    <CodeBlock code={subject.iface} maxHeight="max-h-40" />
                  </div>

                  {/* JSON Example */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-xs font-bold text-gray-600">📋 JSON 完整示例</h5>
                      <CopyButton text={subject.template} label="JSON模板已复制" />
                    </div>
                    <CodeBlock code={subject.template} maxHeight="max-h-72" />
                  </div>

                  {/* Modes Table */}
                  <div>
                    <h5 className="text-xs font-bold text-gray-600 mb-2">🎮 练习模式</h5>
                    <div className="rounded-xl border overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">mode 值</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">说明</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subject.modes.map((m, i) => (
                            <tr key={m.mode} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                              <td className="px-3 py-1.5">
                                <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-amber-600">{m.mode}</code>
                              </td>
                              <td className="px-3 py-1.5 text-gray-600">{m.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function QuestionBankManager() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 via-violet-50/20 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-16 h-56 w-56 rounded-full bg-violet-200/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-16 h-64 w-64 rounded-full bg-amber-200/10 blur-3xl" />

      <motion.main
        className="relative z-10 mx-auto max-w-lg px-4 pb-24 pt-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => useGameStore.getState().setCurrentView('settings')}
            className="gap-1 mb-2 -ml-2 text-gray-500"
          >
            <ArrowLeft className="h-4 w-4" />
            返回设置
          </Button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            📦 题库管理
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            导入、管理和导出自定义题库
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="guide" className="w-full">
            <TabsList className="w-full h-auto p-1 bg-white shadow-sm rounded-2xl mb-4">
              <TabsTrigger
                value="guide"
                className="flex-1 gap-1 rounded-xl py-2.5 text-xs data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">对接</span>指南
              </TabsTrigger>
              <TabsTrigger
                value="import"
                className="flex-1 gap-1 rounded-xl py-2.5 text-xs data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700"
              >
                <Upload className="h-3.5 w-3.5" />
                导入题库
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className="flex-1 gap-1 rounded-xl py-2.5 text-xs data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700"
              >
                <List className="h-3.5 w-3.5" />
                题库列表
              </TabsTrigger>
              <TabsTrigger
                value="templates"
                className="flex-1 gap-1 rounded-xl py-2.5 text-xs data-[state=active]:bg-cyan-100 data-[state=active]:text-cyan-700"
              >
                <FileCode className="h-3.5 w-3.5" />
                模版
              </TabsTrigger>
            </TabsList>

            <TabsContent value="guide" className="mt-0">
              <GuideTab />
            </TabsContent>

            <TabsContent value="import" className="mt-0">
              <ImportTab />
            </TabsContent>

            <TabsContent value="list" className="mt-0">
              <BankListTab />
            </TabsContent>

            <TabsContent value="templates" className="mt-0">
              <TemplatesTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.main>

      <BottomNav />
    </div>
  );
}
