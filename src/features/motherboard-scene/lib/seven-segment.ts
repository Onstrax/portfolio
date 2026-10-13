import type { SceneBox } from "../types";

/**
 * Segments of a seven-segment digit, in the usual order: a (top), b (upper right), c (lower
 * right), d (bottom), e (lower left), f (upper left) and g (middle).
 */
export const SEGMENT_NAMES = ["a", "b", "c", "d", "e", "f", "g"] as const;
export type SegmentName = (typeof SEGMENT_NAMES)[number];

const LIT: Readonly<Record<number, string>> = {
  0: "abcdef",
  1: "bc",
  2: "abdeg",
  3: "abcdg",
  4: "bcfg",
  5: "acdfg",
  6: "acdefg",
  7: "abc",
  8: "abcdefg",
  9: "abcdfg",
};

/** Names of the segments that are lit to show a digit from 0 to 9. */
export function litSegments(digit: number): readonly SegmentName[] {
  const lit = LIT[digit] ?? "";
  return SEGMENT_NAMES.filter((name) => lit.includes(name));
}

/** The two digits of a count, with a leading zero. The display cannot show more than 99. */
export function twoDigits(value: number): readonly [number, number] {
  const count = Math.max(0, Math.min(99, Math.trunc(value)));
  return [Math.floor(count / 10), count % 10];
}

/** Opacity of a segment that is not lit (SCN-R29). */
export const DISPLAY_OFF_OPACITY = 0.08;

/** Inner margin of the display, as a fraction of each side of its box (SCN-R29). */
const MARGIN = 0.12;
/** Gap between the two digits, as a fraction of the usable width. */
const DIGIT_GAP = 0.12;
/** Thickness of a segment, as a fraction of the width of a digit. */
const THICKNESS = 0.18;

/** Rectangle of every segment of the digit that occupies `cell`. */
function segmentBoxes(cell: SceneBox): Readonly<Record<SegmentName, SceneBox>> {
  const thickness = (cell.right - cell.left) * THICKNESS;
  const middle = (cell.top + cell.bottom) / 2;
  const horizontal = (top: number): SceneBox => ({
    left: cell.left + thickness,
    right: cell.right - thickness,
    top,
    bottom: top + thickness,
  });
  const vertical = (left: number, top: number, bottom: number): SceneBox => ({
    left,
    right: left + thickness,
    top,
    bottom,
  });
  return {
    a: horizontal(cell.top),
    b: vertical(cell.right - thickness, cell.top + thickness, middle - thickness / 2),
    c: vertical(cell.right - thickness, middle + thickness / 2, cell.bottom - thickness),
    d: horizontal(cell.bottom - thickness),
    e: vertical(cell.left, middle + thickness / 2, cell.bottom - thickness),
    f: vertical(cell.left, cell.top + thickness, middle - thickness / 2),
    g: horizontal(middle - thickness / 2),
  };
}

/**
 * Geometry of the two digits drawn inside the box of the diagnostic display, leaving its inner
 * margin: for each digit, the rectangle of each of its seven segments.
 */
export function displayLayout(
  box: SceneBox,
): readonly [Readonly<Record<SegmentName, SceneBox>>, Readonly<Record<SegmentName, SceneBox>>] {
  const marginX = (box.right - box.left) * MARGIN;
  const marginY = (box.bottom - box.top) * MARGIN;
  const left = box.left + marginX;
  const right = box.right - marginX;
  const top = box.top + marginY;
  const bottom = box.bottom - marginY;
  const gap = (right - left) * DIGIT_GAP;
  const digitWidth = (right - left - gap) / 2;
  return [
    segmentBoxes({ left, right: left + digitWidth, top, bottom }),
    segmentBoxes({ left: right - digitWidth, right, top, bottom }),
  ];
}
