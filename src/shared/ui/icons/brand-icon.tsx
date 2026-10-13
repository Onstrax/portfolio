import { cn } from "@/shared/lib/cn";

import type { IconProps } from "./svg-icon";

interface BrandIconProps extends IconProps {
  /** Path of the official symbol, on a 24-unit grid. */
  readonly path: string;
}

/**
 * Frame shared by the brand marks: the official symbol in a single ink, filled instead of stroked.
 * A brand mark always goes next to the name of the brand in text (VIS-R39).
 */
export function BrandIcon({ path, size = 16, className }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={cn("inline-block shrink-0", className)}
    >
      <path d={path} />
    </svg>
  );
}
