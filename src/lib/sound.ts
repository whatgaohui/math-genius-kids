'use client';

// Sound effects using Web Audio API - no audio files needed

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

/** Play a tone with optional decay */
function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.15,
  startDelay: number = 0
): void {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startDelay);
    gainNode.gain.setValueAtTime(volume, ctx.currentTime + startDelay);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime + startDelay);
    oscillator.stop(ctx.currentTime + startDelay + duration);
  } catch {
    // Silently fail if audio is not available
  }
}

/** Play correct answer sound - cheerful ascending tones */
export function playCorrectSound(): void {
  playTone(523.25, 0.12, 'sine', 0.12, 0);    // C5
  playTone(659.25, 0.12, 'sine', 0.12, 0.08);  // E5
  playTone(783.99, 0.2, 'sine', 0.12, 0.16);   // G5
}

/** Play wrong answer sound - gentle descending tone */
export function playWrongSound(): void {
  playTone(329.63, 0.15, 'triangle', 0.1, 0);   // E4
  playTone(261.63, 0.25, 'triangle', 0.1, 0.1); // C4
}

/** Play click / UI interaction sound - short blip */
export function playClickSound(): void {
  playTone(880, 0.06, 'sine', 0.08);
}

/** Play session complete sound - victory fanfare */
export function playCompleteSound(): void {
  playTone(523.25, 0.1, 'sine', 0.12, 0);      // C5
  playTone(659.25, 0.1, 'sine', 0.12, 0.1);    // E5
  playTone(783.99, 0.1, 'sine', 0.12, 0.2);    // G5
  playTone(1046.50, 0.3, 'sine', 0.15, 0.3);   // C6
}

/** Play a combo sound - escalating pitch */
export function playComboSound(comboCount: number): void {
  // Map combo to frequency: higher combos = higher pitch
  const baseFreq = 440 + comboCount * 40;
  const clampedFreq = Math.min(baseFreq, 1200);
  playTone(clampedFreq, 0.08, 'sine', 0.1);
}

/** Play level up sound */
export function playLevelUpSound(): void {
  playTone(523.25, 0.1, 'square', 0.06, 0);
  playTone(659.25, 0.1, 'square', 0.06, 0.1);
  playTone(783.99, 0.1, 'square', 0.06, 0.2);
  playTone(1046.50, 0.1, 'square', 0.06, 0.3);
  playTone(1318.51, 0.4, 'square', 0.08, 0.4);
}

/** Resume audio context (needed for mobile browsers) */
export function resumeAudioContext(): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch {
    // Silently fail
  }
}
