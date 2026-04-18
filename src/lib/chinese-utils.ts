// Chinese practice utilities for 数学小达人

// ─── Types ──────────────────────────────────────────────────────────────────

export type ChineseMode = 'recognize-char' | 'recognize-pinyin' | 'word-match' | 'dictation';
export type ChineseGrade = 1 | 2 | 3;

export interface ChineseQuestion {
  id: string;
  mode: ChineseMode;
  prompt: string;
  correctAnswer: string;
  correctIndex: number;
  options: string[];
  grade: ChineseGrade;
}

export interface ChineseModeConfig {
  mode: ChineseMode;
  emoji: string;
  name: string;
  description: string;
}

// ─── Mode Configuration ─────────────────────────────────────────────────────

export const MODE_CONFIG: Record<ChineseMode, ChineseModeConfig> = {
  'recognize-char': {
    mode: 'recognize-char',
    emoji: '🔤',
    name: '识字大冒险',
    description: '看拼音选汉字，认识更多汉字！',
  },
  'recognize-pinyin': {
    mode: 'recognize-pinyin',
    emoji: '📝',
    name: '拼音小能手',
    description: '看汉字选拼音，掌握正确发音！',
  },
  'word-match': {
    mode: 'word-match',
    emoji: '🧩',
    name: '词语消消乐',
    description: '把汉字和正确的词语配对！',
  },
  'dictation': {
    mode: 'dictation',
    emoji: '👂',
    name: '听写小达人',
    description: '听发音，选出正确的汉字！',
  },
};

export const ALL_CHINESE_MODES: ChineseModeConfig[] = Object.values(MODE_CONFIG);

// ─── Character / Word Databases ─────────────────────────────────────────────

interface CharEntry {
  char: string;
  pinyin: string;
  meaning: string;
}

interface WordEntry {
  word: string;
  pinyin: string;
  meaning: string;
}

// Grade 1 characters (simplified, common characters taught in first grade)
const GRADE_1_CHARS: CharEntry[] = [
  { char: '一', pinyin: 'yī', meaning: 'one' },
  { char: '二', pinyin: 'èr', meaning: 'two' },
  { char: '三', pinyin: 'sān', meaning: 'three' },
  { char: '四', pinyin: 'sì', meaning: 'four' },
  { char: '五', pinyin: 'wǔ', meaning: 'five' },
  { char: '六', pinyin: 'liù', meaning: 'six' },
  { char: '七', pinyin: 'qī', meaning: 'seven' },
  { char: '八', pinyin: 'bā', meaning: 'eight' },
  { char: '九', pinyin: 'jiǔ', meaning: 'nine' },
  { char: '十', pinyin: 'shí', meaning: 'ten' },
  { char: '大', pinyin: 'dà', meaning: 'big' },
  { char: '小', pinyin: 'xiǎo', meaning: 'small' },
  { char: '上', pinyin: 'shàng', meaning: 'up' },
  { char: '下', pinyin: 'xià', meaning: 'down' },
  { char: '左', pinyin: 'zuǒ', meaning: 'left' },
  { char: '右', pinyin: 'yòu', meaning: 'right' },
  { char: '天', pinyin: 'tiān', meaning: 'day/sky' },
  { char: '地', pinyin: 'dì', meaning: 'ground' },
  { char: '人', pinyin: 'rén', meaning: 'person' },
  { char: '口', pinyin: 'kǒu', meaning: 'mouth' },
  { char: '手', pinyin: 'shǒu', meaning: 'hand' },
  { char: '目', pinyin: 'mù', meaning: 'eye' },
  { char: '耳', pinyin: 'ěr', meaning: 'ear' },
  { char: '日', pinyin: 'rì', meaning: 'sun' },
  { char: '月', pinyin: 'yuè', meaning: 'moon' },
  { char: '水', pinyin: 'shuǐ', meaning: 'water' },
  { char: '火', pinyin: 'huǒ', meaning: 'fire' },
  { char: '山', pinyin: 'shān', meaning: 'mountain' },
  { char: '石', pinyin: 'shí', meaning: 'stone' },
  { char: '田', pinyin: 'tián', meaning: 'field' },
  { char: '禾', pinyin: 'hé', meaning: 'grain' },
  { char: '花', pinyin: 'huā', meaning: 'flower' },
  { char: '草', pinyin: 'cǎo', meaning: 'grass' },
  { char: '鸟', pinyin: 'niǎo', meaning: 'bird' },
  { char: '鱼', pinyin: 'yú', meaning: 'fish' },
  { char: '马', pinyin: 'mǎ', meaning: 'horse' },
  { char: '牛', pinyin: 'niú', meaning: 'cow' },
  { char: '羊', pinyin: 'yáng', meaning: 'sheep' },
  { char: '云', pinyin: 'yún', meaning: 'cloud' },
  { char: '风', pinyin: 'fēng', meaning: 'wind' },
  { char: '雨', pinyin: 'yǔ', meaning: 'rain' },
  { char: '雪', pinyin: 'xuě', meaning: 'snow' },
];

const GRADE_2_CHARS: CharEntry[] = [
  { char: '明', pinyin: 'míng', meaning: 'bright' },
  { char: '亮', pinyin: 'liàng', meaning: 'bright' },
  { char: '星', pinyin: 'xīng', meaning: 'star' },
  { char: '春', pinyin: 'chūn', meaning: 'spring' },
  { char: '夏', pinyin: 'xià', meaning: 'summer' },
  { char: '秋', pinyin: 'qiū', meaning: 'autumn' },
  { char: '冬', pinyin: 'dōng', meaning: 'winter' },
  { char: '红', pinyin: 'hóng', meaning: 'red' },
  { char: '绿', pinyin: 'lǜ', meaning: 'green' },
  { char: '蓝', pinyin: 'lán', meaning: 'blue' },
  { char: '黄', pinyin: 'huáng', meaning: 'yellow' },
  { char: '白', pinyin: 'bái', meaning: 'white' },
  { char: '黑', pinyin: 'hēi', meaning: 'black' },
  { char: '东', pinyin: 'dōng', meaning: 'east' },
  { char: '南', pinyin: 'nán', meaning: 'south' },
  { char: '西', pinyin: 'xī', meaning: 'west' },
  { char: '北', pinyin: 'běi', meaning: 'north' },
  { char: '前', pinyin: 'qián', meaning: 'front' },
  { char: '后', pinyin: 'hòu', meaning: 'back' },
  { char: '高', pinyin: 'gāo', meaning: 'tall/high' },
  { char: '低', pinyin: 'dī', meaning: 'low' },
  { char: '长', pinyin: 'cháng', meaning: 'long' },
  { char: '短', pinyin: 'duǎn', meaning: 'short' },
  { char: '多', pinyin: 'duō', meaning: 'many' },
  { char: '少', pinyin: 'shǎo', meaning: 'few' },
  { char: '好', pinyin: 'hǎo', meaning: 'good' },
  { char: '美', pinyin: 'měi', meaning: 'beautiful' },
  { char: '爱', pinyin: 'ài', meaning: 'love' },
  { char: '学', pinyin: 'xué', meaning: 'learn' },
  { char: '读', pinyin: 'dú', meaning: 'read' },
  { char: '写', pinyin: 'xiě', meaning: 'write' },
  { char: '画', pinyin: 'huà', meaning: 'draw' },
  { char: '唱', pinyin: 'chàng', meaning: 'sing' },
  { char: '跳', pinyin: 'tiào', meaning: 'jump' },
  { char: '跑', pinyin: 'pǎo', meaning: 'run' },
  { char: '吃', pinyin: 'chī', meaning: 'eat' },
  { char: '喝', pinyin: 'hē', meaning: 'drink' },
  { char: '睡', pinyin: 'shuì', meaning: 'sleep' },
  { char: '笑', pinyin: 'xiào', meaning: 'laugh' },
  { char: '哭', pinyin: 'kū', meaning: 'cry' },
];

const GRADE_3_CHARS: CharEntry[] = [
  { char: '想', pinyin: 'xiǎng', meaning: 'think/want' },
  { char: '念', pinyin: 'niàn', meaning: 'miss/read' },
  { char: '知', pinyin: 'zhī', meaning: 'know' },
  { char: '道', pinyin: 'dào', meaning: 'way/path' },
  { char: '理', pinyin: 'lǐ', meaning: 'reason' },
  { char: '解', pinyin: 'jiě', meaning: 'solve' },
  { char: '问', pinyin: 'wèn', meaning: 'ask' },
  { char: '答', pinyin: 'dá', meaning: 'answer' },
  { char: '讲', pinyin: 'jiǎng', meaning: 'speak' },
  { char: '说', pinyin: 'shuō', meaning: 'say' },
  { char: '听', pinyin: 'tīng', meaning: 'listen' },
  { char: '看', pinyin: 'kàn', meaning: 'look' },
  { char: '见', pinyin: 'jiàn', meaning: 'see' },
  { char: '觉', pinyin: 'jué', meaning: 'feel' },
  { char: '得', pinyin: 'dé', meaning: 'get' },
  { char: '能', pinyin: 'néng', meaning: 'can' },
  { char: '会', pinyin: 'huì', meaning: 'can/meet' },
  { char: '要', pinyin: 'yào', meaning: 'want' },
  { char: '做', pinyin: 'zuò', meaning: 'do/make' },
  { char: '打', pinyin: 'dǎ', meaning: 'hit/play' },
  { char: '开', pinyin: 'kāi', meaning: 'open' },
  { char: '关', pinyin: 'guān', meaning: 'close' },
  { char: '出', pinyin: 'chū', meaning: 'out' },
  { char: '入', pinyin: 'rù', meaning: 'enter' },
  { char: '回', pinyin: 'huí', meaning: 'return' },
  { char: '来', pinyin: 'lái', meaning: 'come' },
  { char: '去', pinyin: 'qù', meaning: 'go' },
  { char: '走', pinyin: 'zǒu', meaning: 'walk' },
  { char: '飞', pinyin: 'fēi', meaning: 'fly' },
  { char: '海', pinyin: 'hǎi', meaning: 'sea' },
  { char: '河', pinyin: 'hé', meaning: 'river' },
  { char: '湖', pinyin: 'hú', meaning: 'lake' },
  { char: '林', pinyin: 'lín', meaning: 'forest' },
  { char: '树', pinyin: 'shù', meaning: 'tree' },
  { char: '叶', pinyin: 'yè', meaning: 'leaf' },
  { char: '果', pinyin: 'guǒ', meaning: 'fruit' },
  { char: '园', pinyin: 'yuán', meaning: 'garden' },
  { char: '桥', pinyin: 'qiáo', meaning: 'bridge' },
  { char: '路', pinyin: 'lù', meaning: 'road' },
  { char: '车', pinyin: 'chē', meaning: 'car' },
  { char: '船', pinyin: 'chuán', meaning: 'boat' },
];

// Grade 1-2 words
const GRADE_1_WORDS: WordEntry[] = [
  { word: '大家好', pinyin: 'dà jiā hǎo', meaning: 'hello everyone' },
  { word: '上学', pinyin: 'shàng xué', meaning: 'go to school' },
  { word: '回家', pinyin: 'huí jiā', meaning: 'go home' },
  { word: '吃饭', pinyin: 'chī fàn', meaning: 'eat meal' },
  { word: '喝水', pinyin: 'hē shuǐ', meaning: 'drink water' },
  { word: '看书', pinyin: 'kàn shū', meaning: 'read book' },
  { word: '写字', pinyin: 'xiě zì', meaning: 'write character' },
  { word: '画画', pinyin: 'huà huà', meaning: 'draw picture' },
  { word: '唱歌', pinyin: 'chàng gē', meaning: 'sing song' },
  { word: '跳舞', pinyin: 'tiào wǔ', meaning: 'dance' },
  { word: '跑步', pinyin: 'pǎo bù', meaning: 'run' },
  { word: '游泳', pinyin: 'yóu yǒng', meaning: 'swim' },
  { word: '下雨', pinyin: 'xià yǔ', meaning: 'rain' },
  { word: '太阳', pinyin: 'tài yáng', meaning: 'sun' },
  { word: '月亮', pinyin: 'yuè liang', meaning: 'moon' },
  { word: '星星', pinyin: 'xīng xing', meaning: 'star' },
  { word: '白云', pinyin: 'bái yún', meaning: 'white cloud' },
  { word: '小鸟', pinyin: 'xiǎo niǎo', meaning: 'little bird' },
  { word: '小鱼', pinyin: 'xiǎo yú', meaning: 'little fish' },
  { word: '小狗', pinyin: 'xiǎo gǒu', meaning: 'little dog' },
  { word: '小猫', pinyin: 'xiǎo māo', meaning: 'little cat' },
  { word: '花园', pinyin: 'huā yuán', meaning: 'garden' },
  { word: '学校', pinyin: 'xué xiào', meaning: 'school' },
  { word: '老师', pinyin: 'lǎo shī', meaning: 'teacher' },
  { word: '同学', pinyin: 'tóng xué', meaning: 'classmate' },
  { word: '朋友', pinyin: 'péng you', meaning: 'friend' },
  { word: '爸爸', pinyin: 'bà ba', meaning: 'father' },
  { word: '妈妈', pinyin: 'mā ma', meaning: 'mother' },
  { word: '爷爷', pinyin: 'yé ye', meaning: 'grandfather' },
  { word: '奶奶', pinyin: 'nǎi nai', meaning: 'grandmother' },
];

const GRADE_2_WORDS: WordEntry[] = [
  { word: '春天', pinyin: 'chūn tiān', meaning: 'spring' },
  { word: '夏天', pinyin: 'xià tiān', meaning: 'summer' },
  { word: '秋天', pinyin: 'qiū tiān', meaning: 'autumn' },
  { word: '冬天', pinyin: 'dōng tiān', meaning: 'winter' },
  { word: '高山', pinyin: 'gāo shān', meaning: 'high mountain' },
  { word: '大海', pinyin: 'dà hǎi', meaning: 'sea' },
  { word: '森林', pinyin: 'sēn lín', meaning: 'forest' },
  { word: '草原', pinyin: 'cǎo yuán', meaning: 'grassland' },
  { word: '快乐', pinyin: 'kuài lè', meaning: 'happy' },
  { word: '开心', pinyin: 'kāi xīn', meaning: 'happy' },
  { word: '美丽', pinyin: 'měi lì', meaning: 'beautiful' },
  { word: '温暖', pinyin: 'wēn nuǎn', meaning: 'warm' },
  { word: '勇敢', pinyin: 'yǒng gǎn', meaning: 'brave' },
  { word: '聪明', pinyin: 'cōng míng', meaning: 'smart' },
  { word: '努力', pinyin: 'nǔ lì', meaning: 'hardworking' },
  { word: '读书', pinyin: 'dú shū', meaning: 'read book' },
  { word: '学习', pinyin: 'xué xí', meaning: 'study' },
  { word: '回答', pinyin: 'huí dá', meaning: 'answer' },
  { word: '问题', pinyin: 'wèn tí', meaning: 'question' },
  { word: '知识', pinyin: 'zhī shi', meaning: 'knowledge' },
];

const GRADE_3_WORDS: WordEntry[] = [
  { word: '思考', pinyin: 'sī kǎo', meaning: 'think' },
  { word: '发现', pinyin: 'fā xiàn', meaning: 'discover' },
  { word: '创造', pinyin: 'chuàng zào', meaning: 'create' },
  { word: '探索', pinyin: 'tàn suǒ', meaning: 'explore' },
  { word: '旅行', pinyin: 'lǚ xíng', meaning: 'travel' },
  { word: '风景', pinyin: 'fēng jǐng', meaning: 'scenery' },
  { word: '彩虹', pinyin: 'cǎi hóng', meaning: 'rainbow' },
  { word: '瀑布', pinyin: 'pù bù', meaning: 'waterfall' },
  { word: '科学家', pinyin: 'kē xué jiā', meaning: 'scientist' },
  { word: '宇航员', pinyin: 'yǔ háng yuán', meaning: 'astronaut' },
  { word: '机器人', pinyin: 'jī qì rén', meaning: 'robot' },
  { word: '计算机', pinyin: 'jì suàn jī', meaning: 'computer' },
  { word: '图书馆', pinyin: 'tú shū guǎn', meaning: 'library' },
  { word: '博物馆', pinyin: 'bó wù guǎn', meaning: 'museum' },
  { word: '操场', pinyin: 'cāo chǎng', meaning: 'playground' },
  { word: '教室', pinyin: 'jiào shì', meaning: 'classroom' },
  { word: '友谊', pinyin: 'yǒu yì', meaning: 'friendship' },
  { word: '梦想', pinyin: 'mèng xiǎng', meaning: 'dream' },
  { word: '希望', pinyin: 'xī wàng', meaning: 'hope' },
  { word: '成功', pinyin: 'chéng gōng', meaning: 'success' },
];

const GRADED_CHARS: Record<ChineseGrade, CharEntry[]> = {
  1: GRADE_1_CHARS,
  2: GRADE_2_CHARS,
  3: GRADE_3_CHARS,
};

const GRADED_WORDS: Record<ChineseGrade, WordEntry[]> = {
  1: GRADE_1_WORDS,
  2: GRADE_2_WORDS,
  3: GRADE_3_WORDS,
};

// ─── Helpers ────────────────────────────────────────────────────────────────

let chineseQuestionIdCounter = 0;
function genChineseId(): string {
  return `cq-${Date.now()}-${++chineseQuestionIdCounter}`;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getDistractors(correct: string, pool: string[], count: number = 3): string[] {
  const filtered = pool.filter((item) => item !== correct);
  const shuffled = shuffle(filtered);
  return shuffled.slice(0, count);
}

// ─── Question Generators ────────────────────────────────────────────────────

function generateRecognizeCharQuestion(grade: ChineseGrade): ChineseQuestion {
  const chars = GRADED_CHARS[grade];
  const correct = pickRandom(chars);
  const allChars = [...GRADE_1_CHARS, ...GRADE_2_CHARS, ...GRADE_3_CHARS];
  const distractors = getDistractors(correct.char, allChars.map((c) => c.char), 3);
  const options = shuffle([correct.char, ...distractors]);

  return {
    id: genChineseId(),
    mode: 'recognize-char',
    prompt: correct.pinyin,
    correctAnswer: correct.char,
    correctIndex: options.indexOf(correct.char),
    options,
    grade,
  };
}

function generateRecognizePinyinQuestion(grade: ChineseGrade): ChineseQuestion {
  const chars = GRADED_CHARS[grade];
  const correct = pickRandom(chars);
  const allChars = [...GRADE_1_CHARS, ...GRADE_2_CHARS, ...GRADE_3_CHARS];
  const distractors = getDistractors(correct.pinyin, allChars.map((c) => c.pinyin), 3);
  const options = shuffle([correct.pinyin, ...distractors]);

  return {
    id: genChineseId(),
    mode: 'recognize-pinyin',
    prompt: correct.char,
    correctAnswer: correct.pinyin,
    correctIndex: options.indexOf(correct.pinyin),
    options,
    grade,
  };
}

function generateWordMatchQuestion(grade: ChineseGrade): ChineseQuestion {
  const words = GRADED_WORDS[grade];
  const correct = pickRandom(words);
  const allWords = [...GRADE_1_WORDS, ...GRADE_2_WORDS, ...GRADE_3_WORDS];
  const distractors = getDistractors(correct.word, allWords.map((w) => w.word), 3);
  const options = shuffle([correct.word, ...distractors]);

  return {
    id: genChineseId(),
    mode: 'word-match',
    prompt: correct.pinyin,
    correctAnswer: correct.word,
    correctIndex: options.indexOf(correct.word),
    options,
    grade,
  };
}

function generateDictationQuestion(grade: ChineseGrade): ChineseQuestion {
  const chars = GRADED_CHARS[grade];
  const correct = pickRandom(chars);
  const allChars = [...GRADE_1_CHARS, ...GRADE_2_CHARS, ...GRADE_3_CHARS];
  const distractors = getDistractors(correct.char, allChars.map((c) => c.char), 3);
  const options = shuffle([correct.char, ...distractors]);

  // For dictation, the prompt is the pinyin (to be spoken) and meaning as hint
  return {
    id: genChineseId(),
    mode: 'dictation',
    prompt: `${correct.meaning} (${correct.pinyin})`,
    correctAnswer: correct.char,
    correctIndex: options.indexOf(correct.char),
    options,
    grade,
  };
}

// ─── Main Generator ─────────────────────────────────────────────────────────

/**
 * Generate an array of Chinese practice questions.
 *
 * @param mode - The practice mode
 * @param grade - 1, 2, or 3
 * @param count - Number of questions to generate (default 10)
 * @returns Array of ChineseQuestion objects
 */
export function generateChineseQuestions(
  mode: ChineseMode,
  grade: ChineseGrade,
  count: number = 10
): ChineseQuestion[] {
  const questions: ChineseQuestion[] = [];

  for (let i = 0; i < count; i++) {
    let question: ChineseQuestion;
    switch (mode) {
      case 'recognize-char':
        question = generateRecognizeCharQuestion(grade);
        break;
      case 'recognize-pinyin':
        question = generateRecognizePinyinQuestion(grade);
        break;
      case 'word-match':
        question = generateWordMatchQuestion(grade);
        break;
      case 'dictation':
        question = generateDictationQuestion(grade);
        break;
      default:
        question = generateRecognizeCharQuestion(grade);
    }
    questions.push(question);
  }

  return questions;
}
