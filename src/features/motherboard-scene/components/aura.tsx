import type { SceneObjectId } from "@/shared/contracts/ids";
import { cn } from "@/shared/lib/cn";

import {
  AURA_BLUR_FAR,
  AURA_BLUR_NEAR,
  AURA_EDGE_FEATHER,
  AURA_GAIN,
  AURA_OPACITY,
  type AuraState,
  auraTier,
} from "../lib/aura";
import { boundingBox, boxHeight, boxWidth } from "../lib/geometry";
import { toSvgPoints } from "../lib/scene-space";
import type { ScenePoint } from "../types";
import { AURA_GLOW_RANGE, AURA_PART } from "./scene.styles";

/** Gap between a hit area and its focus rectangle, in units (SCN-R21). */
const FOCUS_RING_GAP = 4;

const AURA_COLOR = "fill-(--scene-aura)";

/** Room that the halo needs around the silhouette to fade out completely. */
const HALO_REACH = 3 * AURA_BLUR_FAR;

function haloFilterId(id: SceneObjectId): string {
  return `scene-aura-halo-${id}`;
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
 * Aura of a zone: light that seems to come from behind the piece. The silhouette is blurred twice,
 * a tight glow and a wide one, and what falls on the piece itself is removed, so there is a halo
 * around it and no line. A faint fill makes the piece itself glow, more while the zone is lit
 * (VIS-R13, VIS-R14).
 */
export function Aura({ id, polygon, hitArea, state, hasFocusRing, canBreathe }: AuraProps) {
  const tier = auraTier(id);
  const opacity = AURA_OPACITY[tier][state];
  const points = toSvgPoints(polygon);
  const silhouette = boundingBox(polygon);
  const box = boundingBox(hitArea);

  return (
    <g data-aura={id} data-state={state}>
      <filter
        id={haloFilterId(id)}
        filterUnits="userSpaceOnUse"
        x={silhouette.left - HALO_REACH}
        y={silhouette.top - HALO_REACH}
        width={boxWidth(silhouette) + 2 * HALO_REACH}
        height={boxHeight(silhouette) + 2 * HALO_REACH}
      >
        <feGaussianBlur in="SourceGraphic" stdDeviation={AURA_BLUR_FAR} result="far" />
        <feGaussianBlur in="SourceGraphic" stdDeviation={AURA_BLUR_NEAR} result="near" />
        <feMerge result="light">
          <feMergeNode in="far" />
          <feMergeNode in="near" />
        </feMerge>
        <feComponentTransfer in="light" result="bright">
          <feFuncA type="linear" slope={AURA_GAIN} />
        </feComponentTransfer>
        <feGaussianBlur in="SourceAlpha" stdDeviation={AURA_EDGE_FEATHER} result="piece" />
        <feComposite in="bright" in2="piece" operator="out" />
      </filter>
      <g
        data-part="glow"
        opacity={opacity.glow}
        className={cn(AURA_PART, AURA_GLOW_RANGE[tier], canBreathe && "boot-done:aura-breath")}
      >
        <polygon points={points} filter={`url(#${haloFilterId(id)})`} className={AURA_COLOR} />
      </g>
      <polygon
        data-part="fill"
        points={points}
        opacity={opacity.fill}
        className={cn(AURA_PART, AURA_COLOR)}
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
          className="fill-none stroke-(--scene-aura)"
        />
      )}
    </g>
  );
}
