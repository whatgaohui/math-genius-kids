// ═══════════════════════════════════════════════════════════════════════════════
// Chinese Question Bank — Generators (语文题库生成器)
// ─────────────────────────────────────────────────────────────────────────────
// Contains databases and generator functions for dynamically creating Chinese
// questions from character/word/idiom/poetry databases.
//
// All content is aligned with 人教版 (PEP) curriculum for grades 1-6.
// ═══════════════════════════════════════════════════════════════════════════════

import type { ChineseQuestion, ChineseMode, Grade, Semester } from '../types';
import type { ChineseQuestionData } from './template';

// ─── Internal Types ──────────────────────────────────────────────────────────

interface CharEntry {
  char: string;
  pinyin: string;
  meaning: string;
  semester: Semester | 'both';
}

interface WordEntry {
  word: string;
  pinyin: string;
  meaning: string;
  semester: Semester | 'both';
}

interface IdiomEntry {
  idiom: string;
  pinyin: string;
  meaning: string;
  blankIndex: number;
}

interface AntonymEntry {
  word: string;
  antonym: string;
}

interface SynonymEntry {
  word: string;
  synonym: string;
  distractors: string[];
}

interface PoetryEntry {
  title: string;
  author: string;
  dynasty: string;
  lineWithBlank: string;
  correctAnswer: string;
  fullLine: string;
}

interface SentenceFillEntry {
  sentence: string;
  correctAnswer: string;
  distractors: string[];
}

interface ReadingCompEntry {
  passage: string;
  question: string;
  correctAnswer: string;
  distractors: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// Character Database — organized by grade (人教版会认会写汉字)
// ═══════════════════════════════════════════════════════════════════════════════

const GRADE_CHARS: Record<Grade, CharEntry[]> = {
  1: [
    { char: '人', pinyin: 'rén', meaning: '人', semester: '上册' },
    { char: '大', pinyin: 'dà', meaning: '大', semester: '上册' },
    { char: '天', pinyin: 'tiān', meaning: '天空', semester: '上册' },
    { char: '空', pinyin: 'kōng', meaning: '天空/空', semester: '上册' },
    { char: '口', pinyin: 'kǒu', meaning: '嘴巴', semester: '上册' },
    { char: '手', pinyin: 'shǒu', meaning: '手', semester: '上册' },
    { char: '足', pinyin: 'zú', meaning: '脚', semester: '上册' },
    { char: '目', pinyin: 'mù', meaning: '眼睛', semester: '上册' },
    { char: '耳', pinyin: 'ěr', meaning: '耳朵', semester: '上册' },
    { char: '日', pinyin: 'rì', meaning: '太阳', semester: '上册' },
    { char: '月', pinyin: 'yuè', meaning: '月亮', semester: '上册' },
    { char: '山', pinyin: 'shān', meaning: '山', semester: '上册' },
    { char: '水', pinyin: 'shuǐ', meaning: '水', semester: '上册' },
    { char: '火', pinyin: 'huǒ', meaning: '火', semester: '上册' },
    { char: '田', pinyin: 'tián', meaning: '田地', semester: '上册' },
    { char: '禾', pinyin: 'hé', meaning: '禾苗', semester: '上册' },
    { char: '花', pinyin: 'huā', meaning: '花', semester: '上册' },
    { char: '草', pinyin: 'cǎo', meaning: '草', semester: '上册' },
    { char: '鸟', pinyin: 'niǎo', meaning: '鸟', semester: '上册' },
    { char: '鱼', pinyin: 'yú', meaning: '鱼', semester: '上册' },
    { char: '虫', pinyin: 'chóng', meaning: '虫子', semester: '下册' },
    { char: '云', pinyin: 'yún', meaning: '云', semester: '下册' },
    { char: '风', pinyin: 'fēng', meaning: '风', semester: '下册' },
    { char: '雨', pinyin: 'yǔ', meaning: '雨', semester: '下册' },
    { char: '雪', pinyin: 'xuě', meaning: '雪', semester: '下册' },
    { char: '石', pinyin: 'shí', meaning: '石头', semester: '下册' },
    { char: '土', pinyin: 'tǔ', meaning: '土', semester: '下册' },
    { char: '木', pinyin: 'mù', meaning: '木头', semester: '下册' },
    { char: '上', pinyin: 'shàng', meaning: '上面', semester: '下册' },
    { char: '下', pinyin: 'xià', meaning: '下面', semester: '下册' },
    { char: '左', pinyin: 'zuǒ', meaning: '左边', semester: '下册' },
    { char: '右', pinyin: 'yòu', meaning: '右边', semester: '下册' },
    { char: '前', pinyin: 'qián', meaning: '前面', semester: '下册' },
    { char: '后', pinyin: 'hòu', meaning: '后面', semester: '下册' },
    { char: '中', pinyin: 'zhōng', meaning: '中间', semester: '下册' },
    { char: '来', pinyin: 'lái', meaning: '来', semester: '下册' },
    { char: '去', pinyin: 'qù', meaning: '去', semester: '下册' },
    { char: '走', pinyin: 'zǒu', meaning: '走', semester: '下册' },
    { char: '跑', pinyin: 'pǎo', meaning: '跑', semester: '下册' },
    { char: '吃', pinyin: 'chī', meaning: '吃', semester: '下册' },
    { char: '喝', pinyin: 'hē', meaning: '喝', semester: '下册' },
    { char: '看', pinyin: 'kàn', meaning: '看', semester: '下册' },
    { char: '听', pinyin: 'tīng', meaning: '听', semester: '下册' },
    { char: '说', pinyin: 'shuō', meaning: '说', semester: '下册' },
    { char: '读', pinyin: 'dú', meaning: '读', semester: '下册' },
    { char: '写', pinyin: 'xiě', meaning: '写', semester: '下册' },
    { char: '画', pinyin: 'huà', meaning: '画', semester: '下册' },
    { char: '马', pinyin: 'mǎ', meaning: '马', semester: '下册' },
    { char: '牛', pinyin: 'niú', meaning: '牛', semester: '下册' },
    { char: '羊', pinyin: 'yáng', meaning: '羊', semester: '下册' },
  ],
  2: [
    { char: '明', pinyin: 'míng', meaning: '明亮', semester: '上册' },
    { char: '亮', pinyin: 'liàng', meaning: '光亮', semester: '上册' },
    { char: '星', pinyin: 'xīng', meaning: '星星', semester: '上册' },
    { char: '春', pinyin: 'chūn', meaning: '春天', semester: '上册' },
    { char: '夏', pinyin: 'xià', meaning: '夏天', semester: '上册' },
    { char: '秋', pinyin: 'qiū', meaning: '秋天', semester: '上册' },
    { char: '冬', pinyin: 'dōng', meaning: '冬天', semester: '上册' },
    { char: '红', pinyin: 'hóng', meaning: '红色', semester: '上册' },
    { char: '绿', pinyin: 'lǜ', meaning: '绿色', semester: '上册' },
    { char: '蓝', pinyin: 'lán', meaning: '蓝色', semester: '上册' },
    { char: '黄', pinyin: 'huáng', meaning: '黄色', semester: '上册' },
    { char: '白', pinyin: 'bái', meaning: '白色', semester: '上册' },
    { char: '黑', pinyin: 'hēi', meaning: '黑色', semester: '上册' },
    { char: '东', pinyin: 'dōng', meaning: '东方', semester: '上册' },
    { char: '南', pinyin: 'nán', meaning: '南方', semester: '上册' },
    { char: '西', pinyin: 'xī', meaning: '西方', semester: '上册' },
    { char: '北', pinyin: 'běi', meaning: '北方', semester: '上册' },
    { char: '高', pinyin: 'gāo', meaning: '高', semester: '上册' },
    { char: '低', pinyin: 'dī', meaning: '低', semester: '上册' },
    { char: '长', pinyin: 'cháng', meaning: '长', semester: '上册' },
    { char: '短', pinyin: 'duǎn', meaning: '短', semester: '下册' },
    { char: '多', pinyin: 'duō', meaning: '多', semester: '下册' },
    { char: '少', pinyin: 'shǎo', meaning: '少', semester: '下册' },
    { char: '好', pinyin: 'hǎo', meaning: '好', semester: '下册' },
    { char: '美', pinyin: 'měi', meaning: '美', semester: '下册' },
    { char: '爱', pinyin: 'ài', meaning: '爱', semester: '下册' },
    { char: '学', pinyin: 'xué', meaning: '学习', semester: '下册' },
    { char: '唱', pinyin: 'chàng', meaning: '唱', semester: '下册' },
    { char: '跳', pinyin: 'tiào', meaning: '跳', semester: '下册' },
    { char: '睡', pinyin: 'shuì', meaning: '睡觉', semester: '下册' },
    { char: '笑', pinyin: 'xiào', meaning: '笑', semester: '下册' },
    { char: '哭', pinyin: 'kū', meaning: '哭', semester: '下册' },
    { char: '飞', pinyin: 'fēi', meaning: '飞', semester: '下册' },
    { char: '海', pinyin: 'hǎi', meaning: '大海', semester: '下册' },
    { char: '河', pinyin: 'hé', meaning: '河流', semester: '下册' },
    { char: '湖', pinyin: 'hú', meaning: '湖', semester: '下册' },
    { char: '树', pinyin: 'shù', meaning: '树', semester: '下册' },
    { char: '叶', pinyin: 'yè', meaning: '叶子', semester: '下册' },
    { char: '果', pinyin: 'guǒ', meaning: '水果', semester: '下册' },
    { char: '园', pinyin: 'yuán', meaning: '花园', semester: '下册' },
    { char: '桥', pinyin: 'qiáo', meaning: '桥', semester: '下册' },
    { char: '路', pinyin: 'lù', meaning: '路', semester: '下册' },
    { char: '车', pinyin: 'chē', meaning: '车', semester: '下册' },
    { char: '船', pinyin: 'chuán', meaning: '船', semester: '下册' },
    { char: '门', pinyin: 'mén', meaning: '门', semester: '下册' },
    { char: '窗', pinyin: 'chuāng', meaning: '窗户', semester: '下册' },
    { char: '桌', pinyin: 'zhuō', meaning: '桌子', semester: '下册' },
  ],
  3: [
    { char: '想', pinyin: 'xiǎng', meaning: '想/思考', semester: '上册' },
    { char: '念', pinyin: 'niàn', meaning: '想念/读', semester: '上册' },
    { char: '知', pinyin: 'zhī', meaning: '知道', semester: '上册' },
    { char: '道', pinyin: 'dào', meaning: '道路/说', semester: '上册' },
    { char: '理', pinyin: 'lǐ', meaning: '道理', semester: '上册' },
    { char: '解', pinyin: 'jiě', meaning: '解决', semester: '上册' },
    { char: '问', pinyin: 'wèn', meaning: '问', semester: '上册' },
    { char: '答', pinyin: 'dá', meaning: '回答', semester: '上册' },
    { char: '讲', pinyin: 'jiǎng', meaning: '讲', semester: '上册' },
    { char: '见', pinyin: 'jiàn', meaning: '看见', semester: '上册' },
    { char: '觉', pinyin: 'jué', meaning: '感觉', semester: '上册' },
    { char: '能', pinyin: 'néng', meaning: '能', semester: '上册' },
    { char: '会', pinyin: 'huì', meaning: '会', semester: '上册' },
    { char: '要', pinyin: 'yào', meaning: '要', semester: '上册' },
    { char: '做', pinyin: 'zuò', meaning: '做', semester: '上册' },
    { char: '出', pinyin: 'chū', meaning: '出', semester: '上册' },
    { char: '入', pinyin: 'rù', meaning: '入', semester: '下册' },
    { char: '回', pinyin: 'huí', meaning: '回', semester: '下册' },
    { char: '找', pinyin: 'zhǎo', meaning: '找', semester: '下册' },
    { char: '送', pinyin: 'sòng', meaning: '送', semester: '下册' },
    { char: '用', pinyin: 'yòng', meaning: '用', semester: '下册' },
    { char: '情', pinyin: 'qíng', meaning: '感情', semester: '下册' },
    { char: '意', pinyin: 'yì', meaning: '意思', semester: '下册' },
    { char: '心', pinyin: 'xīn', meaning: '心', semester: '下册' },
    { char: '力', pinyin: 'lì', meaning: '力量', semester: '下册' },
    { char: '光', pinyin: 'guāng', meaning: '光', semester: '下册' },
    { char: '色', pinyin: 'sè', meaning: '颜色', semester: '下册' },
    { char: '声', pinyin: 'shēng', meaning: '声音', semester: '下册' },
    { char: '气', pinyin: 'qì', meaning: '空气', semester: '下册' },
    { char: '动', pinyin: 'dòng', meaning: '动', semester: '下册' },
    { char: '静', pinyin: 'jìng', meaning: '安静', semester: '下册' },
    { char: '快', pinyin: 'kuài', meaning: '快', semester: '下册' },
    { char: '慢', pinyin: 'màn', meaning: '慢', semester: '下册' },
  ],
  4: [
    { char: '丰', pinyin: 'fēng', meaning: '丰富', semester: '上册' },
    { char: '富', pinyin: 'fù', meaning: '富有', semester: '上册' },
    { char: '诚', pinyin: 'chéng', meaning: '诚实', semester: '上册' },
    { char: '信', pinyin: 'xìn', meaning: '信任', semester: '上册' },
    { char: '善', pinyin: 'shàn', meaning: '善良', semester: '上册' },
    { char: '恶', pinyin: 'è', meaning: '邪恶', semester: '上册' },
    { char: '胜', pinyin: 'shèng', meaning: '胜利', semester: '上册' },
    { char: '败', pinyin: 'bài', meaning: '失败', semester: '上册' },
    { char: '宽', pinyin: 'kuān', meaning: '宽', semester: '上册' },
    { char: '窄', pinyin: 'zhǎi', meaning: '窄', semester: '上册' },
    { char: '厚', pinyin: 'hòu', meaning: '厚', semester: '上册' },
    { char: '薄', pinyin: 'bó', meaning: '薄', semester: '上册' },
    { char: '粗', pinyin: 'cū', meaning: '粗', semester: '上册' },
    { char: '细', pinyin: 'xì', meaning: '细', semester: '上册' },
    { char: '干', pinyin: 'gān', meaning: '干', semester: '上册' },
    { char: '湿', pinyin: 'shī', meaning: '湿', semester: '上册' },
    { char: '刚', pinyin: 'gāng', meaning: '刚强', semester: '下册' },
    { char: '柔', pinyin: 'róu', meaning: '柔', semester: '上册' },
    { char: '智', pinyin: 'zhì', meaning: '智慧', semester: '下册' },
    { char: '勤', pinyin: 'qín', meaning: '勤', semester: '下册' },
    { char: '懒', pinyin: 'lǎn', meaning: '懒', semester: '下册' },
    { char: '险', pinyin: 'xiǎn', meaning: '危险', semester: '下册' },
    { char: '安', pinyin: 'ān', meaning: '安全', semester: '下册' },
    { char: '升', pinyin: 'shēng', meaning: '上升', semester: '下册' },
    { char: '降', pinyin: 'jiàng', meaning: '下降', semester: '下册' },
    { char: '浓', pinyin: 'nóng', meaning: '浓', semester: '下册' },
    { char: '淡', pinyin: 'dàn', meaning: '淡', semester: '下册' },
  ],
  5: [
    { char: '观', pinyin: 'guān', meaning: '观察', semester: '上册' },
    { char: '察', pinyin: 'chá', meaning: '检查', semester: '上册' },
    { char: '实', pinyin: 'shí', meaning: '真实', semester: '上册' },
    { char: '验', pinyin: 'yàn', meaning: '实验', semester: '上册' },
    { char: '记', pinyin: 'jì', meaning: '记住', semester: '上册' },
    { char: '录', pinyin: 'lù', meaning: '记录', semester: '上册' },
    { char: '总', pinyin: 'zǒng', meaning: '总是', semester: '上册' },
    { char: '结', pinyin: 'jié', meaning: '结论', semester: '上册' },
    { char: '象', pinyin: 'xiàng', meaning: '现象', semester: '上册' },
    { char: '感', pinyin: 'gǎn', meaning: '感受', semester: '上册' },
    { char: '表', pinyin: 'biǎo', meaning: '表达', semester: '上册' },
    { char: '达', pinyin: 'dá', meaning: '到达', semester: '上册' },
    { char: '交', pinyin: 'jiāo', meaning: '交流', semester: '上册' },
    { char: '流', pinyin: 'liú', meaning: '流动', semester: '上册' },
    { char: '精', pinyin: 'jīng', meaning: '精华', semester: '上册' },
    { char: '彩', pinyin: 'cǎi', meaning: '色彩', semester: '上册' },
    { char: '传', pinyin: 'chuán', meaning: '传承', semester: '上册' },
    { char: '承', pinyin: 'chéng', meaning: '继承', semester: '上册' },
    { char: '经', pinyin: 'jīng', meaning: '经典', semester: '下册' },
    { char: '典', pinyin: 'diǎn', meaning: '典范', semester: '下册' },
    { char: '修', pinyin: 'xiū', meaning: '修养', semester: '下册' },
    { char: '养', pinyin: 'yǎng', meaning: '培养', semester: '下册' },
    { char: '品', pinyin: 'pǐn', meaning: '品质', semester: '下册' },
    { char: '德', pinyin: 'dé', meaning: '品德', semester: '下册' },
    { char: '才', pinyin: 'cái', meaning: '才能', semester: '下册' },
    { char: '华', pinyin: 'huá', meaning: '中华', semester: '下册' },
    { char: '壮', pinyin: 'zhuàng', meaning: '壮丽', semester: '下册' },
    { char: '丽', pinyin: 'lì', meaning: '美丽', semester: '下册' },
  ],
  6: [
    { char: '浩', pinyin: 'hào', meaning: '浩瀚', semester: '上册' },
    { char: '瀚', pinyin: 'hàn', meaning: '浩瀚', semester: '上册' },
    { char: '巍', pinyin: 'wēi', meaning: '巍峨', semester: '上册' },
    { char: '峨', pinyin: 'é', meaning: '高', semester: '上册' },
    { char: '苍', pinyin: 'cāng', meaning: '苍翠', semester: '上册' },
    { char: '翠', pinyin: 'cuì', meaning: '翠绿', semester: '上册' },
    { char: '耀', pinyin: 'yào', meaning: '耀眼', semester: '上册' },
    { char: '斑', pinyin: 'bān', meaning: '斑斓', semester: '上册' },
    { char: '幽', pinyin: 'yōu', meaning: '幽雅', semester: '上册' },
    { char: '雅', pinyin: 'yǎ', meaning: '优雅', semester: '上册' },
    { char: '悠', pinyin: 'yōu', meaning: '悠闲', semester: '上册' },
    { char: '然', pinyin: 'rán', meaning: '然后', semester: '上册' },
    { char: '依', pinyin: 'yī', meaning: '依靠', semester: '上册' },
    { char: '凝', pinyin: 'níng', meaning: '凝视', semester: '上册' },
    { char: '湛', pinyin: 'zhàn', meaning: '湛蓝', semester: '上册' },
    { char: '澈', pinyin: 'chè', meaning: '清澈', semester: '下册' },
    { char: '肃', pinyin: 'sù', meaning: '肃穆', semester: '下册' },
    { char: '永', pinyin: 'yǒng', meaning: '永远', semester: '下册' },
    { char: '恒', pinyin: 'héng', meaning: '永恒', semester: '下册' },
    { char: '绚', pinyin: 'xuàn', meaning: '绚丽', semester: '下册' },
    { char: '瑰', pinyin: 'guī', meaning: '瑰丽', semester: '下册' },
    { char: '孤', pinyin: 'gū', meaning: '孤独', semester: '下册' },
    { char: '寂', pinyin: 'jì', meaning: '寂寞', semester: '下册' },
    { char: '坦', pinyin: 'tǎn', meaning: '坦然', semester: '下册' },
    { char: '释', pinyin: 'shì', meaning: '释放', semester: '下册' },
    { char: '芳', pinyin: 'fāng', meaning: '芬芳', semester: '下册' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// Word Database — organized by grade
// ═══════════════════════════════════════════════════════════════════════════════

const GRADE_WORDS: Record<Grade, WordEntry[]> = {
  1: [
    { word: '上学', pinyin: 'shàng xué', meaning: '去学校', semester: '上册' },
    { word: '回家', pinyin: 'huí jiā', meaning: '回家里', semester: '上册' },
    { word: '吃饭', pinyin: 'chī fàn', meaning: '吃午饭', semester: '上册' },
    { word: '喝水', pinyin: 'hē shuǐ', meaning: '喝杯水', semester: '上册' },
    { word: '看书', pinyin: 'kàn shū', meaning: '读课本', semester: '上册' },
    { word: '写字', pinyin: 'xiě zì', meaning: '写汉字', semester: '上册' },
    { word: '画画', pinyin: 'huà huà', meaning: '画图画', semester: '上册' },
    { word: '唱歌', pinyin: 'chàng gē', meaning: '唱歌曲', semester: '上册' },
    { word: '跳舞', pinyin: 'tiào wǔ', meaning: '跳舞蹈', semester: '上册' },
    { word: '跑步', pinyin: 'pǎo bù', meaning: '跑跑步', semester: '上册' },
    { word: '太阳', pinyin: 'tài yáng', meaning: '天上的太阳', semester: '上册' },
    { word: '月亮', pinyin: 'yuè liang', meaning: '夜空的月亮', semester: '上册' },
    { word: '星星', pinyin: 'xīng xing', meaning: '夜空的星星', semester: '上册' },
    { word: '白云', pinyin: 'bái yún', meaning: '天上的白云', semester: '上册' },
    { word: '小鸟', pinyin: 'xiǎo niǎo', meaning: '天空的小鸟', semester: '上册' },
    { word: '小鱼', pinyin: 'xiǎo yú', meaning: '水中的小鱼', semester: '上册' },
    { word: '小狗', pinyin: 'xiǎo gǒu', meaning: '可爱的小狗', semester: '上册' },
    { word: '小猫', pinyin: 'xiǎo māo', meaning: '可爱的小猫', semester: '上册' },
    { word: '花园', pinyin: 'huā yuán', meaning: '种花的地方', semester: '下册' },
    { word: '学校', pinyin: 'xué xiào', meaning: '读书的地方', semester: '下册' },
    { word: '老师', pinyin: 'lǎo shī', meaning: '教书的老师', semester: '下册' },
    { word: '同学', pinyin: 'tóng xué', meaning: '一起学习的', semester: '下册' },
    { word: '朋友', pinyin: 'péng you', meaning: '好朋友', semester: '下册' },
    { word: '爸爸', pinyin: 'bà ba', meaning: '我的爸爸', semester: '下册' },
    { word: '妈妈', pinyin: 'mā ma', meaning: '我的妈妈', semester: '下册' },
    { word: '爷爷', pinyin: 'yé ye', meaning: '我的爷爷', semester: '下册' },
    { word: '奶奶', pinyin: 'nǎi nai', meaning: '我的奶奶', semester: '下册' },
  ],
  2: [
    { word: '春天', pinyin: 'chūn tiān', meaning: '温暖的春天', semester: '上册' },
    { word: '夏天', pinyin: 'xià tiān', meaning: '炎热的夏天', semester: '上册' },
    { word: '秋天', pinyin: 'qiū tiān', meaning: '凉爽的秋天', semester: '上册' },
    { word: '冬天', pinyin: 'dōng tiān', meaning: '寒冷的冬天', semester: '上册' },
    { word: '快乐', pinyin: 'kuài lè', meaning: '非常高兴', semester: '上册' },
    { word: '开心', pinyin: 'kāi xīn', meaning: '心情很好', semester: '上册' },
    { word: '美丽', pinyin: 'měi lì', meaning: '很好看', semester: '上册' },
    { word: '温暖', pinyin: 'wēn nuǎn', meaning: '暖洋洋', semester: '上册' },
    { word: '勇敢', pinyin: 'yǒng gǎn', meaning: '不怕困难', semester: '上册' },
    { word: '聪明', pinyin: 'cōng míng', meaning: '头脑灵活', semester: '上册' },
    { word: '努力', pinyin: 'nǔ lì', meaning: '用心学习', semester: '上册' },
    { word: '学习', pinyin: 'xué xí', meaning: '认真学', semester: '上册' },
    { word: '回答', pinyin: 'huí dá', meaning: '回答问题', semester: '上册' },
    { word: '问题', pinyin: 'wèn tí', meaning: '提出问题', semester: '上册' },
    { word: '知识', pinyin: 'zhī shi', meaning: '学到知识', semester: '上册' },
    { word: '高山', pinyin: 'gāo shān', meaning: '很高的山', semester: '上册' },
    { word: '大海', pinyin: 'dà hǎi', meaning: '广阔的海', semester: '上册' },
    { word: '森林', pinyin: 'sēn lín', meaning: '茂密的林', semester: '上册' },
    { word: '草原', pinyin: 'cǎo yuán', meaning: '辽阔草原', semester: '上册' },
    { word: '天空', pinyin: 'tiān kōng', meaning: '蔚蓝天空', semester: '下册' },
    { word: '世界', pinyin: 'shì jiè', meaning: '大千世界', semester: '下册' },
    { word: '动物', pinyin: 'dòng wù', meaning: '各种动物', semester: '下册' },
    { word: '植物', pinyin: 'zhí wù', meaning: '各种植物', semester: '下册' },
  ],
  3: [
    { word: '思考', pinyin: 'sī kǎo', meaning: '深入思考', semester: '上册' },
    { word: '发现', pinyin: 'fā xiàn', meaning: '偶然发现', semester: '上册' },
    { word: '创造', pinyin: 'chuàng zào', meaning: '动手创造', semester: '上册' },
    { word: '探索', pinyin: 'tàn suǒ', meaning: '勇敢探索', semester: '上册' },
    { word: '旅行', pinyin: 'lǚ xíng', meaning: '出去旅行', semester: '上册' },
    { word: '风景', pinyin: 'fēng jǐng', meaning: '美丽风景', semester: '上册' },
    { word: '彩虹', pinyin: 'cǎi hóng', meaning: '雨后彩虹', semester: '上册' },
    { word: '瀑布', pinyin: 'pù bù', meaning: '壮观瀑布', semester: '上册' },
    { word: '科学家', pinyin: 'kē xué jiā', meaning: '做研究', semester: '上册' },
    { word: '图书馆', pinyin: 'tú shū guǎn', meaning: '借书看', semester: '上册' },
    { word: '友谊', pinyin: 'yǒu yì', meaning: '珍贵友谊', semester: '上册' },
    { word: '梦想', pinyin: 'mèng xiǎng', meaning: '心中梦想', semester: '上册' },
    { word: '希望', pinyin: 'xī wàng', meaning: '怀揣希望', semester: '上册' },
    { word: '成功', pinyin: 'chéng gōng', meaning: '获得成功', semester: '上册' },
    { word: '困难', pinyin: 'kùn nán', meaning: '克服困难', semester: '下册' },
    { word: '坚持', pinyin: 'jiān chí', meaning: '坚持到底', semester: '下册' },
    { word: '帮助', pinyin: 'bāng zhù', meaning: '帮助他人', semester: '下册' },
    { word: '感谢', pinyin: 'gǎn xiè', meaning: '表达感谢', semester: '下册' },
    { word: '故事', pinyin: 'gù shi', meaning: '好听故事', semester: '下册' },
  ],
  4: [
    { word: '诚实', pinyin: 'chéng shí', meaning: '做人诚实', semester: '上册' },
    { word: '善良', pinyin: 'shàn liáng', meaning: '心地善良', semester: '上册' },
    { word: '坚强', pinyin: 'jiān qiáng', meaning: '意志坚强', semester: '上册' },
    { word: '谦虚', pinyin: 'qiān xū', meaning: '谦虚好学', semester: '上册' },
    { word: '骄傲', pinyin: 'jiāo ào', meaning: '不要骄傲', semester: '上册' },
    { word: '勤劳', pinyin: 'qín láo', meaning: '勤劳致富', semester: '上册' },
    { word: '懒惰', pinyin: 'lǎn duò', meaning: '不要懒惰', semester: '上册' },
    { word: '热闹', pinyin: 'rè nao', meaning: '热闹非凡', semester: '上册' },
    { word: '安静', pinyin: 'ān jìng', meaning: '保持安静', semester: '上册' },
    { word: '整齐', pinyin: 'zhěng qí', meaning: '排列整齐', semester: '上册' },
    { word: '危险', pinyin: 'wēi xiǎn', meaning: '注意安全', semester: '上册' },
    { word: '安全', pinyin: 'ān quán', meaning: '确保安全', semester: '上册' },
    { word: '仔细', pinyin: 'zǐ xì', meaning: '仔细检查', semester: '上册' },
    { word: '马虎', pinyin: 'mǎ hu', meaning: '做事马虎', semester: '上册' },
    { word: '宽阔', pinyin: 'kuān kuò', meaning: '道路宽阔', semester: '上册' },
    { word: '狭窄', pinyin: 'xiá zhǎi', meaning: '通道狭窄', semester: '上册' },
    { word: '寒冷', pinyin: 'hán lěng', meaning: '冬天寒冷', semester: '上册' },
    { word: '光明', pinyin: 'guāng míng', meaning: '走向光明', semester: '下册' },
    { word: '黑暗', pinyin: 'hēi àn', meaning: '驱散黑暗', semester: '下册' },
    { word: '丰收', pinyin: 'fēng shōu', meaning: '喜获丰收', semester: '下册' },
  ],
  5: [
    { word: '观察', pinyin: 'guān chá', meaning: '仔细观察', semester: '上册' },
    { word: '实验', pinyin: 'shí yàn', meaning: '做实验', semester: '上册' },
    { word: '记录', pinyin: 'jì lù', meaning: '认真记录', semester: '上册' },
    { word: '总结', pinyin: 'zǒng jié', meaning: '总结经验', semester: '上册' },
    { word: '感受', pinyin: 'gǎn shòu', meaning: '表达感受', semester: '上册' },
    { word: '表达', pinyin: 'biǎo dá', meaning: '清楚表达', semester: '上册' },
    { word: '交流', pinyin: 'jiāo liú', meaning: '互相交流', semester: '上册' },
    { word: '精神', pinyin: 'jīng shén', meaning: '振奋精神', semester: '上册' },
    { word: '品质', pinyin: 'pǐn zhì', meaning: '优秀品质', semester: '上册' },
    { word: '才华', pinyin: 'cái huá', meaning: '展现才华', semester: '上册' },
    { word: '传统', pinyin: 'chuán tǒng', meaning: '传统文化', semester: '上册' },
    { word: '经典', pinyin: 'jīng diǎn', meaning: '经典之作', semester: '上册' },
    { word: '修养', pinyin: 'xiū yǎng', meaning: '提高修养', semester: '上册' },
    { word: '辉煌', pinyin: 'huī huáng', meaning: '创造辉煌', semester: '上册' },
    { word: '壮观', pinyin: 'zhuàng guān', meaning: '壮观景象', semester: '上册' },
    { word: '形容', pinyin: 'xíng róng', meaning: '形容美好', semester: '上册' },
    { word: '比喻', pinyin: 'bǐ yù', meaning: '打比方', semester: '上册' },
    { word: '象征', pinyin: 'xiàng zhēng', meaning: '代表意义', semester: '上册' },
    { word: '体会', pinyin: 'tǐ huì', meaning: '深入体会', semester: '下册' },
    { word: '领悟', pinyin: 'lǐng wù', meaning: '用心领悟', semester: '下册' },
  ],
  6: [
    { word: '浩瀚', pinyin: 'hào hàn', meaning: '浩瀚大海', semester: '上册' },
    { word: '巍峨', pinyin: 'wēi é', meaning: '巍峨高山', semester: '上册' },
    { word: '苍翠', pinyin: 'cāng cuì', meaning: '苍翠松柏', semester: '上册' },
    { word: '斑斓', pinyin: 'bān lán', meaning: '色彩斑斓', semester: '上册' },
    { word: '幽雅', pinyin: 'yōu yǎ', meaning: '环境幽雅', semester: '上册' },
    { word: '悠闲', pinyin: 'yōu xián', meaning: '悠闲自在', semester: '上册' },
    { word: '绚丽', pinyin: 'xuàn lì', meaning: '绚丽多彩', semester: '上册' },
    { word: '璀璨', pinyin: 'cuǐ càn', meaning: '璀璨星空', semester: '上册' },
    { word: '清澈', pinyin: 'qīng chè', meaning: '清澈河水', semester: '上册' },
    { word: '湛蓝', pinyin: 'zhàn lán', meaning: '湛蓝天空', semester: '上册' },
    { word: '宏伟', pinyin: 'hóng wěi', meaning: '宏伟建筑', semester: '上册' },
    { word: '磅礴', pinyin: 'páng bó', meaning: '气势磅礴', semester: '上册' },
    { word: '瑰丽', pinyin: 'guī lì', meaning: '瑰丽风景', semester: '上册' },
    { word: '孤独', pinyin: 'gū dú', meaning: '感到孤独', semester: '上册' },
    { word: '惆怅', pinyin: 'chóu chàng', meaning: '心情惆怅', semester: '上册' },
    { word: '坦然', pinyin: 'tǎn rán', meaning: '坦然面对', semester: '下册' },
    { word: '释然', pinyin: 'shì rán', meaning: '心中释然', semester: '下册' },
    { word: '芬芳', pinyin: 'fēn fāng', meaning: '芬芳扑鼻', semester: '下册' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// Idiom Database (成语) — 32 entries
// ═══════════════════════════════════════════════════════════════════════════════

const IDIOM_DB: IdiomEntry[] = [
  { idiom: '一心一意', pinyin: 'yī xīn yī yì', meaning: '专心致志', blankIndex: 1 },
  { idiom: '三心二意', pinyin: 'sān xīn èr yì', meaning: '不专心', blankIndex: 1 },
  { idiom: '画龙点睛', pinyin: 'huà lóng diǎn jīng', meaning: '关键处加上精辟之笔', blankIndex: 2 },
  { idiom: '守株待兔', pinyin: 'shǒu zhū dài tù', meaning: '不劳而获', blankIndex: 1 },
  { idiom: '亡羊补牢', pinyin: 'wáng yáng bǔ láo', meaning: '出了问题及时补救', blankIndex: 2 },
  { idiom: '叶公好龙', pinyin: 'yè gōng hào lóng', meaning: '表面喜欢实际害怕', blankIndex: 2 },
  { idiom: '掩耳盗铃', pinyin: 'yǎn ěr dào líng', meaning: '自欺欺人', blankIndex: 2 },
  { idiom: '狐假虎威', pinyin: 'hú jiǎ hǔ wēi', meaning: '借别人的势力欺压人', blankIndex: 1 },
  { idiom: '刻舟求剑', pinyin: 'kè zhōu qiú jiàn', meaning: '不知道变通', blankIndex: 2 },
  { idiom: '井底之蛙', pinyin: 'jǐng dǐ zhī wā', meaning: '目光短浅', blankIndex: 2 },
  { idiom: '对牛弹琴', pinyin: 'duì niú tán qín', meaning: '对不懂道理的人讲道理', blankIndex: 2 },
  { idiom: '杞人忧天', pinyin: 'qǐ rén yōu tiān', meaning: '不必要的担心', blankIndex: 1 },
  { idiom: '揠苗助长', pinyin: 'yà miáo zhù zhǎng', meaning: '急于求成反而坏事', blankIndex: 1 },
  { idiom: '自相矛盾', pinyin: 'zì xiāng máo dùn', meaning: '前后不一致', blankIndex: 2 },
  { idiom: '一举两得', pinyin: 'yī jǔ liǎng dé', meaning: '做一件事得两方面好处', blankIndex: 1 },
  { idiom: '四面楚歌', pinyin: 'sì miàn chǔ gē', meaning: '四面受敌', blankIndex: 1 },
  { idiom: '愚公移山', pinyin: 'yú gōng yí shān', meaning: '坚持不懈', blankIndex: 2 },
  { idiom: '百发百中', pinyin: 'bǎi fā bǎi zhòng', meaning: '射箭技术高超', blankIndex: 2 },
  { idiom: '风吹草动', pinyin: 'fēng chuī cǎo dòng', meaning: '有一点变化', blankIndex: 2 },
  { idiom: '鹤立鸡群', pinyin: 'hè lì jī qún', meaning: '才能出众', blankIndex: 2 },
  { idiom: '胸有成竹', pinyin: 'xiōng yǒu chéng zhú', meaning: '做事之前已有把握', blankIndex: 3 },
  { idiom: '望梅止渴', pinyin: 'wàng méi zhǐ kě', meaning: '用空想来安慰自己', blankIndex: 2 },
  { idiom: '卧薪尝胆', pinyin: 'wò xīn cháng dǎn', meaning: '发愤图强', blankIndex: 2 },
  { idiom: '纸上谈兵', pinyin: 'zhǐ shàng tán bīng', meaning: '理论不联系实际', blankIndex: 2 },
  { idiom: '悬梁刺股', pinyin: 'xuán liáng cì gǔ', meaning: '刻苦学习', blankIndex: 2 },
  { idiom: '闻鸡起舞', pinyin: 'wén jī qǐ wǔ', meaning: '及时奋发', blankIndex: 2 },
  { idiom: '指鹿为马', pinyin: 'zhǐ lù wéi mǎ', meaning: '故意颠倒黑白', blankIndex: 1 },
  { idiom: '开天辟地', pinyin: 'kāi tiān pì dì', meaning: '前所未有的壮举', blankIndex: 2 },
  { idiom: '精卫填海', pinyin: 'jīng wèi tián hǎi', meaning: '意志坚定', blankIndex: 2 },
  { idiom: '一鸣惊人', pinyin: 'yī míng jīng rén', meaning: '突然有惊人表现', blankIndex: 1 },
  { idiom: '入木三分', pinyin: 'rù mù sān fēn', meaning: '分析问题深刻', blankIndex: 1 },
  { idiom: '半途而废', pinyin: 'bàn tú ér fèi', meaning: '做事不能坚持到底', blankIndex: 2 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Antonym Database (反义词) — 30 pairs
// ═══════════════════════════════════════════════════════════════════════════════

const ANTONYM_DB: AntonymEntry[] = [
  { word: '大', antonym: '小' },
  { word: '高', antonym: '矮' },
  { word: '长', antonym: '短' },
  { word: '多', antonym: '少' },
  { word: '好', antonym: '坏' },
  { word: '美丽', antonym: '丑陋' },
  { word: '快乐', antonym: '悲伤' },
  { word: '勇敢', antonym: '胆小' },
  { word: '聪明', antonym: '愚蠢' },
  { word: '勤劳', antonym: '懒惰' },
  { word: '热闹', antonym: '冷清' },
  { word: '安全', antonym: '危险' },
  { word: '温暖', antonym: '寒冷' },
  { word: '光明', antonym: '黑暗' },
  { word: '仔细', antonym: '马虎' },
  { word: '谦虚', antonym: '骄傲' },
  { word: '宽阔', antonym: '狭窄' },
  { word: '整齐', antonym: '凌乱' },
  { word: '坚硬', antonym: '柔软' },
  { word: '上升', antonym: '下降' },
  { word: '胜利', antonym: '失败' },
  { word: '喜欢', antonym: '讨厌' },
  { word: '简单', antonym: '复杂' },
  { word: '干净', antonym: '肮脏' },
  { word: '诚实', antonym: '撒谎' },
  { word: '粗心', antonym: '细心' },
  { word: '遥远', antonym: '附近' },
  { word: '迅速', antonym: '缓慢' },
  { word: '困难', antonym: '容易' },
  { word: '清晰', antonym: '模糊' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Synonym Database (近义词) — 18 pairs
// ═══════════════════════════════════════════════════════════════════════════════

const SYNONYM_DB: SynonymEntry[] = [
  { word: '美丽', synonym: '漂亮', distractors: ['丑陋', '凶猛', '马虎'] },
  { word: '快乐', synonym: '高兴', distractors: ['悲伤', '恐惧', '疲惫'] },
  { word: '勇敢', synonym: '无畏', distractors: ['胆小', '懒惰', '骄傲'] },
  { word: '聪明', synonym: '智慧', distractors: ['愚蠢', '粗心', '马虎'] },
  { word: '温暖', synonym: '暖和', distractors: ['寒冷', '炎热', '潮湿'] },
  { word: '仔细', synonym: '认真', distractors: ['马虎', '懒惰', '粗心'] },
  { word: '喜欢', synonym: '喜爱', distractors: ['讨厌', '害怕', '担心'] },
  { word: '安静', synonym: '宁静', distractors: ['热闹', '嘈杂', '慌乱'] },
  { word: '帮助', synonym: '协助', distractors: ['破坏', '打扰', '拒绝'] },
  { word: '发现', synonym: '发觉', distractors: ['隐藏', '丢失', '忽略'] },
  { word: '困难', synonym: '艰难', distractors: ['容易', '简单', '轻松'] },
  { word: '坚固', synonym: '牢固', distractors: ['脆弱', '柔软', '松散'] },
  { word: '宽阔', synonym: '宽广', distractors: ['狭窄', '矮小', '拥挤'] },
  { word: '立刻', synonym: '马上', distractors: ['缓慢', '推迟', '犹豫'] },
  { word: '感激', synonym: '感谢', distractors: ['抱怨', '讨厌', '忘记'] },
  { word: '著名', synonym: '有名', distractors: ['普通', '平凡', '默默'] },
  { word: '珍贵', synonym: '宝贵', distractors: ['廉价', '普通', '常见'] },
  { word: '观看', synonym: '欣赏', distractors: ['忽略', '逃避', '拒绝'] },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Poetry Database (古诗词) — 17 entries
// ═══════════════════════════════════════════════════════════════════════════════

const POETRY_DB: PoetryEntry[] = [
  { title: '静夜思', author: '李白', dynasty: '唐', lineWithBlank: '床前___光', correctAnswer: '明月', fullLine: '床前明月光' },
  { title: '静夜思', author: '李白', dynasty: '唐', lineWithBlank: '疑是地上___', correctAnswer: '霜', fullLine: '疑是地上霜' },
  { title: '春晓', author: '孟浩然', dynasty: '唐', lineWithBlank: '春眠不觉___', correctAnswer: '晓', fullLine: '春眠不觉晓' },
  { title: '春晓', author: '孟浩然', dynasty: '唐', lineWithBlank: '处处闻___鸟', correctAnswer: '啼', fullLine: '处处闻啼鸟' },
  { title: '登鹳雀楼', author: '王之涣', dynasty: '唐', lineWithBlank: '白日依山___', correctAnswer: '尽', fullLine: '白日依山尽' },
  { title: '登鹳雀楼', author: '王之涣', dynasty: '唐', lineWithBlank: '黄河入___流', correctAnswer: '海', fullLine: '黄河入海流' },
  { title: '悯农', author: '李绅', dynasty: '唐', lineWithBlank: '锄禾日当___', correctAnswer: '午', fullLine: '锄禾日当午' },
  { title: '悯农', author: '李绅', dynasty: '唐', lineWithBlank: '汗滴禾下___', correctAnswer: '土', fullLine: '汗滴禾下土' },
  { title: '望庐山瀑布', author: '李白', dynasty: '唐', lineWithBlank: '飞流直下三千___', correctAnswer: '尺', fullLine: '飞流直下三千尺' },
  { title: '望庐山瀑布', author: '李白', dynasty: '唐', lineWithBlank: '疑是银河落___天', correctAnswer: '九', fullLine: '疑是银河落九天' },
  { title: '咏鹅', author: '骆宾王', dynasty: '唐', lineWithBlank: '白毛浮绿水，红掌拨清___', correctAnswer: '波', fullLine: '白毛浮绿水，红掌拨清波' },
  { title: '绝句', author: '杜甫', dynasty: '唐', lineWithBlank: '两个黄鹂鸣翠___', correctAnswer: '柳', fullLine: '两个黄鹂鸣翠柳' },
  { title: '绝句', author: '杜甫', dynasty: '唐', lineWithBlank: '一行白鹭上青___', correctAnswer: '天', fullLine: '一行白鹭上青天' },
  { title: '江雪', author: '柳宗元', dynasty: '唐', lineWithBlank: '千山鸟飞___', correctAnswer: '绝', fullLine: '千山鸟飞绝' },
  { title: '游子吟', author: '孟郊', dynasty: '唐', lineWithBlank: '慈母手中___', correctAnswer: '线', fullLine: '慈母手中线' },
  { title: '小池', author: '杨万里', dynasty: '宋', lineWithBlank: '小荷才露尖尖___', correctAnswer: '角', fullLine: '小荷才露尖尖角' },
  { title: '赠汪伦', author: '李白', dynasty: '唐', lineWithBlank: '桃花潭水深千___', correctAnswer: '尺', fullLine: '桃花潭水深千尺' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Sentence Fill Database (句子填空)
// ═══════════════════════════════════════════════════════════════════════════════

const SENTENCE_FILL_DB: Record<string, SentenceFillEntry[]> = {
  '3': [
    { sentence: '小明每天___学校上课。', correctAnswer: '去', distractors: ['走', '来', '在'] },
    { sentence: '春天来了，公园里的花都___了。', correctAnswer: '开', distractors: ['落', '谢', '长'] },
    { sentence: '小鸟在树上开心地___。', correctAnswer: '唱歌', distractors: ['跳舞', '睡觉', '吃饭'] },
    { sentence: '我最___的水果是苹果。', correctAnswer: '喜欢', distractors: ['讨厌', '害怕', '忘记'] },
    { sentence: '太阳___起来了，天亮了。', correctAnswer: '升', distractors: ['落', '下', '出'] },
    { sentence: '秋天到了，树叶渐渐___了。', correctAnswer: '黄', distractors: ['绿', '红', '蓝'] },
    { sentence: '春天，小河里的冰都___了。', correctAnswer: '化', distractors: ['结', '冻', '破'] },
  ],
  '4': [
    { sentence: '我们要___时间，努力学习。', correctAnswer: '珍惜', distractors: ['浪费', '忘记', '利用'] },
    { sentence: '他做事很___，从不马虎。', correctAnswer: '仔细', distractors: ['粗心', '随便', '着急'] },
    { sentence: '比赛前，大家都很___。', correctAnswer: '紧张', distractors: ['放松', '开心', '无聊'] },
    { sentence: '教室里很___，大家都在自习。', correctAnswer: '安静', distractors: ['热闹', '嘈杂', '混乱'] },
    { sentence: '考试的时候一定要___读题。', correctAnswer: '认真', distractors: ['快速', '马虎', '粗心'] },
    { sentence: '同学之间要互相___。', correctAnswer: '帮助', distractors: ['嘲笑', '欺负', '忽视'] },
  ],
  '5': [
    { sentence: '这篇文章的描写非常___，像一幅画。', correctAnswer: '生动', distractors: ['平淡', '枯燥', '简单'] },
    { sentence: '我们应该___优秀的传统文化。', correctAnswer: '传承', distractors: ['丢弃', '忘记', '忽略'] },
    { sentence: '夕阳西下，天边的云彩十分___。', correctAnswer: '绚丽', distractors: ['暗淡', '单调', '灰暗'] },
    { sentence: '他___地表达了自己的观点。', correctAnswer: '清楚', distractors: ['模糊', '含糊', '简单'] },
    { sentence: '老師的教育让我___受益。', correctAnswer: '终身', distractors: ['暂时', '偶尔', '突然'] },
    { sentence: '面对困难，我们要___向前。', correctAnswer: '勇敢', distractors: ['害怕', '退缩', '犹豫'] },
  ],
  '6': [
    { sentence: '这首诗表达了诗人___的思乡之情。', correctAnswer: '深深', distractors: ['浅浅', '淡淡', '微微'] },
    { sentence: '他的演讲___有力，打动了在场的每个人。', correctAnswer: '慷慨', distractors: ['低沉', '平静', '冷漠'] },
    { sentence: '站在山顶___望去，风景美不胜收。', correctAnswer: '极目', distractors: ['低头', '闭眼', '转身'] },
    { sentence: '我们要继承和发扬___的革命精神。', correctAnswer: '光荣', distractors: ['可耻', '渺小', '平凡'] },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// Reading Comprehension Database
// ═══════════════════════════════════════════════════════════════════════════════

const READING_COMP_DB: ReadingCompEntry[] = [
  { passage: '春天来了，小草从泥土里探出头来，桃花开了，小燕子从南方飞回来了。', question: '短文中描写了哪些春天的景象？', correctAnswer: '小草发芽、桃花开放、燕子归来', distractors: ['树叶变黄、菊花开放', '雪花飘落、河水结冰', '蝉鸣蛙叫、荷花开放'] },
  { passage: '秋天到了，果园里的苹果红了，梨子黄了，葡萄紫了。农民伯伯忙着收获，脸上挂着丰收的喜悦。', question: '短文描写的是哪个季节？', correctAnswer: '秋天', distractors: ['春天', '夏天', '冬天'] },
  { passage: '小明的文具盒里有铅笔、橡皮、尺子和一本小笔记本。他每天上学前都会检查一遍，从不忘记带文具。', question: '小明是一个怎样的孩子？', correctAnswer: '做事认真仔细', distractors: ['粗心大意', '懒惰散漫', '贪玩好动'] },
  { passage: '啄木鸟是森林里的医生。它用尖锐的嘴巴在树干上啄出小洞，把藏在里面的害虫一条条揪出来。', question: '为什么说啄木鸟是"森林里的医生"？', correctAnswer: '因为它能帮树捉害虫', distractors: ['因为它会治病', '因为它穿着白衣服', '因为它在森林里上班'] },
  { passage: '月光照在地上，像铺了一层白霜。远处传来蝉的鸣叫，近处有蛙声阵阵。', question: '这段话描写的是什么景象？', correctAnswer: '夏天的夜晚', distractors: ['冬天的夜晚', '秋天的夜晚', '春天的夜晚'] },
  { passage: '松鼠是一种可爱的小动物。它有一条毛茸茸的大尾巴，喜欢在树上跳来跳去。冬天快要来的时候，它会储藏松果作为食物。', question: '松鼠用什么来储藏食物？', correctAnswer: '松果', distractors: ['橡果', '坚果', '果实'] },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Utility helpers
// ═══════════════════════════════════════════════════════════════════════════════

let questionCounter = 0;

function generateId(prefix: string): string {
  questionCounter++;
  return `${prefix}-${Date.now()}-${questionCounter}`;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = shuffleArray(arr);
  return shuffled.slice(0, count);
}

function getDifficulty(grade: Grade): 'easy' | 'medium' | 'hard' {
  if (grade <= 2) return 'easy';
  if (grade <= 4) return 'medium';
  return 'hard';
}

function getSemesterSuffix(semester: Semester): string {
  return semester === '上册' ? 'a' : 'b';
}

function getTopicId(grade: Grade, semester: Semester, topic: string): string {
  const s = getSemesterSuffix(semester);
  return `cn-${grade}${s}-${topic}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Generator functions — one per ChineseMode
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate recognize-char questions: pinyin → character
 */
export function generateRecognizeChar(
  grade: Grade, semester: Semester, count: number,
): ChineseQuestion[] {
  const chars = GRADE_CHARS[grade].filter(
    (c) => c.semester === semester || c.semester === 'both',
  );
  const results: ChineseQuestion[] = [];
  const used = new Set<string>();

  for (const char of pickRandom(chars, count + 5)) {
    if (results.length >= count) break;
    if (used.has(char.char)) continue;
    used.add(char.char);

    // Find distractors (similar-looking characters)
    const distractors = chars
      .filter((c) => c.char !== char.char)
      .slice(0, 3)
      .map((c) => c.char);

    if (distractors.length < 3) continue;

    const options = shuffleArray([char.char, ...distractors]);
    const topicId = getTopicId(grade, semester, 'char');

    results.push({
      id: generateId('rc'),
      subject: 'chinese' as const,
      grade,
      semester,
      topicId,
      mode: 'recognize-char' as const,
      prompt: `拼音 "${char.pinyin}" 对应的汉字是哪一个？`,
      correctAnswer: char.char,
      options,
      correctIndex: options.indexOf(char.char),
    });
  }

  return results.slice(0, count);
}

/**
 * Generate recognize-pinyin questions: character → pinyin
 */
export function generateRecognizePinyin(
  grade: Grade, semester: Semester, count: number,
): ChineseQuestion[] {
  const chars = GRADE_CHARS[grade].filter(
    (c) => c.semester === semester || c.semester === 'both',
  );
  const results: ChineseQuestion[] = [];
  const used = new Set<string>();

  for (const char of pickRandom(chars, count + 5)) {
    if (results.length >= count) break;
    if (used.has(char.char)) continue;
    used.add(char.char);

    const distractors = chars
      .filter((c) => c.char !== char.char && c.pinyin !== char.pinyin)
      .slice(0, 3)
      .map((c) => c.pinyin);

    if (distractors.length < 3) continue;

    const options = shuffleArray([char.pinyin, ...distractors]);
    const topicId = getTopicId(grade, semester, 'pinyin');

    results.push({
      id: generateId('rp'),
      subject: 'chinese' as const,
      grade,
      semester,
      topicId,
      mode: 'recognize-pinyin' as const,
      prompt: `"${char.char}" 字的正确拼音是哪一个？`,
      correctAnswer: char.pinyin,
      options,
      correctIndex: options.indexOf(char.pinyin),
    });
  }

  return results.slice(0, count);
}

/**
 * Generate word-match questions from word database
 */
export function generateWordMatch(
  grade: Grade, semester: Semester, count: number,
): ChineseQuestion[] {
  const words = GRADE_WORDS[grade].filter(
    (w) => w.semester === semester || w.semester === 'both',
  );
  const results: ChineseQuestion[] = [];

  for (const word of pickRandom(words, count)) {
    if (results.length >= count) break;

    const distractors = words
      .filter((w) => w.word !== word.word)
      .slice(0, 3)
      .map((w) => w.word);

    if (distractors.length < 3) continue;

    const options = shuffleArray([word.word, ...distractors]);
    const topicId = getTopicId(grade, semester, 'word');

    results.push({
      id: generateId('wm'),
      subject: 'chinese' as const,
      grade,
      semester,
      topicId,
      mode: 'word-match' as const,
      prompt: `"${word.meaning}" 对应的词语是哪一个？`,
      correctAnswer: word.word,
      options,
      correctIndex: options.indexOf(word.word),
    });
  }

  return results.slice(0, count);
}

/**
 * Generate dictation questions: pinyin → word
 */
export function generateDictation(
  grade: Grade, semester: Semester, count: number,
): ChineseQuestion[] {
  const words = GRADE_WORDS[grade].filter(
    (w) => w.semester === semester || w.semester === 'both',
  );
  const results: ChineseQuestion[] = [];

  for (const word of pickRandom(words, count)) {
    if (results.length >= count) break;

    const distractors = words
      .filter((w) => w.word !== word.word)
      .slice(0, 3)
      .map((w) => w.word);

    if (distractors.length < 3) continue;

    const options = shuffleArray([word.word, ...distractors]);
    const topicId = getTopicId(grade, semester, 'dictation');

    results.push({
      id: generateId('di'),
      subject: 'chinese' as const,
      grade,
      semester,
      topicId,
      mode: 'dictation' as const,
      prompt: `请选出拼音 "${word.pinyin}" 对应的词语：`,
      correctAnswer: word.word,
      options,
      correctIndex: options.indexOf(word.word),
    });
  }

  return results.slice(0, count);
}

/**
 * Generate idiom-fill questions: fill blank in idiom
 */
export function generateIdiomFill(
  grade: Grade, semester: Semester, count: number,
): ChineseQuestion[] {
  const results: ChineseQuestion[] = [];
  const difficulty = getDifficulty(grade);

  for (const entry of pickRandom(IDIOM_DB, count + 3)) {
    if (results.length >= count) break;

    const correctChar = entry.idiom[entry.blankIndex]!;
    const display = entry.idiom.slice(0, entry.blankIndex) + '___' + entry.idiom.slice(entry.blankIndex + 1);

    // Build distractors from other idiom characters
    const allChars = IDIOM_DB.map((i) => i.idiom[entry.blankIndex]).filter(Boolean);
    const distractors = pickRandom(
      allChars.filter((c) => c !== correctChar),
      3,
    );

    if (distractors.length < 3) continue;

    const options = shuffleArray([correctChar, ...distractors]);
    const topicId = getTopicId(grade, semester, 'idiom');

    results.push({
      id: generateId('if'),
      subject: 'chinese' as const,
      grade,
      semester,
      topicId,
      mode: 'idiom-fill' as const,
      prompt: `补全成语：${display}`,
      correctAnswer: correctChar,
      options,
      correctIndex: options.indexOf(correctChar),
    });
  }

  return results.slice(0, count);
}

/**
 * Generate antonym questions
 */
export function generateAntonym(
  grade: Grade, semester: Semester, count: number,
): ChineseQuestion[] {
  const results: ChineseQuestion[] = [];

  for (const entry of pickRandom(ANTONYM_DB, count + 3)) {
    if (results.length >= count) break;

    const distractors = pickRandom(
      ANTONYM_DB.filter((a) => a.antonym !== entry.antonym && a.word !== entry.word).map((a) => a.antonym),
      3,
    );

    if (distractors.length < 3) continue;

    const options = shuffleArray([entry.antonym, ...distractors]);
    const topicId = getTopicId(grade, semester, 'antonym');

    results.push({
      id: generateId('an'),
      subject: 'chinese' as const,
      grade,
      semester,
      topicId,
      mode: 'antonym' as const,
      prompt: `请选出"${entry.word}"的反义词。`,
      correctAnswer: entry.antonym,
      options,
      correctIndex: options.indexOf(entry.antonym),
    });
  }

  return results.slice(0, count);
}

/**
 * Generate synonym questions
 */
export function generateSynonym(
  grade: Grade, semester: Semester, count: number,
): ChineseQuestion[] {
  const results: ChineseQuestion[] = [];

  for (const entry of pickRandom(SYNONYM_DB, count + 3)) {
    if (results.length >= count) break;

    const options = shuffleArray([entry.synonym, ...entry.distractors]);
    const topicId = getTopicId(grade, semester, 'synonym');

    results.push({
      id: generateId('sy'),
      subject: 'chinese' as const,
      grade,
      semester,
      topicId,
      mode: 'synonym' as const,
      prompt: `请选出"${entry.word}"的近义词。`,
      correctAnswer: entry.synonym,
      options,
      correctIndex: options.indexOf(entry.synonym),
    });
  }

  return results.slice(0, count);
}

/**
 * Generate poetry-fill questions: fill blank in poem line
 */
export function generatePoetryFill(
  grade: Grade, semester: Semester, count: number,
): ChineseQuestion[] {
  const results: ChineseQuestion[] = [];

  for (const entry of pickRandom(POETRY_DB, count + 3)) {
    if (results.length >= count) break;

    const distractors = ['风', '月', '云', '雨', '花', '雪', '山', '水', '春', '秋']
      .filter((c) => !entry.correctAnswer.includes(c))
      .slice(0, 3);

    if (distractors.length < 3) continue;

    const options = shuffleArray([entry.correctAnswer, ...distractors]);
    const topicId = getTopicId(grade, semester, 'poetry');

    results.push({
      id: generateId('pf'),
      subject: 'chinese' as const,
      grade,
      semester,
      topicId,
      mode: 'poetry-fill' as const,
      prompt: `补全诗句：${entry.lineWithBlank}`,
      correctAnswer: entry.correctAnswer,
      options,
      correctIndex: options.indexOf(entry.correctAnswer),
    });
  }

  return results.slice(0, count);
}

/**
 * Generate sentence-fill questions
 */
export function generateSentenceFill(
  grade: Grade, semester: Semester, count: number,
): ChineseQuestion[] {
  const entries = SENTENCE_FILL_DB[String(grade)] ?? SENTENCE_FILL_DB[String(grade - 1)] ?? [];
  const results: ChineseQuestion[] = [];

  for (const entry of pickRandom(entries, count)) {
    if (results.length >= count) break;

    const options = shuffleArray([entry.correctAnswer, ...entry.distractors]);
    const topicId = getTopicId(grade, semester, 'sentence');

    results.push({
      id: generateId('sf'),
      subject: 'chinese' as const,
      grade,
      semester,
      topicId,
      mode: 'sentence-fill' as const,
      prompt: entry.sentence,
      correctAnswer: entry.correctAnswer,
      options,
      correctIndex: options.indexOf(entry.correctAnswer),
    });
  }

  return results.slice(0, count);
}

/**
 * Generate reading-comprehension questions
 */
export function generateReadingComp(
  grade: Grade, semester: Semester, count: number,
): ChineseQuestion[] {
  const results: ChineseQuestion[] = [];

  for (const entry of pickRandom(READING_COMP_DB, count)) {
    if (results.length >= count) break;

    const options = shuffleArray([entry.correctAnswer, ...entry.distractors]);
    const topicId = getTopicId(grade, semester, 'read');

    results.push({
      id: generateId('rc'),
      subject: 'chinese' as const,
      grade,
      semester,
      topicId,
      mode: 'reading-comp' as const,
      prompt: `短文："${entry.passage}"\n问题是：${entry.question}`,
      correctAnswer: entry.correctAnswer,
      options,
      correctIndex: options.indexOf(entry.correctAnswer),
    });
  }

  return results.slice(0, count);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Mode dispatch: generate questions for any ChineseMode
// ═══════════════════════════════════════════════════════════════════════════════

const MODE_GENERATORS: Record<
  ChineseMode,
  (grade: Grade, semester: Semester, count: number) => ChineseQuestion[]
> = {
  'recognize-char': generateRecognizeChar,
  'recognize-pinyin': generateRecognizePinyin,
  'word-match': generateWordMatch,
  'dictation': generateDictation,
  'idiom-fill': generateIdiomFill,
  'antonym': generateAntonym,
  'poetry-fill': generatePoetryFill,
  'synonym': generateSynonym,
  'sentence-fill': generateSentenceFill,
  'sentence-rearrange': generateSentenceFill, // falls back to sentence-fill
  'reading-comp': generateReadingComp,
};

/**
 * Generate Chinese questions for a specific mode.
 * Falls back to word-match if the mode has no dedicated generator.
 */
export function generateChineseQuestions(
  mode: ChineseMode,
  grade: Grade,
  semester: Semester,
  count: number,
): ChineseQuestion[] {
  const generator = MODE_GENERATORS[mode];
  if (generator) {
    return generator(grade, semester, count);
  }
  // Fallback
  return generateWordMatch(grade, semester, count);
}

/**
 * Generate mixed-mode questions across applicable modes for a grade/semester.
 */
export function generateMixedModeQuestions(
  grade: Grade,
  semester: Semester,
  count: number,
): ChineseQuestion[] {
  // Pick modes appropriate for the grade
  const allModes: ChineseMode[] = [
    'recognize-char',
    'recognize-pinyin',
    'word-match',
    'dictation',
    'idiom-fill',
    'antonym',
    'poetry-fill',
    'synonym',
    'sentence-fill',
    'sentence-rearrange',
    'reading-comp',
  ];

  const applicableModes = allModes.filter((mode) => {
    if (mode === 'recognize-char' || mode === 'recognize-pinyin') return grade <= 3;
    if (mode === 'dictation') return grade <= 4;
    if (mode === 'idiom-fill' || mode === 'antonym' || mode === 'synonym') return grade >= 3;
    if (mode === 'poetry-fill' || mode === 'reading-comp') return grade >= 4;
    if (mode === 'sentence-fill' || mode === 'sentence-rearrange') return grade >= 3;
    return true;
  });

  const perMode = Math.max(1, Math.floor(count / applicableModes.length));
  const results: ChineseQuestion[] = [];

  for (const mode of applicableModes) {
    const qs = generateChineseQuestions(mode, grade, semester, perMode);
    results.push(...qs);
  }

  return shuffleArray(results).slice(0, count);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Convert template data into ChineseQuestion objects
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Convert hand-crafted template questions into full ChineseQuestion objects.
 */
export function generateFromTemplate(
  rawQuestions: ChineseQuestionData[],
  grade: Grade,
  semester: Semester,
  count: number,
  excludeIds?: string[],
): ChineseQuestion[] {
  const exclude = new Set(excludeIds ?? []);
  const results: ChineseQuestion[] = [];

  for (const q of shuffleArray(rawQuestions)) {
    if (results.length >= count) break;

    // Verify the correct answer is in the options
    const optionIndex = q.options.indexOf(q.correctAnswer);
    if (optionIndex === -1) continue;

    // Create a shuffled copy of options
    const shuffledOptions = shuffleArray(q.options);
    const newCorrectIndex = shuffledOptions.indexOf(q.correctAnswer);

    results.push({
      id: generateId(`tpl-${q.mode.slice(0, 2)}`),
      subject: 'chinese' as const,
      grade,
      semester,
      topicId: q.topicId,
      mode: q.mode,
      prompt: q.prompt,
      correctAnswer: q.correctAnswer,
      options: shuffledOptions,
      correctIndex: newCorrectIndex,
    });
  }

  return results.filter((q) => !exclude.has(q.id));
}
