import { describe, expect, it } from "vitest";

import { blend, contrastRatio, parseHexColor } from "./contrast";
import { readRepoFile } from "./files";

const TOKENS_CSS = readRepoFile("src/styles/tokens.css");

function declared(property: string): string | undefined {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^\\s*${escaped}:\\s*([^;]+);`, "m").exec(TOKENS_CSS)?.[1]?.trim();
}

const COLORS: Readonly<Record<string, string>> = {
  void: "#0A0907",
  plate: "#0F0E0C",
  "on-dark": "#F3F1E7",
  "on-dark-muted": "#B5B1A3",
  aura: "#FFC53D",
  backdrop: "#050504",
  screen: "#E8E6DD",
  control: "#DAD8CE",
  ink: "#15171A",
  "ink-muted": "#4A4E53",
  accent: "#7A4E00",
  "frame-light": "#C9CBC6",
  "frame-dark": "#9FA29C",
  "frame-edge": "#6F726D",
  "boot-bg": "#040604",
  "boot-text": "#9BEFA9",
  "boot-dim": "#5FA36C",
  "boot-ok": "#4ADE80",
  "aura-sketch": "#B3123A",
  paper: "#F2EBDF",
};

const OTHER_TOKENS: Readonly<Record<string, string>> = {
  "--radius-control": "4px",
  "--radius-plate": "6px",
  "--radius-frame": "14px",
  "--shadow-plate": "0 4px 16px rgb(0 0 0 / 0.5)",
  "--shadow-panel": "0 24px 60px rgb(0 0 0 / 0.55)",
  "--z-scene": "0",
  "--z-hotspots": "10",
  "--z-labels": "20",
  "--z-bar": "30",
  "--z-settings": "40",
  "--z-panel": "50",
  "--z-boot": "60",
  "--z-skip-link": "70",
  "--duration-instant": "100ms",
  "--duration-fast": "150ms",
  "--duration-base": "250ms",
  "--duration-slow": "400ms",
  "--duration-scene": "700ms",
  "--ease-out": "cubic-bezier(0.22, 1, 0.36, 1)",
  "--ease-in": "cubic-bezier(0.55, 0, 1, 0.45)",
  "--ease-in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
};

/** Pairs of VIS §4.1.4: foreground, background and the minimum the pair must reach. */
const CONTRAST_PAIRS: readonly (readonly [string, string, number])[] = [
  ["on-dark", "plate", 4.5],
  ["on-dark-muted", "plate", 4.5],
  ["aura", "plate", 4.5],
  ["ink", "screen", 4.5],
  ["ink-muted", "screen", 4.5],
  ["accent", "screen", 4.5],
  ["ink", "control", 4.5],
  ["ink-muted", "control", 4.5],
  ["accent", "control", 4.5],
  ["screen", "ink", 4.5],
  ["screen", "accent", 4.5],
  ["ink", "frame-dark", 4.5],
  ["frame-edge", "screen", 3],
  ["boot-text", "boot-bg", 4.5],
  ["boot-dim", "boot-bg", 4.5],
  ["boot-ok", "boot-bg", 4.5],
  ["aura-sketch", "paper", 3],
  ["ink", "paper", 3],
];

function color(name: string): readonly [number, number, number] {
  return parseHexColor(declared(`--color-${name}`) ?? "");
}

describe("tokens.css", () => {
  it("VIS-AC01: defines every color token with the exact value of the spec", () => {
    for (const [name, value] of Object.entries(COLORS)) {
      expect(declared(`--color-${name}`)?.toUpperCase(), name).toBe(value);
    }
  });

  it("VIS-AC01: defines the radius, shadow, layer and motion tokens with their exact values", () => {
    for (const [property, value] of Object.entries(OTHER_TOKENS)) {
      expect(declared(property), property).toBe(value);
    }
  });

  it("VIS-AC02: every pair of the contrast table reaches its minimum", () => {
    for (const [foreground, background, minimum] of CONTRAST_PAIRS) {
      const ratio = contrastRatio(color(foreground), color(background));
      expect(ratio, `${foreground} on ${background}`).toBeGreaterThanOrEqual(minimum);
    }
  });

  it("VIS-AC02: text on a dark plate stays readable over a white background, the worst case", () => {
    const plateOverWhite = blend(color("plate"), [255, 255, 255], 0.92);
    expect(contrastRatio(color("on-dark"), plateOverWhite)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(color("on-dark-muted"), plateOverWhite)).toBeGreaterThanOrEqual(4.5);
    expect(declared("--opacity-plate")).toBe("0.92");
  });

  it("matches the contrast figures recorded in the spec", () => {
    expect(contrastRatio(color("on-dark"), color("plate"))).toBeCloseTo(17.04, 1);
    expect(contrastRatio(color("ink"), color("screen"))).toBeCloseTo(14.36, 1);
    expect(contrastRatio(color("aura-sketch"), color("paper"))).toBeCloseTo(5.78, 1);
    expect(contrastRatio(color("aura"), color("screen"))).toBeLessThan(3);
  });

  it("switches the three scene colors with the scene variant (VIS-R44)", () => {
    const [photo = "", sketch = ""] = TOKENS_CSS.split(':root[data-scene="sketch"]');
    expect(photo).toContain("--scene-aura: var(--color-aura);");
    expect(photo).toContain("--scene-backdrop: var(--color-void);");
    expect(photo).toContain("--scene-display: var(--color-boot-ok);");
    expect(sketch).toContain("--scene-aura: var(--color-aura-sketch);");
    expect(sketch).toContain("--scene-backdrop: var(--color-paper);");
    expect(sketch).toContain("--scene-display: var(--color-ink);");
  });
});
