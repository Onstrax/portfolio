import { isPrimaryComponentId, type SceneObjectId } from "@/shared/contracts/ids";

/** The six primary pieces glow more than the CMOS battery and the front panel (VIS-R15). */
export type AuraTier = "primary" | "secondary";

/** `hover` also covers keyboard focus: both look the same (SCN-R19). */
export type AuraState = "rest" | "hover" | "active";

export interface AuraOpacity {
  readonly glow: number;
  readonly fill: number;
}

// The values below mirror the aura tokens of src/styles/tokens.css, because the SVG needs them as
// numbers. A test fails if the two drift apart.

/** Standard deviation of the tight and of the wide blur of the halo, in units (VIS-R13). */
export const AURA_BLUR_NEAR = 6;
export const AURA_BLUR_FAR = 18;
/** Softening of the inner border of the halo, where it meets the piece, in units. */
export const AURA_EDGE_FEATHER = 1.5;
/** Factor that brightens the halo, whose blur leaves half of its light at the border. */
export const AURA_GAIN = 1.5;
/** Opacity of the fill that makes the piece itself glow: at rest and while the zone is lit. */
export const AURA_FILL = { rest: 0.08, active: 0.14 } as const;

/** Lowest opacity of the glow while it breathes; the highest is its opacity at rest (VIS-R16). */
export const AURA_GLOW_REST_MIN: Readonly<Record<AuraTier, number>> = {
  primary: 0.32,
  secondary: 0.28,
};

/** Duration of one cycle of the breath and number of cycles (VIS-R16). */
export const AURA_BREATH_CYCLE_MS = 2400;
export const AURA_BREATH_CYCLES = 2;
export const AURA_BREATH_MS = AURA_BREATH_CYCLE_MS * AURA_BREATH_CYCLES;

const LIT = {
  primary: { glow: 1, fill: AURA_FILL.active },
  secondary: { glow: 0.9, fill: AURA_FILL.active },
} as const;

/** Opacity of each part of the aura, by tier and state (table of VIS §4.4). */
export const AURA_OPACITY: Readonly<Record<AuraTier, Readonly<Record<AuraState, AuraOpacity>>>> = {
  primary: {
    rest: { glow: 0.5, fill: AURA_FILL.rest },
    hover: LIT.primary,
    active: LIT.primary,
  },
  secondary: {
    rest: { glow: 0.42, fill: AURA_FILL.rest },
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
