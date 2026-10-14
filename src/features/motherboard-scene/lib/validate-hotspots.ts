import { SCENE_OBJECT_IDS, type SceneObjectId } from "@/shared/contracts/ids";

import type { Hotspot, SceneBox, ScenePoint } from "../types";
import { computeHitArea } from "./compute-hit-area";
import {
  boundingBox,
  boxHeight,
  boxToPolygon,
  boxWidth,
  distanceBetweenPolygons,
  isSelfIntersecting,
  polygonsOverlap,
} from "./geometry";
import {
  RESERVED_AREA_RULES,
  RESERVED_AREAS,
  type ReservedAreaRule,
  SAFE_AREA,
} from "./scene-space";

/** Requirement that a calibration issue breaks. */
export type HotspotRule = "SCN-R08" | "AST-R20" | "AST-R11" | ReservedAreaRule | "SCN-R13";

export interface HotspotIssue {
  readonly rule: HotspotRule;
  /** The object, or the pair of objects, that breaks the rule. */
  readonly ids: readonly SceneObjectId[];
  readonly message: string;
}

export const MIN_VERTICES = 4;
export const MAX_VERTICES = 24;
/** Smallest gap allowed between two silhouettes, in units (AST-R11). */
export const MIN_SEPARATION = 12;

/** Smallest visible size of each object: longer side and shorter side, in units (AST §4.4). */
export const MIN_SIZES: Readonly<Record<SceneObjectId, readonly [number, number]>> = {
  cpu: [88, 88],
  psu: [180, 120],
  ssd: [120, 44],
  ram: [180, 44],
  io: [160, 44],
  fan: [150, 150],
  cmos: [36, 36],
  settings: [120, 60],
  "post-display": [44, 30],
};

function isInSafeArea(point: ScenePoint): boolean {
  return (
    point.x >= SAFE_AREA.left &&
    point.x <= SAFE_AREA.right &&
    point.y >= SAFE_AREA.top &&
    point.y <= SAFE_AREA.bottom
  );
}

/** What each reserved region keeps free, for the messages. */
const RESERVED_FOR: Readonly<Record<ReservedAreaRule, string>> = {
  "AST-R47": "the top band reserved for the fixed bar and the identity plate",
  "AST-R55": "the corner reserved for the identity plate",
  "AST-R56": "the bottom center reserved for the welcome",
};

function isInBox(point: ScenePoint, box: SceneBox): boolean {
  return point.x >= box.left && point.x <= box.right && point.y >= box.top && point.y <= box.bottom;
}

/**
 * The reserved regions that an object occupies. The diagnostic display takes no focus, so the
 * welcome may cover it (AST-R56).
 */
function reservedAreasOccupied({ id, polygon }: Hotspot): readonly ReservedAreaRule[] {
  return RESERVED_AREA_RULES.filter((rule) => {
    if (rule === "AST-R56" && id === "post-display") return false;
    const box = RESERVED_AREAS[rule];
    return (
      polygon.some((point) => isInBox(point, box)) || polygonsOverlap(polygon, boxToPolygon(box))
    );
  });
}

function findShapeIssues(hotspot: Hotspot): readonly HotspotIssue[] {
  const { id, polygon } = hotspot;
  const issues: HotspotIssue[] = [];
  const report = (rule: HotspotRule, message: string): void => {
    issues.push({ rule, ids: [id], message: `${id}: ${message}` });
  };

  if (polygon.length < MIN_VERTICES || polygon.length > MAX_VERTICES) {
    report(
      "SCN-R08",
      `has ${String(polygon.length)} vertices, outside the range ${String(MIN_VERTICES)} to ${String(MAX_VERTICES)}`,
    );
  }
  if (!polygon.every(isInSafeArea)) report("SCN-R08", "has a vertex outside the safe area");
  if (isSelfIntersecting(polygon)) report("SCN-R08", "crosses itself");

  const box = boundingBox(polygon);
  const longer = Math.max(boxWidth(box), boxHeight(box));
  const shorter = Math.min(boxWidth(box), boxHeight(box));
  const [minLonger, minShorter] = MIN_SIZES[id];
  if (longer < minLonger || shorter < minShorter) {
    report(
      "AST-R20",
      `measures ${String(longer)}×${String(shorter)} units, below its minimum of ${String(minLonger)}×${String(minShorter)}`,
    );
  }

  for (const rule of reservedAreasOccupied(hotspot)) {
    report(rule, `occupies ${RESERVED_FOR[rule]}`);
  }
  return issues;
}

/**
 * Checks the calibration data and returns everything that breaks a rule: the shape of each
 * silhouette (SCN-R08), its minimum size (AST §4.4), the regions reserved for the fixed bar, the
 * identity plate and the welcome (AST-R47, AST-R55, AST-R56), the gap between silhouettes
 * (AST-R11) and the overlap of hit areas (SCN-R13).
 * An empty list means that the calibration is valid (SCN-R10).
 */
export function validateHotspots(
  hotspots: Readonly<Record<SceneObjectId, Hotspot>>,
): readonly HotspotIssue[] {
  const list = SCENE_OBJECT_IDS.map((id) => hotspots[id]);
  const issues: HotspotIssue[] = list.flatMap(findShapeIssues);

  list.forEach((first, index) => {
    for (const second of list.slice(index + 1)) {
      const ids = [first.id, second.id];
      const gap = distanceBetweenPolygons(first.polygon, second.polygon);
      if (gap < MIN_SEPARATION) {
        issues.push({
          rule: "AST-R11",
          ids,
          message: `${first.id} and ${second.id}: their silhouettes are ${String(Math.round(gap))} units apart, less than ${String(MIN_SEPARATION)}`,
        });
      }
      if (polygonsOverlap(computeHitArea(first, list), computeHitArea(second, list))) {
        issues.push({
          rule: "SCN-R13",
          ids,
          message: `${first.id} and ${second.id}: their hit areas overlap`,
        });
      }
    }
  });
  return issues;
}
