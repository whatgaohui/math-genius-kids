// ═══════════════════════════════════════════════════════════════════════════════
// English Question Bank — Template & Data Format Guide
// ─────────────────────────────────────────────────────────────────────────────
// This file serves TWO purposes:
//   1. Exports the `EnglishQuestionData` interface — the canonical TypeScript
//      type that every data entry must conform to.
//   2. Exports `ENGLISH_BANK_TEMPLATE` — a complete reference object with
//      example data for ALL 6 grades × 2 semesters (12 combinations).
//
// DATA COLLECTORS: use this file as your reference. Every vocabulary entry
// you add must implement `EnglishQuestionData`. Copy the structure for each
// topic and fill in real curriculum-aligned vocabulary.
// ═══════════════════════════════════════════════════════════════════════════════

import type { Grade, Semester } from '../types';

// ─── Mode Types ──────────────────────────────────────────────────────────────

/**
 * The four practice modes supported by the English question bank.
 *
 * | Mode          | Display to child    | Prompt format                     | Options are…             |
 * |---------------|---------------------|-----------------------------------|--------------------------|
 * | `word-picture`| 看词选图             | English word (e.g. "apple")       | Chinese meanings          |
 * | `picture-word`| 看图选词             | Chinese meaning + emoji           | English words             |
 * | `listening`   | 听力挑战             | (spoken via TTS — prompt hidden)  | English words             |
 * | `spelling`    | 拼写达人             | Chinese meaning + phonetic hint   | English words             |
 */
export type EnglishPracticeMode = 'word-picture' | 'picture-word' | 'listening' | 'spelling';

/**
 * Difficulty level for individual question entries.
 *
 * - `easy`   — Short, common words (3-5 letters); Grade 1-2 focus.
 * - `medium` — Moderately complex words (5-8 letters); Grade 3-4 focus.
 * - `hard`   — Longer / abstract words (7+ letters); Grade 5-6 focus.
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

// ─── Question Data Interface ─────────────────────────────────────────────────

/**
 * `EnglishQuestionData` — the shape of every single vocabulary entry in the
 * English question bank.
 *
 * Data collectors should create arrays of this type for each topic.
 *
 * @example
 * ```ts
 * const myQuestions: EnglishQuestionData[] = [
 *   {
 *     topicId: 'en-1a-basic',
 *     mode: 'word-picture',
 *     word: 'apple',
 *     phonetic: '/ˈæpl/',
 *     meaning: '苹果',
 *     emoji: '🍎',
 *     options: ['苹果', '香蕉', '橙子', '葡萄'],
 *     difficulty: 'easy',
 *   },
 * ];
 * ```
 */
export interface EnglishQuestionData {
  /**
   * The curriculum topic this question belongs to.
   *
   * Must match a topic ID defined in `curriculum-config.ts`.
   * Examples: 'en-1a-basic', 'en-3b-animal2', 'en-6a-verb'.
   *
   * This determines which grade / semester the question appears in,
   * as well as the topic card the child sees in the topic browser.
   */
  topicId: string;

  /**
   * The practice mode this entry was primarily designed for.
   *
   * Each entry is tagged with ONE primary mode. At runtime, the generator
   * can reuse any entry across all four modes — the mode field here is
   * a hint for data collectors about the intended exercise type.
   *
   * - `word-picture`: child sees English word → picks Chinese meaning.
   * - `picture-word`: child sees Chinese meaning + emoji → picks English word.
   * - `listening`:    child hears word via TTS → picks English word.
   * - `spelling`:     child sees meaning + phonetic → picks correct spelling.
   */
  mode: EnglishPracticeMode;

  /**
   * The English word itself.
   *
   * Must be lowercase for most vocabulary. Proper nouns (e.g. "Monday",
   * "China") may use title case.
   *
   * @example 'apple', 'beautiful', 'Wednesday'
   */
  word: string;

  /**
   * IPA (International Phonetic Alphabet) transcription of the word.
   *
   * Used as a hint in the `spelling` mode and as supplementary info
   * in other modes.
   *
   * @example '/ˈæpl/', '/ˈbjuːtɪfl/'
   */
  phonetic: string;

  /**
   * Chinese translation / meaning of the word.
   *
   * Keep translations concise (1-4 characters ideal). Use the most common
   * meaning for children at the target grade level.
   *
   * @example '苹果', '美丽的', '星期一'
   */
  meaning: string;

  /**
   * An emoji that visually represents the word.
   *
   * Used as a visual cue in `picture-word` and `spelling` modes.
   * Choose a single, universally-supported emoji.
   *
   * @example '🍎', '🐘', '⏰'
   */
  emoji: string;

  /**
   * Array of exactly 4 multiple-choice options.
   *
   * - For `word-picture` mode: all options should be Chinese meanings.
   * - For `picture-word`, `listening`, `spelling`: all options should be
   *   English words.
   *
   * The first element should ALWAYS be the correct answer. The generator
   * will randomize the order at runtime.
   *
   * Distractors should be:
   *   - Plausible (same category or similar length)
   *   - Unique within the array (no duplicates)
   *   - Not the correct answer
   */
  options: [string, string, string, string];

  /**
   * Estimated difficulty level for this specific word/question.
   *
   * Helps the app filter by difficulty and calibrate scoring.
   *
   * - `easy`:   simple, common words (grades 1-2)
   * - `medium`: moderate complexity (grades 3-4)
   * - `hard`:   advanced vocabulary (grades 5-6)
   */
  difficulty: Difficulty;
}

// ─── Topic Template Structure ───────────────────────────────────────────────

/**
 * A topic template contains metadata and example questions for a single topic.
 */
export interface EnglishTopicTemplate {
  /** Topic ID matching curriculum-config.ts */
  topicId: string;
  /** Human-readable topic name */
  topicName: string;
  /** Topic description */
  topicDescription: string;
  /** Topic emoji */
  topicEmoji: string;
  /** Target grade */
  grade: Grade;
  /** Target semester */
  semester: Semester;
  /** Example question entries */
  questions: EnglishQuestionData[];
}

/**
 * A semester template groups all topics for one grade + semester.
 */
export interface EnglishSemesterTemplate {
  semester: Semester;
  topics: EnglishTopicTemplate[];
}

/**
 * A grade template groups both semesters.
 */
export interface EnglishGradeTemplate {
  grade: Grade;
  gradeLabel: string;
  gradeEmoji: string;
  semesters: EnglishSemesterTemplate[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGLISH BANK TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────
// Complete reference data with 3-5 example questions per topic.
// Data collectors should replicate this structure with full question sets.
// ═══════════════════════════════════════════════════════════════════════════════

export const ENGLISH_BANK_TEMPLATE: EnglishGradeTemplate[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // GRADE 1 — 一年级 (Pre-school / Optional foundational vocabulary)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    grade: 1,
    gradeLabel: '一年级',
    gradeEmoji: '🌱',
    semesters: [
      // ── Grade 1 上册 ──────────────────────────────────────────────────
      {
        semester: '上册',
        topics: [
          {
            topicId: 'en-1a-basic',
            topicName: '基础词汇',
            topicDescription: '颜色、数字和简单的问候',
            topicEmoji: '🎨',
            grade: 1,
            semester: '上册',
            questions: [
              {
                topicId: 'en-1a-basic',
                mode: 'word-picture',
                word: 'red',
                phonetic: '/red/',
                meaning: '红色',
                emoji: '🔴',
                options: ['红色', '蓝色', '绿色', '黄色'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-1a-basic',
                mode: 'word-picture',
                word: 'blue',
                phonetic: '/bluː/',
                meaning: '蓝色',
                emoji: '🔵',
                options: ['蓝色', '红色', '黄色', '白色'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-1a-basic',
                mode: 'picture-word',
                word: 'green',
                phonetic: '/ɡriːn/',
                meaning: '绿色',
                emoji: '🟢',
                options: ['green', 'red', 'blue', 'yellow'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-1a-basic',
                mode: 'listening',
                word: 'yellow',
                phonetic: '/ˈjeləʊ/',
                meaning: '黄色',
                emoji: '🟡',
                options: ['yellow', 'red', 'green', 'blue'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-1a-basic',
                mode: 'spelling',
                word: 'hello',
                phonetic: '/həˈləʊ/',
                meaning: '你好',
                emoji: '👋',
                options: ['hello', 'hi', 'hey', 'halo'],
                difficulty: 'easy',
              },
            ],
          },
          {
            topicId: 'en-1a-animal',
            topicName: '动物乐园',
            topicDescription: '常见动物的英文名称',
            topicEmoji: '🐾',
            grade: 1,
            semester: '上册',
            questions: [
              {
                topicId: 'en-1a-animal',
                mode: 'picture-word',
                word: 'cat',
                phonetic: '/kæt/',
                meaning: '猫',
                emoji: '🐱',
                options: ['cat', 'dog', 'bird', 'fish'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-1a-animal',
                mode: 'picture-word',
                word: 'dog',
                phonetic: '/dɒɡ/',
                meaning: '狗',
                emoji: '🐕',
                options: ['dog', 'cat', 'pig', 'hen'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-1a-animal',
                mode: 'word-picture',
                word: 'bird',
                phonetic: '/bɜːrd/',
                meaning: '鸟',
                emoji: '🐦',
                options: ['鸟', '鱼', '猫', '狗'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-1a-animal',
                mode: 'listening',
                word: 'fish',
                phonetic: '/fɪʃ/',
                meaning: '鱼',
                emoji: '🐟',
                options: ['fish', 'bird', 'dog', 'cat'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-1a-animal',
                mode: 'spelling',
                word: 'pig',
                phonetic: '/pɪɡ/',
                meaning: '猪',
                emoji: '🐷',
                options: ['pig', 'dig', 'big', 'fig'],
                difficulty: 'easy',
              },
            ],
          },
        ],
      },
      // ── Grade 1 下册 ──────────────────────────────────────────────────
      {
        semester: '下册',
        topics: [
          {
            topicId: 'en-1b-body',
            topicName: '身体与家庭',
            topicDescription: '身体部位和家庭成员',
            topicEmoji: '👨‍👩‍👧',
            grade: 1,
            semester: '下册',
            questions: [
              {
                topicId: 'en-1b-body',
                mode: 'word-picture',
                word: 'eye',
                phonetic: '/aɪ/',
                meaning: '眼睛',
                emoji: '👁️',
                options: ['眼睛', '耳朵', '鼻子', '嘴巴'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-1b-body',
                mode: 'picture-word',
                word: 'nose',
                phonetic: '/nəʊz/',
                meaning: '鼻子',
                emoji: '👃',
                options: ['nose', 'eye', 'ear', 'mouth'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-1b-body',
                mode: 'listening',
                word: 'hand',
                phonetic: '/hænd/',
                meaning: '手',
                emoji: '✋',
                options: ['hand', 'foot', 'head', 'arm'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-1b-body',
                mode: 'spelling',
                word: 'mom',
                phonetic: '/mɒm/',
                meaning: '妈妈',
                emoji: '👩',
                options: ['mom', 'mum', 'map', 'man'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-1b-body',
                mode: 'word-picture',
                word: 'dad',
                phonetic: '/dæd/',
                meaning: '爸爸',
                emoji: '👨',
                options: ['爸爸', '妈妈', '哥哥', '姐姐'],
                difficulty: 'easy',
              },
            ],
          },
          {
            topicId: 'en-1b-fruit',
            topicName: '水果与食物',
            topicDescription: '常见水果的英文名称',
            topicEmoji: '🍎',
            grade: 1,
            semester: '下册',
            questions: [
              {
                topicId: 'en-1b-fruit',
                mode: 'picture-word',
                word: 'apple',
                phonetic: '/ˈæpl/',
                meaning: '苹果',
                emoji: '🍎',
                options: ['apple', 'banana', 'orange', 'grape'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-1b-fruit',
                mode: 'picture-word',
                word: 'banana',
                phonetic: '/bəˈnænə/',
                meaning: '香蕉',
                emoji: '🍌',
                options: ['banana', 'apple', 'pear', 'peach'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-1b-fruit',
                mode: 'word-picture',
                word: 'cake',
                phonetic: '/keɪk/',
                meaning: '蛋糕',
                emoji: '🎂',
                options: ['蛋糕', '面包', '饼干', '糖果'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-1b-fruit',
                mode: 'listening',
                word: 'milk',
                phonetic: '/mɪlk/',
                meaning: '牛奶',
                emoji: '🥛',
                options: ['milk', 'water', 'juice', 'tea'],
                difficulty: 'easy',
              },
            ],
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GRADE 2 — 二年级
  // ═══════════════════════════════════════════════════════════════════════════
  {
    grade: 2,
    gradeLabel: '二年级',
    gradeEmoji: '🌿',
    semesters: [
      // ── Grade 2 上册 ──────────────────────────────────────────────────
      {
        semester: '上册',
        topics: [
          {
            topicId: 'en-2a-food',
            topicName: '食物与饮料',
            topicDescription: '常见食物和饮料的英文表达',
            topicEmoji: '🍎',
            grade: 2,
            semester: '上册',
            questions: [
              {
                topicId: 'en-2a-food',
                mode: 'picture-word',
                word: 'bread',
                phonetic: '/bred/',
                meaning: '面包',
                emoji: '🍞',
                options: ['bread', 'rice', 'egg', 'cake'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-2a-food',
                mode: 'word-picture',
                word: 'chicken',
                phonetic: '/ˈtʃɪkɪn/',
                meaning: '鸡肉',
                emoji: '🍗',
                options: ['鸡肉', '鱼肉', '猪肉', '牛肉'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-2a-food',
                mode: 'listening',
                word: 'juice',
                phonetic: '/dʒuːs/',
                meaning: '果汁',
                emoji: '🧃',
                options: ['juice', 'milk', 'water', 'tea'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-2a-food',
                mode: 'spelling',
                word: 'rice',
                phonetic: '/raɪs/',
                meaning: '米饭',
                emoji: '🍚',
                options: ['rice', 'rise', 'ride', 'nice'],
                difficulty: 'easy',
              },
            ],
          },
          {
            topicId: 'en-2a-toy',
            topicName: '玩具与颜色',
            topicDescription: '玩具名称和颜色复习',
            topicEmoji: '🧸',
            grade: 2,
            semester: '上册',
            questions: [
              {
                topicId: 'en-2a-toy',
                mode: 'picture-word',
                word: 'doll',
                phonetic: '/dɒl/',
                meaning: '娃娃',
                emoji: '🧸',
                options: ['doll', 'ball', 'car', 'kite'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-2a-toy',
                mode: 'word-picture',
                word: 'white',
                phonetic: '/waɪt/',
                meaning: '白色',
                emoji: '⚪',
                options: ['白色', '黑色', '棕色', '紫色'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-2a-toy',
                mode: 'listening',
                word: 'black',
                phonetic: '/blæk/',
                meaning: '黑色',
                emoji: '⚫',
                options: ['black', 'white', 'brown', 'pink'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-2a-toy',
                mode: 'spelling',
                word: 'brown',
                phonetic: '/braʊn/',
                meaning: '棕色',
                emoji: '🟤',
                options: ['brown', 'black', 'blue', 'blown'],
                difficulty: 'easy',
              },
            ],
          },
        ],
      },
      // ── Grade 2 下册 ──────────────────────────────────────────────────
      {
        semester: '下册',
        topics: [
          {
            topicId: 'en-2b-nature',
            topicName: '自然与动物',
            topicDescription: '动物、天气和自然词汇',
            topicEmoji: '🌿',
            grade: 2,
            semester: '下册',
            questions: [
              {
                topicId: 'en-2b-nature',
                mode: 'picture-word',
                word: 'rabbit',
                phonetic: '/ˈræbɪt/',
                meaning: '兔子',
                emoji: '🐰',
                options: ['rabbit', 'monkey', 'tiger', 'lion'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-2b-nature',
                mode: 'word-picture',
                word: 'monkey',
                phonetic: '/ˈmʌŋki/',
                meaning: '猴子',
                emoji: '🐒',
                options: ['猴子', '兔子', '大象', '老虎'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-2b-nature',
                mode: 'listening',
                word: 'elephant',
                phonetic: '/ˈelɪfənt/',
                meaning: '大象',
                emoji: '🐘',
                options: ['elephant', 'monkey', 'tiger', 'rabbit'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-2b-nature',
                mode: 'spelling',
                word: 'tiger',
                phonetic: '/ˈtaɪɡər/',
                meaning: '老虎',
                emoji: '🐯',
                options: ['tiger', 'lion', 'tiger', 'tigger'],
                difficulty: 'easy',
              },
            ],
          },
          {
            topicId: 'en-2b-number',
            topicName: '数字与形状',
            topicDescription: '1-20数字和基本形状',
            topicEmoji: '🔢',
            grade: 2,
            semester: '下册',
            questions: [
              {
                topicId: 'en-2b-number',
                mode: 'picture-word',
                word: 'twelve',
                phonetic: '/twelv/',
                meaning: '十二',
                emoji: '1️⃣2️⃣',
                options: ['twelve', 'twenty', 'two', 'eleven'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-2b-number',
                mode: 'word-picture',
                word: 'circle',
                phonetic: '/ˈsɜːrkl/',
                meaning: '圆形',
                emoji: '⭕',
                options: ['圆形', '正方形', '三角形', '长方形'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-2b-number',
                mode: 'listening',
                word: 'fifteen',
                phonetic: '/fɪfˈtiːn/',
                meaning: '十五',
                emoji: '1️⃣5️⃣',
                options: ['fifteen', 'fifty', 'five', 'fourteen'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-2b-number',
                mode: 'spelling',
                word: 'square',
                phonetic: '/skweər/',
                meaning: '正方形',
                emoji: '🟩',
                options: ['square', 'circle', 'star', 'sphere'],
                difficulty: 'easy',
              },
            ],
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GRADE 3 — 三年级 (Official PEP curriculum starts — 三年级起点)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    grade: 3,
    gradeLabel: '三年级',
    gradeEmoji: '🌳',
    semesters: [
      // ── Grade 3 上册 ──────────────────────────────────────────────────
      {
        semester: '上册',
        topics: [
          {
            topicId: 'en-3a-greeting',
            topicName: '问候与介绍',
            topicDescription: "Hello! I'm... 自我介绍和打招呼",
            topicEmoji: '👋',
            grade: 3,
            semester: '上册',
            questions: [
              {
                topicId: 'en-3a-greeting',
                mode: 'listening',
                word: 'morning',
                phonetic: '/ˈmɔːrnɪŋ/',
                meaning: '早上',
                emoji: '🌅',
                options: ['morning', 'afternoon', 'evening', 'night'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-3a-greeting',
                mode: 'word-picture',
                word: 'goodbye',
                phonetic: '/ɡʊdˈbaɪ/',
                meaning: '再见',
                emoji: '👋',
                options: ['再见', '你好', '谢谢', '请'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-3a-greeting',
                mode: 'spelling',
                word: 'friend',
                phonetic: '/frend/',
                meaning: '朋友',
                emoji: '🤝',
                options: ['friend', 'fiend', 'freed', 'front'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-3a-greeting',
                mode: 'picture-word',
                word: 'please',
                phonetic: '/pliːz/',
                meaning: '请',
                emoji: '🙏',
                options: ['please', 'plese', 'place', 'peace'],
                difficulty: 'easy',
              },
            ],
          },
          {
            topicId: 'en-3a-colors',
            topicName: '颜色与文具',
            topicDescription: 'Colors, Stationery 文具词汇',
            topicEmoji: '🌈',
            grade: 3,
            semester: '上册',
            questions: [
              {
                topicId: 'en-3a-colors',
                mode: 'word-picture',
                word: 'purple',
                phonetic: '/ˈpɜːrpl/',
                meaning: '紫色',
                emoji: '🟣',
                options: ['紫色', '橙色', '粉色', '蓝色'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-3a-colors',
                mode: 'picture-word',
                word: 'ruler',
                phonetic: '/ˈruːlər/',
                meaning: '尺子',
                emoji: '📏',
                options: ['ruler', 'pen', 'eraser', 'pencil'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-3a-colors',
                mode: 'listening',
                word: 'pencil',
                phonetic: '/ˈpensl/',
                meaning: '铅笔',
                emoji: '✏️',
                options: ['pencil', 'pen', 'ruler', 'eraser'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-3a-colors',
                mode: 'spelling',
                word: 'eraser',
                phonetic: '/ɪˈreɪsər/',
                meaning: '橡皮',
                emoji: '🧹',
                options: ['eraser', 'easer', 'erasor', 'razor'],
                difficulty: 'easy',
              },
            ],
          },
          {
            topicId: 'en-3a-body',
            topicName: '身体部位',
            topicDescription: 'Head, face, nose, eyes...',
            topicEmoji: '🧍',
            grade: 3,
            semester: '上册',
            questions: [
              {
                topicId: 'en-3a-body',
                mode: 'listening',
                word: 'head',
                phonetic: '/hed/',
                meaning: '头',
                emoji: '🗣️',
                options: ['head', 'hand', 'hair', 'hat'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-3a-body',
                mode: 'word-picture',
                word: 'face',
                phonetic: '/feɪs/',
                meaning: '脸',
                emoji: '😊',
                options: ['脸', '头', '手', '脚'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-3a-body',
                mode: 'spelling',
                word: 'mouth',
                phonetic: '/maʊθ/',
                meaning: '嘴巴',
                emoji: '👄',
                options: ['mouth', 'month', 'mouse', 'moth'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-3a-body',
                mode: 'picture-word',
                word: 'ear',
                phonetic: '/ɪər/',
                meaning: '耳朵',
                emoji: '👂',
                options: ['ear', 'eye', 'arm', 'leg'],
                difficulty: 'easy',
              },
            ],
          },
        ],
      },
      // ── Grade 3 下册 ──────────────────────────────────────────────────
      {
        semester: '下册',
        topics: [
          {
            topicId: 'en-3b-food',
            topicName: '食物与表达',
            topicDescription: "I like... I'd like... 食物表达",
            topicEmoji: '🍔',
            grade: 3,
            semester: '下册',
            questions: [
              {
                topicId: 'en-3b-food',
                mode: 'spelling',
                word: 'hamburger',
                phonetic: '/ˈhæmbɜːrɡər/',
                meaning: '汉堡包',
                emoji: '🍔',
                options: ['hamburger', 'hamberger', 'humburger', 'hamburgar'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-3b-food',
                mode: 'word-picture',
                word: 'noodle',
                phonetic: '/ˈnuːdl/',
                meaning: '面条',
                emoji: '🍜',
                options: ['面条', '米饭', '面包', '饺子'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-3b-food',
                mode: 'picture-word',
                word: 'vegetable',
                phonetic: '/ˈvedʒtəbl/',
                meaning: '蔬菜',
                emoji: '🥬',
                options: ['vegetable', 'fruit', 'meat', 'drink'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-3b-food',
                mode: 'listening',
                word: 'orange',
                phonetic: '/ˈɒrɪndʒ/',
                meaning: '橙子',
                emoji: '🍊',
                options: ['orange', 'apple', 'banana', 'grape'],
                difficulty: 'easy',
              },
            ],
          },
          {
            topicId: 'en-3b-animal2',
            topicName: '动物与特征',
            topicDescription: "It's big/small... 描述动物",
            topicEmoji: '🐘',
            grade: 3,
            semester: '下册',
            questions: [
              {
                topicId: 'en-3b-animal2',
                mode: 'listening',
                word: 'giraffe',
                phonetic: '/dʒɪˈrɑːf/',
                meaning: '长颈鹿',
                emoji: '🦒',
                options: ['giraffe', 'elephant', 'monkey', 'zebra'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-3b-animal2',
                mode: 'word-picture',
                word: 'panda',
                phonetic: '/ˈpændə/',
                meaning: '熊猫',
                emoji: '🐼',
                options: ['熊猫', '考拉', '棕熊', '北极熊'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-3b-animal2',
                mode: 'spelling',
                word: 'dolphin',
                phonetic: '/ˈdɒlfɪn/',
                meaning: '海豚',
                emoji: '🐬',
                options: ['dolphin', 'dolfen', 'dolphin', 'daulphin'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-3b-animal2',
                mode: 'picture-word',
                word: 'penguin',
                phonetic: '/ˈpeŋɡwɪn/',
                meaning: '企鹅',
                emoji: '🐧',
                options: ['penguin', 'pigeon', 'parrot', 'pelican'],
                difficulty: 'medium',
              },
            ],
          },
          {
            topicId: 'en-3b-family',
            topicName: '家庭成员',
            topicDescription: 'Father, mother, brother, sister',
            topicEmoji: '👨‍👩‍👧‍👦',
            grade: 3,
            semester: '下册',
            questions: [
              {
                topicId: 'en-3b-family',
                mode: 'word-picture',
                word: 'father',
                phonetic: '/ˈfɑːðər/',
                meaning: '父亲',
                emoji: '👨',
                options: ['父亲', '母亲', '兄弟', '姐妹'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-3b-family',
                mode: 'picture-word',
                word: 'sister',
                phonetic: '/ˈsɪstər/',
                meaning: '姐妹',
                emoji: '👧',
                options: ['sister', 'brother', 'mother', 'father'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-3b-family',
                mode: 'listening',
                word: 'brother',
                phonetic: '/ˈbrʌðər/',
                meaning: '兄弟',
                emoji: '👦',
                options: ['brother', 'sister', 'father', 'mother'],
                difficulty: 'easy',
              },
              {
                topicId: 'en-3b-family',
                mode: 'spelling',
                word: 'grandmother',
                phonetic: '/ˈɡrænmʌðər/',
                meaning: '奶奶/外婆',
                emoji: '👵',
                options: ['grandmother', 'grandfather', 'grandmoter', 'grandom'],
                difficulty: 'medium',
              },
            ],
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GRADE 4 — 四年级
  // ═══════════════════════════════════════════════════════════════════════════
  {
    grade: 4,
    gradeLabel: '四年级',
    gradeEmoji: '🏔️',
    semesters: [
      // ── Grade 4 上册 ──────────────────────────────────────────────────
      {
        semester: '上册',
        topics: [
          {
            topicId: 'en-4a-classroom',
            topicName: '教室与学校',
            topicDescription: 'Classroom, school, subjects',
            topicEmoji: '🏫',
            grade: 4,
            semester: '上册',
            questions: [
              {
                topicId: 'en-4a-classroom',
                mode: 'word-picture',
                word: 'classroom',
                phonetic: '/ˈklɑːsruːm/',
                meaning: '教室',
                emoji: '🏫',
                options: ['教室', '办公室', '图书馆', '操场'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-4a-classroom',
                mode: 'picture-word',
                word: 'library',
                phonetic: '/ˈlaɪbrəri/',
                meaning: '图书馆',
                emoji: '📚',
                options: ['library', 'classroom', 'playground', 'canteen'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-4a-classroom',
                mode: 'listening',
                word: 'computer',
                phonetic: '/kəmˈpjuːtər/',
                meaning: '电脑',
                emoji: '💻',
                options: ['computer', 'calculator', 'keyboard', 'screen'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-4a-classroom',
                mode: 'spelling',
                word: 'homework',
                phonetic: '/ˈhəʊmwɜːrk/',
                meaning: '家庭作业',
                emoji: '📝',
                options: ['homework', 'housework', 'homewoke', 'homewerk'],
                difficulty: 'medium',
              },
            ],
          },
          {
            topicId: 'en-4a-clothes',
            topicName: '服装与天气',
            topicDescription: '衣服、天气和季节的表达',
            topicEmoji: '👕',
            grade: 4,
            semester: '上册',
            questions: [
              {
                topicId: 'en-4a-clothes',
                mode: 'listening',
                word: 'sweater',
                phonetic: '/ˈswetər/',
                meaning: '毛衣',
                emoji: '🧶',
                options: ['sweater', 'jacket', 'shirt', 'dress'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-4a-clothes',
                mode: 'word-picture',
                word: 'sunny',
                phonetic: '/ˈsʌni/',
                meaning: '晴朗的',
                emoji: '☀️',
                options: ['晴朗的', '多云的', '有风的', '下雨的'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-4a-clothes',
                mode: 'spelling',
                word: 'weather',
                phonetic: '/ˈweðər/',
                meaning: '天气',
                emoji: '🌤️',
                options: ['weather', 'wether', 'weathar', 'whether'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-4a-clothes',
                mode: 'picture-word',
                word: 'jacket',
                phonetic: '/ˈdʒækɪt/',
                meaning: '夹克',
                emoji: '🧥',
                options: ['jacket', 'sweater', 'coat', 'shirt'],
                difficulty: 'medium',
              },
            ],
          },
          {
            topicId: 'en-4a-position',
            topicName: '位置与方位',
            topicDescription: 'Where is...? 方位介词',
            topicEmoji: '📍',
            grade: 4,
            semester: '上册',
            questions: [
              {
                topicId: 'en-4a-position',
                mode: 'listening',
                word: 'under',
                phonetic: '/ˈʌndər/',
                meaning: '在……下面',
                emoji: '⬇️',
                options: ['under', 'over', 'on', 'in'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-4a-position',
                mode: 'word-picture',
                word: 'behind',
                phonetic: '/bɪˈhaɪnd/',
                meaning: '在……后面',
                emoji: '🔙',
                options: ['在……后面', '在……前面', '在……旁边', '在……上面'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-4a-position',
                mode: 'spelling',
                word: 'between',
                phonetic: '/bɪˈtwiːn/',
                meaning: '在……之间',
                emoji: '↔️',
                options: ['between', 'behind', 'beyond', 'before'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-4a-position',
                mode: 'picture-word',
                word: 'next',
                phonetic: '/nekst/',
                meaning: '旁边/下一个',
                emoji: '➡️',
                options: ['next', 'near', 'behind', 'front'],
                difficulty: 'medium',
              },
            ],
          },
        ],
      },
      // ── Grade 4 下册 ──────────────────────────────────────────────────
      {
        semester: '下册',
        topics: [
          {
            topicId: 'en-4b-time',
            topicName: '时间与日常',
            topicDescription: 'What time is it? 日常活动',
            topicEmoji: '⏰',
            grade: 4,
            semester: '下册',
            questions: [
              {
                topicId: 'en-4b-time',
                mode: 'spelling',
                word: 'breakfast',
                phonetic: '/ˈbrekfəst/',
                meaning: '早餐',
                emoji: '🥞',
                options: ['breakfast', 'brekfast', 'breakfest', 'breckfast'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-4b-time',
                mode: 'word-picture',
                word: 'evening',
                phonetic: '/ˈiːvnɪŋ/',
                meaning: '傍晚',
                emoji: '🌆',
                options: ['傍晚', '早上', '下午', '午夜'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-4b-time',
                mode: 'picture-word',
                word: 'lunch',
                phonetic: '/lʌntʃ/',
                meaning: '午餐',
                emoji: '🥗',
                options: ['lunch', 'dinner', 'breakfast', 'supper'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-4b-time',
                mode: 'listening',
                word: 'usually',
                phonetic: '/ˈjuːʒuəli/',
                meaning: '通常',
                emoji: '🔄',
                options: ['usually', 'sometimes', 'always', 'never'],
                difficulty: 'medium',
              },
            ],
          },
          {
            topicId: 'en-4b-place',
            topicName: '地点与方向',
            topicDescription: 'Hospital, cinema, bookstore...',
            topicEmoji: '🗺️',
            grade: 4,
            semester: '下册',
            questions: [
              {
                topicId: 'en-4b-place',
                mode: 'word-picture',
                word: 'hospital',
                phonetic: '/ˈhɒspɪtl/',
                meaning: '医院',
                emoji: '🏥',
                options: ['医院', '学校', '商店', '公园'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-4b-place',
                mode: 'picture-word',
                word: 'bookstore',
                phonetic: '/ˈbʊkstɔːr/',
                meaning: '书店',
                emoji: '📖',
                options: ['bookstore', 'library', 'school', 'supermarket'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-4b-place',
                mode: 'listening',
                word: 'cinema',
                phonetic: '/ˈsɪnɪmə/',
                meaning: '电影院',
                emoji: '🎬',
                options: ['cinema', 'theater', 'museum', 'stadium'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-4b-place',
                mode: 'spelling',
                word: 'museum',
                phonetic: '/mjuːˈziːəm/',
                meaning: '博物馆',
                emoji: '🏛️',
                options: ['museum', 'museam', 'musuem', 'muzium'],
                difficulty: 'medium',
              },
            ],
          },
          {
            topicId: 'en-4b-weather2',
            topicName: '天气与活动',
            topicDescription: '描述天气和对应的活动',
            topicEmoji: '⛅',
            grade: 4,
            semester: '下册',
            questions: [
              {
                topicId: 'en-4b-weather2',
                mode: 'listening',
                word: 'rainy',
                phonetic: '/ˈreɪni/',
                meaning: '下雨的',
                emoji: '🌧️',
                options: ['rainy', 'sunny', 'cloudy', 'snowy'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-4b-weather2',
                mode: 'word-picture',
                word: 'exercise',
                phonetic: '/ˈeksərsaɪz/',
                meaning: '锻炼',
                emoji: '🏋️',
                options: ['锻炼', '休息', '吃饭', '睡觉'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-4b-weather2',
                mode: 'spelling',
                word: 'temperature',
                phonetic: '/ˈtemprətʃər/',
                meaning: '温度',
                emoji: '🌡️',
                options: ['temperature', 'temprature', 'tempereture', 'temperture'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-4b-weather2',
                mode: 'picture-word',
                word: 'windy',
                phonetic: '/ˈwɪndi/',
                meaning: '有风的',
                emoji: '💨',
                options: ['windy', 'sunny', 'rainy', 'cloudy'],
                difficulty: 'medium',
              },
            ],
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GRADE 5 — 五年级
  // ═══════════════════════════════════════════════════════════════════════════
  {
    grade: 5,
    gradeLabel: '五年级',
    gradeEmoji: '⭐',
    semesters: [
      // ── Grade 5 上册 ──────────────────────────────────────────────────
      {
        semester: '上册',
        topics: [
          {
            topicId: 'en-5a-day',
            topicName: '星期与月份',
            topicDescription: 'Days, months 日期表达',
            topicEmoji: '📅',
            grade: 5,
            semester: '上册',
            questions: [
              {
                topicId: 'en-5a-day',
                mode: 'spelling',
                word: 'Wednesday',
                phonetic: '/ˈwenzdeɪ/',
                meaning: '星期三',
                emoji: '📅',
                options: ['Wednesday', 'Wensday', 'Wednesay', 'Wendesday'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-5a-day',
                mode: 'word-picture',
                word: 'February',
                phonetic: '/ˈfebruəri/',
                meaning: '二月',
                emoji: '🗓️',
                options: ['二月', '一月', '三月', '四月'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-5a-day',
                mode: 'picture-word',
                word: 'Saturday',
                phonetic: '/ˈsætərdeɪ/',
                meaning: '星期六',
                emoji: '🎉',
                options: ['Saturday', 'Sunday', 'Monday', 'Friday'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-5a-day',
                mode: 'listening',
                word: 'December',
                phonetic: '/dɪˈsembər/',
                meaning: '十二月',
                emoji: '🎄',
                options: ['December', 'November', 'October', 'January'],
                difficulty: 'hard',
              },
            ],
          },
          {
            topicId: 'en-5a-hobby',
            topicName: '爱好与能力',
            topicDescription: 'Can you...? I can... 表达能力',
            topicEmoji: '🎯',
            grade: 5,
            semester: '上册',
            questions: [
              {
                topicId: 'en-5a-hobby',
                mode: 'listening',
                word: 'painting',
                phonetic: '/ˈpeɪntɪŋ/',
                meaning: '绘画',
                emoji: '🎨',
                options: ['painting', 'dancing', 'singing', 'reading'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-5a-hobby',
                mode: 'word-picture',
                word: 'swimming',
                phonetic: '/ˈswɪmɪŋ/',
                meaning: '游泳',
                emoji: '🏊',
                options: ['游泳', '跑步', '跳舞', '唱歌'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-5a-hobby',
                mode: 'spelling',
                word: 'dancing',
                phonetic: '/ˈdænsɪŋ/',
                meaning: '跳舞',
                emoji: '💃',
                options: ['dancing', 'dansing', 'dencing', 'dancin'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-5a-hobby',
                mode: 'picture-word',
                word: 'cooking',
                phonetic: '/ˈkʊkɪŋ/',
                meaning: '做饭',
                emoji: '👨‍🍳',
                options: ['cooking', 'cleaning', 'reading', 'playing'],
                difficulty: 'medium',
              },
            ],
          },
          {
            topicId: 'en-5a-nature',
            topicName: '自然与环保',
            topicDescription: 'Nature, environment 环保词汇',
            topicEmoji: '🌍',
            grade: 5,
            semester: '上册',
            questions: [
              {
                topicId: 'en-5a-nature',
                mode: 'word-picture',
                word: 'recycle',
                phonetic: '/riːˈsaɪkl/',
                meaning: '回收利用',
                emoji: '♻️',
                options: ['回收利用', '浪费', '丢弃', '消耗'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-5a-nature',
                mode: 'spelling',
                word: 'pollution',
                phonetic: '/pəˈluːʃən/',
                meaning: '污染',
                emoji: '🏭',
                options: ['pollution', 'pollushon', 'polushon', 'palution'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-5a-nature',
                mode: 'listening',
                word: 'protect',
                phonetic: '/prəˈtekt/',
                meaning: '保护',
                emoji: '🛡️',
                options: ['protect', 'project', 'produce', 'provide'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-5a-nature',
                mode: 'picture-word',
                word: 'forest',
                phonetic: '/ˈfɒrɪst/',
                meaning: '森林',
                emoji: '🌲',
                options: ['forest', 'desert', 'ocean', 'mountain'],
                difficulty: 'medium',
              },
            ],
          },
        ],
      },
      // ── Grade 5 下册 ──────────────────────────────────────────────────
      {
        semester: '下册',
        topics: [
          {
            topicId: 'en-5b-travel',
            topicName: '旅行与交通',
            topicDescription: 'By bus, by train 旅行交通方式',
            topicEmoji: '✈️',
            grade: 5,
            semester: '下册',
            questions: [
              {
                topicId: 'en-5b-travel',
                mode: 'spelling',
                word: 'passport',
                phonetic: '/ˈpɑːspɔːrt/',
                meaning: '护照',
                emoji: '📕',
                options: ['passport', 'passpart', 'passpert', 'pasport'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-5b-travel',
                mode: 'word-picture',
                word: 'journey',
                phonetic: '/ˈdʒɜːrni/',
                meaning: '旅程',
                emoji: '🗺️',
                options: ['旅程', '度假', '旅行', '出行'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-5b-travel',
                mode: 'listening',
                word: 'luggage',
                phonetic: '/ˈlʌɡɪdʒ/',
                meaning: '行李',
                emoji: '🧳',
                options: ['luggage', 'language', 'package', 'parcel'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-5b-travel',
                mode: 'picture-word',
                word: 'subway',
                phonetic: '/ˈsʌbweɪ/',
                meaning: '地铁',
                emoji: '🚇',
                options: ['subway', 'highway', 'railway', 'runway'],
                difficulty: 'medium',
              },
            ],
          },
          {
            topicId: 'en-5b-feeling',
            topicName: '情感与描述',
            topicDescription: 'How are you? 心情和情感描述',
            topicEmoji: '😊',
            grade: 5,
            semester: '下册',
            questions: [
              {
                topicId: 'en-5b-feeling',
                mode: 'word-picture',
                word: 'excited',
                phonetic: '/ɪkˈsaɪtɪd/',
                meaning: '激动的',
                emoji: '🤩',
                options: ['激动的', '紧张的', '担心的', '失望的'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-5b-feeling',
                mode: 'listening',
                word: 'nervous',
                phonetic: '/ˈnɜːrvəs/',
                meaning: '紧张的',
                emoji: '😰',
                options: ['nervous', 'excited', 'worried', 'angry'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-5b-feeling',
                mode: 'spelling',
                word: 'surprised',
                phonetic: '/sərˈpraɪzd/',
                meaning: '惊讶的',
                emoji: '😲',
                options: ['surprised', 'surprized', 'suprised', 'surprasd'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-5b-feeling',
                mode: 'picture-word',
                word: 'worried',
                phonetic: '/ˈwʌrid/',
                meaning: '担心的',
                emoji: '😟',
                options: ['worried', 'worry', 'worryed', 'wurried'],
                difficulty: 'medium',
              },
            ],
          },
          {
            topicId: 'en-5b-house',
            topicName: '家居与房间',
            topicDescription: 'Living room, bedroom 房间和家具',
            topicEmoji: '🏠',
            grade: 5,
            semester: '下册',
            questions: [
              {
                topicId: 'en-5b-house',
                mode: 'word-picture',
                word: 'kitchen',
                phonetic: '/ˈkɪtʃɪn/',
                meaning: '厨房',
                emoji: '🍳',
                options: ['厨房', '卧室', '客厅', '浴室'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-5b-house',
                mode: 'picture-word',
                word: 'bathroom',
                phonetic: '/ˈbɑːθruːm/',
                meaning: '浴室',
                emoji: '🛁',
                options: ['bathroom', 'bedroom', 'kitchen', 'living room'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-5b-house',
                mode: 'listening',
                word: 'bedroom',
                phonetic: '/ˈbedruːm/',
                meaning: '卧室',
                emoji: '🛏️',
                options: ['bedroom', 'bathroom', 'kitchen', 'dining room'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-5b-house',
                mode: 'spelling',
                word: 'curtain',
                phonetic: '/ˈkɜːrtn/',
                meaning: '窗帘',
                emoji: '🪟',
                options: ['curtain', 'cartain', 'certin', 'curten'],
                difficulty: 'medium',
              },
            ],
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GRADE 6 — 六年级
  // ═══════════════════════════════════════════════════════════════════════════
  {
    grade: 6,
    gradeLabel: '六年级',
    gradeEmoji: '🎓',
    semesters: [
      // ── Grade 6 上册 ──────────────────────────────────────────────────
      {
        semester: '上册',
        topics: [
          {
            topicId: 'en-6a-school',
            topicName: '学校生活',
            topicDescription: 'Subjects, rules, school life',
            topicEmoji: '📚',
            grade: 6,
            semester: '上册',
            questions: [
              {
                topicId: 'en-6a-school',
                mode: 'word-picture',
                word: 'science',
                phonetic: '/ˈsaɪəns/',
                meaning: '科学',
                emoji: '🔬',
                options: ['科学', '数学', '语文', '英语'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-6a-school',
                mode: 'spelling',
                word: 'geography',
                phonetic: '/dʒiˈɒɡrəfi/',
                meaning: '地理',
                emoji: '🗺️',
                options: ['geography', 'geografy', 'georaphy', 'geographie'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-6a-school',
                mode: 'listening',
                word: 'history',
                phonetic: '/ˈhɪstəri/',
                meaning: '历史',
                emoji: '📜',
                options: ['history', 'mystery', 'story', 'factory'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-6a-school',
                mode: 'picture-word',
                word: 'subject',
                phonetic: '/ˈsʌbdʒekt/',
                meaning: '科目',
                emoji: '📖',
                options: ['subject', 'object', 'project', 'protect'],
                difficulty: 'medium',
              },
            ],
          },
          {
            topicId: 'en-6a-future',
            topicName: '梦想与未来',
            topicDescription: 'What do you want to be? Jobs',
            topicEmoji: '🚀',
            grade: 6,
            semester: '上册',
            questions: [
              {
                topicId: 'en-6a-future',
                mode: 'word-picture',
                word: 'scientist',
                phonetic: '/ˈsaɪəntɪst/',
                meaning: '科学家',
                emoji: '🔬',
                options: ['科学家', '老师', '医生', '工程师'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-6a-future',
                mode: 'spelling',
                word: 'pilot',
                phonetic: '/ˈpaɪlət/',
                meaning: '飞行员',
                emoji: '✈️',
                options: ['pilot', 'police', 'pirate', 'planet'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-6a-future',
                mode: 'listening',
                word: 'engineer',
                phonetic: '/ˌendʒɪˈnɪər/',
                meaning: '工程师',
                emoji: '👷',
                options: ['engineer', 'pioneer', 'volunteer', 'magician'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-6a-future',
                mode: 'picture-word',
                word: 'reporter',
                phonetic: '/rɪˈpɔːrtər/',
                meaning: '记者',
                emoji: '📺',
                options: ['reporter', 'report', 'repair', 'record'],
                difficulty: 'hard',
              },
            ],
          },
          {
            topicId: 'en-6a-verb',
            topicName: '动词与时态',
            topicDescription: '过去式和现在进行时基础',
            topicEmoji: '🏃',
            grade: 6,
            semester: '上册',
            questions: [
              {
                topicId: 'en-6a-verb',
                mode: 'spelling',
                word: 'climbed',
                phonetic: '/klaɪmd/',
                meaning: '爬（过去式）',
                emoji: '🧗',
                options: ['climbed', 'climed', 'clamb', 'climbed'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-6a-verb',
                mode: 'word-picture',
                word: 'running',
                phonetic: '/ˈrʌnɪŋ/',
                meaning: '跑步（进行时）',
                emoji: '🏃',
                options: ['跑步（进行时）', '游泳（进行时）', '跳舞（进行时）', '唱歌（进行时）'],
                difficulty: 'medium',
              },
              {
                topicId: 'en-6a-verb',
                mode: 'listening',
                word: 'thought',
                phonetic: '/θɔːt/',
                meaning: '想（过去式）',
                emoji: '💭',
                options: ['thought', 'think', 'taught', 'through'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-6a-verb',
                mode: 'picture-word',
                word: 'wrote',
                phonetic: '/rəʊt/',
                meaning: '写（过去式）',
                emoji: '✍️',
                options: ['wrote', 'write', 'writed', 'writing'],
                difficulty: 'hard',
              },
            ],
          },
        ],
      },
      // ── Grade 6 下册 ──────────────────────────────────────────────────
      {
        semester: '下册',
        topics: [
          {
            topicId: 'en-6b-country',
            topicName: '国家与文化',
            topicDescription: 'Countries, festivals 世界文化',
            topicEmoji: '🌏',
            grade: 6,
            semester: '下册',
            questions: [
              {
                topicId: 'en-6b-country',
                mode: 'listening',
                word: 'culture',
                phonetic: '/ˈkʌltʃər/',
                meaning: '文化',
                emoji: '🎭',
                options: ['culture', 'nature', 'future', 'picture'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-6b-country',
                mode: 'word-picture',
                word: 'tradition',
                phonetic: '/trəˈdɪʃən/',
                meaning: '传统',
                emoji: '🏮',
                options: ['传统', '文化', '节日', '庆典'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-6b-country',
                mode: 'spelling',
                word: 'celebrate',
                phonetic: '/ˈselɪbreɪt/',
                meaning: '庆祝',
                emoji: '🎊',
                options: ['celebrate', 'celebrait', 'celeberate', 'selebrate'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-6b-country',
                mode: 'picture-word',
                word: 'festival',
                phonetic: '/ˈfestɪvl/',
                meaning: '节日',
                emoji: '🪅',
                options: ['festival', 'festure', 'festivel', 'festval'],
                difficulty: 'hard',
              },
            ],
          },
          {
            topicId: 'en-6b-story',
            topicName: '故事与阅读',
            topicDescription: 'Short stories and reading comprehension',
            topicEmoji: '📖',
            grade: 6,
            semester: '下册',
            questions: [
              {
                topicId: 'en-6b-story',
                mode: 'word-picture',
                word: 'character',
                phonetic: '/ˈkærəktər/',
                meaning: '角色/人物',
                emoji: '🧑‍🤝‍🧑',
                options: ['角色/人物', '故事', '情节', '主题'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-6b-story',
                mode: 'listening',
                word: 'adventure',
                phonetic: '/ədˈventʃər/',
                meaning: '冒险',
                emoji: '🗺️',
                options: ['adventure', 'nature', 'future', 'culture'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-6b-story',
                mode: 'spelling',
                word: 'excellent',
                phonetic: '/ˈeksələnt/',
                meaning: '优秀的',
                emoji: '🌟',
                options: ['excellent', 'exelent', 'excellant', 'excellend'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-6b-story',
                mode: 'picture-word',
                word: 'imagine',
                phonetic: '/ɪˈmædʒɪn/',
                meaning: '想象',
                emoji: '💭',
                options: ['imagine', 'image', 'immagine', 'imagne'],
                difficulty: 'hard',
              },
            ],
          },
          {
            topicId: 'en-6b-review',
            topicName: '总复习',
            topicDescription: '小学英语综合复习',
            topicEmoji: '📋',
            grade: 6,
            semester: '下册',
            questions: [
              {
                topicId: 'en-6b-review',
                mode: 'spelling',
                word: 'necessary',
                phonetic: '/ˈnesəsəri/',
                meaning: '必要的',
                emoji: '✅',
                options: ['necessary', 'neccessary', 'necesary', 'neccesary'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-6b-review',
                mode: 'word-picture',
                word: 'knowledge',
                phonetic: '/ˈnɒlɪdʒ/',
                meaning: '知识',
                emoji: '📚',
                options: ['知识', '智慧', '信息', '技能'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-6b-review',
                mode: 'listening',
                word: 'communicate',
                phonetic: '/kəˈmjuːnɪkeɪt/',
                meaning: '交流',
                emoji: '💬',
                options: ['communicate', 'community', 'commute', 'command'],
                difficulty: 'hard',
              },
              {
                topicId: 'en-6b-review',
                mode: 'picture-word',
                word: 'independent',
                phonetic: '/ˌɪndɪˈpendənt/',
                meaning: '独立的',
                emoji: '🦅',
                options: ['independent', 'depend', 'independence', 'dependant'],
                difficulty: 'hard',
              },
            ],
          },
        ],
      },
    ],
  },
];

// ─── Helper: flatten all topics from template ───────────────────────────────

/**
 * Utility to flatten all questions from the template into a single array.
 * Useful for validation and testing.
 */
export function flattenTemplateQuestions(): EnglishQuestionData[] {
  const all: EnglishQuestionData[] = [];
  for (const gradeData of ENGLISH_BANK_TEMPLATE) {
    for (const semesterData of gradeData.semesters) {
      for (const topicData of semesterData.topics) {
        all.push(...topicData.questions);
      }
    }
  }
  return all;
}

/**
 * Get all topic IDs covered in the template, grouped by grade.
 */
export function getTemplateTopicIdsByGrade(): Record<number, string[]> {
  const result: Record<number, string[]> = {};
  for (const gradeData of ENGLISH_BANK_TEMPLATE) {
    const ids: string[] = [];
    for (const semesterData of gradeData.semesters) {
      for (const topicData of semesterData.topics) {
        ids.push(topicData.topicId);
      }
    }
    result[gradeData.grade] = ids;
  }
  return result;
}
