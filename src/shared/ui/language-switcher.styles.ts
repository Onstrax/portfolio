import type { Surface } from "./link.styles";

export const SWITCHER_BASE = "inline-flex items-center font-mono text-sm leading-5 font-semibold";

export const SWITCHER_OPTION = "inline-flex min-h-11 min-w-11 items-center justify-center";

export const SWITCHER_SEPARATOR: Readonly<Record<Surface, string>> = {
  light: "text-ink-muted",
  dark: "text-on-dark-muted",
};

export const SWITCHER_CURRENT: Readonly<Record<Surface, string>> = {
  light: "font-bold text-ink",
  dark: "text-aura focus-visible:outline-aura",
};

export const SWITCHER_LINK: Readonly<Record<Surface, string>> = {
  light: "font-normal text-ink underline decoration-1 underline-offset-[3px] hover:text-accent",
  dark: "text-on-dark hover:text-aura focus-visible:outline-aura",
};
