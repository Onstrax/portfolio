import { isPrimaryComponentId, type SceneObjectId } from "@/shared/contracts/ids";

/** The six primary pieces glow more than the CMOS battery and the front panel (VIS-R15). */
export type AuraTier = "primary" | "secondary";

/** `hover` also covers keyboard focus: both look the same (SCN-R19). */
export type AuraState = "rest" | "hover" | "active";

export interface AuraOpacity {
  readonly stroke: number;
  readonly glow: number;
  readonly fill: number;
}

// The values below mirror the aura tokens of src/styles/tokens.css, because the SVG needs them as
// numbers. A test fails if the two drift apart.

/** Width of the stroke and standard deviation of the two blurred copies, in units (VIS-R13). */
export const AURA_STROKE_WIDTH = 2;
export const AURA_BLUR_NEAR = 3;
export const AURA_BLUR_FAR = 10;
export const AURA_FILL_OPACITY = 0.08;

/** Lowest opacity of the glow while it breathes; the highest is its opacity at rest (VIS-R16). */
export const AURA_GLOW_REST_MIN: Readonly<Record<AuraTier, number>> = {
  primary: 0.3,
  secondary: 0.18,
};

/** Duration of one cycle of the breath and number of cycles (VIS-R16). */
export const AURA_BREATH_CYCLE_MS = 2400;
export const AURA_BREATH_CYCLES = 2;
export const AURA_BREATH_MS = AURA_BREATH_CYCLE_MS * AURA_BREATH_CYCLES;

const LIT = {
  primary: { stroke: 1, glow: 0.85, fill: AURA_FILL_OPACITY },
  secondary: { stroke: 0.8, glow: 0.6, fill: AURA_FILL_OPACITY },
} as const;

/** Opacity of each part of the aura, by tier and state (table of VIS §4.4). */
export const AURA_OPACITY: Readonly<Record<AuraTier, Readonly<Record<AuraState, AuraOpacity>>>> = {
  primary: { rest: { stroke: 0.55, glow: 0.45, fill: 0 }, hover: LIT.primary, active: LIT.primary },
  secondary: {
    rest: { stroke: 0.35, glow: 0.27, fill: 0 },
    hover: LIT.secondary,
    active: LIT.secondary,
  },
};

export function auraTier(id: SceneObjectId): AuraTier {
  return isPrimaryComponentId(id) ? "primary" : "secondary";
}

/** State of an aura: active wins over hover and focus, and these over rest (SCN-R19). */
export function auraState(zone: {
  readonly isActive: boolean;
  readonly isHovered: boolean;
  readonly isFocused: boolean;
}): AuraState {
  if (zone.isActive) return "active";
  return zone.isHovered || zone.isFocused ? "hover" : "rest";
}
