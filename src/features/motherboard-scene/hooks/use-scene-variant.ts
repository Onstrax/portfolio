import { useLayoutEffect, useState } from "react";

import {
  DEFAULT_SCENE_VARIANT,
  isSceneVariant,
  type SceneVariant,
} from "@/shared/contracts/assets";
import { usePrefsStore } from "@/shared/state/prefs-store";

/** Variant that the pre-paint script wrote on `<html>` (SYS-R51). */
function readDocumentVariant(): SceneVariant {
  const value = document.documentElement.dataset["scene"];
  return isSceneVariant(value) ? value : DEFAULT_SCENE_VARIANT;
}

/**
 * Active variant of the scene: the stored preference or, until the store has loaded it, the one
 * that the pre-paint script resolved (SCN-R42). Keeps `data-scene` in step with it, so that the
 * colors of the variant follow the image (SCN-R43).
 */
export function useSceneVariant(): SceneVariant {
  const stored = usePrefsStore((state) => state.sceneVariant);
  const hasHydrated = usePrefsStore((state) => state.hasHydrated);
  const [initial] = useState(readDocumentVariant);
  const variant = hasHydrated ? stored : initial;

  useLayoutEffect(() => {
    document.documentElement.dataset["scene"] = variant;
  }, [variant]);

  return variant;
}
