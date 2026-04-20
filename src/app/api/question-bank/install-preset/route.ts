import { NextResponse } from 'next/server';
import '@/lib/question-bank';
import { QuestionBankRegistry } from '@/lib/question-bank/registry';
import type { Subject } from '@/lib/question-bank/types';

// ─── Preset → Subject Mapping ─────────────────────────────────────────────────

const PRESET_SUBJECT_MAP: Record<string, Subject> = {
  'math-g1': 'math',
  'math-g2': 'math',
  'math-g3': 'math',
  'math-g4': 'math',
  'math-g5': 'math',
  'math-g6': 'math',
  'cn-g1': 'chinese',
  'cn-g2': 'chinese',
  'cn-g3': 'chinese',
  'cn-g4': 'chinese',
  'cn-g5': 'chinese',
  'cn-g6': 'chinese',
  'en-g1': 'english',
  'en-g2': 'english',
  'en-g3': 'english',
  'en-g4': 'english',
  'en-g5': 'english',
  'en-g6': 'english',
};

const PRESET_NAMES: Record<string, string> = {
  'math-g1': '一年级数学', 'math-g2': '二年级数学', 'math-g3': '三年级数学',
  'math-g4': '四年级数学', 'math-g5': '五年级数学', 'math-g6': '六年级数学',
  'cn-g1': '一年级语文', 'cn-g2': '二年级语文', 'cn-g3': '三年级语文',
  'cn-g4': '四年级语文', 'cn-g5': '五年级语文', 'cn-g6': '六年级语文',
  'en-g1': '一年级英语', 'en-g2': '二年级英语', 'en-g3': '三年级英语',
  'en-g4': '四年级英语', 'en-g5': '五年级英语', 'en-g6': '六年级英语',
};

// ─── POST: Install a preset question bank ─────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { presetId } = body as { presetId: string };

    if (!presetId) {
      return NextResponse.json({
        success: false,
        error: '缺少 presetId 参数',
      }, { status: 400 });
    }

    const subject = PRESET_SUBJECT_MAP[presetId];
    if (!subject) {
      return NextResponse.json({
        success: false,
        error: `未知的题库包: ${presetId}`,
      }, { status: 404 });
    }

    // Check if a bank for this subject already exists and is enabled
    const existingBank = QuestionBankRegistry.getBank(subject);
    if (existingBank) {
      return NextResponse.json({
        success: true,
        alreadyInstalled: true,
        presetId,
        presetName: PRESET_NAMES[presetId] || presetId,
        bankId: existingBank.id,
        bankName: existingBank.name,
        message: '题库已安装',
      });
    }

    // If the bank is registered but disabled, enable it
    const allBanks = QuestionBankRegistry.getAllBanks();
    const disabledBank = allBanks.find((r) => r.bank.subject === subject && !r.enabled);
    if (disabledBank) {
      QuestionBankRegistry.enable(disabledBank.bank.id);
      return NextResponse.json({
        success: true,
        alreadyInstalled: false,
        reEnabled: true,
        presetId,
        presetName: PRESET_NAMES[presetId] || presetId,
        bankId: disabledBank.bank.id,
        bankName: disabledBank.bank.name,
        message: '题库已启用',
      });
    }

    // No bank found — this shouldn't happen since built-in banks auto-register,
    // but return a helpful message anyway
    return NextResponse.json({
      success: true,
      presetId,
      presetName: PRESET_NAMES[presetId] || presetId,
      message: '内置题库已就绪',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `服务器错误: ${(error as Error).message}`,
    }, { status: 500 });
  }
}
