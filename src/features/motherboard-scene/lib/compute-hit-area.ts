import type { Hotspot, SceneBox, ScenePoint } from "../types";
import { boundingBox, boxesOverlap, boxHeight, boxToPolygon, boxWidth } from "./geometry";

/**
 * Minimum size of a hit area, in scene units. At the smallest stage, 1024×576 px, a unit measures
 * 0.64 px, so 69 units are the 44 px that a pointer target needs (AST §4.2, QLT-R11).
 */
export const MIN_HIT_SIZE = 69;

/** The box of a silhouette, grown around its center up to the minimum size on each side. */
function enlarge(box: SceneBox): SceneBox {
  const extraWidth = Math.max(0, MIN_HIT_SIZE - boxWidth(box)) / 2;
  const extraHeight = Math.max(0, MIN_HIT_SIZE - boxHeight(box)) / 2;
  return {
    left: box.left - extraWidth,
    top: box.top - extraHeight,
    right: box.right + extraWidth,
    bottom: box.bottom + extraHeight,
  };
}

function isLargeEnough(box: SceneBox): boolean {
  return boxWidth(box) >= MIN_HIT_SIZE && boxHeight(box) >= MIN_HIT_SIZE;
}

/** Cuts `area` at the midpoint between two silhouettes, on the side where the neighbour is. */
function trimTowards(area: SceneBox, own: SceneBox, neighbour: SceneBox): SceneBox {
  if (neighbour.left >= own.right) {
    return { ...area, right: Math.min(area.right, (own.right + neighbour.left) / 2) };
  }
  if (neighbour.right <= own.left) {
    return { ...area, left: Math.max(area.left, (own.left + neighbour.right) / 2) };
  }
  if (neighbour.top >= own.bottom) {
    return { ...area, bottom: Math.min(area.bottom, (own.bottom + neighbour.top) / 2) };
  }
  if (neighbour.bottom <= own.top) {
    return { ...area, top: Math.max(area.top, (own.top + neighbour.bottom) / 2) };
  }
  return area;
}

/**
 * Region of a hotspot that answers to the pointer (SCN-R13): its silhouette, or its box enlarged
 * to the minimum size when the silhouette is smaller. An enlargement that would reach the area of
 * a neighbour is cut halfway between both silhouettes, so that two areas never overlap.
 */
export function computeHitArea(
  hotspot: Hotspot,
  neighbours: readonly Hotspot[],
): readonly ScenePoint[] {
  const own = boundingBox(hotspot.polygon);
  if (isLargeEnough(own)) return hotspot.polygon;

  let area = enlarge(own);
  for (const neighbour of neighbours) {
    if (neighbour.id === hotspot.id) continue;
    const silhouette = boundingBox(neighbour.polygon);
    if (boxesOverlap(area, enlarge(silhouette))) area = trimTowards(area, own, silhouette);
  }
  return boxToPolygon(area);
}
