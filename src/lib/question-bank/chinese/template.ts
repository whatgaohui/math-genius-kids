// ═══════════════════════════════════════════════════════════════════════════════
// Chinese Question Bank — Template (语文题库模板)
// ─────────────────────────────────────────────────────────────────────────────
// This file defines the data format for Chinese questions and provides a
// comprehensive example template covering ALL 6 grades × 2 semesters.
//
// Data collectors should use this template as the reference for how to
// format and organize Chinese question data for the "知识小勇士" app.
//
// 所有题目内容基于人教版 (PEP) 语文教材，确保年级适宜性。
// ═══════════════════════════════════════════════════════════════════════════════

import type { ChineseMode, Grade, Semester } from '../types';

// ─── Chinese Question Data Interface ─────────────────────────────────────────

/**
 * Represents a single Chinese question entry in the question bank.
 *
 * Each question is designed for a specific grade, semester, and topic,
 * following the 人教版 curriculum. Data collectors should provide
 * grade-appropriate content aligned with textbook materials.
 *
 * @example
 * ```ts
 * const entry: ChineseQuestionData = {
 *   topicId: 'cn-1a-pinyin',
 *   mode: 'recognize-pinyin',
 *   prompt: '"大"字的正确拼音是？',
 *   correctAnswer: 'dà',
 *   options: ['dà', 'tài', 'dài', 'tā'],
 *   difficulty: 'easy',
 * };
 * ```
 */
export interface ChineseQuestionData {
  /**
   * The topic ID this question belongs to.
   *
   * Must match a topic ID defined in the curriculum configuration.
   * Format: `cn-{grade}{semester}-{topic}` where:
   *   - `grade`: 1-6
   *   - `semester`: `a` (上册) or `b` (下册)
   *   - `topic`: short identifier (e.g., `pinyin`, `char`, `idiom`)
   *
   * @see `curriculum-config.ts` for all valid topic IDs
   *
   * @example 'cn-1a-pinyin' — Grade 1, 上册, 拼音入门
   * @example 'cn-4a-idiom' — Grade 4, 上册, 成语世界
   * @example 'cn-6b-culture' — Grade 6, 下册, 文学常识
   */
  topicId: string;

  /**
   * The practice mode for this question.
   *
   * Different modes determine the UI presentation and interaction style:
   *
   * | Mode                 | Description                                                    | Best Grades |
   * |----------------------|----------------------------------------------------------------|-------------|
   * | `recognize-char`     | Character recognition: pinyin → character                      | 1-2         |
   * | `recognize-pinyin`   | Pinyin recognition: character → pinyin                        | 1-2         |
   * | `word-match`         | Word matching: definition/context → word                       | 1-6         |
   * | `dictation`          | Simulated dictation: pinyin → character/word                   | 1-3         |
   * | `idiom-fill`         | Idiom completion: fill the blank in a 4-char idiom             | 4-6         |
   * | `antonym`            | Antonym identification: word → opposite word                   | 4-6         |
   * | `poetry-fill`        | Poetry completion: fill the blank in a classic poem line        | 5-6         |
   * | `synonym`            | Synonym identification: word → similar word                    | 4-6         |
   * | `sentence-fill`      | Sentence completion: fill the blank in a sentence               | 3-6         |
   * | `sentence-rearrange` | Sentence ordering: select the correct order of a scrambled sentence | 4-6       |
   * | `reading-comp`       | Reading comprehension: passage + question → answer             | 5-6         |
   */
  mode: ChineseMode;

  /**
   * The question prompt displayed to the student.
   *
   * Should be written in clear, age-appropriate Chinese.
   * For younger grades (1-2), use short, simple sentences.
   * For older grades (5-6), can include more context and nuance.
   *
   * @example '"大"字的正确拼音是？' (Grade 1)
   * @example '请选出"美丽"的反义词。' (Grade 4)
   * @example '补全诗句：床前___光。' (Grade 5)
   */
  prompt: string;

  /**
   * The correct answer string.
   *
   * For character/pinyin modes: a single character or pinyin string.
   * For idiom-fill: the missing character.
   * For poetry-fill: the missing character(s).
   * For word-match/synonym/antonym: the target word.
   * For sentence-fill: the word/phrase that completes the sentence.
   * For reading-comp: the answer text.
   */
  correctAnswer: string;

  /**
   * Array of exactly 4 multiple-choice options.
   *
   * The correct answer MUST be included in this array.
   * Distractors should be plausible but clearly wrong.
   * For younger grades, distractors should be visually/phonetically similar.
   * For older grades, distractors should test deeper understanding.
   *
   * Order does NOT matter — the system will shuffle options at runtime.
   */
  options: string[];

  /**
   * Estimated difficulty level of the question.
   *
   * - `'easy'` — Basic recall, straightforward recognition.
   * - `'medium'` — Requires some understanding or discrimination.
   * - `'hard'` — Tests deep understanding or advanced knowledge.
   *
   * Difficulty should be calibrated to the target grade.
   */
  difficulty: 'easy' | 'medium' | 'hard';
}

// ─── Topic metadata helper ───────────────────────────────────────────────────

/** Metadata for a topic within the template. */
interface TopicTemplate {
  id: string;
  name: string;
  description: string;
  modes: ChineseMode[];
  questions: ChineseQuestionData[];
}

/** Semester data within a grade. */
interface SemesterTemplate {
  semester: Semester;
  topics: TopicTemplate[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHINESE_BANK_TEMPLATE — Complete example data for all 6 grades × 2 semesters
// ═══════════════════════════════════════════════════════════════════════════════

export const CHINESE_BANK_TEMPLATE: {
  meta: {
    id: string;
    name: string;
    version: string;
    subject: 'chinese';
    description: string;
    source: string;
    author?: string;
    lastUpdated?: string;
  };
  data: Record<number, Record<Semester, SemesterTemplate>>;
} = {
  meta: {
    id: 'chinese-pep-v1',
    name: '人教版语文题库',
    version: '1.0.0',
    subject: 'chinese',
    description:
      '基于人教版语文教材的小学语文题库，覆盖一年级至六年级，共12个学期36个知识点。',
    source: '人教版小学语文教材（2019版）',
    author: '知识小勇士教研团队',
    lastUpdated: '2024-01-01',
  },

  data: {
    // ═══════════════════════════════════════════════════════════════════════
    // Grade 1 — 一年级：基础识字与拼音
    // ═══════════════════════════════════════════════════════════════════════
    1: {
      '上册': {
        semester: '上册',
        topics: [
          {
            id: 'cn-1a-pinyin',
            name: '拼音入门',
            description: '声母、韵母和整体认读音节的认识与拼读',
            modes: ['recognize-pinyin', 'recognize-char', 'dictation'],
            questions: [
              { topicId: 'cn-1a-pinyin', mode: 'recognize-pinyin', prompt: '"大"字的正确拼音是哪一个？', correctAnswer: 'dà', options: ['dà', 'tài', 'dài', 'tā'], difficulty: 'easy' },
              { topicId: 'cn-1a-pinyin', mode: 'recognize-pinyin', prompt: '"小"字的正确拼音是哪一个？', correctAnswer: 'xiǎo', options: ['xiǎo', 'shǎo', 'xiào', 'shào'], difficulty: 'easy' },
              { topicId: 'cn-1a-pinyin', mode: 'recognize-pinyin', prompt: '"水"字的正确拼音是哪一个？', correctAnswer: 'shuǐ', options: ['shuǐ', 'suǐ', 'shuí', 'shuì'], difficulty: 'easy' },
              { topicId: 'cn-1a-pinyin', mode: 'recognize-pinyin', prompt: '"山"字的正确拼音是哪一个？', correctAnswer: 'shān', options: ['shān', 'sān', 'shàn', 'sàn'], difficulty: 'medium' },
              { topicId: 'cn-1a-pinyin', mode: 'recognize-pinyin', prompt: '"火"字的正确拼音是哪一个？', correctAnswer: 'huǒ', options: ['huǒ', 'huó', 'hǔ', 'hòu'], difficulty: 'medium' },
            ],
          },
          {
            id: 'cn-1a-char',
            name: '识字天地',
            description: '认识基本汉字，学习笔画和笔顺',
            modes: ['recognize-char', 'dictation'],
            questions: [
              { topicId: 'cn-1a-char', mode: 'recognize-char', prompt: '拼音 "rén" 对应的汉字是哪一个？', correctAnswer: '人', options: ['人', '入', '八', '大'], difficulty: 'easy' },
              { topicId: 'cn-1a-char', mode: 'recognize-char', prompt: '拼音 "tiān" 对应的汉字是哪一个？', correctAnswer: '天', options: ['天', '夫', '无', '大'], difficulty: 'easy' },
              { topicId: 'cn-1a-char', mode: 'recognize-char', prompt: '拼音 "shǒu" 对应的汉字是哪一个？', correctAnswer: '手', options: ['手', '毛', '才', '看'], difficulty: 'medium' },
              { topicId: 'cn-1a-char', mode: 'recognize-char', prompt: '拼音 "mù" 对应的汉字是哪一个？', correctAnswer: '目', options: ['目', '自', '日', '月'], difficulty: 'medium' },
            ],
          },
          {
            id: 'cn-1a-radical',
            name: '偏旁部首',
            description: '认识常见偏旁部首，了解汉字结构',
            modes: ['recognize-char', 'word-match'],
            questions: [
              { topicId: 'cn-1a-radical', mode: 'recognize-char', prompt: '"花"字的偏旁部首是哪一个？', correctAnswer: '艹', options: ['艹', '木', '氵', '亻'], difficulty: 'easy' },
              { topicId: 'cn-1a-radical', mode: 'recognize-char', prompt: '"河"字的偏旁部首是哪一个？', correctAnswer: '氵', options: ['氵', '亻', '艹', '口'], difficulty: 'easy' },
              { topicId: 'cn-1a-radical', mode: 'recognize-char', prompt: '"妈"字的偏旁部首是哪一个？', correctAnswer: '女', options: ['女', '子', '亻', '口'], difficulty: 'easy' },
              { topicId: 'cn-1a-radical', mode: 'word-match', prompt: '下面哪个字带有"亻"（单人旁）？', correctAnswer: '他', options: ['他', '她', '它', '池'], difficulty: 'medium' },
            ],
          },
        ],
      },
      '下册': {
        semester: '下册',
        topics: [
          {
            id: 'cn-1b-word',
            name: '词语启蒙',
            description: '常见词语的学习和运用',
            modes: ['word-match', 'dictation'],
            questions: [
              { topicId: 'cn-1b-word', mode: 'word-match', prompt: '"太阳"指的是什么？', correctAnswer: '太阳', options: ['太阳', '月亮', '星星', '白云'], difficulty: 'easy' },
              { topicId: 'cn-1b-word', mode: 'word-match', prompt: '我们每天去___上课。', correctAnswer: '学校', options: ['学校', '医院', '商店', '公园'], difficulty: 'easy' },
              { topicId: 'cn-1b-word', mode: 'word-match', prompt: '___教我们读书写字。', correctAnswer: '老师', options: ['老师', '同学', '朋友', '家长'], difficulty: 'easy' },
              { topicId: 'cn-1b-word', mode: 'word-match', prompt: '和我们一起上课的人叫做___。', correctAnswer: '同学', options: ['同学', '老师', '朋友', '邻居'], difficulty: 'medium' },
            ],
          },
          {
            id: 'cn-1b-dictation',
            name: '听写练习',
            description: '听发音写汉字，巩固识字能力',
            modes: ['dictation', 'recognize-char'],
            questions: [
              { topicId: 'cn-1b-dictation', mode: 'dictation', prompt: '请选出拼音 "xiǎo gǒu" 对应的词语：', correctAnswer: '小狗', options: ['小狗', '小鸟', '小猫', '小鱼'], difficulty: 'easy' },
              { topicId: 'cn-1b-dictation', mode: 'dictation', prompt: '请选出拼音 "péng you" 对应的词语：', correctAnswer: '朋友', options: ['朋友', '同学', '老师', '家人'], difficulty: 'easy' },
              { topicId: 'cn-1b-dictation', mode: 'dictation', prompt: '请选出拼音 "huā yuán" 对应的词语：', correctAnswer: '花园', options: ['花园', '学校', '公园', '操场'], difficulty: 'medium' },
              { topicId: 'cn-1b-dictation', mode: 'dictation', prompt: '请选出拼音 "yún" 对应的汉字：', correctAnswer: '云', options: ['云', '去', '会', '雪'], difficulty: 'medium' },
            ],
          },
          {
            id: 'cn-1b-stroke',
            name: '笔顺练习',
            description: '汉字笔顺和基本笔画的学习',
            modes: ['recognize-char', 'word-match'],
            questions: [
              { topicId: 'cn-1b-stroke', mode: 'recognize-char', prompt: '"大"字的第一笔是什么？', correctAnswer: '横', options: ['横', '竖', '撇', '捺'], difficulty: 'easy' },
              { topicId: 'cn-1b-stroke', mode: 'recognize-char', prompt: '"十"字由哪两个笔画组成？', correctAnswer: '横和竖', options: ['横和竖', '横和撇', '撇和捺', '竖和横'], difficulty: 'easy' },
              { topicId: 'cn-1b-stroke', mode: 'recognize-char', prompt: '"木"字共有几画？', correctAnswer: '4画', options: ['3画', '4画', '5画', '6画'], difficulty: 'medium' },
              { topicId: 'cn-1b-stroke', mode: 'recognize-char', prompt: '"人"字的笔顺正确的是？', correctAnswer: '先撇后捺', options: ['先撇后捺', '先捺后撇', '先横后竖', '先竖后横'], difficulty: 'medium' },
            ],
          },
        ],
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // Grade 2 — 二年级：汉字扩展与词汇积累
    // ═══════════════════════════════════════════════════════════════════════
    2: {
      '上册': {
        semester: '上册',
        topics: [
          {
            id: 'cn-2a-char2',
            name: '汉字进阶',
            description: '认识更多常用汉字，区分形近字',
            modes: ['recognize-char', 'recognize-pinyin'],
            questions: [
              { topicId: 'cn-2a-char2', mode: 'recognize-char', prompt: '拼音 "chūn" 对应的汉字是哪一个？', correctAnswer: '春', options: ['春', '看', '香', '真'], difficulty: 'easy' },
              { topicId: 'cn-2a-char2', mode: 'recognize-char', prompt: '"己"和"已"长得像，下面哪个是"自己"的"己"？', correctAnswer: '己', options: ['己', '已', '巳', '己'], difficulty: 'medium' },
              { topicId: 'cn-2a-char2', mode: 'recognize-char', prompt: '下面哪个字表示"很高"？', correctAnswer: '高', options: ['高', '搞', '稿', '告'], difficulty: 'easy' },
              { topicId: 'cn-2a-char2', mode: 'recognize-char', prompt: '"木"字加一笔可以变成下面哪个字？', correctAnswer: '本', options: ['本', '末', '未', '禾'], difficulty: 'hard' },
            ],
          },
          {
            id: 'cn-2a-pinyin2',
            name: '拼音巩固',
            description: '多音字和易混淆拼音辨析',
            modes: ['recognize-pinyin', 'recognize-char'],
            questions: [
              { topicId: 'cn-2a-pinyin2', mode: 'recognize-pinyin', prompt: '"绿"字在"绿叶"中的正确读音是？', correctAnswer: 'lǜ', options: ['lǜ', 'lù', 'lú', 'lü'], difficulty: 'easy' },
              { topicId: 'cn-2a-pinyin2', mode: 'recognize-pinyin', prompt: '"长"字在"长大"中的正确读音是？', correctAnswer: 'zhǎng', options: ['zhǎng', 'cháng', 'zhàng', 'chǎng'], difficulty: 'medium' },
              { topicId: 'cn-2a-pinyin2', mode: 'recognize-pinyin', prompt: '"乐"字在"快乐"中的正确读音是？', correctAnswer: 'lè', options: ['lè', 'yuè', 'lē', 'luò'], difficulty: 'medium' },
              { topicId: 'cn-2a-pinyin2', mode: 'recognize-pinyin', prompt: '"只"字在"一只鸟"中的正确读音是？', correctAnswer: 'zhī', options: ['zhī', 'zhǐ', 'zī', 'zǐ'], difficulty: 'hard' },
            ],
          },
          {
            id: 'cn-2a-radical2',
            name: '部首查字',
            description: '用部首查字典的方法识字',
            modes: ['recognize-char', 'word-match'],
            questions: [
              { topicId: 'cn-2a-radical2', mode: 'recognize-char', prompt: '"想"字的部首是什么？', correctAnswer: '心', options: ['心', '木', '目', '相'], difficulty: 'medium' },
              { topicId: 'cn-2a-radical2', mode: 'recognize-char', prompt: '"园"字的部首是什么？', correctAnswer: '囗', options: ['囗', '元', '二', '十'], difficulty: 'medium' },
              { topicId: 'cn-2a-radical2', mode: 'recognize-char', prompt: '"空"字的部首是什么？', correctAnswer: '穴', options: ['穴', '工', '八', '宀'], difficulty: 'hard' },
              { topicId: 'cn-2a-radical2', mode: 'word-match', prompt: '下面哪个字的部首是"讠"（言字旁）？', correctAnswer: '说', options: ['说', '话', '读', '讲'], difficulty: 'easy' },
            ],
          },
        ],
      },
      '下册': {
        semester: '下册',
        topics: [
          {
            id: 'cn-2b-word2',
            name: '词语搭配',
            description: '近义词、反义词和词语搭配',
            modes: ['word-match', 'antonym', 'synonym'],
            questions: [
              { topicId: 'cn-2b-word2', mode: 'word-match', prompt: '"美丽的___"，下面哪个词语最合适？', correctAnswer: '花朵', options: ['花朵', '跑步', '写字', '勇敢'], difficulty: 'easy' },
              { topicId: 'cn-2b-word2', mode: 'word-match', prompt: '"高兴地___"，下面哪个词语最合适？', correctAnswer: '唱歌', options: ['唱歌', '难过', '安静', '认真'], difficulty: 'easy' },
              { topicId: 'cn-2b-word2', mode: 'word-match', prompt: '"慢慢地___"，下面哪个词语最合适？', correctAnswer: '走', options: ['走', '快跑', '飞快', '急忙'], difficulty: 'medium' },
              { topicId: 'cn-2b-word2', mode: 'word-match', prompt: '"___的天空"，下面哪个词语最合适？', correctAnswer: '蓝蓝的', options: ['蓝蓝的', '绿绿的', '红红的', '黄黄的'], difficulty: 'easy' },
            ],
          },
          {
            id: 'cn-2b-dictation2',
            name: '听写进阶',
            description: '词语和短句的听写训练',
            modes: ['dictation', 'recognize-char'],
            questions: [
              { topicId: 'cn-2b-dictation2', mode: 'dictation', prompt: '请选出拼音 "měi lì" 对应的词语：', correctAnswer: '美丽', options: ['美丽', '快乐', '勇敢', '聪明'], difficulty: 'easy' },
              { topicId: 'cn-2b-dictation2', mode: 'dictation', prompt: '请选出拼音 "sēn lín" 对应的词语：', correctAnswer: '森林', options: ['森林', '公园', '草原', '花园'], difficulty: 'easy' },
              { topicId: 'cn-2b-dictation2', mode: 'dictation', prompt: '请选出拼音 "cōng míng" 对应的词语：', correctAnswer: '聪明', options: ['聪明', '糊涂', '马虎', '粗心'], difficulty: 'medium' },
              { topicId: 'cn-2b-dictation2', mode: 'dictation', prompt: '请选出拼音 "dòng wù" 对应的词语：', correctAnswer: '动物', options: ['动物', '植物', '运动', '动作'], difficulty: 'medium' },
            ],
          },
          {
            id: 'cn-2b-riddle',
            name: '猜字谜',
            description: '趣味字谜和谜语，锻炼思维能力',
            modes: ['word-match', 'recognize-char'],
            questions: [
              { topicId: 'cn-2b-riddle', mode: 'word-match', prompt: '谜语："一口咬掉牛尾巴"，猜一个字。', correctAnswer: '告', options: ['告', '牛', '口', '吞'], difficulty: 'medium' },
              { topicId: 'cn-2b-riddle', mode: 'word-match', prompt: '谜语："两人土上坐"，猜一个字。', correctAnswer: '坐', options: ['坐', '座', '土', '从'], difficulty: 'medium' },
              { topicId: 'cn-2b-riddle', mode: 'word-match', prompt: '谜语："日字加一笔"，可以变成下面哪个字？', correctAnswer: '白', options: ['白', '目', '田', '由'], difficulty: 'hard' },
              { topicId: 'cn-2b-riddle', mode: 'word-match', prompt: '谜语："王先生白小姐坐在石头上"，猜一个字。', correctAnswer: '碧', options: ['碧', '王', '白', '石'], difficulty: 'hard' },
            ],
          },
        ],
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // Grade 3 — 三年级：句子与段落
    // ═══════════════════════════════════════════════════════════════════════
    3: {
      '上册': {
        semester: '上册',
        topics: [
          {
            id: 'cn-3a-read',
            name: '阅读理解',
            description: '词语和句子的理解与运用',
            modes: ['word-match', 'reading-comp', 'sentence-fill'],
            questions: [
              { topicId: 'cn-3a-read', mode: 'word-match', prompt: '"探索"是什么意思？', correctAnswer: '多方寻求答案', options: ['多方寻求答案', '随便看看', '大声说话', '快速跑步'], difficulty: 'easy' },
              { topicId: 'cn-3a-read', mode: 'reading-comp', prompt: '短文："春天来了，小草从泥土里探出头来，桃花开了，小燕子从南方飞回来了。"\n问题是：短文中描写了哪些春天的景象？', correctAnswer: '小草发芽、桃花开放、燕子归来', options: ['小草发芽、桃花开放、燕子归来', '树叶变黄、菊花开放', '雪花飘落、河水结冰', '蝉鸣蛙叫、荷花开放'], difficulty: 'easy' },
              { topicId: 'cn-3a-read', mode: 'sentence-fill', prompt: '春天来了，公园里的花都___了。', correctAnswer: '开', options: ['开', '落', '谢', '枯'], difficulty: 'easy' },
              { topicId: 'cn-3a-read', mode: 'word-match', prompt: '"创造"和下面哪个词意思最接近？', correctAnswer: '发明', options: ['发明', '发现', '破坏', '学习'], difficulty: 'medium' },
            ],
          },
          {
            id: 'cn-3a-sentence',
            name: '造句练习',
            description: '用词语造句，理解句式结构',
            modes: ['word-match', 'sentence-fill'],
            questions: [
              { topicId: 'cn-3a-sentence', mode: 'sentence-fill', prompt: '用"因为……所以……"造句：___下雨了，___我没去公园。', correctAnswer: '因为', options: ['因为', '虽然', '如果', '不但'], difficulty: 'easy' },
              { topicId: 'cn-3a-sentence', mode: 'sentence-fill', prompt: '用"一边……一边……"造句：妈妈___做饭，___唱歌。', correctAnswer: '一边', options: ['一边', '一面', '一直', '一下'], difficulty: 'easy' },
              { topicId: 'cn-3a-sentence', mode: 'sentence-fill', prompt: '用"不但……而且……"造句：他___学习好，___体育也很棒。', correctAnswer: '不但', options: ['不但', '因为', '虽然', '如果'], difficulty: 'medium' },
              { topicId: 'cn-3a-sentence', mode: 'word-match', prompt: '"仔细地"后面应该接什么类型的词？', correctAnswer: '动词', options: ['动词', '名词', '形容词', '数词'], difficulty: 'medium' },
            ],
          },
          {
            id: 'cn-3a-rhetoric',
            name: '修辞手法',
            description: '比喻、拟人等基本修辞手法',
            modes: ['word-match'],
            questions: [
              { topicId: 'cn-3a-rhetoric', mode: 'word-match', prompt: '"弯弯的月亮像小船"用了什么修辞手法？', correctAnswer: '比喻', options: ['比喻', '拟人', '夸张', '排比'], difficulty: 'easy' },
              { topicId: 'cn-3a-rhetoric', mode: 'word-match', prompt: '"小草在风中点头"用了什么修辞手法？', correctAnswer: '拟人', options: ['拟人', '比喻', '夸张', '对偶'], difficulty: 'easy' },
              { topicId: 'cn-3a-rhetoric', mode: 'word-match', prompt: '"飞流直下三千尺"用了什么修辞手法？', correctAnswer: '夸张', options: ['夸张', '比喻', '拟人', '排比'], difficulty: 'medium' },
              { topicId: 'cn-3a-rhetoric', mode: 'word-match', prompt: '下面的句子中，哪个是比喻句？', correctAnswer: '妹妹的脸蛋像红苹果', options: ['妹妹的脸蛋像红苹果', '小鸟在树上唱歌', '花儿对我微笑', '太阳公公出来了'], difficulty: 'medium' },
            ],
          },
        ],
      },
      '下册': {
        semester: '下册',
        topics: [
          {
            id: 'cn-3b-write',
            name: '看图写话',
            description: '观察图片，练习写话和写段',
            modes: ['word-match', 'sentence-fill'],
            questions: [
              { topicId: 'cn-3b-write', mode: 'sentence-fill', prompt: '看图写话：图中小朋友们在操场上___。填写合适的词语。', correctAnswer: '跑步', options: ['跑步', '写字', '睡觉', '做饭'], difficulty: 'easy' },
              { topicId: 'cn-3b-write', mode: 'sentence-fill', prompt: '看图写话：天气___，我们决定去郊游。', correctAnswer: '晴朗', options: ['晴朗', '下雨', '刮风', '下雪'], difficulty: 'easy' },
              { topicId: 'cn-3b-write', mode: 'word-match', prompt: '写话时，一段话的开头应该注意什么？', correctAnswer: '空两格', options: ['空两格', '顶格写', '写满一行', '不换行'], difficulty: 'medium' },
              { topicId: 'cn-3b-write', mode: 'sentence-fill', prompt: '看图写话：花园里的花真___啊！', correctAnswer: '美', options: ['美', '丑', '大', '小'], difficulty: 'easy' },
            ],
          },
          {
            id: 'cn-3b-dictation3',
            name: '综合听写',
            description: '句子级别的听写训练',
            modes: ['dictation', 'sentence-fill'],
            questions: [
              { topicId: 'cn-3b-dictation3', mode: 'dictation', prompt: '听写词语："jiān chí"是什么词？', correctAnswer: '坚持', options: ['坚持', '简单', '坚强', '坚硬'], difficulty: 'medium' },
              { topicId: 'cn-3b-dictation3', mode: 'dictation', prompt: '听写词语："bāng zhù"是什么词？', correctAnswer: '帮助', options: ['帮助', '打扫', '保护', '包围'], difficulty: 'easy' },
              { topicId: 'cn-3b-dictation3', mode: 'sentence-fill', prompt: '听写填空：我们要___别人的劳动成果。', correctAnswer: '尊重', options: ['尊重', '浪费', '破坏', '忽视'], difficulty: 'medium' },
              { topicId: 'cn-3b-dictation3', mode: 'dictation', prompt: '听写词语："gǎn xiè"是什么词？', correctAnswer: '感谢', options: ['感谢', '感觉', '感动', '感恩'], difficulty: 'easy' },
            ],
          },
          {
            id: 'cn-3b-punctuation',
            name: '标点符号',
            description: '句号、逗号、问号、感叹号等标点的使用',
            modes: ['word-match', 'sentence-fill'],
            questions: [
              { topicId: 'cn-3b-punctuation', mode: 'word-match', prompt: '表示一句话说完的标点符号是哪个？', correctAnswer: '句号', options: ['句号', '逗号', '问号', '感叹号'], difficulty: 'easy' },
              { topicId: 'cn-3b-punctuation', mode: 'word-match', prompt: '表示疑问语气的标点符号是哪个？', correctAnswer: '问号', options: ['问号', '句号', '逗号', '顿号'], difficulty: 'easy' },
              { topicId: 'cn-3b-punctuation', mode: 'sentence-fill', prompt: '下面的句子应该用什么标点？"今天的天气真好___"', correctAnswer: '感叹号', options: ['感叹号', '问号', '句号', '逗号'], difficulty: 'easy' },
              { topicId: 'cn-3b-punctuation', mode: 'word-match', prompt: '列举多个事物时，中间用什么标点符号？', correctAnswer: '顿号', options: ['顿号', '逗号', '分号', '句号'], difficulty: 'medium' },
            ],
          },
        ],
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // Grade 4 — 四年级：成语与阅读
    // ═══════════════════════════════════════════════════════════════════════
    4: {
      '上册': {
        semester: '上册',
        topics: [
          {
            id: 'cn-4a-idiom',
            name: '成语世界',
            description: '常见成语的学习和运用',
            modes: ['idiom-fill', 'word-match'],
            questions: [
              { topicId: 'cn-4a-idiom', mode: 'idiom-fill', prompt: '补全成语：一心___意', correctAnswer: '一', options: ['一', '二', '三', '十'], difficulty: 'easy' },
              { topicId: 'cn-4a-idiom', mode: 'idiom-fill', prompt: '补全成语：画龙点___', correctAnswer: '睛', options: ['睛', '晴', '精', '情'], difficulty: 'medium' },
              { topicId: 'cn-4a-idiom', mode: 'idiom-fill', prompt: '补全成语：守株___兔', correctAnswer: '待', options: ['待', '代', '带', '戴'], difficulty: 'medium' },
              { topicId: 'cn-4a-idiom', mode: 'word-match', prompt: '"画龙点睛"这个成语的意思是什么？', correctAnswer: '关键处加上精辟之笔', options: ['关键处加上精辟之笔', '画一条龙', '用龙做标记', '很有耐心'], difficulty: 'medium' },
              { topicId: 'cn-4a-idiom', mode: 'idiom-fill', prompt: '补全成语：亡羊补___', correctAnswer: '牢', options: ['牢', '劳', '老', '落'], difficulty: 'easy' },
            ],
          },
          {
            id: 'cn-4a-comprehension',
            name: '阅读进阶',
            description: '短文阅读与理解练习',
            modes: ['reading-comp', 'sentence-fill'],
            questions: [
              { topicId: 'cn-4a-comprehension', mode: 'reading-comp', prompt: '短文："秋天的果园里，苹果红了，梨子黄了，葡萄紫了。农民伯伯忙着收获，脸上挂着丰收的喜悦。"\n问题：短文描写的是哪个季节？', correctAnswer: '秋天', options: ['秋天', '春天', '夏天', '冬天'], difficulty: 'easy' },
              { topicId: 'cn-4a-comprehension', mode: 'reading-comp', prompt: '短文："小明的文具盒里有铅笔、橡皮、尺子和一本小笔记本。他每天上学前都会检查一遍，从不忘记带文具。"\n问题：小明是一个怎样的孩子？', correctAnswer: '做事认真仔细', options: ['做事认真仔细', '粗心大意', '懒惰散漫', '贪玩好动'], difficulty: 'medium' },
              { topicId: 'cn-4a-comprehension', mode: 'sentence-fill', prompt: '根据短文内容填空：农民伯伯脸上挂着___的喜悦。', correctAnswer: '丰收', options: ['丰收', '收获', '快乐', '高兴'], difficulty: 'easy' },
              { topicId: 'cn-4a-comprehension', mode: 'reading-comp', prompt: '短文："啄木鸟是森林里的医生。它用尖锐的嘴巴在树干上啄出小洞，把藏在里面的害虫一条条揪出来。"\n问题：为什么说啄木鸟是"森林里的医生"？', correctAnswer: '因为它能帮树捉害虫', options: ['因为它能帮树捉害虫', '因为它会治病', '因为它穿着白衣服', '因为它在森林里上班'], difficulty: 'medium' },
            ],
          },
          {
            id: 'cn-4a-memo',
            name: '书信与应用文',
            description: '书信、通知、便条等应用文的格式与写作',
            modes: ['word-match', 'sentence-fill'],
            questions: [
              { topicId: 'cn-4a-memo', mode: 'word-match', prompt: '写信时，称呼应该写在信纸的什么位置？', correctAnswer: '第一行顶格', options: ['第一行顶格', '第一行空两格', '最后一行', '中间位置'], difficulty: 'easy' },
              { topicId: 'cn-4a-memo', mode: 'word-match', prompt: '书信中"此致敬礼"的"敬礼"应该写在哪里？', correctAnswer: '下一行顶格', options: ['下一行顶格', '同一行', '下一行空两格', '最后一行'], difficulty: 'medium' },
              { topicId: 'cn-4a-memo', mode: 'sentence-fill', prompt: '写通知时，先要写清楚___，再写清楚通知的内容。', correctAnswer: '时间', options: ['时间', '天气', '姓名', '日期'], difficulty: 'easy' },
              { topicId: 'cn-4a-memo', mode: 'word-match', prompt: '下面哪个不属于书信的组成部分？', correctAnswer: '天气预报', options: ['天气预报', '称呼', '正文', '署名'], difficulty: 'medium' },
            ],
          },
        ],
      },
      '下册': {
        semester: '下册',
        topics: [
          {
            id: 'cn-4b-antonym',
            name: '反义词辨析',
            description: '反义词的识别与运用',
            modes: ['antonym', 'word-match'],
            questions: [
              { topicId: 'cn-4b-antonym', mode: 'antonym', prompt: '请选出"美丽"的反义词。', correctAnswer: '丑陋', options: ['丑陋', '漂亮', '温柔', '善良'], difficulty: 'easy' },
              { topicId: 'cn-4b-antonym', mode: 'antonym', prompt: '请选出"勤劳"的反义词。', correctAnswer: '懒惰', options: ['懒惰', '勤奋', '聪明', '勇敢'], difficulty: 'easy' },
              { topicId: 'cn-4b-antonym', mode: 'antonym', prompt: '请选出"安全"的反义词。', correctAnswer: '危险', options: ['危险', '安静', '平稳', '固定'], difficulty: 'easy' },
              { topicId: 'cn-4b-antonym', mode: 'antonym', prompt: '请选出"谦虚"的反义词。', correctAnswer: '骄傲', options: ['骄傲', '谦虚', '谨慎', '认真'], difficulty: 'medium' },
              { topicId: 'cn-4b-antonym', mode: 'word-match', prompt: '"光明"和"黑暗"是什么关系？', correctAnswer: '反义词', options: ['反义词', '近义词', '同义词', '没有关系'], difficulty: 'easy' },
            ],
          },
          {
            id: 'cn-4b-sentence2',
            name: '扩句缩句',
            description: '句子的扩充和缩写练习',
            modes: ['sentence-fill', 'word-match'],
            questions: [
              { topicId: 'cn-4b-sentence2', mode: 'word-match', prompt: '"燕子飞过海面"缩句后是？', correctAnswer: '燕子飞过', options: ['燕子飞过', '燕子飞过海面', '燕子', '飞过海面'], difficulty: 'medium' },
              { topicId: 'cn-4b-sentence2', mode: 'sentence-fill', prompt: '扩句："太阳升起来了。" → ___的太阳升起来了。', correctAnswer: '火红', options: ['火红', '火红的', '蓝蓝的', '大大的'], difficulty: 'medium' },
              { topicId: 'cn-4b-sentence2', mode: 'sentence-fill', prompt: '扩句："花儿开了。" → 公园里的花儿___开了。', correctAnswer: '美丽的', options: ['美丽的', '美丽', '悄悄地', '慢慢地'], difficulty: 'easy' },
              { topicId: 'cn-4b-sentence2', mode: 'word-match', prompt: '下面哪个是缩句的正确方法？', correctAnswer: '去掉修饰成分保留主干', options: ['去掉修饰成分保留主干', '加上更多形容词', '把句子变长', '把句子反过来写'], difficulty: 'medium' },
            ],
          },
          {
            id: 'cn-4b-reorder',
            name: '排列句序',
            description: '把打乱顺序的句子排列成通顺的段落',
            modes: ['sentence-rearrange'],
            questions: [
              { topicId: 'cn-4b-reorder', mode: 'sentence-rearrange', prompt: '把下面的句子排成通顺的段落，正确的顺序是？\n①妹妹在放风筝\n②风筝越飞越高\n③公园里人来人往\n④春天到了', correctAnswer: '④③①②', options: ['④③①②', '③④①②', '①②③④', '④①③②'], difficulty: 'medium' },
              { topicId: 'cn-4b-reorder', mode: 'sentence-rearrange', prompt: '把下面的句子排成通顺的段落：\n①我连忙走过去\n②突然看到一位老奶奶摔倒在地上\n③放学回家的路上\n④把她扶了起来', correctAnswer: '③②①④', options: ['③②①④', '②①④③', '③①②④', '①②③④'], difficulty: 'medium' },
              { topicId: 'cn-4b-reorder', mode: 'sentence-rearrange', prompt: '把下面的句子排成通顺的段落：\n①不一会儿雨就停了\n②可是还没走到学校\n③早上出门没带伞\n④就下起了大雨', correctAnswer: '③②④①', options: ['③②④①', '③④②①', '②③④①', '④①②③'], difficulty: 'hard' },
              { topicId: 'cn-4b-reorder', mode: 'sentence-rearrange', prompt: '把下面的句子排成通顺的段落：\n①原来是一只小鸟掉下来了\n②抬头一看\n③我正在花园里散步\n④听到树上有声音', correctAnswer: '③④②①', options: ['③④②①', '④②①③', '③②④①', '②③④①'], difficulty: 'hard' },
            ],
          },
        ],
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // Grade 5 — 五年级：古诗词与表达
    // ═══════════════════════════════════════════════════════════════════════
    5: {
      '上册': {
        semester: '上册',
        topics: [
          {
            id: 'cn-5a-poetry',
            name: '古诗词',
            description: '经典古诗词的背诵与理解',
            modes: ['poetry-fill', 'reading-comp'],
            questions: [
              { topicId: 'cn-5a-poetry', mode: 'poetry-fill', prompt: '补全诗句：床前___光，疑是地上霜。', correctAnswer: '明月', options: ['明月', '明夜', '明星', '明亮'], difficulty: 'easy' },
              { topicId: 'cn-5a-poetry', mode: 'poetry-fill', prompt: '补全诗句：春眠不觉晓，处处闻___鸟。', correctAnswer: '啼', options: ['啼', '鸣', '叫', '唱'], difficulty: 'easy' },
              { topicId: 'cn-5a-poetry', mode: 'poetry-fill', prompt: '补全诗句：锄禾日当___，汗滴禾下土。', correctAnswer: '午', options: ['午', '牛', '半', '平'], difficulty: 'easy' },
              { topicId: 'cn-5a-poetry', mode: 'reading-comp', prompt: '"白日依山尽，黄河入海流"描写的是什么时候的景色？', correctAnswer: '傍晚', options: ['傍晚', '早晨', '中午', '夜晚'], difficulty: 'medium' },
              { topicId: 'cn-5a-poetry', mode: 'poetry-fill', prompt: '补全诗句：飞流直下三千___，疑是银河落九天。', correctAnswer: '尺', options: ['尺', '丈', '里', '米'], difficulty: 'medium' },
            ],
          },
          {
            id: 'cn-5a-synonym',
            name: '近义词辨析',
            description: '近义词的理解和区分',
            modes: ['synonym', 'word-match'],
            questions: [
              { topicId: 'cn-5a-synonym', mode: 'synonym', prompt: '请选出"美丽"的近义词。', correctAnswer: '漂亮', options: ['漂亮', '丑陋', '凶猛', '粗心'], difficulty: 'easy' },
              { topicId: 'cn-5a-synonym', mode: 'synonym', prompt: '请选出"安静"的近义词。', correctAnswer: '宁静', options: ['宁静', '热闹', '嘈杂', '慌乱'], difficulty: 'easy' },
              { topicId: 'cn-5a-synonym', mode: 'synonym', prompt: '请选出"立刻"的近义词。', correctAnswer: '马上', options: ['马上', '缓慢', '推迟', '犹豫'], difficulty: 'easy' },
              { topicId: 'cn-5a-synonym', mode: 'synonym', prompt: '请选出"珍贵"的近义词。', correctAnswer: '宝贵', options: ['宝贵', '廉价', '普通', '常见'], difficulty: 'medium' },
              { topicId: 'cn-5a-synonym', mode: 'word-match', prompt: '"观看"和"欣赏"的意思接近，它们的区别是什么？', correctAnswer: '"欣赏"带有喜爱之情', options: ['"欣赏"带有喜爱之情', '意思完全相同', '"观看"更高级', '没有区别'], difficulty: 'hard' },
            ],
          },
          {
            id: 'cn-5a-composition',
            name: '作文基础',
            description: '写作的基础技巧和结构训练',
            modes: ['word-match', 'sentence-fill'],
            questions: [
              { topicId: 'cn-5a-composition', mode: 'word-match', prompt: '写一件事情的文章，通常按照什么顺序来写？', correctAnswer: '时间顺序', options: ['时间顺序', '字母顺序', '大小顺序', '颜色顺序'], difficulty: 'easy' },
              { topicId: 'cn-5a-composition', mode: 'word-match', prompt: '写人物时，可以从哪些方面来描写？', correctAnswer: '外貌、动作、语言、心理', options: ['外貌、动作、语言、心理', '只有外貌', '只有语言', '只有动作'], difficulty: 'medium' },
              { topicId: 'cn-5a-composition', mode: 'sentence-fill', prompt: '写作文时，开头要___，吸引读者的注意。', correctAnswer: '精彩', options: ['精彩', '平淡', '简短', '重复'], difficulty: 'easy' },
              { topicId: 'cn-5a-composition', mode: 'word-match', prompt: '写作文时，围绕一个中心意思，可以怎样展开？', correctAnswer: '从几个方面具体写', options: ['从几个方面具体写', '只写一句话', '写很多不相关的事', '不用管中心'], difficulty: 'medium' },
            ],
          },
        ],
      },
      '下册': {
        semester: '下册',
        topics: [
          {
            id: 'cn-5b-idiom2',
            name: '成语典故',
            description: '了解成语背后的故事和寓意',
            modes: ['idiom-fill', 'word-match'],
            questions: [
              { topicId: 'cn-5b-idiom2', mode: 'word-match', prompt: '"掩耳盗铃"这个成语告诉我们什么道理？', correctAnswer: '自欺欺人', options: ['自欺欺人', '要保护耳朵', '铃铛很好听', '偷偷拿东西'], difficulty: 'easy' },
              { topicId: 'cn-5b-idiom2', mode: 'word-match', prompt: '"守株待兔"这个成语告诉我们什么道理？', correctAnswer: '不能不劳而获', options: ['不能不劳而获', '种树很重要', '兔子很可爱', '要守在树旁'], difficulty: 'easy' },
              { topicId: 'cn-5b-idiom2', mode: 'idiom-fill', prompt: '补全成语：___公移山', correctAnswer: '愚', options: ['愚', '遇', '于', '余'], difficulty: 'easy' },
              { topicId: 'cn-5b-idiom2', mode: 'word-match', prompt: '"叶公好龙"这个成语比喻什么？', correctAnswer: '表面喜欢实际害怕', options: ['表面喜欢实际害怕', '喜欢画画', '龙很漂亮', '叶公是好人'], difficulty: 'medium' },
              { topicId: 'cn-5b-idiom2', mode: 'idiom-fill', prompt: '补全成语：纸上___兵', correctAnswer: '谈', options: ['谈', '弹', '叹', '探'], difficulty: 'medium' },
            ],
          },
          {
            id: 'cn-5b-rhetoric2',
            name: '修辞进阶',
            description: '排比、对偶等进阶修辞手法',
            modes: ['word-match', 'reading-comp'],
            questions: [
              { topicId: 'cn-5b-rhetoric2', mode: 'word-match', prompt: '"天上的白云千姿百态：有的像绵羊，有的像棉花糖，有的像雪山。"用了什么修辞手法？', correctAnswer: '排比和比喻', options: ['排比和比喻', '只有排比', '只有比喻', '拟人和夸张'], difficulty: 'medium' },
              { topicId: 'cn-5b-rhetoric2', mode: 'word-match', prompt: '"两个黄鹂鸣翠柳，一行白鹭上青天"用了什么修辞手法？', correctAnswer: '对偶', options: ['对偶', '比喻', '夸张', '拟人'], difficulty: 'medium' },
              { topicId: 'cn-5b-rhetoric2', mode: 'word-match', prompt: '"他跑得比风还快"这句话属于什么修辞？', correctAnswer: '夸张', options: ['夸张', '比喻', '拟人', '排比'], difficulty: 'easy' },
              { topicId: 'cn-5b-rhetoric2', mode: 'reading-comp', prompt: '"花儿在微风中轻轻点头，蝴蝶在花丛中翩翩起舞。"这句话中有什么修辞手法？', correctAnswer: '拟人', options: ['拟人', '比喻', '排比', '夸张'], difficulty: 'easy' },
            ],
          },
          {
            id: 'cn-5b-modify',
            name: '修改病句',
            description: '发现并修改句子中的错误',
            modes: ['sentence-fill', 'word-match'],
            questions: [
              { topicId: 'cn-5b-modify', mode: 'word-match', prompt: '"看了这本书，很受教育"这个句子的毛病是？', correctAnswer: '缺少主语', options: ['缺少主语', '标点错误', '用词不当', '语序不对'], difficulty: 'easy' },
              { topicId: 'cn-5b-modify', mode: 'word-match', prompt: '"我们要发扬的优点"这个句子的毛病是？', correctAnswer: '成分残缺', options: ['成分残缺', '搭配不当', '标点错误', '没有毛病'], difficulty: 'medium' },
              { topicId: 'cn-5b-modify', mode: 'sentence-fill', prompt: '修改病句："他的写作水平明显增加了。"应该把"增加"改为___。', correctAnswer: '提高', options: ['提高', '增加', '扩大', '升高'], difficulty: 'easy' },
              { topicId: 'cn-5b-modify', mode: 'word-match', prompt: '"我估计他今天肯定不会来了"这个句子的毛病是？', correctAnswer: '前后矛盾', options: ['前后矛盾', '缺少主语', '用词重复', '没有毛病'], difficulty: 'hard' },
            ],
          },
        ],
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // Grade 6 — 六年级：综合提升
    // ═══════════════════════════════════════════════════════════════════════
    6: {
      '上册': {
        semester: '上册',
        topics: [
          {
            id: 'cn-6a-idiom3',
            name: '成语进阶',
            description: '更多成语的学习与灵活运用',
            modes: ['idiom-fill', 'word-match'],
            questions: [
              { topicId: 'cn-6a-idiom3', mode: 'idiom-fill', prompt: '补全成语：胸有成___', correctAnswer: '竹', options: ['竹', '足', '珠', '烛'], difficulty: 'medium' },
              { topicId: 'cn-6a-idiom3', mode: 'idiom-fill', prompt: '补全成语：___立鸡群', correctAnswer: '鹤', options: ['鹤', '合', '盒', '和'], difficulty: 'medium' },
              { topicId: 'cn-6a-idiom3', mode: 'word-match', prompt: '"胸有成竹"这个成语比喻什么？', correctAnswer: '做事之前已有把握', options: ['做事之前已有把握', '喜欢竹子', '胸很大', '竹子很好看'], difficulty: 'medium' },
              { topicId: 'cn-6a-idiom3', mode: 'idiom-fill', prompt: '补全成语：半途而___', correctAnswer: '废', options: ['废', '费', '飞', '非'], difficulty: 'easy' },
              { topicId: 'cn-6a-idiom3', mode: 'idiom-fill', prompt: '补全成语：入木___分', correctAnswer: '三', options: ['三', '十', '深', '千'], difficulty: 'medium' },
            ],
          },
          {
            id: 'cn-6a-poetry2',
            name: '古诗词进阶',
            description: '更多经典古诗词的学习和赏析',
            modes: ['poetry-fill', 'reading-comp'],
            questions: [
              { topicId: 'cn-6a-poetry2', mode: 'poetry-fill', prompt: '补全诗句：两个黄鹂鸣翠___，一行白鹭上青天。', correctAnswer: '柳', options: ['柳', '林', '山', '田'], difficulty: 'easy' },
              { topicId: 'cn-6a-poetry2', mode: 'poetry-fill', prompt: '补全诗句：慈母手中___，游子身上衣。', correctAnswer: '线', options: ['线', '衣', '针', '布'], difficulty: 'easy' },
              { topicId: 'cn-6a-poetry2', mode: 'poetry-fill', prompt: '补全诗句：千山鸟飞___，万径人踪灭。', correctAnswer: '绝', options: ['绝', '尽', '无', '走'], difficulty: 'medium' },
              { topicId: 'cn-6a-poetry2', mode: 'reading-comp', prompt: '"慈母手中线，游子身上衣"表达了什么感情？', correctAnswer: '母爱', options: ['母爱', '友情', '爱国', '思乡'], difficulty: 'medium' },
              { topicId: 'cn-6a-poetry2', mode: 'poetry-fill', prompt: '补全诗句：小荷才露尖尖___，早有蜻蜓立上头。', correctAnswer: '角', options: ['角', '头', '尾', '尖'], difficulty: 'medium' },
            ],
          },
          {
            id: 'cn-6a-argument',
            name: '阅读答题技巧',
            description: '阅读理解答题方法与技巧',
            modes: ['reading-comp', 'word-match'],
            questions: [
              { topicId: 'cn-6a-argument', mode: 'reading-comp', prompt: '短文："少年易老学难成，一寸光阴不可轻。未觉池塘春草梦，阶前梧叶已秋声。"\n这首诗告诉我们的道理是？', correctAnswer: '要珍惜时间努力学习', options: ['要珍惜时间努力学习', '池塘很美', '秋天到了', '梦很好做'], difficulty: 'medium' },
              { topicId: 'cn-6a-argument', mode: 'word-match', prompt: '做阅读理解题时，首先要做什么？', correctAnswer: '通读全文', options: ['通读全文', '直接答题', '只看问题', '猜答案'], difficulty: 'easy' },
              { topicId: 'cn-6a-argument', mode: 'reading-comp', prompt: '短文："竹石（郑燮）咬定青山不放松，立根原在破岩中。千磨万击还坚劲，任尔东西南北风。"\n这首诗表达了作者怎样的品质？', correctAnswer: '坚韧不拔', options: ['坚韧不拔', '喜欢竹子', '喜欢石头', '热爱大自然'], difficulty: 'hard' },
              { topicId: 'cn-6a-argument', mode: 'word-match', prompt: '回答"这段话说明了什么道理"这类问题，应该怎么做？', correctAnswer: '找出中心句或总结中心思想', options: ['找出中心句或总结中心思想', '抄写第一句', '随便写写', '不用回答'], difficulty: 'medium' },
            ],
          },
        ],
      },
      '下册': {
        semester: '下册',
        topics: [
          {
            id: 'cn-6b-poetry3',
            name: '诗词鉴赏',
            description: '诗歌的意境、情感和赏析',
            modes: ['poetry-fill', 'reading-comp'],
            questions: [
              { topicId: 'cn-6b-poetry3', mode: 'poetry-fill', prompt: '补全诗句：桃花潭水深千___，不及汪伦送我情。', correctAnswer: '尺', options: ['尺', '丈', '里', '寸'], difficulty: 'easy' },
              { topicId: 'cn-6b-poetry3', mode: 'poetry-fill', prompt: '补全诗句：白毛浮绿水，红掌拨清___。', correctAnswer: '波', options: ['波', '河', '水', '湖'], difficulty: 'easy' },
              { topicId: 'cn-6b-poetry3', mode: 'reading-comp', prompt: '"不识庐山真面目，只缘身在此山中"这句话告诉我们什么道理？', correctAnswer: '当局者迷，要跳出局限看问题', options: ['当局者迷，要跳出局限看问题', '庐山很美', '山很高', '容易迷路'], difficulty: 'hard' },
              { topicId: 'cn-6b-poetry3', mode: 'reading-comp', prompt: '"落红不是无情物，化作春泥更护花"表达了诗人怎样的情怀？', correctAnswer: '即使离开也要奉献', options: ['即使离开也要奉献', '喜欢花', '泥土很肥沃', '春天很美'], difficulty: 'hard' },
              { topicId: 'cn-6b-poetry3', mode: 'poetry-fill', prompt: '补全诗句：意欲捕鸣___，忽然闭口立。', correctAnswer: '蝉', options: ['蝉', '鸟', '虫', '蝶'], difficulty: 'medium' },
            ],
          },
          {
            id: 'cn-6b-writing',
            name: '综合写作',
            description: '各类文体的写作技巧与训练',
            modes: ['word-match', 'sentence-fill'],
            questions: [
              { topicId: 'cn-6b-writing', mode: 'word-match', prompt: '写记叙文时，六要素是指什么？', correctAnswer: '时间、地点、人物、起因、经过、结果', options: ['时间、地点、人物、起因、经过、结果', '开头、经过、结尾', '谁、什么、哪里', '第一、第二、第三'], difficulty: 'medium' },
              { topicId: 'cn-6b-writing', mode: 'word-match', prompt: '好的结尾应该做到什么？', correctAnswer: '点题或呼应开头', options: ['点题或呼应开头', '越长越好', '随便写写就行', '不用管开头'], difficulty: 'easy' },
              { topicId: 'cn-6b-writing', mode: 'sentence-fill', prompt: '写说明文时要做到___，不能凭空想象。', correctAnswer: '真实准确', options: ['真实准确', '生动有趣', '华丽优美', '简短精炼'], difficulty: 'medium' },
              { topicId: 'cn-6b-writing', mode: 'word-match', prompt: '写想象作文时，最重要的是什么？', correctAnswer: '想象要合理', options: ['想象要合理', '写得越长越好', '字数要够', '不用写开头'], difficulty: 'easy' },
            ],
          },
          {
            id: 'cn-6b-culture',
            name: '文学常识',
            description: '中国古代文学常识和名家名篇',
            modes: ['word-match', 'reading-comp'],
            questions: [
              { topicId: 'cn-6b-culture', mode: 'word-match', prompt: '"床前明月光"的作者是谁？', correctAnswer: '李白', options: ['李白', '杜甫', '白居易', '王维'], difficulty: 'easy' },
              { topicId: 'cn-6b-culture', mode: 'word-match', prompt: '中国古代四大名著中，"西游记"的作者是谁？', correctAnswer: '吴承恩', options: ['吴承恩', '罗贯中', '施耐庵', '曹雪芹'], difficulty: 'medium' },
              { topicId: 'cn-6b-culture', mode: 'word-match', prompt: '"春晓"这首诗的作者是谁？', correctAnswer: '孟浩然', options: ['孟浩然', '李白', '王维', '杜甫'], difficulty: 'easy' },
              { topicId: 'cn-6b-culture', mode: 'word-match', prompt: '"水浒传"讲述了哪个朝代的故事？', correctAnswer: '北宋', options: ['北宋', '唐朝', '明朝', '汉朝'], difficulty: 'medium' },
              { topicId: 'cn-6b-culture', mode: 'word-match', prompt: '下面哪位是唐代诗人？', correctAnswer: '杜甫', options: ['杜甫', '鲁迅', '巴金', '冰心'], difficulty: 'easy' },
            ],
          },
        ],
      },
    },
  },
};
