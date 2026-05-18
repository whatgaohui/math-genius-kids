// Math curriculum question bank aligned with 人教版 (PEP) Chinese elementary curriculum, grades 1-6
// Provides curriculum-aligned question generation with per-topic constraints.

import type { MathQuestion, Operation, Difficulty } from './math-utils';

// ─── Core Types ──────────────────────────────────────────────────────────────

export type Grade = 1 | 2 | 3 | 4 | 5 | 6;
export type Semester = '上册' | '下册';

export interface TopicConstraints {
  noCarry?: boolean;
  noBorrow?: boolean;
  withinTable?: boolean;
  maxDigitSum?: number;
  resultPositive?: boolean;
  allowDecimals?: boolean;
  decimalPlaces?: number;
}

export interface CurriculumTopic {
  id: string;
  grade: Grade;
  semester: Semester;
  name: string;
  description: string;
  emoji: string;
  category: string;
  operations: Operation[];
  difficulty: Difficulty;
  numRange: [number, number];
  constraints: TopicConstraints;
  questionCount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let _idCounter = 0;
function genId(): string {
  return `cq-${Date.now()}-${++_idCounter}`;
}

const GRADE_LABELS: Record<Grade, string> = {
  1: '一年级',
  2: '二年级',
  3: '三年级',
  4: '四年级',
  5: '五年级',
  6: '六年级',
};

// ─── Curriculum Topic Definitions (人教版 Alignment) ─────────────────────────

const TOPICS: CurriculumTopic[] = [
  // ── Grade 1 上册 ─────────────────────────────────────────────────────────
  {
    id: 'g1s1-add-within-10',
    grade: 1, semester: '上册',
    name: '10以内加法',
    description: '10以内的不进位加法',
    emoji: '🔢',
    category: '数的运算',
    operations: ['add'],
    difficulty: 'easy',
    numRange: [0, 10],
    constraints: { noCarry: true, resultPositive: true },
    questionCount: 10,
  },
  {
    id: 'g1s1-sub-within-10',
    grade: 1, semester: '上册',
    name: '10以内减法',
    description: '10以内的不退位减法',
    emoji: '➖',
    category: '数的运算',
    operations: ['subtract'],
    difficulty: 'easy',
    numRange: [0, 10],
    constraints: { noBorrow: true, resultPositive: true },
    questionCount: 10,
  },

  // ── Grade 1 下册 ─────────────────────────────────────────────────────────
  {
    id: 'g1s2-add-within-20',
    grade: 1, semester: '下册',
    name: '20以内进位加法',
    description: '20以内的进位加法',
    emoji: '➕',
    category: '数的运算',
    operations: ['add'],
    difficulty: 'easy',
    numRange: [1, 20],
    constraints: { resultPositive: true },
    questionCount: 10,
  },
  {
    id: 'g1s2-sub-within-20',
    grade: 1, semester: '下册',
    name: '20以内退位减法',
    description: '20以内的退位减法',
    emoji: '🔻',
    category: '数的运算',
    operations: ['subtract'],
    difficulty: 'easy',
    numRange: [1, 20],
    constraints: { resultPositive: true },
    questionCount: 10,
  },

  // ── Grade 2 上册 ─────────────────────────────────────────────────────────
  {
    id: 'g2s1-add-sub-within-100',
    grade: 2, semester: '上册',
    name: '100以内加减法',
    description: '100以内的加减法（基础）',
    emoji: '✖️',
    category: '数的运算',
    operations: ['add', 'subtract'],
    difficulty: 'easy',
    numRange: [1, 100],
    constraints: { noCarry: true, noBorrow: true, resultPositive: true },
    questionCount: 10,
  },
  {
    id: 'g2s1-mul-table',
    grade: 2, semester: '上册',
    name: '乘法口诀表',
    description: '九九乘法表内的乘法',
    emoji: '✖️',
    category: '数的运算',
    operations: ['multiply'],
    difficulty: 'easy',
    numRange: [1, 9],
    constraints: { withinTable: true },
    questionCount: 12,
  },

  // ── Grade 2 下册 ─────────────────────────────────────────────────────────
  {
    id: 'g2s2-div-table',
    grade: 2, semester: '下册',
    name: '表内除法',
    description: '利用乘法口诀求商',
    emoji: '➗',
    category: '数的运算',
    operations: ['divide'],
    difficulty: 'easy',
    numRange: [1, 9],
    constraints: { withinTable: true },
    questionCount: 12,
  },
  {
    id: 'g2s2-mix-basic',
    grade: 2, semester: '下册',
    name: '混合运算(基础)',
    description: '加减乘除混合，小数字',
    emoji: '🔀',
    category: '数的运算',
    operations: ['add', 'subtract', 'multiply', 'divide'],
    difficulty: 'easy',
    numRange: [1, 20],
    constraints: { withinTable: true },
    questionCount: 10,
  },

  // ── Grade 3 上册 ─────────────────────────────────────────────────────────
  {
    id: 'g3s1-add-sub-within-10000',
    grade: 3, semester: '上册',
    name: '万以内加减法',
    description: '万以内的加减法',
    emoji: '🔢',
    category: '数的运算',
    operations: ['add', 'subtract'],
    difficulty: 'medium',
    numRange: [100, 10000],
    constraints: { resultPositive: true },
    questionCount: 8,
  },
  {
    id: 'g3s1-mul-multi-by-one',
    grade: 3, semester: '上册',
    name: '多位数乘一位数',
    description: '如 23 × 3、156 × 4',
    emoji: '✖️',
    category: '数的运算',
    operations: ['multiply'],
    difficulty: 'medium',
    numRange: [2, 9],
    constraints: {},
    questionCount: 8,
  },

  // ── Grade 3 下册 ─────────────────────────────────────────────────────────
  {
    id: 'g3s2-div-two-by-one',
    grade: 3, semester: '下册',
    name: '两位数除以一位数',
    description: '如 84 ÷ 7',
    emoji: '➗',
    category: '数的运算',
    operations: ['divide'],
    difficulty: 'medium',
    numRange: [2, 9],
    constraints: {},
    questionCount: 8,
  },
  {
    id: 'g3s2-simple-fractions',
    grade: 3, semester: '下册',
    name: '简单分数',
    description: '分数初步认识与比较',
    emoji: '🍕',
    category: '分数与小数',
    operations: ['compare'],
    difficulty: 'easy',
    numRange: [1, 9],
    constraints: {},
    questionCount: 8,
  },

  // ── Grade 4 上册 ─────────────────────────────────────────────────────────
  {
    id: 'g4s1-large-num-ops',
    grade: 4, semester: '上册',
    name: '大数认识与运算',
    description: '十万以内的加减法',
    emoji: '🔢',
    category: '数的运算',
    operations: ['add', 'subtract'],
    difficulty: 'hard',
    numRange: [1000, 100000],
    constraints: { resultPositive: true },
    questionCount: 6,
  },
  {
    id: 'g4s1-mul-three-by-two',
    grade: 4, semester: '上册',
    name: '三位数乘两位数',
    description: '如 123 × 45',
    emoji: '✖️',
    category: '数的运算',
    operations: ['multiply'],
    difficulty: 'hard',
    numRange: [2, 99],
    constraints: {},
    questionCount: 6,
  },

  // ── Grade 4 下册 ─────────────────────────────────────────────────────────
  {
    id: 'g4s2-four-ops',
    grade: 4, semester: '下册',
    name: '四则混合运算',
    description: '带括号的四则运算',
    emoji: '🔀',
    category: '数的运算',
    operations: ['add', 'subtract', 'multiply', 'divide'],
    difficulty: 'hard',
    numRange: [2, 50],
    constraints: {},
    questionCount: 6,
  },
  {
    id: 'g4s2-decimal-add-sub',
    grade: 4, semester: '下册',
    name: '小数加减法',
    description: '如 3.5 + 2.8',
    emoji: '🔵',
    category: '分数与小数',
    operations: ['add', 'subtract'],
    difficulty: 'medium',
    numRange: [1, 99],
    constraints: { allowDecimals: true, decimalPlaces: 1 },
    questionCount: 8,
  },

  // ── Grade 5 上册 ─────────────────────────────────────────────────────────
  {
    id: 'g5s1-decimal-mul-div',
    grade: 5, semester: '上册',
    name: '小数乘除法',
    description: '如 2.5 × 0.4、3.6 ÷ 1.2',
    emoji: '✖️',
    category: '分数与小数',
    operations: ['multiply', 'divide'],
    difficulty: 'hard',
    numRange: [1, 99],
    constraints: { allowDecimals: true, decimalPlaces: 1 },
    questionCount: 8,
  },
  {
    id: 'g5s1-simple-equations',
    grade: 5, semester: '上册',
    name: '解简易方程',
    description: '如 x + 5 = 12，求 x',
    emoji: '⚖️',
    category: '方程',
    operations: ['add', 'subtract'],
    difficulty: 'medium',
    numRange: [1, 50],
    constraints: {},
    questionCount: 8,
  },

  // ── Grade 5 下册 ─────────────────────────────────────────────────────────
  {
    id: 'g5s2-fraction-add-sub',
    grade: 5, semester: '下册',
    name: '分数加减法',
    description: '同分母分数加减法',
    emoji: '🍕',
    category: '分数与小数',
    operations: ['add', 'subtract'],
    difficulty: 'medium',
    numRange: [2, 12],
    constraints: {},
    questionCount: 8,
  },

  // ── Grade 6 上册 ─────────────────────────────────────────────────────────
  {
    id: 'g6s1-fraction-mul-div',
    grade: 6, semester: '上册',
    name: '分数乘除法',
    description: '分数的乘法与除法',
    emoji: '✖️',
    category: '分数与小数',
    operations: ['multiply', 'divide'],
    difficulty: 'hard',
    numRange: [1, 9],
    constraints: {},
    questionCount: 8,
  },
  {
    id: 'g6s1-percentage',
    grade: 6, semester: '上册',
    name: '百分数',
    description: '百分数计算，如 25% of 200',
    emoji: '💯',
    category: '比与比例',
    operations: ['multiply'],
    difficulty: 'hard',
    numRange: [1, 100],
    constraints: {},
    questionCount: 8,
  },

  // ── Grade 6 下册 ─────────────────────────────────────────────────────────
  {
    id: 'g6s2-negative-arithmetic',
    grade: 6, semester: '下册',
    name: '负数加减法',
    description: '正负数加减运算',
    emoji: '🌡️',
    category: '数的运算',
    operations: ['add', 'subtract'],
    difficulty: 'medium',
    numRange: [1, 50],
    constraints: {},
    questionCount: 8,
  },
  {
    id: 'g6s2-negative-compare',
    grade: 6, semester: '下册',
    name: '负数比较',
    description: '正负数大小比较',
    emoji: '❄️',
    category: '量的计量',
    operations: ['compare'],
    difficulty: 'medium',
    numRange: [1, 50],
    constraints: {},
    questionCount: 4,
  },
  {
    id: 'g6s2-ratio',
    grade: 6, semester: '下册',
    name: '比例运算',
    description: '比与比例，如 3:5 = 9:x',
    emoji: '⚖️',
    category: '比与比例',
    operations: ['divide'],
    difficulty: 'hard',
    numRange: [2, 20],
    constraints: {},
    questionCount: 6,
  },
  {
    id: 'g6s2-percentage-advanced',
    grade: 6, semester: '下册',
    name: '百分数应用',
    description: '百分数应用题：求百分率、折扣等',
    emoji: '💯',
    category: '比与比例',
    operations: ['multiply'],
    difficulty: 'hard',
    numRange: [1, 200],
    constraints: {},
    questionCount: 6,
  },
  {
    id: 'g6s2-mixed-review',
    grade: 6, semester: '下册',
    name: '综合复习',
    description: '六年级综合运算复习',
    emoji: '📝',
    category: '综合',
    operations: ['add', 'subtract', 'multiply', 'divide'],
    difficulty: 'hard',
    numRange: [2, 100],
    constraints: {},
    questionCount: 8,
  },
];

// ─── Curriculum Lookup Constants ─────────────────────────────────────────────

export const CURRICULUM: Record<Grade, { 上册: CurriculumTopic[]; 下册: CurriculumTopic[] }> = {
  1: {
    上册: TOPICS.filter(t => t.grade === 1 && t.semester === '上册'),
    下册: TOPICS.filter(t => t.grade === 1 && t.semester === '下册'),
  },
  2: {
    上册: TOPICS.filter(t => t.grade === 2 && t.semester === '上册'),
    下册: TOPICS.filter(t => t.grade === 2 && t.semester === '下册'),
  },
  3: {
    上册: TOPICS.filter(t => t.grade === 3 && t.semester === '上册'),
    下册: TOPICS.filter(t => t.grade === 3 && t.semester === '下册'),
  },
  4: {
    上册: TOPICS.filter(t => t.grade === 4 && t.semester === '上册'),
    下册: TOPICS.filter(t => t.grade === 4 && t.semester === '下册'),
  },
  5: {
    上册: TOPICS.filter(t => t.grade === 5 && t.semester === '上册'),
    下册: TOPICS.filter(t => t.grade === 5 && t.semester === '下册'),
  },
  6: {
    上册: TOPICS.filter(t => t.grade === 6 && t.semester === '上册'),
    下册: TOPICS.filter(t => t.grade === 6 && t.semester === '下册'),
  },
};

export const ALL_GRADES_CONFIG: { grade: Grade; semester: Semester; topics: CurriculumTopic[] }[] =
  ([1, 2, 3, 4, 5, 6] as Grade[]).flatMap(g =>
    (['上册', '下册'] as Semester[]).map(s => ({
      grade: g,
      semester: s,
      topics: CURRICULUM[g][s],
    }))
  );

// ─── Grade Label ─────────────────────────────────────────────────────────────

export function getGradeLabel(grade: Grade, semester: Semester): string {
  return `${GRADE_LABELS[grade]}${semester}`;
}

// ─── Topic Lookup ────────────────────────────────────────────────────────────

export function getTopicsForGrade(grade: Grade, semester: Semester): CurriculumTopic[] {
  return CURRICULUM[grade][semester];
}

// ─── Specialized Question Generators ─────────────────────────────────────────

function generateNoCarryAdd(min: number, max: number): MathQuestion {
  for (let attempt = 0; attempt < 10; attempt++) {
    const num1 = randInt(min, max);
    const num2 = randInt(min, max - num1); // ensure sum ≤ max
    // Verify no digit-wise carry
    const d1 = String(num1).padStart(String(max).length, '0');
    const d2 = String(num2).padStart(String(max).length, '0');
    let valid = true;
    for (let i = 0; i < d1.length; i++) {
      if (Number(d1[i]) + Number(d2[i]) >= 10) { valid = false; break; }
    }
    if (valid) {
      return {
        id: genId(), num1, num2, operation: 'add',
        correctAnswer: num1 + num2, displayOp: '+',
        expression: `${num1} + ${num2}`,
      };
    }
  }
  // Fallback: simple small addition that won't carry
  const num1 = randInt(min, 5);
  const num2 = randInt(min, 9 - num1);
  return {
    id: genId(), num1, num2, operation: 'add',
    correctAnswer: num1 + num2, displayOp: '+',
    expression: `${num1} + ${num2}`,
  };
}

function generateNoBorrowSub(min: number, max: number): MathQuestion {
  for (let attempt = 0; attempt < 10; attempt++) {
    const num1 = randInt(Math.max(min, 1), max);
    const num2 = randInt(min, num1);
    const d1 = String(num1).padStart(String(max).length, '0');
    const d2 = String(num2).padStart(String(max).length, '0');
    let valid = true;
    for (let i = 0; i < d1.length; i++) {
      if (Number(d1[i]) < Number(d2[i])) { valid = false; break; }
    }
    if (valid) {
      return {
        id: genId(), num1, num2, operation: 'subtract',
        correctAnswer: num1 - num2, displayOp: '−',
        expression: `${num1} − ${num2}`,
      };
    }
  }
  const num1 = randInt(5, max);
  const num2 = randInt(0, Math.min(num1, 4));
  return {
    id: genId(), num1, num2, operation: 'subtract',
    correctAnswer: num1 - num2, displayOp: '−',
    expression: `${num1} − ${num2}`,
  };
}

function generateTableMultiply(): MathQuestion {
  const num1 = randInt(1, 9);
  const num2 = randInt(1, 9);
  return {
    id: genId(), num1, num2, operation: 'multiply',
    correctAnswer: num1 * num2, displayOp: '×',
    expression: `${num1} × ${num2}`,
  };
}

function generateTableDivide(): MathQuestion {
  const quotient = randInt(1, 9);
  const divisor = randInt(1, 9);
  return {
    id: genId(), num1: divisor * quotient, num2: divisor, operation: 'divide',
    correctAnswer: quotient, displayOp: '÷',
    expression: `${divisor * quotient} ÷ ${divisor}`,
  };
}

function generateMultiDigitMulOne(maxMultiplier: number): MathQuestion {
  // e.g., 23 × 3 or 156 × 4
  const multiplier = randInt(2, 9);
  const multiDigit = randInt(10, maxMultiplier);
  return {
    id: genId(), num1: multiDigit, num2: multiplier, operation: 'multiply',
    correctAnswer: multiDigit * multiplier, displayOp: '×',
    expression: `${multiDigit} × ${multiplier}`,
  };
}

function generateTwoDigitDivOne(): MathQuestion {
  for (let attempt = 0; attempt < 10; attempt++) {
    const divisor = randInt(2, 9);
    const quotient = randInt(10, 99);
    const dividend = divisor * quotient;
    if (dividend >= 10 && dividend <= 999) {
      return {
        id: genId(), num1: dividend, num2: divisor, operation: 'divide',
        correctAnswer: quotient, displayOp: '÷',
        expression: `${dividend} ÷ ${divisor}`,
      };
    }
  }
  const divisor = randInt(2, 9);
  const quotient = randInt(12, 50);
  return {
    id: genId(), num1: divisor * quotient, num2: divisor, operation: 'divide',
    correctAnswer: quotient, displayOp: '÷',
    expression: `${divisor * quotient} ÷ ${divisor}`,
  };
}

function generateThreeByTwoMul(): MathQuestion {
  const num1 = randInt(100, 999);
  const num2 = randInt(11, 99);
  return {
    id: genId(), num1, num2, operation: 'multiply',
    correctAnswer: num1 * num2, displayOp: '×',
    expression: `${num1} × ${num2}`,
  };
}

function generateFourOpsWithParens(): MathQuestion {
  // Generate expressions like (a + b) × c or a × (b − c) etc.
  const patterns = [
    // (a + b) × c
    () => {
      const a = randInt(2, 20), b = randInt(2, 20), c = randInt(2, 9);
      return { expr: `(${a} + ${b}) × ${c}`, answer: (a + b) * c, op: 'multiply' as Operation };
    },
    // a × b + c × d
    () => {
      const a = randInt(2, 9), b = randInt(2, 9), c = randInt(2, 9), d = randInt(2, 9);
      return { expr: `${a} × ${b} + ${c} × ${d}`, answer: a * b + c * d, op: 'add' as Operation };
    },
    // (a − b) × c
    () => {
      const b = randInt(1, 15), a = randInt(b + 1, 30), c = randInt(2, 9);
      return { expr: `(${a} − ${b}) × ${c}`, answer: (a - b) * c, op: 'multiply' as Operation };
    },
    // a × b ÷ c (clean division)
    () => {
      const c = randInt(2, 9), q = randInt(2, 20), b = randInt(2, 9);
      const a = (c * q) / b;
      if (a === Math.floor(a) && a >= 2 && a <= 50) {
        return { expr: `${a} × ${b} ÷ ${c}`, answer: q, op: 'divide' as Operation };
      }
      return null;
    },
    // a + b × c
    () => {
      const a = randInt(5, 30), b = randInt(2, 9), c = randInt(2, 9);
      return { expr: `${a} + ${b} × ${c}`, answer: a + b * c, op: 'add' as Operation };
    },
  ];

  for (let attempt = 0; attempt < 10; attempt++) {
    const pattern = pickRandom(patterns)();
    if (pattern && Number.isInteger(pattern.answer) && pattern.answer > 0 && pattern.answer <= 10000) {
      return {
        id: genId(), num1: 0, num2: 0, operation: pattern.op,
        correctAnswer: pattern.answer, displayOp: '=',
        expression: pattern.expr,
      };
    }
  }
  const a = randInt(5, 20), b = randInt(2, 9), c = randInt(2, 9);
  return {
    id: genId(), num1: 0, num2: 0, operation: 'add',
    correctAnswer: a + b * c, displayOp: '=',
    expression: `${a} + ${b} × ${c}`,
  };
}

function generateDecimalAddSub(places: number, isAdd: boolean): MathQuestion {
  const factor = Math.pow(10, places);
  for (let attempt = 0; attempt < 10; attempt++) {
    const raw1 = randInt(1 * factor, 99 * factor);
    const raw2 = randInt(1 * factor, 99 * factor);
    const num1 = raw1 / factor;
    const num2 = raw2 / factor;

    if (isAdd) {
      const result = num1 + num2;
      return {
        id: genId(), num1, num2, operation: 'add',
        correctAnswer: parseFloat(result.toFixed(places)), displayOp: '+',
        expression: `${num1.toFixed(places)} + ${num2.toFixed(places)}`,
      };
    } else {
      const big = Math.max(num1, num2);
      const small = Math.min(num1, num2);
      const result = big - small;
      return {
        id: genId(), num1: big, num2: small, operation: 'subtract',
        correctAnswer: parseFloat(result.toFixed(places)), displayOp: '−',
        expression: `${big.toFixed(places)} − ${small.toFixed(places)}`,
      };
    }
  }
  // fallback
  const num1 = 2.5, num2 = 1.3;
  const result = isAdd ? num1 + num2 : Math.abs(num1 - num2);
  return {
    id: genId(), num1, num2, operation: isAdd ? 'add' : 'subtract',
    correctAnswer: parseFloat(result.toFixed(1)), displayOp: isAdd ? '+' : '−',
    expression: `${num1.toFixed(1)} ${isAdd ? '+' : '−'} ${num2.toFixed(1)}`,
  };
}

function generateDecimalMulDiv(places: number, isMul: boolean): MathQuestion {
  const factor = Math.pow(10, places);

  for (let attempt = 0; attempt < 10; attempt++) {
    if (isMul) {
      const raw1 = randInt(1, 99);
      const raw2 = randInt(1, 99);
      const num1 = raw1 / factor;
      const num2 = raw2 / factor;
      const result = num1 * num2;
      if (result > 0) {
        return {
          id: genId(), num1, num2, operation: 'multiply',
          correctAnswer: parseFloat(result.toFixed(places + 1)), displayOp: '×',
          expression: `${num1.toFixed(places)} × ${num2.toFixed(places)}`,
        };
      }
    } else {
      // Generate clean decimal division: dividend / divisor = quotient
      // E.g., 3.6 ÷ 1.2 = 3
      const quotient = randInt(2, 20);
      const divisor = randInt(2, 99) / factor;
      const dividend = parseFloat((quotient * divisor).toFixed(places + 1));
      if (dividend > 0 && divisor > 0) {
        return {
          id: genId(), num1: dividend, num2: divisor, operation: 'divide',
          correctAnswer: quotient, displayOp: '÷',
          expression: `${dividend} ÷ ${divisor}`,
        };
      }
    }
  }
  // fallback
  if (isMul) {
    const num1 = 2.5, num2 = 0.4;
    return {
      id: genId(), num1, num2, operation: 'multiply',
      correctAnswer: 1.0, displayOp: '×',
      expression: `${num1} × ${num2}`,
    };
  }
  return {
    id: genId(), num1: 3.6, num2: 1.2, operation: 'divide',
    correctAnswer: 3, displayOp: '÷',
    expression: `3.6 ÷ 1.2`,
  };
}

function generateFractionComparison(): MathQuestion {
  // Compare fractions: e.g., 1/4 ○ 1/3
  for (let attempt = 0; attempt < 10; attempt++) {
    const d1 = randInt(2, 9);
    const d2 = randInt(2, 9);
    const n1 = randInt(1, d1 - 1);
    const n2 = randInt(1, d2 - 1);
    const v1 = n1 / d1;
    const v2 = n2 / d2;
    // Only generate if they are different to avoid ambiguity
    if (v1 !== v2) {
      const correctAnswer = v1 > v2;
      return {
        id: genId(), num1: 0, num2: 0, operation: 'compare',
        correctAnswer, displayOp: '?',
        compareLeft: v1, compareRight: v2,
        expression: `${n1}/${d1} 〇 ${n2}/${d2}`,
      };
    }
  }
  return {
    id: genId(), num1: 0, num2: 0, operation: 'compare',
    correctAnswer: false, displayOp: '?',
    compareLeft: 0.25, compareRight: 0.5,
    expression: `1/4 〇 1/2`,
  };
}

function generateFractionAddSub(isAdd: boolean): MathQuestion {
  // Same-denominator fraction add/sub: a/b + c/b
  for (let attempt = 0; attempt < 10; attempt++) {
    const b = randInt(2, 12);
    const a = randInt(1, b - 1);
    const c = randInt(1, isAdd ? b - a : a - 1);
    if (c < 1) continue;

    if (isAdd) {
      const numerator = a + c;
      // Proper or improper fraction result — store numerator as answer
      return {
        id: genId(), num1: 0, num2: 0, operation: 'add',
        correctAnswer: numerator, displayOp: '+',
        expression: `${a}/${b} + ${c}/${b} = ?/${b}`,
      };
    } else {
      const numerator = a - c;
      return {
        id: genId(), num1: 0, num2: 0, operation: 'subtract',
        correctAnswer: numerator, displayOp: '−',
        expression: `${a}/${b} − ${c}/${b} = ?/${b}`,
      };
    }
  }
  return {
    id: genId(), num1: 0, num2: 0, operation: isAdd ? 'add' : 'subtract',
    correctAnswer: isAdd ? 5 : 1, displayOp: isAdd ? '+' : '−',
    expression: isAdd ? '2/6 + 3/6 = ?/6' : '3/6 − 2/6 = ?/6',
  };
}

function generateFractionMulDiv(isMul: boolean): MathQuestion {
  for (let attempt = 0; attempt < 10; attempt++) {
    if (isMul) {
      const n1 = randInt(1, 8), d1 = randInt(n1 + 1, 9);
      const n2 = randInt(1, 8), d2 = randInt(n2 + 1, 9);
      // Simplify result
      const num = n1 * n2;
      const den = d1 * d2;
      const g = gcd(num, den);
      const sn = num / g, sd = den / g;
      const answer = sd === 1 ? sn : num; // store numerator if improper
      return {
        id: genId(), num1: 0, num2: 0, operation: 'multiply',
        correctAnswer: sn, displayOp: '×',
        expression: `${n1}/${d1} × ${n2}/${d2}`,
      };
    } else {
      // a/b ÷ c/d = a/b × d/c
      const n1 = randInt(1, 8), d1 = randInt(n1 + 1, 9);
      const n2 = randInt(1, 8), d2 = randInt(n2 + 1, 9);
      const num = n1 * d2;
      const den = d1 * n2;
      const g = gcd(num, den);
      const sn = num / g;
      return {
        id: genId(), num1: 0, num2: 0, operation: 'divide',
        correctAnswer: sn, displayOp: '÷',
        expression: `${n1}/${d1} ÷ ${n2}/${d2}`,
      };
    }
  }
  return {
    id: genId(), num1: 0, num2: 0, operation: isMul ? 'multiply' : 'divide',
    correctAnswer: isMul ? 1 : 1, displayOp: isMul ? '×' : '÷',
    expression: isMul ? '1/2 × 2/3' : '1/2 ÷ 1/3',
  };
}

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function generateEquation(topic: CurriculumTopic): MathQuestion {
  // x + a = b or a + x = b or x − a = b or x × a = b
  const patterns: (() => MathQuestion | null)[] = [
    // x + a = b  → x = b − a
    () => {
      const a = randInt(1, 30), x = randInt(1, 50);
      const b = a + x;
      return { id: genId(), num1: a, num2: b, operation: 'add' as Operation,
        correctAnswer: x, displayOp: '=', expression: `x + ${a} = ${b}，x = ?` };
    },
    // a + x = b
    () => {
      const a = randInt(1, 30), x = randInt(1, 50);
      const b = a + x;
      return { id: genId(), num1: a, num2: b, operation: 'add' as Operation,
        correctAnswer: x, displayOp: '=', expression: `${a} + x = ${b}，x = ?` };
    },
    // x − a = b  → x = a + b
    () => {
      const a = randInt(1, 30), b = randInt(1, 30);
      return { id: genId(), num1: a, num2: b, operation: 'subtract' as Operation,
        correctAnswer: a + b, displayOp: '=', expression: `x − ${a} = ${b}，x = ?` };
    },
    // x × a = b  → x = b / a (clean)
    () => {
      const a = randInt(2, 9), x = randInt(2, 20);
      return { id: genId(), num1: a, num2: a * x, operation: 'multiply' as Operation,
        correctAnswer: x, displayOp: '=', expression: `x × ${a} = ${a * x}，x = ?` };
    },
  ];

  for (let i = 0; i < 10; i++) {
    const q = pickRandom(patterns)();
    if (q && typeof q.correctAnswer === 'number' && q.correctAnswer >= 0) return q;
  }
  return {
    id: genId(), num1: 5, num2: 12, operation: 'add',
    correctAnswer: 7, displayOp: '=',
    expression: `x + 5 = 12，x = ?`,
  };
}

function generatePercentage(): MathQuestion {
  // "a% of b = ?" → answer = a * b / 100
  for (let attempt = 0; attempt < 10; attempt++) {
    const pct = pickRandom([5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80]);
    const base = randInt(10, 500);
    const answer = (pct * base) / 100;
    if (Number.isInteger(answer)) {
      return {
        id: genId(), num1: pct, num2: base, operation: 'multiply',
        correctAnswer: answer, displayOp: '=',
        expression: `${pct}% × ${base} = ?`,
      };
    }
  }
  return {
    id: genId(), num1: 25, num2: 200, operation: 'multiply',
    correctAnswer: 50, displayOp: '=',
    expression: `25% × 200 = ?`,
  };
}

function generateNegativeComparison(): MathQuestion {
  // Compare negative numbers, e.g., -3 ○ -7 or -5 ○ 2
  for (let attempt = 0; attempt < 10; attempt++) {
    const a = randInt(1, 50);
    const b = randInt(1, 50);
    const makeNegA = Math.random() > 0.3;
    const makeNegB = Math.random() > 0.3;
    const left = makeNegA ? -a : a;
    const right = makeNegB ? -b : b;

    if (left !== right) {
      // Represent as string with signs
      const ls = left < 0 ? `(${left})` : `${left}`;
      const rs = right < 0 ? `(${right})` : `${right}`;
      return {
        id: genId(), num1: left, num2: right, operation: 'compare',
        correctAnswer: left > right, displayOp: '?',
        compareLeft: left, compareRight: right,
        expression: `${ls} 〇 ${rs}`,
      };
    }
  }
  return {
    id: genId(), num1: -3, num2: -7, operation: 'compare',
    correctAnswer: true, displayOp: '?',
    compareLeft: -3, compareRight: -7,
    expression: `(-3) 〇 (-7)`,
  };
}

function generateNegativeArithmetic(isAdd: boolean): MathQuestion {
  // Negative number addition/subtraction: e.g., (-3) + 5 = ? or (-5) - (-3) = ?
  for (let attempt = 0; attempt < 10; attempt++) {
    const a = randInt(1, 30);
    const b = randInt(1, 30);
    if (isAdd) {
      // Various patterns: (-a)+b, a+(-b), (-a)+(-b)
      const pattern = randInt(1, 3);
      let left: number, right: number, answer: number;
      let expr: string;
      if (pattern === 1) { // (-a) + b
        left = -a; right = b;
        answer = b - a;
        expr = `(${left}) + ${right}`;
      } else if (pattern === 2) { // a + (-b)
        left = a; right = -b;
        answer = a - b;
        expr = `${a} + (${right})`;
      } else { // (-a) + (-b)
        left = -a; right = -b;
        answer = -(a + b);
        expr = `(${left}) + (${right})`;
      }
      return {
        id: genId(), num1: left, num2: right, operation: 'add',
        correctAnswer: answer, displayOp: '+',
        expression: `${expr} = ?`,
      };
    } else {
      // Various patterns: (-a) - b, a - (-b), (-a) - (-b)
      const pattern = randInt(1, 3);
      let left: number, right: number, answer: number;
      let expr: string;
      if (pattern === 1) { // (-a) - b
        left = -a; right = b;
        answer = -(a + b);
        expr = `(${left}) − ${right}`;
      } else if (pattern === 2) { // a - (-b)
        left = a; right = -b;
        answer = a + b;
        expr = `${a} − (${right})`;
      } else { // (-a) - (-b)
        left = -a; right = -b;
        answer = -a + b;
        expr = `(${left}) − (${right})`;
      }
      return {
        id: genId(), num1: left, num2: right, operation: 'subtract',
        correctAnswer: answer, displayOp: '−',
        expression: `${expr} = ?`,
      };
    }
  }
  return {
    id: genId(), num1: -3, num2: 5, operation: 'add',
    correctAnswer: 2, displayOp: '+',
    expression: `(-3) + 5 = ?`,
  };
}

function generatePercentageAdvanced(): MathQuestion {
  // Advanced percentage: "原价200，打8折，现价多少" or "某数增加20%是多少"
  for (let attempt = 0; attempt < 10; attempt++) {
    const pattern = randInt(1, 4);
    const base = randInt(50, 500);
    const pct = pickRandom([10, 15, 20, 25, 30, 40, 50, 60, 75, 80]);

    if (pattern === 1) {
      // "200打8折" → 200 × 80% = 160
      const answer = Math.round(base * pct / 100);
      return {
        id: genId(), num1: base, num2: pct, operation: 'multiply',
        correctAnswer: answer, displayOp: '=',
        expression: `${base}打${pct / 10}折 = ?`,
      };
    } else if (pattern === 2) {
      // "增加20%" → base × (1 + 0.2)
      const factor = 100 + pct;
      const answer = (base * factor) / 100;
      if (Number.isInteger(answer)) {
        return {
          id: genId(), num1: base, num2: pct, operation: 'multiply',
          correctAnswer: answer, displayOp: '=',
          expression: `${base}增加${pct}% = ?`,
        };
      }
    } else if (pattern === 3) {
      // "减少20%" → base × (1 - 0.2)
      const factor = 100 - pct;
      const answer = (base * factor) / 100;
      if (Number.isInteger(answer)) {
        return {
          id: genId(), num1: base, num2: pct, operation: 'multiply',
          correctAnswer: answer, displayOp: '=',
          expression: `${base}减少${pct}% = ?`,
        };
      }
    } else {
      // "是200的百分之几" → part/total × 100%
      const part = randInt(1, Math.floor(base * 0.9));
      if (part > 0 && base > 0) {
        const answer = Math.round(part / base * 100);
        return {
          id: genId(), num1: part, num2: base, operation: 'divide',
          correctAnswer: answer, displayOp: '=',
          expression: `${part}是${base}的百分之几？`,
        };
      }
    }
  }
  return {
    id: genId(), num1: 200, num2: 80, operation: 'multiply',
    correctAnswer: 160, displayOp: '=',
    expression: `200打8折 = ?`,
  };
}

function generateRatio(): MathQuestion {
  // "If a:b = c:x, find x" → x = c * b / a
  for (let attempt = 0; attempt < 10; attempt++) {
    const a = randInt(2, 15);
    const b = randInt(2, 15);
    const k = randInt(2, 10);
    const c = a * k;
    const x = b * k;
    if (Number.isInteger(x) && x > 0) {
      return {
        id: genId(), num1: 0, num2: 0, operation: 'divide',
        correctAnswer: x, displayOp: '=',
        expression: `${a}:${b} = ${c}:x，x = ?`,
      };
    }
  }
  return {
    id: genId(), num1: 0, num2: 0, operation: 'divide',
    correctAnswer: 15, displayOp: '=',
    expression: `3:5 = 9:x，x = ?`,
  };
}

// ─── Topic → Generator Routing ───────────────────────────────────────────────

function generateForTopic(topic: CurriculumTopic): MathQuestion {
  const c = topic.constraints;

  // --- Special topic IDs (highest priority) ---
  switch (topic.id) {
    case 'g3s1-mul-multi-by-one':
      return generateMultiDigitMulOne(randInt(12, 500));
    case 'g3s2-div-two-by-one':
      return generateTwoDigitDivOne();
    case 'g4s1-mul-three-by-two':
      return generateThreeByTwoMul();
    case 'g4s2-four-ops':
      return generateFourOpsWithParens();
    case 'g5s1-simple-equations':
      return generateEquation(topic);
    case 'g5s2-fraction-add-sub':
      return generateFractionAddSub(Math.random() > 0.5);
    case 'g6s1-fraction-mul-div':
      return generateFractionMulDiv(Math.random() > 0.5);
    case 'g6s1-percentage':
      return generatePercentage();
    case 'g6s2-negative-numbers':
      return generateNegativeComparison();
    case 'g6s2-negative-compare':
      return generateNegativeArithmetic(Math.random() > 0.5);
    case 'g6s2-negative-arithmetic':
      return generateNegativeArithmetic(Math.random() > 0.5);
    case 'g6s2-ratio':
      return generateRatio();
    case 'g6s2-percentage-advanced':
      return generatePercentageAdvanced();
    case 'g3s2-simple-fractions':
      return generateFractionComparison();
  }

  // --- Constraint-based routing ---
  const op = pickRandom(topic.operations);

  // Decimal operations
  if (c.allowDecimals && (op === 'add' || op === 'subtract')) {
    return generateDecimalAddSub(c.decimalPlaces ?? 1, op === 'add');
  }
  if (c.allowDecimals && (op === 'multiply' || op === 'divide')) {
    return generateDecimalMulDiv(c.decimalPlaces ?? 1, op === 'multiply');
  }

  // Multiplication table
  if (c.withinTable) {
    if (op === 'multiply') return generateTableMultiply();
    if (op === 'divide') return generateTableDivide();
  }

  // No-carry addition
  if (op === 'add' && c.noCarry) {
    return generateNoCarryAdd(topic.numRange[0], topic.numRange[1]);
  }

  // No-borrow subtraction
  if (op === 'subtract' && c.noBorrow) {
    return generateNoBorrowSub(topic.numRange[0], topic.numRange[1]);
  }

  // Standard operations with range (ensuring positive results for sub)
  const [min, max] = topic.numRange;
  switch (op) {
    case 'add': {
      const num1 = randInt(min, max);
      const num2 = randInt(min, max);
      return {
        id: genId(), num1, num2, operation: 'add',
        correctAnswer: num1 + num2, displayOp: '+',
        expression: `${num1} + ${num2}`,
      };
    }
    case 'subtract': {
      const num1 = randInt(Math.max(min, 1), max);
      const num2 = randInt(min, num1);
      return {
        id: genId(), num1, num2, operation: 'subtract',
        correctAnswer: num1 - num2, displayOp: '−',
        expression: `${num1} − ${num2}`,
      };
    }
    case 'multiply': {
      const num1 = randInt(min, Math.min(max, 12));
      const num2 = randInt(min, Math.min(max, 12));
      return {
        id: genId(), num1, num2, operation: 'multiply',
        correctAnswer: num1 * num2, displayOp: '×',
        expression: `${num1} × ${num2}`,
      };
    }
    case 'divide': {
      const divisor = randInt(Math.max(min, 2), Math.min(max, 12));
      const quotient = randInt(min, Math.min(max, 12));
      return {
        id: genId(), num1: divisor * quotient, num2: divisor, operation: 'divide',
        correctAnswer: quotient, displayOp: '÷',
        expression: `${divisor * quotient} ÷ ${divisor}`,
      };
    }
    case 'compare': {
      const num1 = randInt(min, max);
      const num2 = randInt(min, max);
      return {
        id: genId(), num1, num2, operation: 'compare',
        correctAnswer: num1 > num2, displayOp: '?',
        compareLeft: num1, compareRight: num2,
        expression: `${num1} 〇 ${num2}`,
      };
    }
    default: {
      const num1 = randInt(min, max);
      const num2 = randInt(min, max);
      return {
        id: genId(), num1, num2, operation: 'add',
        correctAnswer: num1 + num2, displayOp: '+',
        expression: `${num1} + ${num2}`,
      };
    }
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Generate questions from a specific curriculum topic.
 */
export function generateTopicQuestions(topic: CurriculumTopic, count: number): MathQuestion[] {
  const questions: MathQuestion[] = [];
  const effectiveCount = Math.min(count, topic.questionCount * 2);
  for (let i = 0; i < effectiveCount; i++) {
    questions.push(generateForTopic(topic));
  }
  return questions;
}

/**
 * Generate mixed questions from a grade/semester.
 * Distributes questions evenly across all topics in that semester.
 */
export function generateCurriculumQuestions(
  grade: Grade,
  semester: Semester,
  count: number
): MathQuestion[] {
  const topics = getTopicsForGrade(grade, semester);
  if (topics.length === 0) return [];

  const questions: MathQuestion[] = [];
  const perTopic = Math.max(1, Math.ceil(count / topics.length));

  // Shuffle topics so order varies
  const shuffled = [...topics].sort(() => Math.random() - 0.5);

  for (const topic of shuffled) {
    const needed = Math.min(perTopic, count - questions.length);
    if (needed <= 0) break;
    questions.push(...generateTopicQuestions(topic, needed));
  }

  // Trim to exact count if we overshot
  return questions.slice(0, count);
}
