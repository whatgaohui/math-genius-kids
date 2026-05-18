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

// Audio context for ensuring playback works on mobile
let audioContext: AudioContext | null = null;

/**
 * Ensure AudioContext is resumed (critical for mobile browsers)
 * Must be called from a user gesture handler
 */
function ensureAudioContext(): void {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  } catch {
    // Silently fail
  }
}

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
  const sameLang = voices.find((v) => v.lang.startsWith(langPrefix));
  if (sameLang) return sameLang;

  // 3. For English: look for any English voice including non-standard ones
  if (langPrefix === 'en') {
    const anyEnglish = voices.find((v) => {
      const vLang = v.lang.toLowerCase();
      return vLang.startsWith('en');
    });
    if (anyEnglish) return anyEnglish;
  }

  // 4. Last resort: first available voice
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
 * Improved with mobile support: resumes AudioContext, handles autoplay restrictions.
 */
function speakWithWebSpeech(
  text: string,
  options: { lang: string; speed: number; pitch: number }
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Resume AudioContext for mobile browsers (needed for speech to work)
      ensureAudioContext();

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

        // Mobile workaround: Chrome on Android sometimes needs a small delay
        // after user interaction before speech works
        const delay = isMobileDevice() ? 100 : 0;

        setTimeout(() => {
          if (settled) return;

          // Double-check AudioContext is still running (mobile can suspend it)
          ensureAudioContext();

          utterance.onend = () => {
            if (!settled) { settled = true; resolve(); }
          };
          utterance.onerror = (e) => {
            if (!settled) {
              settled = true;
              // Don't reject on "canceled" or "interrupted" errors (common on mobile)
              const errorStr = String(e.error);
              if (errorStr === 'canceled' || errorStr === 'interrupted') {
                resolve();
              } else {
                reject(new Error(`TTS error: ${e.error}`));
              }
            }
          };

          try {
            window.speechSynthesis.speak(utterance);

            // Chrome on Android bug: speechSynthesis can get stuck in "paused" state
            // This workaround periodically resumes it
            if (isMobileDevice()) {
              const resumeInterval = setInterval(() => {
                if (window.speechSynthesis.paused) {
                  window.speechSynthesis.resume();
                }
                if (settled || !window.speechSynthesis.speaking) {
                  clearInterval(resumeInterval);
                }
              }, 200);
            }
          } catch (speakErr) {
            if (!settled) { settled = true; reject(speakErr); }
          }
        }, delay);
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
 * Improved with mobile Audio playback fix.
 */
async function speakWithBackend(
  text: string,
  options: { lang: string; speed: number }
): Promise<void> {
  // Resume AudioContext for mobile browsers
  ensureAudioContext();

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

    // Mobile browsers require play() to be called from user gesture
    // The play() call must happen in the same call stack as the user interaction
    audio.play().then(() => {
      // Playback started successfully
    }).catch((e) => {
      cleanup();
      // On mobile, autoplay may be blocked. Try with user interaction workaround
      if (isMobileDevice() && String(e).includes('NotAllowedError')) {
        // Create a one-click overlay to trigger playback
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.3);cursor:pointer;';
        overlay.innerHTML = '<div style="background:white;border-radius:16px;padding:24px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.2)"><div style="font-size:48px;margin-bottom:12px">🔊</div><p style="font-size:16px;color:#333;font-weight:600">点击播放发音</p></div>';
        overlay.onclick = () => {
          document.body.removeChild(overlay);
          ensureAudioContext();
          const newAudio = new Audio(audioUrl);
          newAudio.onended = () => { cleanup(); resolve(); };
          newAudio.onerror = () => { cleanup(); reject(new Error('Audio playback failed')); };
          newAudio.play().catch(() => { cleanup(); resolve(); });
        };
        document.body.appendChild(overlay);
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
            cleanup();
            resolve();
          }
        }, 5000);
      } else {
        reject(e);
      }
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
 * On mobile: ensures AudioContext is resumed before speaking
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

  // Ensure AudioContext is ready (mobile browsers need this)
  ensureAudioContext();

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

/**
 * Resume audio context - should be called on user interaction (e.g., touchstart)
 * This is critical for mobile browsers that block audio until user gesture.
 */
export function resumeAudioForMobile(): void {
  ensureAudioContext();
  // Also try to warm up speech synthesis by creating and immediately canceling
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      const warmup = new SpeechSynthesisUtterance('');
      warmup.volume = 0;
      window.speechSynthesis.speak(warmup);
      window.speechSynthesis.cancel();
    } catch {
      // Silent fail
    }
  }
}
