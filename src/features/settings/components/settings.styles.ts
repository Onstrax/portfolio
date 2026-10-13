import { DARK_PLATE } from "@/shared/ui/stage.styles";

/** Fills the viewport without taking the pointer, to place the bar on the corner of the stage. */
export const BAR_VIEWPORT =
  "pointer-events-none fixed inset-0 z-(--z-bar) hidden place-items-center overflow-hidden boot-done:grid";

/** The fixed bar: a dark plate of 44 px, 16 px from the top and right borders of the stage. */
export const BAR = `${DARK_PLATE} pointer-events-auto absolute top-4 right-4 flex h-11 items-center gap-2 pr-3 pl-1 font-mono text-sm leading-5`;

export const BAR_LINK =
  "inline-flex min-h-11 items-center px-2 font-semibold text-on-dark underline decoration-1 underline-offset-[3px] hover:text-aura focus-visible:outline-aura";

/** The dialog covers the viewport and is transparent: a click outside the plate reaches it. */
export const MENU_DIALOG =
  "fixed inset-0 z-(--z-settings) m-0 size-full max-h-none max-w-none overflow-clip border-0 bg-transparent p-0 backdrop:bg-transparent";

/** Plate of the menu (SET-R09), with its opening and closing animation (M-08). */
export const MENU_PLATE = `${DARK_PLATE} absolute top-0 left-0 w-80 space-y-4 p-4`;
export const MENU_PLATE_STATES = { open: "menu-in", closing: "menu-out" } as const;

export const MENU_TITLE = "font-mono text-sm leading-5 font-semibold tracking-[0.06em] uppercase";

export const MENU_ICON_BUTTON =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-control text-on-dark hover:text-aura focus-visible:outline-aura";

export const MENU_LABEL = "font-mono text-sm leading-5 font-semibold";
export const MENU_DESCRIPTION = "text-sm leading-5 text-on-dark-muted";

/** Control that fills a row of the menu: the sound switch and the reset button. */
export const MENU_ROW_BUTTON =
  "flex min-h-11 w-full items-center justify-between gap-3 rounded-control border border-on-dark-muted/40 px-3 text-left hover:border-aura focus-visible:outline-aura";

/** Track and thumb of the sound switch. */
export const SWITCH_TRACK = {
  on: "relative inline-block h-5 w-9 shrink-0 rounded-full bg-aura",
  off: "relative inline-block h-5 w-9 shrink-0 rounded-full bg-on-dark-muted/40",
} as const;
export const SWITCH_THUMB = {
  on: "absolute top-0.5 left-0.5 size-4 translate-x-4 rounded-full bg-plate transition-transform duration-(--duration-instant) ease-out motion-reduce:transition-none",
  off: "absolute top-0.5 left-0.5 size-4 rounded-full bg-on-dark transition-transform duration-(--duration-instant) ease-out motion-reduce:transition-none",
} as const;

export const RADIO_LABEL =
  "inline-flex min-h-11 cursor-pointer items-center gap-2 pr-4 font-mono text-sm leading-5";
export const RADIO_INPUT = "size-4 accent-aura focus-visible:outline-aura";
