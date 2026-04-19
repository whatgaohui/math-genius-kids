// Text-to-speech helper for 学习小达人
'use client';

interface TTSOptions {
  lang?: string;
  speed?: number;
  pitch?: number;
}

// Track if voices are loaded
let voicesLoaded = false;
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

/**
 * Pre-load voices - call this early to ensure voices are available
 */
function getVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }

  if (voicesLoaded) {
    return Promise.resolve(window.speechSynthesis.getVoices());
  }

  if (voicesPromise) return voicesPromise;

  voicesPromise = new Promise<SpeechSynthesisVoice[]>((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesLoaded = true;
      resolve(voices);
      return;
    }

    // Wait for voiceschanged event
    const handler = () => {
      voicesLoaded = true;
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.addEventListener('voiceschanged', handler);

    // Timeout after 2 seconds - use whatever voices we have
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      voicesLoaded = true;
      resolve(window.speechSynthesis.getVoices());
    }, 2000);
  });

  return voicesPromise;
}

/**
 * Check if we're likely on a mobile device where Web Speech API is unreliable
 */
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Android|iPhone|iPad|iPod/i.test(ua);
}

/**
 * Speak text using the Web Speech API (browser native).
 * Only used as fallback on desktop.
 */
function speakWithWebSpeech(
  text: string,
  options: { lang: string; speed: number; pitch: number }
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang;
      utterance.rate = options.speed;
      utterance.pitch = options.pitch;

      // Get voices and find matching one
      getVoices().then((voices) => {
        const matchingVoice = voices.find(
          (v) => v.lang.startsWith(options.lang.split('-')[0])
        );
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }

        utterance.onend = () => resolve();
        utterance.onerror = () => {
          reject(new Error('Web Speech API error'));
        };

        window.speechSynthesis.speak(utterance);
      });

      // Timeout safety - resolve after 10 seconds even if not done
      setTimeout(() => {
        window.speechSynthesis.cancel();
        resolve();
      }, 10000);
    } catch {
      reject(new Error('Web Speech API not available'));
    }
  });
}

/**
 * Speak using the backend TTS API endpoint (most reliable).
 */
async function speakWithBackend(
  text: string,
  options: { lang: string; speed: number }
): Promise<void> {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        lang: options.lang,
        speed: options.speed,
      }),
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status}`);
    }

    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);

    return new Promise((resolve, reject) => {
      const cleanup = () => {
        URL.revokeObjectURL(audioUrl);
      };

      audio.onended = () => {
        cleanup();
        resolve();
      };
      audio.onerror = () => {
        cleanup();
        reject(new Error('Audio playback failed'));
      };
      audio.play().catch((e) => {
        cleanup();
        reject(e);
      });
    });
  } catch (error) {
    console.warn('Backend TTS failed:', error);
    throw error;
  }
}

/**
 * Speak text with TTS.
 *
 * Strategy:
 * 1. On mobile: Always use backend API (more reliable, better quality)
 * 2. On desktop: Try Web Speech API first, fallback to backend
 *
 * @param text - The text to speak
 * @param options - Optional configuration (language, speed, pitch)
 * @returns Promise that resolves when speech is done
 */
export function speakWithAPI(
  text: string,
  options: TTSOptions = {}
): Promise<void> {
  const { lang = 'zh-CN', speed = 1, pitch = 1 } = options;

  // On mobile, always use backend TTS (more reliable)
  if (isMobileDevice()) {
    return speakWithBackend(text, { lang, speed }).catch(() => {
      // Last resort: try Web Speech API even on mobile
      if ('speechSynthesis' in window) {
        return speakWithWebSpeech(text, { lang, speed, pitch });
      }
      return Promise.resolve(); // Silent fail
    });
  }

  // On desktop: try Web Speech API first, then fallback to backend
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return speakWithWebSpeech(text, { lang, speed, pitch }).catch(() => {
      return speakWithBackend(text, { lang, speed }).catch(() => {
        // Both failed, silent resolve
        return Promise.resolve();
      });
    });
  }

  // No Web Speech API, use backend
  return speakWithBackend(text, { lang, speed }).catch(() => {
    return Promise.resolve();
  });
}

/**
 * Speak an English word for listening practice.
 */
export function speakEnglish(word: string, speed: number = 0.8): Promise<void> {
  return speakWithAPI(word, { lang: 'en-US', speed });
}

/**
 * Speak a Chinese character for dictation practice.
 */
export function speakChinese(text: string, speed: number = 0.7): Promise<void> {
  return speakWithAPI(text, { lang: 'zh-CN', speed });
}

/**
 * Stop any ongoing speech.
 */
export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Check if TTS is available in the current browser.
 */
export function isTTSAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window || true; // Always true since we have backend fallback
}
