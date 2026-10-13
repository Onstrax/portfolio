import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export type IconSize = 16 | 20 | 24;

export interface IconProps {
  readonly size?: IconSize;
  readonly className?: string;
}

interface SvgIconProps extends IconProps {
  readonly children: ReactNode;
}

/**
 * Frame shared by every interface icon: 24-unit grid, no fill, 2-unit stroke in the current color
 * (VIS-R37). Icons are decorative: the text or the accessible name next to them carries the
 * meaning (VIS-R40).
 */
export function SvgIcon({ size = 16, className, children }: SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn("inline-block shrink-0", className)}
    >
      {children}
    </svg>
  );
}
