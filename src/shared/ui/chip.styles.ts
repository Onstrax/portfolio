export const CHIP_BASE =
  "inline-flex max-w-full items-center gap-1 rounded-control border bg-control px-2 py-0.5 font-mono text-xs leading-4 font-medium break-words";

export const CHIP_VARIANTS = {
  neutral: "border-ink-muted text-ink",
  recognition: "border-accent text-accent",
} as const;

export type ChipVariant = keyof typeof CHIP_VARIANTS;
