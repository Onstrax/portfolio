import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  AURA_BLUR_FAR,
  AURA_BLUR_NEAR,
  AURA_BREATH_CYCLE_MS,
  AURA_BREATH_MS,
  AURA_FILL_OPACITY,
  AURA_GLOW_REST_MIN,
  AURA_OPACITY,
  AURA_STROKE_WIDTH,
  auraState,
  auraTier,
} from "./aura";

const TOKENS = readFileSync(new URL("../../../styles/tokens.css", import.meta.url), "utf8");

/** Numeric value of an aura token of tokens.css. */
function token(name: string): number {
  const match = new RegExp(`--aura-${name}:\\s*([\\d.]+)(?:ms)?;`).exec(TOKENS);
  if (match?.[1] === undefined) throw new Error(`Token --aura-${name} not found`);
  return Number(match[1]);
}

describe("aura values", () => {
  it("VIS-AC11: has the opacities of the table of the visual system", () => {
    expect(AURA_OPACITY).toEqual({
      primary: {
        rest: { stroke: 0.55, glow: 0.45, fill: 0 },
        hover: { stroke: 1, glow: 0.85, fill: 0.08 },
        active: { stroke: 1, glow: 0.85, fill: 0.08 },
      },
      secondary: {
        rest: { stroke: 0.35, glow: 0.27, fill: 0 },
        hover: { stroke: 0.8, glow: 0.6, fill: 0.08 },
        active: { stroke: 0.8, glow: 0.6, fill: 0.08 },
      },
    });
    expect(AURA_GLOW_REST_MIN).toEqual({ primary: 0.3, secondary: 0.18 });
  });

  it("mirrors the aura tokens of tokens.css", () => {
    expect(AURA_STROKE_WIDTH).toBe(token("stroke-width"));
    expect(AURA_BLUR_NEAR).toBe(token("glow-blur-near"));
    expect(AURA_BLUR_FAR).toBe(token("glow-blur-far"));
    expect(AURA_FILL_OPACITY).toBe(token("fill-opacity"));
    expect(AURA_BREATH_CYCLE_MS).toBe(token("breath-cycle"));
    for (const tier of ["primary", "secondary"] as const) {
      expect(AURA_OPACITY[tier].rest.stroke).toBe(token(`${tier}-stroke-rest`));
      expect(AURA_OPACITY[tier].rest.glow).toBe(token(`${tier}-glow-rest-max`));
      expect(AURA_GLOW_REST_MIN[tier]).toBe(token(`${tier}-glow-rest-min`));
      expect(AURA_OPACITY[tier].active.stroke).toBe(token(`${tier}-stroke-active`));
      expect(AURA_OPACITY[tier].active.glow).toBe(token(`${tier}-glow-active`));
    }
  });

  it("breathes for two cycles, less than the 5 seconds that an automatic animation may last", () => {
    expect(AURA_BREATH_MS).toBe(4800);
  });
});

describe("auraTier", () => {
  it("is primary for the six primary pieces and secondary for the other two", () => {
    expect(["cpu", "psu", "ssd", "ram", "io", "fan"].map((id) => auraTier(id as "cpu"))).toEqual(
      Array.from({ length: 6 }, () => "primary"),
    );
    expect(auraTier("cmos")).toBe("secondary");
    expect(auraTier("settings")).toBe("secondary");
  });
});

describe("auraState", () => {
  const idle = { isActive: false, isHovered: false, isFocused: false };

  it("is rest when nothing happens to the zone", () => {
    expect(auraState(idle)).toBe("rest");
  });

  it("is hover under the pointer or with keyboard focus", () => {
    expect(auraState({ ...idle, isHovered: true })).toBe("hover");
    expect(auraState({ ...idle, isFocused: true })).toBe("hover");
  });

  it("is active when its section or menu is open, whatever the pointer does", () => {
    expect(auraState({ ...idle, isActive: true })).toBe("active");
    expect(auraState({ isActive: true, isHovered: true, isFocused: true })).toBe("active");
  });
});
