import { NextResponse } from 'next/server';
import '@/lib/question-bank';
import { QuestionBankRegistry } from '@/lib/question-bank/registry';
import type { Grade, Semester, TopicMeta } from '@/lib/question-bank/types';

// ─── POST: Export a bank's data ──────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bankId } = body as { bankId: string };

    if (!bankId) {
      return NextResponse.json({
        success: false,
        error: '缺少 bankId 参数',
      }, { status: 400 });
    }

    // Find the bank registration (include disabled banks)
    const allBanks = QuestionBankRegistry.getAllBanks();
    const registration = allBanks.find((r) => r.bank.id === bankId);

    if (!registration) {
      return NextResponse.json({
        success: false,
        error: `未找到题库: ${bankId}`,
      }, { status: 404 });
    }

    const bank = registration.bank;
    const subject = bank.subject;
    const grades = bank.getSupportedGrades();

    // Build export data
    const exportData: Record<string, Record<string, unknown[]>> = {};

    for (const grade of grades) {
      const semesters = bank.getSupportedSemesters(grade);
      if (!exportData[String(grade)]) {
        exportData[String(grade)] = {};
      }

      for (const semester of semesters) {
        const topicIds = bank.getTopicIds(grade, semester);
        const allQuestions: unknown[] = [];

        for (const topicId of topicIds) {
          // Generate questions for this topic (up to 10 for export sample)
          const questions = bank.generateTopicQuestions(grade, semester, topicId, 10);
          for (const q of questions) {
            if (subject === 'math') {
              const mq = q as {
                topicId: string; expression: string; correctAnswer: number | boolean;
                options?: number[]; num1: number; num2: number; operation: string;
              };
              allQuestions.push({
                topicId: mq.topicId,
                expression: mq.expression,
                answer: mq.correctAnswer,
                options: mq.options,
                type: mq.operation,
                difficulty: grade <= 2 ? 'easy' : grade <= 4 ? 'medium' : 'hard',
              });
            } else if (subject === 'chinese') {
              const cq = q as {
                topicId: string; mode: string; prompt: string;
                correctAnswer: string; options: string[];
              };
              allQuestions.push({
                topicId: cq.topicId,
                mode: cq.mode,
                prompt: cq.prompt,
                correctAnswer: cq.correctAnswer,
                options: cq.options,
                difficulty: grade <= 2 ? 'easy' : grade <= 4 ? 'medium' : 'hard',
              });
            } else {
              const eq = q as {
                topicId: string; mode: string; prompt: string;
                correctAnswer: string; options: string[];
                emojiHint?: string; phonetic?: string;
              };
              allQuestions.push({
                topicId: eq.topicId,
                mode: eq.mode,
                prompt: eq.prompt,
                correctAnswer: eq.correctAnswer,
                options: eq.options,
                emoji: eq.emojiHint,
                phonetic: eq.phonetic,
                difficulty: grade <= 2 ? 'easy' : grade <= 4 ? 'medium' : 'hard',
              });
            }
          }
        }

        if (allQuestions.length > 0) {
          exportData[String(grade)][semester] = allQuestions;
        }
      }
    }

    // Build meta from bank info
    const topicInfoList: TopicMeta[] = [];
    for (const grade of grades) {
      for (const semester of bank.getSupportedSemesters(grade)) {
        for (const topicId of bank.getTopicIds(grade, semester)) {
          const info = bank.getTopicInfo(topicId);
          if (info) topicInfoList.push(info);
        }
      }
    }

    let totalQuestions = 0;
    for (const semesters of Object.values(exportData)) {
      for (const questions of Object.values(semesters)) {
        totalQuestions += questions.length;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        meta: {
          id: bank.id,
          name: bank.name,
          version: bank.version,
          subject: bank.subject,
          description: bank.description,
          source: bank.source,
        },
        data: exportData,
        _exportMeta: {
          totalQuestions,
          totalTopics: topicInfoList.length,
          exportedAt: new Date().toISOString(),
          questionBankType: 'export-sample',
        },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `服务器错误: ${(error as Error).message}`,
    }, { status: 500 });
  }
}
