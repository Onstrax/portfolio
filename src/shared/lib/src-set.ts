import type { ImageSource } from "@/shared/contracts/assets";

/** `srcset` value with a width descriptor for every derivative of an image. */
export function toSrcSet(sources: readonly ImageSource[]): string {
  return sources.map((source) => `${source.src} ${String(source.width)}w`).join(", ");
}
