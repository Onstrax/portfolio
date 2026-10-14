import type { SceneObjectId } from "@/shared/contracts/ids";

import type { Hotspot, ScenePoint } from "../types";
import { boundingBox } from "./geometry";

export type ArrowDirection = "up" | "down" | "left" | "right";

/** A zone that the arrows can reach, with the centre of the box of its silhouette. */
export interface PlacedZone {
  readonly id: SceneObjectId;
  readonly center: ScenePoint;
}

const ARROW_KEYS: Readonly<Record<string, ArrowDirection>> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

const UNIT_VECTORS: Readonly<Record<ArrowDirection, ScenePoint>> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

/** Weight of the sideways offset against the distance ahead (SCN-R45). */
const SIDEWAYS_WEIGHT = 2;

/** The direction of an arrow key, or `null` for any other key. */
export function arrowDirection(key: string): ArrowDirection | null {
  return ARROW_KEYS[key] ?? null;
}

/** Centre of the box of the silhouette of a hotspot, in scene space. */
export function zoneCenter(hotspot: Hotspot): ScenePoint {
  const box = boundingBox(hotspot.polygon);
  return { x: (box.left + box.right) / 2, y: (box.top + box.bottom) / 2 };
}

/**
 * The zone that an arrow key leads to from `from` (SCN-R45): among the zones ahead, the one with
 * the lowest `ahead + 2 × aside`, preferring those within 45° of the direction. `null` when no
 * zone lies ahead.
 */
export function zoneInDirection(
  from: ScenePoint,
  direction: ArrowDirection,
  zones: readonly PlacedZone[],
): SceneObjectId | null {
  const unit = UNIT_VECTORS[direction];
  let best: {
    readonly id: SceneObjectId;
    readonly isInCone: boolean;
    readonly score: number;
  } | null = null;
  for (const zone of zones) {
    const dx = zone.center.x - from.x;
    const dy = zone.center.y - from.y;
    const ahead = dx * unit.x + dy * unit.y;
    if (ahead <= 0) continue;
    const aside = Math.abs(dx * unit.y - dy * unit.x);
    const candidate = {
      id: zone.id,
      isInCone: aside <= ahead,
      score: ahead + SIDEWAYS_WEIGHT * aside,
    };
    const isBetter =
      best === null ||
      (candidate.isInCone && !best.isInCone) ||
      (candidate.isInCone === best.isInCone && candidate.score < best.score);
    if (isBetter) best = candidate;
  }
  return best?.id ?? null;
}
