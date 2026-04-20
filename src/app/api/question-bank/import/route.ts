import { NextResponse } from 'next/server';
import '@/lib/question-bank';
import { QuestionBankRegistry } from '@/lib/question-bank/registry';
import type { Subject, Grade, Semester, QuestionBank, MathQuestion, ChineseQuestion, EnglishQuestion } from '@/lib/question-bank/types';

// ─── Type Definitions for Import ─────────────────────────────────────────────

interface ImportMeta {
  id: string;
  name: string;
  subject: Subject;
  version: string;
  description?: string;
  source?: string;
  author?: string;
  lastUpdated?: string;
}

interface MathImportQuestion {
  topicId: string;
  expression: string;
  answer: number | boolean;
  options?: number[];
  difficulty?: 'easy' | 'medium' | 'hard';
  type?: 'add' | 'subtract' | 'multiply' | 'divide' | 'compare' | 'equation' | 'mixed';
}

interface ChineseImportQuestion {
  topicId: string;
  mode: string;
  prompt?: string;
  correctAnswer: string;
  options: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface EnglishImportQuestion {
  topicId: string;
  mode: string;
  word: string;
  phonetic?: string;
  meaning?: string;
  emoji?: string;
  options: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

type ImportQuestion = MathImportQuestion | ChineseImportQuestion | EnglishImportQuestion;

interface ImportBody {
  meta: ImportMeta;
  data: Record<string, Record<string, ImportQuestion[]>>;
}

// ─── Custom Question Bank Class ──────────────────────────────────────────────

/**
 * Creates a dynamic QuestionBank from imported data.
 * This works for all three subjects.
 */
function createDynamicBank(
  meta: ImportMeta,
  data: Record<string, Record<string, ImportQuestion[]>>,
): QuestionBank {
  const validGrades = new Set<string>();
  const validSemesters = new Map<number, Set<string>>();
  const topicIdsMap = new Map<string, Set<string>>();
  const topicInfoMap = new Map<string, { name: string; description: string; grade: Grade; semester: Semester }>();
  const questionStore = new Map<string, ImportQuestion[]>();

  // Index all questions by topic
  for (const [gradeStr, semesters] of Object.entries(data)) {
    const grade = Number(gradeStr) as Grade;
    if (isNaN(grade) || grade < 1 || grade > 6) continue;

    validGrades.add(gradeStr);
    if (!validSemesters.has(grade)) validSemesters.set(grade, new Set());

    for (const [semester, questions] of Object.entries(semesters)) {
      if (semester !== '上册' && semester !== '下册') continue;

      validSemesters.get(grade)!.add(semester);
      const topicSet = topicIdsMap.get(`${grade}-${semester}`) || new Set();

      for (const q of questions) {
        const topicId = q.topicId;
        topicSet.add(topicId);

        // Store topic info (first seen)
        if (!topicInfoMap.has(topicId)) {
          topicInfoMap.set(topicId, {
            name: topicId,
            description: `导入题目: ${topicId}`,
            grade,
            semester: semester as Semester,
          });
        }

        // Store questions
        const key = `${grade}-${semester}-${topicId}`;
        const existing = questionStore.get(key) || [];
        existing.push(q);
        questionStore.set(key, existing);
      }

      topicIdsMap.set(`${grade}-${semester}`, topicSet);
    }
  }

  // Generate unique IDs
  let idCounter = 0;
  function genId(topicId: string): string {
    return `imported-${meta.id}-${topicId}-${++idCounter}`;
  }

  // Convert to MathQuestion
  function toMathQuestion(q: MathImportQuestion, grade: Grade, semester: Semester): MathQuestion {
    const mq = q as MathImportQuestion;
    const type = mq.type || 'add';
    const opMap: Record<string, MathQuestion['operation']> = {
      add: 'add', subtract: 'subtract', multiply: 'multiply',
      divide: 'divide', compare: 'compare', equation: 'equation', mixed: 'mixed',
    };
    const displayOpMap: Record<string, string> = {
      add: '+', subtract: '−', multiply: '×', divide: '÷', compare: '?', equation: '=', mixed: '=',
    };
    const operation = opMap[type] || 'add';
    const displayOp = displayOpMap[type] || '+';
    const options = mq.options || [];
    const correctIndex = options.indexOf(mq.answer);

    // Parse num1/num2 from expression (best-effort)
    let num1 = 0;
    let num2 = 0;
    if (['add', 'subtract', 'multiply', 'divide'].includes(type)) {
      const parts = mq.expression.split(/[\s+−×÷\-]+/).filter(Boolean);
      if (parts.length >= 2) {
        const p1 = parseFloat(parts[0]);
        const p2 = parseFloat(parts[1]);
        if (!isNaN(p1)) num1 = p1;
        if (!isNaN(p2)) num2 = p2;
      }
    }

    return {
      id: genId(mq.topicId),
      subject: 'math',
      grade,
      semester,
      topicId: mq.topicId,
      prompt: mq.expression.includes('=?') || mq.expression.includes('？') ? mq.expression : `${mq.expression} = ?`,
      correctAnswer: type === 'compare' ? (mq.answer === true ? true : mq.answer === 1 ? true : mq.answer === '>') : mq.answer as number,
      expression: mq.expression,
      displayOp,
      num1,
      num2,
      operation,
      options: options.length > 0 ? options : undefined,
      correctIndex: correctIndex >= 0 ? correctIndex : undefined,
    };
  }

  // Convert to ChineseQuestion
  function toChineseQuestion(q: ChineseImportQuestion, grade: Grade, semester: Semester): ChineseQuestion {
    const options = q.options || [];
    const correctIndex = options.indexOf(q.correctAnswer);
    return {
      id: genId(q.topicId),
      subject: 'chinese',
      grade,
      semester,
      topicId: q.topicId,
      prompt: q.prompt || '请选择正确的答案',
      correctAnswer: q.correctAnswer,
      mode: q.mode as ChineseQuestion['mode'],
      options,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    };
  }

  // Convert to EnglishQuestion
  function toEnglishQuestion(q: EnglishImportQuestion, grade: Grade, semester: Semester): EnglishQuestion {
    const options = q.options || [];
    const correctIndex = options.indexOf(q.meaning || q.correctAnswer);
    return {
      id: genId(q.topicId),
      subject: 'english',
      grade,
      semester,
      topicId: q.topicId,
      prompt: `单词: ${q.word}`,
      correctAnswer: q.meaning || q.word,
      mode: q.mode as EnglishQuestion['mode'],
      options,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
      emojiHint: q.emoji,
      phonetic: q.phonetic,
    };
  }

  // Count total questions
  let totalQuestions = 0;
  for (const [, qs] of questionStore) {
    totalQuestions += qs.length;
  }

  // Shuffle helper
  function shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // Create the bank object
  const bank: QuestionBank = {
    id: meta.id,
    name: meta.name,
    version: meta.version || '1.0.0',
    subject: meta.subject,
    description: meta.description || '导入的自定义题库',
    source: meta.source || '自定义导入',

    getSupportedGrades(): Grade[] {
      return Array.from(validGrades).map(Number).sort() as Grade[];
    },

    getSupportedSemesters(grade: Grade): Semester[] {
      return Array.from(validSemesters.get(grade) || []) as Semester[];
    },

    getTopicIds(grade: Grade, semester: Semester): string[] {
      return Array.from(topicIdsMap.get(`${grade}-${semester}`) || []);
    },

    getTopicInfo(topicId: string) {
      const info = topicInfoMap.get(topicId);
      if (!info) return undefined;
      return {
        id: topicId,
        name: info.name,
        description: info.description,
        emoji: meta.subject === 'math' ? '🧮' : meta.subject === 'chinese' ? '📖' : '🔤',
        subject: meta.subject,
        grade: info.grade,
        semester: info.semester,
        difficulty: 'easy' as const,
      };
    },

    getQuestionCount(grade: Grade, semester: Semester, topicId?: string): number {
      if (topicId) {
        return (questionStore.get(`${grade}-${semester}-${topicId}`) || []).length;
      }
      let count = 0;
      const tids = topicIdsMap.get(`${grade}-${semester}`) || [];
      for (const tid of tids) {
        count += (questionStore.get(`${grade}-${semester}-${tid}`) || []).length;
      }
      return count;
    },

    generateTopicQuestions(grade, semester, topicId, count) {
      const questions = questionStore.get(`${grade}-${semester}-${topicId}`) || [];
      const shuffled = shuffle(questions).slice(0, count);

      if (meta.subject === 'math') {
        return shuffled.map((q) => toMathQuestion(q as MathImportQuestion, grade, semester));
      } else if (meta.subject === 'chinese') {
        return shuffled.map((q) => toChineseQuestion(q as ChineseImportQuestion, grade, semester));
      } else {
        return shuffled.map((q) => toEnglishQuestion(q as EnglishImportQuestion, grade, semester));
      }
    },

    generateMixedQuestions(grade, semester, count) {
      const tids = topicIdsMap.get(`${grade}-${semester}`) || [];
      if (tids.length === 0) return [];

      const allQs: ImportQuestion[] = [];
      for (const tid of tids) {
        const qs = questionStore.get(`${grade}-${semester}-${tid}`) || [];
        allQs.push(...qs);
      }
      const shuffled = shuffle(allQs).slice(0, count);

      if (meta.subject === 'math') {
        return shuffled.map((q) => toMathQuestion(q as MathImportQuestion, grade, semester));
      } else if (meta.subject === 'chinese') {
        return shuffled.map((q) => toChineseQuestion(q as ChineseImportQuestion, grade, semester));
      } else {
        return shuffled.map((q) => toEnglishQuestion(q as EnglishImportQuestion, grade, semester));
      }
    },
  };

  return bank;
}

// ─── Validation ──────────────────────────────────────────────────────────────

interface ValidationIssue {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

function validateImportData(body: unknown): { valid: boolean; issues: ValidationIssue[]; parsedBody?: ImportBody } {
  const issues: ValidationIssue[] = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, issues: [{ path: '', message: '请求体必须是JSON对象', severity: 'error' }] };
  }

  const obj = body as Record<string, unknown>;

  // Validate meta
  if (!obj.meta || typeof obj.meta !== 'object') {
    issues.push({ path: 'meta', message: '缺少 meta 字段', severity: 'error' });
    return { valid: false, issues };
  }

  const meta = obj.meta as Record<string, unknown>;
  if (!meta.id || typeof meta.id !== 'string') {
    issues.push({ path: 'meta.id', message: '缺少或无效的 id', severity: 'error' });
  }
  if (!meta.name || typeof meta.name !== 'string') {
    issues.push({ path: 'meta.name', message: '缺少或无效的 name', severity: 'error' });
  }
  if (!meta.subject || !['math', 'chinese', 'english'].includes(meta.subject as string)) {
    issues.push({ path: 'meta.subject', message: 'subject 必须是 math / chinese / english', severity: 'error' });
  }

  // Validate data
  if (!obj.data || typeof obj.data !== 'object') {
    issues.push({ path: 'data', message: '缺少 data 字段', severity: 'error' });
    return { valid: false, issues };
  }

  const data = obj.data as Record<string, unknown>;
  if (Object.keys(data).length === 0) {
    issues.push({ path: 'data', message: 'data 中没有年级数据', severity: 'error' });
    return { valid: false, issues };
  }

  // Subject-specific validation
  const subject = meta.subject as Subject;
  for (const [gradeStr, semesters] of Object.entries(data)) {
    const grade = Number(gradeStr);
    if (isNaN(grade) || grade < 1 || grade > 6) {
      issues.push({ path: `data.${gradeStr}`, message: '年级必须为 1-6 的数字', severity: 'error' });
      continue;
    }
    if (typeof semesters !== 'object' || semesters === null || Array.isArray(semesters)) continue;

    for (const [semKey, questions] of Object.entries(semesters as Record<string, unknown>)) {
      if (semKey !== '上册' && semKey !== '下册') continue;
      if (!Array.isArray(questions)) continue;

      for (let idx = 0; idx < questions.length; idx++) {
        const q = questions[idx] as Record<string, unknown>;
        if (typeof q !== 'object' || q === null) {
          issues.push({ path: `data.${gradeStr}.${semKey}[${idx}]`, message: '题目格式错误', severity: 'error' });
          continue;
        }

        if (!q.topicId) issues.push({ path: `data.${gradeStr}.${semKey}[${idx}].topicId`, message: '缺少 topicId', severity: 'error' });

        if (subject === 'math') {
          if (!q.expression) issues.push({ path: `data.${gradeStr}.${semKey}[${idx}].expression`, message: '数学题缺少 expression', severity: 'error' });
          if (q.answer === undefined) issues.push({ path: `data.${gradeStr}.${semKey}[${idx}].answer`, message: '缺少 answer', severity: 'error' });
        } else if (subject === 'chinese') {
          if (!q.mode) issues.push({ path: `data.${gradeStr}.${semKey}[${idx}].mode`, message: '缺少 mode', severity: 'error' });
          if (!q.correctAnswer) issues.push({ path: `data.${gradeStr}.${semKey}[${idx}].correctAnswer`, message: '缺少 correctAnswer', severity: 'error' });
        } else if (subject === 'english') {
          if (!q.mode) issues.push({ path: `data.${gradeStr}.${semKey}[${idx}].mode`, message: '缺少 mode', severity: 'error' });
          if (!q.word) issues.push({ path: `data.${gradeStr}.${semKey}[${idx}].word`, message: '缺少 word', severity: 'error' });
        }
      }
    }
  }

  const errors = issues.filter((i) => i.severity === 'error');
  return {
    valid: errors.length === 0,
    issues,
    parsedBody: body as ImportBody,
  };
}

// ─── POST Handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({
        success: false,
        error: '无法解析JSON请求体',
      }, { status: 400 });
    }

    // Validate
    const validation = validateImportData(body);
    if (!validation.valid || !validation.parsedBody) {
      return NextResponse.json({
        success: false,
        error: '数据验证失败',
        validationIssues: validation.issues,
      }, { status: 400 });
    }

    const { meta, data } = validation.parsedBody;

    // Check for duplicate ID
    const existing = QuestionBankRegistry.getBankById(meta.id);
    if (existing) {
      // Replace existing bank
      const newBank = createDynamicBank(meta, data);
      QuestionBankRegistry.replace(meta.id, newBank, { priority: 5, enabled: true });
    } else {
      // Register new bank
      const bank = createDynamicBank(meta, data);
      QuestionBankRegistry.register(bank, { priority: 5, enabled: true });
    }

    // Count questions
    let totalQuestions = 0;
    for (const semesters of Object.values(data)) {
      for (const questions of Object.values(semesters)) {
        totalQuestions += questions.length;
      }
    }

    return NextResponse.json({
      success: true,
      bankId: meta.id,
      bankName: meta.name,
      questionCount: totalQuestions,
      gradesCovered: Object.keys(data),
      validationIssues: validation.issues.filter((i) => i.severity === 'warning'),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `服务器错误: ${(error as Error).message}`,
    }, { status: 500 });
  }
}
