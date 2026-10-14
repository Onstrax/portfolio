import type { SceneBox, ScenePoint } from "../types";
import { boxHeight, boxWidth } from "./geometry";

/** Size of the scene space, in units (AST-R02). */
export const SCENE_WIDTH = 1600;
export const SCENE_HEIGHT = 900;

/** Rectangle that contains every interactive object (AST-R05). */
export const SAFE_AREA: SceneBox = { left: 16, top: 16, right: 1584, bottom: 884 };

/** Regions that no interactive object may occupy, by the requirement that reserves them. */
export const RESERVED_AREAS = {
  /** The top band, under the fixed bar and the top of the identity plate (AST-R47). */
  "AST-R47": { left: 0, top: 0, right: SCENE_WIDTH, bottom: 100 },
  /** The top left corner, under the identity plate (AST-R55). */
  "AST-R55": { left: 0, top: 0, right: 500, bottom: 200 },
} as const satisfies Readonly<Record<string, SceneBox>>;

export type ReservedAreaRule = keyof typeof RESERVED_AREAS;
export const RESERVED_AREA_RULES: readonly ReservedAreaRule[] = ["AST-R47", "AST-R55"];

/** Width of the vignette on each edge of the stage, in units (AST-R48). */
export const VIGNETTE_SIZE = 64;

function percent(value: number, total: number): string {
  return `${String(Math.round((value / total) * 100_000) / 1000)}%`;
}

/** Value of the `points` attribute of an SVG polygon. */
export function toSvgPoints(polygon: readonly ScenePoint[]): string {
  return polygon.map((point) => `${String(point.x)},${String(point.y)}`).join(" ");
}

/** Position and size of a box as percentages of the stage, for an absolutely positioned element. */
export function toStageRect(box: SceneBox): {
  readonly left: string;
  readonly top: string;
  readonly width: string;
  readonly height: string;
} {
  return {
    left: percent(box.left, SCENE_WIDTH),
    top: percent(box.top, SCENE_HEIGHT),
    width: percent(boxWidth(box), SCENE_WIDTH),
    height: percent(boxHeight(box), SCENE_HEIGHT),
  };
}

/** CSS `clip-path` that cuts an element placed on `box` to the shape of `polygon` (SCN-R14). */
export function toClipPath(polygon: readonly ScenePoint[], box: SceneBox): string {
  const points = polygon.map(
    (point) =>
      `${percent(point.x - box.left, boxWidth(box))} ${percent(point.y - box.top, boxHeight(box))}`,
  );
  return `polygon(${points.join(", ")})`;
}
