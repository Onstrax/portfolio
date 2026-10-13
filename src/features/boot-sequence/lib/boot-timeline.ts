import { NON_SKIP_KEYS } from "@/shared/lib/pre-paint-script";

/** Time in which all the lines appear, counted from the first paint (BOOT-R14). */
export const LINES_WINDOW_MS = 1400;
/** Time that the full log stays before the boot sequence ends (BOOT-R17). */
export const HOLD_AFTER_LAST_LINE_MS = 400;

/** Time between the appearance of one line and the next (BOOT-R14). */
export function lineInterval(lineCount: number): number {
  return lineCount > 1 ? Math.floor(LINES_WINDOW_MS / (lineCount - 1)) : 0;
}

/** Moment in which the line at `index`, counting from zero, appears. */
export function lineDelay(index: number, lineCount: number): number {
  return index * lineInterval(lineCount);
}

/**
 * Moment in which the boot sequence ends by itself: 400 ms after its last line appears, which is
 * 1800 ms at most (BOOT-R17). With reduced motion every line is there from the start, so only
 * the hold remains (BOOT-R04).
 */
export function bootDuration(lineCount: number, isMotionReduced: boolean): number {
  if (isMotionReduced) return HOLD_AFTER_LAST_LINE_MS;
  return lineDelay(Math.max(0, lineCount - 1), lineCount) + HOLD_AFTER_LAST_LINE_MS;
}

/**
 * `true` for a key that skips the boot sequence: any key except a modifier alone (BOOT-R18) and
 * Tab, which must keep moving the focus to the skip button.
 */
export function isSkipKey(key: string): boolean {
  return !NON_SKIP_KEYS.includes(key);
}
