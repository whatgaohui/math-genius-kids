// Text-to-speech helper for 知识小勇士
'use client';

// ─── Type declarations for Android native bridge ────────────────────────────
interface AndroidTTSBridge {
  speak(text: string, lang: string, rate: number, pitch: number, callbackId: number): void;
  stop(): void;
  isAvailable(): boolean;
  getEngines(): string;
}

declare global {
  interface Window {
    AndroidTTS?: AndroidTTSBridge;
    _ttsCallbacks?: Record<number, (type: string, msg: string) => void>;
    _ttsCallbackCounter?: number;
    _nativeTTSReady?: boolean;
    _onNativeTTSReady?: () => void;
  }
}

interface TTSOptions {
  lang?: string;
  speed?: number;
  pitch?: number;
}

// ─── State ──────────────────────────────────────────────────────────────────

// Global AudioContext for backend TTS playback
let audioContext: AudioContext | null = null;

// Currently playing audio source (for stopping)
let currentBufferSource: AudioBufferSourceNode | null = null;
let currentHtmlAudio: HTMLAudioElement | null = null;

// Track if voices are loaded and actually usable (for browser Web Speech API)
let voicesLoaded = false;
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;
let webSpeechHasVoices: boolean | null = null;

// ─── Android Native Bridge Detection ────────────────────────────────────────

/**
 * Check if the Android native TTS bridge OBJECT exists.
 * We check for object existence only, NOT isAvailable(), because:
 * - AndroidTTS object is injected immediately on WebView creation
 * - But TTS engine initialization takes 1-2 seconds (async)
 * - isAvailable() returns false during init, causing hasNativeBridge() to return false
 * - This makes the code fall through to Web Speech API, which doesn't work in WebView
 * - Result: NO SOUND on first click after app starts
 *
 * By checking object existence only, we ensure speakWithNativeBridge is always used
 * when running inside the APK. The speakWithNativeBridge function handles the
 * "TTS not ready yet" case by waiting for initialization to complete.
 */
function hasNativeBridge(): boolean {
  return typeof window !== 'undefined' && typeof window.AndroidTTS !== 'undefined';
}

/**
 * Wait for the native TTS engine to become ready (max 5 seconds).
 * Android TextToSpeech initialization is async and takes 1-2 seconds.
 * During this time, AndroidTTS.isAvailable() returns false.
 */
function waitForNativeTTS(timeoutMs: number = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof window.AndroidTTS === 'undefined') {
      resolve(false);
      return;
    }
    if (window.AndroidTTS.isAvailable()) {
      resolve(true);
      return;
    }
    // TTS is initializing - wait for it
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (window.AndroidTTS?.isAvailable()) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > timeoutMs) {
        clearInterval(checkInterval);
        console.warn('[TTS] Native TTS did not become ready within timeout');
        resolve(false);
      }
    }, 100);
  });
}

/**
 * Speak using the Android native TTS bridge.
 * This is the MOST RELIABLE method for APK builds because:
 * 1. Android WebView does NOT support window.speechSynthesis (Chromium bug #40417848)
 * 2. Android's native TextToSpeech works on ALL devices including Huawei/Honor
 * 3. No server backend needed (unlike /api/tts which requires a running server)
 *
 * IMPORTANT: If TTS engine is not ready yet (still initializing), this function
 * will WAIT up to 5 seconds for it to become ready before speaking.
 * This fixes the "no sound on first click" issue.
 */
function speakWithNativeBridge(
  text: string,
  options: { lang: string; speed: number; pitch: number }
): Promise<void> {
  return new Promise((resolve) => {
    try {
      if (!window.AndroidTTS) {
        resolve();
        return;
      }

      // If TTS is not ready yet, wait for it
      if (!window.AndroidTTS.isAvailable()) {
        console.log('[TTS] Native TTS not ready yet, waiting...');
        waitForNativeTTS(5000).then((ready) => {
          if (!ready) {
            console.warn('[TTS] Native TTS failed to initialize, giving up');
            resolve();
            return;
          }
          doSpeak();
        });
        return;
      }

      doSpeak();

      function doSpeak() {
        try {
          // Initialize callback storage if needed
          if (!window._ttsCallbacks) {
            window._ttsCallbacks = {};
            window._ttsCallbackCounter = 0;
          }

          const callbackId = ++window._ttsCallbackCounter;

          // Set up callback
          window._ttsCallbacks[callbackId] = (type: string, _msg: string) => {
            delete window._ttsCallbacks[callbackId];
            if (type === 'error') {
              console.warn('[TTS] Native bridge error:', _msg);
            }
            resolve(); // Always resolve, never reject - don't break the app
          };

          // Safety timeout: if native bridge doesn't call back in 15 seconds, resolve
          setTimeout(() => {
            if (window._ttsCallbacks && window._ttsCallbacks[callbackId]) {
              delete window._ttsCallbacks[callbackId];
              resolve();
            }
          }, 15000);

          // Call the native bridge
          window.AndroidTTS!.speak(text, options.lang, options.speed, options.pitch, callbackId);
        } catch {
          resolve();
        }
      }
    } catch {
      resolve();
    }
  });
}

/**
 * Stop native TTS bridge playback
 */
function stopNativeBridge(): void {
  try {
    if (window.AndroidTTS) {
      window.AndroidTTS.stop();
    }
  } catch {
    // Silent fail
  }
}

// ─── AudioContext helpers ───────────────────────────────────────────────────

function getAudioContext(): AudioContext {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContext = new AudioCtx();
  }
  return audioContext;
}

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

// ─── Device detection ───────────────────────────────────────────────────────

function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Android|iPhone|iPad|iPod/i.test(ua);
}

// ─── Web Speech API (browser only, NOT available in WebView) ────────────────

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
    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesLoaded = true;
      resolve(voices);
      return;
    }

    const handler = () => {
      voicesLoaded = true;
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.addEventListener('voiceschanged', handler);

    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      voicesLoaded = true;
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
    }, 3000);
  });

  return voicesPromise;
}

async function hasUsableVoices(lang: string): Promise<boolean> {
  if (webSpeechHasVoices === false) return false;

  try {
    const voices = await getVoices(true);
    if (voices.length === 0) {
      webSpeechHasVoices = false;
      return false;
    }

    const langPrefix = lang.split('-')[0];
    const hasMatchingVoice = voices.some((v) =>
      v.lang === lang || v.lang.startsWith(langPrefix)
    );

    if (!hasMatchingVoice) {
      console.log(`[TTS] No voice for "${lang}" in Web Speech API`);
    }

    webSpeechHasVoices = true;
    return true;
  } catch {
    webSpeechHasVoices = false;
    return false;
  }
}

function findBestVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  const langPrefix = lang.split('-')[0];

  const exact = voices.find((v) => v.lang === lang);
  if (exact) return exact;

  const sameLang = voices.find((v) => v.lang.startsWith(langPrefix));
  if (sameLang) return sameLang;

  return voices[0];
}

function speakWithWebSpeech(
  text: string,
  options: { lang: string; speed: number; pitch: number }
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      ensureAudioContext();
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang;
      utterance.rate = Math.max(0.5, Math.min(2, options.speed));
      utterance.pitch = options.pitch;
      utterance.volume = 1;

      getVoices(true).then((voices) => {
        if (voices.length === 0) {
          setTimeout(() => {
            const retryVoices = window.speechSynthesis.getVoices();
            if (retryVoices.length === 0) {
              if (!settled) {
                settled = true;
                reject(new Error('No voices available'));
              }
              return;
            }
            const voice = findBestVoice(retryVoices, options.lang);
            if (voice) utterance.voice = voice;
            startSpeaking();
          }, 500);
          return;
        }

        const voice = findBestVoice(voices, options.lang);
        if (voice) utterance.voice = voice;
        startSpeaking();
      });

      let settled = false;
      let speakStartTime = 0;

      function startSpeaking() {
        if (settled) return;

        const delay = isMobileDevice() ? 100 : 0;

        setTimeout(() => {
          if (settled) return;
          ensureAudioContext();
          speakStartTime = Date.now();

          utterance.onend = () => {
            if (!settled) {
              const elapsed = Date.now() - speakStartTime;
              const minExpectedDuration = text.length * 50;
              if (elapsed < Math.min(500, minExpectedDuration) && text.length > 0) {
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

// ─── Backend TTS API (server required, only works in browser with dev server) ──

function stopCurrentAudio(): void {
  if (currentBufferSource) {
    try { currentBufferSource.stop(); currentBufferSource.disconnect(); } catch { /* ok */ }
    currentBufferSource = null;
  }
  if (currentHtmlAudio) {
    try { currentHtmlAudio.pause(); currentHtmlAudio.currentTime = 0; } catch { /* ok */ }
    currentHtmlAudio = null;
  }
}

async function speakWithBackend(
  text: string,
  options: { lang: string; speed: number }
): Promise<void> {
  stopCurrentAudio();
  ensureAudioContext();
  const ctx = getAudioContext();

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang: options.lang, speed: options.speed }),
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength < 100) {
      throw new Error('TTS API returned empty audio');
    }

    try {
      if (ctx.state === 'suspended') await ctx.resume();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      return new Promise((resolve, reject) => {
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        currentBufferSource = source;

        source.onended = () => { currentBufferSource = null; resolve(); };
        source.onerror = () => {
          currentBufferSource = null;
          playWithHtmlAudio(arrayBuffer).then(resolve).catch(reject);
        };

        try {
          source.start(0);
        } catch {
          currentBufferSource = null;
          playWithHtmlAudio(arrayBuffer).then(resolve).catch(reject);
        }
      });
    } catch {
      return playWithHtmlAudio(arrayBuffer);
    }
  } catch (error) {
    console.error('[TTS] Backend TTS failed:', error);
    throw error;
  }
}

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

      audio.onended = () => { cleanup(); resolve(); };
      audio.onerror = () => { cleanup(); reject(new Error('Audio playback failed')); };

      audio.play().catch((e) => {
        cleanup();
        reject(e);
      });
    } catch {
      reject(new Error('HTML5 Audio playback failed'));
    }
  });
}

// ─── Main speak function ────────────────────────────────────────────────────

/**
 * Speak text with TTS.
 *
 * Strategy (PRIORITY ORDER):
 * 1. Android native bridge (window.AndroidTTS) — for APK builds
 *    - Works on ALL devices including Huawei/Honor
 *    - Uses Android's native TextToSpeech engine
 *    - Available only when running inside the Android WebView app
 *
 * 2. Web Speech API (window.speechSynthesis) — for browser
 *    - Only available in Chrome/Firefox/Safari browsers
 *    - NOT available in Android WebView (Chromium bug #40417848)
 *    - May not work on Huawei/Honor devices without Google TTS
 *
 * 3. Backend TTS API (/api/tts) — for browser fallback
 *    - Only works when Next.js server is running (not in APK)
 *    - Uses z-ai-web-dev-sdk for high-quality TTS
 *
 * 4. Silent resolve — if nothing works, don't crash the app
 */
export function speakWithAPI(
  text: string,
  options: TTSOptions = {}
): Promise<void> {
  const { lang = 'zh-CN', speed = 1, pitch = 1 } = options;

  // Unlock AudioContext for sound effects
  ensureAudioContext();

  // Stop any currently playing audio
  stopCurrentAudio();
  stopNativeBridge();

  // ── PRIORITY 1: Android native TTS bridge ──
  if (hasNativeBridge()) {
    console.log('[TTS] Using Android native TTS bridge');
    return speakWithNativeBridge(text, { lang, speed, pitch });
  }

  // ── PRIORITY 2: Web Speech API (browser only) ──
  const webSpeechAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;

  if (webSpeechAvailable) {
    return hasUsableVoices(lang).then((hasVoices) => {
      if (hasVoices) {
        return speakWithWebSpeech(text, { lang, speed, pitch }).catch(() => {
          // Web Speech failed → try backend
          console.log('[TTS] Web Speech failed, trying backend TTS');
          return speakWithBackend(text, { lang, speed }).catch(() => {
            return Promise.resolve();
          });
        });
      }

      // No usable voices → try backend
      console.log('[TTS] No usable voices, trying backend TTS');
      return speakWithBackend(text, { lang, speed }).catch(() => {
        return Promise.resolve();
      });
    });
  }

  // ── PRIORITY 3: Backend TTS API ──
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
  // Stop native bridge
  stopNativeBridge();
  // Stop Web Speech API
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  // Stop backend audio
  stopCurrentAudio();
}

/**
 * Check if TTS is available.
 */
export function isTTSAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  // Native bridge is available
  if (hasNativeBridge()) return true;
  // Web Speech API exists
  if ('speechSynthesis' in window) return true;
  // Backend might work
  return true;
}

/**
 * Resume audio context - should be called on user interaction (e.g., touchstart)
 */
export function resumeAudioForMobile(): void {
  ensureAudioContext();
  // Also try to warm up speech synthesis
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
