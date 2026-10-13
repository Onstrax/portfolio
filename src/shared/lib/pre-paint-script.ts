import { RENDER_MODE_QUERY } from "@/shared/config/render-mode";
import { DEFAULT_SCENE_VARIANT, SCENE_VARIANTS, type SceneAssets } from "@/shared/contracts/assets";
import { STORAGE_KEYS } from "@/shared/contracts/state";

import { SCENE_IMAGE_SIZES, toSrcSet } from "./src-set";

/** Time that the application has to start before the page falls back to the simple view. */
export const APP_START_TIMEOUT_MS = 5000;

/**
 * Source of the inline script that runs in `<head>` before the first paint of the home and section
 * pages (SYS-R13, SYS-R20). It writes on `<html>`:
 *
 * - `data-mode`: `scene` when the viewport can show the scene, `simple` otherwise.
 * - `data-boot`: `done`, because there is no boot sequence to play yet.
 * - `data-scene`: the stored scene variant, if valid, or the default one (SYS-R51).
 *
 * In scene mode it also starts the download of the image of that variant (SCN-R36) and schedules
 * the fallback that shows the simple view if the application has not started in time (QLT-R43).
 * Everything it contains comes from constants of the project (QLT-R48).
 */
export function buildPrePaintScript(assets: SceneAssets): string {
  const query = JSON.stringify(RENDER_MODE_QUERY);
  const key = JSON.stringify(STORAGE_KEYS.prefs);
  const variants = JSON.stringify(SCENE_VARIANTS);
  const fallback = JSON.stringify(DEFAULT_SCENE_VARIANT);
  const srcSets = JSON.stringify(
    Object.fromEntries(
      SCENE_VARIANTS.map((variant) => [variant, toSrcSet(assets[variant].sources.avif)]),
    ),
  );
  const sizes = JSON.stringify(SCENE_IMAGE_SIZES);
  return [
    "(function(){",
    `var d=document.documentElement,m=false,v=${fallback},n=${variants};`,
    `try{m=matchMedia(${query}).matches}catch(e){}`,
    'd.setAttribute("data-mode",m?"scene":"simple");',
    'd.setAttribute("data-boot","done");',
    `try{var s=JSON.parse(localStorage.getItem(${key})||"null");`,
    "if(s&&n.indexOf(s.sceneVariant)!==-1)v=s.sceneVariant}catch(e){}",
    'd.setAttribute("data-scene",v);',
    "if(!m)return;",
    'var l=document.createElement("link");',
    'l.setAttribute("rel","preload");l.setAttribute("as","image");',
    'l.setAttribute("type","image/avif");l.setAttribute("fetchpriority","high");',
    `l.setAttribute("imagesrcset",${srcSets}[v]);l.setAttribute("imagesizes",${sizes});`,
    "document.head.appendChild(l);",
    'setTimeout(function(){if(d.getAttribute("data-app")!=="ready")',
    `d.setAttribute("data-mode","simple")},${String(APP_START_TIMEOUT_MS)})`,
    "})();",
  ].join("");
}
