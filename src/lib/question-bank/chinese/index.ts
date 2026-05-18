// ═══════════════════════════════════════════════════════════════════════════════
// Chinese Question Bank — Main Entry Point (语文题库入口)
// ─────────────────────────────────────────────────────────────────────────────
// This module creates the ChineseQuestionBank class, which implements the
// QuestionBank<ChineseQuestion> interface from the core types.
//
// It combines template data (hand-crafted examples) with dynamic generators
// to provide a rich, curriculum-aligned question bank for grades 1-6.
//
// Usage:
//   import { chineseBank, registerChineseBank } from './chinese';
//   registerChineseBank(); // registers with the global registry
//
//   // Then query from registry:
//   import { QuestionBankRegistry } from '../registry';
//   const bank = QuestionBankRegistry.getBank('chinese');
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  ChineseQuestion,
  ChineseMode,
  Grade,
  Semester,
  QuestionBank,
  GenerationOptions,
  TopicMeta,
} from '../types';
import { CHINESE_BANK_TEMPLATE } from './template';
import {
  generateChineseQuestions,
  generateMixedModeQuestions,
  generateFromTemplate,
} from './generators';

// ─── Curriculum Topic Metadata ────────────────────────────────────────────────

interface ChineseTopicMeta extends TopicMeta {
  subject: 'chinese';
}

/** Build topic metadata from template data */
function buildTopicMetaMap(): Map<string, ChineseTopicMeta> {
  const map = new Map<string, ChineseTopicMeta>();

  for (const [gradeNum, semesters] of Object.entries(CHINESE_BANK_TEMPLATE.data)) {
    const grade = Number(gradeNum) as Grade;
    for (const [semKey, semData] of Object.entries(semesters)) {
      const semester = semKey as Semester;
      for (const topic of semData.topics) {
        map.set(topic.id, {
          id: topic.id,
          name: topic.name,
          description: topic.description,
          emoji: getTopicEmoji(topic.id),
          subject: 'chinese',
          grade,
          semester,
          modes: topic.modes,
          difficulty: getDefaultDifficulty(grade),
        });
      }
    }
  }

  return map;
}

/** Infer emoji from topic ID patterns */
function getTopicEmoji(topicId: string): string {
  if (topicId.includes('pinyin')) return '📝';
  if (topicId.includes('char') || topicId.includes('radical') || topicId.includes('stroke')) return '🔤';
  if (topicId.includes('word') || topicId.includes('riddle')) return '🧩';
  if (topicId.includes('dictation')) return '👂';
  if (topicId.includes('idiom')) return '📚';
  if (topicId.includes('antonym')) return '🔄';
  if (topicId.includes('poetry')) return '🌸';
  if (topicId.includes('synonym')) return '💡';
  if (topicId.includes('sentence') || topicId.includes('reorder')) return '💬';
  if (topicId.includes('read') || topicId.includes('comp')) return '📖';
  if (topicId.includes('write') || topicId.includes('composition')) return '✍️';
  if (topicId.includes('rhetoric')) return '🎭';
  if (topicId.includes('memo')) return '✉️';
  if (topicId.includes('modify')) return '🔧';
  if (topicId.includes('culture')) return '🏛️';
  return '📝';
}

/** Default difficulty per grade */
function getDefaultDifficulty(grade: Grade): 'easy' | 'medium' | 'hard' {
  if (grade <= 2) return 'easy';
  if (grade <= 4) return 'medium';
  return 'hard';
}

// ═══════════════════════════════════════════════════════════════════════════════
// ChineseQuestionBank Class
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Chinese (语文) Question Bank implementation.
 *
 * This bank covers all 6 grades (一年级至六年级) of the 人教版 curriculum
 * with 12 grade-semester combinations and 36 topic areas. It supports
 * 11 practice modes including character recognition, pinyin, vocabulary,
 * idioms, antonyms, synonyms, poetry, sentence completion, and reading
 * comprehension.
 *
 * Questions are sourced from two mechanisms:
 * 1. **Template data** — hand-crafted, curriculum-aligned examples
 * 2. **Generators** — dynamically generated questions from databases
 *
 * The bank prefers template questions (for quality) and supplements with
 * generated questions (for variety and volume).
 */
class ChineseQuestionBank implements QuestionBank<ChineseQuestion> {
  readonly id = 'chinese-pep-v1';
  readonly name = '人教版语文题库';
  readonly version = '1.0.0';
  readonly subject = 'chinese' as const;
  readonly description =
    '基于人教版语文教材的小学语文题库，覆盖一年级至六年级';
  readonly source = '人教版小学语文教材（2019版）';

  private topicMetaMap: Map<string, ChineseTopicMeta>;

  constructor() {
    this.topicMetaMap = buildTopicMetaMap();
  }

  // ─── Query Interface ────────────────────────────────────────────────────

  getSupportedGrades(): Grade[] {
    return [1, 2, 3, 4, 5, 6];
  }

  getSupportedSemesters(grade: Grade): Semester[] {
    return ['上册', '下册'];
  }

  getTopicIds(grade: Grade, semester: Semester): string[] {
    const semData = CHINESE_BANK_TEMPLATE.data[grade]?.[semester];
    if (!semData) return [];
    return semData.topics.map((t) => t.id);
  }

  getTopicInfo(topicId: string): TopicMeta | undefined {
    return this.topicMetaMap.get(topicId);
  }

  getQuestionCount(grade: Grade, semester: Semester, topicId?: string): number {
    const semData = CHINESE_BANK_TEMPLATE.data[grade]?.[semester];
    if (!semData) return 0;

    if (topicId) {
      const topic = semData.topics.find((t) => t.id === topicId);
      if (!topic) return 0;
      // Template count + estimate generator capacity
      return topic.questions.length + 50;
    }

    // Total across all topics
    const templateTotal = semData.topics.reduce(
      (sum, t) => sum + t.questions.length,
      0,
    );
    return templateTotal + semData.topics.length * 50;
  }

  // ─── Generation Interface ───────────────────────────────────────────────

  /**
   * Generate questions for a specific topic.
   *
   * Strategy:
   * 1. Collect template questions matching the topic ID
   * 2. If more questions needed, supplement with generator output
   * 3. Shuffle and return the requested count
   */
  generateTopicQuestions(
    grade: Grade,
    semester: Semester,
    topicId: string,
    count: number,
    options?: GenerationOptions,
  ): ChineseQuestion[] {
    const excludeIds = new Set(options?.excludeIds ?? []);
    const requestedModes = options?.modes as ChineseMode[] | undefined;

    // Step 1: Gather template questions for this topic
    const semData = CHINESE_BANK_TEMPLATE.data[grade]?.[semester];
    let templateQs: ChineseQuestion[] = [];

    if (semData) {
      const topic = semData.topics.find((t) => t.id === topicId);
      if (topic) {
        // Filter by modes if specified
        const rawQuestions = requestedModes
          ? topic.questions.filter((q) => requestedModes.includes(q.mode))
          : topic.questions;

        templateQs = generateFromTemplate(
          rawQuestions,
          grade,
          semester,
          rawQuestions.length,
          options?.excludeIds,
        );
      }
    }

    // Step 2: Determine if we need more questions from generators
    const remaining = count - templateQs.length;
    if (remaining > 0) {
      // Determine the mode to generate
      const topicMeta = this.topicMetaMap.get(topicId);
      const modesToTry = requestedModes ?? (topicMeta?.modes as ChineseMode[] ?? ['word-match']);

      for (const mode of modesToTry) {
        if (templateQs.length >= count) break;
        const generated = generateChineseQuestions(
          mode,
          grade,
          semester,
          remaining,
        );
        // Filter out excluded IDs
        const filtered = generated.filter((q) => !excludeIds.has(q.id));
        templateQs = [...templateQs, ...filtered];
      }
    }

    // Shuffle and trim to count
    return this.shuffleAndTrim(templateQs, count);
  }

  /**
   * Generate mixed questions from an entire grade + semester.
   *
   * Questions are distributed evenly across all topics in the semester.
   */
  generateMixedQuestions(
    grade: Grade,
    semester: Semester,
    count: number,
    options?: GenerationOptions,
  ): ChineseQuestion[] {
    const excludeIds = new Set(options?.excludeIds ?? []);
    const topicIds = this.getTopicIds(grade, semester);

    if (topicIds.length === 0) return [];

    // Calculate questions per topic (distribute evenly)
    const perTopic = Math.max(1, Math.floor(count / topicIds.length));
    const remainder = count % topicIds.length;

    let allQuestions: ChineseQuestion[] = [];

    for (let i = 0; i < topicIds.length; i++) {
      const topicCount = perTopic + (i < remainder ? 1 : 0);
      const questions = this.generateTopicQuestions(
        grade,
        semester,
        topicIds[i],
        topicCount,
        options,
      );
      allQuestions = [...allQuestions, ...questions];
    }

    return this.shuffleAndTrim(allQuestions, count);
  }

  /**
   * Generate questions for a specific mode.
   *
   * This is the key method for Chinese, which has multiple practice modes.
   * It falls back to mixed mode generation if the mode is not applicable.
   */
  generateModeQuestions(
    mode: string,
    grade: Grade,
    semester: Semester,
    count: number,
    options?: GenerationOptions,
  ): ChineseQuestion[] {
    const chineseMode = mode as ChineseMode;
    const excludeIds = new Set(options?.excludeIds ?? []);

    // Step 1: Collect template questions for this mode across all topics
    const semData = CHINESE_BANK_TEMPLATE.data[grade]?.[semester];
    let templateQs: ChineseQuestion[] = [];

    if (semData) {
      const allTemplateQuestions = semData.topics.flatMap((t) =>
        t.questions
          .filter((q) => q.mode === chineseMode)
          .map((q) => ({
            ...q,
            topicId: t.id,
          })),
      );

      templateQs = generateFromTemplate(
        allTemplateQuestions,
        grade,
        semester,
        allTemplateQuestions.length,
        options?.excludeIds,
      );
    }

    // Step 2: Generate additional questions via generator
    const remaining = count - templateQs.length;
    let generatedQs: ChineseQuestion[] = [];
    if (remaining > 0) {
      generatedQs = generateChineseQuestions(chineseMode, grade, semester, remaining);
    }

    // Step 3: Combine, filter excluded, shuffle and trim
    const combined = [...templateQs, ...generatedQs].filter(
      (q) => !excludeIds.has(q.id),
    );

    return this.shuffleAndTrim(combined, count);
  }

  // ─── Internal Helpers ────────────────────────────────────────────────────

  private shuffleAndTrim(questions: ChineseQuestion[], count: number): ChineseQuestion[] {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Singleton Instance & Registration
// ═══════════════════════════════════════════════════════════════════════════════

/** Singleton instance of the Chinese question bank. */
export const chineseBank = new ChineseQuestionBank();

/**
 * Register the Chinese question bank with the global QuestionBankRegistry.
 *
 * Call this once during app initialization (e.g., in a layout or provider).
 * After registration, the bank can be retrieved via:
 *   QuestionBankRegistry.getBank('chinese')
 *
 * @param priority - Registration priority (default: 10). Higher = preferred.
 */
export function registerChineseBank(priority: number = 10): void {
  // Dynamic import to avoid circular dependencies at module level
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { QuestionBankRegistry } = require('../registry') as typeof import('../registry');
  QuestionBankRegistry.register(chineseBank, { priority, enabled: true });
}

// ─── Re-exports ───────────────────────────────────────────────────────────────

export type { ChineseQuestionData } from './template';
export {
  generateChineseQuestions,
  generateRecognizeChar,
  generateRecognizePinyin,
  generateWordMatch,
  generateDictation,
  generateIdiomFill,
  generateAntonym,
  generateSynonym,
  generatePoetryFill,
  generateSentenceFill,
  generateReadingComp,
} from './generators';
export { CHINESE_BANK_TEMPLATE } from './template';
