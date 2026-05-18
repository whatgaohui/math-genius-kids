// ═══════════════════════════════════════════════════════════════════════════════
// Math Question Bank — Main Entry (主入口)
// ─────────────────────────────────────────────────────────────────────────────
// This file creates the MathQuestionBank class that implements QuestionBank<MathQuestion>.
// It combines:
//   1. Static template data (from template.ts) — curated, curriculum-aligned questions
//   2. Procedural generators (from generators.ts) — infinite on-the-fly generation
//
// Usage:
//   import { mathQuestionBank, registerMathBank } from './math';
//   registerMathBank();  // Register with the global registry
//   mathQuestionBank.generateTopicQuestions(3, '上册', 'math-3a-mul1', 10);
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  MathQuestion,
  Grade,
  Semester,
  TopicMeta,
  GenerationOptions,
  QuestionBank,
} from '../types';
import { QuestionBankRegistry } from '../registry';
import { getTopicById, getTopics } from '../../curriculum-config';
import { MATH_BANK_TEMPLATE, type MathQuestionData } from './template';
import {
  generateNoCarryAdd,
  generateNoBorrowSub,
  generateTableMultiply,
  generateTableDivide,
  generateMultiDigitMulOne,
  generateTwoDigitDivOne,
  generateThreeByTwoMul,
  generateThreeByTwoDiv,
  generateFourOpsWithParens,
  generateDecimalAddSub,
  generateDecimalMulDiv,
  generateFractionComparison,
  generateFractionAddSub,
  generateFractionMulDiv,
  generateEquation,
  generatePercentage,
  generateNegativeComparison,
  generateRatio,
  generateAddRange,
  generateSubRange,
  generateCompareRange,
  type GeneratorContext,
} from './generators';

// ─── Type Helpers ────────────────────────────────────────────────────────────

/** Maps a MathQuestionData.type to a MathQuestion.operation */
function dataToOperation(type: MathQuestionData['type']): MathQuestion['operation'] {
  const map: Record<MathQuestionData['type'], MathQuestion['operation']> = {
    add: 'add',
    subtract: 'subtract',
    multiply: 'multiply',
    divide: 'divide',
    compare: 'compare',
    equation: 'equation',
    mixed: 'mixed',
  };
  return map[type];
}

/** Derives displayOp from operation type */
function operationToDisplayOp(op: MathQuestion['operation']): string {
  const map: Record<MathQuestion['operation'], string> = {
    add: '+',
    subtract: '−',
    multiply: '×',
    divide: '÷',
    compare: '?',
    equation: '=',
    mixed: '=',
  };
  return map[op];
}

// ─── ID Generation ───────────────────────────────────────────────────────────

let _staticIdCounter = 0;
function generateStaticId(topicId: string): string {
  return `static-${topicId}-${++_staticIdCounter}`;
}

// ─── Convert MathQuestionData → MathQuestion ─────────────────────────────────

/**
 * Converts a raw MathQuestionData entry from the template into a full
 * MathQuestion object with all required fields.
 */
function convertToMathQuestion(
  data: MathQuestionData,
  grade: Grade,
  semester: Semester,
): MathQuestion {
  const operation = dataToOperation(data.type);
  const displayOp = operationToDisplayOp(operation);
  const id = generateStaticId(data.topicId);
  const prompt = data.expression.includes('=?') || data.expression.includes('？')
    ? data.expression
    : `${data.expression} = ?`;

  // Find the correct option index
  const correctIndex = data.options.indexOf(data.answer);

  // Parse num1/num2 from expression for arithmetic types (best-effort)
  let num1 = 0;
  let num2 = 0;
  if (['add', 'subtract', 'multiply', 'divide'].includes(data.type)) {
    const parts = data.expression.split(/[\s+−×÷\-]+/).filter(Boolean);
    if (parts.length >= 2) {
      const parsed1 = parseFloat(parts[0]);
      const parsed2 = parseFloat(parts[1]);
      if (!isNaN(parsed1)) num1 = parsed1;
      if (!isNaN(parsed2)) num2 = parsed2;
    }
  }

  // For compare questions, extract compare values
  let compareLeft: number | undefined;
  let compareRight: number | undefined;
  if (data.type === 'compare') {
    const parts = data.expression.split('〇').map(s => s.trim());
    if (parts.length === 2) {
      const v1 = parseFloat(parts[0].replace(/[()]/g, ''));
      const v2 = parseFloat(parts[1].replace(/[()]/g, ''));
      if (!isNaN(v1)) compareLeft = v1;
      if (!isNaN(v2)) compareRight = v2;
    }
  }

  return {
    id,
    subject: 'math',
    grade,
    semester,
    topicId: data.topicId,
    prompt,
    correctAnswer: data.type === 'compare' ? data.answer === 1 : data.answer,
    expression: data.expression,
    displayOp,
    num1,
    num2,
    operation,
    compareLeft,
    compareRight,
    options: [...data.options],
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TopicId → Generator Function Routing
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Maps each topicId to its corresponding generator function.
 * If no specific generator is defined, a fallback arithmetic generator is used.
 */
type GeneratorFn = (ctx: GeneratorContext) => MathQuestion;

const TOPIC_GENERATORS: Partial<Record<string, GeneratorFn>> = {
  // Grade 1
  'math-1a-count': (ctx) => generateCompareRange(ctx, 0, 10),
  'math-1a-add10': (ctx) => generateNoCarryAdd(ctx, 0, 10),
  'math-1a-shape': (ctx) => generateEquation(ctx), // concept → equation
  'math-1b-count20': (ctx) => generateCompareRange(ctx, 0, 20),
  'math-1b-add20': (ctx) => generateAddRange(ctx, 1, 20),
  'math-1b-classify': (ctx) => generateEquation(ctx),

  // Grade 2
  'math-2a-length': (ctx) => generateEquation(ctx),
  'math-2a-add100': (ctx) => generateNoCarryAdd(ctx, 1, 99),
  'math-2a-angle': (ctx) => generateEquation(ctx),
  'math-2a-mul9': (ctx) => generateTableMultiply(ctx),
  'math-2b-div9': (ctx) => generateTableDivide(ctx),
  'math-2b-mix': (ctx) => generateFourOpsWithParens(ctx),
  'math-2b-weight': (ctx) => generateEquation(ctx),

  // Grade 3
  'math-3a-time': (ctx) => generateEquation(ctx),
  'math-3a-add10000': (ctx) => generateAddRange(ctx, 100, 9999),
  'math-3a-mul1': (ctx) => generateMultiDigitMulOne(ctx, 500),
  'math-3a-rect': (ctx) => generateEquation(ctx),
  'math-3b-div1': (ctx) => generateTwoDigitDivOne(ctx),
  'math-3b-mul2': (ctx) => generateMultiDigitMulOne(ctx, 99),
  'math-3b-frac': (ctx) => generateFractionComparison(ctx),
  'math-3b-area': (ctx) => generateEquation(ctx),

  // Grade 4
  'math-4a-large': (ctx) => generateAddRange(ctx, 1000, 50000),
  'math-4a-angle2': (ctx) => generateEquation(ctx),
  'math-4a-mul2': (ctx) => generateThreeByTwoMul(ctx),
  'math-4a-div2': (ctx) => generateThreeByTwoDiv(ctx),
  'math-4b-order': (ctx) => generateFourOpsWithParens(ctx),
  'math-4b-decimal': (ctx) => generateCompareRange(ctx, 0, 1),
  'math-4b-decimal-add': (ctx) => generateDecimalAddSub(ctx, 1, Math.random() > 0.5),
  'math-4b-triangle': (ctx) => generateEquation(ctx),

  // Grade 5
  'math-5a-decimal-mul': (ctx) => generateDecimalMulDiv(ctx, 1, true),
  'math-5a-decimal-div': (ctx) => generateDecimalMulDiv(ctx, 1, false),
  'math-5a-equation': (ctx) => generateEquation(ctx),
  'math-5a-polygon': (ctx) => generateEquation(ctx),
  'math-5b-observation': (ctx) => generateEquation(ctx),
  'math-5b-frac-meaning': (ctx) => generateFractionComparison(ctx),
  'math-5b-frac-add': (ctx) => generateFractionAddSub(ctx, Math.random() > 0.5),
  'math-5b-stats': (ctx) => generateEquation(ctx),

  // Grade 6
  'math-6a-frac-mul': (ctx) => generateFractionMulDiv(ctx, true),
  'math-6a-frac-div': (ctx) => generateFractionMulDiv(ctx, false),
  'math-6a-percent': (ctx) => generatePercentage(ctx),
  'math-6a-circle': (ctx) => generateEquation(ctx),
  'math-6b-negative': (ctx) => generateNegativeComparison(ctx),
  'math-6b-ratio': (ctx) => generateRatio(ctx),
  'math-6b-cylinder': (ctx) => generateEquation(ctx),
  'math-6b-stats2': (ctx) => generateEquation(ctx),
};

/**
 * Get the generator function for a topic, or a default arithmetic generator.
 */
function getGeneratorForTopic(topicId: string): GeneratorFn {
  return TOPIC_GENERATORS[topicId] ?? ((ctx: GeneratorContext) => generateAddRange(ctx, 1, 20));
}

// ═══════════════════════════════════════════════════════════════════════════════
// MathQuestionBank Class
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * The main math question bank implementing QuestionBank<MathQuestion>.
 *
 * Strategy:
 *   - Static data from template.ts is loaded and indexed at construction time
 *   - On generateTopicQuestions: first serve static questions (shuffled),
 *     then supplement with procedural generators if more are needed
 *   - On generateMixedQuestions: distribute evenly across all topics
 */
class MathQuestionBank implements QuestionBank<MathQuestion> {
  readonly id = 'math-pep-v1';
  readonly name = '人教版数学题库';
  readonly version = '1.0.0';
  readonly subject = 'math' as const;
  readonly description = '基于人教版(PEP)小学数学课程标准的题库，涵盖一年级至六年级上下册所有知识点';
  readonly source = '人教版小学数学教材';

  /** Index: topicId → MathQuestionData[] (from template) */
  private staticData: Map<string, MathQuestionData[]> = new Map();

  /** Index: topicId → TopicMeta (from template) */
  private topicMetaMap: Map<string, TopicMeta> = new Map();

  /** Index: `${grade}-${semester}` → topicId[] (from curriculum config) */
  private topicIndex: Map<string, string[]> = new Map();

  constructor() {
    this.loadStaticData();
    this.buildTopicIndex();
  }

  // ─── Data Loading ───────────────────────────────────────────────────────

  /**
   * Load and index all static question data from the template.
   */
  private loadStaticData(): void {
    const { data } = MATH_BANK_TEMPLATE;

    for (const [gradeStr, topics] of Object.entries(data)) {
      const grade = Number(gradeStr) as Grade;

      for (const [topicId, topicEntry] of Object.entries(topics)) {
        // Index the topic metadata
        this.topicMetaMap.set(topicId, topicEntry.topic);

        // Index the question data
        const existing = this.staticData.get(topicId) ?? [];
        const newData = topicEntry.questions.map((q) => ({
          ...q,
          topicId: q.topicId || topicId, // ensure topicId is set
        }));
        this.staticData.set(topicId, [...existing, ...newData]);
      }
    }
  }

  /**
   * Build a lookup index from grade+semester to topic IDs.
   * Uses both the template data and the curriculum config for complete coverage.
   */
  private buildTopicIndex(): void {
    const grades: Grade[] = [1, 2, 3, 4, 5, 6];
    const semesters: Semester[] = ['上册', '下册'];

    for (const grade of grades) {
      for (const semester of semesters) {
        const key = `${grade}-${semester}`;
        const topicIds = this.getTopicIdsFromSources(grade, semester);
        this.topicIndex.set(key, topicIds);
      }
    }
  }

  /**
   * Get topic IDs from both the template and curriculum config.
   */
  private getTopicIdsFromSources(grade: Grade, semester: Semester): string[] {
    const ids = new Set<string>();

    // From template data
    const gradeData = MATH_BANK_TEMPLATE.data[grade];
    if (gradeData) {
      for (const topicId of Object.keys(gradeData)) {
        const topicMeta = gradeData[topicId].topic;
        if (topicMeta.semester === semester) {
          ids.add(topicId);
        }
      }
    }

    // From curriculum config (for topics that might not have template data yet)
    const curriculumTopics = this.getCurriculumTopics(grade, semester);
    for (const topic of curriculumTopics) {
      ids.add(topic.id);
    }

    return Array.from(ids);
  }

  /**
   * Get math topics from curriculum config for a grade + semester.
   */
  private getCurriculumTopics(grade: Grade, semester: Semester): { id: string }[] {
    return getTopics(grade, semester, 'math');
  }

  // ─── QuestionBank Interface ────────────────────────────────────────────

  getSupportedGrades(): Grade[] {
    return [1, 2, 3, 4, 5, 6];
  }

  getSupportedSemesters(grade: Grade): Semester[] {
    return ['上册', '下册'];
  }

  getTopicIds(grade: Grade, semester: Semester): string[] {
    const key = `${grade}-${semester}`;
    return this.topicIndex.get(key) ?? [];
  }

  getTopicInfo(topicId: string): TopicMeta | undefined {
    // First check our template metadata
    const meta = this.topicMetaMap.get(topicId);
    if (meta) return meta;

    // Fallback to curriculum config
    const curriculumTopic = getTopicById(topicId);
    if (curriculumTopic && curriculumTopic.subject === 'math') {
      return {
        id: curriculumTopic.id,
        name: curriculumTopic.name,
        description: curriculumTopic.description,
        emoji: curriculumTopic.emoji,
        subject: 'math',
        grade: curriculumTopic.grade,
        semester: curriculumTopic.semester,
      };
    }

    return undefined;
  }

  getQuestionCount(grade: Grade, semester: Semester, topicId?: string): number {
    if (topicId) {
      const staticQuestions = this.staticData.get(topicId) ?? [];
      // Add a generous estimate for generator capacity (effectively infinite)
      return staticQuestions.length > 0 ? Math.max(staticQuestions.length, 50) : 50;
    }

    // Count across all topics
    const topicIds = this.getTopicIds(grade, semester);
    let total = 0;
    for (const id of topicIds) {
      const staticCount = (this.staticData.get(id) ?? []).length;
      total += Math.max(staticCount, 50);
    }
    return total;
  }

  /**
   * Generate questions for a specific topic.
   * Strategy:
   *   1. Pick from static template data (randomized selection)
   *   2. If not enough, supplement with procedural generators
   */
  generateTopicQuestions(
    grade: Grade,
    semester: Semester,
    topicId: string,
    count: number,
    _options?: GenerationOptions,
  ): MathQuestion[] {
    const questions: MathQuestion[] = [];
    const ctx: GeneratorContext = { grade, semester, topicId };

    // Phase 1: Try to pick from static data
    const staticPool = this.staticData.get(topicId) ?? [];

    if (staticPool.length > 0) {
      // Shuffle the static pool for variety
      const shuffled = [...staticPool].sort(() => Math.random() - 0.5);

      // Take up to count questions from static data
      const staticCount = Math.min(count, shuffled.length);
      for (let i = 0; i < staticCount; i++) {
        const data = shuffled[i];
        questions.push(convertToMathQuestion(data, grade, semester));
      }
    }

    // Phase 2: Fill remaining with procedural generators
    const remaining = count - questions.length;
    if (remaining > 0) {
      const generator = getGeneratorForTopic(topicId);
      for (let i = 0; i < remaining; i++) {
        questions.push(generator(ctx));
      }
    }

    return questions;
  }

  /**
   * Generate mixed questions distributed evenly across all topics
   * for a given grade and semester.
   */
  generateMixedQuestions(
    grade: Grade,
    semester: Semester,
    count: number,
    _options?: GenerationOptions,
  ): MathQuestion[] {
    const topicIds = this.getTopicIds(grade, semester);

    if (topicIds.length === 0) {
      // Fallback: generate basic arithmetic questions
      const ctx: GeneratorContext = { grade, semester, topicId: 'math-general' };
      const questions: MathQuestion[] = [];
      for (let i = 0; i < count; i++) {
        questions.push(generateAddRange(ctx, 1, 20));
      }
      return questions;
    }

    // Shuffle topic order for variety
    const shuffledTopics = [...topicIds].sort(() => Math.random() - 0.5);

    const questions: MathQuestion[] = [];
    const perTopic = Math.max(1, Math.ceil(count / shuffledTopics.length));

    for (const topicId of shuffledTopics) {
      const needed = Math.min(perTopic, count - questions.length);
      if (needed <= 0) break;
      questions.push(...this.generateTopicQuestions(grade, semester, topicId, needed));
    }

    // Trim to exact count if we overshot
    return questions.slice(0, count);
  }

  /**
   * Generate questions for a specific mode (used by Chinese & English,
   * not typically used for Math but provided for interface compliance).
   */
  generateModeQuestions?(
    _mode: string,
    grade: Grade,
    semester: Semester,
    count: number,
    options?: GenerationOptions,
  ): MathQuestion[] {
    // Math doesn't have modes like Chinese/English; fall back to mixed
    return this.generateMixedQuestions(grade, semester, count, options);
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Singleton & Registration
// ═══════════════════════════════════════════════════════════════════════════════

/** Singleton instance of the math question bank. */
export const mathQuestionBank = new MathQuestionBank();

/**
 * Register the math question bank with the global registry.
 * Call this once during app initialization.
 *
 * @example
 * ```ts
 * import { registerMathBank } from '@/lib/question-bank/math';
 * registerMathBank();
 * ```
 */
export function registerMathBank(): void {
  QuestionBankRegistry.register(mathQuestionBank, { priority: 10 });
}

// Re-export types for convenience
export type { MathQuestionData } from './template';
export type { GeneratorContext } from './generators';
