// ─── Unified Curriculum Configuration ─────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for grade/semester/topic selection across all subjects.
// Based on 人教版 (PEP) curriculum standards for Chinese primary education.
// This file only defines WHAT is available — it does NOT generate questions.

export type Subject = 'math' | 'chinese' | 'english';
export type Grade = 1 | 2 | 3 | 4 | 5 | 6;
export type Semester = '上册' | '下册';

export interface TopicInfo {
  id: string;
  name: string;
  description: string;
  emoji: string;
  mode: string; // The mode key used to start a session
  subject: Subject;
  grade: Grade;
  semester: Semester;
}

export interface SemesterInfo {
  semester: Semester;
  topics: TopicInfo[];
}

export interface GradeInfo {
  grade: Grade;
  label: string;      // "一年级"
  emoji: string;       // grade-appropriate emoji
  semesters: SemesterInfo[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// Grade metadata
// ═══════════════════════════════════════════════════════════════════════════════

export const GRADE_EMOJIS: Record<Grade, string> = {
  1: '🌱',
  2: '🌿',
  3: '🌳',
  4: '🏔️',
  5: '⭐',
  6: '🎓',
};

export const GRADE_LABELS: Record<Grade, string> = {
  1: '一年级',
  2: '二年级',
  3: '三年级',
  4: '四年级',
  5: '五年级',
  6: '六年级',
};

export const SUBJECT_LABELS: Record<Subject, string> = {
  math: '数学',
  chinese: '语文',
  english: '英语',
};

export const SUBJECT_EMOJIS: Record<Subject, string> = {
  math: '🔢',
  chinese: '📝',
  english: '🔤',
};

// ═══════════════════════════════════════════════════════════════════════════════
// Math Topics (数学) — 人教版 PEP curriculum
// ═══════════════════════════════════════════════════════════════════════════════

const MATH_TOPICS: TopicInfo[] = [
  // ── Grade 1 ──
  {
    id: 'math-1a-count',
    name: '10以内的认识',
    description: '认识1-10各数，理解数的意义和顺序',
    emoji: '🔢',
    mode: 'free',
    subject: 'math',
    grade: 1,
    semester: '上册',
  },
  {
    id: 'math-1a-add10',
    name: '10以内加减法',
    description: '10以内的加法和减法，凑十法',
    emoji: '➕',
    mode: 'free',
    subject: 'math',
    grade: 1,
    semester: '上册',
  },
  {
    id: 'math-1a-shape',
    name: '认识图形',
    description: '认识长方体、正方体、圆柱和球',
    emoji: '🔷',
    mode: 'free',
    subject: 'math',
    grade: 1,
    semester: '上册',
  },
  {
    id: 'math-1b-count20',
    name: '20以内的认识',
    description: '认识11-20各数，理解数位',
    emoji: '🔢',
    mode: 'free',
    subject: 'math',
    grade: 1,
    semester: '下册',
  },
  {
    id: 'math-1b-add20',
    name: '20以内进退位加减法',
    description: '20以内进位加法和退位减法',
    emoji: '➕',
    mode: 'free',
    subject: 'math',
    grade: 1,
    semester: '下册',
  },
  {
    id: 'math-1b-classify',
    name: '分类与整理',
    description: '简单的分类和统计',
    emoji: '📊',
    mode: 'free',
    subject: 'math',
    grade: 1,
    semester: '下册',
  },

  // ── Grade 2 ──
  {
    id: 'math-2a-length',
    name: '长度单位',
    description: '厘米和米的认识与换算',
    emoji: '📏',
    mode: 'free',
    subject: 'math',
    grade: 2,
    semester: '上册',
  },
  {
    id: 'math-2a-add100',
    name: '100以内加减法',
    description: '100以内的加法和减法笔算',
    emoji: '➕',
    mode: 'free',
    subject: 'math',
    grade: 2,
    semester: '上册',
  },
  {
    id: 'math-2a-angle',
    name: '角的初步认识',
    description: '认识直角、锐角和钝角',
    emoji: '📐',
    mode: 'free',
    subject: 'math',
    grade: 2,
    semester: '上册',
  },
  {
    id: 'math-2a-mul9',
    name: '表内乘法',
    description: '1-9的乘法口诀和乘法应用',
    emoji: '✖️',
    mode: 'free',
    subject: 'math',
    grade: 2,
    semester: '上册',
  },
  {
    id: 'math-2b-div9',
    name: '表内除法',
    description: '用乘法口诀求商',
    emoji: '➗',
    mode: 'free',
    subject: 'math',
    grade: 2,
    semester: '下册',
  },
  {
    id: 'math-2b-mix',
    name: '混合运算',
    description: '加减乘除混合运算及运算顺序',
    emoji: '🔀',
    mode: 'free',
    subject: 'math',
    grade: 2,
    semester: '下册',
  },
  {
    id: 'math-2b-weight',
    name: '克和千克',
    description: '质量单位的认识和使用',
    emoji: '⚖️',
    mode: 'free',
    subject: 'math',
    grade: 2,
    semester: '下册',
  },

  // ── Grade 3 ──
  {
    id: 'math-3a-time',
    name: '时、分、秒',
    description: '时间单位的认识和换算',
    emoji: '⏰',
    mode: 'free',
    subject: 'math',
    grade: 3,
    semester: '上册',
  },
  {
    id: 'math-3a-add10000',
    name: '万以内加减法',
    description: '万以内的加法和减法',
    emoji: '🔢',
    mode: 'free',
    subject: 'math',
    grade: 3,
    semester: '上册',
  },
  {
    id: 'math-3a-mul1',
    name: '多位数乘一位数',
    description: '两三位数乘一位数的笔算',
    emoji: '✖️',
    mode: 'free',
    subject: 'math',
    grade: 3,
    semester: '上册',
  },
  {
    id: 'math-3a-rect',
    name: '长方形和正方形',
    description: '四边形的特征和周长计算',
    emoji: '📐',
    mode: 'free',
    subject: 'math',
    grade: 3,
    semester: '上册',
  },
  {
    id: 'math-3b-div1',
    name: '除数是一位数的除法',
    description: '两三位数除以一位数',
    emoji: '➗',
    mode: 'free',
    subject: 'math',
    grade: 3,
    semester: '下册',
  },
  {
    id: 'math-3b-mul2',
    name: '两位数乘两位数',
    description: '两位数乘两位数的笔算',
    emoji: '✖️',
    mode: 'free',
    subject: 'math',
    grade: 3,
    semester: '下册',
  },
  {
    id: 'math-3b-frac',
    name: '分数的初步认识',
    description: '认识几分之一和几分之几',
    emoji: '🍕',
    mode: 'free',
    subject: 'math',
    grade: 3,
    semester: '下册',
  },
  {
    id: 'math-3b-area',
    name: '面积',
    description: '面积的意义和计算',
    emoji: '📏',
    mode: 'free',
    subject: 'math',
    grade: 3,
    semester: '下册',
  },

  // ── Grade 4 ──
  {
    id: 'math-4a-large',
    name: '大数的认识',
    description: '亿以内及亿以上数的认识和运算',
    emoji: '🔢',
    mode: 'free',
    subject: 'math',
    grade: 4,
    semester: '上册',
  },
  {
    id: 'math-4a-angle2',
    name: '角的度量',
    description: '线段、直线、射线和角的分类',
    emoji: '📐',
    mode: 'free',
    subject: 'math',
    grade: 4,
    semester: '上册',
  },
  {
    id: 'math-4a-mul2',
    name: '三位数乘两位数',
    description: '三位数乘两位数的笔算',
    emoji: '✖️',
    mode: 'free',
    subject: 'math',
    grade: 4,
    semester: '上册',
  },
  {
    id: 'math-4a-div2',
    name: '除数是两位数的除法',
    description: '三位数除以两位数的笔算',
    emoji: '➗',
    mode: 'free',
    subject: 'math',
    grade: 4,
    semester: '上册',
  },
  {
    id: 'math-4b-order',
    name: '四则运算',
    description: '含括号的四则混合运算顺序',
    emoji: '🔀',
    mode: 'free',
    subject: 'math',
    grade: 4,
    semester: '下册',
  },
  {
    id: 'math-4b-decimal',
    name: '小数的意义和性质',
    description: '小数的意义、读写和大小比较',
    emoji: '🔵',
    mode: 'free',
    subject: 'math',
    grade: 4,
    semester: '下册',
  },
  {
    id: 'math-4b-decimal-add',
    name: '小数的加减法',
    description: '小数加减法的笔算',
    emoji: '➕',
    mode: 'free',
    subject: 'math',
    grade: 4,
    semester: '下册',
  },
  {
    id: 'math-4b-triangle',
    name: '三角形',
    description: '三角形的分类、内角和',
    emoji: '🔺',
    mode: 'free',
    subject: 'math',
    grade: 4,
    semester: '下册',
  },

  // ── Grade 5 ──
  {
    id: 'math-5a-decimal-mul',
    name: '小数乘法',
    description: '小数乘整数和小数乘小数',
    emoji: '✖️',
    mode: 'free',
    subject: 'math',
    grade: 5,
    semester: '上册',
  },
  {
    id: 'math-5a-decimal-div',
    name: '小数除法',
    description: '小数除以整数和整数除以小数',
    emoji: '➗',
    mode: 'free',
    subject: 'math',
    grade: 5,
    semester: '上册',
  },
  {
    id: 'math-5a-equation',
    name: '简易方程',
    description: '用字母表示数和解简易方程',
    emoji: '⚖️',
    mode: 'free',
    subject: 'math',
    grade: 5,
    semester: '上册',
  },
  {
    id: 'math-5a-polygon',
    name: '多边形的面积',
    description: '平行四边形、三角形和梯形面积',
    emoji: '📐',
    mode: 'free',
    subject: 'math',
    grade: 5,
    semester: '上册',
  },
  {
    id: 'math-5b-observation',
    name: '观察物体',
    description: '从不同方向观察物体和立体图形',
    emoji: '👁️',
    mode: 'free',
    subject: 'math',
    grade: 5,
    semester: '下册',
  },
  {
    id: 'math-5b-frac-meaning',
    name: '分数的意义和性质',
    description: '分数的意义、真分数和假分数',
    emoji: '🍕',
    mode: 'free',
    subject: 'math',
    grade: 5,
    semester: '下册',
  },
  {
    id: 'math-5b-frac-add',
    name: '分数的加法和减法',
    description: '同分母和异分母分数加减法',
    emoji: '➕',
    mode: 'free',
    subject: 'math',
    grade: 5,
    semester: '下册',
  },
  {
    id: 'math-5b-stats',
    name: '统计与概率',
    description: '折线统计图和可能性的认识',
    emoji: '📊',
    mode: 'free',
    subject: 'math',
    grade: 5,
    semester: '下册',
  },

  // ── Grade 6 ──
  {
    id: 'math-6a-frac-mul',
    name: '分数乘法',
    description: '分数乘整数和分数乘分数',
    emoji: '✖️',
    mode: 'free',
    subject: 'math',
    grade: 6,
    semester: '上册',
  },
  {
    id: 'math-6a-frac-div',
    name: '分数除法',
    description: '分数除以整数和整数除以分数',
    emoji: '➗',
    mode: 'free',
    subject: 'math',
    grade: 6,
    semester: '上册',
  },
  {
    id: 'math-6a-percent',
    name: '百分数',
    description: '百分数的意义、应用和转化',
    emoji: '💯',
    mode: 'free',
    subject: 'math',
    grade: 6,
    semester: '上册',
  },
  {
    id: 'math-6a-circle',
    name: '圆',
    description: '圆的认识、周长和面积',
    emoji: '⭕',
    mode: 'free',
    subject: 'math',
    grade: 6,
    semester: '上册',
  },
  {
    id: 'math-6b-negative',
    name: '负数',
    description: '认识正负数及其应用',
    emoji: '🌡️',
    mode: 'free',
    subject: 'math',
    grade: 6,
    semester: '下册',
  },
  {
    id: 'math-6b-ratio',
    name: '比例',
    description: '比例的意义、基本性质和正反比例',
    emoji: '⚖️',
    mode: 'free',
    subject: 'math',
    grade: 6,
    semester: '下册',
  },
  {
    id: 'math-6b-cylinder',
    name: '圆柱与圆锥',
    description: '圆柱和圆锥的表面积和体积',
    emoji: '🥫',
    mode: 'free',
    subject: 'math',
    grade: 6,
    semester: '下册',
  },
  {
    id: 'math-6b-stats2',
    name: '综合统计',
    description: '扇形统计图和综合统计应用',
    emoji: '📊',
    mode: 'free',
    subject: 'math',
    grade: 6,
    semester: '下册',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Chinese Topics (语文) — 人教版语文教材
// ═══════════════════════════════════════════════════════════════════════════════

const CHINESE_TOPICS: TopicInfo[] = [
  // ── Grade 1 — 识字拼音 ──
  {
    id: 'cn-1a-pinyin',
    name: '拼音入门',
    description: '声母、韵母和整体认读音节',
    emoji: '📝',
    mode: 'recognize-pinyin',
    subject: 'chinese',
    grade: 1,
    semester: '上册',
  },
  {
    id: 'cn-1a-char',
    name: '识字天地',
    description: '认识基本汉字，笔画和笔顺',
    emoji: '🔤',
    mode: 'recognize-char',
    subject: 'chinese',
    grade: 1,
    semester: '上册',
  },
  {
    id: 'cn-1a-radical',
    name: '偏旁部首',
    description: '认识常见偏旁部首',
    emoji: '🧩',
    mode: 'recognize-char',
    subject: 'chinese',
    grade: 1,
    semester: '上册',
  },
  {
    id: 'cn-1b-word',
    name: '词语启蒙',
    description: '常见词语的学习和运用',
    emoji: '🧩',
    mode: 'word-match',
    subject: 'chinese',
    grade: 1,
    semester: '下册',
  },
  {
    id: 'cn-1b-dictation',
    name: '听写练习',
    description: '听发音写汉字',
    emoji: '👂',
    mode: 'dictation',
    subject: 'chinese',
    grade: 1,
    semester: '下册',
  },
  {
    id: 'cn-1b-stroke',
    name: '笔顺练习',
    description: '汉字笔顺和基本笔画',
    emoji: '✍️',
    mode: 'recognize-char',
    subject: 'chinese',
    grade: 1,
    semester: '下册',
  },

  // ── Grade 2 — 扩展词汇 ──
  {
    id: 'cn-2a-char2',
    name: '汉字进阶',
    description: '认识更多常用汉字，形近字区分',
    emoji: '🔤',
    mode: 'recognize-char',
    subject: 'chinese',
    grade: 2,
    semester: '上册',
  },
  {
    id: 'cn-2a-pinyin2',
    name: '拼音巩固',
    description: '多音字和易混淆拼音辨析',
    emoji: '📝',
    mode: 'recognize-pinyin',
    subject: 'chinese',
    grade: 2,
    semester: '上册',
  },
  {
    id: 'cn-2a-radical2',
    name: '部首查字',
    description: '用部首查字典的方法识字',
    emoji: '📖',
    mode: 'recognize-char',
    subject: 'chinese',
    grade: 2,
    semester: '上册',
  },
  {
    id: 'cn-2b-word2',
    name: '词语搭配',
    description: '近义词、反义词和词语搭配',
    emoji: '🧩',
    mode: 'word-match',
    subject: 'chinese',
    grade: 2,
    semester: '下册',
  },
  {
    id: 'cn-2b-dictation2',
    name: '听写进阶',
    description: '词语和短句听写',
    emoji: '👂',
    mode: 'dictation',
    subject: 'chinese',
    grade: 2,
    semester: '下册',
  },
  {
    id: 'cn-2b-riddle',
    name: '猜字谜',
    description: '趣味字谜和谜语',
    emoji: '❓',
    mode: 'word-match',
    subject: 'chinese',
    grade: 2,
    semester: '下册',
  },

  // ── Grade 3 — 句子段落 ──
  {
    id: 'cn-3a-read',
    name: '阅读理解',
    description: '词语和句子的理解运用',
    emoji: '📖',
    mode: 'word-match',
    subject: 'chinese',
    grade: 3,
    semester: '上册',
  },
  {
    id: 'cn-3a-sentence',
    name: '造句练习',
    description: '用词语造句，理解句式结构',
    emoji: '💬',
    mode: 'word-match',
    subject: 'chinese',
    grade: 3,
    semester: '上册',
  },
  {
    id: 'cn-3a-rhetoric',
    name: '修辞手法',
    description: '比喻、拟人等基本修辞手法',
    emoji: '🎭',
    mode: 'word-match',
    subject: 'chinese',
    grade: 3,
    semester: '上册',
  },
  {
    id: 'cn-3b-write',
    name: '看图写话',
    description: '观察图片，练习写话和写段',
    emoji: '✍️',
    mode: 'word-match',
    subject: 'chinese',
    grade: 3,
    semester: '下册',
  },
  {
    id: 'cn-3b-dictation3',
    name: '综合听写',
    description: '句子级别的听写训练',
    emoji: '👂',
    mode: 'dictation',
    subject: 'chinese',
    grade: 3,
    semester: '下册',
  },
  {
    id: 'cn-3b-punctuation',
    name: '标点符号',
    description: '句号、逗号、感叹号等标点用法',
    emoji: '📌',
    mode: 'word-match',
    subject: 'chinese',
    grade: 3,
    semester: '下册',
  },

  // ── Grade 4 — 成语运用 ──
  {
    id: 'cn-4a-idiom',
    name: '成语世界',
    description: '常见成语的理解和运用',
    emoji: '📚',
    mode: 'idiom-fill',
    subject: 'chinese',
    grade: 4,
    semester: '上册',
  },
  {
    id: 'cn-4a-comprehension',
    name: '阅读进阶',
    description: '短文阅读理解和主旨概括',
    emoji: '📖',
    mode: 'word-match',
    subject: 'chinese',
    grade: 4,
    semester: '上册',
  },
  {
    id: 'cn-4a-memo',
    name: '书信与应用文',
    description: '书信、通知等应用文格式',
    emoji: '✉️',
    mode: 'word-match',
    subject: 'chinese',
    grade: 4,
    semester: '上册',
  },
  {
    id: 'cn-4b-antonym',
    name: '反义词辨析',
    description: '反义词的辨识和运用',
    emoji: '🔄',
    mode: 'antonym',
    subject: 'chinese',
    grade: 4,
    semester: '下册',
  },
  {
    id: 'cn-4b-sentence2',
    name: '扩句缩句',
    description: '扩写和缩写句子练习',
    emoji: '💬',
    mode: 'word-match',
    subject: 'chinese',
    grade: 4,
    semester: '下册',
  },
  {
    id: 'cn-4b-reorder',
    name: '排列句序',
    description: '把打乱的句子排成通顺的段落',
    emoji: '🔀',
    mode: 'word-match',
    subject: 'chinese',
    grade: 4,
    semester: '下册',
  },

  // ── Grade 5 — 古诗近义词 ──
  {
    id: 'cn-5a-poetry',
    name: '古诗词',
    description: '经典古诗词的理解和背诵',
    emoji: '🌸',
    mode: 'poetry-fill',
    subject: 'chinese',
    grade: 5,
    semester: '上册',
  },
  {
    id: 'cn-5a-synonym',
    name: '近义词辨析',
    description: '近义词的辨识和精准辨析',
    emoji: '💡',
    mode: 'synonym',
    subject: 'chinese',
    grade: 5,
    semester: '上册',
  },
  {
    id: 'cn-5a-composition',
    name: '作文基础',
    description: '记叙文的写作方法',
    emoji: '✍️',
    mode: 'word-match',
    subject: 'chinese',
    grade: 5,
    semester: '上册',
  },
  {
    id: 'cn-5b-idiom2',
    name: '成语典故',
    description: '成语背后的历史故事和寓意',
    emoji: '📚',
    mode: 'idiom-fill',
    subject: 'chinese',
    grade: 5,
    semester: '下册',
  },
  {
    id: 'cn-5b-rhetoric2',
    name: '修辞进阶',
    description: '排比、夸张等高级修辞手法',
    emoji: '🎭',
    mode: 'word-match',
    subject: 'chinese',
    grade: 5,
    semester: '下册',
  },
  {
    id: 'cn-5b-modify',
    name: '修改病句',
    description: '常见病句类型的辨析和修改',
    emoji: '🔧',
    mode: 'word-match',
    subject: 'chinese',
    grade: 5,
    semester: '下册',
  },

  // ── Grade 6 — 综合运用 ──
  {
    id: 'cn-6a-idiom3',
    name: '成语进阶',
    description: '更多成语的深入理解与灵活运用',
    emoji: '📚',
    mode: 'idiom-fill',
    subject: 'chinese',
    grade: 6,
    semester: '上册',
  },
  {
    id: 'cn-6a-poetry2',
    name: '古诗词进阶',
    description: '宋词和更长篇幅古诗文的理解',
    emoji: '🌸',
    mode: 'poetry-fill',
    subject: 'chinese',
    grade: 6,
    semester: '上册',
  },
  {
    id: 'cn-6a-argument',
    name: '阅读答题技巧',
    description: '各种阅读题型的答题方法',
    emoji: '📖',
    mode: 'word-match',
    subject: 'chinese',
    grade: 6,
    semester: '上册',
  },
  {
    id: 'cn-6b-poetry3',
    name: '诗词鉴赏',
    description: '古诗词的意境分析和鉴赏',
    emoji: '🌸',
    mode: 'poetry-fill',
    subject: 'chinese',
    grade: 6,
    semester: '下册',
  },
  {
    id: 'cn-6b-writing',
    name: '综合写作',
    description: '各类文体的写作训练',
    emoji: '✍️',
    mode: 'word-match',
    subject: 'chinese',
    grade: 6,
    semester: '下册',
  },
  {
    id: 'cn-6b-culture',
    name: '文学常识',
    description: '中外文学名著和文学常识',
    emoji: '🏛️',
    mode: 'word-match',
    subject: 'chinese',
    grade: 6,
    semester: '下册',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// English Topics (英语) — 人教版PEP英语
// Official PEP English starts from Grade 3 (三年级起点).
// Grades 1-2 contain optional/foundational vocabulary.
// ═══════════════════════════════════════════════════════════════════════════════

const ENGLISH_TOPICS: TopicInfo[] = [
  // ── Grade 1 (pre-school / optional) ──
  {
    id: 'en-1a-basic',
    name: '基础词汇',
    description: '颜色、数字和简单的问候',
    emoji: '🎨',
    mode: 'picture-word',
    subject: 'english',
    grade: 1,
    semester: '上册',
  },
  {
    id: 'en-1a-animal',
    name: '动物乐园',
    description: '常见动物的英文名称',
    emoji: '🐾',
    mode: 'picture-word',
    subject: 'english',
    grade: 1,
    semester: '上册',
  },
  {
    id: 'en-1b-body',
    name: '身体与家庭',
    description: '身体部位和家庭成员',
    emoji: '👨‍👩‍👧',
    mode: 'word-picture',
    subject: 'english',
    grade: 1,
    semester: '下册',
  },
  {
    id: 'en-1b-fruit',
    name: '水果与食物',
    description: '常见水果的英文名称',
    emoji: '🍎',
    mode: 'picture-word',
    subject: 'english',
    grade: 1,
    semester: '下册',
  },

  // ── Grade 2 (pre-school / optional) ──
  {
    id: 'en-2a-food',
    name: '食物与饮料',
    description: '常见食物和饮料的英文表达',
    emoji: '🍎',
    mode: 'picture-word',
    subject: 'english',
    grade: 2,
    semester: '上册',
  },
  {
    id: 'en-2a-toy',
    name: '玩具与颜色',
    description: '玩具名称和颜色复习',
    emoji: '🧸',
    mode: 'word-picture',
    subject: 'english',
    grade: 2,
    semester: '上册',
  },
  {
    id: 'en-2b-nature',
    name: '自然与动物',
    description: '动物、天气和自然词汇',
    emoji: '🌿',
    mode: 'word-picture',
    subject: 'english',
    grade: 2,
    semester: '下册',
  },
  {
    id: 'en-2b-number',
    name: '数字与形状',
    description: '1-20数字和基本形状',
    emoji: '🔢',
    mode: 'picture-word',
    subject: 'english',
    grade: 2,
    semester: '下册',
  },

  // ── Grade 3 (Official PEP starts — 三年级起点) ──
  {
    id: 'en-3a-greeting',
    name: '问候与介绍',
    description: 'Hello! I\'m... 自我介绍和打招呼',
    emoji: '👋',
    mode: 'listening',
    subject: 'english',
    grade: 3,
    semester: '上册',
  },
  {
    id: 'en-3a-colors',
    name: '颜色与文具',
    description: 'Colors, Stationery 文具词汇',
    emoji: '🌈',
    mode: 'word-picture',
    subject: 'english',
    grade: 3,
    semester: '上册',
  },
  {
    id: 'en-3a-body',
    name: '身体部位',
    description: 'Head, face, nose, eyes...',
    emoji: '🧍',
    mode: 'listening',
    subject: 'english',
    grade: 3,
    semester: '上册',
  },
  {
    id: 'en-3b-food',
    name: '食物与表达',
    description: 'I like... I\'d like... 食物表达',
    emoji: '🍔',
    mode: 'spelling',
    subject: 'english',
    grade: 3,
    semester: '下册',
  },
  {
    id: 'en-3b-animal2',
    name: '动物与特征',
    description: 'It\'s big/small... 描述动物',
    emoji: '🐘',
    mode: 'listening',
    subject: 'english',
    grade: 3,
    semester: '下册',
  },
  {
    id: 'en-3b-family',
    name: '家庭成员',
    description: 'Father, mother, brother, sister',
    emoji: '👨‍👩‍👧‍👦',
    mode: 'word-picture',
    subject: 'english',
    grade: 3,
    semester: '下册',
  },

  // ── Grade 4 ──
  {
    id: 'en-4a-classroom',
    name: '教室与学校',
    description: 'Classroom, school, subjects',
    emoji: '🏫',
    mode: 'word-picture',
    subject: 'english',
    grade: 4,
    semester: '上册',
  },
  {
    id: 'en-4a-clothes',
    name: '服装与天气',
    description: '衣服、天气和季节的表达',
    emoji: '👕',
    mode: 'listening',
    subject: 'english',
    grade: 4,
    semester: '上册',
  },
  {
    id: 'en-4a-position',
    name: '位置与方位',
    description: 'Where is...? 方位介词',
    emoji: '📍',
    mode: 'listening',
    subject: 'english',
    grade: 4,
    semester: '上册',
  },
  {
    id: 'en-4b-time',
    name: '时间与日常',
    description: 'What time is it? 日常活动',
    emoji: '⏰',
    mode: 'spelling',
    subject: 'english',
    grade: 4,
    semester: '下册',
  },
  {
    id: 'en-4b-place',
    name: '地点与方向',
    description: 'Hospital, cinema, bookstore...',
    emoji: '🗺️',
    mode: 'word-picture',
    subject: 'english',
    grade: 4,
    semester: '下册',
  },
  {
    id: 'en-4b-weather2',
    name: '天气与活动',
    description: '描述天气和对应的活动',
    emoji: '⛅',
    mode: 'listening',
    subject: 'english',
    grade: 4,
    semester: '下册',
  },

  // ── Grade 5 ──
  {
    id: 'en-5a-day',
    name: '星期与月份',
    description: 'Days, months 日期表达',
    emoji: '📅',
    mode: 'spelling',
    subject: 'english',
    grade: 5,
    semester: '上册',
  },
  {
    id: 'en-5a-hobby',
    name: '爱好与能力',
    description: 'Can you...? I can... 表达能力',
    emoji: '🎯',
    mode: 'listening',
    subject: 'english',
    grade: 5,
    semester: '上册',
  },
  {
    id: 'en-5a-nature',
    name: '自然与环保',
    description: 'Nature, environment 环保词汇',
    emoji: '🌍',
    mode: 'word-picture',
    subject: 'english',
    grade: 5,
    semester: '上册',
  },
  {
    id: 'en-5b-travel',
    name: '旅行与交通',
    description: 'By bus, by train 旅行交通方式',
    emoji: '✈️',
    mode: 'spelling',
    subject: 'english',
    grade: 5,
    semester: '下册',
  },
  {
    id: 'en-5b-feeling',
    name: '情感与描述',
    description: 'How are you? 心情和情感描述',
    emoji: '😊',
    mode: 'listening',
    subject: 'english',
    grade: 5,
    semester: '下册',
  },
  {
    id: 'en-5b-house',
    name: '家居与房间',
    description: 'Living room, bedroom 房间和家具',
    emoji: '🏠',
    mode: 'word-picture',
    subject: 'english',
    grade: 5,
    semester: '下册',
  },

  // ── Grade 6 ──
  {
    id: 'en-6a-school',
    name: '学校生活',
    description: 'Subjects, rules, school life',
    emoji: '📚',
    mode: 'word-picture',
    subject: 'english',
    grade: 6,
    semester: '上册',
  },
  {
    id: 'en-6a-future',
    name: '梦想与未来',
    description: 'What do you want to be? Jobs',
    emoji: '🚀',
    mode: 'spelling',
    subject: 'english',
    grade: 6,
    semester: '上册',
  },
  {
    id: 'en-6a-verb',
    name: '动词与时态',
    description: '过去式和现在进行时基础',
    emoji: '🏃',
    mode: 'spelling',
    subject: 'english',
    grade: 6,
    semester: '上册',
  },
  {
    id: 'en-6b-country',
    name: '国家与文化',
    description: 'Countries, festivals 世界文化',
    emoji: '🌏',
    mode: 'listening',
    subject: 'english',
    grade: 6,
    semester: '下册',
  },
  {
    id: 'en-6b-story',
    name: '故事与阅读',
    description: 'Short stories and reading comprehension',
    emoji: '📖',
    mode: 'word-picture',
    subject: 'english',
    grade: 6,
    semester: '下册',
  },
  {
    id: 'en-6b-review',
    name: '总复习',
    description: '小学英语综合复习',
    emoji: '📋',
    mode: 'spelling',
    subject: 'english',
    grade: 6,
    semester: '下册',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Build the grade hierarchy from flat topic arrays
// ═══════════════════════════════════════════════════════════════════════════════

const ALL_TOPICS: TopicInfo[] = [...MATH_TOPICS, ...CHINESE_TOPICS, ...ENGLISH_TOPICS];

const ALL_GRADES: Grade[] = [1, 2, 3, 4, 5, 6];
const ALL_SEMESTERS: Semester[] = ['上册', '下册'];
const ALL_SUBJECTS: Subject[] = ['math', 'chinese', 'english'];

/**
 * Nested lookup: grade → semester → subject → TopicInfo[]
 */
export const CURRICULUM_BY_GRADE: Record<Grade, Record<Semester, Record<Subject, TopicInfo[]>>> =
  {} as Record<Grade, Record<Semester, Record<Subject, TopicInfo[]>>>;

for (const grade of ALL_GRADES) {
  CURRICULUM_BY_GRADE[grade] = {} as Record<Semester, Record<Subject, TopicInfo[]>>;
  for (const semester of ALL_SEMESTERS) {
    CURRICULUM_BY_GRADE[grade][semester] = {} as Record<Subject, TopicInfo[]>;
    for (const subject of ALL_SUBJECTS) {
      CURRICULUM_BY_GRADE[grade][semester][subject] = ALL_TOPICS.filter(
        (t) => t.grade === grade && t.semester === semester && t.subject === subject,
      );
    }
  }
}

/**
 * Flat lookup map: topic id → TopicInfo
 */
const TOPIC_BY_ID: Map<string, TopicInfo> = new Map();
for (const topic of ALL_TOPICS) {
  TOPIC_BY_ID.set(topic.id, topic);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Exported query functions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get topics for a specific grade, semester, and subject.
 * Returns an empty array if no topics match.
 */
export function getTopics(grade: Grade, semester: Semester, subject: Subject): TopicInfo[] {
  return CURRICULUM_BY_GRADE[grade]?.[semester]?.[subject] ?? [];
}

/**
 * Get all subjects that have at least one topic for a given grade/semester.
 * Useful for dynamically rendering subject tabs.
 */
export function getSubjectsForGrade(grade: Grade, semester: Semester): Subject[] {
  const result: Subject[] = [];
  for (const subject of ALL_SUBJECTS) {
    const topics = CURRICULUM_BY_GRADE[grade][semester][subject];
    if (topics.length > 0) {
      result.push(subject);
    }
  }
  return result;
}

/**
 * Get a human-readable grade + semester label, e.g. "三年级上册".
 */
export function getGradeLabel(grade: Grade, semester: Semester): string {
  return `${GRADE_LABELS[grade]}${semester}`;
}

/**
 * Look up a single topic by its unique id.
 */
export function getTopicById(id: string): TopicInfo | undefined {
  return TOPIC_BY_ID.get(id);
}

/**
 * Get the full grade configuration tree for UI rendering.
 * Returns an array of GradeInfo objects, each containing its semesters and topics.
 */
export function getAllGradesConfig(): GradeInfo[] {
  const result: GradeInfo[] = [];

  for (const grade of ALL_GRADES) {
    const semesterInfos: SemesterInfo[] = [];

    for (const semester of ALL_SEMESTERS) {
      // Collect topics across all subjects for this grade+semester
      const allTopicsForSemester = ALL_TOPICS.filter(
        (t) => t.grade === grade && t.semester === semester,
      );

      if (allTopicsForSemester.length > 0) {
        semesterInfos.push({
          semester,
          topics: allTopicsForSemester,
        });
      }
    }

    if (semesterInfos.length > 0) {
      result.push({
        grade,
        label: GRADE_LABELS[grade],
        emoji: GRADE_EMOJIS[grade],
        semesters: semesterInfos,
      });
    }
  }

  return result;
}

/**
 * Get topics for a specific grade and semester, grouped by subject.
 * Useful for rendering a "browse by subject" view.
 */
export function getTopicsGroupedBySubject(
  grade: Grade,
  semester: Semester,
): Record<Subject, TopicInfo[]> {
  return CURRICULUM_BY_GRADE[grade][semester];
}

/**
 * Get total topic counts as a summary object.
 * Useful for displaying stats like "36 topics across 6 grades".
 */
export function getCurriculumStats(): {
  totalTopics: number;
  mathTopics: number;
  chineseTopics: number;
  englishTopics: number;
  gradeCount: number;
} {
  return {
    totalTopics: ALL_TOPICS.length,
    mathTopics: MATH_TOPICS.length,
    chineseTopics: CHINESE_TOPICS.length,
    englishTopics: ENGLISH_TOPICS.length,
    gradeCount: ALL_GRADES.length,
  };
}

/**
 * Check if a given grade + semester + subject combination has any topics.
 */
export function hasTopics(grade: Grade, semester: Semester, subject: Subject): boolean {
  return CURRICULUM_BY_GRADE[grade][semester][subject].length > 0;
}
