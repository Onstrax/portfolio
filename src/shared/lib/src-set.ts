import type { ImageSource } from "@/shared/contracts/assets";

/**
 * `sizes` of the scene image: the width of the stage, the largest 16:9 rectangle that fits in the
 * viewport (AST-R03, AST-R37).
 */
export const SCENE_IMAGE_SIZES = "min(100vw, 177.78vh)";

/** `srcset` value with a width descriptor for every derivative of an image. */
export function toSrcSet(sources: readonly ImageSource[]): string {
  return sources.map((source) => `${source.src} ${String(source.width)}w`).join(", ");
}
