/** Covers the viewport and centers the stage in it (AST-R03). */
export const VIEWPORT = "fixed inset-0 grid place-items-center overflow-hidden";

/** The stage: the largest 16:9 rectangle that fits in the viewport (AST-R03). */
export const STAGE = "relative aspect-video w-[min(100vw,calc(100dvh*16/9))]";

/** Layer that fills the stage and lets the pointer through. */
export const STAGE_LAYER = "pointer-events-none absolute inset-0 size-full";

const IMAGE_BASE = "absolute inset-0 size-full select-none";

/** States of the image of a variant while the visitor switches between variants (SCN-R43). */
export const IMAGE_STATES = {
  /** Active and not decoded yet: on top, invisible. */
  pending: `${IMAGE_BASE} z-1 opacity-0`,
  /** Active and decoded: fades in over whatever was shown (M-11). */
  shown: `${IMAGE_BASE} z-1 opacity-100 transition-opacity duration-(--duration-base) ease-out`,
  /** Replaced, but the active one is not decoded yet: stays visible. */
  kept: `${IMAGE_BASE} opacity-100`,
  /** Replaced: disappears once the active one has faded in over it. */
  replaced: `${IMAGE_BASE} opacity-0 transition-opacity delay-(--duration-base) duration-0`,
} as const;

export type ImageState = keyof typeof IMAGE_STATES;

/** Transition between the states of an aura (M-04). */
export const AURA_PART = "transition-opacity duration-(--duration-fast) ease-out";

/** Opacity range of the breath of each tier, read by the `aura-breath` animation (VIS-R16). */
export const AURA_GLOW_RANGE = {
  primary:
    "[--aura-glow-min:var(--aura-primary-glow-rest-min)] [--aura-glow-max:var(--aura-primary-glow-rest-max)]",
  secondary:
    "[--aura-glow-min:var(--aura-secondary-glow-rest-min)] [--aura-glow-max:var(--aura-secondary-glow-rest-max)]",
} as const;

/** A zone is cut to its hit area, so it cannot draw an outline of its own (SCN-R21). */
export const ZONE =
  "absolute z-(--z-hotspots) block cursor-pointer outline-none focus-visible:outline-none";

const LABEL_BASE =
  "absolute top-0 left-0 z-(--z-labels) flex w-max flex-col rounded-plate border border-(--scene-aura)/60 bg-plate/[calc(var(--opacity-plate)*100%)] px-3 py-2 whitespace-nowrap shadow-plate";

/** Without hover the label is always shown, and narrow enough for the eight to fit (SCN-R25). */
const LABEL_PINNED =
  "no-hover:visible no-hover:max-w-32 no-hover:translate-none no-hover:whitespace-normal no-hover:opacity-100";

/** Entry and exit of a label (M-05). The exit only fades: its position resets afterwards. */
export const LABEL_STATES = {
  visible: `${LABEL_BASE} visible translate-y-0 opacity-100 transition-[opacity,translate] duration-(--duration-fast) ease-out motion-reduce:transition-opacity`,
  hidden: `${LABEL_BASE} invisible translate-y-1 opacity-0 [transition:opacity_var(--duration-instant)_var(--ease-in),visibility_var(--duration-instant),translate_0s_var(--duration-instant)] motion-reduce:translate-none`,
} as const;

export const LABEL_PINNED_STATES = {
  visible: `${LABEL_STATES.visible} ${LABEL_PINNED}`,
  hidden: `${LABEL_STATES.hidden} ${LABEL_PINNED}`,
} as const;

export const LABEL_NAME =
  "font-mono text-sm leading-5 font-semibold tracking-[0.06em] text-on-dark uppercase";
export const LABEL_CONTENT = "font-mono text-xs leading-4 text-on-dark-muted";

const HINT_BASE =
  "pointer-events-none absolute bottom-2 left-1/2 z-(--z-labels) w-max max-w-[calc(100%-1rem)] -translate-x-1/2 rounded-plate border border-on-dark-muted/25 bg-plate/[calc(var(--opacity-plate)*100%)] px-3 py-2 text-sm leading-5 text-on-dark shadow-plate transition-[opacity,visibility] duration-(--duration-base) ease-out";

/** Appearance and removal of the hint (M-12). */
export const HINT_STATES = {
  visible: `${HINT_BASE} visible opacity-100`,
  hidden: `${HINT_BASE} invisible opacity-0`,
} as const;
