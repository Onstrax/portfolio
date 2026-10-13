import { useSyncExternalStore } from "react";

import { RENDER_MODE_QUERY } from "@/shared/config/render-mode";
import type { RenderMode } from "@/shared/contracts/assets";

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(RENDER_MODE_QUERY);
  query.addEventListener("change", onChange);
  return () => {
    query.removeEventListener("change", onChange);
  };
}

/** Render mode that the viewport allows right now. Only for the browser. */
export function readRenderMode(): RenderMode {
  return window.matchMedia(RENDER_MODE_QUERY).matches ? "scene" : "simple";
}

function getServerSnapshot(): RenderMode {
  return "simple";
}

/**
 * Render mode that the viewport allows, kept up to date when the window is resized or the device
 * rotated (SYS-R12, SYS-R17). On the server, and until hydration ends, it is `simple`.
 */
export function useRenderMode(): RenderMode {
  return useSyncExternalStore(subscribe, readRenderMode, getServerSnapshot);
}
