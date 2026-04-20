// Chinese practice utilities for 学习小达人
// Supports grades 1-6 with curriculum-appropriate content

// ─── Types ──────────────────────────────────────────────────────────────────

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

export type ChineseGrade = 1 | 2 | 3 | 4 | 5 | 6;

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
  minGrade: ChineseGrade;
}

// ─── Mode Configuration ─────────────────────────────────────────────────────

export const MODE_CONFIG: Record<ChineseMode, ChineseModeConfig> = {
  'recognize-char': {
    mode: 'recognize-char',
    emoji: '🔤',
    name: '识字大冒险',
    description: '看拼音选汉字，认识更多汉字！',
    minGrade: 1,
  },
  'recognize-pinyin': {
    mode: 'recognize-pinyin',
    emoji: '📝',
    name: '拼音小能手',
    description: '看汉字选拼音，掌握正确发音！',
    minGrade: 1,
  },
  'word-match': {
    mode: 'word-match',
    emoji: '🧩',
    name: '词语消消乐',
    description: '把汉字和正确的词语配对！',
    minGrade: 1,
  },
  'dictation': {
    mode: 'dictation',
    emoji: '👂',
    name: '听写小达人',
    description: '听发音，选出正确的汉字！',
    minGrade: 1,
  },
  'idiom-fill': {
    mode: 'idiom-fill',
    emoji: '📚',
    name: '成语填空',
    description: '补全成语中缺少的汉字！',
    minGrade: 4,
  },
  'antonym': {
    mode: 'antonym',
    emoji: '🔄',
    name: '反义词大挑战',
    description: '找出词语的反义词！',
    minGrade: 4,
  },
  'poetry-fill': {
    mode: 'poetry-fill',
    emoji: '🌸',
    name: '古诗填空',
    description: '补全古诗中的诗句！',
    minGrade: 5,
  },
  'synonym': {
    mode: 'synonym',
    emoji: '💡',
    name: '近义词连连看',
    description: '找出意思相近的词语！',
    minGrade: 4,
  },
  'sentence-fill': {
    mode: 'sentence-fill',
    emoji: '📝',
    name: '句子填空',
    description: '在句子中填入正确的词语！',
    minGrade: 3,
  },
  'sentence-rearrange': {
    mode: 'sentence-rearrange',
    emoji: '🔧',
    name: '句子排列',
    description: '把打乱的词语排成通顺的句子！',
    minGrade: 5,
  },
  'reading-comp': {
    mode: 'reading-comp',
    emoji: '📖',
    name: '阅读理解',
    description: '读短文，回答问题！',
    minGrade: 5,
  },
};

export const ALL_CHINESE_MODES: ChineseModeConfig[] = Object.values(MODE_CONFIG);

/** Return available modes for a given grade */
export function getModesForGrade(grade: ChineseGrade): ChineseModeConfig[] {
  return ALL_CHINESE_MODES.filter((m) => grade >= m.minGrade);
}

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

// ── Grade 1 (一年级) ────────────────────────────────────────────────────────
// Focus: basic literacy — body, nature, family, daily actions
const GRADE_1_CHARS: CharEntry[] = [
  { char: '人', pinyin: 'rén', meaning: 'person' },
  { char: '大', pinyin: 'dà', meaning: 'big' },
  { char: '天', pinyin: 'tiān', meaning: 'sky/day' },
  { char: '空', pinyin: 'kōng', meaning: 'empty/sky' },
  { char: '口', pinyin: 'kǒu', meaning: 'mouth' },
  { char: '手', pinyin: 'shǒu', meaning: 'hand' },
  { char: '足', pinyin: 'zú', meaning: 'foot' },
  { char: '目', pinyin: 'mù', meaning: 'eye' },
  { char: '耳', pinyin: 'ěr', meaning: 'ear' },
  { char: '日', pinyin: 'rì', meaning: 'sun' },
  { char: '月', pinyin: 'yuè', meaning: 'moon' },
  { char: '山', pinyin: 'shān', meaning: 'mountain' },
  { char: '水', pinyin: 'shuǐ', meaning: 'water' },
  { char: '火', pinyin: 'huǒ', meaning: 'fire' },
  { char: '田', pinyin: 'tián', meaning: 'field' },
  { char: '禾', pinyin: 'hé', meaning: 'grain' },
  { char: '花', pinyin: 'huā', meaning: 'flower' },
  { char: '草', pinyin: 'cǎo', meaning: 'grass' },
  { char: '鸟', pinyin: 'niǎo', meaning: 'bird' },
  { char: '鱼', pinyin: 'yú', meaning: 'fish' },
  { char: '虫', pinyin: 'chóng', meaning: 'bug' },
  { char: '云', pinyin: 'yún', meaning: 'cloud' },
  { char: '风', pinyin: 'fēng', meaning: 'wind' },
  { char: '雨', pinyin: 'yǔ', meaning: 'rain' },
  { char: '雪', pinyin: 'xuě', meaning: 'snow' },
  { char: '石', pinyin: 'shí', meaning: 'stone' },
  { char: '土', pinyin: 'tǔ', meaning: 'soil' },
  { char: '木', pinyin: 'mù', meaning: 'wood' },
  { char: '林', pinyin: 'lín', meaning: 'forest' },
  { char: '上', pinyin: 'shàng', meaning: 'up' },
  { char: '下', pinyin: 'xià', meaning: 'down' },
  { char: '左', pinyin: 'zuǒ', meaning: 'left' },
  { char: '右', pinyin: 'yòu', meaning: 'right' },
  { char: '前', pinyin: 'qián', meaning: 'front' },
  { char: '后', pinyin: 'hòu', meaning: 'back' },
  { char: '中', pinyin: 'zhōng', meaning: 'middle' },
  { char: '来', pinyin: 'lái', meaning: 'come' },
  { char: '去', pinyin: 'qù', meaning: 'go' },
  { char: '走', pinyin: 'zǒu', meaning: 'walk' },
  { char: '跑', pinyin: 'pǎo', meaning: 'run' },
  { char: '吃', pinyin: 'chī', meaning: 'eat' },
  { char: '喝', pinyin: 'hē', meaning: 'drink' },
  { char: '看', pinyin: 'kàn', meaning: 'look' },
  { char: '听', pinyin: 'tīng', meaning: 'listen' },
  { char: '说', pinyin: 'shuō', meaning: 'speak' },
  { char: '读', pinyin: 'dú', meaning: 'read' },
  { char: '写', pinyin: 'xiě', meaning: 'write' },
  { char: '画', pinyin: 'huà', meaning: 'draw' },
  { char: '马', pinyin: 'mǎ', meaning: 'horse' },
  { char: '牛', pinyin: 'niú', meaning: 'cow' },
  { char: '羊', pinyin: 'yáng', meaning: 'sheep' },
];

const GRADE_1_WORDS: WordEntry[] = [
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
  { word: '下雨', pinyin: 'xià yǔ', meaning: 'raining' },
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
  { word: '大家好', pinyin: 'dà jiā hǎo', meaning: 'hello everyone' },
];

// ── Grade 2 (二年级) ────────────────────────────────────────────────────────
// Focus: colors, directions, seasons, emotions, actions
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
  { char: '唱', pinyin: 'chàng', meaning: 'sing' },
  { char: '跳', pinyin: 'tiào', meaning: 'jump' },
  { char: '睡', pinyin: 'shuì', meaning: 'sleep' },
  { char: '笑', pinyin: 'xiào', meaning: 'laugh' },
  { char: '哭', pinyin: 'kū', meaning: 'cry' },
  { char: '飞', pinyin: 'fēi', meaning: 'fly' },
  { char: '海', pinyin: 'hǎi', meaning: 'sea' },
  { char: '河', pinyin: 'hé', meaning: 'river' },
  { char: '湖', pinyin: 'hú', meaning: 'lake' },
  { char: '树', pinyin: 'shù', meaning: 'tree' },
  { char: '叶', pinyin: 'yè', meaning: 'leaf' },
  { char: '果', pinyin: 'guǒ', meaning: 'fruit' },
  { char: '园', pinyin: 'yuán', meaning: 'garden' },
  { char: '桥', pinyin: 'qiáo', meaning: 'bridge' },
  { char: '路', pinyin: 'lù', meaning: 'road' },
  { char: '车', pinyin: 'chē', meaning: 'car' },
  { char: '船', pinyin: 'chuán', meaning: 'boat' },
  { char: '门', pinyin: 'mén', meaning: 'door' },
  { char: '窗', pinyin: 'chuāng', meaning: 'window' },
  { char: '桌', pinyin: 'zhuō', meaning: 'table' },
];

const GRADE_2_WORDS: WordEntry[] = [
  { word: '春天', pinyin: 'chūn tiān', meaning: 'spring season' },
  { word: '夏天', pinyin: 'xià tiān', meaning: 'summer season' },
  { word: '秋天', pinyin: 'qiū tiān', meaning: 'autumn season' },
  { word: '冬天', pinyin: 'dōng tiān', meaning: 'winter season' },
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
  { word: '高山', pinyin: 'gāo shān', meaning: 'high mountain' },
  { word: '大海', pinyin: 'dà hǎi', meaning: 'big sea' },
  { word: '森林', pinyin: 'sēn lín', meaning: 'forest' },
  { word: '草原', pinyin: 'cǎo yuán', meaning: 'grassland' },
  { word: '天空', pinyin: 'tiān kōng', meaning: 'sky' },
  { word: '世界', pinyin: 'shì jiè', meaning: 'world' },
  { word: '动物', pinyin: 'dòng wù', meaning: 'animal' },
  { word: '植物', pinyin: 'zhí wù', meaning: 'plant' },
];

// ── Grade 3 (三年级) ────────────────────────────────────────────────────────
// Focus: cognitive verbs, complex nature, places, abstract concepts
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
  { char: '找', pinyin: 'zhǎo', meaning: 'look for' },
  { char: '送', pinyin: 'sòng', meaning: 'send/give' },
  { char: '带', pinyin: 'dài', meaning: 'bring/carry' },
  { char: '过', pinyin: 'guò', meaning: 'pass' },
  { char: '起', pinyin: 'qǐ', meaning: 'rise' },
  { char: '用', pinyin: 'yòng', meaning: 'use' },
  { char: '法', pinyin: 'fǎ', meaning: 'law/method' },
  { char: '情', pinyin: 'qíng', meaning: 'feeling' },
  { char: '意', pinyin: 'yì', meaning: 'meaning' },
  { char: '心', pinyin: 'xīn', meaning: 'heart' },
  { char: '力', pinyin: 'lì', meaning: 'strength' },
  { char: '光', pinyin: 'guāng', meaning: 'light' },
  { char: '色', pinyin: 'sè', meaning: 'color' },
  { char: '声', pinyin: 'shēng', meaning: 'sound' },
  { char: '气', pinyin: 'qì', meaning: 'air/breath' },
  { char: '动', pinyin: 'dòng', meaning: 'move' },
  { char: '静', pinyin: 'jìng', meaning: 'quiet' },
  { char: '快', pinyin: 'kuài', meaning: 'fast' },
  { char: '慢', pinyin: 'màn', meaning: 'slow' },
  { char: '轻', pinyin: 'qīng', meaning: 'light' },
  { char: '重', pinyin: 'zhòng', meaning: 'heavy' },
  { char: '深', pinyin: 'shēn', meaning: 'deep' },
  { char: '浅', pinyin: 'qiǎn', meaning: 'shallow' },
  { char: '远', pinyin: 'yuǎn', meaning: 'far' },
  { char: '近', pinyin: 'jìn', meaning: 'near' },
];

const GRADE_3_WORDS: WordEntry[] = [
  { word: '思考', pinyin: 'sī kǎo', meaning: 'think deeply' },
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
  { word: '困难', pinyin: 'kùn nán', meaning: 'difficulty' },
  { word: '坚持', pinyin: 'jiān chí', meaning: 'persist' },
  { word: '帮助', pinyin: 'bāng zhù', meaning: 'help' },
  { word: '感谢', pinyin: 'gǎn xiè', meaning: 'thank' },
  { word: '故事', pinyin: 'gù shi', meaning: 'story' },
];

// ── Grade 4 (四年级) ────────────────────────────────────────────────────────
// Focus: idioms, antonyms, more descriptive vocabulary
const GRADE_4_CHARS: CharEntry[] = [
  { char: '丰', pinyin: 'fēng', meaning: 'abundant' },
  { char: '富', pinyin: 'fù', meaning: 'rich' },
  { char: '诚', pinyin: 'chéng', meaning: 'sincere' },
  { char: '信', pinyin: 'xìn', meaning: 'trust' },
  { char: '忠', pinyin: 'zhōng', meaning: 'loyal' },
  { char: '善', pinyin: 'shàn', meaning: 'good/kind' },
  { char: '恶', pinyin: 'è', meaning: 'evil' },
  { char: '优', pinyin: 'yōu', meaning: 'excellent' },
  { char: '劣', pinyin: 'liè', meaning: 'inferior' },
  { char: '胜', pinyin: 'shèng', meaning: 'victory' },
  { char: '败', pinyin: 'bài', meaning: 'defeat' },
  { char: '宽', pinyin: 'kuān', meaning: 'wide' },
  { char: '窄', pinyin: 'zhǎi', meaning: 'narrow' },
  { char: '厚', pinyin: 'hòu', meaning: 'thick' },
  { char: '薄', pinyin: 'bó', meaning: 'thin' },
  { char: '粗', pinyin: 'cū', meaning: 'thick/rough' },
  { char: '细', pinyin: 'xì', meaning: 'thin/fine' },
  { char: '干', pinyin: 'gān', meaning: 'dry' },
  { char: '湿', pinyin: 'shī', meaning: 'wet' },
  { char: '柔', pinyin: 'róu', meaning: 'soft' },
  { char: '刚', pinyin: 'gāng', meaning: 'firm' },
  { char: '智', pinyin: 'zhì', meaning: 'wise' },
  { char: '愚', pinyin: 'yú', meaning: 'foolish' },
  { char: '勤', pinyin: 'qín', meaning: 'diligent' },
  { char: '懒', pinyin: 'lǎn', meaning: 'lazy' },
  { char: '险', pinyin: 'xiǎn', meaning: 'dangerous' },
  { char: '安', pinyin: 'ān', meaning: 'safe' },
  { char: '忙', pinyin: 'máng', meaning: 'busy' },
  { char: '闲', pinyin: 'xián', meaning: 'free' },
  { char: '聚', pinyin: 'jù', meaning: 'gather' },
  { char: '散', pinyin: 'sàn', meaning: 'scatter' },
  { char: '升', pinyin: 'shēng', meaning: 'rise' },
  { char: '降', pinyin: 'jiàng', meaning: 'descend' },
  { char: '隐', pinyin: 'yǐn', meaning: 'hidden' },
  { char: '现', pinyin: 'xiàn', meaning: 'appear' },
  { char: '浓', pinyin: 'nóng', meaning: 'thick/dense' },
  { char: '淡', pinyin: 'dàn', meaning: 'light/faint' },
  { char: '整', pinyin: 'zhěng', meaning: 'whole/neat' },
  { char: '零', pinyin: 'líng', meaning: 'zero' },
];

const GRADE_4_WORDS: WordEntry[] = [
  { word: '诚实', pinyin: 'chéng shí', meaning: 'honest' },
  { word: '善良', pinyin: 'shàn liáng', meaning: 'kind' },
  { word: '坚强', pinyin: 'jiān qiáng', meaning: 'strong' },
  { word: '勇敢', pinyin: 'yǒng gǎn', meaning: 'brave' },
  { word: '谦虚', pinyin: 'qiān xū', meaning: 'modest' },
  { word: '骄傲', pinyin: 'jiāo ào', meaning: 'proud' },
  { word: '勤劳', pinyin: 'qín láo', meaning: 'hardworking' },
  { word: '懒惰', pinyin: 'lǎn duò', meaning: 'lazy' },
  { word: '热闹', pinyin: 'rè nao', meaning: 'lively' },
  { word: '安静', pinyin: 'ān jìng', meaning: 'quiet' },
  { word: '整齐', pinyin: 'zhěng qí', meaning: 'tidy' },
  { word: '凌乱', pinyin: 'líng luàn', meaning: 'messy' },
  { word: '危险', pinyin: 'wēi xiǎn', meaning: 'dangerous' },
  { word: '安全', pinyin: 'ān quán', meaning: 'safe' },
  { word: '仔细', pinyin: 'zǐ xì', meaning: 'careful' },
  { word: '马虎', pinyin: 'mǎ hu', meaning: 'careless' },
  { word: '宽阔', pinyin: 'kuān kuò', meaning: 'wide' },
  { word: '狭窄', pinyin: 'xiá zhǎi', meaning: 'narrow' },
  { word: '温暖', pinyin: 'wēn nuǎn', meaning: 'warm' },
  { word: '寒冷', pinyin: 'hán lěng', meaning: 'cold' },
  { word: '光明', pinyin: 'guāng míng', meaning: 'bright' },
  { word: '黑暗', pinyin: 'hēi àn', meaning: 'dark' },
  { word: '丰收', pinyin: 'fēng shōu', meaning: 'harvest' },
  { word: '荒凉', pinyin: 'huāng liáng', meaning: 'desolate' },
];

// ── Grade 5 (五年级) ────────────────────────────────────────────────────────
// Focus: proverbs, advanced vocabulary, literary expressions
const GRADE_5_CHARS: CharEntry[] = [
  { char: '观', pinyin: 'guān', meaning: 'observe' },
  { char: '察', pinyin: 'chá', meaning: 'examine' },
  { char: '实', pinyin: 'shí', meaning: 'real/solid' },
  { char: '验', pinyin: 'yàn', meaning: 'test' },
  { char: '记', pinyin: 'jì', meaning: 'remember' },
  { char: '录', pinyin: 'lù', meaning: 'record' },
  { char: '总', pinyin: 'zǒng', meaning: 'total/always' },
  { char: '结', pinyin: 'jié', meaning: 'knot/conclude' },
  { char: '印', pinyin: 'yìn', meaning: 'print/impress' },
  { char: '象', pinyin: 'xiàng', meaning: 'elephant/image' },
  { char: '受', pinyin: 'shòu', meaning: 'receive' },
  { char: '感', pinyin: 'gǎn', meaning: 'feel' },
  { char: '表', pinyin: 'biǎo', meaning: 'surface/express' },
  { char: '达', pinyin: 'dá', meaning: 'reach' },
  { char: '交', pinyin: 'jiāo', meaning: 'intersect/exchange' },
  { char: '流', pinyin: 'liú', meaning: 'flow' },
  { char: '精', pinyin: 'jīng', meaning: 'refined/spirit' },
  { char: '彩', pinyin: 'cǎi', meaning: 'color' },
  { char: '传', pinyin: 'chuán', meaning: 'transmit' },
  { char: '承', pinyin: 'chéng', meaning: 'inherit' },
  { char: '经', pinyin: 'jīng', meaning: 'classic' },
  { char: '典', pinyin: 'diǎn', meaning: 'model/classic' },
  { char: '修', pinyin: 'xiū', meaning: 'repair/cultivate' },
  { char: '养', pinyin: 'yǎng', meaning: 'raise' },
  { char: '品', pinyin: 'pǐn', meaning: 'product/character' },
  { char: '德', pinyin: 'dé', meaning: 'virtue' },
  { char: '才', pinyin: 'cái', meaning: 'talent' },
  { char: '华', pinyin: 'huá', meaning: 'splendid/China' },
  { char: '辉', pinyin: 'huī', meaning: 'radiance' },
  { char: '煌', pinyin: 'huáng', meaning: 'glorious' },
  { char: '壮', pinyin: 'zhuàng', meaning: 'strong' },
  { char: '丽', pinyin: 'lì', meaning: 'beautiful' },
];

const GRADE_5_WORDS: WordEntry[] = [
  { word: '观察', pinyin: 'guān chá', meaning: 'observe' },
  { word: '实验', pinyin: 'shí yàn', meaning: 'experiment' },
  { word: '记录', pinyin: 'jì lù', meaning: 'record' },
  { word: '总结', pinyin: 'zǒng jié', meaning: 'summarize' },
  { word: '印象', pinyin: 'yìn xiàng', meaning: 'impression' },
  { word: '感受', pinyin: 'gǎn shòu', meaning: 'feeling' },
  { word: '表达', pinyin: 'biǎo dá', meaning: 'express' },
  { word: '交流', pinyin: 'jiāo liú', meaning: 'communicate' },
  { word: '精神', pinyin: 'jīng shén', meaning: 'spirit' },
  { word: '品质', pinyin: 'pǐn zhì', meaning: 'character' },
  { word: '才华', pinyin: 'cái huá', meaning: 'talent' },
  { word: '传统', pinyin: 'chuán tǒng', meaning: 'tradition' },
  { word: '经典', pinyin: 'jīng diǎn', meaning: 'classic' },
  { word: '修养', pinyin: 'xiū yǎng', meaning: 'cultivation' },
  { word: '辉煌', pinyin: 'huī huáng', meaning: 'glorious' },
  { word: '壮观', pinyin: 'zhuàng guān', meaning: 'magnificent' },
  { word: '形容', pinyin: 'xíng róng', meaning: 'describe' },
  { word: '比喻', pinyin: 'bǐ yù', meaning: 'metaphor' },
  { word: '象征', pinyin: 'xiàng zhēng', meaning: 'symbolize' },
  { word: '含义', pinyin: 'hán yì', meaning: 'meaning' },
  { word: '体会', pinyin: 'tǐ huì', meaning: 'experience' },
  { word: '领悟', pinyin: 'lǐng wù', meaning: 'comprehend' },
];

// ── Grade 6 (六年级) ────────────────────────────────────────────────────────
// Focus: advanced vocabulary, classical references, literary devices
const GRADE_6_CHARS: CharEntry[] = [
  { char: '浩', pinyin: 'hào', meaning: 'vast' },
  { char: '瀚', pinyin: 'hàn', meaning: 'vast' },
  { char: '巍', pinyin: 'wēi', meaning: 'towering' },
  { char: '峨', pinyin: 'é', meaning: 'high' },
  { char: '苍', pinyin: 'cāng', meaning: 'dark green' },
  { char: '翠', pinyin: 'cuì', meaning: 'emerald' },
  { char: '颤', pinyin: 'chàn', meaning: 'tremble' },
  { char: '耀', pinyin: 'yào', meaning: 'dazzling' },
  { char: '斑', pinyin: 'bān', meaning: 'spot' },
  { char: '斓', pinyin: 'lán', meaning: 'gorgeous' },
  { char: '幽', pinyin: 'yōu', meaning: 'secluded' },
  { char: '雅', pinyin: 'yǎ', meaning: 'elegant' },
  { char: '悠', pinyin: 'yōu', meaning: 'leisurely' },
  { char: '然', pinyin: 'rán', meaning: 'correct/so' },
  { char: '依', pinyin: 'yī', meaning: 'rely on' },
  { char: '偎', pinyin: 'wēi', meaning: 'lean against' },
  { char: '翩', pinyin: 'piān', meaning: 'fluttering' },
  { char: '凝', pinyin: 'níng', meaning: 'condense' },
  { char: '滞', pinyin: 'zhì', meaning: 'stagnant' },
  { char: '湛', pinyin: 'zhàn', meaning: 'deep clear' },
  { char: '澈', pinyin: 'chè', meaning: 'clear' },
  { char: '肃', pinyin: 'sù', meaning: 'solemn' },
  { char: '穆', pinyin: 'mù', meaning: 'reverent' },
  { char: '隽', pinyin: 'juàn', meaning: 'meaningful' },
  { char: '永', pinyin: 'yǒng', meaning: 'forever' },
  { char: '恒', pinyin: 'héng', meaning: 'constant' },
  { char: '灼', pinyin: 'zhuó', meaning: 'burning' },
  { char: '绚', pinyin: 'xuàn', meaning: 'gorgeous' },
  { char: '瑰', pinyin: 'guī', meaning: 'rose/magnificent' },
  { char: '孤', pinyin: 'gū', meaning: 'lonely' },
  { char: '寂', pinyin: 'jì', meaning: 'lonely' },
];

const GRADE_6_WORDS: WordEntry[] = [
  { word: '浩瀚', pinyin: 'hào hàn', meaning: 'vast' },
  { word: '巍峨', pinyin: 'wēi é', meaning: 'towering' },
  { word: '苍翠', pinyin: 'cāng cuì', meaning: 'dark green' },
  { word: '斑斓', pinyin: 'bān lán', meaning: 'gorgeous' },
  { word: '幽雅', pinyin: 'yōu yǎ', meaning: 'elegant' },
  { word: '悠闲', pinyin: 'yōu xián', meaning: 'leisurely' },
  { word: '依偎', pinyin: 'yī wēi', meaning: 'lean against' },
  { word: '绚丽', pinyin: 'xuàn lì', meaning: 'gorgeous' },
  { word: '璀璨', pinyin: 'cuǐ càn', meaning: 'radiant' },
  { word: '清澈', pinyin: 'qīng chè', meaning: 'clear' },
  { word: '湛蓝', pinyin: 'zhàn lán', meaning: 'deep blue' },
  { word: '肃穆', pinyin: 'sù mù', meaning: 'solemn' },
  { word: '隽永', pinyin: 'juàn yǒng', meaning: 'meaningful' },
  { word: '璀璨', pinyin: 'cuǐ càn', meaning: 'radiant' },
  { word: '宏伟', pinyin: 'hóng wěi', meaning: 'grand' },
  { word: '磅礴', pinyin: 'páng bó', meaning: 'majestic' },
  { word: '瑰丽', pinyin: 'guī lì', meaning: 'magnificent' },
  { word: '孤独', pinyin: 'gū dú', meaning: 'lonely' },
  { word: '寂寞', pinyin: 'jì mò', meaning: 'lonely' },
  { word: '惆怅', pinyin: 'chóu chàng', meaning: 'melancholy' },
  { word: '坦然', pinyin: 'tǎn rán', meaning: 'calm' },
  { word: '释然', pinyin: 'shì rán', meaning: 'relieved' },
  { word: '芬芳', pinyin: 'fēn fāng', meaning: 'fragrant' },
];

// ── Idioms (成语) for grades 4+ ─────────────────────────────────────────────
interface IdiomEntry {
  idiom: string;
  pinyin: string;
  meaning: string;
  /** Index of the blank character (0-based) */
  blankIndex: number;
}

const IDIOM_ENTRIES: IdiomEntry[] = [
  { idiom: '一心一意', pinyin: 'yī xīn yī yì', meaning: 'wholehearted', blankIndex: 1 },
  { idiom: '三心二意', pinyin: 'sān xīn èr yì', meaning: 'half-hearted', blankIndex: 1 },
  { idiom: '画龙点睛', pinyin: 'huà lóng diǎn jīng', meaning: 'finishing touch', blankIndex: 2 },
  { idiom: '守株待兔', pinyin: 'shǒu zhū dài tù', meaning: 'wait idly', blankIndex: 1 },
  { idiom: '亡羊补牢', pinyin: 'wáng yáng bǔ láo', meaning: 'better late than never', blankIndex: 2 },
  { idiom: '叶公好龙', pinyin: 'yè gōng hào lóng', meaning: 'professed love', blankIndex: 2 },
  { idiom: '掩耳盗铃', pinyin: 'yǎn ěr dào líng', meaning: 'self-deception', blankIndex: 2 },
  { idiom: '狐假虎威', pinyin: 'hú jiǎ hǔ wēi', meaning: 'bully by proxy', blankIndex: 1 },
  { idiom: '刻舟求剑', pinyin: 'kè zhōu qiú jiàn', meaning: 'take measures without regard to changes', blankIndex: 2 },
  { idiom: '井底之蛙', pinyin: 'jǐng dǐ zhī wā', meaning: 'narrow-minded', blankIndex: 2 },
  { idiom: '对牛弹琴', pinyin: 'duì niú tán qín', meaning: 'cast pearls before swine', blankIndex: 2 },
  { idiom: '杞人忧天', pinyin: 'qǐ rén yōu tiān', meaning: 'unnecessary anxiety', blankIndex: 1 },
  { idiom: '揠苗助长', pinyin: 'yà miáo zhù zhǎng', meaning: 'spoil things by excessive enthusiasm', blankIndex: 1 },
  { idiom: '自相矛盾', pinyin: 'zì xiāng máo dùn', meaning: 'self-contradictory', blankIndex: 2 },
  { idiom: '一举两得', pinyin: 'yī jǔ liǎng dé', meaning: 'kill two birds with one stone', blankIndex: 1 },
  { idiom: '四面楚歌', pinyin: 'sì miàn chǔ gē', meaning: 'besieged', blankIndex: 1 },
  { idiom: '愚公移山', pinyin: 'yú gōng yí shān', meaning: 'perseverance', blankIndex: 2 },
  { idiom: '百发百中', pinyin: 'bǎi fā bǎi zhòng', meaning: 'every shot hits', blankIndex: 2 },
  { idiom: '风吹草动', pinyin: 'fēng chuī cǎo dòng', meaning: 'a sign of trouble', blankIndex: 2 },
  { idiom: '鹤立鸡群', pinyin: 'hè lì jī qún', meaning: 'stand out from the crowd', blankIndex: 2 },
  { idiom: '胸有成竹', pinyin: 'xiōng yǒu chéng zhú', meaning: 'have a well-thought-out plan', blankIndex: 3 },
  { idiom: '望梅止渴', pinyin: 'wàng méi zhǐ kě', meaning: 'console oneself with false hopes', blankIndex: 2 },
  { idiom: '卧薪尝胆', pinyin: 'wò xīn cháng dǎn', meaning: 'endure hardship to plan revenge', blankIndex: 2 },
  { idiom: '纸上谈兵', pinyin: 'zhǐ shàng tán bīng', meaning: 'armchair strategy', blankIndex: 2 },
  { idiom: '悬梁刺股', pinyin: 'xuán liáng cì gǔ', meaning: 'study diligently', blankIndex: 2 },
  { idiom: '闻鸡起舞', pinyin: 'wén jī qǐ wǔ', meaning: 'rise with vigor', blankIndex: 2 },
  { idiom: '指鹿为马', pinyin: 'zhǐ lù wéi mǎ', meaning: 'deliberately distort', blankIndex: 1 },
  { idiom: '不入虎穴，焉得虎子', pinyin: 'bù rù hǔ xué yān dé hǔ zǐ', meaning: 'no pain no gain', blankIndex: 2 },
  { idiom: '开天辟地', pinyin: 'kāi tiān pì dì', meaning: 'epoch-making', blankIndex: 2 },
  { idiom: '精卫填海', pinyin: 'jīng wèi tián hǎi', meaning: 'determination', blankIndex: 2 },
];

// ── Antonyms (反义词) for grades 4+ ─────────────────────────────────────────
interface AntonymEntry {
  word: string;
  pinyin: string;
  antonym: string;
  antonymPinyin: string;
}

const ANTONYM_ENTRIES: AntonymEntry[] = [
  { word: '大', pinyin: 'dà', antonym: '小', antonymPinyin: 'xiǎo' },
  { word: '高', pinyin: 'gāo', antonym: '矮', antonymPinyin: 'ǎi' },
  { word: '长', pinyin: 'cháng', antonym: '短', antonymPinyin: 'duǎn' },
  { word: '多', pinyin: 'duō', antonym: '少', antonymPinyin: 'shǎo' },
  { word: '好', pinyin: 'hǎo', antonym: '坏', antonymPinyin: 'huài' },
  { word: '美丽', pinyin: 'měi lì', antonym: '丑陋', antonymPinyin: 'chǒu lòu' },
  { word: '快乐', pinyin: 'kuài lè', antonym: '悲伤', antonymPinyin: 'bēi shāng' },
  { word: '勇敢', pinyin: 'yǒng gǎn', antonym: '胆小', antonymPinyin: 'dǎn xiǎo' },
  { word: '聪明', pinyin: 'cōng míng', antonym: '愚蠢', antonymPinyin: 'yú chǔn' },
  { word: '勤劳', pinyin: 'qín láo', antonym: '懒惰', antonymPinyin: 'lǎn duò' },
  { word: '热闹', pinyin: 'rè nao', antonym: '冷清', antonymPinyin: 'lěng qīng' },
  { word: '安全', pinyin: 'ān quán', antonym: '危险', antonymPinyin: 'wēi xiǎn' },
  { word: '温暖', pinyin: 'wēn nuǎn', antonym: '寒冷', antonymPinyin: 'hán lěng' },
  { word: '光明', pinyin: 'guāng míng', antonym: '黑暗', antonymPinyin: 'hēi àn' },
  { word: '仔细', pinyin: 'zǐ xì', antonym: '马虎', antonymPinyin: 'mǎ hu' },
  { word: '谦虚', pinyin: 'qiān xū', antonym: '骄傲', antonymPinyin: 'jiāo ào' },
  { word: '宽阔', pinyin: 'kuān kuò', antonym: '狭窄', antonymPinyin: 'xiá zhǎi' },
  { word: '整齐', pinyin: 'zhěng qí', antonym: '凌乱', antonymPinyin: 'líng luàn' },
  { word: '坚硬', pinyin: 'jiān yìng', antonym: '柔软', antonymPinyin: 'róu ruǎn' },
  { word: '上升', pinyin: 'shàng shēng', antonym: '下降', antonymPinyin: 'xià jiàng' },
  { word: '胜利', pinyin: 'shèng lì', antonym: '失败', antonymPinyin: 'shī bài' },
  { word: '喜欢', pinyin: 'xǐ huan', antonym: '讨厌', antonymPinyin: 'tǎo yàn' },
  { word: '简单', pinyin: 'jiǎn dān', antonym: '复杂', antonymPinyin: 'fù zá' },
  { word: '干净', pinyin: 'gān jìng', antonym: '肮脏', antonymPinyin: 'āng zāng' },
  { word: '诚实', pinyin: 'chéng shí', antonym: '撒谎', antonymPinyin: 'sā huǎng' },
  { word: '粗心', pinyin: 'cū xīn', antonym: '细心', antonymPinyin: 'xì xīn' },
  { word: '遥远', pinyin: 'yáo yuǎn', antonym: '附近', antonymPinyin: 'fù jìn' },
  { word: '迅速', pinyin: 'xùn sù', antonym: '缓慢', antonymPinyin: 'huǎn màn' },
  { word: '困难', pinyin: 'kùn nán', antonym: '容易', antonymPinyin: 'róng yì' },
];

// ── Synonyms (近义词) for grades 4+ ─────────────────────────────────────────
interface SynonymEntry {
  word: string;
  pinyin: string;
  synonym: string;
  synonymPinyin: string;
  /** Distractor options that are NOT synonyms */
  distractors: string[];
}

const SYNONYM_ENTRIES: SynonymEntry[] = [
  { word: '美丽', pinyin: 'měi lì', synonym: '漂亮', synonymPinyin: 'piào liang', distractors: ['丑陋', '凶猛', '马虎'] },
  { word: '快乐', pinyin: 'kuài lè', synonym: '高兴', synonymPinyin: 'gāo xìng', distractors: ['悲伤', '恐惧', '疲惫'] },
  { word: '勇敢', pinyin: 'yǒng gǎn', synonym: '无畏', synonymPinyin: 'wú wèi', distractors: ['胆小', '懒惰', '骄傲'] },
  { word: '聪明', pinyin: 'cōng míng', synonym: '智慧', synonymPinyin: 'zhì huì', distractors: ['愚蠢', '粗心', '马虎'] },
  { word: '温暖', pinyin: 'wēn nuǎn', synonym: '暖和', synonymPinyin: 'nuǎn huo', distractors: ['寒冷', '炎热', '潮湿'] },
  { word: '仔细', pinyin: 'zǐ xì', synonym: '认真', synonymPinyin: 'rèn zhēn', distractors: ['马虎', '懒惰', '粗心'] },
  { word: '喜欢', pinyin: 'xǐ huan', synonym: '喜爱', synonymPinyin: 'xǐ ài', distractors: ['讨厌', '害怕', '担心'] },
  { word: '安静', pinyin: 'ān jìng', synonym: '宁静', synonymPinyin: 'níng jìng', distractors: ['热闹', '嘈杂', '慌乱'] },
  { word: '帮助', pinyin: 'bāng zhù', synonym: '协助', synonymPinyin: 'xié zhù', distractors: ['破坏', '打扰', '拒绝'] },
  { word: '发现', pinyin: 'fā xiàn', synonym: '发觉', synonymPinyin: 'fā jué', distractors: ['隐藏', '丢失', '忽略'] },
  { word: '困难', pinyin: 'kùn nán', synonym: '艰难', synonymPinyin: 'jiān nán', distractors: ['容易', '简单', '轻松'] },
  { word: '坚固', pinyin: 'jiān gù', synonym: '牢固', synonymPinyin: 'láo gù', distractors: ['脆弱', '柔软', '松散'] },
  { word: '宽阔', pinyin: 'kuān kuò', synonym: '宽广', synonymPinyin: 'kuān guǎng', distractors: ['狭窄', '矮小', '拥挤'] },
  { word: '立刻', pinyin: 'lì kè', synonym: '马上', synonymPinyin: 'mǎ shàng', distractors: ['缓慢', '推迟', '犹豫'] },
  { word: '观看', pinyin: 'guān kàn', synonym: '欣赏', synonymPinyin: 'xīn shǎng', distractors: ['忽略', '逃避', '拒绝'] },
  { word: '感激', pinyin: 'gǎn jī', synonym: '感谢', synonymPinyin: 'gǎn xiè', distractors: ['抱怨', '讨厌', '忘记'] },
  { word: '著名', pinyin: 'zhù míng', synonym: '有名', synonymPinyin: 'yǒu míng', distractors: ['普通', '平凡', '默默'] },
  { word: '珍贵', pinyin: 'zhēn guì', synonym: '宝贵', synonymPinyin: 'bǎo guì', distractors: ['廉价', '普通', '常见'] },
];

// ── Poetry (古诗) for grades 5+ ─────────────────────────────────────────────
interface PoetryEntry {
  title: string;
  author: string;
  dynasty: string;
  /** Full line with ___ as blank */
  lineWithBlank: string;
  /** The correct character(s) to fill in */
  correctAnswer: string;
  /** Full complete line (for display) */
  fullLine: string;
}

const POETRY_ENTRIES: PoetryEntry[] = [
  {
    title: '静夜思',
    author: '李白',
    dynasty: '唐',
    lineWithBlank: '床前___光',
    correctAnswer: '明月',
    fullLine: '床前明月光',
  },
  {
    title: '静夜思',
    author: '李白',
    dynasty: '唐',
    lineWithBlank: '疑是地上___',
    correctAnswer: '霜',
    fullLine: '疑是地上霜',
  },
  {
    title: '春晓',
    author: '孟浩然',
    dynasty: '唐',
    lineWithBlank: '春眠不觉___',
    correctAnswer: '晓',
    fullLine: '春眠不觉晓',
  },
  {
    title: '春晓',
    author: '孟浩然',
    dynasty: '唐',
    lineWithBlank: '处处闻___鸟',
    correctAnswer: '啼',
    fullLine: '处处闻啼鸟',
  },
  {
    title: '登鹳雀楼',
    author: '王之涣',
    dynasty: '唐',
    lineWithBlank: '白日依山___',
    correctAnswer: '尽',
    fullLine: '白日依山尽',
  },
  {
    title: '登鹳雀楼',
    author: '王之涣',
    dynasty: '唐',
    lineWithBlank: '黄河入___流',
    correctAnswer: '海',
    fullLine: '黄河入海流',
  },
  {
    title: '悯农',
    author: '李绅',
    dynasty: '唐',
    lineWithBlank: '锄禾日当___',
    correctAnswer: '午',
    fullLine: '锄禾日当午',
  },
  {
    title: '悯农',
    author: '李绅',
    dynasty: '唐',
    lineWithBlank: '汗滴禾下___',
    correctAnswer: '土',
    fullLine: '汗滴禾下土',
  },
  {
    title: '望庐山瀑布',
    author: '李白',
    dynasty: '唐',
    lineWithBlank: '飞流直下三千___',
    correctAnswer: '尺',
    fullLine: '飞流直下三千尺',
  },
  {
    title: '望庐山瀑布',
    author: '李白',
    dynasty: '唐',
    lineWithBlank: '疑是银河落___天',
    correctAnswer: '九',
    fullLine: '疑是银河落九天',
  },
  {
    title: '咏鹅',
    author: '骆宾王',
    dynasty: '唐',
    lineWithBlank: '白毛浮绿水，红掌拨清___',
    correctAnswer: '波',
    fullLine: '白毛浮绿水，红掌拨清波',
  },
  {
    title: '绝句',
    author: '杜甫',
    dynasty: '唐',
    lineWithBlank: '两个黄鹂鸣翠___',
    correctAnswer: '柳',
    fullLine: '两个黄鹂鸣翠柳',
  },
  {
    title: '绝句',
    author: '杜甫',
    dynasty: '唐',
    lineWithBlank: '一行白鹭上青___',
    correctAnswer: '天',
    fullLine: '一行白鹭上青天',
  },
  {
    title: '江雪',
    author: '柳宗元',
    dynasty: '唐',
    lineWithBlank: '千山鸟飞___',
    correctAnswer: '绝',
    fullLine: '千山鸟飞绝',
  },
  {
    title: '江雪',
    author: '柳宗元',
    dynasty: '唐',
    lineWithBlank: '万径人踪___',
    correctAnswer: '灭',
    fullLine: '万径人踪灭',
  },
  {
    title: '游子吟',
    author: '孟郊',
    dynasty: '唐',
    lineWithBlank: '慈母手中___',
    correctAnswer: '线',
    fullLine: '慈母手中线',
  },
  {
    title: '游子吟',
    author: '孟郊',
    dynasty: '唐',
    lineWithBlank: '游子身上___',
    correctAnswer: '衣',
    fullLine: '游子身上衣',
  },
  {
    title: '小池',
    author: '杨万里',
    dynasty: '宋',
    lineWithBlank: '小荷才露尖尖___',
    correctAnswer: '角',
    fullLine: '小荷才露尖尖角',
  },
  {
    title: '所见',
    author: '袁枚',
    dynasty: '清',
    lineWithBlank: '意欲捕鸣___',
    correctAnswer: '蝉',
    fullLine: '意欲捕鸣蝉',
  },
  {
    title: '赠汪伦',
    author: '李白',
    dynasty: '唐',
    lineWithBlank: '桃花潭水深千___',
    correctAnswer: '尺',
    fullLine: '桃花潭水深千尺',
  },
];

// ── Proverbs (谚语) for grades 5+ ──────────────────────────────────────────
interface ProverbEntry {
  proverb: string;
  meaning: string;
  /** The first half / setup for fill-in */
  firstHalf: string;
  /** The correct second half */
  secondHalf: string;
}

const PROVERB_ENTRIES: ProverbEntry[] = [
  { proverb: '世上无难事，只怕有心人', meaning: 'where there is a will there is a way', firstHalf: '世上无难事', secondHalf: '只怕有心人' },
  { proverb: '失败乃成功之母', meaning: 'failure is the mother of success', firstHalf: '失败乃', secondHalf: '成功之母' },
  { proverb: '一年之计在于春，一日之计在于晨', meaning: 'plan ahead', firstHalf: '一年之计在于春', secondHalf: '一日之计在于晨' },
  { proverb: '书读百遍，其义自见', meaning: 'practice makes perfect for reading', firstHalf: '书读百遍', secondHalf: '其义自见' },
  { proverb: '一寸光阴一寸金，寸金难买寸光阴', meaning: 'time is precious', firstHalf: '一寸光阴一寸金', secondHalf: '寸金难买寸光阴' },
  { proverb: '路遥知马力，日久见人心', meaning: 'time reveals a person\'s heart', firstHalf: '路遥知马力', secondHalf: '日久见人心' },
  { proverb: '三个臭皮匠，顶个诸葛亮', meaning: 'two heads are better than one', firstHalf: '三个臭皮匠', secondHalf: '顶个诸葛亮' },
  { proverb: '千里之行，始于足下', meaning: 'a journey of a thousand miles begins with a single step', firstHalf: '千里之行', secondHalf: '始于足下' },
  { proverb: '不积跬步，无以至千里', meaning: 'little steps lead to great distances', firstHalf: '不积跬步', secondHalf: '无以至千里' },
  { proverb: '少壮不努力，老大徒伤悲', meaning: 'work hard while young', firstHalf: '少壮不努力', secondHalf: '老大徒伤悲' },
  { proverb: '学而不思则罔，思而不学则殆', meaning: 'learning without thinking is useless', firstHalf: '学而不思则罔', secondHalf: '思而不学则殆' },
  { proverb: '己所不欲，勿施于人', meaning: 'do not do to others what you wouldn\'t want done to you', firstHalf: '己所不欲', secondHalf: '勿施于人' },
];

// ── Sentence Fill (句子填空) for grades 3+ ──────────────────────────────────
interface SentenceFillEntry {
  sentence: string;
  correctAnswer: string;
  distractors: string[];
}

const SENTENCE_FILL_ENTRIES: Record<string, SentenceFillEntry[]> = {
  '3': [
    { sentence: '小明每天___学校上课。', correctAnswer: '去', distractors: '走/来/在'.split('/') },
    { sentence: '春天来了，公园里的花都___了。', correctAnswer: '开', distractors: '落/谢/长'.split('/') },
    { sentence: '妈妈给我买了一个新___。', correctAnswer: '书包', distractors: '铅笔/本子/玩具'.split('/') },
    { sentence: '小鸟在树上开心地___。', correctAnswer: '唱歌', distractors: '跳舞/睡觉/吃饭'.split('/') },
    { sentence: '老师让我们认真___课文。', correctAnswer: '朗读', distractors: '默写/抄写/背诵'.split('/') },
    { sentence: '我最___的水果是苹果。', correctAnswer: '喜欢', distractors: '讨厌/害怕/忘记'.split('/') },
    { sentence: '下雨了，同学们都打着___回家。', correctAnswer: '伞', distractors: '灯/扇/帽'.split('/') },
    { sentence: '爷爷每天早上都去公园___。', correctAnswer: '散步', distractors: '跑步/跳舞/睡觉'.split('/') },
    { sentence: '太阳___起来了，天亮了。', correctAnswer: '升', distractors: '落/下/出'.split('/') },
    { sentence: '我们班的同学都很___。', correctAnswer: '团结', distractors: '骄傲/懒惰'.split('/') },
    { sentence: '这道题很难，但我还是___出来了。', correctAnswer: '想', distractors: '猜/做/写'.split('/') },
    { sentence: '秋天到了，树叶渐渐___了。', correctAnswer: '黄', distractors: '绿/红/蓝'.split('/') },
    { sentence: '爸爸___我骑车要注意安全。', correctAnswer: '教', distractors: '让/帮/带'.split('/') },
    { sentence: '小红是一位___的好学生。', correctAnswer: '优秀', distractors: '调皮/懒惰'.split('/') },
    { sentence: '春天，小河里的冰都___了。', correctAnswer: '化', distractors: '结/冻/破'.split('/') },
  ],
  '4': [
    { sentence: '我们要___时间，努力学习。', correctAnswer: '珍惜', distractors: '浪费/忘记/利用'.split('/') },
    { sentence: '他___帮助别人，老师表扬了他。', correctAnswer: '经常', distractors: '偶尔/很少/从不'.split('/') },
    { sentence: '保护环境，人人有___。', correctAnswer: '责', distractors: '权/利/力'.split('/') },
    { sentence: '这道题的答案很___，我一下子就想到了。', correctAnswer: '简单', distractors: '困难/复杂/奇怪'.split('/') },
    { sentence: '我们不能___别人的劳动成果。', correctAnswer: '抄袭', distractors: '学习/参考/借鉴'.split('/') },
    { sentence: '他做事很___，从不马虎。', correctAnswer: '仔细', distractors: '粗心/随便/着急'.split('/') },
    { sentence: '比赛前，大家都很___。', correctAnswer: '紧张', distractors: '放松/开心/无聊'.split('/') },
    { sentence: '___的书读得越多，知识越丰富。', correctAnswer: '课外', distractors: '课内/课本/课堂'.split('/') },
    { sentence: '考试的时候一定要___读题。', correctAnswer: '认真', distractors: '快速/马虎/粗心'.split('/') },
    { sentence: '同学之间要互相___。', correctAnswer: '帮助', distractors: '嘲笑/欺负忽视'.split('/') },
    { sentence: '经过___的训练，他终于成功了。', correctAnswer: '长期', distractors: '短期/偶尔/轻松'.split('/') },
    { sentence: '教室里很___，大家都在自习。', correctAnswer: '安静', distractors: '热闹/嘈杂/混乱'.split('/') },
    { sentence: '小红___把借来的书还给了我。', correctAnswer: '主动', distractors: '被动/勉强/忘记'.split('/') },
    { sentence: '我们要做一个___的人。', correctAnswer: '诚实', distractors: '撒谎/骄傲'.split('/') },
    { sentence: '这道题比想象中___得多。', correctAnswer: '难', distractors: '容易/简单/无聊'.split('/') },
    { sentence: '___的风吹过，树叶沙沙作响。', correctAnswer: '一阵', distractors: '一丝/一场/一道'.split('/') },
  ],
  '5': [
    { sentence: '他___用自己的实际行动证明了一切。', correctAnswer: '用', distractors: '靠/拿/以'.split('/') },
    { sentence: '这篇文章的描写非常___，像一幅画。', correctAnswer: '生动', distractors: '平淡/枯燥/简单'.split('/') },
    { sentence: '我们应该___优秀的传统文化。', correctAnswer: '传承', distractors: '丢弃/忘记/忽略'.split('/') },
    { sentence: '面对困难，我们要有___的精神。', correctAnswer: '不屈不挠', distractors: '胆小怕事/优柔寡断'.split('/') },
    { sentence: '他的___让我十分佩服。', correctAnswer: '才华', distractors: '懒惰/骄傲/粗心'.split('/') },
    { sentence: '通过这次实验，我___到了很多知识。', correctAnswer: '领悟', distractors: '忘记/忽略/错过'.split('/') },
    { sentence: '老师的___让我受益匪浅。', correctAnswer: '教诲', distractors: '批评/忽略/指责'.split('/') },
    { sentence: '夕阳西下，天边的云彩十分___。', correctAnswer: '绚丽', distractors: '暗淡/单调/灰暗'.split('/') },
    { sentence: '他___地表达了自己的观点。', correctAnswer: '清晰', distractors: '模糊/混乱/啰嗦'.split('/') },
    { sentence: '这篇文章的___手法很高明。', correctAnswer: '修辞', distractors: '语法/逻辑/标点'.split('/') },
    { sentence: '博物馆里陈列着许多___的文物。', correctAnswer: '珍贵', distractors: '普通/廉价/常见'.split('/') },
    { sentence: '我们必须___地完成这项任务。', correctAnswer: '认真', distractors: '马虎/敷衍/随便'.split('/') },
    { sentence: '大海___无边，令人心生敬畏。', correctAnswer: '浩瀚', distractors: '狭窄/浅薄/平静'.split('/') },
    { sentence: '他对科学的___精神值得学习。', correctAnswer: '探索', distractors: '放弃/忽略/逃避'.split('/') },
    { sentence: '这篇作文的___十分优美。', correctAnswer: '语言', distractors: '标点/格式/字迹'.split('/') },
  ],
  '6': [
    { sentence: '这位英雄的___精神永远激励着我们。', correctAnswer: '不屈不挠', distractors: '优柔寡断/胆小怕事'.split('/') },
    { sentence: '面对___的命运，他选择了坚持。', correctAnswer: '坎坷', distractors: '平坦/顺利/简单'.split('/') },
    { sentence: '这首诗的意境___，令人回味无穷。', correctAnswer: '深远', distractors: '浅薄/简单/枯燥'.split('/') },
    { sentence: '他___地面对困难，从不退缩。', correctAnswer: '坦然', distractors: '害怕/逃避/慌张'.split('/') },
    { sentence: '___的星空下，我们围着篝火讲故事。', correctAnswer: '璀璨', distractors: '暗淡/灰暗/单调'.split('/') },
    { sentence: '母亲的___让我释然了。', correctAnswer: '安慰', distractors: '批评/指责/嘲笑'.split('/') },
    { sentence: '他经过反复___，终于找到了答案。', correctAnswer: '思考', distractors: '猜测/放弃/忽略'.split('/') },
    { sentence: '这份___的友谊持续了三十年。', correctAnswer: '珍贵', distractors: '普通/虚假/短暂'.split('/') },
    { sentence: '老舍先生的语言风格___而幽默。', correctAnswer: '朴实', distractors: '华丽/空洞/做作'.split('/') },
    { sentence: '我们必须___地面对自己的错误。', correctAnswer: '坦然', distractors: '逃避/否认掩饰'.split('/') },
    { sentence: '这座古桥的建筑风格十分___。', correctAnswer: '独特', distractors: '普通/常见/平淡'.split('/') },
    { sentence: '他___的性格赢得了大家的尊重。', correctAnswer: '正直', distractors: '狡猾/懦弱'.split('/') },
    { sentence: '夕阳余晖洒在___的水面上。', correctAnswer: '清澈', distractors: '浑浊/汹涌/平静'.split('/') },
    { sentence: '这个故事___地反映了社会现实。 correctAnswer: '深刻', distractors: '肤浅/平淡/无聊'.split('/') },
  ],
};

// ── Sentence Rearrange (句子排列) for grades 5+ ───────────────────────────
interface SentenceRearrangeEntry {
  words: string[];
  correctAnswer: string;
  distractors: string[];
}

const SENTENCE_REARRANGE_ENTRIES: SentenceRearrangeEntry[] = [
  { words: ['春天', '到了', '花儿', '开了', '。'], correctAnswer: '春天到了，花儿开了。', distractors: ['花儿开了，春天到了。', '到了春天，花儿开了。'] },
  { words: ['我', '是', '一名', '小学', '生', '。'], correctAnswer: '我是一名小学生。', distractors: ['一名我是小学生。', '我是小学生一名。'] },
  { words: ['妈妈', '做的', '饭菜', '真', '好吃', '！'], correctAnswer: '妈妈做的饭菜真好吃！', distractors: ['做的饭菜妈妈真好吃！', '饭菜做的真好吃妈妈！'] },
  { words: ['我们', '应该', '保护', '环境', '。'], correctAnswer: '我们应该保护环境。', distractors: ['保护我们应该环境。', '环境我们应该保护。'] },
  { words: ['昨天', '下午', '我', '去', '了', '图书馆', '。'], correctAnswer: '昨天下午我去了图书馆。', distractors: ['我昨天下午去了图书馆。', '下午我昨天去了图书馆。'] },
  { words: ['他', '每天', '早上', '都', '跑步', '。'], correctAnswer: '他每天早上都跑步。', distractors: ['每天他早上都跑步。', '早上他每天跑步。'] },
  { words: ['这道', '数学题', '其实', '并不', '难', '。'], correctAnswer: '这道数学题其实并不难。', distractors: ['数学题这道并不难。', '其实这道题并不难。'] },
  { words: ['老师', '耐心地', '解答了', '我们的', '问题', '。'], correctAnswer: '老师耐心地解答了我们的问题。', distractors: ['耐心地老师解答了问题。', '解答了老师耐心地问题。'] },
  { words: ['秋天', '的', '校园', '里', '落叶', '纷飞', '。'], correctAnswer: '秋天的校园里落叶纷飞。', distractors: ['校园里的秋天落叶纷飞。', '秋天校园里落叶纷飞。'] },
  { words: ['经过', '努力', '他', '终于', '成功', '了', '。'], correctAnswer: '经过努力他终于成功了。', distractors: ['他经过努力终于成功了。', '努力他终于成功了。'] },
  { words: ['阅读', '可以', '让我们', '打开', '视野', '。'], correctAnswer: '阅读可以让我们打开视野。', distractors: ['让我们阅读可以打开视野。', '可以让我们阅读打开视野。'] },
  { words: ['这本书', '告诉', '我们', '许多', '道理', '。'], correctAnswer: '这本书告诉我们许多道理。', distractors: ['我们这本书告诉许多道理。', '告诉我们这本书许多道理。'] },
  { words: ['科学', '是', '一把', '打开', '未知', '的', '钥匙', '。'], correctAnswer: '科学是一把打开未知的钥匙。', distractors: ['一把科学是打开未知的钥匙。', '打开未知科学是一把钥匙。'] },
  { words: ['风雨', '过后', '天空', '出现', '了', '彩虹', '。'], correctAnswer: '风雨过后天空出现了彩虹。', distractors: ['天空风雨过后出现彩虹。', '过后天空出现彩虹了。'] },
  { words: ['她', '用', '自己', '的', '行动', '证明', '了', '一切', '。'], correctAnswer: '她用自己的行动证明了一切。', distractors: ['用自己的行动她证明了一切。', '她用行动证明了一切。'] },
  { words: ['这篇', '文章', '描写', '得', '非常', '生动', '。'], correctAnswer: '这篇文章描写得非常生动。', distractors: ['文章描写得非常生动。', '描写这篇文章非常生动。'] },
];

// ── Reading Comprehension (阅读理解) for grades 5+ ───────────────────────────
interface ReadingCompEntry {
  passage: string;
  question: string;
  correctAnswer: string;
  distractors: string[];
}

const READING_COMP_ENTRIES: ReadingCompEntry[] = [
  {
    passage: '蚂蚁们搬运食物时，如果遇到一条河，它们会互相抱在一起变成一个球滚过去。',
    question: '蚂蚁过河时会变成什么形状？',
    correctAnswer: '球',
    distractors: ['方形', '三角形', '长条形'],
  },
  {
    passage: '小猫看见河边有一条鱼，它伸出手去抓，结果扑了个空。',
    question: '小猫抓到鱼了吗？',
    correctAnswer: '没有',
    distractors: ['抓到了', '抓了一条', '抓了很多'],
  },
  {
    passage: '公鸡每天天亮前就会打鸣，提醒人们该起床了。',
    question: '公鸡在什么时候打鸣？',
    correctAnswer: '天亮前',
    distractors: ['中午', '半夜', '傍晚'],
  },
  {
    passage: '乌鸦口渴了，到处找水喝。它看到一个瓶子里有水，但瓶口太小，喝不到。',
    question: '乌鸦为什么喝不到瓶子里的水？',
    correctAnswer: '瓶口太小',
    distractors: ['水太少', '瓶子太高', '水太脏'],
  },
  {
    passage: '春蚕到死丝方尽，蜡炬成灰泪始干。',
    question: '这首诗表达了什么情感？',
    correctAnswer: '无私奉献',
    distractors: ['悲伤痛苦', '欢快喜悦', '思念家乡'],
  },
  {
    passage: '月光透过竹林洒在地上，像铺了一层银霜。',
    question: '月光像什么？',
    correctAnswer: '银霜',
    distractors: ['金子', '白雪', '宝石'],
  },
  {
    passage: '青蛙坐井观天，以为天只有井口那么大。',
    question: '"坐井观天"比喻什么？',
    correctAnswer: '目光短浅',
    distractors: ['眼高手低', '聪明伶俐', '活泼可爱'],
  },
  {
    passage: '滴水穿石，不是力量大，而是功夫深。',
    question: '"滴水穿石"告诉我们要坚持什么？',
    correctAnswer: '持之以恒',
    distractors: ['半途而废', '急于求成', '三天打鱼两天晒网'],
  },
  {
    passage: '三个人行，必有我师焉。择其善者而从之，其不善者而改之。',
    question: '这句话告诉我们要怎么做？',
    correctAnswer: '学习别人长处',
    distractors: ['只看自己', '不听别人', '独自学习'],
  },
  {
    passage: '老吾老以及人之老，幼吾幼以及人之幼。',
    question: '这句话体现了什么思想？',
    correctAnswer: '尊老爱幼',
    distractors: ['勤俭节约', '团结友爱', '诚实守信'],
  },
  {
    passage: '一寸光阴一寸金，寸金难买寸光阴。',
    question: '这句话告诉我们要珍惜什么？',
    correctAnswer: '时间',
    distractors: ['金钱', '健康', '友谊'],
  },
  {
    passage: '读书破万卷，下笔如有神。',
    question: '这句话强调了什么的重要性？',
    correctAnswer: '多读书',
    distractors: ['多写字', '多运动', '多睡觉'],
  },
];

// ── Similar Character Groups (for smart distractors) ───────────────────────
interface SimilarGroup {
  chars: string[];
  reason: 'appearance' | 'pinyin';
}

const SIMILAR_CHAR_GROUPS: SimilarGroup[] = [
  // Visually similar characters (same radicals, minor stroke differences)
  { chars: ['已', '己', '巳'], reason: 'appearance' },
  { chars: ['未', '末'], reason: 'appearance' },
  { chars: ['人', '入', '八'], reason: 'appearance' },
  { chars: ['大', '太', '犬'], reason: 'appearance' },
  { chars: ['土', '士', '工'], reason: 'appearance' },
  { chars: ['日', '曰', '白'], reason: 'appearance' },
  { chars: ['木', '本', '末', '未'], reason: 'appearance' },
  { chars: ['天', '夫', '无'], reason: 'appearance' },
  { chars: ['目', '自', '白'], reason: 'appearance' },
  { chars: ['田', '由', '甲', '申'], reason: 'appearance' },
  { chars: ['贝', '见', '页'], reason: 'appearance' },
  { chars: ['了', '子', '孑'], reason: 'appearance' },
  { chars: ['刀', '力', '万'], reason: 'appearance' },
  { chars: ['千', '干', '于'], reason: 'appearance' },
  { chars: ['手', '毛', '才'], reason: 'appearance' },
  { chars: ['水', '冰', '永'], reason: 'appearance' },
  { chars: ['火', '灭', '炎'], reason: 'appearance' },
  { chars: ['石', '右', '古'], reason: 'appearance' },
  { chars: ['云', '去', '会'], reason: 'appearance' },
  { chars: ['中', '串', '虫'], reason: 'appearance' },
  { chars: ['月', '用', '同'], reason: 'appearance' },
  { chars: ['山', '出', '击'], reason: 'appearance' },
  { chars: ['厂', '广', '床'], reason: 'appearance' },
  { chars: ['鸟', '乌', '岛'], reason: 'appearance' },
  { chars: ['马', '鸟', '乌'], reason: 'appearance' },
  { chars: ['风', '凤', '凡'], reason: 'appearance' },
  { chars: ['足', '是', '走'], reason: 'appearance' },
  // Similar pronunciation
  { chars: ['四', '十', '是', '事'], reason: 'pinyin' },
  { chars: ['石', '时', '是', '师'], reason: 'pinyin' },
  { chars: ['主', '猪', '珠', '住'], reason: 'pinyin' },
  { chars: ['青', '清', '请', '情'], reason: 'pinyin' },
  { chars: ['马', '妈', '吗', '码'], reason: 'pinyin' },
  { chars: ['方', '房', '放', '防'], reason: 'pinyin' },
  { chars: ['长', '常', '场', '厂'], reason: 'pinyin' },
  { chars: ['力', '立', '里', '理'], reason: 'pinyin' },
  { chars: ['白', '百', '柏', '拍'], reason: 'pinyin' },
  { chars: ['有', '友', '又', '右'], reason: 'pinyin' },
  { chars: ['东', '冬', '懂', '动'], reason: 'pinyin' },
  { chars: ['见', '建', '件', '间'], reason: 'pinyin' },
  { chars: ['林', '临', '邻', '灵'], reason: 'pinyin' },
  { chars: ['门', '们', '问', '闻'], reason: 'pinyin' },
  { chars: ['色', '山', '三', '伞'], reason: 'pinyin' },
  { chars: ['中', '钟', '种', '重'], reason: 'pinyin' },
  { chars: ['树', '书', '叔', '数'], reason: 'pinyin' },
  { chars: ['花', '化', '话', '画'], reason: 'pinyin' },
  { chars: ['河', '和', '合', '黑'], reason: 'pinyin' },
];

// ── Grade-indexed Collections ────────────────────────────────────────────────

const GRADED_CHARS: Record<ChineseGrade, CharEntry[]> = {
  1: GRADE_1_CHARS,
  2: GRADE_2_CHARS,
  3: GRADE_3_CHARS,
  4: GRADE_4_CHARS,
  5: GRADE_5_CHARS,
  6: GRADE_6_CHARS,
};

const GRADED_WORDS: Record<ChineseGrade, WordEntry[]> = {
  1: GRADE_1_WORDS,
  2: GRADE_2_WORDS,
  3: GRADE_3_WORDS,
  4: GRADE_4_WORDS,
  5: GRADE_5_WORDS,
  6: GRADE_6_WORDS,
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

function pickNRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

/** Get all chars from a specific grade */
function getCharsForGrade(grade: ChineseGrade): CharEntry[] {
  return GRADED_CHARS[grade] ?? [];
}

/** Get all chars from grades 1..max */
function getCharsUpToGrade(maxGrade: ChineseGrade): CharEntry[] {
  const result: CharEntry[] = [];
  for (let g = 1; g <= maxGrade; g++) {
    result.push(...GRADED_CHARS[g as ChineseGrade]);
  }
  return result;
}

/** Get all words from a specific grade */
function getWordsForGrade(grade: ChineseGrade): WordEntry[] {
  return GRADED_WORDS[grade] ?? [];
}

/** Get all words from grades 1..max */
function getWordsUpToGrade(maxGrade: ChineseGrade): WordEntry[] {
  const result: WordEntry[] = [];
  for (let g = 1; g <= maxGrade; g++) {
    result.push(...GRADED_WORDS[g as ChineseGrade]);
  }
  return result;
}

/** Build a lookup from char → CharEntry for all grades */
function buildCharLookup(): Map<string, CharEntry> {
  const map = new Map<string, CharEntry>();
  for (let g = 1; g <= 6; g++) {
    for (const entry of GRADED_CHARS[g as ChineseGrade]) {
      if (!map.has(entry.char)) {
        map.set(entry.char, entry);
      }
    }
  }
  return map;
}

// ─── Smart Distractor Generation ────────────────────────────────────────────

/**
 * Get smart distractors for a given correct character.
 * Priority order:
 * 1. Visually similar characters from similar groups
 * 2. Characters with similar pronunciation from similar groups
 * 3. Same-grade characters
 * 4. Adjacent grade characters
 */
function getSmartCharDistractors(
  correct: string,
  grade: ChineseGrade,
  count: number = 3
): string[] {
  const result: string[] = [];
  const allCharsUpToGrade = getCharsUpToGrade(grade);
  const sameGradeChars = getCharsForGrade(grade);
  const correctPinyin = (() => {
    const entry = allCharsUpToGrade.find((c) => c.char === correct);
    return entry?.pinyin ?? '';
  })();

  // 1. Find visually or phonetically similar characters
  const similarPool: string[] = [];
  for (const group of SIMILAR_CHAR_GROUPS) {
    if (group.chars.includes(correct)) {
      for (const c of group.chars) {
        if (c !== correct && !similarPool.includes(c)) {
          similarPool.push(c);
        }
      }
    }
  }

  // Also check pinyin similarity (same initial or same final)
  if (correctPinyin) {
    const initial = correctPinyin[0];
    for (const entry of allCharsUpToGrade) {
      if (entry.char !== correct && entry.pinyin.startsWith(initial) && !similarPool.includes(entry.char)) {
        similarPool.push(entry.char);
      }
    }
  }

  // Priority fill from similar pool
  const shuffledSimilar = shuffle(similarPool);
  for (const c of shuffledSimilar) {
    if (result.length >= count) break;
    result.push(c);
  }

  // 2. Fill remaining from same grade
  if (result.length < count) {
    const sameGradePool = sameGradeChars
      .map((c) => c.char)
      .filter((c) => c !== correct && !result.includes(c));
    const shuffledSame = shuffle(sameGradePool);
    for (const c of shuffledSame) {
      if (result.length >= count) break;
      result.push(c);
    }
  }

  // 3. Fill remaining from adjacent grades
  if (result.length < count) {
    const adjacentGrades: ChineseGrade[] = [];
    if (grade > 1) adjacentGrades.push((grade - 1) as ChineseGrade);
    if (grade < 6) adjacentGrades.push((grade + 1) as ChineseGrade);
    for (const ag of adjacentGrades) {
      if (result.length >= count) break;
      const pool = getCharsForGrade(ag)
        .map((c) => c.char)
        .filter((c) => c !== correct && !result.includes(c));
      const shuffled = shuffle(pool);
      for (const c of shuffled) {
        if (result.length >= count) break;
        result.push(c);
      }
    }
  }

  // 4. Fill from all grades if still not enough
  if (result.length < count) {
    const allPool = allCharsUpToGrade
      .map((c) => c.char)
      .filter((c) => c !== correct && !result.includes(c));
    const shuffled = shuffle(allPool);
    for (const c of shuffled) {
      if (result.length >= count) break;
      result.push(c);
    }
  }

  return result.slice(0, count);
}

/**
 * Get smart distractors for a word (string).
 * Uses words from same grade first, then adjacent grades.
 */
function getSmartWordDistractors(
  correct: string,
  grade: ChineseGrade,
  count: number = 3
): string[] {
  const result: string[] = [];

  // Same grade words
  const sameGradePool = getWordsForGrade(grade)
    .map((w) => w.word)
    .filter((w) => w !== correct);
  const shuffledSame = shuffle(sameGradePool);
  for (const w of shuffledSame) {
    if (result.length >= count) break;
    result.push(w);
  }

  // Adjacent grades if needed
  if (result.length < count) {
    const adjacentGrades: ChineseGrade[] = [];
    if (grade > 1) adjacentGrades.push((grade - 1) as ChineseGrade);
    if (grade < 6) adjacentGrades.push((grade + 1) as ChineseGrade);
    for (const ag of adjacentGrades) {
      if (result.length >= count) break;
      const pool = getWordsForGrade(ag)
        .map((w) => w.word)
        .filter((w) => w !== correct && !result.includes(w));
      const shuffled = shuffle(pool);
      for (const w of shuffled) {
        if (result.length >= count) break;
        result.push(w);
      }
    }
  }

  // All grades if needed
  if (result.length < count) {
    const allPool = getWordsUpToGrade(grade)
      .map((w) => w.word)
      .filter((w) => w !== correct && !result.includes(w));
    const shuffled = shuffle(allPool);
    for (const w of shuffled) {
      if (result.length >= count) break;
      result.push(w);
    }
  }

  return result.slice(0, count);
}

/**
 * Get smart distractors for pinyin.
 * Similar approach: same-grade first, similar pronunciation next.
 */
function getSmartPinyinDistractors(
  correct: string,
  grade: ChineseGrade,
  count: number = 3
): string[] {
  const allChars = getCharsUpToGrade(grade);
  const sameGradeChars = getCharsForGrade(grade);
  const result: string[] = [];

  // Find similar pinyin (same initial, same final, same tone)
  const similarPinyin: string[] = [];
  if (correct) {
    const initial = correct[0];
    // Same initial
    for (const c of allChars) {
      if (c.pinyin !== correct && c.pinyin.startsWith(initial) && !similarPinyin.includes(c.pinyin)) {
        similarPinyin.push(c.pinyin);
      }
    }
    // Same tone number
    const toneMatch = correct.match(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/);
    if (toneMatch) {
      for (const c of allChars) {
        if (c.pinyin !== correct && c.pinyin.includes(toneMatch[0]) && !similarPinyin.includes(c.pinyin)) {
          similarPinyin.push(c.pinyin);
        }
      }
    }
  }

  // Fill from similar pinyin
  const shuffledSimilar = shuffle(similarPinyin);
  for (const p of shuffledSimilar) {
    if (result.length >= count) break;
    result.push(p);
  }

  // Fill from same grade
  if (result.length < count) {
    const samePool = sameGradeChars
      .map((c) => c.pinyin)
      .filter((p) => p !== correct && !result.includes(p));
    const shuffled = shuffle(samePool);
    for (const p of shuffled) {
      if (result.length >= count) break;
      result.push(p);
    }
  }

  // Fill from all
  if (result.length < count) {
    const allPool = allChars
      .map((c) => c.pinyin)
      .filter((p) => p !== correct && !result.includes(p));
    const shuffled = shuffle(allPool);
    for (const p of shuffled) {
      if (result.length >= count) break;
      result.push(p);
    }
  }

  return result.slice(0, count);
}

// ─── Question Generators ────────────────────────────────────────────────────

function generateRecognizeCharQuestion(grade: ChineseGrade): ChineseQuestion {
  const chars = getCharsForGrade(grade);
  const correct = pickRandom(chars);
  const distractors = getSmartCharDistractors(correct.char, grade, 3);
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
  const chars = getCharsForGrade(grade);
  const correct = pickRandom(chars);
  const distractors = getSmartPinyinDistractors(correct.pinyin, grade, 3);
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
  const words = getWordsForGrade(grade);
  const correct = pickRandom(words);
  const distractors = getSmartWordDistractors(correct.word, grade, 3);
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
  const chars = getCharsForGrade(grade);
  const correct = pickRandom(chars);
  const distractors = getSmartCharDistractors(correct.char, grade, 3);
  const options = shuffle([correct.char, ...distractors]);

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

function generateIdiomFillQuestion(grade: ChineseGrade): ChineseQuestion {
  const entry = pickRandom(IDIOM_ENTRIES);
  const blankChar = entry.idiom[entry.blankIndex];

  // Collect all chars from grades up to the current one for distractor pool
  const charPool = getCharsUpToGrade(grade).map((c) => c.char);
  // Also add all idiom chars as distractor pool (they're plausible)
  const idiomChars: string[] = [];
  for (const idiom of IDIOM_ENTRIES) {
    for (const ch of idiom.idiom) {
      if (!idiomChars.includes(ch)) idiomChars.push(ch);
    }
  }
  const combinedPool = [...new Set([...charPool, ...idiomChars])];

  // Also try similar chars
  const similarDistractors = getSmartCharDistractors(blankChar, grade, 2);
  const allDistractors = [...new Set([...similarDistractors])];

  // Fill remaining from combined pool
  const pool = combinedPool.filter((c) => c !== blankChar && !allDistractors.includes(c));
  const shuffledPool = shuffle(pool);
  for (const c of shuffledPool) {
    if (allDistractors.length >= 3) break;
    allDistractors.push(c);
  }

  const distractors = allDistractors.slice(0, 3);
  const options = shuffle([blankChar, ...distractors]);

  // Build the prompt with blank indicator
  const promptArray = entry.idiom.split('');
  promptArray[entry.blankIndex] = '___';
  const promptStr = promptArray.join('');

  return {
    id: genChineseId(),
    mode: 'idiom-fill',
    prompt: `「${promptStr}」\n（${entry.meaning}）`,
    correctAnswer: blankChar,
    correctIndex: options.indexOf(blankChar),
    options,
    grade,
  };
}

function generateAntonymQuestion(grade: ChineseGrade): ChineseQuestion {
  const entry = pickRandom(ANTONYM_ENTRIES);
  const correctAnswer = entry.antonym;

  // Collect distractor words from antonym values that are NOT the correct answer
  const distractorPool = ANTONYM_ENTRIES
    .map((e) => e.antonym)
    .filter((w) => w !== correctAnswer);

  // Also add the original words as distractors
  const originalPool = ANTONYM_ENTRIES
    .map((e) => e.word)
    .filter((w) => w !== entry.word && w !== correctAnswer);

  const combinedDistractors = shuffle([...new Set([...distractorPool, ...originalPool])]).slice(0, 3);
  const options = shuffle([correctAnswer, ...combinedDistractors]);

  return {
    id: genChineseId(),
    mode: 'antonym',
    prompt: `「${entry.word}」的反义词是？`,
    correctAnswer,
    correctIndex: options.indexOf(correctAnswer),
    options,
    grade,
  };
}

function generatePoetryFillQuestion(grade: ChineseGrade): ChineseQuestion {
  const entry = pickRandom(POETRY_ENTRIES);
  const correctAnswer = entry.correctAnswer;

  // Collect distractors from other poetry answers and idiom characters
  const otherAnswers = POETRY_ENTRIES
    .map((e) => e.correctAnswer)
    .filter((a) => a !== correctAnswer);

  // Also use char pool
  const charPool = getCharsUpToGrade(grade).map((c) => c.char);
  const combined = [...new Set([...otherAnswers, ...charPool])].filter((c) => c !== correctAnswer);

  // If correct answer is multi-char, make sure distractors are also multi-char (or single char if answer is single)
  let distractors: string[];
  if (correctAnswer.length === 1) {
    // Filter to single-char options
    const singleCharPool = combined.filter((c) => c.length === 1);
    distractors = shuffle(singleCharPool).slice(0, 3);
    // If not enough single char, use some multi-char broken into first char
    if (distractors.length < 3) {
      for (const c of shuffle(combined)) {
        if (distractors.length >= 3) break;
        const firstChar = c[0];
        if (firstChar && !distractors.includes(firstChar) && firstChar !== correctAnswer) {
          distractors.push(firstChar);
        }
      }
    }
  } else {
    // Filter to multi-char options (same length)
    const sameLenPool = combined.filter((c) => c.length === correctAnswer.length);
    distractors = shuffle(sameLenPool).slice(0, 3);
    // If not enough same length, pad
    if (distractors.length < 3) {
      for (const c of shuffle(combined)) {
        if (distractors.length >= 3) break;
        if (!distractors.includes(c)) {
          distractors.push(c);
        }
      }
    }
  }

  distractors = distractors.slice(0, 3);
  const options = shuffle([correctAnswer, ...distractors]);

  return {
    id: genChineseId(),
    mode: 'poetry-fill',
    prompt: `《${entry.title}》(${entry.dynasty}·${entry.author})\n${entry.lineWithBlank}`,
    correctAnswer,
    correctIndex: options.indexOf(correctAnswer),
    options,
    grade,
  };
}

function generateSynonymQuestion(grade: ChineseGrade): ChineseQuestion {
  const entry = pickRandom(SYNONYM_ENTRIES);
  const correctAnswer = entry.synonym;

  // Use the provided distractors + some extra from the synonym pool
  const extraPool = SYNONYM_ENTRIES
    .map((e) => e.synonym)
    .filter((s) => s !== correctAnswer && !entry.distractors.includes(s));

  const combined = [...entry.distractors, ...shuffle(extraPool)];
  const distractors = combined.slice(0, 3);
  const options = shuffle([correctAnswer, ...distractors]);

  return {
    id: genChineseId(),
    mode: 'synonym',
    prompt: `「${entry.word}」的近义词是？`,
    correctAnswer,
    correctIndex: options.indexOf(correctAnswer),
    options,
    grade,
  };
}

// ─── Mode Availability Check ────────────────────────────────────────────────

/**
 * Check if a mode is available for a given grade.
 * Falls back to an available mode if the requested mode isn't supported.
 */
export function getAvailableMode(mode: ChineseMode, grade: ChineseGrade): ChineseMode {
  const config = MODE_CONFIG[mode];
  if (config && grade >= config.minGrade) {
    return mode;
  }
  // Fall back to the first available mode for this grade
  const available = getModesForGrade(grade);
  return available.length > 0 ? available[0].mode : 'recognize-char';
}

// ─── Main Generator ─────────────────────────────────────────────────────────

/**
 * Generate an array of Chinese practice questions.
 *
 * @param mode - The practice mode
 * @param grade - 1 through 6
 * @param count - Number of questions to generate (default 10)
 * @returns Array of ChineseQuestion objects
 */
export function generateChineseQuestions(
  mode: ChineseMode,
  grade: ChineseGrade,
  count: number = 10
): ChineseQuestion[] {
  // Resolve to an available mode if needed
  const resolvedMode = getAvailableMode(mode, grade);
  const questions: ChineseQuestion[] = [];

  for (let i = 0; i < count; i++) {
    let question: ChineseQuestion;
    switch (resolvedMode) {
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
      case 'idiom-fill':
        question = generateIdiomFillQuestion(grade);
        break;
      case 'antonym':
        question = generateAntonymQuestion(grade);
        break;
      case 'poetry-fill':
        question = generatePoetryFillQuestion(grade);
        break;
      case 'synonym':
        question = generateSynonymQuestion(grade);
        break;
      default:
        question = generateRecognizeCharQuestion(grade);
    }
    // Override mode to the resolved mode so the question is consistent
    question = { ...question, mode: resolvedMode };
    questions.push(question);
  }

  return questions;
}
