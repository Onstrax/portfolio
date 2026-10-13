import { useLayoutEffect, useRef } from "react";

import { labelPosition, type PixelSize } from "../lib/label-position";
import type { LabelPlacement, SceneBox } from "../types";
import { LABEL_CONTENT, LABEL_NAME, LABEL_PINNED_STATES, LABEL_STATES } from "./scene.styles";

interface SceneLabelProps {
  /** First line: the name of the piece. */
  readonly name: string;
  /** Second line: what the piece opens or shows. */
  readonly content: string;
  /** Box of the hit area of the zone, in scene units. */
  readonly hitBox: SceneBox;
  readonly placement: LabelPlacement;
  readonly shift: number;
  /** Rendered size of the stage; `null` until it has been measured. */
  readonly stage: PixelSize | null;
  readonly isVisible: boolean;
  /** `true` for the labels that are always shown on devices without hover (SCN-R25). */
  readonly isPinned: boolean;
  readonly onPointerEnter: () => void;
  readonly onPointerLeave: () => void;
}

/**
 * Plate that names a zone (SCN-R22). It is hidden from assistive technology: the same text is the
 * accessible name of the zone (SCN-R27). Its position depends on its rendered size, so it is
 * computed after layout and written straight to the element (SCN-R26).
 */
export function SceneLabel({
  name,
  content,
  hitBox,
  placement,
  shift,
  stage,
  isVisible,
  isPinned,
  onPointerEnter,
  onPointerLeave,
}: SceneLabelProps) {
  const element = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const label = element.current;
    if (label === null || stage === null) return;
    const { left, top } = labelPosition({
      hitBox,
      placement,
      shift,
      label: { width: label.offsetWidth, height: label.offsetHeight },
      stage,
    });
    label.style.left = `${String(left)}px`;
    label.style.top = `${String(top)}px`;
  }, [hitBox, placement, shift, stage, name, content]);

  const states = isPinned ? LABEL_PINNED_STATES : LABEL_STATES;
  return (
    <div
      ref={element}
      aria-hidden="true"
      data-testid="scene-label"
      data-visible={isVisible}
      className={states[isVisible ? "visible" : "hidden"]}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <span className={LABEL_NAME}>{name}</span>
      <span className={LABEL_CONTENT}>{content}</span>
    </div>
  );
}
