// English practice utilities for 学习小达人

// ─── Types ──────────────────────────────────────────────────────────────────

export type EnglishMode = 'word-picture' | 'picture-word' | 'listening' | 'spelling';
export type EnglishGrade = 1 | 2 | 3 | 4 | 5 | 6;

export interface EnglishQuestion {
  id: string;
  mode: EnglishMode;
  prompt: string;
  correctAnswer: string;
  correctIndex: number;
  options: string[];
  grade: EnglishGrade;
}

export interface EnglishModeConfig {
  mode: EnglishMode;
  emoji: string;
  name: string;
  description: string;
}

// ─── Mode Configuration ─────────────────────────────────────────────────────

const MODE_CONFIGS: Record<EnglishMode, EnglishModeConfig> = {
  'word-picture': {
    mode: 'word-picture',
    emoji: '🖼️',
    name: '看词选图',
    description: '看英文单词，选择正确的图片描述！',
  },
  'picture-word': {
    mode: 'picture-word',
    emoji: '🎨',
    name: '看图选词',
    description: '看中文描述，选择正确的英文单词！',
  },
  'listening': {
    mode: 'listening',
    emoji: '🎧',
    name: '听力挑战',
    description: '听英文发音，选择正确的单词！',
  },
  'spelling': {
    mode: 'spelling',
    emoji: '✏️',
    name: '拼写达人',
    description: '看中文意思，拼写正确的英文单词！',
  },
};

/**
 * Get the mode configuration for a given English mode.
 */
export function getEnglishModeConfig(mode: EnglishMode): EnglishModeConfig {
  return MODE_CONFIGS[mode];
}

export const ALL_ENGLISH_MODES: EnglishModeConfig[] = Object.values(MODE_CONFIGS);

// ─── Vocabulary Database ────────────────────────────────────────────────────

interface VocabEntry {
  word: string;
  phonetic: string;
  meaning: string;
  emoji: string;
}

const GRADE_1_VOCAB: VocabEntry[] = [
  { word: 'apple', phonetic: '/ˈæpl/', meaning: '苹果', emoji: '🍎' },
  { word: 'banana', phonetic: '/bəˈnænə/', meaning: '香蕉', emoji: '🍌' },
  { word: 'cat', phonetic: '/kæt/', meaning: '猫', emoji: '🐱' },
  { word: 'dog', phonetic: '/dɒɡ/', meaning: '狗', emoji: '🐕' },
  { word: 'fish', phonetic: '/fɪʃ/', meaning: '鱼', emoji: '🐟' },
  { word: 'bird', phonetic: '/bɜːrd/', meaning: '鸟', emoji: '🐦' },
  { word: 'sun', phonetic: '/sʌn/', meaning: '太阳', emoji: '☀️' },
  { word: 'moon', phonetic: '/muːn/', meaning: '月亮', emoji: '🌙' },
  { word: 'star', phonetic: '/stɑːr/', meaning: '星星', emoji: '⭐' },
  { word: 'tree', phonetic: '/triː/', meaning: '树', emoji: '🌳' },
  { word: 'flower', phonetic: '/ˈflaʊər/', meaning: '花', emoji: '🌸' },
  { word: 'water', phonetic: '/ˈwɔːtər/', meaning: '水', emoji: '💧' },
  { word: 'book', phonetic: '/bʊk/', meaning: '书', emoji: '📖' },
  { word: 'pen', phonetic: '/pen/', meaning: '笔', emoji: '🖊️' },
  { word: 'red', phonetic: '/red/', meaning: '红色', emoji: '🔴' },
  { word: 'blue', phonetic: '/bluː/', meaning: '蓝色', emoji: '🔵' },
  { word: 'green', phonetic: '/ɡriːn/', meaning: '绿色', emoji: '🟢' },
  { word: 'yellow', phonetic: '/ˈjeləʊ/', meaning: '黄色', emoji: '🟡' },
  { word: 'big', phonetic: '/bɪɡ/', meaning: '大的', emoji: '🐘' },
  { word: 'small', phonetic: '/smɔːl/', meaning: '小的', emoji: '🐜' },
  { word: 'happy', phonetic: '/ˈhæpi/', meaning: '开心', emoji: '😊' },
  { word: 'sad', phonetic: '/sæd/', meaning: '伤心', emoji: '😢' },
  { word: 'milk', phonetic: '/mɪlk/', meaning: '牛奶', emoji: '🥛' },
  { word: 'egg', phonetic: '/eɡ/', meaning: '鸡蛋', emoji: '🥚' },
  { word: 'cake', phonetic: '/keɪk/', meaning: '蛋糕', emoji: '🎂' },
  { word: 'rice', phonetic: '/raɪs/', meaning: '米饭', emoji: '🍚' },
  { word: 'eye', phonetic: '/aɪ/', meaning: '眼睛', emoji: '👁️' },
  { word: 'nose', phonetic: '/nəʊz/', meaning: '鼻子', emoji: '👃' },
  { word: 'hand', phonetic: '/hænd/', meaning: '手', emoji: '✋' },
  { word: 'foot', phonetic: '/fʊt/', meaning: '脚', emoji: '🦶' },
  { word: 'ear', phonetic: '/ɪər/', meaning: '耳朵', emoji: '👂' },
  { word: 'mouth', phonetic: '/maʊθ/', meaning: '嘴巴', emoji: '👄' },
  { word: 'one', phonetic: '/wʌn/', meaning: '一', emoji: '1️⃣' },
  { word: 'two', phonetic: '/tuː/', meaning: '二', emoji: '2️⃣' },
  { word: 'three', phonetic: '/θriː/', meaning: '三', emoji: '3️⃣' },
  { word: 'mom', phonetic: '/mɒm/', meaning: '妈妈', emoji: '👩' },
  { word: 'dad', phonetic: '/dæd/', meaning: '爸爸', emoji: '👨' },
  { word: 'school', phonetic: '/skuːl/', meaning: '学校', emoji: '🏫' },
  { word: 'home', phonetic: '/həʊm/', meaning: '家', emoji: '🏠' },
];

const GRADE_2_VOCAB: VocabEntry[] = [
  { word: 'rabbit', phonetic: '/ˈræbɪt/', meaning: '兔子', emoji: '🐰' },
  { word: 'monkey', phonetic: '/ˈmʌŋki/', meaning: '猴子', emoji: '🐒' },
  { word: 'elephant', phonetic: '/ˈelɪfənt/', meaning: '大象', emoji: '🐘' },
  { word: 'tiger', phonetic: '/ˈtaɪɡər/', meaning: '老虎', emoji: '🐯' },
  { word: 'lion', phonetic: '/ˈlaɪən/', meaning: '狮子', emoji: '🦁' },
  { word: 'spring', phonetic: '/sprɪŋ/', meaning: '春天', emoji: '🌷' },
  { word: 'summer', phonetic: '/ˈsʌmər/', meaning: '夏天', emoji: '🌞' },
  { word: 'autumn', phonetic: '/ˈɔːtəm/', meaning: '秋天', emoji: '🍂' },
  { word: 'winter', phonetic: '/ˈwɪntər/', meaning: '冬天', emoji: '❄️' },
  { word: 'rain', phonetic: '/reɪn/', meaning: '雨', emoji: '🌧️' },
  { word: 'snow', phonetic: '/snəʊ/', meaning: '雪', emoji: '🌨️' },
  { word: 'cloud', phonetic: '/klaʊd/', meaning: '云', emoji: '☁️' },
  { word: 'mountain', phonetic: '/ˈmaʊntɪn/', meaning: '山', emoji: '⛰️' },
  { word: 'river', phonetic: '/ˈrɪvər/', meaning: '河', emoji: '🏞️' },
  { word: 'ocean', phonetic: '/ˈəʊʃən/', meaning: '海洋', emoji: '🌊' },
  { word: 'bread', phonetic: '/bred/', meaning: '面包', emoji: '🍞' },
  { word: 'chicken', phonetic: '/ˈtʃɪkɪn/', meaning: '鸡肉', emoji: '🍗' },
  { word: 'orange', phonetic: '/ˈɒrɪndʒ/', meaning: '橙子', emoji: '🍊' },
  { word: 'grape', phonetic: '/ɡreɪp/', meaning: '葡萄', emoji: '🍇' },
  { word: 'strawberry', phonetic: '/ˈstrɔːbəri/', meaning: '草莓', emoji: '🍓' },
  { word: 'teacher', phonetic: '/ˈtiːtʃər/', meaning: '老师', emoji: '👩‍🏫' },
  { word: 'student', phonetic: '/ˈstjuːdənt/', meaning: '学生', emoji: '🧑‍🎓' },
  { word: 'friend', phonetic: '/frend/', meaning: '朋友', emoji: '🤝' },
  { word: 'family', phonetic: '/ˈfæməli/', meaning: '家庭', emoji: '👨‍👩‍👧‍👦' },
  { word: 'table', phonetic: '/ˈteɪbl/', meaning: '桌子', emoji: '🪑' },
  { word: 'chair', phonetic: '/tʃeər/', meaning: '椅子', emoji: '💺' },
  { word: 'door', phonetic: '/dɔːr/', meaning: '门', emoji: '🚪' },
  { word: 'window', phonetic: '/ˈwɪndəʊ/', meaning: '窗户', emoji: '🪟' },
  { word: 'sleep', phonetic: '/sliːp/', meaning: '睡觉', emoji: '😴' },
  { word: 'run', phonetic: '/rʌn/', meaning: '跑步', emoji: '🏃' },
  { word: 'swim', phonetic: '/swɪm/', meaning: '游泳', emoji: '🏊' },
  { word: 'dance', phonetic: '/dæns/', meaning: '跳舞', emoji: '💃' },
  { word: 'sing', phonetic: '/sɪŋ/', meaning: '唱歌', emoji: '🎤' },
  { word: 'read', phonetic: '/riːd/', meaning: '阅读', emoji: '📚' },
  { word: 'write', phonetic: '/raɪt/', meaning: '写', emoji: '✍️' },
  { word: 'jump', phonetic: '/dʒʌmp/', meaning: '跳', emoji: '🤸' },
  { word: 'fly', phonetic: '/flaɪ/', meaning: '飞', emoji: '🦅' },
  { word: 'eat', phonetic: '/iːt/', meaning: '吃', emoji: '🍽️' },
  { word: 'drink', phonetic: '/drɪŋk/', meaning: '喝', emoji: '🥤' },
  { word: 'play', phonetic: '/pleɪ/', meaning: '玩', emoji: '🎮' },
];

const GRADE_3_VOCAB: VocabEntry[] = [
  { word: 'butterfly', phonetic: '/ˈbʌtərflaɪ/', meaning: '蝴蝶', emoji: '🦋' },
  { word: 'dolphin', phonetic: '/ˈdɒlfɪn/', meaning: '海豚', emoji: '🐬' },
  { word: 'penguin', phonetic: '/ˈpeŋɡwɪn/', meaning: '企鹅', emoji: '🐧' },
  { word: 'giraffe', phonetic: '/dʒɪˈrɑːf/', meaning: '长颈鹿', emoji: '🦒' },
  { word: 'dinosaur', phonetic: '/ˈdaɪnəsɔːr/', meaning: '恐龙', emoji: '🦕' },
  { word: 'rainbow', phonetic: '/ˈreɪnbəʊ/', meaning: '彩虹', emoji: '🌈' },
  { word: 'island', phonetic: '/ˈaɪlənd/', meaning: '岛屿', emoji: '🏝️' },
  { word: 'forest', phonetic: '/ˈfɒrɪst/', meaning: '森林', emoji: '🌲' },
  { word: 'desert', phonetic: '/ˈdezərt/', meaning: '沙漠', emoji: '🏜️' },
  { word: 'volcano', phonetic: '/vɒlˈkeɪnəʊ/', meaning: '火山', emoji: '🌋' },
  { word: 'hospital', phonetic: '/ˈhɒspɪtl/', meaning: '医院', emoji: '🏥' },
  { word: 'library', phonetic: '/ˈlaɪbrəri/', meaning: '图书馆', emoji: '📚' },
  { word: 'museum', phonetic: '/mjuːˈziːəm/', meaning: '博物馆', emoji: '🏛️' },
  { word: 'airport', phonetic: '/ˈeəpɔːrt/', meaning: '机场', emoji: '✈️' },
  { word: 'station', phonetic: '/ˈsteɪʃən/', meaning: '车站', emoji: '🚉' },
  { word: 'breakfast', phonetic: '/ˈbrekfəst/', meaning: '早餐', emoji: '🥞' },
  { word: 'lunch', phonetic: '/lʌntʃ/', meaning: '午餐', emoji: '🥗' },
  { word: 'dinner', phonetic: '/ˈdɪnər/', meaning: '晚餐', emoji: '🍽️' },
  { word: 'vegetable', phonetic: '/ˈvedʒtəbl/', meaning: '蔬菜', emoji: '🥬' },
  { word: 'chocolate', phonetic: '/ˈtʃɒklət/', meaning: '巧克力', emoji: '🍫' },
  { word: 'important', phonetic: '/ɪmˈpɔːrtənt/', meaning: '重要的', emoji: '⭐' },
  { word: 'beautiful', phonetic: '/ˈbjuːtɪfl/', meaning: '美丽的', emoji: '🌺' },
  { word: 'wonderful', phonetic: '/ˈwʌndərfl/', meaning: '精彩的', emoji: '✨' },
  { word: 'delicious', phonetic: '/dɪˈlɪʃəs/', meaning: '美味的', emoji: '😋' },
  { word: 'dangerous', phonetic: '/ˈdeɪndʒərəs/', meaning: '危险的', emoji: '⚠️' },
  { word: 'different', phonetic: '/ˈdɪfrənt/', meaning: '不同的', emoji: '🔄' },
  { word: 'together', phonetic: '/təˈɡeðər/', meaning: '一起', emoji: '🤝' },
  { word: 'tomorrow', phonetic: '/təˈmɒrəʊ/', meaning: '明天', emoji: '📅' },
  { word: 'yesterday', phonetic: '/ˈjestərdeɪ/', meaning: '昨天', emoji: '⏪' },
  { word: 'birthday', phonetic: '/ˈbɜːrθdeɪ/', meaning: '生日', emoji: '🎂' },
  { word: 'holiday', phonetic: '/ˈhɒlɪdeɪ/', meaning: '假期', emoji: '🌴' },
  { word: 'exercise', phonetic: '/ˈeksərsaɪz/', meaning: '锻炼', emoji: '🏋️' },
  { word: 'practice', phonetic: '/ˈpræktɪs/', meaning: '练习', emoji: '📝' },
  { word: 'computer', phonetic: '/kəmˈpjuːtər/', meaning: '电脑', emoji: '💻' },
  { word: 'telephone', phonetic: '/ˈtelɪfəʊn/', meaning: '电话', emoji: '📞' },
  { word: 'umbrella', phonetic: '/ʌmˈbrelə/', meaning: '雨伞', emoji: '☂️' },
  { word: 'guitar', phonetic: '/ɡɪˈtɑːr/', meaning: '吉他', emoji: '🎸' },
  { word: 'piano', phonetic: '/piˈænəʊ/', meaning: '钢琴', emoji: '🎹' },
  { word: 'picture', phonetic: '/ˈpɪktʃər/', meaning: '图片', emoji: '🖼️' },
];

const GRADE_4_VOCAB: VocabEntry[] = [
  { word: 'weather', phonetic: '/ˈweðər/', meaning: '天气', emoji: '🌤️' },
  { word: 'sunny', phonetic: '/ˈsʌni/', meaning: '晴朗的', emoji: '☀️' },
  { word: 'cloudy', phonetic: '/ˈklaʊdi/', meaning: '多云的', emoji: '⛅' },
  { word: 'windy', phonetic: '/ˈwɪndi/', meaning: '有风的', emoji: '💨' },
  { word: 'jacket', phonetic: '/ˈdʒækɪt/', meaning: '夹克', emoji: '🧥' },
  { word: 'sweater', phonetic: '/ˈswetər/', meaning: '毛衣', emoji: '🧶' },
  { word: 'uniform', phonetic: '/ˈjuːnɪfɔːrm/', meaning: '校服', emoji: '👔' },
  { word: 'sneakers', phonetic: '/ˈsniːkərz/', meaning: '运动鞋', emoji: '👟' },
  { word: 'hobby', phonetic: '/ˈhɒbi/', meaning: '爱好', emoji: '🎯' },
  { word: 'painting', phonetic: '/ˈpeɪntɪŋ/', meaning: '绘画', emoji: '🎨' },
  { word: 'collect', phonetic: '/kəˈlekt/', meaning: '收集', emoji: '📦' },
  { word: 'science', phonetic: '/ˈsaɪəns/', meaning: '科学', emoji: '🔬' },
  { word: 'history', phonetic: '/ˈhɪstəri/', meaning: '历史', emoji: '📜' },
  { word: 'geography', phonetic: '/dʒiˈɒɡrəfi/', meaning: '地理', emoji: '🗺️' },
  { word: 'morning', phonetic: '/ˈmɔːrnɪŋ/', meaning: '早上', emoji: '🌅' },
  { word: 'afternoon', phonetic: '/ˌæftərˈnuːn/', meaning: '下午', emoji: '🌇' },
  { word: 'evening', phonetic: '/ˈiːvnɪŋ/', meaning: '傍晚', emoji: '🌆' },
  { word: 'tonight', phonetic: '/təˈnaɪt/', meaning: '今晚', emoji: '🌙' },
  { word: 'midnight', phonetic: '/ˈmɪdnaɪt/', meaning: '午夜', emoji: '🌑' },
  { word: 'weekend', phonetic: '/ˌwiːkˈend/', meaning: '周末', emoji: '🎪' },
  { word: 'usually', phonetic: '/ˈjuːʒuəli/', meaning: '通常', emoji: '🔄' },
  { word: 'sometimes', phonetic: '/ˈsʌmtaɪmz/', meaning: '有时候', emoji: '❓' },
  { word: 'always', phonetic: '/ˈɔːlweɪz/', meaning: '总是', emoji: '♾️' },
  { word: 'never', phonetic: '/ˈnevər/', meaning: '从不', emoji: '🚫' },
  { word: 'clothes', phonetic: '/kləʊðz/', meaning: '衣服', emoji: '👕' },
  { word: 'umbrella', phonetic: '/ʌmˈbrelə/', meaning: '雨伞', emoji: '☂️' },
  { word: 'temperature', phonetic: '/ˈtemprətʃər/', meaning: '温度', emoji: '🌡️' },
  { word: 'season', phonetic: '/ˈsiːzn/', meaning: '季节', emoji: '🌱' },
  { word: 'subject', phonetic: '/ˈsʌbdʒekt/', meaning: '科目', emoji: '📖' },
  { word: 'favorite', phonetic: '/ˈfeɪvərɪt/', meaning: '最喜欢的', emoji: '❤️' },
  { word: 'difficult', phonetic: '/ˈdɪfɪkəlt/', meaning: '困难的', emoji: '🧩' },
  { word: 'easy', phonetic: '/ˈiːzi/', meaning: '容易的', emoji: '✅' },
  { word: 'interesting', phonetic: '/ˈɪntrəstɪŋ/', meaning: '有趣的', emoji: '🤩' },
  { word: 'boring', phonetic: '/ˈbɔːrɪŋ/', meaning: '无聊的', emoji: '😴' },
  { word: 'exciting', phonetic: '/ɪkˈsaɪtɪŋ/', meaning: '令人兴奋的', emoji: '🎉' },
  { word: 'trousers', phonetic: '/ˈtraʊzərz/', meaning: '裤子', emoji: '👖' },
  { word: 'dress', phonetic: '/dres/', meaning: '连衣裙', emoji: '👗' },
  { word: 'homework', phonetic: '/ˈhəʊmwɜːrk/', meaning: '家庭作业', emoji: '📝' },
];

const GRADE_5_VOCAB: VocabEntry[] = [
  { word: 'travel', phonetic: '/ˈtrævl/', meaning: '旅行', emoji: '✈️' },
  { word: 'passport', phonetic: '/ˈpɑːspɔːrt/', meaning: '护照', emoji: '📕' },
  { word: 'luggage', phonetic: '/ˈlʌɡɪdʒ/', meaning: '行李', emoji: '🧳' },
  { word: 'journey', phonetic: '/ˈdʒɜːrni/', meaning: '旅程', emoji: '🗺️' },
  { word: 'abroad', phonetic: '/əˈbrɔːd/', meaning: '国外', emoji: '🌍' },
  { word: 'nature', phonetic: '/ˈneɪtʃər/', meaning: '大自然', emoji: '🌿' },
  { word: 'environment', phonetic: '/ɪnˈvaɪrənmənt/', meaning: '环境', emoji: '🌍' },
  { word: 'recycle', phonetic: '/riːˈsaɪkl/', meaning: '回收利用', emoji: '♻️' },
  { word: 'protect', phonetic: '/prəˈtekt/', meaning: '保护', emoji: '🛡️' },
  { word: 'pollution', phonetic: '/pəˈluːʃən/', meaning: '污染', emoji: '🏭' },
  { word: 'feeling', phonetic: '/ˈfiːlɪŋ/', meaning: '感觉', emoji: '💭' },
  { word: 'nervous', phonetic: '/ˈnɜːrvəs/', meaning: '紧张的', emoji: '😰' },
  { word: 'excited', phonetic: '/ɪkˈsaɪtɪd/', meaning: '激动的', emoji: '🤩' },
  { word: 'worried', phonetic: '/ˈwʌrid/', meaning: '担心的', emoji: '😟' },
  { word: 'surprised', phonetic: '/sərˈpraɪzd/', meaning: '惊讶的', emoji: '😲' },
  { word: 'proud', phonetic: '/praʊd/', meaning: '骄傲的', emoji: '🥹' },
  { word: 'disappointed', phonetic: '/ˌdɪsəˈpɔɪntɪd/', meaning: '失望的', emoji: '😞' },
  { word: 'courage', phonetic: '/ˈkʌrɪdʒ/', meaning: '勇气', emoji: '💪' },
  { word: 'comparison', phonetic: '/kəmˈpærɪsn/', meaning: '比较', emoji: '⚖️' },
  { word: 'cheaper', phonetic: '/ˈtʃiːpər/', meaning: '更便宜的', emoji: '💲' },
  { word: 'expensive', phonetic: '/ɪkˈspensɪv/', meaning: '昂贵的', emoji: '💎' },
  { word: 'taller', phonetic: '/ˈtɔːlər/', meaning: '更高的', emoji: '📏' },
  { word: 'shorter', phonetic: '/ˈʃɔːrtər/', meaning: '更矮的', emoji: '📐' },
  { word: 'stronger', phonetic: '/ˈstrɒŋɡər/', meaning: '更强壮的', emoji: '🏋️' },
  { word: 'faster', phonetic: '/ˈfɑːstər/', meaning: '更快的', emoji: '⚡' },
  { word: 'routine', phonetic: '/ruːˈtiːn/', meaning: '日常', emoji: '📋' },
  { word: 'wake', phonetic: '/weɪk/', meaning: '醒来', emoji: '⏰' },
  { word: 'breakfast', phonetic: '/ˈbrekfəst/', meaning: '早餐', emoji: '🥞' },
  { word: 'arrive', phonetic: '/əˈraɪv/', meaning: '到达', emoji: '🏁' },
  { word: 'prepare', phonetic: '/prɪˈpeər/', meaning: '准备', emoji: '🎒' },
  { word: 'discover', phonetic: '/dɪsˈkʌvər/', meaning: '发现', emoji: '🔭' },
  { word: 'explore', phonetic: '/ɪkˈsplɔːr/', meaning: '探索', emoji: '🧭' },
  { word: 'encourage', phonetic: '/ɪnˈkʌrɪdʒ/', meaning: '鼓励', emoji: '🤗' },
  { word: 'improve', phonetic: '/ɪmˈpruːv/', meaning: '提高', emoji: '📈' },
  { word: 'complete', phonetic: '/kəmˈpliːt/', meaning: '完成', emoji: '✅' },
  { word: 'receive', phonetic: '/rɪˈsiːv/', meaning: '收到', emoji: '💌' },
  { word: 'comfortable', phonetic: '/ˈkʌmftəbl/', meaning: '舒适的', emoji: '🛋️' },
  { word: 'wonderful', phonetic: '/ˈwʌndərfl/', meaning: '精彩的', emoji: '🌟' },
  { word: 'experience', phonetic: '/ɪkˈspɪriəns/', meaning: '经历', emoji: '🎲' },
];

const GRADE_6_VOCAB: VocabEntry[] = [
  { word: 'planet', phonetic: '/ˈplænɪt/', meaning: '星球', emoji: '🪐' },
  { word: 'universe', phonetic: '/ˈjuːnɪvɜːrs/', meaning: '宇宙', emoji: '🌌' },
  { word: 'energy', phonetic: '/ˈenərdʒi/', meaning: '能源', emoji: '⚡' },
  { word: 'climate', phonetic: '/ˈklaɪmət/', meaning: '气候', emoji: '🌤️' },
  { word: 'wildlife', phonetic: '/ˈwaɪldlaɪf/', meaning: '野生动物', emoji: '🦁' },
  { word: 'technology', phonetic: '/tekˈnɒlədʒi/', meaning: '技术', emoji: '💻' },
  { word: 'internet', phonetic: '/ˈɪntərnet/', meaning: '互联网', emoji: '🌐' },
  { word: 'robot', phonetic: '/ˈrəʊbɒt/', meaning: '机器人', emoji: '🤖' },
  { word: 'invention', phonetic: '/ɪnˈvenʃən/', meaning: '发明', emoji: '💡' },
  { word: 'software', phonetic: '/ˈsɒftweər/', meaning: '软件', emoji: '💿' },
  { word: 'achieve', phonetic: '/əˈtʃiːv/', meaning: '实现', emoji: '🏆' },
  { word: 'success', phonetic: '/səkˈses/', meaning: '成功', emoji: '🎯' },
  { word: 'confident', phonetic: '/ˈkɒnfɪdənt/', meaning: '自信的', emoji: '💪' },
  { word: 'effort', phonetic: '/ˈefərt/', meaning: '努力', emoji: '💪' },
  { word: 'challenge', phonetic: '/ˈtʃælɪndʒ/', meaning: '挑战', emoji: '🏔️' },
  { word: 'society', phonetic: '/səˈsaɪəti/', meaning: '社会', emoji: '🏙️' },
  { word: 'culture', phonetic: '/ˈkʌltʃər/', meaning: '文化', emoji: '🎭' },
  { word: 'tradition', phonetic: '/trəˈdɪʃən/', meaning: '传统', emoji: '🏮' },
  { word: 'celebrate', phonetic: '/ˈselɪbreɪt/', meaning: '庆祝', emoji: '🎊' },
  { word: 'festival', phonetic: '/ˈfestɪvl/', meaning: '节日', emoji: '🪅' },
  { word: 'popular', phonetic: '/ˈpɒpjələr/', meaning: '受欢迎的', emoji: '⭐' },
  { word: 'patient', phonetic: '/ˈpeɪʃənt/', meaning: '耐心的', emoji: '🧘' },
  { word: 'responsible', phonetic: '/rɪˈspɒnsɪbl/', meaning: '负责任的', emoji: '📋' },
  { word: 'generous', phonetic: '/ˈdʒenərəs/', meaning: '慷慨的', emoji: '🎁' },
  { word: 'curious', phonetic: '/ˈkjʊriəs/', meaning: '好奇的', emoji: '🧐' },
  { word: 'imagine', phonetic: '/ɪˈmædʒɪn/', meaning: '想象', emoji: '💭' },
  { word: 'knowledge', phonetic: '/ˈnɒlɪdʒ/', meaning: '知识', emoji: '📚' },
  { word: 'opportunity', phonetic: '/ˌɒpərˈtjuːnəti/', meaning: '机会', emoji: '🚪' },
  { word: 'decision', phonetic: '/dɪˈsɪʒən/', meaning: '决定', emoji: '⚖️' },
  { word: 'advantage', phonetic: '/ədˈvɑːntɪdʒ/', meaning: '优势', emoji: '📈' },
  { word: 'purpose', phonetic: '/ˈpɜːrpəs/', meaning: '目的', emoji: '🎯' },
  { word: 'volunteer', phonetic: '/ˌvɒlənˈtɪər/', meaning: '志愿者', emoji: '🤝' },
  { word: 'communicate', phonetic: '/kəˈmjuːnɪkeɪt/', meaning: '交流', emoji: '💬' },
  { word: 'organize', phonetic: '/ˈɔːrɡənaɪz/', meaning: '组织', emoji: '📋' },
  { word: 'independent', phonetic: '/ˌɪndɪˈpendənt/', meaning: '独立的', emoji: '🦅' },
  { word: 'grateful', phonetic: '/ˈɡreɪtfl/', meaning: '感恩的', emoji: '🙏' },
  { word: 'adventure', phonetic: '/ədˈventʃər/', meaning: '冒险', emoji: '🗺️' },
  { word: 'describe', phonetic: '/dɪˈskraɪb/', meaning: '描述', emoji: '📝' },
  { word: 'excellent', phonetic: '/ˈeksələnt/', meaning: '优秀的', emoji: '🌟' },
  { word: 'necessary', phonetic: '/ˈnesəsəri/', meaning: '必要的', emoji: '✅' },
];

const GRADED_VOCAB: Record<EnglishGrade, VocabEntry[]> = {
  1: GRADE_1_VOCAB,
  2: GRADE_2_VOCAB,
  3: GRADE_3_VOCAB,
  4: GRADE_4_VOCAB,
  5: GRADE_5_VOCAB,
  6: GRADE_6_VOCAB,
};

// ─── Helpers ────────────────────────────────────────────────────────────────

let englishQuestionIdCounter = 0;
function genEnglishId(): string {
  return `eq-${Date.now()}-${++englishQuestionIdCounter}`;
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

function generateWordPictureQuestion(grade: EnglishGrade): EnglishQuestion {
  const vocab = GRADED_VOCAB[grade];
  const correct = pickRandom(vocab);
  const allVocab = Object.values(GRADED_VOCAB).flat();
  const distractors = getDistractors(correct.meaning, allVocab.map((v) => v.meaning), 3);
  const options = shuffle([correct.meaning, ...distractors]);

  return {
    id: genEnglishId(),
    mode: 'word-picture',
    prompt: correct.word,
    correctAnswer: correct.meaning,
    correctIndex: options.indexOf(correct.meaning),
    options,
    grade,
  };
}

function generatePictureWordQuestion(grade: EnglishGrade): EnglishQuestion {
  const vocab = GRADED_VOCAB[grade];
  const correct = pickRandom(vocab);
  const allVocab = Object.values(GRADED_VOCAB).flat();
  const distractors = getDistractors(correct.word, allVocab.map((v) => v.word), 3);
  const options = shuffle([correct.word, ...distractors]);

  return {
    id: genEnglishId(),
    mode: 'picture-word',
    prompt: `${correct.emoji} ${correct.meaning}`,
    correctAnswer: correct.word,
    correctIndex: options.indexOf(correct.word),
    options,
    grade,
  };
}

function generateListeningQuestion(grade: EnglishGrade): EnglishQuestion {
  const vocab = GRADED_VOCAB[grade];
  const correct = pickRandom(vocab);
  const allVocab = Object.values(GRADED_VOCAB).flat();
  const distractors = getDistractors(correct.word, allVocab.map((v) => v.word), 3);
  const options = shuffle([correct.word, ...distractors]);

  // For listening mode, prompt is the word to be spoken via TTS
  return {
    id: genEnglishId(),
    mode: 'listening',
    prompt: correct.word, // This will be spoken via TTS
    correctAnswer: correct.word,
    correctIndex: options.indexOf(correct.word),
    options,
    grade,
  };
}

function generateSpellingQuestion(grade: EnglishGrade): EnglishQuestion {
  const vocab = GRADED_VOCAB[grade];
  const correct = pickRandom(vocab);
  const allVocab = Object.values(GRADED_VOCAB).flat();
  const distractors = getDistractors(correct.word, allVocab.map((v) => v.word), 3);
  const options = shuffle([correct.word, ...distractors]);

  return {
    id: genEnglishId(),
    mode: 'spelling',
    prompt: `${correct.emoji} ${correct.meaning} (${correct.phonetic})`,
    correctAnswer: correct.word,
    correctIndex: options.indexOf(correct.word),
    options,
    grade,
  };
}

// ─── Main Generator ─────────────────────────────────────────────────────────

/**
 * Generate an array of English practice questions.
 *
 * @param mode - The practice mode
 * @param grade - 1 through 6
 * @param count - Number of questions to generate (default 10)
 * @returns Array of EnglishQuestion objects
 */
export function generateEnglishQuestions(
  mode: EnglishMode,
  grade: EnglishGrade,
  count: number = 10
): EnglishQuestion[] {
  const questions: EnglishQuestion[] = [];

  for (let i = 0; i < count; i++) {
    let question: EnglishQuestion;
    switch (mode) {
      case 'word-picture':
        question = generateWordPictureQuestion(grade);
        break;
      case 'picture-word':
        question = generatePictureWordQuestion(grade);
        break;
      case 'listening':
        question = generateListeningQuestion(grade);
        break;
      case 'spelling':
        question = generateSpellingQuestion(grade);
        break;
      default:
        question = generateWordPictureQuestion(grade);
    }
    questions.push(question);
  }

  return questions;
}
