/**
 * 错题本模块 — Wrong Answer Tracking & Review System
 * For the "知识小勇士" learning app.
 *
 * All data is persisted in localStorage under the key `'error-book'`.
 * The module is designed for use in client components (`'use client'`).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Subject = 'math' | 'chinese' | 'english';

export interface WrongQuestion {
  id: string;
  subject: Subject;
  /** 数学算式，如 "12 + 7" */
  expression?: string;
  correctAnswer?: number | string;
  userAnswer?: number | string;
  /** 运算类型，如 "加法", "乘法" 等 */
  operation?: string;
  /** 难度描述 */
  difficulty?: string;
  /** 语文/英语题目的提示文本 */
  prompt?: string;
  /** 正确选项（选择题） */
  correctOption?: string;
  /** 用户选择的选项 */
  userOption?: string;
  /** 游戏模式：free / speed / adventure */
  mode?: string;
  /** 记录时间戳 */
  timestamp: number;
  /** ISO 日期字符串 */
  date: string;
  /** 已复习次数 */
  reviewCount: number;
  /** 最近一次复习日期 */
  lastReviewDate?: string;
  /** 是否已掌握（连续答对 3 次后自动标记） */
  mastered: boolean;
  /** 对应的课程年级 */
  grade?: number;
}

export interface ErrorBookStats {
  totalWrong: number;
  masteredCount: number;
  pendingCount: number;
  bySubject: Record<string, number>;
  byOperation: Record<string, number>;
  weakestAreas: { name: string; count: number }[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'error-book';
const MAX_ENTRIES = 500;
const MASTER_THRESHOLD = 3; // 连续答对 3 次视为掌握

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Read the raw array from localStorage, handling corrupted data gracefully.
 * Returns an empty array when the key does not exist or data is invalid.
 */
function readStore(): WrongQuestion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as WrongQuestion[];
  } catch {
    // Data is corrupted — reset silently
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

/**
 * Persist the array to localStorage with FIFO eviction when over the limit.
 */
function writeStore(entries: WrongQuestion[]): void {
  try {
    // FIFO eviction: remove the oldest entries first
    if (entries.length > MAX_ENTRIES) {
      entries = entries.slice(entries.length - MAX_ENTRIES);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full or other error — silently ignore
    console.warn('[error-book] Failed to write to localStorage');
  }
}

/**
 * Generate a unique id (simple but sufficient for client-side use).
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * 将时间戳转换为人类可读的相对时间。
 *
 * Examples:
 * - "刚刚"          — < 1 分钟
 * - "3分钟前"        — < 1 小时
 * - "2小时前"        — < 24 小时
 * - "昨天 14:30"     — 昨天
 * - "3天前"          — < 7 天
 * - "2024-01-15"    — ≥ 7 天
 *
 * @param timestamp  Unix 毫秒时间戳
 * @returns 相对时间字符串
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;

  const target = new Date(timestamp);
  const today = new Date();

  // 昨天
  const yesterdayStart = new Date(today);
  yesterdayStart.setDate(today.getDate() - 1);
  yesterdayStart.setHours(0, 0, 0, 0);

  const yesterdayEnd = new Date(today);
  yesterdayEnd.setHours(0, 0, 0, 0);

  if (target >= yesterdayStart && target < yesterdayEnd) {
    const timeStr = target.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `昨天 ${timeStr}`;
  }

  if (days < 7) return `${days}天前`;

  // 超过 7 天 → 返回日期
  return target.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// ---------------------------------------------------------------------------
// Core API
// ---------------------------------------------------------------------------

/**
 * Add a wrong answer to the error book.
 * Duplicate entries with the same `expression` (math) or `prompt` (chinese/english)
 * within the last 5 minutes are skipped to avoid spam.
 */
export function addError(question: WrongQuestion): void {
  const entries = readStore();

  // Dedup: skip if an identical question was recorded in the last 5 minutes
  const fiveMinAgo = Date.now() - 5 * 60 * 1000;
  const isDuplicate = entries.some((e) => {
    if (e.subject !== question.subject) return false;
    if (question.expression && e.expression === question.expression) {
      return e.timestamp > fiveMinAgo;
    }
    if (question.prompt && e.prompt === question.prompt) {
      return e.timestamp > fiveMinAgo;
    }
    return false;
  });
  if (isDuplicate) return;

  // If the same question already exists (not mastered), bump its count instead
  const existingIdx = entries.findIndex((e) => {
    if (e.mastered) return false;
    if (question.expression) return e.expression === question.expression && e.subject === question.subject;
    if (question.prompt) return e.prompt === question.prompt && e.subject === question.subject;
    return false;
  });

  if (existingIdx !== -1) {
    const existing = entries[existingIdx];
    existing.timestamp = Date.now();
    existing.date = new Date().toISOString();
    existing.userAnswer = question.userAnswer;
    existing.userOption = question.userOption;
    // Re-answering wrong resets mastery progress
    existing.reviewCount = 0;
    existing.mastered = false;
    writeStore(entries);
    return;
  }

  entries.push(question);
  writeStore(entries);
}

/**
 * Get all wrong questions, sorted by most recent first.
 */
export function getErrorBook(): WrongQuestion[] {
  return readStore().sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Get questions that have NOT been mastered, sorted by priority:
 * 1. Most recently wrong (highest timestamp)
 * 2. Among equal recency, lower reviewCount first (needs more practice)
 */
export function getPendingReviews(): WrongQuestion[] {
  return readStore()
    .filter((e) => !e.mastered)
    .sort((a, b) => {
      // Primary: most recent wrong first
      if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp;
      // Secondary: fewer reviews = higher priority
      return a.reviewCount - b.reviewCount;
    });
}

/**
 * Record a review attempt.
 *
 * - If `correct` is `true`, increment `reviewCount`. When count reaches the
 *   mastery threshold (3), mark the question as mastered.
 * - If `correct` is `false`, reset `reviewCount` to 0 and un-master.
 *
 * @param id       The question id
 * @param correct  Whether the user answered correctly this time
 */
export function markReviewed(id: string, correct: boolean): void {
  const entries = readStore();
  const entry = entries.find((e) => e.id === id);
  if (!entry) return;

  entry.lastReviewDate = new Date().toISOString();

  if (correct) {
    entry.reviewCount += 1;
    if (entry.reviewCount >= MASTER_THRESHOLD) {
      entry.mastered = true;
    }
  } else {
    // Wrong again — reset progress
    entry.reviewCount = 0;
    entry.mastered = false;
  }

  writeStore(entries);
}

/**
 * Remove a specific entry by id.
 */
export function removeError(id: string): void {
  const entries = readStore().filter((e) => e.id !== id);
  writeStore(entries);
}

/**
 * Remove all entries that have been mastered.
 */
export function clearMastered(): void {
  const entries = readStore().filter((e) => !e.mastered);
  writeStore(entries);
}

/**
 * Calculate aggregate statistics for the error book.
 */
export function getStats(): ErrorBookStats {
  const entries = readStore();

  const bySubject: Record<string, number> = {};
  const byOperation: Record<string, number> = {};
  const areaMap = new Map<string, number>();

  let masteredCount = 0;

  for (const entry of entries) {
    // By subject
    bySubject[entry.subject] = (bySubject[entry.subject] ?? 0) + 1;

    // By operation
    if (entry.operation) {
      byOperation[entry.operation] = (byOperation[entry.operation] ?? 0) + 1;
    }

    // Weakest areas: key is either operation or subject, whichever is more specific
    const areaKey = entry.operation || entry.subject;
    if (areaKey) {
      areaMap.set(areaKey, (areaMap.get(areaKey) ?? 0) + 1);
    }

    if (entry.mastered) masteredCount++;
  }

  // Sort weakest areas by count descending
  const weakestAreas = Array.from(areaMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 weakest areas

  return {
    totalWrong: entries.length,
    masteredCount,
    pendingCount: entries.length - masteredCount,
    bySubject,
    byOperation,
    weakestAreas,
  };
}

/**
 * Generate a set of review questions for practice.
 *
 * Selection priority:
 * 1. Filter by `subject` if provided
 * 2. Exclude mastered questions
 * 3. Sort by: fewest reviews first → most recent timestamp
 * 4. Take up to `count` entries
 *
 * @param count    Maximum number of questions to return
 * @param subject  Optional subject filter
 * @returns An array of questions for review
 */
export function generateReviewQuestions(count: number, subject?: Subject): WrongQuestion[] {
  let entries = readStore().filter((e) => !e.mastered);

  if (subject) {
    entries = entries.filter((e) => e.subject === subject);
  }

  // Priority: fewest reviews first → most recent
  entries.sort((a, b) => {
    if (a.reviewCount !== b.reviewCount) return a.reviewCount - b.reviewCount;
    return b.timestamp - a.timestamp;
  });

  return entries.slice(0, count);
}

/**
 * Reset the entire error book (for testing / debugging purposes).
 * Removes the localStorage key entirely.
 */
export function resetErrorBook(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
