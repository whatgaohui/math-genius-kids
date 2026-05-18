// ═══════════════════════════════════════════════════════════════════════════════
// English Question Bank — Generators
// ─────────────────────────────────────────────────────────────────────────────
// Dynamic question generators that create English practice questions from
// a curated vocabulary database. Each generator targets a specific mode
// (word-picture, picture-word, listening, spelling) and produces
// `EnglishQuestion` objects compatible with the modular question bank.
//
// Vocabulary is organized by grade with topic tags, so generators can
// produce questions scoped to any grade, semester, or topic.
// ═══════════════════════════════════════════════════════════════════════════════

import type { EnglishQuestion, EnglishMode, Grade, Semester } from '../types';

// ─── Vocabulary Entry ───────────────────────────────────────────────────────

/**
 * Internal representation of a single vocabulary word.
 *
 * Extends the basic word data with a topic ID for filtering, and
 * a difficulty tag for question calibration.
 */
export interface VocabEntry {
  /** The English word */
  word: string;
  /** IPA phonetic transcription */
  phonetic: string;
  /** Chinese meaning */
  meaning: string;
  /** Visual emoji hint */
  emoji: string;
  /** Topic this word belongs to (matches curriculum-config.ts) */
  topicId: string;
  /** Target grade (1-6) */
  grade: Grade;
  /** Target semester */
  semester: Semester;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VOCABULARY DATABASE — Grade 1 (一年级)
// Simple words: colors, animals, body parts, numbers, food
// ═══════════════════════════════════════════════════════════════════════════════

const GRADE_1_VOCAB: VocabEntry[] = [
  // ── en-1a-basic: 基础词汇 ──
  { word: 'red', phonetic: '/red/', meaning: '红色', emoji: '🔴', topicId: 'en-1a-basic', grade: 1, semester: '上册' },
  { word: 'blue', phonetic: '/bluː/', meaning: '蓝色', emoji: '🔵', topicId: 'en-1a-basic', grade: 1, semester: '上册' },
  { word: 'green', phonetic: '/ɡriːn/', meaning: '绿色', emoji: '🟢', topicId: 'en-1a-basic', grade: 1, semester: '上册' },
  { word: 'yellow', phonetic: '/ˈjeləʊ/', meaning: '黄色', emoji: '🟡', topicId: 'en-1a-basic', grade: 1, semester: '上册' },
  { word: 'hello', phonetic: '/həˈləʊ/', meaning: '你好', emoji: '👋', topicId: 'en-1a-basic', grade: 1, semester: '上册' },
  { word: 'hi', phonetic: '/haɪ/', meaning: '嗨', emoji: '👋', topicId: 'en-1a-basic', grade: 1, semester: '上册' },
  { word: 'good', phonetic: '/ɡʊd/', meaning: '好的', emoji: '👍', topicId: 'en-1a-basic', grade: 1, semester: '上册' },
  { word: 'morning', phonetic: '/ˈmɔːrnɪŋ/', meaning: '早上', emoji: '🌅', topicId: 'en-1a-basic', grade: 1, semester: '上册' },

  // ── en-1a-animal: 动物乐园 ──
  { word: 'cat', phonetic: '/kæt/', meaning: '猫', emoji: '🐱', topicId: 'en-1a-animal', grade: 1, semester: '上册' },
  { word: 'dog', phonetic: '/dɒɡ/', meaning: '狗', emoji: '🐕', topicId: 'en-1a-animal', grade: 1, semester: '上册' },
  { word: 'bird', phonetic: '/bɜːrd/', meaning: '鸟', emoji: '🐦', topicId: 'en-1a-animal', grade: 1, semester: '上册' },
  { word: 'fish', phonetic: '/fɪʃ/', meaning: '鱼', emoji: '🐟', topicId: 'en-1a-animal', grade: 1, semester: '上册' },
  { word: 'pig', phonetic: '/pɪɡ/', meaning: '猪', emoji: '🐷', topicId: 'en-1a-animal', grade: 1, semester: '上册' },
  { word: 'duck', phonetic: '/dʌk/', meaning: '鸭子', emoji: '🦆', topicId: 'en-1a-animal', grade: 1, semester: '上册' },
  { word: 'hen', phonetic: '/hen/', meaning: '母鸡', emoji: '🐔', topicId: 'en-1a-animal', grade: 1, semester: '上册' },
  { word: 'cow', phonetic: '/kaʊ/', meaning: '奶牛', emoji: '🐄', topicId: 'en-1a-animal', grade: 1, semester: '上册' },
  { word: 'bear', phonetic: '/beər/', meaning: '熊', emoji: '🐻', topicId: 'en-1a-animal', grade: 1, semester: '上册' },
  { word: 'frog', phonetic: '/frɒɡ/', meaning: '青蛙', emoji: '🐸', topicId: 'en-1a-animal', grade: 1, semester: '上册' },

  // ── en-1b-body: 身体与家庭 ──
  { word: 'eye', phonetic: '/aɪ/', meaning: '眼睛', emoji: '👁️', topicId: 'en-1b-body', grade: 1, semester: '下册' },
  { word: 'nose', phonetic: '/nəʊz/', meaning: '鼻子', emoji: '👃', topicId: 'en-1b-body', grade: 1, semester: '下册' },
  { word: 'hand', phonetic: '/hænd/', meaning: '手', emoji: '✋', topicId: 'en-1b-body', grade: 1, semester: '下册' },
  { word: 'foot', phonetic: '/fʊt/', meaning: '脚', emoji: '🦶', topicId: 'en-1b-body', grade: 1, semester: '下册' },
  { word: 'ear', phonetic: '/ɪər/', meaning: '耳朵', emoji: '👂', topicId: 'en-1b-body', grade: 1, semester: '下册' },
  { word: 'mouth', phonetic: '/maʊθ/', meaning: '嘴巴', emoji: '👄', topicId: 'en-1b-body', grade: 1, semester: '下册' },
  { word: 'head', phonetic: '/hed/', meaning: '头', emoji: '🗣️', topicId: 'en-1b-body', grade: 1, semester: '下册' },
  { word: 'mom', phonetic: '/mɒm/', meaning: '妈妈', emoji: '👩', topicId: 'en-1b-body', grade: 1, semester: '下册' },
  { word: 'dad', phonetic: '/dæd/', meaning: '爸爸', emoji: '👨', topicId: 'en-1b-body', grade: 1, semester: '下册' },

  // ── en-1b-fruit: 水果与食物 ──
  { word: 'apple', phonetic: '/ˈæpl/', meaning: '苹果', emoji: '🍎', topicId: 'en-1b-fruit', grade: 1, semester: '下册' },
  { word: 'banana', phonetic: '/bəˈnænə/', meaning: '香蕉', emoji: '🍌', topicId: 'en-1b-fruit', grade: 1, semester: '下册' },
  { word: 'cake', phonetic: '/keɪk/', meaning: '蛋糕', emoji: '🎂', topicId: 'en-1b-fruit', grade: 1, semester: '下册' },
  { word: 'milk', phonetic: '/mɪlk/', meaning: '牛奶', emoji: '🥛', topicId: 'en-1b-fruit', grade: 1, semester: '下册' },
  { word: 'egg', phonetic: '/eɡ/', meaning: '鸡蛋', emoji: '🥚', topicId: 'en-1b-fruit', grade: 1, semester: '下册' },
  { word: 'rice', phonetic: '/raɪs/', meaning: '米饭', emoji: '🍚', topicId: 'en-1b-fruit', grade: 1, semester: '下册' },
  { word: 'water', phonetic: '/ˈwɔːtər/', meaning: '水', emoji: '💧', topicId: 'en-1b-fruit', grade: 1, semester: '下册' },
  { word: 'pear', phonetic: '/peər/', meaning: '梨', emoji: '🍐', topicId: 'en-1b-fruit', grade: 1, semester: '下册' },
  { word: 'peach', phonetic: '/piːtʃ/', meaning: '桃子', emoji: '🍑', topicId: 'en-1b-fruit', grade: 1, semester: '下册' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// VOCABULARY DATABASE — Grade 2 (二年级)
// Simple words: toys, colors, animals, weather, numbers, shapes
// ═══════════════════════════════════════════════════════════════════════════════

const GRADE_2_VOCAB: VocabEntry[] = [
  // ── en-2a-food: 食物与饮料 ──
  { word: 'bread', phonetic: '/bred/', meaning: '面包', emoji: '🍞', topicId: 'en-2a-food', grade: 2, semester: '上册' },
  { word: 'chicken', phonetic: '/ˈtʃɪkɪn/', meaning: '鸡肉', emoji: '🍗', topicId: 'en-2a-food', grade: 2, semester: '上册' },
  { word: 'juice', phonetic: '/dʒuːs/', meaning: '果汁', emoji: '🧃', topicId: 'en-2a-food', grade: 2, semester: '上册' },
  { word: 'candy', phonetic: '/ˈkændi/', meaning: '糖果', emoji: '🍬', topicId: 'en-2a-food', grade: 2, semester: '上册' },
  { word: 'soup', phonetic: '/suːp/', meaning: '汤', emoji: '🍜', topicId: 'en-2a-food', grade: 2, semester: '上册' },
  { word: 'tea', phonetic: '/tiː/', meaning: '茶', emoji: '🍵', topicId: 'en-2a-food', grade: 2, semester: '上册' },
  { word: 'beef', phonetic: '/biːf/', meaning: '牛肉', emoji: '🥩', topicId: 'en-2a-food', grade: 2, semester: '上册' },
  { word: 'noodle', phonetic: '/ˈnuːdl/', meaning: '面条', emoji: '🍜', topicId: 'en-2a-food', grade: 2, semester: '上册' },
  { word: 'cookie', phonetic: '/ˈkʊki/', meaning: '饼干', emoji: '🍪', topicId: 'en-2a-food', grade: 2, semester: '上册' },

  // ── en-2a-toy: 玩具与颜色 ──
  { word: 'doll', phonetic: '/dɒl/', meaning: '娃娃', emoji: '🧸', topicId: 'en-2a-toy', grade: 2, semester: '上册' },
  { word: 'ball', phonetic: '/bɔːl/', meaning: '球', emoji: '⚽', topicId: 'en-2a-toy', grade: 2, semester: '上册' },
  { word: 'kite', phonetic: '/kaɪt/', meaning: '风筝', emoji: '🪁', topicId: 'en-2a-toy', grade: 2, semester: '上册' },
  { word: 'white', phonetic: '/waɪt/', meaning: '白色', emoji: '⚪', topicId: 'en-2a-toy', grade: 2, semester: '上册' },
  { word: 'black', phonetic: '/blæk/', meaning: '黑色', emoji: '⚫', topicId: 'en-2a-toy', grade: 2, semester: '上册' },
  { word: 'brown', phonetic: '/braʊn/', meaning: '棕色', emoji: '🟤', topicId: 'en-2a-toy', grade: 2, semester: '上册' },
  { word: 'pink', phonetic: '/pɪŋk/', meaning: '粉色', emoji: '🩷', topicId: 'en-2a-toy', grade: 2, semester: '上册' },
  { word: 'orange', phonetic: '/ˈɒrɪndʒ/', meaning: '橙子', emoji: '🍊', topicId: 'en-2a-toy', grade: 2, semester: '上册' },
  { word: 'purple', phonetic: '/ˈpɜːrpl/', meaning: '紫色', emoji: '🟣', topicId: 'en-2a-toy', grade: 2, semester: '上册' },

  // ── en-2b-nature: 自然与动物 ──
  { word: 'rabbit', phonetic: '/ˈræbɪt/', meaning: '兔子', emoji: '🐰', topicId: 'en-2b-nature', grade: 2, semester: '下册' },
  { word: 'monkey', phonetic: '/ˈmʌŋki/', meaning: '猴子', emoji: '🐒', topicId: 'en-2b-nature', grade: 2, semester: '下册' },
  { word: 'elephant', phonetic: '/ˈelɪfənt/', meaning: '大象', emoji: '🐘', topicId: 'en-2b-nature', grade: 2, semester: '下册' },
  { word: 'tiger', phonetic: '/ˈtaɪɡər/', meaning: '老虎', emoji: '🐯', topicId: 'en-2b-nature', grade: 2, semester: '下册' },
  { word: 'lion', phonetic: '/ˈlaɪən/', meaning: '狮子', emoji: '🦁', topicId: 'en-2b-nature', grade: 2, semester: '下册' },
  { word: 'spring', phonetic: '/sprɪŋ/', meaning: '春天', emoji: '🌷', topicId: 'en-2b-nature', grade: 2, semester: '下册' },
  { word: 'summer', phonetic: '/ˈsʌmər/', meaning: '夏天', emoji: '🌞', topicId: 'en-2b-nature', grade: 2, semester: '下册' },
  { word: 'autumn', phonetic: '/ˈɔːtəm/', meaning: '秋天', emoji: '🍂', topicId: 'en-2b-nature', grade: 2, semester: '下册' },
  { word: 'winter', phonetic: '/ˈwɪntər/', meaning: '冬天', emoji: '❄️', topicId: 'en-2b-nature', grade: 2, semester: '下册' },

  // ── en-2b-number: 数字与形状 ──
  { word: 'twelve', phonetic: '/twelv/', meaning: '十二', emoji: '🔢', topicId: 'en-2b-number', grade: 2, semester: '下册' },
  { word: 'circle', phonetic: '/ˈsɜːrkl/', meaning: '圆形', emoji: '⭕', topicId: 'en-2b-number', grade: 2, semester: '下册' },
  { word: 'fifteen', phonetic: '/fɪfˈtiːn/', meaning: '十五', emoji: '🔢', topicId: 'en-2b-number', grade: 2, semester: '下册' },
  { word: 'square', phonetic: '/skweər/', meaning: '正方形', emoji: '🟩', topicId: 'en-2b-number', grade: 2, semester: '下册' },
  { word: 'twenty', phonetic: '/ˈtwenti/', meaning: '二十', emoji: '🔢', topicId: 'en-2b-number', grade: 2, semester: '下册' },
  { word: 'triangle', phonetic: '/ˈtraɪæŋɡl/', meaning: '三角形', emoji: '🔺', topicId: 'en-2b-number', grade: 2, semester: '下册' },
  { word: 'eleven', phonetic: '/ɪˈlevn/', meaning: '十一', emoji: '🔢', topicId: 'en-2b-number', grade: 2, semester: '下册' },
  { word: 'rectangle', phonetic: '/ˈrektæŋɡl/', meaning: '长方形', emoji: '🟦', topicId: 'en-2b-number', grade: 2, semester: '下册' },
  { word: 'star', phonetic: '/stɑːr/', meaning: '星形', emoji: '⭐', topicId: 'en-2b-number', grade: 2, semester: '下册' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// VOCABULARY DATABASE — Grade 3 (三年级)
// School vocabulary, greetings, colors, body, food, animals, family
// ═══════════════════════════════════════════════════════════════════════════════

const GRADE_3_VOCAB: VocabEntry[] = [
  // ── en-3a-greeting: 问候与介绍 ──
  { word: 'goodbye', phonetic: '/ɡʊdˈbaɪ/', meaning: '再见', emoji: '👋', topicId: 'en-3a-greeting', grade: 3, semester: '上册' },
  { word: 'friend', phonetic: '/frend/', meaning: '朋友', emoji: '🤝', topicId: 'en-3a-greeting', grade: 3, semester: '上册' },
  { word: 'please', phonetic: '/pliːz/', meaning: '请', emoji: '🙏', topicId: 'en-3a-greeting', grade: 3, semester: '上册' },
  { word: 'thank', phonetic: '/θæŋk/', meaning: '谢谢', emoji: '🙏', topicId: 'en-3a-greeting', grade: 3, semester: '上册' },
  { word: 'name', phonetic: '/neɪm/', meaning: '名字', emoji: '📛', topicId: 'en-3a-greeting', grade: 3, semester: '上册' },
  { word: 'afternoon', phonetic: '/ˌæftərˈnuːn/', meaning: '下午', emoji: '🌇', topicId: 'en-3a-greeting', grade: 3, semester: '上册' },
  { word: 'fine', phonetic: '/faɪn/', meaning: '好的', emoji: '😊', topicId: 'en-3a-greeting', grade: 3, semester: '上册' },
  { word: 'nice', phonetic: '/naɪs/', meaning: '好的', emoji: '👍', topicId: 'en-3a-greeting', grade: 3, semester: '上册' },
  { word: 'meet', phonetic: '/miːt/', meaning: '遇见', emoji: '🤝', topicId: 'en-3a-greeting', grade: 3, semester: '上册' },
  { word: 'too', phonetic: '/tuː/', meaning: '也', emoji: '✌️', topicId: 'en-3a-greeting', grade: 3, semester: '上册' },

  // ── en-3a-colors: 颜色与文具 ──
  { word: 'ruler', phonetic: '/ˈruːlər/', meaning: '尺子', emoji: '📏', topicId: 'en-3a-colors', grade: 3, semester: '上册' },
  { word: 'pencil', phonetic: '/ˈpensl/', meaning: '铅笔', emoji: '✏️', topicId: 'en-3a-colors', grade: 3, semester: '上册' },
  { word: 'eraser', phonetic: '/ɪˈreɪsər/', meaning: '橡皮', emoji: '🧹', topicId: 'en-3a-colors', grade: 3, semester: '上册' },
  { word: 'crayon', phonetic: '/ˈkreɪən/', meaning: '蜡笔', emoji: '🖍️', topicId: 'en-3a-colors', grade: 3, semester: '上册' },
  { word: 'bag', phonetic: '/bæɡ/', meaning: '书包', emoji: '🎒', topicId: 'en-3a-colors', grade: 3, semester: '上册' },
  { word: 'pen', phonetic: '/pen/', meaning: '钢笔', emoji: '🖊️', topicId: 'en-3a-colors', grade: 3, semester: '上册' },
  { word: 'book', phonetic: '/bʊk/', meaning: '书', emoji: '📖', topicId: 'en-3a-colors', grade: 3, semester: '上册' },
  { word: 'brown', phonetic: '/braʊn/', meaning: '棕色', emoji: '🟤', topicId: 'en-3a-colors', grade: 3, semester: '上册' },

  // ── en-3a-body: 身体部位 ──
  { word: 'face', phonetic: '/feɪs/', meaning: '脸', emoji: '😊', topicId: 'en-3a-body', grade: 3, semester: '上册' },
  { word: 'ear', phonetic: '/ɪər/', meaning: '耳朵', emoji: '👂', topicId: 'en-3a-body', grade: 3, semester: '上册' },
  { word: 'arm', phonetic: '/ɑːrm/', meaning: '胳膊', emoji: '💪', topicId: 'en-3a-body', grade: 3, semester: '上册' },
  { word: 'leg', phonetic: '/leɡ/', meaning: '腿', emoji: '🦵', topicId: 'en-3a-body', grade: 3, semester: '上册' },
  { word: 'hair', phonetic: '/heər/', meaning: '头发', emoji: '💇', topicId: 'en-3a-body', grade: 3, semester: '上册' },
  { word: 'tooth', phonetic: '/tuːθ/', meaning: '牙齿', emoji: '🦷', topicId: 'en-3a-body', grade: 3, semester: '上册' },
  { word: 'finger', phonetic: '/ˈfɪŋɡər/', meaning: '手指', emoji: '☝️', topicId: 'en-3a-body', grade: 3, semester: '上册' },
  { word: 'knee', phonetic: '/niː/', meaning: '膝盖', emoji: '🦿', topicId: 'en-3a-body', grade: 3, semester: '上册' },

  // ── en-3b-food: 食物与表达 ──
  { word: 'hamburger', phonetic: '/ˈhæmbɜːrɡər/', meaning: '汉堡包', emoji: '🍔', topicId: 'en-3b-food', grade: 3, semester: '下册' },
  { word: 'vegetable', phonetic: '/ˈvedʒtəbl/', meaning: '蔬菜', emoji: '🥬', topicId: 'en-3b-food', grade: 3, semester: '下册' },
  { word: 'chocolate', phonetic: '/ˈtʃɒklət/', meaning: '巧克力', emoji: '🍫', topicId: 'en-3b-food', grade: 3, semester: '下册' },
  { word: 'salad', phonetic: '/ˈsæləd/', meaning: '沙拉', emoji: '🥗', topicId: 'en-3b-food', grade: 3, semester: '下册' },
  { word: 'sandwich', phonetic: '/ˈsænwɪtʃ/', meaning: '三明治', emoji: '🥪', topicId: 'en-3b-food', grade: 3, semester: '下册' },
  { word: 'ice cream', phonetic: '/aɪs kriːm/', meaning: '冰淇淋', emoji: '🍦', topicId: 'en-3b-food', grade: 3, semester: '下册' },
  { word: 'juice', phonetic: '/dʒuːs/', meaning: '果汁', emoji: '🧃', topicId: 'en-3b-food', grade: 3, semester: '下册' },

  // ── en-3b-animal2: 动物与特征 ──
  { word: 'giraffe', phonetic: '/dʒɪˈrɑːf/', meaning: '长颈鹿', emoji: '🦒', topicId: 'en-3b-animal2', grade: 3, semester: '下册' },
  { word: 'panda', phonetic: '/ˈpændə/', meaning: '熊猫', emoji: '🐼', topicId: 'en-3b-animal2', grade: 3, semester: '下册' },
  { word: 'dolphin', phonetic: '/ˈdɒlfɪn/', meaning: '海豚', emoji: '🐬', topicId: 'en-3b-animal2', grade: 3, semester: '下册' },
  { word: 'penguin', phonetic: '/ˈpeŋɡwɪn/', meaning: '企鹅', emoji: '🐧', topicId: 'en-3b-animal2', grade: 3, semester: '下册' },
  { word: 'zebra', phonetic: '/ˈzebrə/', meaning: '斑马', emoji: '🦓', topicId: 'en-3b-animal2', grade: 3, semester: '下册' },
  { word: 'sheep', phonetic: '/ʃiːp/', meaning: '绵羊', emoji: '🐑', topicId: 'en-3b-animal2', grade: 3, semester: '下册' },
  { word: 'horse', phonetic: '/hɔːrs/', meaning: '马', emoji: '🐴', topicId: 'en-3b-animal2', grade: 3, semester: '下册' },
  { word: 'monkey', phonetic: '/ˈmʌŋki/', meaning: '猴子', emoji: '🐒', topicId: 'en-3b-animal2', grade: 3, semester: '下册' },

  // ── en-3b-family: 家庭成员 ──
  { word: 'father', phonetic: '/ˈfɑːðər/', meaning: '父亲', emoji: '👨', topicId: 'en-3b-family', grade: 3, semester: '下册' },
  { word: 'mother', phonetic: '/ˈmʌðər/', meaning: '母亲', emoji: '👩', topicId: 'en-3b-family', grade: 3, semester: '下册' },
  { word: 'brother', phonetic: '/ˈbrʌðər/', meaning: '兄弟', emoji: '👦', topicId: 'en-3b-family', grade: 3, semester: '下册' },
  { word: 'sister', phonetic: '/ˈsɪstər/', meaning: '姐妹', emoji: '👧', topicId: 'en-3b-family', grade: 3, semester: '下册' },
  { word: 'grandmother', phonetic: '/ˈɡrænmʌðər/', meaning: '奶奶/外婆', emoji: '👵', topicId: 'en-3b-family', grade: 3, semester: '下册' },
  { word: 'grandfather', phonetic: '/ˈɡrænfaːðər/', meaning: '爷爷/外公', emoji: '👴', topicId: 'en-3b-family', grade: 3, semester: '下册' },
  { word: 'uncle', phonetic: '/ˈʌŋkl/', meaning: '叔叔', emoji: '🧔', topicId: 'en-3b-family', grade: 3, semester: '下册' },
  { word: 'aunt', phonetic: '/ɑːnt/', meaning: '阿姨', emoji: '👩‍🦰', topicId: 'en-3b-family', grade: 3, semester: '下册' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// VOCABULARY DATABASE — Grade 4 (四年级)
// Classroom, weather, clothes, positions, time, places
// ═══════════════════════════════════════════════════════════════════════════════

const GRADE_4_VOCAB: VocabEntry[] = [
  // ── en-4a-classroom: 教室与学校 ──
  { word: 'classroom', phonetic: '/ˈklɑːsruːm/', meaning: '教室', emoji: '🏫', topicId: 'en-4a-classroom', grade: 4, semester: '上册' },
  { word: 'library', phonetic: '/ˈlaɪbrəri/', meaning: '图书馆', emoji: '📚', topicId: 'en-4a-classroom', grade: 4, semester: '上册' },
  { word: 'computer', phonetic: '/kəmˈpjuːtər/', meaning: '电脑', emoji: '💻', topicId: 'en-4a-classroom', grade: 4, semester: '上册' },
  { word: 'homework', phonetic: '/ˈhəʊmwɜːrk/', meaning: '家庭作业', emoji: '📝', topicId: 'en-4a-classroom', grade: 4, semester: '上册' },
  { word: 'teacher', phonetic: '/ˈtiːtʃər/', meaning: '老师', emoji: '👩‍🏫', topicId: 'en-4a-classroom', grade: 4, semester: '上册' },
  { word: 'student', phonetic: '/ˈstjuːdənt/', meaning: '学生', emoji: '🧑‍🎓', topicId: 'en-4a-classroom', grade: 4, semester: '上册' },
  { word: 'desk', phonetic: '/desk/', meaning: '课桌', emoji: '🪑', topicId: 'en-4a-classroom', grade: 4, semester: '上册' },
  { word: 'floor', phonetic: '/flɔːr/', meaning: '地板', emoji: '🟫', topicId: 'en-4a-classroom', grade: 4, semester: '上册' },
  { word: 'wall', phonetic: '/wɔːl/', meaning: '墙壁', emoji: '🧱', topicId: 'en-4a-classroom', grade: 4, semester: '上册' },
  { word: 'board', phonetic: '/bɔːrd/', meaning: '黑板', emoji: '📋', topicId: 'en-4a-classroom', grade: 4, semester: '上册' },

  // ── en-4a-clothes: 服装与天气 ──
  { word: 'sweater', phonetic: '/ˈswetər/', meaning: '毛衣', emoji: '🧶', topicId: 'en-4a-clothes', grade: 4, semester: '上册' },
  { word: 'sunny', phonetic: '/ˈsʌni/', meaning: '晴朗的', emoji: '☀️', topicId: 'en-4a-clothes', grade: 4, semester: '上册' },
  { word: 'weather', phonetic: '/ˈweðər/', meaning: '天气', emoji: '🌤️', topicId: 'en-4a-clothes', grade: 4, semester: '上册' },
  { word: 'jacket', phonetic: '/ˈdʒækɪt/', meaning: '夹克', emoji: '🧥', topicId: 'en-4a-clothes', grade: 4, semester: '上册' },
  { word: 'cloudy', phonetic: '/ˈklaʊdi/', meaning: '多云的', emoji: '⛅', topicId: 'en-4a-clothes', grade: 4, semester: '上册' },
  { word: 'rainy', phonetic: '/ˈreɪni/', meaning: '下雨的', emoji: '🌧️', topicId: 'en-4a-clothes', grade: 4, semester: '上册' },
  { word: 'windy', phonetic: '/ˈwɪndi/', meaning: '有风的', emoji: '💨', topicId: 'en-4a-clothes', grade: 4, semester: '上册' },
  { word: 'shirt', phonetic: '/ʃɜːrt/', meaning: '衬衫', emoji: '👔', topicId: 'en-4a-clothes', grade: 4, semester: '上册' },
  { word: 'coat', phonetic: '/kəʊt/', meaning: '外套', emoji: '🧥', topicId: 'en-4a-clothes', grade: 4, semester: '上册' },

  // ── en-4a-position: 位置与方位 ──
  { word: 'under', phonetic: '/ˈʌndər/', meaning: '在……下面', emoji: '⬇️', topicId: 'en-4a-position', grade: 4, semester: '上册' },
  { word: 'behind', phonetic: '/bɪˈhaɪnd/', meaning: '在……后面', emoji: '🔙', topicId: 'en-4a-position', grade: 4, semester: '上册' },
  { word: 'between', phonetic: '/bɪˈtwiːn/', meaning: '在……之间', emoji: '↔️', topicId: 'en-4a-position', grade: 4, semester: '上册' },
  { word: 'near', phonetic: '/nɪər/', meaning: '在……旁边', emoji: '📍', topicId: 'en-4a-position', grade: 4, semester: '上册' },
  { word: 'beside', phonetic: '/bɪˈsaɪd/', meaning: '在……旁边', emoji: '↔️', topicId: 'en-4a-position', grade: 4, semester: '上册' },
  { word: 'above', phonetic: '/əˈbʌv/', meaning: '在……上面', emoji: '⬆️', topicId: 'en-4a-position', grade: 4, semester: '上册' },
  { word: 'below', phonetic: '/bɪˈləʊ/', meaning: '在……下方', emoji: '⬇️', topicId: 'en-4a-position', grade: 4, semester: '上册' },
  { word: 'in front of', phonetic: '/ɪn frʌnt ɒv/', meaning: '在……前面', emoji: '▶️', topicId: 'en-4a-position', grade: 4, semester: '上册' },

  // ── en-4b-time: 时间与日常 ──
  { word: 'breakfast', phonetic: '/ˈbrekfəst/', meaning: '早餐', emoji: '🥞', topicId: 'en-4b-time', grade: 4, semester: '下册' },
  { word: 'evening', phonetic: '/ˈiːvnɪŋ/', meaning: '傍晚', emoji: '🌆', topicId: 'en-4b-time', grade: 4, semester: '下册' },
  { word: 'lunch', phonetic: '/lʌntʃ/', meaning: '午餐', emoji: '🥗', topicId: 'en-4b-time', grade: 4, semester: '下册' },
  { word: 'usually', phonetic: '/ˈjuːʒuəli/', meaning: '通常', emoji: '🔄', topicId: 'en-4b-time', grade: 4, semester: '下册' },
  { word: 'sometimes', phonetic: '/ˈsʌmtaɪmz/', meaning: '有时候', emoji: '❓', topicId: 'en-4b-time', grade: 4, semester: '下册' },
  { word: 'always', phonetic: '/ˈɔːlweɪz/', meaning: '总是', emoji: '♾️', topicId: 'en-4b-time', grade: 4, semester: '下册' },
  { word: 'never', phonetic: '/ˈnevər/', meaning: '从不', emoji: '🚫', topicId: 'en-4b-time', grade: 4, semester: '下册' },
  { word: 'dinner', phonetic: '/ˈdɪnər/', meaning: '晚餐', emoji: '🍽️', topicId: 'en-4b-time', grade: 4, semester: '下册' },
  { word: 'morning', phonetic: '/ˈmɔːrnɪŋ/', meaning: '早上', emoji: '🌅', topicId: 'en-4b-time', grade: 4, semester: '下册' },

  // ── en-4b-place: 地点与方向 ──
  { word: 'hospital', phonetic: '/ˈhɒspɪtl/', meaning: '医院', emoji: '🏥', topicId: 'en-4b-place', grade: 4, semester: '下册' },
  { word: 'bookstore', phonetic: '/ˈbʊkstɔːr/', meaning: '书店', emoji: '📖', topicId: 'en-4b-place', grade: 4, semester: '下册' },
  { word: 'cinema', phonetic: '/ˈsɪnɪmə/', meaning: '电影院', emoji: '🎬', topicId: 'en-4b-place', grade: 4, semester: '下册' },
  { word: 'museum', phonetic: '/mjuːˈziːəm/', meaning: '博物馆', emoji: '🏛️', topicId: 'en-4b-place', grade: 4, semester: '下册' },
  { word: 'supermarket', phonetic: '/ˈsuːpərmɑːrkɪt/', meaning: '超市', emoji: '🛒', topicId: 'en-4b-place', grade: 4, semester: '下册' },
  { word: 'park', phonetic: '/pɑːrk/', meaning: '公园', emoji: '🏞️', topicId: 'en-4b-place', grade: 4, semester: '下册' },
  { word: 'zoo', phonetic: '/zuː/', meaning: '动物园', emoji: '🦁', topicId: 'en-4b-place', grade: 4, semester: '下册' },
  { word: 'school', phonetic: '/skuːl/', meaning: '学校', emoji: '🏫', topicId: 'en-4b-place', grade: 4, semester: '下册' },

  // ── en-4b-weather2: 天气与活动 ──
  { word: 'rainy', phonetic: '/ˈreɪni/', meaning: '下雨的', emoji: '🌧️', topicId: 'en-4b-weather2', grade: 4, semester: '下册' },
  { word: 'exercise', phonetic: '/ˈeksərsaɪz/', meaning: '锻炼', emoji: '🏋️', topicId: 'en-4b-weather2', grade: 4, semester: '下册' },
  { word: 'temperature', phonetic: '/ˈtemprətʃər/', meaning: '温度', emoji: '🌡️', topicId: 'en-4b-weather2', grade: 4, semester: '下册' },
  { word: 'windy', phonetic: '/ˈwɪndi/', meaning: '有风的', emoji: '💨', topicId: 'en-4b-weather2', grade: 4, semester: '下册' },
  { word: 'snowy', phonetic: '/ˈsnəʊi/', meaning: '下雪的', emoji: '🌨️', topicId: 'en-4b-weather2', grade: 4, semester: '下册' },
  { word: 'season', phonetic: '/ˈsiːzn/', meaning: '季节', emoji: '🌱', topicId: 'en-4b-weather2', grade: 4, semester: '下册' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// VOCABULARY DATABASE — Grade 5 (五年级)
// Abstract words: travel, emotions, nature, hobbies, days, months
// ═══════════════════════════════════════════════════════════════════════════════

const GRADE_5_VOCAB: VocabEntry[] = [
  // ── en-5a-day: 星期与月份 ──
  { word: 'Wednesday', phonetic: '/ˈwenzdeɪ/', meaning: '星期三', emoji: '📅', topicId: 'en-5a-day', grade: 5, semester: '上册' },
  { word: 'February', phonetic: '/ˈfebruəri/', meaning: '二月', emoji: '🗓️', topicId: 'en-5a-day', grade: 5, semester: '上册' },
  { word: 'Saturday', phonetic: '/ˈsætərdeɪ/', meaning: '星期六', emoji: '🎉', topicId: 'en-5a-day', grade: 5, semester: '上册' },
  { word: 'December', phonetic: '/dɪˈsembər/', meaning: '十二月', emoji: '🎄', topicId: 'en-5a-day', grade: 5, semester: '上册' },
  { word: 'Thursday', phonetic: '/ˈθɜːrzdeɪ/', meaning: '星期四', emoji: '📅', topicId: 'en-5a-day', grade: 5, semester: '上册' },
  { word: 'October', phonetic: '/ɒkˈtəʊbər/', meaning: '十月', emoji: '🎃', topicId: 'en-5a-day', grade: 5, semester: '上册' },
  { word: 'January', phonetic: '/ˈdʒænjuəri/', meaning: '一月', emoji: '🎊', topicId: 'en-5a-day', grade: 5, semester: '上册' },
  { word: 'Tuesday', phonetic: '/ˈtjuːzdeɪ/', meaning: '星期二', emoji: '📅', topicId: 'en-5a-day', grade: 5, semester: '上册' },
  { word: 'November', phonetic: '/nəʊˈvembər/', meaning: '十一月', emoji: '🍂', topicId: 'en-5a-day', grade: 5, semester: '上册' },
  { word: 'August', phonetic: '/ˈɔːɡəst/', meaning: '八月', emoji: '☀️', topicId: 'en-5a-day', grade: 5, semester: '上册' },

  // ── en-5a-hobby: 爱好与能力 ──
  { word: 'painting', phonetic: '/ˈpeɪntɪŋ/', meaning: '绘画', emoji: '🎨', topicId: 'en-5a-hobby', grade: 5, semester: '上册' },
  { word: 'swimming', phonetic: '/ˈswɪmɪŋ/', meaning: '游泳', emoji: '🏊', topicId: 'en-5a-hobby', grade: 5, semester: '上册' },
  { word: 'dancing', phonetic: '/ˈdænsɪŋ/', meaning: '跳舞', emoji: '💃', topicId: 'en-5a-hobby', grade: 5, semester: '上册' },
  { word: 'cooking', phonetic: '/ˈkʊkɪŋ/', meaning: '做饭', emoji: '👨‍🍳', topicId: 'en-5a-hobby', grade: 5, semester: '上册' },
  { word: 'reading', phonetic: '/ˈriːdɪŋ/', meaning: '阅读', emoji: '📖', topicId: 'en-5a-hobby', grade: 5, semester: '上册' },
  { word: 'singing', phonetic: '/ˈsɪŋɪŋ/', meaning: '唱歌', emoji: '🎤', topicId: 'en-5a-hobby', grade: 5, semester: '上册' },
  { word: 'running', phonetic: '/ˈrʌnɪŋ/', meaning: '跑步', emoji: '🏃', topicId: 'en-5a-hobby', grade: 5, semester: '上册' },
  { word: 'hiking', phonetic: '/ˈhaɪkɪŋ/', meaning: '远足', emoji: '🥾', topicId: 'en-5a-hobby', grade: 5, semester: '上册' },
  { word: 'collect', phonetic: '/kəˈlekt/', meaning: '收集', emoji: '📦', topicId: 'en-5a-hobby', grade: 5, semester: '上册' },

  // ── en-5a-nature: 自然与环保 ──
  { word: 'recycle', phonetic: '/riːˈsaɪkl/', meaning: '回收利用', emoji: '♻️', topicId: 'en-5a-nature', grade: 5, semester: '上册' },
  { word: 'pollution', phonetic: '/pəˈluːʃən/', meaning: '污染', emoji: '🏭', topicId: 'en-5a-nature', grade: 5, semester: '上册' },
  { word: 'protect', phonetic: '/prəˈtekt/', meaning: '保护', emoji: '🛡️', topicId: 'en-5a-nature', grade: 5, semester: '上册' },
  { word: 'forest', phonetic: '/ˈfɒrɪst/', meaning: '森林', emoji: '🌲', topicId: 'en-5a-nature', grade: 5, semester: '上册' },
  { word: 'environment', phonetic: '/ɪnˈvaɪrənmənt/', meaning: '环境', emoji: '🌍', topicId: 'en-5a-nature', grade: 5, semester: '上册' },
  { word: 'energy', phonetic: '/ˈenərdʒi/', meaning: '能源', emoji: '⚡', topicId: 'en-5a-nature', grade: 5, semester: '上册' },
  { word: 'plant', phonetic: '/plɑːnt/', meaning: '植物', emoji: '🌱', topicId: 'en-5a-nature', grade: 5, semester: '上册' },
  { word: 'earth', phonetic: '/ɜːrθ/', meaning: '地球', emoji: '🌍', topicId: 'en-5a-nature', grade: 5, semester: '上册' },
  { word: 'river', phonetic: '/ˈrɪvər/', meaning: '河流', emoji: '🏞️', topicId: 'en-5a-nature', grade: 5, semester: '上册' },

  // ── en-5b-travel: 旅行与交通 ──
  { word: 'passport', phonetic: '/ˈpɑːspɔːrt/', meaning: '护照', emoji: '📕', topicId: 'en-5b-travel', grade: 5, semester: '下册' },
  { word: 'journey', phonetic: '/ˈdʒɜːrni/', meaning: '旅程', emoji: '🗺️', topicId: 'en-5b-travel', grade: 5, semester: '下册' },
  { word: 'luggage', phonetic: '/ˈlʌɡɪdʒ/', meaning: '行李', emoji: '🧳', topicId: 'en-5b-travel', grade: 5, semester: '下册' },
  { word: 'subway', phonetic: '/ˈsʌbweɪ/', meaning: '地铁', emoji: '🚇', topicId: 'en-5b-travel', grade: 5, semester: '下册' },
  { word: 'airport', phonetic: '/ˈeəpɔːrt/', meaning: '机场', emoji: '✈️', topicId: 'en-5b-travel', grade: 5, semester: '下册' },
  { word: 'island', phonetic: '/ˈaɪlənd/', meaning: '岛屿', emoji: '🏝️', topicId: 'en-5b-travel', grade: 5, semester: '下册' },
  { word: 'mountain', phonetic: '/ˈmaʊntɪn/', meaning: '山', emoji: '⛰️', topicId: 'en-5b-travel', grade: 5, semester: '下册' },
  { word: 'beach', phonetic: '/biːtʃ/', meaning: '海滩', emoji: '🏖️', topicId: 'en-5b-travel', grade: 5, semester: '下册' },
  { word: 'train', phonetic: '/treɪn/', meaning: '火车', emoji: '🚂', topicId: 'en-5b-travel', grade: 5, semester: '下册' },
  { word: 'bicycle', phonetic: '/ˈbaɪsɪkl/', meaning: '自行车', emoji: '🚲', topicId: 'en-5b-travel', grade: 5, semester: '下册' },

  // ── en-5b-feeling: 情感与描述 ──
  { word: 'excited', phonetic: '/ɪkˈsaɪtɪd/', meaning: '激动的', emoji: '🤩', topicId: 'en-5b-feeling', grade: 5, semester: '下册' },
  { word: 'nervous', phonetic: '/ˈnɜːrvəs/', meaning: '紧张的', emoji: '😰', topicId: 'en-5b-feeling', grade: 5, semester: '下册' },
  { word: 'surprised', phonetic: '/sərˈpraɪzd/', meaning: '惊讶的', emoji: '😲', topicId: 'en-5b-feeling', grade: 5, semester: '下册' },
  { word: 'worried', phonetic: '/ˈwʌrid/', meaning: '担心的', emoji: '😟', topicId: 'en-5b-feeling', grade: 5, semester: '下册' },
  { word: 'proud', phonetic: '/praʊd/', meaning: '骄傲的', emoji: '🥹', topicId: 'en-5b-feeling', grade: 5, semester: '下册' },
  { word: 'disappointed', phonetic: '/ˌdɪsəˈpɔɪntɪd/', meaning: '失望的', emoji: '😞', topicId: 'en-5b-feeling', grade: 5, semester: '下册' },
  { word: 'happy', phonetic: '/ˈhæpi/', meaning: '开心的', emoji: '😊', topicId: 'en-5b-feeling', grade: 5, semester: '下册' },
  { word: 'angry', phonetic: '/ˈæŋɡri/', meaning: '生气的', emoji: '😠', topicId: 'en-5b-feeling', grade: 5, semester: '下册' },
  { word: 'afraid', phonetic: '/əˈfreɪd/', meaning: '害怕的', emoji: '😨', topicId: 'en-5b-feeling', grade: 5, semester: '下册' },
  { word: 'lonely', phonetic: '/ˈləʊnli/', meaning: '孤独的', emoji: '😔', topicId: 'en-5b-feeling', grade: 5, semester: '下册' },

  // ── en-5b-house: 家居与房间 ──
  { word: 'kitchen', phonetic: '/ˈkɪtʃɪn/', meaning: '厨房', emoji: '🍳', topicId: 'en-5b-house', grade: 5, semester: '下册' },
  { word: 'bathroom', phonetic: '/ˈbɑːθruːm/', meaning: '浴室', emoji: '🛁', topicId: 'en-5b-house', grade: 5, semester: '下册' },
  { word: 'bedroom', phonetic: '/ˈbedruːm/', meaning: '卧室', emoji: '🛏️', topicId: 'en-5b-house', grade: 5, semester: '下册' },
  { word: 'curtain', phonetic: '/ˈkɜːrtn/', meaning: '窗帘', emoji: '🪟', topicId: 'en-5b-house', grade: 5, semester: '下册' },
  { word: 'mirror', phonetic: '/ˈmɪrər/', meaning: '镜子', emoji: '🪞', topicId: 'en-5b-house', grade: 5, semester: '下册' },
  { word: 'sofa', phonetic: '/ˈsəʊfə/', meaning: '沙发', emoji: '🛋️', topicId: 'en-5b-house', grade: 5, semester: '下册' },
  { word: 'fridge', phonetic: '/frɪdʒ/', meaning: '冰箱', emoji: '🧊', topicId: 'en-5b-house', grade: 5, semester: '下册' },
  { word: 'lamp', phonetic: '/læmp/', meaning: '台灯', emoji: '💡', topicId: 'en-5b-house', grade: 5, semester: '下册' },
  { word: 'toilet', phonetic: '/ˈtɔɪlɪt/', meaning: '马桶', emoji: '🚽', topicId: 'en-5b-house', grade: 5, semester: '下册' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// VOCABULARY DATABASE — Grade 6 (六年级)
// Advanced vocabulary: school life, dreams, grammar, culture, stories
// ═══════════════════════════════════════════════════════════════════════════════

const GRADE_6_VOCAB: VocabEntry[] = [
  // ── en-6a-school: 学校生活 ──
  { word: 'science', phonetic: '/ˈsaɪəns/', meaning: '科学', emoji: '🔬', topicId: 'en-6a-school', grade: 6, semester: '上册' },
  { word: 'geography', phonetic: '/dʒiˈɒɡrəfi/', meaning: '地理', emoji: '🗺️', topicId: 'en-6a-school', grade: 6, semester: '上册' },
  { word: 'history', phonetic: '/ˈhɪstəri/', meaning: '历史', emoji: '📜', topicId: 'en-6a-school', grade: 6, semester: '上册' },
  { word: 'subject', phonetic: '/ˈsʌbdʒekt/', meaning: '科目', emoji: '📖', topicId: 'en-6a-school', grade: 6, semester: '上册' },
  { word: 'difficult', phonetic: '/ˈdɪfɪkəlt/', meaning: '困难的', emoji: '🧩', topicId: 'en-6a-school', grade: 6, semester: '上册' },
  { word: 'interesting', phonetic: '/ˈɪntrəstɪŋ/', meaning: '有趣的', emoji: '🤩', topicId: 'en-6a-school', grade: 6, semester: '上册' },
  { word: 'easy', phonetic: '/ˈiːzi/', meaning: '容易的', emoji: '✅', topicId: 'en-6a-school', grade: 6, semester: '上册' },
  { word: 'favorite', phonetic: '/ˈfeɪvərɪt/', meaning: '最喜欢的', emoji: '❤️', topicId: 'en-6a-school', grade: 6, semester: '上册' },
  { word: 'exam', phonetic: '/ɪɡˈzæm/', meaning: '考试', emoji: '📝', topicId: 'en-6a-school', grade: 6, semester: '上册' },
  { word: 'practice', phonetic: '/ˈpræktɪs/', meaning: '练习', emoji: '📝', topicId: 'en-6a-school', grade: 6, semester: '上册' },

  // ── en-6a-future: 梦想与未来 ──
  { word: 'scientist', phonetic: '/ˈsaɪəntɪst/', meaning: '科学家', emoji: '🔬', topicId: 'en-6a-future', grade: 6, semester: '上册' },
  { word: 'pilot', phonetic: '/ˈpaɪlət/', meaning: '飞行员', emoji: '✈️', topicId: 'en-6a-future', grade: 6, semester: '上册' },
  { word: 'engineer', phonetic: '/ˌendʒɪˈnɪər/', meaning: '工程师', emoji: '👷', topicId: 'en-6a-future', grade: 6, semester: '上册' },
  { word: 'reporter', phonetic: '/rɪˈpɔːrtər/', meaning: '记者', emoji: '📺', topicId: 'en-6a-future', grade: 6, semester: '上册' },
  { word: 'nurse', phonetic: '/nɜːrs/', meaning: '护士', emoji: '👩‍⚕️', topicId: 'en-6a-future', grade: 6, semester: '上册' },
  { word: 'doctor', phonetic: '/ˈdɒktər/', meaning: '医生', emoji: '👨‍⚕️', topicId: 'en-6a-future', grade: 6, semester: '上册' },
  { word: 'driver', phonetic: '/ˈdraɪvər/', meaning: '司机', emoji: '🚗', topicId: 'en-6a-future', grade: 6, semester: '上册' },
  { word: 'artist', phonetic: '/ˈɑːrtɪst/', meaning: '艺术家', emoji: '🎨', topicId: 'en-6a-future', grade: 6, semester: '上册' },
  { word: 'musician', phonetic: '/mjuːˈzɪʃn/', meaning: '音乐家', emoji: '🎵', topicId: 'en-6a-future', grade: 6, semester: '上册' },
  { word: 'writer', phonetic: '/ˈraɪtər/', meaning: '作家', emoji: '✍️', topicId: 'en-6a-future', grade: 6, semester: '上册' },

  // ── en-6a-verb: 动词与时态 ──
  { word: 'climbed', phonetic: '/klaɪmd/', meaning: '爬（过去式）', emoji: '🧗', topicId: 'en-6a-verb', grade: 6, semester: '上册' },
  { word: 'running', phonetic: '/ˈrʌnɪŋ/', meaning: '跑步（进行时）', emoji: '🏃', topicId: 'en-6a-verb', grade: 6, semester: '上册' },
  { word: 'thought', phonetic: '/θɔːt/', meaning: '想（过去式）', emoji: '💭', topicId: 'en-6a-verb', grade: 6, semester: '上册' },
  { word: 'wrote', phonetic: '/rəʊt/', meaning: '写（过去式）', emoji: '✍️', topicId: 'en-6a-verb', grade: 6, semester: '上册' },
  { word: 'drank', phonetic: '/dræŋk/', meaning: '喝（过去式）', emoji: '🥤', topicId: 'en-6a-verb', grade: 6, semester: '上册' },
  { word: 'slept', phonetic: '/slept/', meaning: '睡觉（过去式）', emoji: '😴', topicId: 'en-6a-verb', grade: 6, semester: '上册' },
  { word: 'caught', phonetic: '/kɔːt/', meaning: '抓住（过去式）', emoji: '🤏', topicId: 'en-6a-verb', grade: 6, semester: '上册' },
  { word: 'studying', phonetic: '/ˈstʌdiɪŋ/', meaning: '学习（进行时）', emoji: '📚', topicId: 'en-6a-verb', grade: 6, semester: '上册' },
  { word: 'making', phonetic: '/ˈmeɪkɪŋ/', meaning: '制作（进行时）', emoji: '🔨', topicId: 'en-6a-verb', grade: 6, semester: '上册' },
  { word: 'reading', phonetic: '/ˈriːdɪŋ/', meaning: '阅读（进行时）', emoji: '📖', topicId: 'en-6a-verb', grade: 6, semester: '上册' },

  // ── en-6b-country: 国家与文化 ──
  { word: 'culture', phonetic: '/ˈkʌltʃər/', meaning: '文化', emoji: '🎭', topicId: 'en-6b-country', grade: 6, semester: '下册' },
  { word: 'tradition', phonetic: '/trəˈdɪʃən/', meaning: '传统', emoji: '🏮', topicId: 'en-6b-country', grade: 6, semester: '下册' },
  { word: 'celebrate', phonetic: '/ˈselɪbreɪt/', meaning: '庆祝', emoji: '🎊', topicId: 'en-6b-country', grade: 6, semester: '下册' },
  { word: 'festival', phonetic: '/ˈfestɪvl/', meaning: '节日', emoji: '🪅', topicId: 'en-6b-country', grade: 6, semester: '下册' },
  { word: 'country', phonetic: '/ˈkʌntri/', meaning: '国家', emoji: '🌏', topicId: 'en-6b-country', grade: 6, semester: '下册' },
  { word: 'China', phonetic: '/ˈtʃaɪnə/', meaning: '中国', emoji: '🇨🇳', topicId: 'en-6b-country', grade: 6, semester: '下册' },
  { word: 'Christmas', phonetic: '/ˈkrɪsməs/', meaning: '圣诞节', emoji: '🎄', topicId: 'en-6b-country', grade: 6, semester: '下册' },
  { word: 'international', phonetic: '/ˌɪntərˈnæʃənl/', meaning: '国际的', emoji: '🌍', topicId: 'en-6b-country', grade: 6, semester: '下册' },
  { word: 'popular', phonetic: '/ˈpɒpjələr/', meaning: '受欢迎的', emoji: '⭐', topicId: 'en-6b-country', grade: 6, semester: '下册' },

  // ── en-6b-story: 故事与阅读 ──
  { word: 'character', phonetic: '/ˈkærəktər/', meaning: '角色/人物', emoji: '🧑‍🤝‍🧑', topicId: 'en-6b-story', grade: 6, semester: '下册' },
  { word: 'adventure', phonetic: '/ədˈventʃər/', meaning: '冒险', emoji: '🗺️', topicId: 'en-6b-story', grade: 6, semester: '下册' },
  { word: 'excellent', phonetic: '/ˈeksələnt/', meaning: '优秀的', emoji: '🌟', topicId: 'en-6b-story', grade: 6, semester: '下册' },
  { word: 'imagine', phonetic: '/ɪˈmædʒɪn/', meaning: '想象', emoji: '💭', topicId: 'en-6b-story', grade: 6, semester: '下册' },
  { word: 'describe', phonetic: '/dɪˈskraɪb/', meaning: '描述', emoji: '📝', topicId: 'en-6b-story', grade: 6, semester: '下册' },
  { word: 'hero', phonetic: '/ˈhɪərəʊ/', meaning: '英雄', emoji: '🦸', topicId: 'en-6b-story', grade: 6, semester: '下册' },
  { word: 'story', phonetic: '/ˈstɔːri/', meaning: '故事', emoji: '📖', topicId: 'en-6b-story', grade: 6, semester: '下册' },
  { word: 'wonderful', phonetic: '/ˈwʌndərfl/', meaning: '精彩的', emoji: '✨', topicId: 'en-6b-story', grade: 6, semester: '下册' },
  { word: 'mystery', phonetic: '/ˈmɪstəri/', meaning: '神秘', emoji: '🔮', topicId: 'en-6b-story', grade: 6, semester: '下册' },

  // ── en-6b-review: 总复习 ──
  { word: 'necessary', phonetic: '/ˈnesəsəri/', meaning: '必要的', emoji: '✅', topicId: 'en-6b-review', grade: 6, semester: '下册' },
  { word: 'knowledge', phonetic: '/ˈnɒlɪdʒ/', meaning: '知识', emoji: '📚', topicId: 'en-6b-review', grade: 6, semester: '下册' },
  { word: 'communicate', phonetic: '/kəˈmjuːnɪkeɪt/', meaning: '交流', emoji: '💬', topicId: 'en-6b-review', grade: 6, semester: '下册' },
  { word: 'independent', phonetic: '/ˌɪndɪˈpendənt/', meaning: '独立的', emoji: '🦅', topicId: 'en-6b-review', grade: 6, semester: '下册' },
  { word: 'important', phonetic: '/ɪmˈpɔːrtənt/', meaning: '重要的', emoji: '⭐', topicId: 'en-6b-review', grade: 6, semester: '下册' },
  { word: 'different', phonetic: '/ˈdɪfrənt/', meaning: '不同的', emoji: '🔄', topicId: 'en-6b-review', grade: 6, semester: '下册' },
  { word: 'beautiful', phonetic: '/ˈbjuːtɪfl/', meaning: '美丽的', emoji: '🌺', topicId: 'en-6b-review', grade: 6, semester: '下册' },
  { word: 'delicious', phonetic: '/dɪˈlɪʃəs/', meaning: '美味的', emoji: '😋', topicId: 'en-6b-review', grade: 6, semester: '下册' },
  { word: 'successful', phonetic: '/səkˈsesfl/', meaning: '成功的', emoji: '🏆', topicId: 'en-6b-review', grade: 6, semester: '下册' },
  { word: 'improve', phonetic: '/ɪmˈpruːv/', meaning: '提高', emoji: '📈', topicId: 'en-6b-review', grade: 6, semester: '下册' },
  { word: 'achieve', phonetic: '/əˈtʃiːv/', meaning: '实现', emoji: '🏆', topicId: 'en-6b-review', grade: 6, semester: '下册' },
];

// ─── Vocabulary Index ────────────────────────────────────────────────────────

/** All vocabulary entries indexed by grade */
const VOCAB_BY_GRADE: Record<Grade, VocabEntry[]> = {
  1: GRADE_1_VOCAB,
  2: GRADE_2_VOCAB,
  3: GRADE_3_VOCAB,
  4: GRADE_4_VOCAB,
  5: GRADE_5_VOCAB,
  6: GRADE_6_VOCAB,
};

/** All vocabulary entries flattened into a single array */
const ALL_VOCAB: VocabEntry[] = [
  ...GRADE_1_VOCAB,
  ...GRADE_2_VOCAB,
  ...GRADE_3_VOCAB,
  ...GRADE_4_VOCAB,
  ...GRADE_5_VOCAB,
  ...GRADE_6_VOCAB,
];

// ─── Utility Functions ───────────────────────────────────────────────────────

let questionIdCounter = 0;

/**
 * Generate a unique question ID.
 */
function generateId(): string {
  return `enq-${Date.now()}-${++questionIdCounter}`;
}

/**
 * Fisher-Yates shuffle (in-place on a copy).
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Pick a random element from an array.
 */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Pick N distractor values from a pool, excluding a correct answer.
 *
 * @param correct - The correct answer to exclude.
 * @param pool - The pool of possible distractor values.
 * @param count - Number of distractors to pick (default 3).
 */
function pickDistractors(correct: string, pool: string[], count: number = 3): string[] {
  const filtered = pool.filter((item) => item !== correct);
  return shuffle(filtered).slice(0, count);
}

/**
 * Build 4 shuffled options: correct + 3 distractors.
 * Returns { options, correctIndex }.
 */
function buildOptions(correct: string, distractorPool: string[]): {
  options: string[];
  correctIndex: number;
} {
  const distractors = pickDistractors(correct, distractorPool, 3);
  const options = shuffle([correct, ...distractors]);
  return {
    options,
    correctIndex: options.indexOf(correct),
  };
}

/**
 * Filter vocabulary by grade, semester, and optionally topic.
 */
function filterVocab(
  grade: Grade,
  semester: Semester,
  topicId?: string,
): VocabEntry[] {
  return VOCAB_BY_GRADE[grade].filter(
    (v) => v.semester === semester && (!topicId || v.topicId === topicId),
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUESTION GENERATORS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a **word-picture** question: child sees an English word
 * and must select the correct Chinese meaning.
 *
 * Prompt format: the English word (e.g. "apple")
 * Options: 4 Chinese meanings
 */
function generateWordPicture(
  entry: VocabEntry,
  distractorPool: string[],
): EnglishQuestion {
  const { options, correctIndex } = buildOptions(entry.meaning, distractorPool);
  return {
    id: generateId(),
    subject: 'english',
    grade: entry.grade,
    semester: entry.semester,
    topicId: entry.topicId,
    prompt: entry.word,
    correctAnswer: entry.meaning,
    mode: 'word-picture',
    options,
    correctIndex,
    emojiHint: entry.emoji,
    phonetic: entry.phonetic,
  };
}

/**
 * Generate a **picture-word** question: child sees Chinese meaning + emoji
 * and must select the correct English word.
 *
 * Prompt format: "🍎 苹果"
 * Options: 4 English words
 */
function generatePictureWord(
  entry: VocabEntry,
  distractorPool: string[],
): EnglishQuestion {
  const { options, correctIndex } = buildOptions(entry.word, distractorPool);
  return {
    id: generateId(),
    subject: 'english',
    grade: entry.grade,
    semester: entry.semester,
    topicId: entry.topicId,
    prompt: `${entry.emoji} ${entry.meaning}`,
    correctAnswer: entry.word,
    mode: 'picture-word',
    options,
    correctIndex,
    emojiHint: entry.emoji,
    phonetic: entry.phonetic,
  };
}

/**
 * Generate a **listening** question: child hears the word via TTS
 * and must select the correct English word.
 *
 * Prompt format: the word to be spoken via TTS (same word appears as prompt)
 * Options: 4 English words
 *
 * The consumer should use the prompt text as the TTS input and hide
 * the prompt visually, showing only the audio playback button.
 */
function generateListening(
  entry: VocabEntry,
  distractorPool: string[],
): EnglishQuestion {
  const { options, correctIndex } = buildOptions(entry.word, distractorPool);
  return {
    id: generateId(),
    subject: 'english',
    grade: entry.grade,
    semester: entry.semester,
    topicId: entry.topicId,
    prompt: entry.word, // Will be spoken via TTS
    correctAnswer: entry.word,
    mode: 'listening',
    options,
    correctIndex,
    emojiHint: entry.emoji,
    phonetic: entry.phonetic,
  };
}

/**
 * Generate a **spelling** question: child sees Chinese meaning + phonetic
 * and must select the correct English spelling.
 *
 * Prompt format: "🍎 苹果 (/ˈæpl/)"
 * Options: 4 English words (including plausible misspellings as distractors)
 */
function generateSpelling(
  entry: VocabEntry,
  distractorPool: string[],
): EnglishQuestion {
  const { options, correctIndex } = buildOptions(entry.word, distractorPool);
  return {
    id: generateId(),
    subject: 'english',
    grade: entry.grade,
    semester: entry.semester,
    topicId: entry.topicId,
    prompt: `${entry.emoji} ${entry.meaning} (${entry.phonetic})`,
    correctAnswer: entry.word,
    mode: 'spelling',
    options,
    correctIndex,
    emojiHint: entry.emoji,
    phonetic: entry.phonetic,
  };
}

// ─── Generator Registry ─────────────────────────────────────────────────────

/**
 * Map from mode to its generator function.
 */
const GENERATORS: Record<
  EnglishMode,
  (entry: VocabEntry, distractorPool: string[]) => EnglishQuestion
> = {
  'word-picture': generateWordPicture,
  'picture-word': generatePictureWord,
  listening: generateListening,
  spelling: generateSpelling,
};

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate questions for a specific mode, grade, semester, and topic.
 *
 * @param mode     - The practice mode (word-picture, picture-word, listening, spelling).
 * @param grade    - Target grade (1-6).
 * @param semester - Target semester (上册 or 下册).
 * @param count    - Number of questions to generate.
 * @param topicId  - Optional: restrict to a specific topic.
 * @param excludeIds - Optional: question IDs to avoid repeating.
 */
export function generateModeQuestions(
  mode: EnglishMode,
  grade: Grade,
  semester: Semester,
  count: number,
  topicId?: string,
  excludeIds?: string[],
): EnglishQuestion[] {
  const pool = filterVocab(grade, semester, topicId);
  if (pool.length === 0) return [];

  const allMeanings = ALL_VOCAB.map((v) => v.meaning);
  const allWords = ALL_VOCAB.map((v) => v.word);

  const generator = GENERATORS[mode];
  const questions: EnglishQuestion[] = [];
  const usedIds = new Set(excludeIds ?? []);
  let attempts = 0;
  const maxAttempts = count * 5; // Prevent infinite loop

  while (questions.length < count && attempts < maxAttempts) {
    attempts++;
    const entry = pickRandom(pool);

    // Determine distractor pool based on mode
    const distractorPool =
      mode === 'word-picture' ? allMeanings : allWords;

    const q = generator(entry, distractorPool);

    if (!usedIds.has(q.id)) {
      usedIds.add(q.id);
      questions.push(q);
    }
  }

  return questions;
}

/**
 * Generate mixed-mode questions for a specific grade + semester + topic.
 * Distributes questions evenly across all four modes.
 */
export function generateMixedModeQuestions(
  grade: Grade,
  semester: Semester,
  count: number,
  topicId?: string,
  excludeIds?: string[],
): EnglishQuestion[] {
  const modes: EnglishMode[] = ['word-picture', 'picture-word', 'listening', 'spelling'];
  const questions: EnglishQuestion[] = [];
  const ids = new Set(excludeIds ?? []);

  for (let i = 0; i < count; i++) {
    const mode = modes[i % modes.length];
    const batch = generateModeQuestions(mode, grade, semester, 1, topicId, Array.from(ids));
    if (batch.length > 0) {
      ids.add(batch[0].id);
      questions.push(batch[0]);
    }
  }

  return shuffle(questions);
}

/**
 * Get the full vocabulary database (all grades).
 * Useful for external consumers that need direct access to vocab entries.
 */
export function getVocabularyDatabase(): VocabEntry[] {
  return ALL_VOCAB;
}

/**
 * Get vocabulary for a specific grade.
 */
export function getVocabByGrade(grade: Grade): VocabEntry[] {
  return VOCAB_BY_GRADE[grade];
}

/**
 * Get vocabulary filtered by grade, semester, and optionally topic.
 */
export function getFilteredVocab(
  grade: Grade,
  semester: Semester,
  topicId?: string,
): VocabEntry[] {
  return filterVocab(grade, semester, topicId);
}

/**
 * Get total vocabulary count per grade.
 */
export function getVocabStats(): Record<Grade, number> {
  const stats: Record<Grade, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const grade of [1, 2, 3, 4, 5, 6] as Grade[]) {
    stats[grade] = VOCAB_BY_GRADE[grade].length;
  }
  return stats;
}
