export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

const ttsCache = new Map<string, { data: ArrayBuffer; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getClient(): Promise<ZAI> {
  return ZAI.create();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, lang, speed } = body as {
      text: string;
      lang?: string;
      speed?: number;
    };

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: text' },
        { status: 400 }
      );
    }

    if (text.length > 500) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 500 characters.' },
        { status: 400 }
      );
    }

    const speedValue = typeof speed === 'number' ? Math.max(0.5, Math.min(2.0, speed)) : 1.0;

    // Check cache
    const cacheKey = `${text}:${lang || 'zh'}:${speedValue}`;
    const cached = ttsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return new NextResponse(cached.data, {
        headers: {
          'Content-Type': 'audio/wav',
          'Cache-Control': 'public, max-age=300',
          'X-Cache': 'HIT',
        },
      });
    }

    const client = await getClient();

    // Pick voice based on language (use SDK-supported voice names)
    let voice = 'tongtong'; // default Chinese voice - warm and friendly
    if (lang === 'en' || lang === 'en-US') {
      voice = 'kazi'; // English - clear and standard
    } else if (lang === 'zh' || lang === 'zh-CN') {
      voice = 'tongtong'; // Chinese - warm and friendly
    }

    const response = await client.audio.tts.create({
      input: text,
      voice,
      speed: speedValue,
      response_format: 'wav',
      stream: false,
    });

    // The TTS API returns a raw Response object
    const arrayBuffer = await response.arrayBuffer();

    // Update cache
    ttsCache.set(cacheKey, { data: arrayBuffer, timestamp: Date.now() });

    // Cleanup old cache entries periodically
    if (ttsCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of ttsCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          ttsCache.delete(key);
        }
      }
    }

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'public, max-age=300',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('TTS API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to generate speech', details: message },
      { status: 500 }
    );
  }
}
