/** Segmented control of the view switcher on a light surface (SET-R33). */
export const SEGMENT_GROUP = "inline-flex rounded-control border border-ink font-mono";

/** One segment: the typography and size of a button (VIS §4.2, VIS-R30). */
export const SEGMENT_OPTION =
  "inline-flex min-h-11 min-w-11 items-center justify-center px-4 text-sm leading-5 font-semibold tracking-[0.06em] uppercase";

/** The current view, with the look of the primary button. */
export const SEGMENT_CURRENT = "bg-ink text-screen";

/** The other view, with the look of the secondary button without its own border. */
export const SEGMENT_LINK = "bg-control text-ink no-underline hover:bg-ink hover:text-screen";

/** The segments round the outer corners only, inside the border of the group. */
export const SEGMENT_CORNERS = ["rounded-l-[3px]", "rounded-r-[3px]"] as const;
