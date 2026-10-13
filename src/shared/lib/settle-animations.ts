/** The part of an element that this module needs; jsdom elements lack `getAnimations`. */
interface Animated {
  readonly getAnimations?: (options?: { subtree?: boolean }) => readonly {
    readonly finished: Promise<unknown>;
  }[];
}

/**
 * Resolves when every animation running in the element, and in its descendants unless `scope` is
 * `self`, has finished or was cancelled. Where nothing is animated (reduced motion, an environment without animations) it
 * resolves at once, so a phase that only waits for its animation never gets stuck.
 */
export async function settleAnimations(
  element: Animated | null,
  scope: "subtree" | "self" = "subtree",
): Promise<void> {
  if (element === null || typeof element.getAnimations !== "function") return;
  await Promise.allSettled(
    element.getAnimations({ subtree: scope === "subtree" }).map((animation) => animation.finished),
  );
}
