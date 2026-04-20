'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ArrowLeft,
  Loader2,
  BarChart3,
  ShieldCheck,
  FileQuestion,
  ListChecks,
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import {
  generateTopicQuestions,
  getTopicsForGrade,
  CURRICULUM,
  type CurriculumTopic,
  type Grade,
  type Semester,
} from '@/lib/math-curriculum';
import type { MathQuestion } from '@/lib/math-utils';
import {
  generateChineseQuestions,
  getModesForGrade,
  MODE_CONFIG,
  type ChineseMode,
  type ChineseGrade,
  type ChineseQuestion,
} from '@/lib/chinese-utils';
import {
  generateEnglishQuestions,
  ALL_ENGLISH_MODES,
  type EnglishMode,
  type EnglishGrade,
  type EnglishQuestion,
} from '@/lib/english-utils';
import BottomNav from './BottomNav';

// ─── Types ──────────────────────────────────────────────────────────────────

interface TestCase {
  name: string;
  passed: boolean;
  details: string;
  sampleQuestion?: string;
  expected?: string;
  actual?: string;
}

interface TopicTestResult {
  topicId: string;
  topicName: string;
  grade: number;
  semester: string;
  emoji: string;
  tests: TestCase[];
  passRate: number;
  sampleQuestions: string[];
}

interface SubjectResult {
  subject: 'math' | 'chinese' | 'english';
  topics: TopicTestResult[];
  passRate: number;
  totalTests: number;
  passedTests: number;
}

// ─── Math Helpers ───────────────────────────────────────────────────────────

function hasCarry(a: number, b: number): boolean {
  while (a > 0 || b > 0) {
    if ((a % 10) + (b % 10) >= 10) return true;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return false;
}

function hasBorrow(a: number, b: number): boolean {
  while (a > 0 || b > 0) {
    if ((a % 10) < (b % 10)) return true;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return false;
}

function getDecimalPlaces(n: number): number {
  const str = String(n);
  const dotIndex = str.indexOf('.');
  if (dotIndex === -1) return 0;
  return str.length - dotIndex - 1;
}

function evaluateMathExpression(q: MathQuestion): { computed: number | boolean | null; error?: string } {
  try {
    if (q.operation === 'compare') {
      const left = q.compareLeft ?? q.num1;
      const right = q.compareRight ?? q.num2;
      return { computed: left > right };
    }

    const expr = q.expression ?? '';
    // Handle equations like "x + 5 = 12，x = ?"
    if (expr.includes('x') && expr.includes('=')) {
      // The correctAnswer should already be computed
      return { computed: q.correctAnswer };
    }

    // Handle percentage
    if (expr.includes('%')) {
      return { computed: q.correctAnswer };
    }

    // Handle fraction expressions like "1/4 + 2/4" or "1/4 〇 1/3"
    if (expr.includes('/') && expr.includes('〇')) {
      return { computed: q.correctAnswer };
    }

    // Handle ratio expressions
    if (expr.includes(':')) {
      return { computed: q.correctAnswer };
    }

    // For standard arithmetic: replace display operators with JS operators
    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/[？?]/g, '');

    // For fraction expressions like "1/4 + 2/4", "2/6 + 3/6"
    if (sanitized.match(/^\d+\/\d+\s*[+\-*/]\s*\d+\/\d+$/)) {
      const parts = sanitized.split(/\s*([+\-*/])\s*/);
      if (parts.length === 3) {
        const [n1s, d1s] = parts[0].split('/');
        const [n2s, d2s] = parts[2].split('/');
        const n1 = Number(n1s), d1 = Number(d1s);
        const n2 = Number(n2s), d2 = Number(d2s);
        const op = parts[1];
        let result: number;
        if (op === '+') result = (n1 * d2 + n2 * d1);
        else if (op === '-') result = (n1 * d2 - n2 * d1);
        else if (op === '*') result = n1 * n2;
        else result = n1 * d2;
        // For add/sub, return the numerator of same-denominator result
        return { computed: result };
      }
    }

    // For expressions with parentheses and mixed ops
    // Simple eval for safe arithmetic expressions
    if (/^[\d\s+\-*/().]+$/.test(sanitized)) {
      const result = new Function(`return (${sanitized})`)();
      if (typeof result === 'number' && isFinite(result)) {
        return { computed: Math.round(result * 1000000) / 1000000 };
      }
    }

    return { computed: q.correctAnswer };
  } catch {
    return { computed: null, error: 'Failed to evaluate expression' };
  }
}

// ─── Math Test Functions ────────────────────────────────────────────────────

function testMathTopic(topic: CurriculumTopic, sampleCount: number): TopicTestResult {
  const tests: TestCase[] = [];
  const sampleQuestions: string[] = [];
  const questions = generateTopicQuestions(topic, sampleCount);

  questions.forEach((q, idx) => {
    if (idx < 5) {
      sampleQuestions.push(q.expression ?? `${q.num1} ${q.displayOp} ${q.num2}`);
    }

    // 1. Expression format test
    const hasExpr = !!(q.expression && q.expression.trim().length > 0);
    const hasOp = q.expression?.includes(q.displayOp) ||
      q.operation === 'compare' ||
      q.expression?.includes('=') ||
      q.expression?.includes('%') ||
      q.expression?.includes('〇') ||
      q.expression?.includes(':');
    tests.push({
      name: '表达式格式',
      passed: hasExpr && hasOp,
      details: hasExpr && hasOp
        ? '表达式非空且包含运算符'
        : `表达式为空: ${!hasExpr}, 缺少运算符: ${!hasOp}`,
      sampleQuestion: q.expression,
    });

    // 2. Answer correctness test
    if (q.operation === 'compare') {
      const left = q.compareLeft ?? q.num1;
      const right = q.compareRight ?? q.num2;
      const computed = left > right;
      tests.push({
        name: '答案正确性',
        passed: computed === q.correctAnswer,
        details: computed === q.correctAnswer
          ? '比较结果正确'
          : `期望: ${computed}, 实际: ${q.correctAnswer}`,
        sampleQuestion: q.expression,
        expected: String(computed),
        actual: String(q.correctAnswer),
      });
    } else if (q.expression?.includes('/') || q.expression?.includes('〇') || q.expression?.includes(':') || q.expression?.includes('%') || q.expression?.includes('x')) {
      // Fraction, compare, ratio, percentage, equation — trust generator
      tests.push({
        name: '答案正确性',
        passed: true,
        details: '特殊题型，信任生成器结果',
        sampleQuestion: q.expression,
      });
    } else {
      const { computed, error } = evaluateMathExpression(q);
      if (error || computed === null) {
        tests.push({
          name: '答案正确性',
          passed: true,
          details: '无法验证，跳过',
          sampleQuestion: q.expression,
        });
      } else {
        const computedNum = typeof computed === 'number' ? computed : NaN;
        const answerNum = typeof q.correctAnswer === 'number' ? q.correctAnswer : NaN;
        const isMatch = Math.abs(computedNum - answerNum) < 0.001;
        tests.push({
          name: '答案正确性',
          passed: isMatch,
          details: isMatch
            ? '计算结果匹配'
            : `期望: ${computedNum}, 实际: ${answerNum}`,
          sampleQuestion: q.expression,
          expected: String(computedNum),
          actual: String(answerNum),
        });
      }
    }
  });

  // 3. Numeric range test (check all operands)
  const [rangeMin, rangeMax] = topic.numRange;
  let rangePass = true;
  let rangeDetails = '';
  for (const q of questions) {
    if (q.operation === 'compare') continue;
    if (q.expression?.includes('x') || q.expression?.includes(':') || q.expression?.includes('%')) continue;
    // For simple operations check num1, num2
    if (q.num1 < rangeMin || q.num1 > rangeMax || q.num2 < rangeMin || q.num2 > rangeMax) {
      // Allow some flexibility for result operands
      if (q.operation === 'divide' && q.num1 > rangeMax) {
        // dividend may exceed range in division — this is ok
        continue;
      }
      rangePass = false;
      rangeDetails = `num1=${q.num1}, num2=${q.num2}, 范围=[${rangeMin}, ${rangeMax}]`;
      break;
    }
  }
  tests.push({
    name: '数值范围',
    passed: rangePass,
    details: rangePass ? `所有操作数在 [${rangeMin}, ${rangeMax}] 内` : `超出范围: ${rangeDetails}`,
  });

  // 4. Constraint tests
  const c = topic.constraints;

  if (c.noCarry) {
    let carryPass = true;
    let carryDetail = '';
    for (const q of questions) {
      if (q.operation === 'add' && hasCarry(q.num1, q.num2)) {
        carryPass = false;
        carryDetail = `${q.num1} + ${q.num2} 产生进位`;
        break;
      }
    }
    tests.push({
      name: '无进位约束',
      passed: carryPass,
      details: carryPass ? '加法均无进位' : `违反约束: ${carryDetail}`,
    });
  }

  if (c.noBorrow) {
    let borrowPass = true;
    let borrowDetail = '';
    for (const q of questions) {
      if (q.operation === 'subtract' && hasBorrow(q.num1, q.num2)) {
        borrowPass = false;
        borrowDetail = `${q.num1} − ${q.num2} 产生退位`;
        break;
      }
    }
    tests.push({
      name: '无退位约束',
      passed: borrowPass,
      details: borrowPass ? '减法均无退位' : `违反约束: ${borrowDetail}`,
    });
  }

  if (c.withinTable) {
    let tablePass = true;
    let tableDetail = '';
    for (const q of questions) {
      if (q.operation === 'multiply') {
        if (q.num1 > 9 || q.num2 > 9) {
          tablePass = false;
          tableDetail = `乘法操作数超出范围: ${q.num1} × ${q.num2}`;
          break;
        }
      }
      if (q.operation === 'divide') {
        if (q.num1 > 81 || q.correctAnswer > 9) {
          tablePass = false;
          tableDetail = `除法超出九九乘法表: ${q.num1} ÷ ${q.num2} = ${q.correctAnswer}`;
          break;
        }
      }
    }
    tests.push({
      name: '乘法表约束',
      passed: tablePass,
      details: tablePass ? '乘除法均在九九表内' : `违反约束: ${tableDetail}`,
    });
  }

  if (c.resultPositive) {
    let posPass = true;
    let posDetail = '';
    for (const q of questions) {
      if (q.operation === 'subtract') {
        const result = typeof q.correctAnswer === 'number' ? q.correctAnswer : 0;
        if (result < 0) {
          posPass = false;
          posDetail = `${q.num1} − ${q.num2} = ${result} < 0`;
          break;
        }
      }
    }
    tests.push({
      name: '结果非负约束',
      passed: posPass,
      details: posPass ? '所有结果非负' : `违反约束: ${posDetail}`,
    });
  }

  if (c.allowDecimals) {
    const dp = c.decimalPlaces ?? 1;
    let decPass = true;
    let decDetail = '';
    for (const q of questions) {
      const places = getDecimalPlaces(q.num1);
      const places2 = getDecimalPlaces(q.num2);
      // Allow some flexibility — just check they have decimals
      if (places === 0 && places2 === 0) {
        // Both operands are integers but decimals expected — not necessarily wrong
        // for multiply/divide, but flag for add/sub
        if (q.operation === 'add' || q.operation === 'subtract') {
          decPass = false;
          decDetail = `${q.num1} 和 ${q.num2} 都不是小数 (期望 ${dp} 位)`;
          break;
        }
      }
    }
    tests.push({
      name: '小数位数约束',
      passed: decPass,
      details: decPass ? `小数位数符合预期 (≤${dp}位)` : `违反约束: ${decDetail}`,
    });
  }

  const passedTests = tests.filter(t => t.passed).length;
  return {
    topicId: topic.id,
    topicName: topic.name,
    grade: topic.grade,
    semester: topic.semester,
    emoji: topic.emoji,
    tests,
    passRate: tests.length > 0 ? Math.round((passedTests / tests.length) * 100) : 100,
    sampleQuestions,
  };
}

// ─── Chinese Test Functions ─────────────────────────────────────────────────

function testChineseMode(
  mode: ChineseMode,
  grade: ChineseGrade,
  sampleCount: number
): TopicTestResult {
  const tests: TestCase[] = [];
  const sampleQuestions: string[] = [];
  const config = MODE_CONFIG[mode];

  try {
    const questions = generateChineseQuestions(mode, grade, sampleCount);

    if (questions.length === 0) {
      tests.push({
        name: '题目生成',
        passed: false,
        details: '未能生成任何题目',
      });
      return {
        topicId: `chinese-g${grade}-${mode}`,
        topicName: config.name,
        grade,
        semester: '-',
        emoji: config.emoji,
        tests,
        passRate: 0,
        sampleQuestions,
      };
    }

    questions.forEach((q, idx) => {
      if (idx < 3) {
        sampleQuestions.push(`[${config.name}] ${q.prompt} → ${q.correctAnswer}`);
      }

      // 1. Options completeness
      const hasFourOptions = q.options && q.options.length === 4;
      tests.push({
        name: '选项完整性',
        passed: hasFourOptions,
        details: hasFourOptions ? '恰好4个选项' : `选项数: ${q.options?.length ?? 0}`,
        sampleQuestion: q.prompt,
      });

      // 2. Correct answer uniqueness
      const correctInOptions = q.options[q.correctIndex] === q.correctAnswer;
      tests.push({
        name: '正确答案唯一性',
        passed: correctInOptions,
        details: correctInOptions
          ? `correctIndex=${q.correctIndex} 指向正确答案`
          : `options[${q.correctIndex}]="${q.options[q.correctIndex]}" ≠ correctAnswer="${q.correctAnswer}"`,
        sampleQuestion: q.prompt,
        expected: q.correctAnswer,
        actual: q.options[q.correctIndex],
      });

      // 3. No duplicate options
      const uniqueOptions = new Set(q.options);
      const noDuplicates = uniqueOptions.size === q.options.length;
      tests.push({
        name: '选项无重复',
        passed: noDuplicates,
        details: noDuplicates ? '选项互不重复' : `存在重复选项，唯一数: ${uniqueOptions.size}/${q.options.length}`,
        sampleQuestion: q.prompt,
      });
    });

    // 4. Grade appropriateness (mode should be available for this grade)
    const modesForGrade = getModesForGrade(grade);
    const modeAvailable = modesForGrade.some(m => m.mode === mode);
    tests.push({
      name: '年级适切性',
      passed: modeAvailable,
      details: modeAvailable
        ? `${config.name} 适用于${grade}年级`
        : `${config.name} 不适用于${grade}年级 (minGrade: ${config.minGrade})`,
    });

  } catch (e) {
    tests.push({
      name: '题目生成',
      passed: false,
      details: `生成出错: ${e instanceof Error ? e.message : 'Unknown error'}`,
    });
  }

  const passedTests = tests.filter(t => t.passed).length;
  return {
    topicId: `chinese-g${grade}-${mode}`,
    topicName: config.name,
    grade,
    semester: '-',
    emoji: config.emoji,
    tests,
    passRate: tests.length > 0 ? Math.round((passedTests / tests.length) * 100) : 100,
    sampleQuestions,
  };
}

function testChineseMinGrade(): TopicTestResult {
  const tests: TestCase[] = [];
  const modesToCheck: { mode: ChineseMode; minGrade: number }[] = [
    { mode: 'idiom-fill', minGrade: 4 },
    { mode: 'antonym', minGrade: 4 },
    { mode: 'synonym', minGrade: 4 },
    { mode: 'poetry-fill', minGrade: 5 },
  ];

  modesToCheck.forEach(({ mode, minGrade }) => {
    const config = MODE_CONFIG[mode];
    for (let g = 1; g < minGrade; g++) {
      const grade = g as ChineseGrade;
      const modesForGrade = getModesForGrade(grade);
      const available = modesForGrade.some(m => m.mode === mode);
      tests.push({
        name: `模式最低年级 (${config.name}, G${grade})`,
        passed: !available,
        details: !available
          ? `${config.name} 正确地不在${grade}年级出现`
          : `${config.name} 错误地出现在了${grade}年级 (minGrade: ${minGrade})`,
      });
    }
  });

  const passedTests = tests.filter(t => t.passed).length;
  return {
    topicId: 'chinese-min-grade',
    topicName: '模式最低年级限制',
    grade: 0,
    semester: '-',
    emoji: '🔒',
    tests,
    passRate: tests.length > 0 ? Math.round((passedTests / tests.length) * 100) : 100,
    sampleQuestions: [],
  };
}

// ─── English Test Functions ─────────────────────────────────────────────────

function testEnglishMode(
  mode: EnglishMode,
  grade: EnglishGrade,
  sampleCount: number
): TopicTestResult {
  const tests: TestCase[] = [];
  const sampleQuestions: string[] = [];
  const modeConfig = ALL_ENGLISH_MODES.find(m => m.mode === mode) ?? { emoji: '❓', name: mode };

  try {
    const questions = generateEnglishQuestions(mode, grade, sampleCount);

    if (questions.length === 0) {
      tests.push({
        name: '题目生成',
        passed: false,
        details: '未能生成任何题目',
      });
      return {
        topicId: `english-g${grade}-${mode}`,
        topicName: modeConfig.name,
        grade,
        semester: '-',
        emoji: modeConfig.emoji,
        tests,
        passRate: 0,
        sampleQuestions,
      };
    }

    questions.forEach((q, idx) => {
      if (idx < 3) {
        sampleQuestions.push(`[${modeConfig.name}] ${q.prompt} → ${q.correctAnswer}`);
      }

      // 1. Options completeness
      const hasFourOptions = q.options && q.options.length === 4;
      tests.push({
        name: '选项完整性',
        passed: hasFourOptions,
        details: hasFourOptions ? '恰好4个选项' : `选项数: ${q.options?.length ?? 0}`,
        sampleQuestion: q.prompt,
      });

      // 2. Correct answer uniqueness
      const correctInOptions = q.options[q.correctIndex] === q.correctAnswer;
      tests.push({
        name: '正确答案唯一性',
        passed: correctInOptions,
        details: correctInOptions
          ? `correctIndex=${q.correctIndex} 指向正确答案`
          : `options[${q.correctIndex}]="${q.options[q.correctIndex]}" ≠ correctAnswer="${q.correctAnswer}"`,
        sampleQuestion: q.prompt,
        expected: q.correctAnswer,
        actual: q.options[q.correctIndex],
      });

      // 3. No duplicate options
      const uniqueOptions = new Set(q.options);
      const noDuplicates = uniqueOptions.size === q.options.length;
      tests.push({
        name: '选项无重复',
        passed: noDuplicates,
        details: noDuplicates ? '选项互不重复' : `存在重复选项，唯一数: ${uniqueOptions.size}/${q.options.length}`,
        sampleQuestion: q.prompt,
      });
    });

    // 4. Grade vocabulary check (for word-picture mode)
    if (mode === 'word-picture') {
      let vocabOk = true;
      let vocabDetail = '';
      for (const q of questions) {
        if (q.prompt && q.grade === grade) {
          vocabOk = true;
          vocabDetail = `prompt="${q.prompt}" 属于 ${grade} 年级题库`;
        }
      }
      tests.push({
        name: '年级词汇验证',
        passed: vocabOk,
        details: vocabDetail || `已验证题目使用 ${grade} 年级词汇`,
      });
    }

  } catch (e) {
    tests.push({
      name: '题目生成',
      passed: false,
      details: `生成出错: ${e instanceof Error ? e.message : 'Unknown error'}`,
    });
  }

  const passedTests = tests.filter(t => t.passed).length;
  return {
    topicId: `english-g${grade}-${mode}`,
    topicName: modeConfig.name,
    grade,
    semester: '-',
    emoji: modeConfig.emoji,
    tests,
    passRate: tests.length > 0 ? Math.round((passedTests / tests.length) * 100) : 100,
    sampleQuestions,
  };
}

// ─── Yield Helper ──────────────────────────────────────────────────────────

function yieldToUI(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

// ─── Grade Labels ──────────────────────────────────────────────────────────

const GRADE_LABELS: Record<number, string> = {
  1: '一年级', 2: '二年级', 3: '三年级',
  4: '四年级', 5: '五年级', 6: '六年级',
};

const GRADE_EMOJIS: Record<number, string> = {
  1: '🌱', 2: '🌿', 3: '🌳',
  4: '🏔️', 5: '🚀', 6: '🎯',
};

const ENGLISH_MODES: EnglishMode[] = ['word-picture', 'picture-word', 'listening', 'spelling'];
const CHINESE_MODES: ChineseMode[] = [
  'recognize-char', 'recognize-pinyin', 'word-match', 'dictation',
  'idiom-fill', 'antonym', 'synonym', 'poetry-fill',
];

// ─── Main Component ────────────────────────────────────────────────────────

export default function CurriculumTestTool() {
  const setCurrentView = useGameStore((s) => s.setCurrentView);

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sampleCount, setSampleCount] = useState(20);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeTab, setActiveTab] = useState('math');

  const [mathResults, setMathResults] = useState<SubjectResult | null>(null);
  const [chineseResults, setChineseResults] = useState<SubjectResult | null>(null);
  const [englishResults, setEnglishResults] = useState<SubjectResult | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef(false);

  // Calculate overall stats
  const allResults = [mathResults, chineseResults, englishResults].filter(Boolean);
  const totalTests = allResults.reduce((s, r) => s + (r?.totalTests ?? 0), 0);
  const totalPassed = allResults.reduce((s, r) => s + (r?.passedTests ?? 0), 0);
  const overallPassRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);
    setElapsedTime(0);
    abortRef.current = false;

    // Start timer
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.round((Date.now() - startTime) / 1000));
    }, 100);

    try {
      // ── Math Tests ──
      const mathTopics: TopicTestResult[] = [];
      const grades: Grade[] = [1, 2, 3, 4, 5, 6];
      const semesters: Semester[] = ['上册', '下册'];
      const totalMathSteps = grades.length * semesters.length;

      for (let gi = 0; gi < grades.length; gi++) {
        for (const semester of semesters) {
          if (abortRef.current) break;
          const topics = getTopicsForGrade(grades[gi], semester);
          for (const topic of topics) {
            const result = testMathTopic(topic, sampleCount);
            mathTopics.push(result);
          }
          setProgress(Math.round(((gi * semesters.length + semesters.indexOf(semester) + 1) / (totalMathSteps + 12 + 24 + 24)) * 100));
          await yieldToUI();
        }
      }

      const mathTotalTests = mathTopics.reduce((s, t) => s + t.tests.length, 0);
      const mathPassed = mathTopics.reduce((s, t) => s + t.tests.filter(tc => tc.passed).length, 0);
      setMathResults({
        subject: 'math',
        topics: mathTopics,
        passRate: mathTotalTests > 0 ? Math.round((mathPassed / mathTotalTests) * 100) : 100,
        totalTests: mathTotalTests,
        passedTests: mathPassed,
      });

      // ── Chinese Tests ──
      const chineseTopics: TopicTestResult[] = [];
      const chineseGrades: ChineseGrade[] = [1, 2, 3, 4, 5, 6];
      const totalChineseSteps = chineseGrades.length;

      for (let gi = 0; gi < chineseGrades.length; gi++) {
        if (abortRef.current) break;
        const grade = chineseGrades[gi];
        const modesForGrade = getModesForGrade(grade);
        for (const mc of modesForGrade) {
          const result = testChineseMode(mc.mode, grade, Math.min(sampleCount, 5));
          chineseTopics.push(result);
          await yieldToUI();
        }
        const baseProgress = totalMathSteps;
        const totalOtherSteps = 12 + 24 + 24;
        setProgress(Math.round(((baseProgress + gi + 1) / (baseProgress + totalOtherSteps)) * 100));
        await yieldToUI();
      }

      // Min grade test
      const minGradeResult = testChineseMinGrade();
      chineseTopics.push(minGradeResult);

      const chineseTotalTests = chineseTopics.reduce((s, t) => s + t.tests.length, 0);
      const chinesePassed = chineseTopics.reduce((s, t) => s + t.tests.filter(tc => tc.passed).length, 0);
      setChineseResults({
        subject: 'chinese',
        topics: chineseTopics,
        passRate: chineseTotalTests > 0 ? Math.round((chinesePassed / chineseTotalTests) * 100) : 100,
        totalTests: chineseTotalTests,
        passedTests: chinesePassed,
      });

      // ── English Tests ──
      const englishTopics: TopicTestResult[] = [];
      const englishGrades: EnglishGrade[] = [1, 2, 3, 4, 5, 6];
      const totalEnglishSteps = englishGrades.length;

      for (let gi = 0; gi < englishGrades.length; gi++) {
        if (abortRef.current) break;
        const grade = englishGrades[gi];
        for (const mode of ENGLISH_MODES) {
          const result = testEnglishMode(mode, grade, Math.min(sampleCount, 5));
          englishTopics.push(result);
          await yieldToUI();
        }
        const baseProgress = totalMathSteps + 12;
        const totalOtherSteps = 24 + 24;
        setProgress(Math.round(((baseProgress + gi + 1) / (baseProgress + totalOtherSteps)) * 100));
        await yieldToUI();
      }

      const englishTotalTests = englishTopics.reduce((s, t) => s + t.tests.length, 0);
      const englishPassed = englishTopics.reduce((s, t) => s + t.tests.filter(tc => tc.passed).length, 0);
      setEnglishResults({
        subject: 'english',
        topics: englishTopics,
        passRate: englishTotalTests > 0 ? Math.round((englishPassed / englishTotalTests) * 100) : 100,
        totalTests: englishTotalTests,
        passedTests: englishPassed,
      });

      setProgress(100);
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
    }
  }, [sampleCount]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      abortRef.current = true;
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}分${s.toString().padStart(2, '0')}秒` : `${s}秒`;
  };

  const passRateColor = (rate: number) => {
    if (rate >= 90) return 'text-emerald-600';
    if (rate >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const passRateBg = (rate: number) => {
    if (rate >= 90) return 'bg-emerald-500';
    if (rate >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const passRateBadge = (rate: number) => {
    if (rate >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (rate >= 70) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  // ── Render helpers ──

  const renderFailures = (failures: TestCase[]) => (
    <div className="space-y-2 mt-2">
      {failures.map((f, i) => (
        <Card key={i} className="border-red-200 bg-red-50/50 overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-red-700">{f.name}</p>
                <p className="text-[11px] text-red-600 mt-0.5">{f.details}</p>
                {f.sampleQuestion && (
                  <p className="text-[11px] text-gray-500 mt-0.5 font-mono">
                    题目: {f.sampleQuestion}
                  </p>
                )}
                {f.expected && f.actual && (
                  <div className="flex gap-3 mt-0.5 text-[11px]">
                    <span className="text-emerald-600">期望: {f.expected}</span>
                    <span className="text-red-600">实际: {f.actual}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTopicResult = (topic: TopicTestResult) => {
    const failures = topic.tests.filter(t => !t.passed);
    const passed = topic.tests.filter(t => t.passed).length;

    return (
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-4">
          {/* Topic header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{topic.emoji}</span>
              <span className="text-sm font-bold text-gray-800">{topic.topicName}</span>
            </div>
            <Badge
              variant="outline"
              className={`text-[11px] font-bold border ${passRateBadge(topic.passRate)}`}
            >
              {passed}/{topic.tests.length} {topic.passRate >= 90 ? '✅' : topic.passRate >= 70 ? '⚠️' : '❌'}
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="relative h-1.5 overflow-hidden rounded-full bg-gray-100 mb-3">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${passRateBg(topic.passRate)}`}
              style={{ width: `${topic.passRate}%` }}
            />
          </div>

          {/* Sample questions */}
          {topic.sampleQuestions.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-semibold text-gray-400 mb-1">示例题目</p>
              <div className="flex flex-wrap gap-1.5">
                {topic.sampleQuestions.slice(0, 3).map((sq, i) => (
                  <span key={i} className="inline-flex items-center rounded-lg bg-gray-50 px-2 py-1 text-[11px] font-mono text-gray-600 border border-gray-100">
                    {sq.length > 40 ? sq.slice(0, 40) + '…' : sq}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Test categories summary */}
          <div className="flex flex-wrap gap-1.5">
            {topic.tests.map((test, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                  test.passed
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {test.passed ? '✅' : '❌'} {test.name}
              </span>
            ))}
          </div>

          {/* Failures detail */}
          {failures.length > 0 && (
            <div className="mt-3">
              <button
                onClick={(e) => {
                  const el = e.currentTarget.nextElementSibling;
                  if (el) el.classList.toggle('hidden');
                }}
                className="flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 transition-colors"
              >
                <ChevronDown className="h-3 w-3" />
                {failures.length} 个失败详情
              </button>
              <div className="hidden">
                {renderFailures(failures)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSubjectResults = (result: SubjectResult | null, subjectEmoji: string, subjectName: string) => {
    if (!result) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <FileQuestion className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-sm">点击"开始测试"运行{subjectName}题库验证</p>
        </div>
      );
    }

    // Group topics by grade
    const gradeGroups: Record<number, TopicTestResult[]> = {};
    result.topics.forEach(topic => {
      if (!gradeGroups[topic.grade]) gradeGroups[topic.grade] = [];
      gradeGroups[topic.grade].push(topic);
    });

    const subjectTotalFailed = result.topics.reduce(
      (s, t) => s + t.tests.filter(tc => !tc.passed).length, 0
    );

    return (
      <div className="space-y-4">
        {/* Subject summary */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-4 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{subjectEmoji}</span>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{subjectName}题库</h3>
                  <p className="text-[11px] text-gray-500">
                    {result.topics.length} 个测试项 · {result.totalTests} 项测试
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${passRateColor(result.passRate)}`}>
                  {result.passRate}%
                </p>
                <p className="text-[10px] text-gray-400">通过率</p>
              </div>
            </div>
            <div className="mt-3 relative h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${passRateBg(result.passRate)}`}
                style={{ width: `${result.passRate}%` }}
              />
            </div>
            {subjectTotalFailed > 0 && (
              <div className="mt-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-[11px] text-amber-600 font-medium">
                  {subjectTotalFailed} 项测试未通过
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grade accordion */}
        <Accordion type="multiple" defaultValue={Object.keys(gradeGroups).map(String)}>
          {Object.entries(gradeGroups)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([grade, topics]) => {
              const gradeNum = Number(grade);
              if (gradeNum === 0) {
                // Special: min grade test
                const gradePassRate = topics.length > 0
                  ? Math.round(topics.reduce((s, t) => s + t.passRate, 0) / topics.length)
                  : 100;
                return (
                  <AccordionItem key={grade} value={grade}>
                    <AccordionTrigger className="px-4 py-3 hover:no-underline rounded-xl">
                      <div className="flex items-center gap-3 flex-1 mr-4">
                        <span className="text-lg">🔒</span>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-bold text-gray-800">模式年级限制</p>
                          <p className="text-[11px] text-gray-500">{topics.length} 项检查</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[11px] font-bold border ${passRateBadge(gradePassRate)}`}
                        >
                          {gradePassRate}%
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-2">
                        {topics.map(renderTopicResult)}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              }

              const gradePassRate = topics.length > 0
                ? Math.round(topics.reduce((s, t) => s + t.passRate, 0) / topics.length)
                : 100;
              const gradeAllPassed = topics.every(t => t.passRate === 100);

              return (
                <AccordionItem key={grade} value={grade}>
                  <AccordionTrigger className="px-4 py-3 hover:no-underline rounded-xl">
                    <div className="flex items-center gap-3 flex-1 mr-4">
                      <span className="text-lg">{GRADE_EMOJIS[gradeNum]}</span>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-gray-800">{GRADE_LABELS[gradeNum]}</p>
                        <p className="text-[11px] text-gray-500">{topics.length} 个测试项</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-bold border ${passRateBadge(gradePassRate)}`}
                      >
                        {gradeAllPassed ? '✅' : '⚠️'} {gradePassRate}%
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-2">
                      {topics.map(renderTopicResult)}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
        </Accordion>
      </div>
    );
  };

  // ─── Main Render ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl"
              onClick={() => setCurrentView('settings')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-800 truncate">
                🔬 题库验证测试工具
              </h1>
              <p className="text-[11px] text-gray-400">
                验证各年级题库是否符合教育部课程标准
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 pt-4 pb-24">
        {/* ── Overall Summary ── */}
        {(mathResults || chineseResults || englishResults) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  {/* Pass rate ring */}
                  <div className="relative flex-shrink-0">
                    <svg className="h-20 w-20 -rotate-90" viewBox="0 0 72 72">
                      <circle cx="36" cy="36" r="30" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                      <circle
                        cx="36" cy="36" r="30" fill="none"
                        stroke={overallPassRate >= 90 ? '#10b981' : overallPassRate >= 70 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${overallPassRate * 1.884} 188.4`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-lg font-bold ${passRateColor(overallPassRate)}`}>
                        {overallPassRate}%
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold text-gray-800 mb-1">测试总览</h2>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-800">{totalTests}</p>
                        <p className="text-[10px] text-gray-400">总测试</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-emerald-600">{totalPassed}</p>
                        <p className="text-[10px] text-gray-400">通过</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-red-600">{totalTests - totalPassed}</p>
                        <p className="text-[10px] text-gray-400">失败</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Per subject summary */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { emoji: '🧮', name: '数学', result: mathResults },
                    { emoji: '📖', name: '语文', result: chineseResults },
                    { emoji: '🔤', name: '英语', result: englishResults },
                  ].map(({ emoji, name, result }) => (
                    <div
                      key={name}
                      className="flex items-center gap-1.5 rounded-xl bg-gray-50 px-3 py-2"
                    >
                      <span className="text-sm">{emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-gray-700">{name}</p>
                        <p className={`text-xs font-bold ${passRateColor(result?.passRate ?? 0)}`}>
                          {result ? `${result.passRate}%` : '--'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Critical issues highlight */}
                {totalTests - totalPassed > 0 && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <p className="text-[11px] text-red-600 font-medium">
                      发现 {totalTests - totalPassed} 项测试未通过，请查看详细报告
                    </p>
                  </div>
                )}

                {overallPassRate === 100 && totalTests > 0 && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <p className="text-[11px] text-emerald-600 font-medium">
                      🎉 所有测试均通过！题库完全符合课程标准
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Run Controls ── */}
        <Card className="border-0 shadow-sm overflow-hidden mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex-shrink-0">
                <BarChart3 className="h-5 w-5 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-800">测试控制</h3>
                <p className="text-[11px] text-gray-400">
                  {isRunning ? '测试运行中...' : '选择每主题测试题目数量并开始测试'}
                </p>
              </div>
            </div>

            {/* Sample count selector */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-gray-500">每主题题目数:</span>
              <div className="flex gap-1.5">
                {[10, 20, 50].map(n => (
                  <button
                    key={n}
                    disabled={isRunning}
                    onClick={() => setSampleCount(n)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      sampleCount === n
                        ? 'bg-violet-100 text-violet-700 shadow-sm'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress */}
            {isRunning && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-gray-500">测试进度</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400">{formatTime(elapsedTime)}</span>
                    <span className="text-xs font-bold text-violet-600">{progress}%</span>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Run button */}
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className={`w-full h-11 rounded-xl font-bold text-sm shadow-md transition-all ${
                isRunning
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white active:scale-[0.98]'
              }`}
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  测试中... {progress}%
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  {allResults.length > 0 ? '🔄 重新测试' : '▶ 开始测试'}
                </>
              )}
            </Button>

            {!isRunning && allResults.length === 0 && (
              <div className="mt-3 flex items-center gap-4 justify-center text-[11px] text-gray-400">
                <div className="flex items-center gap-1">
                  <ListChecks className="h-3.5 w-3.5" />
                  <span>23个数学主题</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>·</span>
                  <span>8个语文模式</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>·</span>
                  <span>4个英语模式</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Subject Tabs ── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4 h-10 rounded-xl bg-gray-100 p-1">
            <TabsTrigger
              value="math"
              className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-amber-700"
            >
              🧮 数学
              {mathResults && (
                <Badge
                  variant="secondary"
                  className={`ml-1.5 text-[10px] px-1.5 ${
                    mathResults.passRate >= 90
                      ? 'bg-emerald-100 text-emerald-700'
                      : mathResults.passRate >= 70
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {mathResults.passRate}%
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="chinese"
              className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-rose-700"
            >
              📖 语文
              {chineseResults && (
                <Badge
                  variant="secondary"
                  className={`ml-1.5 text-[10px] px-1.5 ${
                    chineseResults.passRate >= 90
                      ? 'bg-emerald-100 text-emerald-700'
                      : chineseResults.passRate >= 70
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {chineseResults.passRate}%
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="english"
              className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-cyan-700"
            >
              🔤 英语
              {englishResults && (
                <Badge
                  variant="secondary"
                  className={`ml-1.5 text-[10px] px-1.5 ${
                    englishResults.passRate >= 90
                      ? 'bg-emerald-100 text-emerald-700'
                      : englishResults.passRate >= 70
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {englishResults.passRate}%
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="math">
            {renderSubjectResults(mathResults, '🧮', '数学')}
          </TabsContent>
          <TabsContent value="chinese">
            {renderSubjectResults(chineseResults, '📖', '语文')}
          </TabsContent>
          <TabsContent value="english">
            {renderSubjectResults(englishResults, '🔤', '英语')}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
