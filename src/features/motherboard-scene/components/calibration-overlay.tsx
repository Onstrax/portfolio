"use client";

import { useEffect, useRef, useState } from "react";

import { SCENE_OBJECT_IDS } from "@/shared/contracts/ids";

import { HOTSPOTS } from "../hotspots";
import { computeHitArea } from "../lib/compute-hit-area";
import { boundingBox, boxHeight, boxWidth } from "../lib/geometry";
import {
  RESERVED_AREAS,
  SAFE_AREA,
  SCENE_HEIGHT,
  SCENE_WIDTH,
  toSvgPoints,
} from "../lib/scene-space";
import type { SceneBox, ScenePoint } from "../types";
import { STAGE_LAYER } from "./scene.styles";

/** Query string that opens the overlay in the development server (AST-R42). */
export const CALIBRATION_QUERY = "debug=hotspots";

const GRID_STEP = 100;

// The overlay is read over both variants: light strokes on the photograph, dark ones on the sketch.
const TEXT = "scene-photo:fill-on-dark scene-sketch:fill-ink";
const GRID_LINE = "scene-photo:stroke-on-dark-muted/40 scene-sketch:stroke-ink/25";
const HIT_BOX =
  "fill-none [stroke-dasharray:4_4] scene-photo:stroke-on-dark scene-sketch:stroke-ink";
const HOTSPOT_LIST = SCENE_OBJECT_IDS.map((id) => HOTSPOTS[id]);

function steps(limit: number): readonly number[] {
  return Array.from({ length: Math.floor(limit / GRID_STEP) + 1 }, (_, index) => index * GRID_STEP);
}

function Box({ box, className }: { readonly box: SceneBox; readonly className: string }) {
  return (
    <rect
      x={box.left}
      y={box.top}
      width={boxWidth(box)}
      height={boxHeight(box)}
      vectorEffect="non-scaling-stroke"
      className={className}
    />
  );
}

/**
 * Development aid to trace and check the hotspots over the image (SCN-R41): silhouettes with
 * their identifiers, hit area boxes, safe area, reserved regions, a grid every 100 units and the
 * position of the pointer in scene units. It is never part of the production build.
 */
export function CalibrationOverlay() {
  const svg = useRef<SVGSVGElement>(null);
  const [pointer, setPointer] = useState<ScenePoint | null>(null);

  useEffect(() => {
    const onMove = (event: PointerEvent): void => {
      const rect = svg.current?.getBoundingClientRect();
      if (rect === undefined || rect.width === 0) return;
      setPointer({
        x: Math.round(((event.clientX - rect.left) / rect.width) * SCENE_WIDTH),
        y: Math.round(((event.clientY - rect.top) / rect.height) * SCENE_HEIGHT),
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const position = pointer === null ? "–" : `${String(pointer.x)}, ${String(pointer.y)}`;
  const readout = `?${CALIBRATION_QUERY} · ${position}`;

  return (
    <>
      <svg
        ref={svg}
        aria-hidden="true"
        data-testid="calibration-overlay"
        viewBox={`0 0 ${String(SCENE_WIDTH)} ${String(SCENE_HEIGHT)}`}
        className={`${STAGE_LAYER} z-(--z-labels) font-mono text-[10px]`}
      >
        <g className={GRID_LINE}>
          {steps(SCENE_WIDTH).map((x) => (
            <line
              key={x}
              x1={x}
              y1={0}
              x2={x}
              y2={SCENE_HEIGHT}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {steps(SCENE_HEIGHT).map((y) => (
            <line key={y} x1={0} y1={y} x2={SCENE_WIDTH} y2={y} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
        <g className={TEXT}>
          {steps(SCENE_WIDTH).map((x) => (
            <text key={x} x={x + 3} y={11}>
              {x}
            </text>
          ))}
          {steps(SCENE_HEIGHT).map((y) => (
            <text key={y} x={3} y={y - 3}>
              {y}
            </text>
          ))}
        </g>
        <Box box={SAFE_AREA} className="fill-none stroke-(--scene-display)" />
        {Object.entries(RESERVED_AREAS).map(([rule, box]) => (
          <Box key={rule} box={box} className="fill-aura-sketch/20 stroke-aura-sketch" />
        ))}
        {HOTSPOT_LIST.map((hotspot) => {
          const box = boundingBox(hotspot.polygon);
          return (
            <g key={hotspot.id} data-hotspot={hotspot.id}>
              <Box box={boundingBox(computeHitArea(hotspot, HOTSPOT_LIST))} className={HIT_BOX} />
              <polygon
                points={toSvgPoints(hotspot.polygon)}
                vectorEffect="non-scaling-stroke"
                className="fill-(--scene-aura)/15 stroke-(--scene-aura)"
              />
              <text x={box.left + 4} y={box.top + 14} className={`${TEXT} font-semibold`}>
                {hotspot.id}
              </text>
            </g>
          );
        })}
      </svg>
      <output className="rounded-control bg-plate text-on-dark pointer-events-none absolute top-2 left-2 z-(--z-labels) px-2 py-1 font-mono text-xs leading-4">
        {readout}
      </output>
    </>
  );
}
