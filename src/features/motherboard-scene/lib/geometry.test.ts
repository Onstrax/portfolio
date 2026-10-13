import { describe, expect, it } from "vitest";

import type { ScenePoint } from "../types";
import {
  boundingBox,
  boxesOverlap,
  boxHeight,
  boxToPolygon,
  boxWidth,
  distanceBetweenPolygons,
  isInsidePolygon,
  isSelfIntersecting,
  polygonsOverlap,
} from "./geometry";

function square(left: number, top: number, size: number): readonly ScenePoint[] {
  return boxToPolygon({ left, top, right: left + size, bottom: top + size });
}

describe("boxes", () => {
  it("finds the bounding box of a polygon and its size", () => {
    const box = boundingBox([
      { x: 30, y: 80 },
      { x: 10, y: 20 },
      { x: 70, y: 40 },
    ]);
    expect(box).toEqual({ left: 10, top: 20, right: 70, bottom: 80 });
    expect([boxWidth(box), boxHeight(box)]).toEqual([60, 60]);
  });

  it("turns a box into its four corners, clockwise from the top left", () => {
    expect(boxToPolygon({ left: 1, top: 2, right: 3, bottom: 4 })).toEqual([
      { x: 1, y: 2 },
      { x: 3, y: 2 },
      { x: 3, y: 4 },
      { x: 1, y: 4 },
    ]);
  });

  it("treats boxes that only touch as not overlapping", () => {
    const base = { left: 0, top: 0, right: 10, bottom: 10 };
    expect(boxesOverlap(base, { left: 5, top: 5, right: 15, bottom: 15 })).toBe(true);
    expect(boxesOverlap(base, { left: 10, top: 0, right: 20, bottom: 10 })).toBe(false);
    expect(boxesOverlap(base, { left: 0, top: 12, right: 10, bottom: 20 })).toBe(false);
  });
});

describe("polygons", () => {
  it("tells whether a point is strictly inside", () => {
    const polygon = square(0, 0, 10);
    expect(isInsidePolygon({ x: 5, y: 5 }, polygon)).toBe(true);
    expect(isInsidePolygon({ x: 15, y: 5 }, polygon)).toBe(false);
    expect(isInsidePolygon({ x: 10, y: 5 }, polygon)).toBe(false);
    expect(isInsidePolygon({ x: 0, y: 0 }, polygon)).toBe(false);
  });

  it("detects a polygon whose edges cross", () => {
    const bowTie = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 10, y: 0 },
      { x: 0, y: 10 },
    ];
    expect(isSelfIntersecting(bowTie)).toBe(true);
    expect(isSelfIntersecting(square(0, 0, 10))).toBe(false);
  });

  it("detects overlap by crossing edges and by containment, but not by touching", () => {
    expect(polygonsOverlap(square(0, 0, 10), square(5, 5, 10))).toBe(true);
    expect(polygonsOverlap(square(0, 0, 30), square(10, 10, 5))).toBe(true);
    expect(polygonsOverlap(square(10, 10, 5), square(0, 0, 30))).toBe(true);
    expect(polygonsOverlap(square(0, 0, 10), square(0, 0, 10))).toBe(true);
    expect(polygonsOverlap(square(0, 0, 10), square(10, 0, 10))).toBe(false);
    expect(polygonsOverlap(square(0, 0, 10), square(40, 0, 10))).toBe(false);
  });

  it("measures the gap between polygons, and 0 when they overlap", () => {
    expect(distanceBetweenPolygons(square(0, 0, 10), square(30, 0, 10))).toBe(20);
    expect(distanceBetweenPolygons(square(0, 0, 10), square(13, 14, 10))).toBe(5);
    expect(distanceBetweenPolygons(square(0, 0, 10), square(5, 5, 10))).toBe(0);
    expect(distanceBetweenPolygons(square(0, 0, 10), square(10, 0, 10))).toBe(0);
  });

  it("measures the distance to a polygon reduced to a point", () => {
    const dot = [
      { x: 20, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 0 },
    ];
    expect(distanceBetweenPolygons(square(0, 0, 10), dot)).toBe(10);
  });
});
