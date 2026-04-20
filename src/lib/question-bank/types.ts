// ═══════════════════════════════════════════════════════════════════════════════
// Modular Question Bank — Core Type Definitions
// ─────────────────────────────────────────────────────────────────────────────
// This file defines all interfaces and types for the modular question bank system.
// Any new question bank module MUST implement QuestionBank<TQuestion> to be
// compatible with the registry and the rest of the app.
// ═══════════════════════════════════════════════════════════════════════════════

import type { Subject, Grade, Semester } from './curriculum-config';

// ─── Re-export curriculum types for convenience ──────────────────────────────
export type { Subject, Grade, Semester };
export { GRADE_LABELS, SUBJECT_LABELS, SUBJECT_EMOJIS } from './curriculum-config';

// ─── Base Question Shape ─────────────────────────────────────────────────────
// Every question in any subject bank MUST have these fields at minimum.
// Subject-specific question banks extend this with additional fields.

export interface BaseQuestion {
  /** Unique question identifier */
  id: string;
  /** Which subject this question belongs to */
  subject: Subject;
  /** Target grade (1-6) */
  grade: Grade;
  /** Semester: 上册 or 下册 */
  semester: Semester;
  /** Topic / knowledge point this question covers */
  topicId: string;
  /** The display text / expression shown to the user */
  prompt: string;
  /** The correct answer (format varies by subject) */
  correctAnswer: string | number | boolean;
}

// ─── Math Question ───────────────────────────────────────────────────────────

export interface MathQuestion extends BaseQuestion {
  subject: 'math';
  correctAnswer: number | boolean;
  /** The full expression, e.g. "23 + 45" */
  expression: string;
  /** Display operator symbol */
  displayOp: string;
  /** First operand */
  num1: number;
  /** Second operand */
  num2: number;
  /** Operation type */
  operation: 'add' | 'subtract' | 'multiply' | 'divide' | 'compare' | 'equation' | 'mixed';
  /** For compare questions: left side value */
  compareLeft?: number;
  /** For compare questions: right side value */
  compareRight?: number;
  /** Multiple choice options (4 options for selection UI) */
  options?: number[];
  /** Index of correct option in options array */
  correctIndex?: number;
  /** User's answer (filled during gameplay) */
  userAnswer?: number | boolean;
  /** Whether user answered correctly */
  isCorrect?: boolean;
  /** Time taken to answer (ms) */
  timeMs?: number;
}

// ─── Chinese Question ────────────────────────────────────────────────────────

export type ChineseMode =
  | 'recognize-char'
  | 'recognize-pinyin'
  | 'word-match'
  | 'dictation'
  | 'idiom-fill'
  | 'antonym'
  | 'poetry-fill'
  | 'synonym'
  | 'sentence-fill'
  | 'sentence-rearrange'
  | 'reading-comp';

export interface ChineseQuestion extends BaseQuestion {
  subject: 'chinese';
  correctAnswer: string;
  /** Practice mode */
  mode: ChineseMode;
  /** Multiple choice options */
  options: string[];
  /** Index of correct option */
  correctIndex: number;
  /** User's answer */
  userAnswer?: string;
  /** Whether user answered correctly */
  isCorrect?: boolean;
  /** Time taken (ms) */
  timeMs?: number;
}

// ─── English Question ────────────────────────────────────────────────────────

export type EnglishMode = 'word-picture' | 'picture-word' | 'listening' | 'spelling';

export interface EnglishQuestion extends BaseQuestion {
  subject: 'english';
  correctAnswer: string;
  /** Practice mode */
  mode: EnglishMode;
  /** Multiple choice options */
  options: string[];
  /** Index of correct option */
  correctIndex: number;
  /** Emoji hint for visual modes */
  emojiHint?: string;
  /** Phonetic transcription */
  phonetic?: string;
  /** User's answer */
  userAnswer?: string;
  /** Whether user answered correctly */
  isCorrect?: boolean;
  /** Time taken (ms) */
  timeMs?: number;
}

// ─── Union type ──────────────────────────────────────────────────────────────

export type AnyQuestion = MathQuestion | ChineseQuestion | EnglishQuestion;

// ─── Question Bank Interface ─────────────────────────────────────────────────
// This is the CORE interface. Every question bank module must implement this.

export interface QuestionBank<TQuestion extends BaseQuestion = AnyQuestion> {
  /** Unique bank identifier, e.g. "math-pep-v1", "chinese-pep-v1" */
  readonly id: string;
  /** Human-readable name, e.g. "人教版数学题库" */
  readonly name: string;
  /** Version string */
  readonly version: string;
  /** Which subject this bank serves */
  readonly subject: Subject;
  /** Brief description */
  readonly description: string;
  /** Source attribution */
  readonly source: string;

  // ─── Query Interface ────────────────────────────────────────────────────

  /**
   * Get the list of grades this bank supports.
   * e.g. [1, 2, 3, 4, 5, 6]
   */
  getSupportedGrades(): Grade[];

  /**
   * Get the list of semesters available for a given grade.
   * e.g. ['上册', '下册']
   */
  getSupportedSemesters(grade: Grade): Semester[];

  /**
   * Get all topic IDs for a grade + semester.
   * e.g. ['math-1a-count', 'math-1a-add10', ...]
   */
  getTopicIds(grade: Grade, semester: Semester): string[];

  /**
   * Get topic metadata by ID.
   */
  getTopicInfo(topicId: string): TopicMeta | undefined;

  /**
   * Get total question count for a grade + semester + topic.
   * Returns 0 if the topic doesn't exist.
   */
  getQuestionCount(grade: Grade, semester: Semester, topicId?: string): number;

  /**
   * Generate questions for a specific topic.
   * @param grade - Target grade
   * @param semester - Target semester
   * @param topicId - Specific topic to generate from
   * @param count - Number of questions to generate
   * @param options - Optional generation parameters
   */
  generateTopicQuestions(
    grade: Grade,
    semester: Semester,
    topicId: string,
    count: number,
    options?: GenerationOptions,
  ): TQuestion[];

  /**
   * Generate mixed questions from an entire grade + semester.
   * Questions are distributed evenly across all topics.
   */
  generateMixedQuestions(
    grade: Grade,
    semester: Semester,
    count: number,
    options?: GenerationOptions,
  ): TQuestion[];

  /**
   * Generate questions for a specific mode (used by Chinese & English).
   * Falls back to mixed if mode is not applicable.
   */
  generateModeQuestions?(
    mode: string,
    grade: Grade,
    semester: Semester,
    count: number,
    options?: GenerationOptions,
  ): TQuestion[];
}

// ─── Topic Metadata ──────────────────────────────────────────────────────────

export interface TopicMeta {
  /** Unique topic ID, e.g. "math-1a-add10" */
  id: string;
  /** Topic name, e.g. "10以内加减法" */
  name: string;
  /** Topic description */
  description: string;
  /** Emoji icon for the topic */
  emoji: string;
  /** Which subject */
  subject: Subject;
  /** Target grade */
  grade: Grade;
  /** Target semester */
  semester: Semester;
  /** Curriculum category */
  category?: string;
  /** Applicable modes (for Chinese/English) */
  modes?: string[];
  /** Estimated difficulty level */
  difficulty?: 'easy' | 'medium' | 'hard';
}

// ─── Generation Options ──────────────────────────────────────────────────────

export interface GenerationOptions {
  /** Seed for reproducible random generation */
  seed?: number;
  /** Avoid repeating questions from a previous session */
  excludeIds?: string[];
  /** Maximum number of distractors for multiple choice */
  maxDistractors?: number;
  /** Whether to include only specific modes */
  modes?: string[];
}

// ─── Bank Registration Info ──────────────────────────────────────────────────

export interface BankRegistration {
  /** The bank instance */
  bank: QuestionBank;
  /** Priority (higher = preferred when multiple banks exist for same subject) */
  priority: number;
  /** Whether this bank is currently active */
  enabled: boolean;
  /** Registration timestamp */
  registeredAt: number;
}

// ─── Question Bank Template Marker ───────────────────────────────────────────
// Use this type to mark a file as a question bank template.
// Template files should export a default object conforming to QuestionBankTemplate.

export interface QuestionBankTemplate<TData = unknown> {
  /** Template metadata */
  meta: {
    id: string;
    name: string;
    version: string;
    subject: Subject;
    description: string;
    source: string;
    author?: string;
    lastUpdated?: string;
  };

  /** The actual question data, organized by grade → semester → topic */
  data: Record<number, Record<string, TopicData<TData>>>;

  /** Validation function to check data integrity */
  validate?: () => ValidationResult;
}

export interface TopicData<TData = unknown> {
  /** Topic metadata */
  topic: TopicMeta;
  /** Raw question data entries */
  questions: TData[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalQuestions: number;
    totalTopics: number;
    gradesCovered: number;
  };
}
