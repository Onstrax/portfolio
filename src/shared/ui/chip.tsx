import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

import { CHIP_BASE, CHIP_VARIANTS, type ChipVariant } from "./chip.styles";

interface ChipProps {
  readonly children: ReactNode;
  readonly variant?: ChipVariant;
  /** Decorative icon shown before the text. */
  readonly icon?: ReactNode;
}

/** Non-interactive tag for a technology, a team size or a recognition (VIS §4.6). */
export function Chip({ children, variant = "neutral", icon }: ChipProps) {
  return (
    <span className={cn(CHIP_BASE, CHIP_VARIANTS[variant])}>
      {icon}
      {children}
    </span>
  );
}
