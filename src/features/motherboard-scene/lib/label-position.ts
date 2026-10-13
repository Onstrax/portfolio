import type { LabelPlacement, SceneBox } from "../types";
import { SCENE_WIDTH } from "./scene-space";

/** Gap between a hit area and its label, in scene units (SCN-R26). */
export const LABEL_GAP = 12;
/** Space kept between a label and the border of the stage, in pixels (SCN-R26). */
export const LABEL_MARGIN_PX = 8;

export interface PixelSize {
  readonly width: number;
  readonly height: number;
}

export interface LabelPositionInput {
  /** Box of the hit area of the zone, in scene units. */
  readonly hitBox: SceneBox;
  readonly placement: LabelPlacement;
  /** Displacement along the side, in scene units (`Hotspot.labelShift`). */
  readonly shift: number;
  /** Rendered size of the label. */
  readonly label: PixelSize;
  /** Rendered size of the stage. */
  readonly stage: PixelSize;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/**
 * Top left corner of a label, in pixels of the stage: next to the side of the hit area that its
 * placement names, centered on that side plus its shift, and moved as little as needed to stay
 * inside the stage with its margin (SCN-R26).
 */
export function labelPosition({ hitBox, placement, shift, label, stage }: LabelPositionInput): {
  readonly left: number;
  readonly top: number;
} {
  const scale = stage.width / SCENE_WIDTH;
  const centerX = ((hitBox.left + hitBox.right) / 2 + shift) * scale;
  const centerY = ((hitBox.top + hitBox.bottom) / 2 + shift) * scale;

  const natural = {
    top: { left: centerX - label.width / 2, top: (hitBox.top - LABEL_GAP) * scale - label.height },
    bottom: { left: centerX - label.width / 2, top: (hitBox.bottom + LABEL_GAP) * scale },
    left: {
      left: (hitBox.left - LABEL_GAP) * scale - label.width,
      top: centerY - label.height / 2,
    },
    right: { left: (hitBox.right + LABEL_GAP) * scale, top: centerY - label.height / 2 },
  }[placement];

  return {
    left: Math.round(
      clamp(natural.left, LABEL_MARGIN_PX, stage.width - LABEL_MARGIN_PX - label.width),
    ),
    top: Math.round(
      clamp(natural.top, LABEL_MARGIN_PX, stage.height - LABEL_MARGIN_PX - label.height),
    ),
  };
}
