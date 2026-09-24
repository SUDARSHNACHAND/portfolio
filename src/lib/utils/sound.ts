let audioCtx: AudioContext | null = null;

/**
 * Plays a subtle, tactile UI click sound using Web Audio API.
 * Synthesizes a crisp transient snap and warm rounded body decay.
 *
 * @param index Optional index of the navigation item to slightly modulate frequency.
 */
export function playNavClickSound(index?: number): void {
  try {
    if (typeof window === "undefined") return;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Harmonic frequency based on nav index (Home: 640Hz, About: 700Hz, Skills: 760Hz, Projects: 820Hz, Contact: 880Hz)
    const baseFreq = index !== undefined ? 640 + index * 60 : 720;

    // 1. High crisp snap transient (mechanical click feel)
    const snapOsc = audioCtx.createOscillator();
    const snapGain = audioCtx.createGain();
    snapOsc.type = "triangle";
    snapOsc.frequency.setValueAtTime(baseFreq * 2.2, now);
    snapOsc.frequency.exponentialRampToValueAtTime(160, now + 0.022);

    snapGain.gain.setValueAtTime(0.12, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

    snapOsc.connect(snapGain);
    snapGain.connect(audioCtx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.022);

    // 2. Warm rounded body thump (tactile feedback)
    const bodyOsc = audioCtx.createOscillator();
    const bodyGain = audioCtx.createGain();
    bodyOsc.type = "sine";
    bodyOsc.frequency.setValueAtTime(baseFreq, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(70, now + 0.042);

    bodyGain.gain.setValueAtTime(0.14, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(audioCtx.destination);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.042);
  } catch (err) {
    // Fail silently if browser audio is restricted
    console.debug("Audio click sound skipped:", err);
  }
}
