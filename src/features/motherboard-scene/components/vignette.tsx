import { SCENE_HEIGHT, SCENE_WIDTH, VIGNETTE_SIZE } from "../lib/scene-space";
import { STAGE_LAYER } from "./scene.styles";

const EDGES = [
  { id: "left", x: 0, y: 0, width: VIGNETTE_SIZE, height: SCENE_HEIGHT, x2: 1, y2: 0 },
  { id: "top", x: 0, y: 0, width: SCENE_WIDTH, height: VIGNETTE_SIZE, x2: 0, y2: 1 },
  {
    id: "right",
    x: SCENE_WIDTH - VIGNETTE_SIZE,
    y: 0,
    width: VIGNETTE_SIZE,
    height: SCENE_HEIGHT,
    x2: -1,
    y2: 0,
  },
  {
    id: "bottom",
    x: 0,
    y: SCENE_HEIGHT - VIGNETTE_SIZE,
    width: SCENE_WIDTH,
    height: VIGNETTE_SIZE,
    x2: 0,
    y2: -1,
  },
] as const;

const BACKDROP_STOP = "[stop-color:var(--scene-backdrop)]";

/**
 * Fades the four edges of the image into the backdrop of the variant, so that its limit is not
 * perceived against the bands around the stage (AST-R48).
 */
export function Vignette() {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${String(SCENE_WIDTH)} ${String(SCENE_HEIGHT)}`}
      preserveAspectRatio="none"
      className={STAGE_LAYER}
    >
      <defs>
        {EDGES.map((edge) => (
          <linearGradient
            key={edge.id}
            id={`scene-vignette-${edge.id}`}
            x1={edge.x2 < 0 ? 1 : 0}
            y1={edge.y2 < 0 ? 1 : 0}
            x2={edge.x2 > 0 ? 1 : 0}
            y2={edge.y2 > 0 ? 1 : 0}
          >
            <stop offset="0" className={BACKDROP_STOP} />
            <stop offset="1" stopOpacity="0" className={BACKDROP_STOP} />
          </linearGradient>
        ))}
      </defs>
      {EDGES.map((edge) => (
        <rect
          key={edge.id}
          data-edge={edge.id}
          x={edge.x}
          y={edge.y}
          width={edge.width}
          height={edge.height}
          fill={`url(#scene-vignette-${edge.id})`}
        />
      ))}
    </svg>
  );
}
