import type { SectionSlug } from "@/shared/contracts/ids";

/**
 * Moment in the life of the panel:
 *
 * - `closed`: nothing is shown.
 * - `opening`, `open`: a section is shown, with or without its entry animation running.
 * - `leaving`, `entering`: the two halves of the change from one section to another (M-07).
 * - `closing`: the exit animation is running (M-06).
 * - `navigating`: the visitor closed the panel and the route is about to change (PNL-R09).
 */
export type PanelPhase =
  "closed" | "opening" | "open" | "leaving" | "entering" | "closing" | "navigating";

/** A section and what the panel draws for it. */
export interface PanelView<Content> {
  readonly slug: SectionSlug;
  readonly content: Content;
}

export interface PanelState<Content> {
  readonly phase: PanelPhase;
  /** Section drawn in the panel. While `leaving`, it is still the previous one. */
  readonly shown: PanelView<Content> | null;
  /** Section that the route names, while it waits for the previous one to leave. */
  readonly pending: PanelView<Content> | null;
  /** `true` when it was the visitor, and not the route, who started the closing. */
  readonly isCloseRequested: boolean;
  /** `true` when the panel was opened by a navigation inside the site (PNL-R10). */
  readonly wasOpenedInSite: boolean;
}

export type PanelEvent<Content> =
  /** The route changed: it names a section, or none. */
  | { readonly type: "route"; readonly view: PanelView<Content> | null }
  /** The visitor asked to close: close button, Esc or a click on the veil. */
  | { readonly type: "close-requested" }
  /** The browser closed the dialog by itself, without waiting for the panel. */
  | { readonly type: "dismissed" }
  /** The animation of the current phase finished. */
  | { readonly type: "animation-ended" };

const CLOSED = {
  phase: "closed",
  shown: null,
  pending: null,
  isCloseRequested: false,
  wasOpenedInSite: false,
} as const;

/**
 * State of a panel that has just been mounted. With a section in the route it is a direct entry:
 * the panel is open from the first moment, without animation (PNL-R08).
 */
export function initialPanelState<Content>(view: PanelView<Content> | null): PanelState<Content> {
  return view === null ? CLOSED : { ...CLOSED, phase: "open", shown: view };
}

function onRoute<Content>(
  state: PanelState<Content>,
  view: PanelView<Content> | null,
): PanelState<Content> {
  if (view === null) {
    if (state.phase === "closed") return state;
    if (state.phase === "navigating") return CLOSED;
    // The route left the section by itself (the Back button): the panel plays its exit.
    return { ...state, phase: "closing", pending: null, isCloseRequested: false };
  }
  if (state.phase === "closed") {
    return { ...CLOSED, phase: "opening", shown: view, wasOpenedInSite: true };
  }
  if (state.phase === "closing" || state.phase === "navigating") {
    return { ...state, phase: "opening", shown: view, pending: null, isCloseRequested: false };
  }
  if (state.shown?.slug === view.slug) {
    // Same section: its content may be a newer render. A change that was leaving is called off.
    return {
      ...state,
      phase: state.phase === "leaving" ? "open" : state.phase,
      shown: view,
      pending: null,
    };
  }
  return { ...state, phase: "leaving", pending: view };
}

function onAnimationEnded<Content>(state: PanelState<Content>): PanelState<Content> {
  switch (state.phase) {
    case "opening":
    case "entering":
      return { ...state, phase: "open" };
    case "leaving":
      return { ...state, phase: "entering", shown: state.pending, pending: null };
    case "closing":
      return state.isCloseRequested ? { ...state, phase: "navigating" } : CLOSED;
    case "closed":
    case "open":
    case "navigating":
      return state;
  }
}

function isShowingSection(phase: PanelPhase): boolean {
  return phase === "opening" || phase === "open" || phase === "leaving" || phase === "entering";
}

/**
 * The panel has no "open" state of its own: it follows the route (PNL-R07). This machine only adds
 * what the route cannot tell, which is the animation in course and who started a closing.
 */
export function panelReducer<Content>(
  state: PanelState<Content>,
  event: PanelEvent<Content>,
): PanelState<Content> {
  switch (event.type) {
    case "route":
      return onRoute(state, event.view);
    case "animation-ended":
      return onAnimationEnded(state);
    case "close-requested":
      if (!isShowingSection(state.phase)) return state;
      return { ...state, phase: "closing", pending: null, isCloseRequested: true };
    case "dismissed":
      if (!isShowingSection(state.phase) && state.phase !== "closing") return state;
      return { ...state, phase: "navigating", pending: null, isCloseRequested: true };
  }
}

/**
 * How the `<dialog>` must be shown: `modal` while a section is open or the visitor is closing it;
 * `fading` while it plays its exit after the route already left, when the page must be usable
 * again; `hidden` otherwise.
 */
export function panelModality<Content>(state: PanelState<Content>): "modal" | "fading" | "hidden" {
  if (state.phase === "closed" || state.phase === "navigating") return "hidden";
  if (state.phase === "closing" && !state.isCloseRequested) return "fading";
  return "modal";
}
