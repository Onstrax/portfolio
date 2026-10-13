import { describe, expect, it } from "vitest";

import type { Hotspot, ScenePoint } from "../types";
import { computeHitArea, MIN_HIT_SIZE } from "./compute-hit-area";
import { boundingBox, boxToPolygon, polygonsOverlap } from "./geometry";

function hotspot(id: Hotspot["id"], polygon: readonly ScenePoint[]): Hotspot {
  return { id, polygon, labelPlacement: "top" };
}

function rectangle(
  left: number,
  top: number,
  width: number,
  height: number,
): readonly ScenePoint[] {
  return boxToPolygon({ left, top, right: left + width, bottom: top + height });
}

describe("computeHitArea", () => {
  it("SCN-AC04: returns the silhouette when its box measures 69 units or more on both sides", () => {
    const silhouette = [
      { x: 100, y: 100 },
      { x: 200, y: 110 },
      { x: 190, y: 180 },
      { x: 100, y: 169 },
    ];
    expect(computeHitArea(hotspot("cpu", silhouette), [])).toEqual(silhouette);
    expect(computeHitArea(hotspot("cpu", rectangle(0, 0, 69, 69)), [])).toEqual(
      rectangle(0, 0, 69, 69),
    );
  });

  it("SCN-AC04: returns the box enlarged and centered when the silhouette is too small", () => {
    const coin = hotspot("cmos", rectangle(607, 454, 48, 49));
    expect(boundingBox(computeHitArea(coin, []))).toEqual({
      left: 596.5,
      top: 444,
      right: 665.5,
      bottom: 513,
    });
  });

  it("SCN-AC04: enlarges only the dimension that is too small", () => {
    const drive = hotspot("ssd", rectangle(702, 498, 187, 53));
    expect(boundingBox(computeHitArea(drive, []))).toEqual({
      left: 702,
      top: 490,
      right: 889,
      bottom: 559,
    });
  });

  it("SCN-AC04: two small silhouettes 20 units apart get areas that do not overlap", () => {
    const left = hotspot("cmos", rectangle(100, 100, 30, 30));
    const right = hotspot("settings", rectangle(150, 100, 30, 30));

    const leftArea = computeHitArea(left, [right]);
    const rightArea = computeHitArea(right, [left]);

    expect(polygonsOverlap(leftArea, rightArea)).toBe(false);
    expect(boundingBox(leftArea).right).toBe(140);
    expect(boundingBox(rightArea).left).toBe(140);
    expect(boundingBox(leftArea).left).toBe(80.5);
  });

  it("trims towards a neighbour above or below at the midpoint between the silhouettes", () => {
    const upper = hotspot("cmos", rectangle(100, 100, 100, 30));
    const lower = hotspot("ssd", rectangle(100, 140, 100, 30));

    expect(boundingBox(computeHitArea(upper, [lower])).bottom).toBe(135);
    expect(boundingBox(computeHitArea(lower, [upper])).top).toBe(135);
  });

  it("ignores itself and neighbours that the enlarged box does not reach", () => {
    const coin = hotspot("cmos", rectangle(607, 454, 48, 49));
    const far = hotspot("fan", rectangle(1200, 100, 280, 280));
    expect(boundingBox(computeHitArea(coin, [coin, far]))).toEqual({
      left: 596.5,
      top: 444,
      right: 665.5,
      bottom: 513,
    });
  });

  it("uses 69 units, the size of a 44 px target at the smallest scale of the scene", () => {
    expect(MIN_HIT_SIZE).toBe(69);
  });
});
