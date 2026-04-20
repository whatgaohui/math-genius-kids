// Math question generation utilities for 学习小达人

// ─── Types ──────────────────────────────────────────────────────────────────

export type Operation = 'add' | 'subtract' | 'multiply' | 'divide' | 'mix' | 'compare';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface MathQuestion {
  id: string;
  num1: number;
  num2: number;
  operation: Operation;
  correctAnswer: number | boolean;
  displayOp: string;
  userAnswer?: number | boolean;
  isCorrect?: boolean;
  timeMs?: number;
  /** For compare questions */
  compareLeft?: number;
  compareRight?: number;
  /** Display expression string */
  expression?: string;
}

// ─── Difficulty Ranges ──────────────────────────────────────────────────────

const DIFFICULTY_RANGES: Record<Difficulty, { min: number; max: number }> = {
  easy: { min: 1, max: 10 },
  medium: { min: 1, max: 50 },
  hard: { min: 1, max: 100 },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let questionIdCounter = 0;
function genId(): string {
  return `q-${Date.now()}-${++questionIdCounter}`;
}

// ─── Question Generators ────────────────────────────────────────────────────

function generateAddQuestion(range: { min: number; max: number }): MathQuestion {
  const num1 = randInt(range.min, range.max);
  const num2 = randInt(range.min, range.max);
  return {
    id: genId(),
    num1,
    num2,
    operation: 'add',
    correctAnswer: num1 + num2,
    displayOp: '+',
    expression: `${num1} + ${num2}`,
  };
}

function generateSubtractQuestion(range: { min: number; max: number }): MathQuestion {
  const num1 = randInt(range.min, range.max);
  const num2 = randInt(range.min, num1); // Ensure non-negative result
  return {
    id: genId(),
    num1,
    num2,
    operation: 'subtract',
    correctAnswer: num1 - num2,
    displayOp: '−',
    expression: `${num1} − ${num2}`,
  };
}

function generateMultiplyQuestion(range: { min: number; max: number }): MathQuestion {
  const num1 = randInt(range.min, Math.min(range.max, 12));
  const num2 = randInt(range.min, Math.min(range.max, 12));
  return {
    id: genId(),
    num1,
    num2,
    operation: 'multiply',
    correctAnswer: num1 * num2,
    displayOp: '×',
    expression: `${num1} × ${num2}`,
  };
}

function generateDivideQuestion(range: { min: number; max: number }): MathQuestion {
  // Ensure clean division
  const divisor = randInt(Math.max(range.min, 2), Math.min(range.max, 12));
  const quotient = randInt(range.min, Math.min(range.max, 12));
  const dividend = divisor * quotient;
  return {
    id: genId(),
    num1: dividend,
    num2: divisor,
    operation: 'divide',
    correctAnswer: quotient,
    displayOp: '÷',
    expression: `${dividend} ÷ ${divisor}`,
  };
}

function generateCompareQuestion(range: { min: number; max: number }): MathQuestion {
  const num1 = randInt(range.min, range.max);
  const num2 = randInt(range.min, range.max);
  const correctAnswer = num1 > num2;
  return {
    id: genId(),
    num1,
    num2,
    operation: 'compare',
    correctAnswer,
    displayOp: '?',
    compareLeft: num1,
    compareRight: num2,
    expression: `${num1} 〇 ${num2}`,
  };
}

// ─── Main Generator ─────────────────────────────────────────────────────────

const OPERATION_GENERATORS: Record<string, (range: { min: number; max: number }) => MathQuestion> = {
  add: generateAddQuestion,
  subtract: generateSubtractQuestion,
  multiply: generateMultiplyQuestion,
  divide: generateDivideQuestion,
  compare: generateCompareQuestion,
};

const MIX_OPERATIONS: Operation[] = ['add', 'subtract', 'multiply', 'divide'];

/**
 * Generate an array of math questions.
 *
 * @param operation - The type of math operation
 * @param difficulty - easy, medium, or hard
 * @param count - Number of questions to generate (default 10)
 * @returns Array of MathQuestion objects
 */
export function generateQuestions(
  operation: Operation,
  difficulty: Difficulty,
  count: number = 10
): MathQuestion[] {
  const range = DIFFICULTY_RANGES[difficulty];
  const questions: MathQuestion[] = [];

  for (let i = 0; i < count; i++) {
    let op: string;
    if (operation === 'mix') {
      op = pickRandom(MIX_OPERATIONS);
    } else {
      op = operation;
    }

    const generator = OPERATION_GENERATORS[op];
    if (generator) {
      questions.push(generator(range));
    }
  }

  return questions;
}

// ─── Time Formatting ────────────────────────────────────────────────────────

/**
 * Format milliseconds into a human-readable time string.
 * Examples: "1:23", "0:45", "2:00"
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format milliseconds into a more detailed time string.
 * Examples: "1分23秒", "45秒", "2分00秒"
 */
export function formatTimeChinese(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}分${seconds.toString().padStart(2, '0')}秒`;
  }
  return `${seconds}秒`;
}

// ─── Encouragement Messages ─────────────────────────────────────────────────

/**
 * Get an encouragement message based on accuracy percentage.
 */
export function getEncouragement(accuracy: number): { emoji: string; text: string } {
  if (accuracy >= 100) {
    return { emoji: '🏆', text: '满分！你是数学小天才！全部答对啦！' };
  }
  if (accuracy >= 90) {
    return { emoji: '🌟', text: '非常优秀！再接再厉，满分就在眼前！' };
  }
  if (accuracy >= 75) {
    return { emoji: '😊', text: '做得不错！多算几遍就更厉害了！' };
  }
  if (accuracy >= 60) {
    return { emoji: '💪', text: '及格啦！算得还可以，加油哦！' };
  }
  if (accuracy >= 40) {
    return { emoji: '🤔', text: '别灰心，算错的题再算一遍吧！' };
  }
  return { emoji: '🤗', text: '没关系，学习就是要多练习，我们再来一次吧！' };
}

/**
 * Get an encouragement message based on average answer time.
 */
export function getSpeedEncouragement(avgTimeMs: number): { emoji: string; text: string } {
  if (avgTimeMs <= 2000) {
    return { emoji: '⚡', text: '闪电速度！太厉害了！' };
  }
  if (avgTimeMs <= 4000) {
    return { emoji: '🚀', text: '速度很快！反应敏捷！' };
  }
  if (avgTimeMs <= 7000) {
    return { emoji: '👍', text: '速度不错，继续保持！' };
  }
  if (avgTimeMs <= 12000) {
    return { emoji: '🐢', text: '慢慢来，准确更重要！' };
  }
  return { emoji: '🌱', text: '不着急，一步步来！' };
}

// ─── Stars & XP Calculation ─────────────────────────────────────────────────

/**
 * Calculate stars earned for a session.
 * 0-59%: 0 stars, 60-74%: 1 star, 75-89%: 2 stars, 90-100%: 3 stars
 */
export function calculateStars(correct: number, total: number): number {
  if (total === 0) return 0;
  const accuracy = (correct / total) * 100;
  if (accuracy >= 90) return 3;
  if (accuracy >= 75) return 2;
  if (accuracy >= 60) return 1;
  return 0;
}

/**
 * Calculate XP earned for a session.
 */
export function calculateXP(correct: number, total: number, timeMs: number, stars: number, combo: number = 0): number {
  const baseXP = correct * 10;
  const timeBonus = Math.max(0, Math.floor((60000 - timeMs) / 1000)) * 2; // bonus for speed
  const starBonus = stars * 20;
  const comboBonus = combo * 5;
  return baseXP + timeBonus + starBonus + comboBonus;
}

/**
 * Calculate level from total XP.
 * Each level requires progressively more XP.
 */
export function calculateLevel(totalXP: number): number {
  // Level formula: each level needs level * 100 XP
  let level = 1;
  let xpNeeded = 0;
  while (true) {
    xpNeeded += level * 100;
    if (totalXP < xpNeeded) break;
    level++;
  }
  return level;
}

/**
 * Get XP needed for the next level.
 */
export function getXPForNextLevel(totalXP: number): { currentLevelXP: number; nextLevelXP: number; progress: number } {
  let level = 1;
  let accumulated = 0;
  while (true) {
    const needed = level * 100;
    if (totalXP < accumulated + needed) {
      return {
        currentLevelXP: totalXP - accumulated,
        nextLevelXP: needed,
        progress: (totalXP - accumulated) / needed,
      };
    }
    accumulated += needed;
    level++;
  }
}
