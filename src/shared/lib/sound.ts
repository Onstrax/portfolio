// Sound engine (SET §4.5). Effects are synthesized with the Web Audio API: there are no audio
// files, and no audio context exists until an effect really has to play (QLT-R34).
import { usePrefsStore } from "@/shared/state/prefs-store";

export const SOUND_NAMES = ["boot", "open", "close", "step", "toggle"] as const;
export type SoundName = (typeof SOUND_NAMES)[number];

export function isSoundName(value: unknown): value is SoundName {
  return SOUND_NAMES.some((name) => name === value);
}

interface SoundSpec {
  readonly wave: OscillatorType;
  /** One frequency, or two when the pitch glides from the first to the second. */
  readonly frequencies: readonly [number] | readonly [number, number];
  readonly durationMs: number;
}

const SOUNDS: Readonly<Record<SoundName, SoundSpec>> = {
  boot: { wave: "sine", frequencies: [880], durationMs: 120 },
  open: { wave: "triangle", frequencies: [660, 880], durationMs: 90 },
  close: { wave: "triangle", frequencies: [660, 440], durationMs: 90 },
  step: { wave: "triangle", frequencies: [740], durationMs: 50 },
  toggle: { wave: "sine", frequencies: [520], durationMs: 40 },
};

/** Effects must read as a nuance, not as an alert (SET-R20). */
const PEAK_GAIN = 0.06;
const ATTACK_SECONDS = 0.005;
/** Exponential ramps cannot reach zero: this is silence for practical purposes. */
const SILENCE = 0.0001;

let audioContext: AudioContext | undefined;

function shouldPlay(): boolean {
  if (!usePrefsStore.getState().soundEnabled) return false;
  return document.documentElement.dataset["mode"] === "scene";
}

function synthesize(context: AudioContext, sound: SoundSpec): void {
  const start = context.currentTime;
  const end = start + sound.durationMs / 1000;
  const [from, to] = sound.frequencies;

  const oscillator = context.createOscillator();
  oscillator.type = sound.wave;
  oscillator.frequency.setValueAtTime(from, start);
  if (to !== undefined) oscillator.frequency.linearRampToValueAtTime(to, end);

  const envelope = context.createGain();
  envelope.gain.setValueAtTime(SILENCE, start);
  envelope.gain.linearRampToValueAtTime(PEAK_GAIN, start + ATTACK_SECONDS);
  envelope.gain.exponentialRampToValueAtTime(SILENCE, end);

  oscillator.connect(envelope);
  envelope.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(end);
}

/**
 * Plays an effect if sound is on and the page is in scene mode. Never throws and never leaves a
 * rejected promise: when the browser cannot play, the effect is skipped silently (SET-R22).
 */
export function playSound(name: SoundName): void {
  try {
    if (!shouldPlay() || typeof AudioContext === "undefined") return;
    audioContext ??= new AudioContext();
    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => undefined);
    }
    synthesize(audioContext, SOUNDS[name]);
  } catch {
    // Web Audio is unavailable or blocked: the effect is omitted.
  }
}
