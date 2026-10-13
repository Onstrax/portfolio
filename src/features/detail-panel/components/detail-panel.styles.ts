/**
 * The dialog covers the viewport and is transparent: the veil and the frame are its children, so
 * that both can be animated and a click on the veil can be told from a click on the frame.
 */
export const DIALOG =
  "group fixed inset-0 z-(--z-panel) m-0 size-full max-h-none max-w-none overflow-clip border-0 bg-transparent p-0 text-ink backdrop:bg-transparent open:grid open:place-items-center";

/** Veil behind the frame (M-06). */
export const VEIL =
  "absolute inset-0 bg-backdrop opacity-(--opacity-backdrop) group-data-[phase=closing]:veil-out group-data-[phase=opening]:veil-in";

/** Metal frame (VIS-R22) with the size of VIS-R24. */
export const FRAME =
  "relative flex max-h-[min(86vh,900px)] w-[min(760px,calc(100vw-96px))] flex-col rounded-frame border border-frame-edge bg-linear-to-b from-frame-light to-frame-dark p-3.5 shadow-panel group-data-[phase=closing]:panel-out group-data-[phase=opening]:panel-in";

/** Reading screen (VIS-R23). Header and footer stay; only the content scrolls. */
export const SCREEN =
  "flex min-h-0 flex-col rounded-plate border border-ink/20 bg-screen p-7 xl:p-8";

/** Header (VIS-R25): title, chip and close button over a line of 2 px. */
export const HEADER = "flex shrink-0 items-center gap-3 border-b-2 border-ink pb-3";

export const TITLE =
  "min-w-0 flex-1 font-mono text-xl leading-7 font-semibold tracking-[0.06em] break-words uppercase focus:outline-none";

export const ICON_BUTTON =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-control text-ink transition-transform duration-(--duration-instant) ease-out hover:bg-control active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100";

/** Scrolling zone of the content (PNL-R06). */
export const CONTENT = "min-h-0 flex-1 overflow-y-auto pt-6";

/** The content of a section, which slides out and in when the section changes (M-07). */
export const CONTENT_BODY =
  "group-data-[phase=entering]:content-in group-data-[phase=leaving]:content-out";

/** Footer (VIS-R26): on the frame, under the screen. */
export const FOOTER = "mt-3 flex shrink-0 items-center justify-between gap-3 px-1";

export const FOOTER_LINK =
  "inline-flex min-h-11 min-w-11 items-center gap-1 rounded-control px-2 font-mono text-sm leading-5 font-semibold tracking-[0.06em] text-ink uppercase no-underline hover:text-accent";

export const POSITION = "shrink-0 font-mono text-sm leading-5 text-ink";
