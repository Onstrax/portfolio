import type { SceneBox, ScenePoint } from "../types";

/** Smallest axis-aligned rectangle that contains the points. */
export function boundingBox(points: readonly ScenePoint[]): SceneBox {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return {
    left: Math.min(...xs),
    top: Math.min(...ys),
    right: Math.max(...xs),
    bottom: Math.max(...ys),
  };
}

export function boxWidth(box: SceneBox): number {
  return box.right - box.left;
}

export function boxHeight(box: SceneBox): number {
  return box.bottom - box.top;
}

export function boxToPolygon(box: SceneBox): readonly ScenePoint[] {
  return [
    { x: box.left, y: box.top },
    { x: box.right, y: box.top },
    { x: box.right, y: box.bottom },
    { x: box.left, y: box.bottom },
  ];
}

/** `true` when the rectangles share some area. Touching edges do not count. */
export function boxesOverlap(first: SceneBox, second: SceneBox): boolean {
  return (
    first.left < second.right &&
    second.left < first.right &&
    first.top < second.bottom &&
    second.top < first.bottom
  );
}

type Segment = readonly [ScenePoint, ScenePoint];

function edgesOf(polygon: readonly ScenePoint[]): readonly Segment[] {
  return polygon.map((point, index) => {
    const next = polygon[(index + 1) % polygon.length] ?? point;
    return [point, next];
  });
}

/** Sign of the turn from `a` to `b` to `c`: positive, negative or zero when they are aligned. */
function turn(a: ScenePoint, b: ScenePoint, c: ScenePoint): number {
  return Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
}

/** `true` when the segments cross at a point that is interior to both. */
function segmentsCross(first: Segment, second: Segment): boolean {
  const [a, b] = first;
  const [c, d] = second;
  return turn(a, b, c) * turn(a, b, d) < 0 && turn(c, d, a) * turn(c, d, b) < 0;
}

function distanceToSegment(point: ScenePoint, [a, b]: Segment): number {
  const lengthSquared = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
  const along =
    lengthSquared === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            1,
            ((point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)) / lengthSquared,
          ),
        );
  return Math.hypot(point.x - (a.x + along * (b.x - a.x)), point.y - (a.y + along * (b.y - a.y)));
}

/** `true` when the point lies strictly inside the polygon. */
export function isInsidePolygon(point: ScenePoint, polygon: readonly ScenePoint[]): boolean {
  if (edgesOf(polygon).some((edge) => distanceToSegment(point, edge) === 0)) return false;
  let isInside = false;
  for (const [a, b] of edgesOf(polygon)) {
    const crosses = a.y > point.y !== b.y > point.y;
    if (crosses && point.x < a.x + ((point.y - a.y) / (b.y - a.y)) * (b.x - a.x)) {
      isInside = !isInside;
    }
  }
  return isInside;
}

/** `true` when two edges of the polygon that are not neighbours cross each other. */
export function isSelfIntersecting(polygon: readonly ScenePoint[]): boolean {
  const edges = edgesOf(polygon);
  return edges.some((edge, index) =>
    edges.slice(index + 1).some((other) => segmentsCross(edge, other)),
  );
}

/** `true` when the polygons share some area. Touching edges or vertices do not count. */
export function polygonsOverlap(
  first: readonly ScenePoint[],
  second: readonly ScenePoint[],
): boolean {
  const firstEdges = edgesOf(first);
  const secondEdges = edgesOf(second);
  if (firstEdges.some((edge) => secondEdges.some((other) => segmentsCross(edge, other)))) {
    return true;
  }
  const center = (polygon: readonly ScenePoint[]): ScenePoint => {
    const box = boundingBox(polygon);
    return { x: (box.left + box.right) / 2, y: (box.top + box.bottom) / 2 };
  };
  return (
    first.some((point) => isInsidePolygon(point, second)) ||
    second.some((point) => isInsidePolygon(point, first)) ||
    isInsidePolygon(center(first), second) ||
    isInsidePolygon(center(second), first)
  );
}

/** Shortest distance between two polygons; 0 when they touch or overlap. */
export function distanceBetweenPolygons(
  first: readonly ScenePoint[],
  second: readonly ScenePoint[],
): number {
  if (polygonsOverlap(first, second)) return 0;
  const firstEdges = edgesOf(first);
  const secondEdges = edgesOf(second);
  return Math.min(
    ...first.flatMap((point) => secondEdges.map((edge) => distanceToSegment(point, edge))),
    ...second.flatMap((point) => firstEdges.map((edge) => distanceToSegment(point, edge))),
  );
}
