import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SoundName } from "./sound";

interface ParamCall {
  readonly method: string;
  readonly value: number;
  readonly time: number;
}

class FakeParam {
  readonly calls: ParamCall[] = [];
  setValueAtTime(value: number, time: number): void {
    this.calls.push({ method: "set", value, time });
  }
  linearRampToValueAtTime(value: number, time: number): void {
    this.calls.push({ method: "linear", value, time });
  }
  exponentialRampToValueAtTime(value: number, time: number): void {
    this.calls.push({ method: "exponential", value, time });
  }
}

class FakeOscillator {
  type = "";
  readonly frequency = new FakeParam();
  startedAt: number | undefined;
  stoppedAt: number | undefined;
  connect(): void {
    return undefined;
  }
  start(time: number): void {
    this.startedAt = time;
  }
  stop(time: number): void {
    this.stoppedAt = time;
  }
}

class FakeGain {
  readonly gain = new FakeParam();
  connect(): void {
    return undefined;
  }
}

const contexts: FakeAudioContext[] = [];
let resume: () => Promise<void> = () => Promise.resolve();

class FakeAudioContext {
  readonly currentTime = 10;
  readonly destination = {};
  state = "suspended";
  readonly oscillators: FakeOscillator[] = [];
  readonly gains: FakeGain[] = [];
  constructor() {
    contexts.push(this);
  }
  resume(): Promise<void> {
    return resume();
  }
  createOscillator(): FakeOscillator {
    const oscillator = new FakeOscillator();
    this.oscillators.push(oscillator);
    return oscillator;
  }
  createGain(): FakeGain {
    const gain = new FakeGain();
    this.gains.push(gain);
    return gain;
  }
}

const EXPECTED: Readonly<
  Record<SoundName, { wave: string; frequencies: readonly number[]; ms: number }>
> = {
  boot: { wave: "sine", frequencies: [880], ms: 120 },
  open: { wave: "triangle", frequencies: [660, 880], ms: 90 },
  close: { wave: "triangle", frequencies: [660, 440], ms: 90 },
  step: { wave: "triangle", frequencies: [740], ms: 50 },
  toggle: { wave: "sine", frequencies: [520], ms: 40 },
};

async function load(options: { readonly soundEnabled: boolean; readonly mode?: string }) {
  vi.stubGlobal("document", { documentElement: { dataset: { mode: options.mode ?? "scene" } } });
  const { usePrefsStore } = await import("@/shared/state/prefs-store");
  usePrefsStore.setState({ soundEnabled: options.soundEnabled });
  return import("./sound");
}

beforeEach(() => {
  contexts.length = 0;
  resume = () => Promise.resolve();
  vi.resetModules();
  vi.stubGlobal("AudioContext", FakeAudioContext);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("playSound", () => {
  it("SET-AC07: creates no audio context while sound is off", async () => {
    const { playSound, SOUND_NAMES } = await load({ soundEnabled: false });
    for (const name of SOUND_NAMES) playSound(name);
    expect(contexts).toHaveLength(0);
  });

  it("SET-AC07: stays silent in simple mode even with sound on", async () => {
    const { playSound } = await load({ soundEnabled: true, mode: "simple" });
    playSound("open");
    expect(contexts).toHaveLength(0);
  });

  it.each(Object.entries(EXPECTED))(
    "SET-AC07: %s uses the wave, frequencies and duration of the catalogue",
    async (name, expected) => {
      const { playSound, isSoundName } = await load({ soundEnabled: true });
      expect(isSoundName(name)).toBe(true);
      if (!isSoundName(name)) return;

      playSound(name);

      const [context] = contexts;
      const [oscillator] = context?.oscillators ?? [];
      const end = 10 + expected.ms / 1000;
      expect(context?.oscillators).toHaveLength(1);
      expect(oscillator?.type).toBe(expected.wave);
      expect(oscillator?.frequency.calls.map((call) => call.value)).toEqual(expected.frequencies);
      expect(oscillator?.frequency.calls.at(0)).toEqual({
        method: "set",
        value: expected.frequencies[0],
        time: 10,
      });
      if (expected.frequencies.length === 2) {
        expect(oscillator?.frequency.calls.at(1)?.method).toBe("linear");
        expect(oscillator?.frequency.calls.at(1)?.time).toBeCloseTo(end);
      }
      expect(oscillator?.startedAt).toBe(10);
      expect(oscillator?.stoppedAt).toBeCloseTo(end);
    },
  );

  it("SET-AC07: the volume envelope never exceeds a gain of 0.06", async () => {
    const { playSound, SOUND_NAMES } = await load({ soundEnabled: true });
    for (const name of SOUND_NAMES) playSound(name);

    const gains = contexts.flatMap((context) => context.gains);
    expect(gains).toHaveLength(SOUND_NAMES.length);
    for (const gain of gains) {
      const [start, attack, decay] = gain.gain.calls;
      expect(Math.max(...gain.gain.calls.map((call) => call.value))).toBe(0.06);
      expect(start).toMatchObject({ method: "set", time: 10 });
      expect(attack).toMatchObject({ method: "linear", value: 0.06 });
      expect(attack?.time).toBeCloseTo(10.005);
      expect(decay?.method).toBe("exponential");
      expect(decay?.value).toBeLessThan(0.001);
    }
  });

  it("SET-AC07: reuses a single audio context for every effect", async () => {
    const { playSound } = await load({ soundEnabled: true });
    playSound("open");
    playSound("close");
    expect(contexts).toHaveLength(1);
  });

  it("SET-AC08: does nothing when the browser has no Web Audio", async () => {
    vi.stubGlobal("AudioContext", undefined);
    const { playSound } = await load({ soundEnabled: true });
    expect(() => {
      playSound("open");
    }).not.toThrow();
  });

  it("SET-AC08: does not throw when the audio context cannot be created", async () => {
    vi.stubGlobal("AudioContext", function BlockedAudioContext(): never {
      throw new Error("NotAllowedError");
    });
    const { playSound } = await load({ soundEnabled: true });
    expect(() => {
      playSound("toggle");
    }).not.toThrow();
  });

  it("SET-AC08: leaves no rejected promise when the context cannot resume", async () => {
    const rejections: unknown[] = [];
    const onRejection = (reason: unknown): void => {
      rejections.push(reason);
    };
    process.on("unhandledRejection", onRejection);
    resume = () => Promise.reject(new Error("NotAllowedError"));
    const { playSound } = await load({ soundEnabled: true });

    expect(() => {
      playSound("step");
    }).not.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 0));

    process.off("unhandledRejection", onRejection);
    expect(rejections).toEqual([]);
  });

  it("does not resume a context that is already running", async () => {
    const calls: string[] = [];
    resume = () => {
      calls.push("resume");
      return Promise.resolve();
    };
    const { playSound } = await load({ soundEnabled: true });
    playSound("open");
    const [context] = contexts;
    if (context !== undefined) context.state = "running";
    playSound("close");
    expect(calls).toEqual(["resume"]);
  });
});
