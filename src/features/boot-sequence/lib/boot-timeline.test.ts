import { describe, expect, it } from "vitest";

import {
  bootDuration,
  HOLD_AFTER_LAST_LINE_MS,
  isSkipKey,
  lineDelay,
  lineInterval,
  LINES_WINDOW_MS,
} from "./boot-timeline";

describe("boot timeline", () => {
  it("spreads the lines over 1400 ms, rounding the interval down", () => {
    expect(LINES_WINDOW_MS).toBe(1400);
    expect(lineInterval(15)).toBe(100);
    expect(lineInterval(16)).toBe(93);
    expect(lineInterval(18)).toBe(82);
    expect(lineDelay(0, 16)).toBe(0);
    expect(lineDelay(15, 16)).toBe(1395);
  });

  it("BOOT-AC05: ends 400 ms after the last line, never later than 1800 ms", () => {
    expect(HOLD_AFTER_LAST_LINE_MS).toBe(400);
    expect(bootDuration(15, false)).toBe(1800);
    for (let lines = 2; lines <= 18; lines += 1) {
      expect(bootDuration(lines, false)).toBeLessThanOrEqual(1800);
      expect(bootDuration(lines, false)).toBeGreaterThan(1700);
    }
  });

  it("BOOT-AC11: with reduced motion only the hold remains", () => {
    expect(bootDuration(16, true)).toBe(400);
  });

  it("has nothing to spread with a single line or none", () => {
    expect(lineInterval(1)).toBe(0);
    expect(bootDuration(1, false)).toBe(400);
    expect(bootDuration(0, false)).toBe(400);
  });
});

describe("isSkipKey", () => {
  it("BOOT-AC06: any key skips, except a modifier alone", () => {
    for (const key of ["a", "Enter", " ", "Escape", "ArrowDown", "F5", "1"]) {
      expect(isSkipKey(key), key).toBe(true);
    }
    for (const key of ["Shift", "Control", "Alt", "AltGraph", "Meta"]) {
      expect(isSkipKey(key), key).toBe(false);
    }
  });

  it("BOOT-AC09: Tab does not skip, so that the keyboard can reach the skip button", () => {
    expect(isSkipKey("Tab")).toBe(false);
  });
});
