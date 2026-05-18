// ═══════════════════════════════════════════════════════════════════════════════
// Math Question Bank — Procedural Generators (程序化生成器)
// ─────────────────────────────────────────────────────────────────────────────
// This file contains procedural question generators that create math questions
// on-the-fly. These serve as a fallback/enhancement to the static template data
// in template.ts.
//
// Ported from: /src/lib/math-curriculum.ts (legacy generators)
// Types:       Uses MathQuestion from ../types (NOT the old math-utils.ts)
//
// Each generator accepts a GeneratorContext (grade, semester, topicId) and
// returns a complete MathQuestion with all required fields populated.
// ═══════════════════════════════════════════════════════════════════════════════

import type { MathQuestion, Grade, Semester } from '../types';

// ─── Generator Context ──────────────────────────────────────────────────────
/** Context passed to every generator so it can fill in BaseQuestion fields. */
export interface GeneratorContext {
  grade: Grade;
  semester: Semester;
  topicId: string;
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

let _idCounter = 0;

function genId(prefix = 'mq'): string {
  return `${prefix}-${Date.now()}-${++_idCounter}`;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

/**
 * Build a complete MathQuestion from partial data.
 * Fills in id, subject, grade, semester, topicId, prompt, and options.
 */
function buildQuestion(
  ctx: GeneratorContext,
  partial: {
    expression: string;
    displayOp: string;
    num1: number;
    num2: number;
    operation: MathQuestion['operation'];
    correctAnswer: number | boolean;
    compareLeft?: number;
    compareRight?: number;
  },
): MathQuestion {
  const { correctAnswer } = partial;

  // Generate 4 multiple-choice options
  let options: number[];
  let correctIndex: number;

  if (typeof correctAnswer === 'boolean') {
    // For compare questions: options are [0, 1] (0 = no/false, 1 = yes/true)
    options = [0, 1];
    correctIndex = correctAnswer ? 1 : 0;
  } else if (partial.operation === 'equation' || partial.operation === 'mixed') {
    // For equation/mixed: generate 4 numeric distractors
    options = generateDistractors(correctAnswer);
    correctIndex = options.indexOf(correctAnswer);
  } else {
    // For arithmetic: generate 4 numeric distractors
    options = generateDistractors(correctAnswer);
    correctIndex = options.indexOf(correctAnswer);
  }

  // Fallback: if correctIndex is -1, force it in
  if (correctIndex === -1) {
    options[0] = typeof correctAnswer === 'boolean' ? (correctAnswer ? 1 : 0) : correctAnswer;
    correctIndex = 0;
  }

  const prompt = partial.expression.includes('=?')
    ? partial.expression
    : `${partial.expression} = ?`;

  return {
    id: genId(),
    subject: 'math',
    grade: ctx.grade,
    semester: ctx.semester,
    topicId: ctx.topicId,
    prompt,
    correctAnswer,
    expression: partial.expression,
    displayOp: partial.displayOp,
    num1: partial.num1,
    num2: partial.num2,
    operation: partial.operation,
    compareLeft: partial.compareLeft,
    compareRight: partial.compareRight,
    options: shuffle(options),
    correctIndex,
  };
}

/**
 * Generate 4 numeric distractors around a correct answer.
 * Produces plausible wrong answers close to the correct value.
 */
function generateDistractors(correct: number): number[] {
  if (correct === 0) {
    return shuffle([0, 1, 2, 3]);
  }

  const isInteger = Number.isInteger(correct);
  const absCorrect = Math.abs(correct);
  const magnitude = absCorrect < 1 ? 0.1 : Math.max(1, Math.floor(absCorrect * 0.1));

  // Generate candidate distractors
  const candidates = new Set<number>();
  candidates.add(correct);

  // Close distractors (off by ±1, ±magnitude)
  const offsets = [1, -1, magnitude, -magnitude, magnitude * 2, -magnitude * 2];
  for (const offset of offsets) {
    let val = correct + offset;
    if (!isInteger) {
      val = parseFloat(val.toFixed(2));
    }
    if (val !== correct && val >= 0) {
      candidates.add(val);
    }
  }

  // Add some percentage-based distractors
  const pctOffsets = [0.8, 1.2, 1.5, 0.5, 0.9, 1.1];
  for (const pct of pctOffsets) {
    let val = Math.round(correct * pct);
    if (!isInteger) {
      val = parseFloat((correct * pct).toFixed(2));
    }
    if (val !== correct && val >= 0) {
      candidates.add(val);
    }
  }

  // Pick 4 unique values, ensuring correct is included
  const arr = Array.from(candidates).filter(v => v >= 0);
  if (arr.length < 4) {
    // Pad with simple offsets
    for (let i = 2; arr.length < 4; i++) {
      const v = isInteger ? correct + i : parseFloat((correct + i * magnitude).toFixed(2));
      if (v >= 0 && !arr.includes(v)) arr.push(v);
    }
  }

  const shuffled = shuffle(arr);
  // Make sure correct is in the result
  const result = shuffled.filter(v => v !== correct).slice(0, 3);
  result.push(correct);

  // Pad to 4 if needed
  while (result.length < 4) {
    const filler = isInteger ? correct + result.length : parseFloat((correct + result.length * magnitude).toFixed(2));
    if (!result.includes(filler)) {
      result.push(filler);
    } else {
      result.push(correct + result.length + 1);
    }
  }

  return result.slice(0, 4);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Generator Functions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a no-carry addition question.
 * Ensures that no digit position sums to 10 or above.
 *
 * @example
 * // Grade 1: 3 + 5 = 8
 * // Grade 2: 32 + 45 = 77
 */
export function generateNoCarryAdd(
  ctx: GeneratorContext,
  min: number = 0,
  max: number = 10,
): MathQuestion {
  for (let attempt = 0; attempt < 20; attempt++) {
    const num1 = randInt(Math.max(min, 0), max);
    const num2 = randInt(Math.max(min, 0), max - num1);

    // Verify no digit-wise carry
    const d1 = String(num1).padStart(String(max).length, '0');
    const d2 = String(num2).padStart(String(max).length, '0');
    let valid = true;
    for (let i = 0; i < d1.length; i++) {
      if (Number(d1[i]) + Number(d2[i]) >= 10) {
        valid = false;
        break;
      }
    }

    if (valid) {
      return buildQuestion(ctx, {
        num1, num2, operation: 'add',
        correctAnswer: num1 + num2, displayOp: '+',
        expression: `${num1} + ${num2}`,
      });
    }
  }

  // Fallback
  const num1 = randInt(1, 5);
  const num2 = randInt(1, 9 - num1);
  return buildQuestion(ctx, {
    num1, num2, operation: 'add',
    correctAnswer: num1 + num2, displayOp: '+',
    expression: `${num1} + ${num2}`,
  });
}

/**
 * Generate a no-borrow subtraction question.
 * Ensures that no digit position in the minuend is less than the subtrahend.
 *
 * @example
 * // Grade 1: 8 − 3 = 5
 * // Grade 2: 85 − 32 = 53
 */
export function generateNoBorrowSub(
  ctx: GeneratorContext,
  min: number = 0,
  max: number = 10,
): MathQuestion {
  for (let attempt = 0; attempt < 20; attempt++) {
    const num1 = randInt(Math.max(min, 1), max);
    const num2 = randInt(Math.max(min, 0), num1);

    const d1 = String(num1).padStart(String(max).length, '0');
    const d2 = String(num2).padStart(String(max).length, '0');
    let valid = true;
    for (let i = 0; i < d1.length; i++) {
      if (Number(d1[i]) < Number(d2[i])) {
        valid = false;
        break;
      }
    }

    if (valid) {
      return buildQuestion(ctx, {
        num1, num2, operation: 'subtract',
        correctAnswer: num1 - num2, displayOp: '−',
        expression: `${num1} − ${num2}`,
      });
    }
  }

  const num1 = randInt(5, max);
  const num2 = randInt(0, Math.min(num1, 4));
  return buildQuestion(ctx, {
    num1, num2, operation: 'subtract',
    correctAnswer: num1 - num2, displayOp: '−',
    expression: `${num1} − ${num2}`,
  });
}

/**
 * Generate a multiplication table question (1-9 × 1-9).
 *
 * @example
 * // 3 × 7 = 21, 6 × 8 = 48
 */
export function generateTableMultiply(ctx: GeneratorContext): MathQuestion {
  const num1 = randInt(2, 9);
  const num2 = randInt(2, 9);
  return buildQuestion(ctx, {
    num1, num2, operation: 'multiply',
    correctAnswer: num1 * num2, displayOp: '×',
    expression: `${num1} × ${num2}`,
  });
}

/**
 * Generate a division table question (results are integers 1-9).
 *
 * @example
 * // 24 ÷ 6 = 4, 56 ÷ 8 = 7
 */
export function generateTableDivide(ctx: GeneratorContext): MathQuestion {
  const quotient = randInt(1, 9);
  const divisor = randInt(2, 9);
  return buildQuestion(ctx, {
    num1: divisor * quotient, num2: divisor, operation: 'divide',
    correctAnswer: quotient, displayOp: '÷',
    expression: `${divisor * quotient} ÷ ${divisor}`,
  });
}

/**
 * Generate a multi-digit number × single-digit multiplication.
 *
 * @param maxMultiplier - Maximum value for the multi-digit operand
 *
 * @example
 * // 23 × 3 = 69, 156 × 4 = 624
 */
export function generateMultiDigitMulOne(
  ctx: GeneratorContext,
  maxMultiplier: number = 500,
): MathQuestion {
  const multiplier = randInt(2, 9);
  const multiDigit = randInt(10, maxMultiplier);
  return buildQuestion(ctx, {
    num1: multiDigit, num2: multiplier, operation: 'multiply',
    correctAnswer: multiDigit * multiplier, displayOp: '×',
    expression: `${multiDigit} × ${multiplier}`,
  });
}

/**
 * Generate a two-or-three digit number ÷ single-digit division.
 *
 * @example
 * // 84 ÷ 7 = 12, 375 ÷ 5 = 75
 */
export function generateTwoDigitDivOne(ctx: GeneratorContext): MathQuestion {
  for (let attempt = 0; attempt < 20; attempt++) {
    const divisor = randInt(2, 9);
    const quotient = randInt(10, 99);
    const dividend = divisor * quotient;
    if (dividend >= 10 && dividend <= 999) {
      return buildQuestion(ctx, {
        num1: dividend, num2: divisor, operation: 'divide',
        correctAnswer: quotient, displayOp: '÷',
        expression: `${dividend} ÷ ${divisor}`,
      });
    }
  }

  const divisor = randInt(2, 9);
  const quotient = randInt(12, 50);
  return buildQuestion(ctx, {
    num1: divisor * quotient, num2: divisor, operation: 'divide',
    correctAnswer: quotient, displayOp: '÷',
    expression: `${divisor * quotient} ÷ ${divisor}`,
  });
}

/**
 * Generate a three-digit × two-digit multiplication.
 *
 * @example
 * // 123 × 45 = 5535, 256 × 34 = 8704
 */
export function generateThreeByTwoMul(ctx: GeneratorContext): MathQuestion {
  const num1 = randInt(100, 999);
  const num2 = randInt(11, 99);
  return buildQuestion(ctx, {
    num1, num2, operation: 'multiply',
    correctAnswer: num1 * num2, displayOp: '×',
    expression: `${num1} × ${num2}`,
  });
}

/**
 * Generate a three-digit ÷ two-digit division (clean result).
 *
 * @example
 * // 720 ÷ 24 = 30, 896 ÷ 28 = 32
 */
export function generateThreeByTwoDiv(ctx: GeneratorContext): MathQuestion {
  for (let attempt = 0; attempt < 20; attempt++) {
    const divisor = randInt(12, 49);
    const quotient = randInt(10, 99);
    const dividend = divisor * quotient;
    if (dividend >= 100 && dividend <= 9999) {
      return buildQuestion(ctx, {
        num1: dividend, num2: divisor, operation: 'divide',
        correctAnswer: quotient, displayOp: '÷',
        expression: `${dividend} ÷ ${divisor}`,
      });
    }
  }

  const divisor = 24;
  const quotient = 30;
  return buildQuestion(ctx, {
    num1: divisor * quotient, num2: divisor, operation: 'divide',
    correctAnswer: quotient, displayOp: '÷',
    expression: `${divisor * quotient} ÷ ${divisor}`,
  });
}

/**
 * Generate a four-operations question with parentheses.
 * Tests order of operations (先乘除后加减，有括号先算括号).
 *
 * @example
 * // (12 + 8) × 5 = 100
 * // a × b + c × d = ?
 */
export function generateFourOpsWithParens(ctx: GeneratorContext): MathQuestion {
  const patterns: (() => {
    expr: string;
    answer: number;
    op: MathQuestion['operation'];
    num1: number;
    num2: number;
  } | null)[] = [
    // (a + b) × c
    () => {
      const a = randInt(2, 20), b = randInt(2, 20), c = randInt(2, 9);
      return {
        expr: `(${a} + ${b}) × ${c}`, answer: (a + b) * c,
        op: 'mixed' as const, num1: a + b, num2: c,
      };
    },
    // a × b + c × d
    () => {
      const a = randInt(2, 9), b = randInt(2, 9), c = randInt(2, 9), d = randInt(2, 9);
      return {
        expr: `${a} × ${b} + ${c} × ${d}`, answer: a * b + c * d,
        op: 'mixed' as const, num1: a * b, num2: c * d,
      };
    },
    // (a − b) × c
    () => {
      const b = randInt(1, 15), a = randInt(b + 1, 30), c = randInt(2, 9);
      return {
        expr: `(${a} − ${b}) × ${c}`, answer: (a - b) * c,
        op: 'mixed' as const, num1: a - b, num2: c,
      };
    },
    // a + b × c (order of ops: multiply first)
    () => {
      const a = randInt(5, 30), b = randInt(2, 9), c = randInt(2, 9);
      return {
        expr: `${a} + ${b} × ${c}`, answer: a + b * c,
        op: 'mixed' as const, num1: a, num2: b * c,
      };
    },
    // a × b ÷ c (clean division)
    () => {
      const c = randInt(2, 9), q = randInt(2, 20), b = randInt(2, 9);
      const a = (c * q) / b;
      if (a === Math.floor(a) && a >= 2 && a <= 50) {
        return {
          expr: `${a} × ${b} ÷ ${c}`, answer: q,
          op: 'mixed' as const, num1: a * b, num2: c,
        };
      }
      return null;
    },
  ];

  for (let attempt = 0; attempt < 15; attempt++) {
    const pattern = pickRandom(patterns)();
    if (
      pattern &&
      Number.isInteger(pattern.answer) &&
      pattern.answer > 0 &&
      pattern.answer <= 10000
    ) {
      return buildQuestion(ctx, {
        num1: pattern.num1,
        num2: pattern.num2,
        operation: pattern.op,
        correctAnswer: pattern.answer,
        displayOp: '=',
        expression: pattern.expr,
      });
    }
  }

  // Fallback
  const a = randInt(5, 20), b = randInt(2, 9), c = randInt(2, 9);
  return buildQuestion(ctx, {
    num1: a, num2: b * c, operation: 'mixed',
    correctAnswer: a + b * c, displayOp: '=',
    expression: `${a} + ${b} × ${c}`,
  });
}

/**
 * Generate a decimal addition or subtraction question.
 *
 * @param places - Number of decimal places (1 or 2)
 * @param isAdd - true for addition, false for subtraction
 *
 * @example
 * // 3.5 + 2.8 = 6.3
 * // 8.4 − 3.6 = 4.8
 */
export function generateDecimalAddSub(
  ctx: GeneratorContext,
  places: number = 1,
  isAdd: boolean = true,
): MathQuestion {
  const factor = Math.pow(10, places);

  for (let attempt = 0; attempt < 15; attempt++) {
    const raw1 = randInt(1 * factor, 99 * factor);
    const raw2 = randInt(1 * factor, 99 * factor);
    const num1 = raw1 / factor;
    const num2 = raw2 / factor;

    if (isAdd) {
      const result = num1 + num2;
      return buildQuestion(ctx, {
        num1, num2, operation: 'add',
        correctAnswer: parseFloat(result.toFixed(places)),
        displayOp: '+',
        expression: `${num1.toFixed(places)} + ${num2.toFixed(places)}`,
      });
    } else {
      const big = Math.max(num1, num2);
      const small = Math.min(num1, num2);
      const result = big - small;
      return buildQuestion(ctx, {
        num1: big, num2: small, operation: 'subtract',
        correctAnswer: parseFloat(result.toFixed(places)),
        displayOp: '−',
        expression: `${big.toFixed(places)} − ${small.toFixed(places)}`,
      });
    }
  }

  // Fallback
  const num1 = 2.5, num2 = 1.3;
  const result = isAdd ? num1 + num2 : Math.abs(num1 - num2);
  return buildQuestion(ctx, {
    num1, num2, operation: isAdd ? 'add' : 'subtract',
    correctAnswer: parseFloat(result.toFixed(1)),
    displayOp: isAdd ? '+' : '−',
    expression: `${num1.toFixed(1)} ${isAdd ? '+' : '−'} ${num2.toFixed(1)}`,
  });
}

/**
 * Generate a decimal multiplication or division question.
 *
 * @param places - Number of decimal places (1 or 2)
 * @param isMul - true for multiplication, false for division
 *
 * @example
 * // 2.5 × 4 = 10
 * // 3.6 ÷ 1.2 = 3
 */
export function generateDecimalMulDiv(
  ctx: GeneratorContext,
  places: number = 1,
  isMul: boolean = true,
): MathQuestion {
  const factor = Math.pow(10, places);

  for (let attempt = 0; attempt < 15; attempt++) {
    if (isMul) {
      // Decimal × integer for clean results
      const raw1 = randInt(1, 99);
      const int2 = randInt(2, 9);
      const num1 = raw1 / factor;
      const num2 = int2;
      const result = num1 * num2;

      if (Number.isInteger(result) || (places > 0 && result > 0)) {
        const answer = Number.isInteger(result) ? result : parseFloat(result.toFixed(places));
        return buildQuestion(ctx, {
          num1, num2, operation: 'multiply',
          correctAnswer: answer, displayOp: '×',
          expression: `${num1.toFixed(places)} × ${num2}`,
        });
      }
    } else {
      // Clean decimal division
      const quotient = randInt(2, 20);
      const divisor = randInt(2, 99) / factor;
      const dividend = parseFloat((quotient * divisor).toFixed(places + 1));
      if (dividend > 0 && divisor > 0) {
        return buildQuestion(ctx, {
          num1: dividend, num2: divisor, operation: 'divide',
          correctAnswer: quotient, displayOp: '÷',
          expression: `${dividend} ÷ ${divisor}`,
        });
      }
    }
  }

  // Fallback
  if (isMul) {
    return buildQuestion(ctx, {
      num1: 2.5, num2: 4, operation: 'multiply',
      correctAnswer: 10, displayOp: '×',
      expression: '2.5 × 4',
    });
  }
  return buildQuestion(ctx, {
    num1: 3.6, num2: 1.2, operation: 'divide',
    correctAnswer: 3, displayOp: '÷',
    expression: '3.6 ÷ 1.2',
  });
}

/**
 * Generate a fraction comparison question.
 * Compares two fractions: e.g., "1/4 〇 1/3"
 *
 * @example
 * // 1/2 〇 1/3 → true (1/2 > 1/3)
 * // 2/5 〇 3/5 → false (2/5 < 3/5)
 */
export function generateFractionComparison(ctx: GeneratorContext): MathQuestion {
  for (let attempt = 0; attempt < 20; attempt++) {
    const d1 = randInt(2, 9);
    const d2 = randInt(2, 9);
    const n1 = randInt(1, d1 - 1);
    const n2 = randInt(1, d2 - 1);
    const v1 = n1 / d1;
    const v2 = n2 / d2;

    // Only generate if they are different to avoid ambiguity
    if (v1 !== v2) {
      return buildQuestion(ctx, {
        num1: 0, num2: 0, operation: 'compare',
        correctAnswer: v1 > v2, displayOp: '?',
        compareLeft: v1, compareRight: v2,
        expression: `${n1}/${d1} 〇 ${n2}/${d2}`,
      });
    }
  }

  return buildQuestion(ctx, {
    num1: 0, num2: 0, operation: 'compare',
    correctAnswer: false, displayOp: '?',
    compareLeft: 0.25, compareRight: 0.5,
    expression: '1/4 〇 1/2',
  });
}

/**
 * Generate a fraction addition or subtraction question (same denominator).
 *
 * @param isAdd - true for addition, false for subtraction
 *
 * @example
 * // 2/5 + 1/5 = 3/5 (answer stored as numerator 3)
 * // 3/6 − 2/6 = 1/6 (answer stored as numerator 1)
 */
export function generateFractionAddSub(
  ctx: GeneratorContext,
  isAdd: boolean = true,
): MathQuestion {
  for (let attempt = 0; attempt < 20; attempt++) {
    const b = randInt(2, 12);
    const a = randInt(1, b - 1);
    const c = randInt(1, isAdd ? b - a : a - 1);
    if (c < 1) continue;

    if (isAdd) {
      const numerator = a + c;
      return buildQuestion(ctx, {
        num1: 0, num2: 0, operation: 'add',
        correctAnswer: numerator, displayOp: '+',
        expression: `${a}/${b} + ${c}/${b} = ?/${b}`,
      });
    } else {
      const numerator = a - c;
      return buildQuestion(ctx, {
        num1: 0, num2: 0, operation: 'subtract',
        correctAnswer: numerator, displayOp: '−',
        expression: `${a}/${b} − ${c}/${b} = ?/${b}`,
      });
    }
  }

  return buildQuestion(ctx, {
    num1: 0, num2: 0, operation: isAdd ? 'add' : 'subtract',
    correctAnswer: isAdd ? 5 : 1, displayOp: isAdd ? '+' : '−',
    expression: isAdd ? '2/6 + 3/6 = ?/6' : '3/6 − 2/6 = ?/6',
  });
}

/**
 * Generate a fraction multiplication or division question.
 *
 * @param isMul - true for multiplication, false for division
 *
 * @example
 * // 2/3 × 3/4 = 6/12 (simplified: 1/2, stored as simplified numerator)
 * // 3/4 ÷ 3/8 = 2
 */
export function generateFractionMulDiv(
  ctx: GeneratorContext,
  isMul: boolean = true,
): MathQuestion {
  for (let attempt = 0; attempt < 20; attempt++) {
    if (isMul) {
      const n1 = randInt(1, 8), d1 = randInt(n1 + 1, 9);
      const n2 = randInt(1, 8), d2 = randInt(n2 + 1, 9);
      const num = n1 * n2;
      const den = d1 * d2;
      const g = gcd(num, den);
      const simplifiedNum = num / g;
      const simplifiedDen = den / g;

      // Store answer as simplified numerator
      const answer = simplifiedDen === 1 ? simplifiedNum : simplifiedNum;
      return buildQuestion(ctx, {
        num1: 0, num2: 0, operation: 'multiply',
        correctAnswer: answer, displayOp: '×',
        expression: `${n1}/${d1} × ${n2}/${d2} = ?/${simplifiedDen}`,
      });
    } else {
      const n1 = randInt(1, 8), d1 = randInt(n1 + 1, 9);
      const n2 = randInt(1, 8), d2 = randInt(n2 + 1, 9);
      // a/b ÷ c/d = a*d / (b*c)
      const num = n1 * d2;
      const den = d1 * n2;
      const g = gcd(num, den);
      const simplifiedNum = num / g;
      const simplifiedDen = den / g;

      const answer = simplifiedDen === 1 ? simplifiedNum : simplifiedNum;
      return buildQuestion(ctx, {
        num1: 0, num2: 0, operation: 'divide',
        correctAnswer: answer, displayOp: '÷',
        expression: `${n1}/${d1} ÷ ${n2}/${d2} = ?/${simplifiedDen}`,
      });
    }
  }

  return buildQuestion(ctx, {
    num1: 0, num2: 0, operation: isMul ? 'multiply' : 'divide',
    correctAnswer: 1, displayOp: isMul ? '×' : '÷',
    expression: isMul ? '1/2 × 2/3 = ?/6' : '1/2 ÷ 1/3 = ?',
  });
}

/**
 * Generate a simple equation solving question.
 * Patterns: x + a = b, x − a = b, x × a = b
 *
 * @example
 * // x + 15 = 32，x = ?
 * // x − 8 = 25，x = ?
 * // x × 6 = 42，x = ?
 */
export function generateEquation(ctx: GeneratorContext): MathQuestion {
  const patterns: (() => {
    expression: string;
    answer: number;
    num1: number;
    num2: number;
  })[] = [
    // x + a = b → x = b − a
    () => {
      const a = randInt(5, 50), x = randInt(1, 50);
      const b = a + x;
      return {
        expression: `x + ${a} = ${b}，x = ?`,
        answer: x, num1: a, num2: b,
      };
    },
    // a + x = b → x = b − a
    () => {
      const a = randInt(5, 50), x = randInt(1, 50);
      const b = a + x;
      return {
        expression: `${a} + x = ${b}，x = ?`,
        answer: x, num1: a, num2: b,
      };
    },
    // x − a = b → x = a + b
    () => {
      const a = randInt(5, 50), b = randInt(1, 30);
      return {
        expression: `x − ${a} = ${b}，x = ?`,
        answer: a + b, num1: a, num2: b,
      };
    },
    // x × a = b → x = b / a (clean)
    () => {
      const a = randInt(2, 9), x = randInt(2, 20);
      return {
        expression: `x × ${a} = ${a * x}，x = ?`,
        answer: x, num1: a, num2: a * x,
      };
    },
  ];

  for (let i = 0; i < 15; i++) {
    const pattern = pickRandom(patterns)();
    if (pattern.answer > 0 && Number.isInteger(pattern.answer)) {
      return buildQuestion(ctx, {
        num1: pattern.num1, num2: pattern.num2,
        operation: 'equation',
        correctAnswer: pattern.answer, displayOp: '=',
        expression: pattern.expression,
      });
    }
  }

  return buildQuestion(ctx, {
    num1: 5, num2: 12, operation: 'equation',
    correctAnswer: 7, displayOp: '=',
    expression: 'x + 5 = 12，x = ?',
  });
}

/**
 * Generate a percentage calculation question.
 * Format: "a% × b = ?"
 *
 * @example
 * // 25% × 200 = 50
 * // 80% × 150 = 120
 */
export function generatePercentage(ctx: GeneratorContext): MathQuestion {
  const percentages = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80, 90];

  for (let attempt = 0; attempt < 20; attempt++) {
    const pct = pickRandom(percentages);
    const base = randInt(10, 500);
    const answer = (pct * base) / 100;

    if (Number.isInteger(answer)) {
      return buildQuestion(ctx, {
        num1: pct, num2: base, operation: 'equation',
        correctAnswer: answer, displayOp: '=',
        expression: `${pct}% × ${base} = ?`,
      });
    }
  }

  return buildQuestion(ctx, {
    num1: 25, num2: 200, operation: 'equation',
    correctAnswer: 50, displayOp: '=',
    expression: '25% × 200 = ?',
  });
}

/**
 * Generate a negative number comparison question.
 * Tests understanding of negative numbers on the number line.
 *
 * @example
 * // (-3) 〇 (-7) → true (−3 > −7)
 * // (-5) 〇 2 → false (−5 < 2)
 */
export function generateNegativeComparison(ctx: GeneratorContext): MathQuestion {
  for (let attempt = 0; attempt < 20; attempt++) {
    const a = randInt(1, 50);
    const b = randInt(1, 50);
    const makeNegA = Math.random() > 0.3;
    const makeNegB = Math.random() > 0.3;
    const left = makeNegA ? -a : a;
    const right = makeNegB ? -b : b;

    if (left !== right) {
      const ls = left < 0 ? `(${left})` : `${left}`;
      const rs = right < 0 ? `(${right})` : `${right}`;
      return buildQuestion(ctx, {
        num1: left, num2: right, operation: 'compare',
        correctAnswer: left > right, displayOp: '?',
        compareLeft: left, compareRight: right,
        expression: `${ls} 〇 ${rs}`,
      });
    }
  }

  return buildQuestion(ctx, {
    num1: -3, num2: -7, operation: 'compare',
    correctAnswer: true, displayOp: '?',
    compareLeft: -3, compareRight: -7,
    expression: '(-3) 〇 (-7)',
  });
}

/**
 * Generate a ratio/proportion question.
 * Format: "a:b = c:x，x = ?"
 *
 * @example
 * // 3:5 = 9:x → x = 15
 * // 2:7 = 8:x → x = 28
 */
export function generateRatio(ctx: GeneratorContext): MathQuestion {
  for (let attempt = 0; attempt < 20; attempt++) {
    const a = randInt(2, 15);
    const b = randInt(2, 15);
    const k = randInt(2, 10);
    const c = a * k;
    const x = b * k;

    if (Number.isInteger(x) && x > 0 && x <= 200) {
      return buildQuestion(ctx, {
        num1: 0, num2: 0, operation: 'equation',
        correctAnswer: x, displayOp: '=',
        expression: `${a}:${b} = ${c}:x，x = ?`,
      });
    }
  }

  return buildQuestion(ctx, {
    num1: 0, num2: 0, operation: 'equation',
    correctAnswer: 15, displayOp: '=',
    expression: '3:5 = 9:x，x = ?',
  });
}

/**
 * Generate a general addition question within a given range.
 */
export function generateAddRange(
  ctx: GeneratorContext,
  min: number,
  max: number,
): MathQuestion {
  const num1 = randInt(min, max);
  const num2 = randInt(min, max);
  return buildQuestion(ctx, {
    num1, num2, operation: 'add',
    correctAnswer: num1 + num2, displayOp: '+',
    expression: `${num1} + ${num2}`,
  });
}

/**
 * Generate a general subtraction question within a given range.
 */
export function generateSubRange(
  ctx: GeneratorContext,
  min: number,
  max: number,
): MathQuestion {
  const num1 = randInt(Math.max(min, 1), max);
  const num2 = randInt(min, num1);
  return buildQuestion(ctx, {
    num1, num2, operation: 'subtract',
    correctAnswer: num1 - num2, displayOp: '−',
    expression: `${num1} − ${num2}`,
  });
}

/**
 * Generate a general comparison question within a given range.
 */
export function generateCompareRange(
  ctx: GeneratorContext,
  min: number,
  max: number,
): MathQuestion {
  const num1 = randInt(min, max);
  const num2 = randInt(min, max);
  return buildQuestion(ctx, {
    num1, num2, operation: 'compare',
    correctAnswer: num1 > num2, displayOp: '?',
    compareLeft: num1, compareRight: num2,
    expression: `${num1} 〇 ${num2}`,
  });
}
