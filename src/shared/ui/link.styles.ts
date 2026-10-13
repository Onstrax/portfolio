export const LINK_BASE = "underline decoration-1 underline-offset-[3px] break-words";

export const LINK_SURFACES = {
  light: "text-ink hover:text-accent",
  dark: "text-on-dark hover:text-aura focus-visible:outline-aura",
} as const;

export type Surface = keyof typeof LINK_SURFACES;

/** Typography and size shared by every button-like control (VIS §4.2, VIS-R30). */
export const BUTTON_BASE =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-control px-4 font-mono text-sm leading-5 font-semibold tracking-[0.06em] uppercase no-underline transition-transform duration-(--duration-instant) ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 print:hidden";

export const BUTTON_VARIANTS = {
  primary: "bg-ink text-screen hover:bg-accent",
  secondary: "border border-ink bg-control text-ink hover:bg-ink hover:text-screen",
  onDark:
    "border border-on-dark-muted/40 bg-transparent text-on-dark hover:border-aura hover:text-aura focus-visible:outline-aura",
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;
