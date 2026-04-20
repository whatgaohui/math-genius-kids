// Text-to-speech helper for 知识小勇士
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
function getVoices(force = false): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }

  if (force) {
    voicesLoaded = false;
    voicesPromise = null;
  }

  if (voicesLoaded && voicesPromise) {
    return voicesPromise;
  }

  if (voicesPromise) return voicesPromise;

  voicesPromise = new Promise<SpeechSynthesisVoice[]>((resolve) => {
    // Try to get voices immediately
    let voices = window.speechSynthesis.getVoices();
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

    // Timeout after 3 seconds
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      voicesLoaded = true;
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
    }, 3000);
  });

  return voicesPromise;
}

/**
 * Find the best matching voice for a given language.
 * Prioritizes exact match, then language prefix, then any available voice.
 */
function findBestVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;

  const langPrefix = lang.split('-')[0]; // e.g., 'en' from 'en-US'

  // 1. Exact match (e.g., 'en-US' === 'en-US')
  const exact = voices.find((v) => v.lang === lang);
  if (exact) return exact;

  // 2. Same language, any region (e.g., 'en-GB' matches 'en-US' request)
  const sameLang = voices.find((v) => v.lang.startsWith(langPrefix) && v.lang !== 'zh-CN' && v.lang !== 'zh-TW');
  if (sameLang) return sameLang;

  // 3. For English: look for any English voice including non-standard ones
  if (langPrefix === 'en') {
    const anyEnglish = voices.find((v) => {
      const vLang = v.lang.toLowerCase();
      return vLang.startsWith('en');
    });
    if (anyEnglish) return anyEnglish;
  }

  // 4. Fallback: first non-Chinese voice
  const nonChinese = voices.find((v) => !v.lang.startsWith('zh'));
  if (nonChinese) return nonChinese;

  // 5. Last resort: first available voice
  return voices[0];
}

/**
 * Check if we're likely on a mobile device
 */
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Android|iPhone|iPad|iPod/i.test(ua);
}

/**
 * Speak text using the Web Speech API (browser native).
 * Improved voice selection and error handling.
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
      utterance.rate = Math.max(0.5, Math.min(2, options.speed));
      utterance.pitch = options.pitch;
      utterance.volume = 1;

      // Find best voice
      getVoices(true).then((voices) => {
        // Android workaround: voices may load async
        if (voices.length === 0) {
          // Retry once more after a short delay
          setTimeout(() => {
            const retryVoices = window.speechSynthesis.getVoices();
            const voice = findBestVoice(retryVoices, options.lang);
            if (voice) {
              utterance.voice = voice;
            }
            startSpeaking();
          }, 500);
          return;
        }

        const voice = findBestVoice(voices, options.lang);
        if (voice) {
          utterance.voice = voice;
        }

        startSpeaking();
      });

      let settled = false;
      function startSpeaking() {
        if (settled) return;
        utterance.onend = () => {
          if (!settled) { settled = true; resolve(); }
        };
        utterance.onerror = (e) => {
          if (!settled) { settled = true; reject(new Error(`TTS error: ${e.error}`)); }
        };
        window.speechSynthesis.speak(utterance);
      }

      // Timeout safety - 15 seconds max
      setTimeout(() => {
        if (!settled) {
          settled = true;
          window.speechSynthesis.cancel();
          resolve();
        }
      }, 15000);
    } catch {
      reject(new Error('Web Speech API not available'));
    }
  });
}

/**
 * Speak using the backend TTS API endpoint.
 */
async function speakWithBackend(
  text: string,
  options: { lang: string; speed: number }
): Promise<void> {
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
}

/**
 * Speak text with TTS.
 *
 * Strategy (unified for all platforms):
 * 1. Try Web Speech API first (works offline, no network needed)
 * 2. If Web Speech API fails, fallback to backend TTS API
 * 3. If both fail, silent resolve (no error thrown to caller)
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

  // Step 1: Try Web Speech API
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return speakWithWebSpeech(text, { lang, speed, pitch }).catch(() => {
      // Step 2: Fallback to backend
      return speakWithBackend(text, { lang, speed }).catch(() => {
        // Step 3: Both failed, silent
        console.warn('TTS: both Web Speech and Backend failed');
        return Promise.resolve();
      });
    });
  }

  // No Web Speech API, try backend only
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
  return 'speechSynthesis' in window;
}
