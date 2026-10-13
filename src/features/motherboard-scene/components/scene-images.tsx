import { useState } from "react";

import type { SceneVariant } from "@/shared/contracts/assets";

import type { ImageState } from "./scene.styles";
import { SceneImage } from "./scene-image";

interface SceneImagesProps {
  /** Active variant. */
  readonly variant: SceneVariant;
  /** Called when the image of a variant has been decoded. */
  readonly onReady: (variant: SceneVariant) => void;
}

/**
 * Bottom layer of the stage. It only requests the image of a variant once that variant is active,
 * and keeps showing the previous one until the new one is decoded (SCN-R43).
 */
export function SceneImages({ variant, onReady }: SceneImagesProps) {
  const [requested, setRequested] = useState<readonly SceneVariant[]>([variant]);
  const [decoded, setDecoded] = useState<readonly SceneVariant[]>([]);
  if (!requested.includes(variant)) setRequested([...requested, variant]);

  const isActiveDecoded = decoded.includes(variant);
  const stateOf = (candidate: SceneVariant): ImageState => {
    if (candidate === variant) return isActiveDecoded ? "shown" : "pending";
    return isActiveDecoded ? "replaced" : "kept";
  };
  const handleReady = (ready: SceneVariant): void => {
    setDecoded((current) => (current.includes(ready) ? current : [...current, ready]));
    onReady(ready);
  };

  return (
    <div className="pointer-events-none absolute inset-0 isolate">
      {requested.map((candidate) => (
        <SceneImage
          key={candidate}
          variant={candidate}
          state={stateOf(candidate)}
          onReady={handleReady}
        />
      ))}
    </div>
  );
}
