import { describe, expect, it } from "vitest";

import {
  DISPLAY_OFF_OPACITY,
  displayBacking,
  displayLayout,
  litSegments,
  SEGMENT_NAMES,
  twoDigits,
} from "./seven-segment";

describe("litSegments", () => {
  it("lights the right segments for every digit", () => {
    const shown = Array.from({ length: 10 }, (_, digit) => litSegments(digit).join(""));
    expect(shown).toEqual([
      "abcdef",
      "bc",
      "abdeg",
      "abcdg",
      "bcfg",
      "acdfg",
      "acdefg",
      "abc",
      "abcdefg",
      "abcdfg",
    ]);
  });

  it("lights nothing for a value that is not a digit", () => {
    expect(litSegments(12)).toEqual([]);
    expect(litSegments(-1)).toEqual([]);
  });
});

describe("unlit segments", () => {
  it("stay barely visible, like the segments of a display that is switched off", () => {
    expect(DISPLAY_OFF_OPACITY).toBe(0.08);
  });
});

describe("displayBacking", () => {
  it("covers the inside of the display and leaves its frame in sight", () => {
    const box = { left: 920, top: 795, right: 969, bottom: 829 };
    expect(displayBacking(box)).toEqual({ left: 921.5, top: 796.5, right: 967.5, bottom: 827.5 });
  });

  it("holds every segment of both digits", () => {
    const box = { left: 920, top: 795, right: 969, bottom: 829 };
    const backing = displayBacking(box);
    for (const digit of displayLayout(box)) {
      for (const segment of Object.values(digit)) {
        expect(segment.left).toBeGreaterThanOrEqual(backing.left);
        expect(segment.right).toBeLessThanOrEqual(backing.right);
        expect(segment.top).toBeGreaterThanOrEqual(backing.top);
        expect(segment.bottom).toBeLessThanOrEqual(backing.bottom);
      }
    }
  });
});

describe("twoDigits", () => {
  it("pads with a leading zero and clamps to what the display can show", () => {
    expect(twoDigits(0)).toEqual([0, 0]);
    expect(twoDigits(6)).toEqual([0, 6]);
    expect(twoDigits(42)).toEqual([4, 2]);
    expect(twoDigits(150)).toEqual([9, 9]);
    expect(twoDigits(-3)).toEqual([0, 0]);
    expect(twoDigits(2.9)).toEqual([0, 2]);
  });
});

describe("displayLayout", () => {
  const box = { left: 920, top: 795, right: 970, bottom: 829 };
  const [tens, units] = displayLayout(box);

  it("draws seven segments per digit, inside the box and its 12 % margin", () => {
    for (const digit of [tens, units]) {
      expect(Object.keys(digit)).toEqual([...SEGMENT_NAMES]);
      for (const segment of Object.values(digit)) {
        expect(segment.left).toBeGreaterThanOrEqual(926);
        expect(segment.right).toBeLessThanOrEqual(964);
        expect(segment.top).toBeGreaterThanOrEqual(795 + 34 * 0.12 - 1e-9);
        expect(segment.bottom).toBeLessThanOrEqual(829 - 34 * 0.12 + 1e-9);
        expect(segment.right).toBeGreaterThan(segment.left);
        expect(segment.bottom).toBeGreaterThan(segment.top);
      }
    }
  });

  it("places the tens to the left of the units, without touching", () => {
    expect(tens.b.right).toBeLessThan(units.f.left);
    expect(tens.a.top).toBe(units.a.top);
  });

  it("stacks the segments of a digit: top, middle and bottom", () => {
    expect(tens.a.bottom).toBeLessThanOrEqual(tens.g.top);
    expect(tens.g.bottom).toBeLessThanOrEqual(tens.d.top);
    expect(tens.f.left).toBeLessThan(tens.b.left);
    expect(tens.f.bottom).toBeLessThanOrEqual(tens.e.top);
  });
});
