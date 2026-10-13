import type { SceneObjectId } from "@/shared/contracts/ids";
import { cn } from "@/shared/lib/cn";

import {
  AURA_BLUR_FAR,
  AURA_BLUR_NEAR,
  AURA_OPACITY,
  AURA_STROKE_WIDTH,
  type AuraState,
  auraTier,
} from "../lib/aura";
import { boundingBox, boxHeight, boxWidth } from "../lib/geometry";
import { SCENE_HEIGHT, SCENE_WIDTH, toSvgPoints } from "../lib/scene-space";
import type { ScenePoint } from "../types";
import { AURA_GLOW_RANGE, AURA_PART, AURA_STROKE } from "./scene.styles";

/** Gap between a hit area and its focus rectangle, in units (SCN-R21). */
const FOCUS_RING_GAP = 4;

export const AURA_FILTERS = { near: "scene-aura-near", far: "scene-aura-far" } as const;

function outsideClipId(id: SceneObjectId): string {
  return `scene-aura-outside-${id}`;
}

/** The two blurs of the glow, shared by every aura (VIS-R13). */
export function AuraFilters() {
  return (
    <>
      <filter id={AURA_FILTERS.near} x="-75%" y="-75%" width="250%" height="250%">
        <feGaussianBlur stdDeviation={AURA_BLUR_NEAR} />
      </filter>
      <filter id={AURA_FILTERS.far} x="-75%" y="-75%" width="250%" height="250%">
        <feGaussianBlur stdDeviation={AURA_BLUR_FAR} />
      </filter>
    </>
  );
}

interface AuraProps {
  readonly id: SceneObjectId;
  /** Silhouette of the object. */
  readonly polygon: readonly ScenePoint[];
  /** Hit area of the zone, around whose box the focus rectangle is drawn. */
  readonly hitArea: readonly ScenePoint[];
  readonly state: AuraState;
  /** `true` when the zone has keyboard focus. */
  readonly hasFocusRing: boolean;
  /** `true` while the glow may breathe: at rest and not touched yet (VIS-R16). */
  readonly canBreathe: boolean;
}

/**
 * Aura of a zone: a stroke on its silhouette, a glow made of two blurred copies of that stroke,
 * drawn only outside the piece, and a faint fill while the zone is lit (VIS-R13, VIS-R14).
 */
export function Aura({ id, polygon, hitArea, state, hasFocusRing, canBreathe }: AuraProps) {
  const tier = auraTier(id);
  const opacity = AURA_OPACITY[tier][state];
  const points = toSvgPoints(polygon);
  const outline = polygon.map((point) => `${String(point.x)} ${String(point.y)}`).join("L");
  const box = boundingBox(hitArea);

  return (
    <g data-aura={id} data-state={state}>
      <clipPath id={outsideClipId(id)}>
        <path
          clipRule="evenodd"
          d={`M0 0H${String(SCENE_WIDTH)}V${String(SCENE_HEIGHT)}H0ZM${outline}Z`}
        />
      </clipPath>
      <g clipPath={`url(#${outsideClipId(id)})`}>
        <g
          data-part="glow"
          opacity={opacity.glow}
          className={cn(AURA_PART, AURA_GLOW_RANGE[tier], canBreathe && "boot-done:aura-breath")}
        >
          <polygon
            points={points}
            strokeWidth={AURA_STROKE_WIDTH}
            filter={`url(#${AURA_FILTERS.far})`}
            className={AURA_STROKE}
          />
          <polygon
            points={points}
            strokeWidth={AURA_STROKE_WIDTH}
            filter={`url(#${AURA_FILTERS.near})`}
            className={AURA_STROKE}
          />
        </g>
      </g>
      <polygon
        data-part="fill"
        points={points}
        opacity={opacity.fill}
        className={cn(AURA_PART, "fill-(--scene-aura)")}
      />
      <polygon
        data-part="stroke"
        points={points}
        opacity={opacity.stroke}
        strokeWidth={AURA_STROKE_WIDTH}
        className={cn(AURA_PART, AURA_STROKE)}
      />
      {hasFocusRing && (
        <rect
          data-part="focus-ring"
          x={box.left - FOCUS_RING_GAP}
          y={box.top - FOCUS_RING_GAP}
          width={boxWidth(box) + 2 * FOCUS_RING_GAP}
          height={boxHeight(box) + 2 * FOCUS_RING_GAP}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          className={AURA_STROKE}
        />
      )}
    </g>
  );
}
