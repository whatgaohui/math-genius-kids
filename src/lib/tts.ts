// Text-to-speech helper for 学习小达人
'use client';

interface TTSOptions {
  lang?: string;
  speed?: number;
  pitch?: number;
}

/**
 * Speak text using the Web Speech API with a backend fallback.
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

  // Try Web Speech API first
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return speakWithWebSpeech(text, { lang, speed, pitch });
  }

  // Fallback to backend TTS API
  return speakWithBackend(text, { lang, speed });
}

/**
 * Speak using the Web Speech API (browser native).
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

      // Try to find a matching voice
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(
        (v) => v.lang.startsWith(options.lang.split('-')[0])
      );
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        // If Web Speech API fails, try backend
        speakWithBackend(text, { lang: options.lang, speed: options.speed })
          .then(resolve)
          .catch(reject);
      };

      window.speechSynthesis.speak(utterance);

      // Timeout safety - resolve after 10 seconds even if not done
      setTimeout(() => {
        window.speechSynthesis.cancel();
        resolve();
      }, 10000);
    } catch {
      // If Web Speech API is not available, try backend
      speakWithBackend(text, { lang: options.lang, speed: options.speed })
        .then(resolve)
        .catch(reject);
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
    const audio = new Audio(URL.createObjectURL(blob));

    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audio.src);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audio.src);
        reject(new Error('Audio playback failed'));
      };
      audio.play().catch(reject);
    });
  } catch (error) {
    console.warn('Backend TTS failed:', error);
    // Silently fail - TTS is not critical for the app to function
  }
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
