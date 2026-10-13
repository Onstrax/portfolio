import type { SceneObjectId } from "@/shared/contracts/ids";

export interface ScenePoint {
  readonly x: number;
  readonly y: number;
}

/** Side of the hotspot next to which its label is placed. */
export type LabelPlacement = "top" | "right" | "bottom" | "left";

export interface Hotspot {
  readonly id: SceneObjectId;
  /** Silhouette in scene space (AST §4.2). */
  readonly polygon: readonly ScenePoint[];
  readonly labelPlacement: LabelPlacement;
  /**
   * Displacement of the label along its side, in scene units: to the right for `top` and
   * `bottom`, downwards for `left` and `right`. Calibration uses it to keep labels apart.
   */
  readonly labelShift?: number;
}

/** Axis-aligned rectangle in scene space. */
export interface SceneBox {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}
