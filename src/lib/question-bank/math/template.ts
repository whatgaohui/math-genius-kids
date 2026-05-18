// ═══════════════════════════════════════════════════════════════════════════════
// Math Question Bank — Template (数据模板)
// ─────────────────────────────────────────────────────────────────────────────
// This file serves as the TEMPLATE showing data collectors how to format math
// questions for the 知识小勇士 app. It includes example data for ALL 6 grades,
// both semesters (12 grade-semester combinations), covering the 人教版 (PEP)
// curriculum.
//
// Topics are sourced from: /src/lib/curriculum-config.ts
// ═══════════════════════════════════════════════════════════════════════════════

import type { Grade, Semester, TopicMeta, QuestionBankTemplate } from '../types';

// ─── MathQuestionData ───────────────────────────────────────────────────────
/**
 * Describes the data format for a single math question entry.
 * This is the "raw" data format that data collectors should follow when
 * adding questions to the bank. At runtime, this data is converted to
 * a full `MathQuestion` (from ../types) by the question bank engine.
 *
 * @example
 * ```ts
 * const q: MathQuestionData = {
 *   topicId: 'math-1a-add10',
 *   type: 'add',
 *   expression: '3 + 5',
 *   answer: 8,
 *   options: [6, 7, 8, 9],
 *   difficulty: 'easy',
 * };
 * ```
 */
export interface MathQuestionData {
  /** The curriculum topic this question belongs to (must match a topicId from curriculum-config.ts) */
  topicId: string;

  /**
   * The operation type of the question.
   * - `'add'` — Addition (加法)
   * - `'subtract'` — Subtraction (减法)
   * - `'multiply'` — Multiplication (乘法)
   * - `'divide'` — Division (除法)
   * - `'compare'` — Comparison (比较大小), answer is 1 (true/>) or 0 (false/<)
   * - `'equation'` — Solve for unknown (解方程)
   * - `'mixed'` — Mixed/compound operations (混合运算)
   */
  type: 'add' | 'subtract' | 'multiply' | 'divide' | 'compare' | 'equation' | 'mixed';

  /**
   * The mathematical expression displayed to the student.
   * For arithmetic: "3 + 5" or "23 − 17"
   * For compare: "3 + 5 〇 10" (student picks >, <, or =)
   * For equation: "x + 5 = 12，x = ?"
   * For concept questions: "长方形有几条边？"
   */
  expression: string;

  /**
   * The correct answer.
   * - For arithmetic types: the numerical result (e.g., 8)
   * - For compare: 1 if left > right, 0 if left < right (never equal in our data)
   * - For equation: the value of x
   * - For concept questions: the correct number (e.g., 4 for sides of rectangle)
   */
  answer: number;

  /**
   * Array of exactly 4 number options for multiple choice.
   * The correct answer MUST be one of these values.
   * Distractors should be plausible but incorrect (close to the correct answer).
   *
   * @example
   * // For 3 + 5 = 8
   * options: [6, 7, 8, 9]   // 8 is correct at index 2
   *
   * // For compare "7 〇 3" where 7 > 3
   * options: [0, 1]          // 1 = "greater than" is correct
   */
  options: number[];

  /**
   * Estimated difficulty level.
   * - `'easy'` — Straightforward, single-step, small numbers
   * - `'medium'` — Multi-step or larger numbers
   * - `'hard'` — Complex operations, large numbers, or abstract concepts
   */
  difficulty: 'easy' | 'medium' | 'hard';
}

// ─── Helper: create TopicMeta ────────────────────────────────────────────────

function topic(
  id: string,
  name: string,
  description: string,
  emoji: string,
  grade: Grade,
  semester: Semester,
  difficulty: 'easy' | 'medium' | 'hard' = 'easy',
): TopicMeta {
  return { id, name, description, emoji, subject: 'math', grade, semester, difficulty };
}

// ─── Helper: shorthand for question data ─────────────────────────────────────

function q(
  topicId: string,
  type: MathQuestionData['type'],
  expression: string,
  answer: number,
  options: number[],
  difficulty: MathQuestionData['difficulty'],
): MathQuestionData {
  return { topicId, type, expression, answer, options, difficulty };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MATH_BANK_TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * The complete math question bank template for the 知识小勇士 app.
 *
 * Structure:
 *   meta  → Template metadata (id, version, subject, etc.)
 *   data  → Record<Grade, Record<topicId, { topic: TopicMeta, questions: MathQuestionData[] }>>
 *
 * Data collectors should follow this exact format when adding new questions.
 * Each grade key (1–6) maps to a record of topicId → { topic, questions }.
 *
 * Guidelines for adding questions:
 * 1. Always reference an existing topicId from curriculum-config.ts
 * 2. Provide exactly 4 options (one must be the correct answer)
 * 3. Distractors should be close to the correct answer to create meaningful choices
 * 4. Difficulty must match the target grade level
 * 5. For compare questions, answer=1 means "left > right", answer=0 means "left < right"
 */

export const MATH_BANK_TEMPLATE: QuestionBankTemplate<MathQuestionData> = {
  meta: {
    id: 'math-pep-v1',
    name: '人教版数学题库',
    version: '1.0.0',
    subject: 'math',
    description: '基于人教版(PEP)小学数学课程标准的题库，涵盖一年级至六年级上下册所有知识点',
    source: '人教版小学数学教材',
    author: '知识小勇士教研团队',
    lastUpdated: '2025-01-01',
  },

  data: {
    // ═══════════════════════════════════════════════════════════════════════
    // 一年级上册 (Grade 1, Semester 1)
    // ═══════════════════════════════════════════════════════════════════════
    1: {
      // ── math-1a-count: 10以内的认识 ──────────────────────────────────────
      'math-1a-count': {
        topic: topic(
          'math-1a-count', '10以内的认识',
          '认识1-10各数，理解数的意义和顺序',
          '🔢', 1, '上册', 'easy',
        ),
        questions: [
          q('math-1a-count', 'compare', '3 〇 7', 0, [0, 1], 'easy'),
          q('math-1a-count', 'compare', '9 〇 5', 1, [0, 1], 'easy'),
          q('math-1a-count', 'compare', '6 〇 6', 1, [0, 1], 'easy'),
        ],
      },

      // ── math-1a-add10: 10以内加减法 ──────────────────────────────────────
      'math-1a-add10': {
        topic: topic(
          'math-1a-add10', '10以内加减法',
          '10以内的加法和减法，凑十法',
          '➕', 1, '上册', 'easy',
        ),
        questions: [
          q('math-1a-add10', 'add', '3 + 5', 8, [7, 8, 9, 6], 'easy'),
          q('math-1a-add10', 'add', '2 + 6', 8, [7, 8, 9, 5], 'easy'),
          q('math-1a-add10', 'subtract', '9 − 4', 5, [4, 5, 6, 3], 'easy'),
        ],
      },

      // ── math-1a-shape: 认识图形 ──────────────────────────────────────────
      'math-1a-shape': {
        topic: topic(
          'math-1a-shape', '认识图形',
          '认识长方体、正方体、圆柱和球',
          '🔷', 1, '上册', 'easy',
        ),
        questions: [
          q('math-1a-shape', 'equation', '正方体有几个面？', 6, [4, 5, 6, 8], 'easy'),
          q('math-1a-shape', 'equation', '长方体有几条边？', 12, [8, 10, 12, 6], 'easy'),
          q('math-1a-shape', 'equation', '圆柱上面是什么形状？(1=圆 2=方 3=三角)', 1, [1, 2, 3, 4], 'easy'),
        ],
      },

      // ── math-1b-count20: 20以内的认识 ────────────────────────────────────
      'math-1b-count20': {
        topic: topic(
          'math-1b-count20', '20以内的认识',
          '认识11-20各数，理解数位',
          '🔢', 1, '下册', 'easy',
        ),
        questions: [
          q('math-1b-count20', 'compare', '15 〇 12', 1, [0, 1], 'easy'),
          q('math-1b-count20', 'compare', '8 〇 18', 0, [0, 1], 'easy'),
          q('math-1b-count20', 'equation', '1个十和5个一组成几？', 15, [10, 15, 5, 51], 'easy'),
        ],
      },

      // ── math-1b-add20: 20以内进退位加减法 ────────────────────────────────
      'math-1b-add20': {
        topic: topic(
          'math-1b-add20', '20以内进退位加减法',
          '20以内进位加法和退位减法',
          '➕', 1, '下册', 'easy',
        ),
        questions: [
          q('math-1b-add20', 'add', '8 + 5', 13, [12, 13, 14, 11], 'easy'),
          q('math-1b-add20', 'add', '7 + 6', 13, [11, 12, 13, 14], 'easy'),
          q('math-1b-add20', 'subtract', '15 − 8', 7, [6, 7, 8, 9], 'easy'),
        ],
      },

      // ── math-1b-classify: 分类与整理 ────────────────────────────────────
      'math-1b-classify': {
        topic: topic(
          'math-1b-classify', '分类与整理',
          '简单的分类和统计',
          '📊', 1, '下册', 'easy',
        ),
        questions: [
          q('math-1b-classify', 'equation',
            '有3个苹果、5个香蕉，水果一共几个？', 8, [7, 8, 9, 6], 'easy'),
          q('math-1b-classify', 'equation',
            '红球4个，蓝球比红球多2个，蓝球几个？', 6, [5, 6, 7, 2], 'easy'),
          q('math-1b-classify', 'equation',
            '三角形有3个，正方形和三角形一样多，一共几个图形？', 6, [3, 5, 6, 9], 'easy'),
        ],
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 二年级上册 (Grade 2, Semester 1)
    // ═══════════════════════════════════════════════════════════════════════
    2: {
      // ── math-2a-length: 长度单位 ─────────────────────────────────────────
      'math-2a-length': {
        topic: topic(
          'math-2a-length', '长度单位',
          '厘米和米的认识与换算',
          '📏', 2, '上册', 'easy',
        ),
        questions: [
          q('math-2a-length', 'equation', '1米 = ?厘米', 100, [10, 50, 100, 1000], 'easy'),
          q('math-2a-length', 'compare', '50厘米 〇 1米', 0, [0, 1], 'easy'),
          q('math-2a-length', 'equation', '2米 = ?厘米', 200, [20, 100, 200, 1000], 'easy'),
        ],
      },

      // ── math-2a-add100: 100以内加减法 ────────────────────────────────────
      'math-2a-add100': {
        topic: topic(
          'math-2a-add100', '100以内加减法',
          '100以内的加法和减法笔算',
          '➕', 2, '上册', 'easy',
        ),
        questions: [
          q('math-2a-add100', 'add', '36 + 42', 78, [76, 78, 80, 74], 'easy'),
          q('math-2a-add100', 'add', '25 + 53', 78, [77, 78, 79, 88], 'easy'),
          q('math-2a-add100', 'subtract', '85 − 32', 53, [51, 52, 53, 63], 'easy'),
        ],
      },

      // ── math-2a-angle: 角的初步认识 ──────────────────────────────────────
      'math-2a-angle': {
        topic: topic(
          'math-2a-angle', '角的初步认识',
          '认识直角、锐角和钝角',
          '📐', 2, '上册', 'easy',
        ),
        questions: [
          q('math-2a-angle', 'equation', '直角等于多少度？', 90, [45, 60, 90, 180], 'easy'),
          q('math-2a-angle', 'equation', '三角形有几个角？', 3, [2, 3, 4, 5], 'easy'),
          q('math-2a-angle', 'compare', '锐角 〇 直角', 0, [0, 1], 'easy'),
        ],
      },

      // ── math-2a-mul9: 表内乘法 ───────────────────────────────────────────
      'math-2a-mul9': {
        topic: topic(
          'math-2a-mul9', '表内乘法',
          '1-9的乘法口诀和乘法应用',
          '✖️', 2, '上册', 'easy',
        ),
        questions: [
          q('math-2a-mul9', 'multiply', '3 × 7', 21, [18, 21, 24, 27], 'easy'),
          q('math-2a-mul9', 'multiply', '6 × 8', 48, [42, 45, 48, 56], 'easy'),
          q('math-2a-mul9', 'multiply', '9 × 9', 81, [72, 79, 81, 90], 'easy'),
        ],
      },

      // ── math-2b-div9: 表内除法 ───────────────────────────────────────────
      'math-2b-div9': {
        topic: topic(
          'math-2b-div9', '表内除法',
          '用乘法口诀求商',
          '➗', 2, '下册', 'easy',
        ),
        questions: [
          q('math-2b-div9', 'divide', '24 ÷ 6', 4, [3, 4, 5, 6], 'easy'),
          q('math-2b-div9', 'divide', '36 ÷ 9', 4, [3, 4, 6, 9], 'easy'),
          q('math-2b-div9', 'divide', '56 ÷ 8', 7, [6, 7, 8, 9], 'easy'),
        ],
      },

      // ── math-2b-mix: 混合运算 ────────────────────────────────────────────
      'math-2b-mix': {
        topic: topic(
          'math-2b-mix', '混合运算',
          '加减乘除混合运算及运算顺序',
          '🔀', 2, '下册', 'medium',
        ),
        questions: [
          q('math-2b-mix', 'mixed', '3 + 4 × 2', 11, [9, 10, 11, 14], 'medium'),
          q('math-2b-mix', 'mixed', '15 − 6 ÷ 3', 13, [3, 9, 11, 13], 'medium'),
          q('math-2b-mix', 'mixed', '(5 + 3) × 2', 16, [10, 11, 13, 16], 'medium'),
        ],
      },

      // ── math-2b-weight: 克和千克 ─────────────────────────────────────────
      'math-2b-weight': {
        topic: topic(
          'math-2b-weight', '克和千克',
          '质量单位的认识和使用',
          '⚖️', 2, '下册', 'easy',
        ),
        questions: [
          q('math-2b-weight', 'equation', '1千克 = ?克', 1000, [10, 100, 500, 1000], 'easy'),
          q('math-2b-weight', 'compare', '500克 〇 1千克', 0, [0, 1], 'easy'),
          q('math-2b-weight', 'equation', '3千克 = ?克', 3000, [300, 1000, 2000, 3000], 'easy'),
        ],
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 三年级上册 (Grade 3, Semester 1)
    // ═══════════════════════════════════════════════════════════════════════
    3: {
      // ── math-3a-time: 时、分、秒 ─────────────────────────────────────────
      'math-3a-time': {
        topic: topic(
          'math-3a-time', '时、分、秒',
          '时间单位的认识和换算',
          '⏰', 3, '上册', 'easy',
        ),
        questions: [
          q('math-3a-time', 'equation', '1时 = ?分', 60, [10, 30, 60, 100], 'easy'),
          q('math-3a-time', 'equation', '1分 = ?秒', 60, [10, 30, 60, 100], 'easy'),
          q('math-3a-time', 'equation', '2时30分 = ?分', 150, [120, 130, 150, 230], 'medium'),
        ],
      },

      // ── math-3a-add10000: 万以内加减法 ───────────────────────────────────
      'math-3a-add10000': {
        topic: topic(
          'math-3a-add10000', '万以内加减法',
          '万以内的加法和减法',
          '🔢', 3, '上册', 'medium',
        ),
        questions: [
          q('math-3a-add10000', 'add', '256 + 378', 634, [524, 624, 634, 644], 'medium'),
          q('math-3a-add10000', 'add', '1205 + 867', 2072, [1962, 2062, 2072, 2172], 'medium'),
          q('math-3a-add10000', 'subtract', '830 − 456', 374, [364, 374, 384, 474], 'medium'),
        ],
      },

      // ── math-3a-mul1: 多位数乘一位数 ─────────────────────────────────────
      'math-3a-mul1': {
        topic: topic(
          'math-3a-mul1', '多位数乘一位数',
          '两三位数乘一位数的笔算',
          '✖️', 3, '上册', 'medium',
        ),
        questions: [
          q('math-3a-mul1', 'multiply', '23 × 3', 69, [56, 66, 69, 92], 'medium'),
          q('math-3a-mul1', 'multiply', '156 × 4', 624, [524, 604, 624, 724], 'medium'),
          q('math-3a-mul1', 'multiply', '312 × 5', 1560, [1460, 1500, 1560, 1660], 'medium'),
        ],
      },

      // ── math-3a-rect: 长方形和正方形 ──────────────────────────────────────
      'math-3a-rect': {
        topic: topic(
          'math-3a-rect', '长方形和正方形',
          '四边形的特征和周长计算',
          '📐', 3, '上册', 'medium',
        ),
        questions: [
          q('math-3a-rect', 'equation', '长5cm宽3cm的长方形，周长=?cm', 16, [15, 16, 20, 8], 'medium'),
          q('math-3a-rect', 'equation', '边长4cm的正方形，周长=?cm', 16, [8, 12, 16, 20], 'medium'),
          q('math-3a-rect', 'equation', '长方形有几种不同的长度？', 2, [1, 2, 3, 4], 'easy'),
        ],
      },

      // ── math-3b-div1: 除数是一位数的除法 ─────────────────────────────────
      'math-3b-div1': {
        topic: topic(
          'math-3b-div1', '除数是一位数的除法',
          '两三位数除以一位数',
          '➗', 3, '下册', 'medium',
        ),
        questions: [
          q('math-3b-div1', 'divide', '84 ÷ 7', 12, [11, 12, 13, 14], 'medium'),
          q('math-3b-div1', 'divide', '156 ÷ 3', 52, [42, 48, 52, 62], 'medium'),
          q('math-3b-div1', 'divide', '375 ÷ 5', 75, [65, 70, 75, 85], 'medium'),
        ],
      },

      // ── math-3b-mul2: 两位数乘两位数 ─────────────────────────────────────
      'math-3b-mul2': {
        topic: topic(
          'math-3b-mul2', '两位数乘两位数',
          '两位数乘两位数的笔算',
          '✖️', 3, '下册', 'medium',
        ),
        questions: [
          q('math-3b-mul2', 'multiply', '23 × 15', 345, [295, 335, 345, 355], 'medium'),
          q('math-3b-mul2', 'multiply', '34 × 22', 748, [648, 708, 748, 758], 'medium'),
          q('math-3b-mul2', 'multiply', '45 × 36', 1620, [1520, 1580, 1620, 1720], 'medium'),
        ],
      },

      // ── math-3b-frac: 分数的初步认识 ──────────────────────────────────────
      'math-3b-frac': {
        topic: topic(
          'math-3b-frac', '分数的初步认识',
          '认识几分之一和几分之几',
          '🍕', 3, '下册', 'easy',
        ),
        questions: [
          q('math-3b-frac', 'compare', '1/2 〇 1/3', 1, [0, 1], 'easy'),
          q('math-3b-frac', 'compare', '2/5 〇 3/5', 0, [0, 1], 'easy'),
          q('math-3b-frac', 'compare', '1/4 〇 1/2', 0, [0, 1], 'easy'),
        ],
      },

      // ── math-3b-area: 面积 ───────────────────────────────────────────────
      'math-3b-area': {
        topic: topic(
          'math-3b-area', '面积',
          '面积的意义和计算',
          '📏', 3, '下册', 'medium',
        ),
        questions: [
          q('math-3b-area', 'equation', '长5cm宽3cm的长方形，面积=?平方厘米', 15, [15, 16, 20, 8], 'medium'),
          q('math-3b-area', 'equation', '边长4cm的正方形，面积=?平方厘米', 16, [8, 12, 16, 20], 'medium'),
          q('math-3b-area', 'equation', '1平方米 = ?平方分米', 100, [10, 50, 100, 1000], 'easy'),
        ],
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 四年级上册 (Grade 4, Semester 1)
    // ═══════════════════════════════════════════════════════════════════════
    4: {
      // ── math-4a-large: 大数的认识 ────────────────────────────────────────
      'math-4a-large': {
        topic: topic(
          'math-4a-large', '大数的认识',
          '亿以内及亿以上数的认识和运算',
          '🔢', 4, '上册', 'hard',
        ),
        questions: [
          q('math-4a-large', 'add', '23560 + 18740', 42300, [41300, 41800, 42300, 43300], 'hard'),
          q('math-4a-large', 'subtract', '50000 − 23650', 26350, [25350, 26350, 27350, 36350], 'hard'),
          q('math-4a-large', 'equation', '1万 = ?个百', 100, [10, 50, 100, 1000], 'medium'),
        ],
      },

      // ── math-4a-angle2: 角的度量 ─────────────────────────────────────────
      'math-4a-angle2': {
        topic: topic(
          'math-4a-angle2', '角的度量',
          '线段、直线、射线和角的分类',
          '📐', 4, '上册', 'medium',
        ),
        questions: [
          q('math-4a-angle2', 'equation', '平角等于多少度？', 180, [90, 120, 150, 180], 'medium'),
          q('math-4a-angle2', 'equation', '周角等于多少度？', 360, [180, 270, 360, 400], 'medium'),
          q('math-4a-angle2', 'compare', '锐角 〇 钝角', 0, [0, 1], 'easy'),
        ],
      },

      // ── math-4a-mul2: 三位数乘两位数 ──────────────────────────────────────
      'math-4a-mul2': {
        topic: topic(
          'math-4a-mul2', '三位数乘两位数',
          '三位数乘两位数的笔算',
          '✖️', 4, '上册', 'hard',
        ),
        questions: [
          q('math-4a-mul2', 'multiply', '123 × 45', 5535, [5035, 5335, 5535, 5835], 'hard'),
          q('math-4a-mul2', 'multiply', '256 × 34', 8704, [8604, 8704, 8804, 9704], 'hard'),
          q('math-4a-mul2', 'multiply', '308 × 25', 7700, [6500, 7200, 7700, 8200], 'hard'),
        ],
      },

      // ── math-4a-div2: 除数是两位数的除法 ─────────────────────────────────
      'math-4a-div2': {
        topic: topic(
          'math-4a-div2', '除数是两位数的除法',
          '三位数除以两位数的笔算',
          '➗', 4, '上册', 'hard',
        ),
        questions: [
          q('math-4a-div2', 'divide', '720 ÷ 24', 30, [25, 28, 30, 32], 'hard'),
          q('math-4a-div2', 'divide', '896 ÷ 28', 32, [28, 30, 32, 36], 'hard'),
          q('math-4a-div2', 'divide', '945 ÷ 35', 27, [25, 27, 29, 35], 'hard'),
        ],
      },

      // ── math-4b-order: 四则运算 ──────────────────────────────────────────
      'math-4b-order': {
        topic: topic(
          'math-4b-order', '四则运算',
          '含括号的四则混合运算顺序',
          '🔀', 4, '下册', 'hard',
        ),
        questions: [
          q('math-4b-order', 'mixed', '(12 + 8) × 5', 100, [60, 80, 100, 68], 'hard'),
          q('math-4b-order', 'mixed', '100 − 36 ÷ 6', 94, [64, 94, 10, 82], 'hard'),
          q('math-4b-order', 'mixed', '48 ÷ (8 − 2)', 8, [4, 6, 8, 12], 'hard'),
        ],
      },

      // ── math-4b-decimal: 小数的意义和性质 ─────────────────────────────────
      'math-4b-decimal': {
        topic: topic(
          'math-4b-decimal', '小数的意义和性质',
          '小数的意义、读写和大小比较',
          '🔵', 4, '下册', 'medium',
        ),
        questions: [
          q('math-4b-decimal', 'compare', '0.3 〇 0.5', 0, [0, 1], 'easy'),
          q('math-4b-decimal', 'compare', '1.2 〇 0.9', 1, [0, 1], 'easy'),
          q('math-4b-decimal', 'compare', '2.05 〇 2.5', 0, [0, 1], 'medium'),
        ],
      },

      // ── math-4b-decimal-add: 小数的加减法 ─────────────────────────────────
      'math-4b-decimal-add': {
        topic: topic(
          'math-4b-decimal-add', '小数的加减法',
          '小数加减法的笔算',
          '➕', 4, '下册', 'medium',
        ),
        questions: [
          q('math-4b-decimal-add', 'add', '3.5 + 2.8', 6.3, [5.3, 6.3, 6.13, 7.3], 'medium'),
          q('math-4b-decimal-add', 'add', '7.26 + 4.58', 11.84, [10.84, 11.74, 11.84, 12.84], 'medium'),
          q('math-4b-decimal-add', 'subtract', '8.4 − 3.6', 4.8, [4.2, 4.8, 5.2, 5.8], 'medium'),
        ],
      },

      // ── math-4b-triangle: 三角形 ─────────────────────────────────────────
      'math-4b-triangle': {
        topic: topic(
          'math-4b-triangle', '三角形',
          '三角形的分类、内角和',
          '🔺', 4, '下册', 'medium',
        ),
        questions: [
          q('math-4b-triangle', 'equation', '三角形内角和是多少度？', 180, [90, 120, 180, 360], 'medium'),
          q('math-4b-triangle', 'equation', '等边三角形每个角是多少度？', 60, [45, 60, 90, 120], 'medium'),
          q('math-4b-triangle', 'equation', '三角形有几条边？', 3, [2, 3, 4, 5], 'easy'),
        ],
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 五年级上册 (Grade 5, Semester 1)
    // ═══════════════════════════════════════════════════════════════════════
    5: {
      // ── math-5a-decimal-mul: 小数乘法 ────────────────────────────────────
      'math-5a-decimal-mul': {
        topic: topic(
          'math-5a-decimal-mul', '小数乘法',
          '小数乘整数和小数乘小数',
          '✖️', 5, '上册', 'hard',
        ),
        questions: [
          q('math-5a-decimal-mul', 'multiply', '2.5 × 4', 10, [8, 9, 10, 12], 'medium'),
          q('math-5a-decimal-mul', 'multiply', '1.2 × 3', 3.6, [2.6, 3.6, 3.2, 4.2], 'medium'),
          q('math-5a-decimal-mul', 'multiply', '3.6 × 2.5', 9, [8, 9, 10, 12], 'hard'),
        ],
      },

      // ── math-5a-decimal-div: 小数除法 ────────────────────────────────────
      'math-5a-decimal-div': {
        topic: topic(
          'math-5a-decimal-div', '小数除法',
          '小数除以整数和整数除以小数',
          '➗', 5, '上册', 'hard',
        ),
        questions: [
          q('math-5a-decimal-div', 'divide', '7.2 ÷ 4', 1.8, [1.2, 1.8, 2.8, 3.6], 'medium'),
          q('math-5a-decimal-div', 'divide', '3.6 ÷ 1.2', 3, [2, 3, 4, 30], 'medium'),
          q('math-5a-decimal-div', 'divide', '6.3 ÷ 0.7', 9, [7, 8, 9, 90], 'hard'),
        ],
      },

      // ── math-5a-equation: 简易方程 ───────────────────────────────────────
      'math-5a-equation': {
        topic: topic(
          'math-5a-equation', '简易方程',
          '用字母表示数和解简易方程',
          '⚖️', 5, '上册', 'medium',
        ),
        questions: [
          q('math-5a-equation', 'equation', 'x + 15 = 32，x = ?', 17, [15, 17, 20, 47], 'medium'),
          q('math-5a-equation', 'equation', 'x − 8 = 25，x = ?', 33, [17, 25, 33, 200], 'medium'),
          q('math-5a-equation', 'equation', 'x × 6 = 42，x = ?', 7, [6, 7, 8, 36], 'medium'),
        ],
      },

      // ── math-5a-polygon: 多边形的面积 ────────────────────────────────────
      'math-5a-polygon': {
        topic: topic(
          'math-5a-polygon', '多边形的面积',
          '平行四边形、三角形和梯形面积',
          '📐', 5, '上册', 'hard',
        ),
        questions: [
          q('math-5a-polygon', 'equation', '底8cm高5cm的三角形，面积=?平方厘米', 20, [13, 20, 40, 80], 'hard'),
          q('math-5a-polygon', 'equation', '底10cm高6cm的平行四边形，面积=?', 60, [16, 30, 60, 120], 'hard'),
          q('math-5a-polygon', 'equation', '上底4cm下底8cm高5cm的梯形，面积=?', 30, [20, 30, 40, 60], 'hard'),
        ],
      },

      // ── math-5b-observation: 观察物体 ────────────────────────────────────
      'math-5b-observation': {
        topic: topic(
          'math-5b-observation', '观察物体',
          '从不同方向观察物体和立体图形',
          '👁️', 5, '下册', 'easy',
        ),
        questions: [
          q('math-5b-observation', 'equation', '正方体从前面看是什么形状？(1=正方形 2=圆形 3=三角形)', 1, [1, 2, 3, 4], 'easy'),
          q('math-5b-observation', 'equation', '圆柱从侧面看是什么形状？(1=正方形 2=长方形 3=圆形)', 2, [1, 2, 3, 4], 'easy'),
          q('math-5b-observation', 'equation', '观察一个物体最少需要从几个方向看？', 3, [1, 2, 3, 4], 'easy'),
        ],
      },

      // ── math-5b-frac-meaning: 分数的意义和性质 ───────────────────────────
      'math-5b-frac-meaning': {
        topic: topic(
          'math-5b-frac-meaning', '分数的意义和性质',
          '分数的意义、真分数和假分数',
          '🍕', 5, '下册', 'medium',
        ),
        questions: [
          q('math-5b-frac-meaning', 'compare', '3/4 〇 2/3', 1, [0, 1], 'medium'),
          q('math-5b-frac-meaning', 'compare', '5/6 〇 4/5', 1, [0, 1], 'medium'),
          q('math-5b-frac-meaning', 'compare', '7/8 〇 8/9', 0, [0, 1], 'hard'),
        ],
      },

      // ── math-5b-frac-add: 分数的加法和减法 ───────────────────────────────
      'math-5b-frac-add': {
        topic: topic(
          'math-5b-frac-add', '分数的加法和减法',
          '同分母和异分母分数加减法',
          '➕', 5, '下册', 'hard',
        ),
        questions: [
          q('math-5b-frac-add', 'add', '2/5 + 1/5 = ?/5', 3, [2, 3, 4, 5], 'medium'),
          q('math-5b-frac-add', 'add', '1/2 + 1/3 = ?/6', 5, [2, 3, 4, 5], 'hard'),
          q('math-5b-frac-add', 'subtract', '5/6 − 1/3 = ?/6', 3, [1, 2, 3, 4], 'medium'),
        ],
      },

      // ── math-5b-stats: 统计与概率 ────────────────────────────────────────
      'math-5b-stats': {
        topic: topic(
          'math-5b-stats', '统计与概率',
          '折线统计图和可能性的认识',
          '📊', 5, '下册', 'medium',
        ),
        questions: [
          q('math-5b-stats', 'equation', '一组数据：2,3,3,5,7，中位数是？', 3, [2, 3, 4, 5], 'medium'),
          q('math-5b-stats', 'equation', '一组数据：2,3,3,5,7，平均数是？', 4, [3, 4, 5, 6], 'medium'),
          q('math-5b-stats', 'equation', '掷一枚骰子，出现偶数的可能有几种？', 3, [1, 2, 3, 6], 'easy'),
        ],
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 六年级上册 (Grade 6, Semester 1)
    // ═══════════════════════════════════════════════════════════════════════
    6: {
      // ── math-6a-frac-mul: 分数乘法 ───────────────────────────────────────
      'math-6a-frac-mul': {
        topic: topic(
          'math-6a-frac-mul', '分数乘法',
          '分数乘整数和分数乘分数',
          '✖️', 6, '上册', 'hard',
        ),
        questions: [
          q('math-6a-frac-mul', 'multiply', '2/3 × 3/4 = ?/12', 6, [5, 6, 8, 9], 'hard'),
          q('math-6a-frac-mul', 'multiply', '3/5 × 10 = ?/5', 6, [4, 6, 8, 30], 'hard'),
          q('math-6a-frac-mul', 'multiply', '4/7 × 7/8 = ?/14', 4, [3, 4, 6, 8], 'hard'),
        ],
      },

      // ── math-6a-frac-div: 分数除法 ───────────────────────────────────────
      'math-6a-frac-div': {
        topic: topic(
          'math-6a-frac-div', '分数除法',
          '分数除以整数和整数除以分数',
          '➗', 6, '上册', 'hard',
        ),
        questions: [
          q('math-6a-frac-div', 'divide', '2/3 ÷ 4 = ?/6', 1, [1, 2, 3, 6], 'hard'),
          q('math-6a-frac-div', 'divide', '5 ÷ 1/3 = ?', 15, [5, 8, 15, 45], 'hard'),
          q('math-6a-frac-div', 'divide', '3/4 ÷ 3/8 = ?', 2, [1, 2, 3, 6], 'hard'),
        ],
      },

      // ── math-6a-percent: 百分数 ──────────────────────────────────────────
      'math-6a-percent': {
        topic: topic(
          'math-6a-percent', '百分数',
          '百分数的意义、应用和转化',
          '💯', 6, '上册', 'hard',
        ),
        questions: [
          q('math-6a-percent', 'equation', '25% × 200 = ?', 50, [25, 50, 75, 200], 'hard'),
          q('math-6a-percent', 'equation', '3/5 = ?%', 60, [35, 50, 60, 75], 'hard'),
          q('math-6a-percent', 'equation', '80% × 150 = ?', 120, [100, 110, 120, 130], 'hard'),
        ],
      },

      // ── math-6a-circle: 圆 ───────────────────────────────────────────────
      'math-6a-circle': {
        topic: topic(
          'math-6a-circle', '圆',
          '圆的认识、周长和面积',
          '⭕', 6, '上册', 'hard',
        ),
        questions: [
          q('math-6a-circle', 'equation', '直径6cm的圆，周长=?cm (取3.14)', 18.84, [12.56, 18.84, 28.26, 37.68], 'hard'),
          q('math-6a-circle', 'equation', '半径5cm的圆，面积=?平方厘米 (取3.14)', 78.5, [31.4, 78.5, 153.86, 314], 'hard'),
          q('math-6a-circle', 'equation', '圆的周长公式中，π约等于多少？(取2位小数)', 3.14, [3.12, 3.14, 3.16, 3.41], 'medium'),
        ],
      },

      // ── math-6b-negative: 负数 ───────────────────────────────────────────
      'math-6b-negative': {
        topic: topic(
          'math-6b-negative', '负数',
          '认识正负数及其应用',
          '🌡️', 6, '下册', 'medium',
        ),
        questions: [
          q('math-6b-negative', 'compare', '(-3) 〇 (-7)', 1, [0, 1], 'medium'),
          q('math-6b-negative', 'compare', '(-5) 〇 2', 0, [0, 1], 'medium'),
          q('math-6b-negative', 'compare', '(-1) 〇 0', 0, [0, 1], 'easy'),
        ],
      },

      // ── math-6b-ratio: 比例 ──────────────────────────────────────────────
      'math-6b-ratio': {
        topic: topic(
          'math-6b-ratio', '比例',
          '比例的意义、基本性质和正反比例',
          '⚖️', 6, '下册', 'hard',
        ),
        questions: [
          q('math-6b-ratio', 'equation', '3:5 = 9:x，x = ?', 15, [10, 12, 15, 18], 'hard'),
          q('math-6b-ratio', 'equation', '2:7 = 8:x，x = ?', 28, [14, 21, 28, 32], 'hard'),
          q('math-6b-ratio', 'equation', '4:6 = x:9，x = ?', 6, [4, 5, 6, 8], 'hard'),
        ],
      },

      // ── math-6b-cylinder: 圆柱与圆锥 ─────────────────────────────────────
      'math-6b-cylinder': {
        topic: topic(
          'math-6b-cylinder', '圆柱与圆锥',
          '圆柱和圆锥的表面积和体积',
          '🥫', 6, '下册', 'hard',
        ),
        questions: [
          q('math-6b-cylinder', 'equation', '圆柱体积=底面积×高，底面积10高5，体积=?', 50, [30, 40, 50, 100], 'hard'),
          q('math-6b-cylinder', 'equation', '圆锥体积是等底等高圆柱体积的几分之几？(填分子)', 1, [1, 2, 3, 4], 'hard'),
          q('math-6b-cylinder', 'equation', '圆柱有几种展开面？', 3, [2, 3, 4, 5], 'medium'),
        ],
      },

      // ── math-6b-stats2: 综合统计 ─────────────────────────────────────────
      'math-6b-stats2': {
        topic: topic(
          'math-6b-stats2', '综合统计',
          '扇形统计图和综合统计应用',
          '📊', 6, '下册', 'hard',
        ),
        questions: [
          q('math-6b-stats2', 'equation', '50人的班级，男生占60%，男生有几人？', 30, [20, 25, 30, 40], 'hard'),
          q('math-6b-stats2', 'equation', '扇形统计图各部分百分比之和等于多少？(填数字)', 100, [50, 90, 100, 360], 'easy'),
          q('math-6b-stats2', 'equation', '一组数据：1,2,3,4,5,6，众数有几个？', 6, [1, 3, 6, 7], 'medium'),
        ],
      },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Validation
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validates the template data for structural integrity.
 * Returns a list of errors and warnings found.
 *
 * Checks performed:
 * - Every question's topicId exists in the template
 * - Every question has exactly 4 options
 * - Every question's answer is among its options
 * - Difficulty levels are valid
 */
export function validateTemplate(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: { totalQuestions: number; totalTopics: number; gradesCovered: number };
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  let totalQuestions = 0;
  let totalTopics = 0;
  const gradesCovered = new Set<number>();

  for (const [gradeStr, topics] of Object.entries(MATH_BANK_TEMPLATE.data)) {
    const grade = Number(gradeStr);
    gradesCovered.add(grade);

    for (const [topicId, topicData] of Object.entries(topics)) {
      totalTopics++;

      // Check that the topic data has questions
      if (!topicData.questions || topicData.questions.length === 0) {
        warnings.push(`Topic "${topicId}" (Grade ${grade}) has no questions`);
        continue;
      }

      for (let i = 0; i < topicData.questions.length; i++) {
        const question = topicData.questions[i];
        totalQuestions++;

        // Check topicId consistency
        if (question.topicId !== topicId) {
          errors.push(
            `Question ${i} in "${topicId}" has mismatched topicId: "${question.topicId}"`,
          );
        }

        // Check options count
        if (question.options.length !== 4) {
          errors.push(
            `Question "${question.expression}" in "${topicId}" has ${question.options.length} options (expected 4)`,
          );
        }

        // Check answer is in options
        if (!question.options.includes(question.answer)) {
          errors.push(
            `Question "${question.expression}" in "${topicId}": answer ${question.answer} not found in options [${question.options}]`,
          );
        }

        // Check valid difficulty
        if (!['easy', 'medium', 'hard'].includes(question.difficulty)) {
          errors.push(
            `Question "${question.expression}" in "${topicId}" has invalid difficulty: "${question.difficulty}"`,
          );
        }

        // Check valid type
        const validTypes = ['add', 'subtract', 'multiply', 'divide', 'compare', 'equation', 'mixed'];
        if (!validTypes.includes(question.type)) {
          errors.push(
            `Question "${question.expression}" in "${topicId}" has invalid type: "${question.type}"`,
          );
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: { totalQuestions, totalTopics, gradesCovered: gradesCovered.size },
  };
}
