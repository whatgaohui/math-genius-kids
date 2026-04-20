import { NextResponse } from 'next/server';
import '@/lib/question-bank';
import type { Subject, Grade, Semester } from '@/lib/question-bank/types';

// ─── Request Types ─────────────────────────────────────────────────────────

interface AIGenerateRequest {
  subject: string;
  grade: number;
  semester: string;
  topic: string;
  count: number;
}

// ─── Subject-Specific Prompt Builders ──────────────────────────────────────

const GRADE_LABELS: Record<number, string> = {
  1: '一年级',
  2: '二年级',
  3: '三年级',
  4: '四年级',
  5: '五年级',
  6: '六年级',
};

const SUBJECT_LABELS: Record<string, string> = {
  math: '数学',
  chinese: '语文',
  english: '英语',
};

/**
 * Build a system prompt for the LLM based on the subject.
 */
function buildSystemPrompt(subject: string): string {
  const basePrompt = '你是一个小学教育出题专家，擅长为人教版(PEP)教材设计适合小学生的练习题。' +
    '请确保题目内容准确、难度适中、选项合理（错误选项要有一定的迷惑性但不能太离谱）。' +
    '所有选项中必须有一个且只有一个正确答案。';

  switch (subject) {
    case 'math':
      return basePrompt +
        '\n\n你生成的数学题必须遵循以下格式，返回纯JSON数组，不要包含markdown代码块标记：\n' +
        '[{"expression": "7 × 8", "answer": 56, "options": [54, 56, 58, 48], "type": "multiply", "difficulty": "easy"}]\n\n' +
        '字段说明：\n' +
        '- expression: 算式字符串，如 "23 + 45"、"100 - 37"、"7 × 8"、"56 ÷ 7"、"3 > 2"\n' +
        '- answer: 正确答案（数字），比较题用 1 表示正确，0 表示错误\n' +
        '- options: 4个数字选项（包含正确答案）\n' +
        '- type: 题型，可选 "add"、"subtract"、"multiply"、"divide"、"compare"、"equation"、"mixed"\n' +
        '- difficulty: 难度，可选 "easy"、"medium"、"hard"';

    case 'chinese':
      return basePrompt +
        '\n\n你生成的语文题必须遵循以下格式，返回纯JSON数组，不要包含markdown代码块标记：\n' +
        '[{"mode": "recognize-char", "prompt": "选择正确的汉字", "correctAnswer": "跑", "options": ["跑", "泡", "炮", "抱"], "difficulty": "easy"}]\n\n' +
        '字段说明：\n' +
        '- mode: 练习模式，可选 "recognize-char"(汉字识别)、"recognize-pinyin"(拼音识别)、"word-match"(词语搭配)、"dictation"(听写)、' +
        '"idiom-fill"(成语填空)、"antonym"(反义词)、"synonym"(近义词)、"poetry-fill"(古诗填空)、"sentence-fill"(句子填空)\n' +
        '- prompt: 题目描述文字\n' +
        '- correctAnswer: 正确答案（字符串）\n' +
        '- options: 4个字符串选项（包含正确答案）\n' +
        '- difficulty: 难度，可选 "easy"、"medium"、"hard"';

    case 'english':
      return basePrompt +
        '\n\n你生成的英语题必须遵循以下格式，返回纯JSON数组，不要包含markdown代码块标记：\n' +
        '[{"mode": "word-picture", "word": "apple", "meaning": "苹果", "emoji": "🍎", "options": ["苹果", "香蕉", "橘子", "葡萄"], "difficulty": "easy"}]\n\n' +
        '字段说明：\n' +
        '- mode: 练习模式，可选 "word-picture"(看词选义)、"picture-word"(看义选词)、"listening"(听力选择)、"spelling"(拼写)\n' +
        '- word: 英文单词\n' +
        '- meaning: 中文释义\n' +
        '- emoji: 代表该单词的emoji表情\n' +
        '- options: 4个中文释义选项（包含正确答案）\n' +
        '- difficulty: 难度，可选 "easy"、"medium"、"hard"';

    default:
      return basePrompt;
  }
}

/**
 * Build a user prompt for the LLM.
 */
function buildUserPrompt(params: {
  grade: number;
  subject: string;
  semester: string;
  topic: string;
  count: number;
}): string {
  const { grade, subject, semester, topic, count } = params;
  const gradeLabel = GRADE_LABELS[grade] || `${grade}年级`;
  const subjectLabel = SUBJECT_LABELS[subject] || subject;

  return `请为小学${gradeLabel}${semester}的${subjectLabel}课程生成 ${count} 道关于"${topic}"的练习题。\n\n` +
    `要求：\n` +
    `1. 题目必须符合${gradeLabel}学生的知识水平\n` +
    `2. 难度适中，由浅入深\n` +
    `3. 每道题必须有4个选项，其中1个正确\n` +
    `4. 错误选项要有一定的迷惑性\n` +
    `5. 直接返回纯JSON数组，不要包含任何其他文字或markdown标记\n` +
    `6. 题目之间用逗号分隔\n\n` +
    `请开始生成：`;
}

// ─── Response Parsers ──────────────────────────────────────────────────────

/**
 * Extract JSON array from LLM response, handling markdown code blocks and other noise.
 */
function extractJsonArray(text: string): string | null {
  // Try to find a JSON array in the response
  const trimmed = text.trim();

  // Check if it starts with [ directly
  if (trimmed.startsWith('[')) {
    // Find the matching closing bracket
    let depth = 0;
    for (let i = 0; i < trimmed.length; i++) {
      if (trimmed[i] === '[') depth++;
      else if (trimmed[i] === ']') depth--;
      if (depth === 0) return trimmed.slice(0, i + 1);
    }
    return trimmed; // Return as-is if no closing bracket found
  }

  // Try to extract from markdown code block
  const jsonBlockMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (jsonBlockMatch) {
    return jsonBlockMatch[1].trim();
  }

  // Try to find any array in the text
  const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    return arrayMatch[0];
  }

  return null;
}

/**
 * Validate and normalize a generated question.
 */
function validateQuestion(q: Record<string, unknown>, subject: string): Record<string, unknown> | null {
  if (!q || typeof q !== 'object') return null;

  switch (subject) {
    case 'math': {
      if (!q.expression || typeof q.expression !== 'string') return null;
      if (q.answer === undefined) return null;
      if (!Array.isArray(q.options) || q.options.length !== 4) return null;
      const validTypes = ['add', 'subtract', 'multiply', 'divide', 'compare', 'equation', 'mixed'];
      if (!validTypes.includes(q.type as string)) return null;
      return {
        expression: String(q.expression),
        answer: typeof q.answer === 'number' ? q.answer : Number(q.answer),
        options: q.options.map(Number),
        type: q.type || 'add',
        difficulty: q.difficulty || 'medium',
      };
    }

    case 'chinese': {
      if (!q.mode || typeof q.mode !== 'string') return null;
      if (!q.correctAnswer || typeof q.correctAnswer !== 'string') return null;
      if (!Array.isArray(q.options) || q.options.length !== 4) return null;
      return {
        mode: q.mode,
        prompt: q.prompt || '请选择正确的答案',
        correctAnswer: String(q.correctAnswer),
        options: q.options.map(String),
        difficulty: q.difficulty || 'medium',
      };
    }

    case 'english': {
      if (!q.mode || typeof q.mode !== 'string') return null;
      if (!q.word || typeof q.word !== 'string') return null;
      if (!q.meaning || typeof q.meaning !== 'string') return null;
      if (!Array.isArray(q.options) || q.options.length !== 4) return null;
      return {
        mode: q.mode,
        word: String(q.word),
        meaning: String(q.meaning),
        emoji: q.emoji || '📝',
        options: q.options.map(String),
        difficulty: q.difficulty || 'medium',
      };
    }

    default:
      return null;
  }
}

// ─── POST Handler ──────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: '无法解析JSON请求体' },
        { status: 400 },
      );
    }

    const {
      subject,
      grade,
      semester,
      topic,
      count,
    } = body as AIGenerateRequest;

    // Validate required fields
    const validSubjects = ['math', 'chinese', 'english'];
    if (!subject || !validSubjects.includes(subject)) {
      return NextResponse.json(
        { success: false, error: `无效的 subject，必须是: ${validSubjects.join(', ')}` },
        { status: 400 },
      );
    }

    if (!grade || typeof grade !== 'number' || grade < 1 || grade > 6) {
      return NextResponse.json(
        { success: false, error: '无效的 grade，必须是 1-6 的数字' },
        { status: 400 },
      );
    }

    if (!semester || (semester !== '上册' && semester !== '下册')) {
      return NextResponse.json(
        { success: false, error: '无效的 semester，必须是 "上册" 或 "下册"' },
        { status: 400 },
      );
    }

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '缺少 topic 参数，请指定知识点主题' },
        { status: 400 },
      );
    }

    const questionCount = typeof count === 'number' ? Math.min(Math.max(count, 1), 20) : 5;

    // Call the LLM
    const ZAI = await import('z-ai-web-dev-sdk');
    const zai = await ZAI.default.create();

    const systemPrompt = buildSystemPrompt(subject);
    const userPrompt = buildUserPrompt({
      grade,
      subject,
      semester,
      topic: topic.trim(),
      count: questionCount,
    });

    let completion;
    try {
      completion = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        thinking: { type: 'disabled' },
      });
    } catch (llmError) {
      return NextResponse.json(
        {
          success: false,
          error: `AI服务调用失败: ${(llmError as Error).message}`,
        },
        { status: 502 },
      );
    }

    // Extract response content
    const responseContent = completion.choices?.[0]?.message?.content;
    if (!responseContent || typeof responseContent !== 'string') {
      return NextResponse.json(
        { success: false, error: 'AI返回了空内容，请稍后重试' },
        { status: 502 },
      );
    }

    // Parse the JSON response
    const jsonArrayStr = extractJsonArray(responseContent);
    if (!jsonArrayStr) {
      return NextResponse.json(
        {
          success: false,
          error: '无法从AI响应中解析出题目数据，请重试',
          rawResponse: responseContent.slice(0, 200),
        },
        { status: 502 },
      );
    }

    let rawQuestions: unknown[];
    try {
      rawQuestions = JSON.parse(jsonArrayStr);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'AI返回的JSON格式有误，请重试',
          parseError: 'JSON解析失败',
        },
        { status: 502 },
      );
    }

    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'AI未返回有效的题目数组' },
        { status: 502 },
      );
    }

    // Validate and normalize each question
    const validQuestions: Record<string, unknown>[] = [];
    for (const q of rawQuestions) {
      const validated = validateQuestion(q as Record<string, unknown>, subject);
      if (validated) {
        validQuestions.push(validated);
      }
    }

    if (validQuestions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI生成的题目格式不符合要求，请尝试更换关键词重试',
          attemptedCount: rawQuestions.length,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      questions: validQuestions,
      meta: {
        subject,
        grade,
        semester,
        topic: topic.trim(),
        requestedCount: questionCount,
        generatedCount: validQuestions.length,
        rawCount: rawQuestions.length,
        skippedCount: rawQuestions.length - validQuestions.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `服务器错误: ${(error as Error).message}` },
      { status: 500 },
    );
  }
}
