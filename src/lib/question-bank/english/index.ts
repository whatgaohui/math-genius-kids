// ═══════════════════════════════════════════════════════════════════════════════
// English Question Bank — Main Entry Point
// ─────────────────────────────────────────────────────────────────────────────
// This module exports:
//   1. `EnglishQuestionBank` class — implements `QuestionBank<EnglishQuestion>`
//   2. `englishBank` singleton instance
//   3. `registerEnglishBank()` helper — registers with the global registry
//
// Usage:
//   import { englishBank, registerEnglishBank } from './question-bank/english';
//   registerEnglishBank();  // registers in the global registry
//
//   // Then use via registry:
//   import { QuestionBankRegistry } from './question-bank/registry';
//   const bank = QuestionBankRegistry.getBank('english');
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  QuestionBank,
  EnglishQuestion,
  EnglishMode,
  Grade,
  Semester,
  TopicMeta,
  GenerationOptions,
} from '../types';
import { QuestionBankRegistry } from '../registry';
import {
  generateModeQuestions,
  generateMixedModeQuestions,
  getVocabStats,
  getFilteredVocab,
} from './generators';
import { ENGLISH_BANK_TEMPLATE } from './template';

// ─── Topic Metadata Cache ───────────────────────────────────────────────────
// Pre-compute topic metadata from the template so we don't rebuild it on every call.

const TOPIC_META_CACHE: Map<string, TopicMeta> = new Map();

for (const gradeData of ENGLISH_BANK_TEMPLATE) {
  for (const semesterData of gradeData.semesters) {
    for (const topicData of semesterData.topics) {
      TOPIC_META_CACHE.set(topicData.topicId, {
        id: topicData.topicId,
        name: topicData.topicName,
        description: topicData.topicDescription,
        emoji: topicData.topicEmoji,
        subject: 'english',
        grade: topicData.grade,
        semester: topicData.semester,
        category: topicData.topicId.includes('1a')
          ? '基础入门'
          : topicData.topicId.includes('6b')
            ? '总复习'
            : '单元学习',
        modes: ['word-picture', 'picture-word', 'listening', 'spelling'],
        difficulty:
          topicData.grade <= 2 ? 'easy' : topicData.grade <= 4 ? 'medium' : 'hard',
      });
    }
  }
}

// ─── Index helpers ──────────────────────────────────────────────────────────

/** Build grade → semester → topicIds index from the template */
const GRADE_SEMESTER_TOPICS: Map<string, string[]> = new Map();

for (const gradeData of ENGLISH_BANK_TEMPLATE) {
  for (const semesterData of gradeData.semesters) {
    const key = `${gradeData.grade}-${semesterData.semester}`;
    const ids = semesterData.topics.map((t) => t.topicId);
    GRADE_SEMESTER_TOPICS.set(key, ids);
  }
}

function getSemesterTopicIds(grade: Grade, semester: Semester): string[] {
  const key = `${grade}-${semester}`;
  return GRADE_SEMESTER_TOPICS.get(key) ?? [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// EnglishQuestionBank Class
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * English Question Bank — full implementation of `QuestionBank<EnglishQuestion>`.
 *
 * Supports:
 * - 6 grades × 2 semesters = 12 grade-semester combinations
 * - 24 curriculum topics aligned with PEP English (人教版)
 * - 4 practice modes: word-picture, picture-word, listening, spelling
 * - ~250+ vocabulary entries in the generator database
 * - Dynamic question generation with randomized distractors
 */
class EnglishQuestionBank implements QuestionBank<EnglishQuestion> {
  readonly id = 'english-pep-v1';
  readonly name = '人教版英语题库';
  readonly version = '1.0.0';
  readonly subject = 'english' as const;
  readonly description =
    '小学英语词汇练习题库，涵盖人教版PEP英语1-6年级，支持看词选图、看图选词、听力挑战和拼写达人四种模式。';
  readonly source = '人教版PEP小学英语教材';

  // ─── Query Interface ──────────────────────────────────────────────────

  getSupportedGrades(): Grade[] {
    return [1, 2, 3, 4, 5, 6];
  }

  getSupportedSemesters(grade: Grade): Semester[] {
    // All grades have both semesters
    return ['上册', '下册'];
  }

  getTopicIds(grade: Grade, semester: Semester): string[] {
    return getSemesterTopicIds(grade, semester);
  }

  getTopicInfo(topicId: string): TopicMeta | undefined {
    return TOPIC_META_CACHE.get(topicId);
  }

  getQuestionCount(grade: Grade, semester: Semester, topicId?: string): number {
    if (topicId) {
      const vocab = getFilteredVocab(grade, semester, topicId);
      // Each vocab entry can generate questions in 4 modes
      return vocab.length * 4;
    }
    // Sum across all topics in this grade+semester
    const topicIds = getSemesterTopicIds(grade, semester);
    let total = 0;
    for (const tid of topicIds) {
      const vocab = getFilteredVocab(grade, semester, tid);
      total += vocab.length * 4;
    }
    return total;
  }

  generateTopicQuestions(
    grade: Grade,
    semester: Semester,
    topicId: string,
    count: number,
    options?: GenerationOptions,
  ): EnglishQuestion[] {
    // Default to mixed mode when generating for a specific topic
    const modes = options?.modes?.length
      ? (options.modes as EnglishMode[])
      : undefined;

    if (modes && modes.length === 1) {
      // Single mode requested
      return generateModeQuestions(
        modes[0],
        grade,
        semester,
        count,
        topicId,
        options?.excludeIds,
      );
    }

    // Mixed mode: distribute across modes
    return generateMixedModeQuestions(
      grade,
      semester,
      count,
      topicId,
      options?.excludeIds,
    );
  }

  generateMixedQuestions(
    grade: Grade,
    semester: Semester,
    count: number,
    options?: GenerationOptions,
  ): EnglishQuestion[] {
    // If specific modes are requested, generate for those modes
    const modes = options?.modes?.length
      ? (options.modes as EnglishMode[])
      : undefined;

    if (modes && modes.length === 1) {
      return generateModeQuestions(
        modes[0],
        grade,
        semester,
        count,
        undefined,
        options?.excludeIds,
      );
    }

    // Default: mix across all topics and all modes
    return generateMixedModeQuestions(
      grade,
      semester,
      count,
      undefined,
      options?.excludeIds,
    );
  }

  /**
   * Generate questions for a specific English mode.
   * This is the key method that enables the multi-mode English practice flow.
   *
   * @param mode     - The English practice mode
   * @param grade    - Target grade
   * @param semester - Target semester
   * @param count    - Number of questions
   * @param options  - Generation options (excludeIds, etc.)
   */
  generateModeQuestions(
    mode: string,
    grade: Grade,
    semester: Semester,
    count: number,
    options?: GenerationOptions,
  ): EnglishQuestion[] {
    const validModes: EnglishMode[] = [
      'word-picture',
      'picture-word',
      'listening',
      'spelling',
    ];

    if (validModes.includes(mode as EnglishMode)) {
      return generateModeQuestions(
        mode as EnglishMode,
        grade,
        semester,
        count,
        undefined,
        options?.excludeIds,
      );
    }

    // Fallback: if mode is not recognized, generate mixed questions
    return this.generateMixedQuestions(grade, semester, count, options);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Singleton Instance & Registration
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Singleton instance of the English question bank.
 * Import this directly if you don't need the registry.
 */
export const englishBank = new EnglishQuestionBank();

/**
 * Register the English question bank with the global registry.
 *
 * Call this once at app startup (e.g. in a layout or provider component).
 * After registration, consumers can retrieve the bank via:
 *
 * ```ts
 * import { QuestionBankRegistry } from './question-bank/registry';
 * const bank = QuestionBankRegistry.getBank('english');
 * ```
 *
 * @param priority - Registration priority (default: 10). Higher = preferred.
 * @returns The registered bank instance.
 */
export function registerEnglishBank(priority: number = 10): EnglishQuestionBank {
  QuestionBankRegistry.register(englishBank, { priority });
  return englishBank;
}

// ─── Re-export commonly used types and utilities ──────────────────────────

export type { EnglishQuestion, EnglishMode, Grade, Semester, TopicMeta, GenerationOptions } from '../types';
export type { EnglishQuestionData, EnglishPracticeMode, Difficulty } from './template';
export type { VocabEntry } from './generators';
export { ENGLISH_BANK_TEMPLATE } from './template';
export {
  generateModeQuestions as generateEnglishModeQuestions,
  generateMixedModeQuestions as generateEnglishMixedQuestions,
  getVocabularyDatabase,
  getVocabByGrade,
  getFilteredVocab,
  getVocabStats,
} from './generators';
