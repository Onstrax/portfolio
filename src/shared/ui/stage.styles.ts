/** Covers the viewport and centers the stage in it (AST-R03). */
export const STAGE_VIEWPORT = "fixed inset-0 grid place-items-center overflow-hidden";

/**
 * The stage: the largest 16:9 rectangle that fits in the viewport (AST-R03). Every shell feature
 * that draws over the scene uses this same box, so that all of them share its geometry.
 */
export const STAGE_BOX = "relative aspect-video w-[min(100vw,calc(100dvh*16/9))]";

/** Dark plate of the fixed bar, the labels of the scene and the settings menu (VIS-R20). */
export const DARK_PLATE =
  "rounded-plate border border-on-dark-muted/25 bg-plate/[calc(var(--opacity-plate)*100%)] text-on-dark shadow-plate";
