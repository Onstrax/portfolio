import type { CSSProperties } from "react";

import { SCENE_ASSETS } from "@/shared/assets/manifest.generated";
import { SCENE_VARIANTS, type SceneVariant } from "@/shared/contracts/assets";
import { cn } from "@/shared/lib/cn";

import { STAGE_BOX, STAGE_VIEWPORT } from "@/shared/ui/stage.styles";

type PosterStyle = CSSProperties & Readonly<Record<`--poster-${string}`, string>>;

/** Only the poster of the variant written on `<html>` is shown (SYS-R50). */
const VISIBLE_WITH: Readonly<Record<SceneVariant, string>> = {
  photo: "scene-photo:block scene-sketch:hidden",
  sketch: "hidden scene-sketch:block",
};

function posterStyle(variant: SceneVariant): PosterStyle {
  const { color, dataUrl } = SCENE_ASSETS[variant].placeholder;
  return { "--poster-color": color, "--poster-image": `url("${dataUrl}")` };
}

/**
 * What the scene looks like before its image arrives: the backdrop and, on the stage, the average
 * color and the blurred placeholder of the variant. It is static HTML and requests no file
 * (SCN-R04).
 */
export function ScenePoster() {
  return (
    <div
      aria-hidden="true"
      data-testid="scene-poster"
      className={cn(STAGE_VIEWPORT, "bg-(--scene-backdrop)")}
    >
      {SCENE_VARIANTS.map((variant) => (
        <div
          key={variant}
          data-variant={variant}
          style={posterStyle(variant)}
          className={cn(
            STAGE_BOX,
            "col-start-1 row-start-1 bg-(--poster-color) bg-(image:--poster-image) bg-cover",
            VISIBLE_WITH[variant],
          )}
        />
      ))}
    </div>
  );
}
