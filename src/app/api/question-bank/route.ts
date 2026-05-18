import { NextResponse } from 'next/server';
import '@/lib/question-bank';

// ─── Template Data ───────────────────────────────────────────────────────────

const TEMPLATES = {
  math: {
    subject: 'math',
    label: '数学',
    description: '数学题库支持加减乘除、比较大小、方程等题型',
    modes: ['add', 'subtract', 'multiply', 'divide', 'compare', 'equation', 'mixed'],
    modeDescriptions: {
      add: '加法运算',
      subtract: '减法运算',
      multiply: '乘法运算',
      divide: '除法运算',
      compare: '比较大小',
      equation: '方程求解',
      mixed: '混合运算',
    },
    questionFields: {
      topicId: 'string — 知识点ID，如 "math-1a-add10"',
      expression: 'string — 算式，如 "3 + 5"',
      answer: 'number | boolean — 答案（比较题用 true/false）',
      options: 'number[] — 四个选项数组',
      difficulty: '"easy" | "medium" | "hard" — 难度等级',
      type: '"add" | "subtract" | "multiply" | "divide" | "compare" | "equation" | "mixed" — 题型',
    },
    jsonExample: {
      meta: {
        id: 'math-custom-1',
        name: '自定义数学题库',
        subject: 'math',
        version: '1.0.0',
        description: '自定义数学题库',
        source: '教师自编',
      },
      data: {
        '1': {
          '上册': [
            {
              topicId: 'math-1a-add10',
              expression: '3 + 5',
              answer: 8,
              options: [7, 8, 9, 6],
              difficulty: 'easy',
              type: 'add',
            },
          ],
        },
      },
    },
  },
  chinese: {
    subject: 'chinese',
    label: '语文',
    description: '语文题库支持汉字识别、拼音、成语、古诗等多种模式',
    modes: [
      'recognize-char', 'recognize-pinyin', 'word-match', 'dictation',
      'idiom-fill', 'antonym', 'poetry-fill', 'synonym', 'sentence-fill',
      'sentence-rearrange', 'reading-comp',
    ],
    modeDescriptions: {
      'recognize-char': '汉字识别',
      'recognize-pinyin': '拼音识别',
      'word-match': '词语搭配',
      dictation: '听写练习',
      'idiom-fill': '成语填空',
      antonym: '反义词',
      'poetry-fill': '古诗填空',
      synonym: '近义词',
      'sentence-fill': '句子填空',
      'sentence-rearrange': '句子排序',
      'reading-comp': '阅读理解',
    },
    questionFields: {
      topicId: 'string — 知识点ID，如 "cn-1a-pinyin"',
      mode: 'string — 练习模式（见上方 modes 列表）',
      prompt: 'string — 题目描述',
      correctAnswer: 'string — 正确答案',
      options: 'string[] — 四个选项数组',
      difficulty: '"easy" | "medium" | "hard" — 难度等级',
    },
    jsonExample: {
      meta: {
        id: 'chinese-custom-1',
        name: '自定义语文题库',
        subject: 'chinese',
        version: '1.0.0',
        description: '自定义语文题库',
        source: '教师自编',
      },
      data: {
        '1': {
          '上册': [
            {
              topicId: 'cn-1a-pinyin',
              mode: 'recognize-pinyin',
              prompt: '选择正确的拼音',
              correctAnswer: 'dà',
              options: ['dà', 'tài', 'dè', 'tǎ'],
              difficulty: 'easy',
            },
          ],
        },
      },
    },
  },
  english: {
    subject: 'english',
    label: '英语',
    description: '英语题库支持看词选图、看图选词、听力挑战、拼写达人四种模式',
    modes: ['word-picture', 'picture-word', 'listening', 'spelling'],
    modeDescriptions: {
      'word-picture': '看词选图',
      'picture-word': '看图选词',
      listening: '听力挑战',
      spelling: '拼写达人',
    },
    questionFields: {
      topicId: 'string — 知识点ID，如 "en-1a-basic"',
      mode: 'string — 练习模式（见上方 modes 列表）',
      word: 'string — 英文单词',
      phonetic: 'string — 音标',
      meaning: 'string — 中文释义',
      emoji: 'string — Emoji 提示',
      options: 'string[] — 四个选项数组',
      difficulty: '"easy" | "medium" | "hard" — 难度等级',
    },
    jsonExample: {
      meta: {
        id: 'english-custom-1',
        name: '自定义英语题库',
        subject: 'english',
        version: '1.0.0',
        description: '自定义英语题库',
        source: '教师自编',
      },
      data: {
        '1': {
          '上册': [
            {
              topicId: 'en-1a-basic',
              mode: 'word-picture',
              word: 'apple',
              phonetic: '/ˈæpl/',
              meaning: '苹果',
              emoji: '🍎',
              options: ['苹果', '香蕉', '橘子', '葡萄'],
              difficulty: 'easy',
            },
          ],
        },
      },
    },
  },
} as const;

// ─── GET: Return templates ───────────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({
    success: true,
    templates: TEMPLATES,
    topicIdConvention: {
      description: '格式：科目前缀-年级a/b-知识点',
      prefix: {
        math: 'math-',
        chinese: 'cn-',
        english: 'en-',
      },
      semester: {
        a: '上册',
        b: '下册',
      },
      examples: [
        { id: 'math-1a-add10', desc: '一年级上册 10以内加法' },
        { id: 'math-2b-div9', desc: '二年级下册 除法' },
        { id: 'cn-1a-pinyin', desc: '一年级上册 拼音' },
        { id: 'cn-3a-idiom', desc: '三年级上册 成语' },
        { id: 'en-1a-basic', desc: '一年级上册 基础词汇' },
        { id: 'en-2a-family', desc: '二年级上册 家庭词汇' },
      ],
    },
    difficulty: {
      easy: '简单 — 基础知识点',
      medium: '中等 — 综合应用',
      hard: '困难 — 拓展提升',
    },
  });
}
