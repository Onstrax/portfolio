import { useEffect, useEffectEvent, useRef } from "react";

import { SCENE_ASSETS } from "@/shared/assets/manifest.generated";
import type { SceneVariant } from "@/shared/contracts/assets";
import { SCENE_IMAGE_SIZES, toSrcSet } from "@/shared/lib/src-set";

import { IMAGE_STATES, type ImageState } from "./scene.styles";

interface SceneImageProps {
  readonly variant: SceneVariant;
  readonly state: ImageState;
  /** Called once the image can be painted without delay. */
  readonly onReady: (variant: SceneVariant) => void;
}

/** Formats of the image, from the lightest to the one that every browser decodes (AST-R37). */
const FORMATS = [
  { key: "avif", type: "image/avif" },
  { key: "webp", type: "image/webp" },
  { key: "jpeg", type: "image/jpeg" },
] as const;

/**
 * The image of one variant, in the three formats and three widths of the manifest (AST-R37). It
 * is decorative: what it shows is told by the zones drawn over it (SCN-R35, QLT-R16).
 *
 * The `<img>` has no `src`: the three formats are `<source>` elements. React sets the attributes
 * of an element before inserting it, and WebKit starts downloading the `src` of an image as soon
 * as it is set, before the image is inside its `<picture>`: with a `src`, Safari would download
 * the JPEG and then the AVIF.
 */
export function SceneImage({ variant, state, onReady }: SceneImageProps) {
  const { sources, width, height } = SCENE_ASSETS[variant];
  const image = useRef<HTMLImageElement>(null);
  const announce = useEffectEvent(() => {
    onReady(variant);
  });

  useEffect(() => {
    const element = image.current;
    if (element === null) return;
    let isMounted = true;
    const onLoad = (): void => {
      // jsdom has no decoder, and a decoding error must not leave the scene without its image.
      const decoded = typeof element.decode === "function" ? element.decode() : Promise.resolve();
      void decoded
        .catch(() => undefined)
        .then(() => {
          if (isMounted) announce();
        });
    };
    if (element.complete && element.naturalWidth > 0) onLoad();
    else element.addEventListener("load", onLoad, { once: true });
    return () => {
      isMounted = false;
      element.removeEventListener("load", onLoad);
    };
  }, []);

  return (
    <picture>
      {FORMATS.map(({ key, type }) => (
        <source key={key} type={type} srcSet={toSrcSet(sources[key])} sizes={SCENE_IMAGE_SIZES} />
      ))}
      <img
        ref={image}
        alt=""
        data-variant={variant}
        data-state={state}
        width={width}
        height={height}
        decoding="async"
        fetchPriority="high"
        draggable={false}
        className={IMAGE_STATES[state]}
      />
    </picture>
  );
}
