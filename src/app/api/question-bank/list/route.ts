import { NextResponse } from 'next/server';
import '@/lib/question-bank';
import { QuestionBankRegistry } from '@/lib/question-bank/registry';
import type { Grade, Semester, Subject } from '@/lib/question-bank/types';

// ─── GET: List all banks ─────────────────────────────────────────────────────

export async function GET() {
  try {
    const allBanks = QuestionBankRegistry.getAllBanks();

    const banks = allBanks.map((reg) => {
      const bank = reg.bank;
      const grades = bank.getSupportedGrades();
      let totalQuestions = 0;

      for (const grade of grades) {
        const semesters = bank.getSupportedSemesters(grade);
        for (const semester of semesters) {
          totalQuestions += bank.getQuestionCount(grade, semester);
        }
      }

      return {
        id: bank.id,
        name: bank.name,
        version: bank.version,
        subject: bank.subject,
        description: bank.description,
        source: bank.source,
        enabled: reg.enabled,
        priority: reg.priority,
        registeredAt: reg.registeredAt,
        questionCount: totalQuestions,
        supportedGrades: grades,
      };
    });

    const summary = QuestionBankRegistry.getSummary();

    return NextResponse.json({
      success: true,
      banks,
      summary,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `服务器错误: ${(error as Error).message}`,
    }, { status: 500 });
  }
}

// ─── POST: Toggle enable/disable or remove a bank ────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bankId, action } = body as { bankId: string; action: 'enable' | 'disable' | 'remove' };

    if (!bankId || !action) {
      return NextResponse.json({
        success: false,
        error: '缺少 bankId 或 action 参数',
      }, { status: 400 });
    }

    switch (action) {
      case 'enable': {
        const result = QuestionBankRegistry.enable(bankId);
        if (!result) {
          return NextResponse.json({
            success: false,
            error: `未找到题库: ${bankId}`,
          }, { status: 404 });
        }
        return NextResponse.json({ success: true, action: 'enabled', bankId });
      }

      case 'disable': {
        const result = QuestionBankRegistry.disable(bankId);
        if (!result) {
          return NextResponse.json({
            success: false,
            error: `未找到题库: ${bankId}`,
          }, { status: 404 });
        }
        return NextResponse.json({ success: true, action: 'disabled', bankId });
      }

      case 'remove': {
        const result = QuestionBankRegistry.unregister(bankId);
        if (!result) {
          return NextResponse.json({
            success: false,
            error: `未找到题库: ${bankId}`,
          }, { status: 404 });
        }
        return NextResponse.json({ success: true, action: 'removed', bankId });
      }

      default:
        return NextResponse.json({
          success: false,
          error: `未知操作: ${action}`,
        }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `服务器错误: ${(error as Error).message}`,
    }, { status: 500 });
  }
}
