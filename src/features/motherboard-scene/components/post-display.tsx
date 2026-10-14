import { useState } from "react";

import {
  DISPLAY_OFF_OPACITY,
  displayBacking,
  displayLayout,
  litSegments,
  SEGMENT_NAMES,
  twoDigits,
} from "../lib/seven-segment";
import type { SceneBox } from "../types";

interface PostDisplayProps {
  /** Box of the display in the image, in scene units. */
  readonly box: SceneBox;
  /** Number of primary sections visited in the session. */
  readonly count: number;
}

/**
 * The two seven-segment digits drawn over the diagnostic display of the board (SCN-R29), on a
 * background that only the sketch variant paints. The digits brighten up when the value changes,
 * not when they are first drawn (M-09).
 */
export function PostDisplay({ box, count }: PostDisplayProps) {
  const [shown, setShown] = useState(count);
  const [changes, setChanges] = useState(0);
  if (shown !== count) {
    setShown(count);
    setChanges(changes + 1);
  }
  const digits = twoDigits(count);
  const backing = displayBacking(box);

  return (
    <g data-testid="post-display" data-value={digits.join("")}>
      {/* The sketch draws the outline of the segments: there, a background hides them. */}
      <rect
        data-part="backing"
        x={backing.left}
        y={backing.top}
        width={backing.right - backing.left}
        height={backing.bottom - backing.top}
        className="fill-(--scene-display-back)"
      />
      {displayLayout(box).map((segments, position) => {
        const lit = litSegments(digits[position] ?? 0);
        return (
          <g
            key={`${String(position)}-${String(changes)}`}
            className={changes > 0 ? "display-change" : undefined}
          >
            {SEGMENT_NAMES.map((name) => {
              const segment = segments[name];
              return (
                <rect
                  key={name}
                  data-segment={name}
                  data-lit={lit.includes(name)}
                  x={segment.left}
                  y={segment.top}
                  width={segment.right - segment.left}
                  height={segment.bottom - segment.top}
                  opacity={lit.includes(name) ? 1 : DISPLAY_OFF_OPACITY}
                  className="fill-(--scene-display)"
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
}
