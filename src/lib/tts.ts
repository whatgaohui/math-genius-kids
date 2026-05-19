// Text-to-speech helper for 知识小勇士
'use client';

interface TTSOptions {
  lang?: string;
  speed?: number;
  pitch?: number;
}

// Track if voices are loaded and actually usable
let voicesLoaded = false;
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

// Global AudioContext for all audio playback (TTS backend, sounds, etc.)
// This MUST be created/resumed during a user gesture to work on mobile
let audioContext: AudioContext | null = null;

// Cache whether Web Speech API has usable voices (survives across calls)
let webSpeechHasVoices: boolean | null = null;

// Currently playing audio source (for stopping)
let currentBufferSource: AudioBufferSourceNode | null = null;
let currentHtmlAudio: HTMLAudioElement | null = null;

/**
 * Get or create the global AudioContext.
 * IMPORTANT: Must be called from a user gesture handler to work on mobile.
 */
function getAudioContext(): AudioContext {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContext = new AudioCtx();
  }
  return audioContext;
}

/**
 * Ensure AudioContext is resumed (critical for mobile browsers).
 * Must be called from a user gesture handler.
 */
function ensureAudioContext(): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch {
    // Silently fail
  }
}

/**
 * Check if the device is likely a Huawei/Honor phone.
 * These devices often have broken Web Speech API because they lack Google TTS.
 * Honor phones have UA strings containing "HONOR" or "Magic".
 * Huawei phones have UA strings containing "Huawei" or "HUAWEI".
 */
function isHuaweiOrHonor(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  // Also check for MagicOS which is Honor's custom OS
  return /HUAWEI|Huawei|HONOR|Honor|MagicOS|Magic/i.test(ua);
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
 * Check if we're in an Android WebView
 * WebView does NOT support Web Speech API at all
 */
function isAndroidWebView(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  // WebView typically has "wv" in the UA or doesn't have Chrome version
  return /Android/.test(ua) && (/wv/.test(ua) || !/Chrome\/[0-9]/.test(ua));
}

/**
 * Pre-load voices - call this early to ensure voices are available.
 * Returns voices array, which may be empty on devices without TTS engines.
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
 * Check if Web Speech API has voices available for the given language.
 * This is critical for detecting devices like Honor/Huawei where
 * speechSynthesis exists but has no usable TTS engine.
 */
async function hasUsableVoices(lang: string): Promise<boolean> {
  // If we already checked, use cached result
  if (webSpeechHasVoices === false) return false;

  // Android WebView: Web Speech API is NOT supported at all
  if (isAndroidWebView()) {
    console.log('[TTS] Android WebView detected, skipping Web Speech API');
    webSpeechHasVoices = false;
    return false;
  }

  // Honor/Huawei devices: skip Web Speech API entirely
  // These devices have speechSynthesis but no working TTS engine
  if (isHuaweiOrHonor()) {
    console.log('[TTS] Huawei/Honor device detected, skipping Web Speech API');
    webSpeechHasVoices = false;
    return false;
  }

  try {
    const voices = await getVoices(true);
    if (voices.length === 0) {
      console.log('[TTS] No voices available, Web Speech API not usable');
      webSpeechHasVoices = false;
      return false;
    }

    // Check if there's a voice matching the requested language
    const langPrefix = lang.split('-')[0];
    const hasMatchingVoice = voices.some((v) =>
      v.lang === lang || v.lang.startsWith(langPrefix)
    );

    if (!hasMatchingVoice) {
      console.log(`[TTS] No voice found for language "${lang}", Web Speech API may not work properly`);
      // Still allow it - the browser may fall back to a default voice
    }

    webSpeechHasVoices = true;
    return true;
  } catch {
    webSpeechHasVoices = false;
    return false;
  }
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
 * Speak text using the Web Speech API (browser native).
 *
 * KEY FIX: Detects "silent playback" - on Honor/Huawei devices, speak() may
 * trigger onend immediately without actually producing sound. We detect this
 * by checking if speech ended suspiciously fast (< 500ms for any text).
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
            // If still no voices after retry, reject to trigger backend fallback
            if (retryVoices.length === 0) {
              if (!settled) {
                settled = true;
                console.log('[TTS] Web Speech: no voices available, falling back to backend');
                reject(new Error('No voices available'));
              }
              return;
            }
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
      let speakStartTime = 0;

      function startSpeaking() {
        if (settled) return;

        // Mobile workaround: Chrome on Android sometimes needs a small delay
        // after user interaction before speech works
        const delay = isMobileDevice() ? 100 : 0;

        setTimeout(() => {
          if (settled) return;

          // Double-check AudioContext is still running (mobile can suspend it)
          ensureAudioContext();

          speakStartTime = Date.now();

          utterance.onend = () => {
            if (!settled) {
              const elapsed = Date.now() - speakStartTime;
              // KEY FIX: Detect "silent playback" on Honor/Huawei
              // If speech ended in less than 500ms for non-empty text,
              // the TTS engine likely didn't actually produce any sound
              const minExpectedDuration = text.length * 50; // ~50ms per character minimum
              if (elapsed < Math.min(500, minExpectedDuration) && text.length > 0) {
                console.log(`[TTS] Web Speech: suspiciously fast completion (${elapsed}ms for "${text}"), likely silent playback - falling back to backend`);
                webSpeechHasVoices = false;
                settled = true;
                reject(new Error('Silent playback detected'));
                return;
              }
              settled = true;
              resolve();
            }
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
 * Stop any currently playing audio
 */
function stopCurrentAudio(): void {
  // Stop AudioBufferSourceNode (backend TTS via AudioContext)
  if (currentBufferSource) {
    try {
      currentBufferSource.stop();
      currentBufferSource.disconnect();
    } catch {
      // Already stopped
    }
    currentBufferSource = null;
  }
  // Stop HTML5 Audio element (fallback)
  if (currentHtmlAudio) {
    try {
      currentHtmlAudio.pause();
      currentHtmlAudio.currentTime = 0;
    } catch {
      // Already stopped
    }
    currentHtmlAudio = null;
  }
}

/**
 * Speak using the backend TTS API endpoint.
 * 
 * KEY FIX: Uses AudioContext.decodeAudioData() instead of HTML5 Audio element.
 * This is critical for mobile browsers (especially Honor/Huawei) because:
 * 1. AudioContext can be unlocked during user gesture (click)
 * 2. After unlock, decodeAudioData() + AudioBufferSourceNode works even after async fetch
 * 3. HTML5 Audio.play() gets blocked by autoplay policy after async operations
 */
async function speakWithBackend(
  text: string,
  options: { lang: string; speed: number }
): Promise<void> {
  // Stop any currently playing audio first
  stopCurrentAudio();

  // Ensure AudioContext is created and resumed DURING user gesture
  ensureAudioContext();
  const ctx = getAudioContext();

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

    const arrayBuffer = await response.arrayBuffer();

    // Validate data has actual audio content
    if (arrayBuffer.byteLength < 100) {
      throw new Error('TTS API returned empty audio');
    }

    // Try AudioContext approach first (works on mobile after unlock)
    try {
      // Resume context if it got suspended again (mobile browsers can re-suspend)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      return new Promise((resolve, reject) => {
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);

        currentBufferSource = source;

        source.onended = () => {
          currentBufferSource = null;
          resolve();
        };

        source.onerror = (e) => {
          currentBufferSource = null;
          console.warn('[TTS] AudioBufferSource error:', e);
          // Fall back to HTML5 Audio
          playWithHtmlAudio(arrayBuffer).then(resolve).catch(reject);
        };

        try {
          source.start(0);
        } catch (startErr) {
          currentBufferSource = null;
          console.warn('[TTS] AudioBufferSource.start() failed, falling back to HTML5 Audio:', startErr);
          // Fall back to HTML5 Audio
          playWithHtmlAudio(arrayBuffer).then(resolve).catch(reject);
        }
      });
    } catch (decodeErr) {
      // decodeAudioData failed, try HTML5 Audio as fallback
      console.warn('[TTS] decodeAudioData failed, trying HTML5 Audio:', decodeErr);
      return playWithHtmlAudio(arrayBuffer);
    }
  } catch (error) {
    console.error('[TTS] Backend TTS failed:', error);
    throw error;
  }
}

/**
 * Fallback: Play audio using HTML5 Audio element.
 * Used when AudioContext.decodeAudioData() fails.
 * May be blocked by autoplay policy on mobile after async operations.
 */
function playWithHtmlAudio(arrayBuffer: ArrayBuffer): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      currentHtmlAudio = audio;

      const cleanup = () => {
        URL.revokeObjectURL(audioUrl);
        currentHtmlAudio = null;
      };

      audio.onended = () => {
        cleanup();
        resolve();
      };
      audio.onerror = () => {
        cleanup();
        reject(new Error('Audio playback failed'));
      };

      audio.play().then(() => {
        // Playback started successfully
      }).catch((e) => {
        cleanup();
        // On mobile, autoplay may be blocked
        if (isMobileDevice() && String(e).includes('NotAllowedError')) {
          console.log('[TTS] Autoplay blocked, showing click-to-play overlay');
          // Create a one-click overlay to trigger playback
          const overlay = document.createElement('div');
          overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.3);cursor:pointer;';
          overlay.innerHTML = '<div style="background:white;border-radius:16px;padding:24px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.2)"><div style="font-size:48px;margin-bottom:12px">🔊</div><p style="font-size:16px;color:#333;font-weight:600">点击播放发音</p></div>';
          overlay.onclick = () => {
            document.body.removeChild(overlay);
            ensureAudioContext();
            const newAudio = new Audio(audioUrl);
            newAudio.onended = () => { cleanup(); resolve(); };
            newAudio.onerror = () => { cleanup(); resolve(); };
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
    } catch {
      reject(new Error('HTML5 Audio playback failed'));
    }
  });
}

/**
 * Speak text with TTS.
 *
 * Strategy (optimized for all devices including Honor/Huawei):
 * 1. Check if Web Speech API has usable voices for the target language
 * 2. If Android WebView / Honor/Huawei detected OR no usable voices → go directly to backend TTS
 * 3. If Web Speech API appears usable → try it, but detect "silent playback"
 * 4. If Web Speech API fails or silently plays → fallback to backend TTS
 * 5. Backend TTS uses AudioContext.decodeAudioData() for reliable mobile playback
 * 6. If both fail → silent resolve (no error thrown to caller)
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

  // CRITICAL: Ensure AudioContext is created AND resumed during user gesture.
  // This must happen BEFORE any async operations to unlock audio on mobile.
  ensureAudioContext();

  // Also stop any currently playing audio to prevent overlap
  stopCurrentAudio();

  // Check if Web Speech API is available AND has usable voices
  const webSpeechAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;

  if (!webSpeechAvailable) {
    // No Web Speech API at all, try backend only
    return speakWithBackend(text, { lang, speed }).catch(() => {
      return Promise.resolve();
    });
  }

  // Check for usable voices (this also detects Honor/Huawei and Android WebView)
  return hasUsableVoices(lang).then((hasVoices) => {
    if (!hasVoices) {
      // No usable voices → go directly to backend TTS
      console.log('[TTS] Skipping Web Speech API (no usable voices), using backend TTS');
      return speakWithBackend(text, { lang, speed }).catch(() => {
        console.warn('[TTS] Backend TTS also failed');
        return Promise.resolve();
      });
    }

    // Web Speech API has voices, try it first
    return speakWithWebSpeech(text, { lang, speed, pitch }).catch(() => {
      // Web Speech failed (including silent playback detection) → fallback to backend
      console.log('[TTS] Web Speech failed, falling back to backend TTS');
      return speakWithBackend(text, { lang, speed }).catch(() => {
        console.warn('[TTS] Both Web Speech and Backend TTS failed');
        return Promise.resolve();
      });
    });
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
  // Stop Web Speech API
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  // Stop backend audio playback
  stopCurrentAudio();
}

/**
 * Check if TTS is available in the current browser.
 * Now also checks for actual voice availability.
 */
export function isTTSAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  // Web Speech API exists OR backend TTS can work
  if ('speechSynthesis' in window) return true;
  // Backend TTS might still work even without Web Speech API
  return true;
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
