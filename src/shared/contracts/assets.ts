import type { SitePath } from "./content";

/** Image variants of the scene (AST §4.10). */
export const SCENE_VARIANTS = ["photo", "sketch"] as const;
export type SceneVariant = (typeof SCENE_VARIANTS)[number];

/** Variant shown until the visitor chooses another one. */
export const DEFAULT_SCENE_VARIANT: SceneVariant = "photo";

export function isSceneVariant(value: unknown): value is SceneVariant {
  return SCENE_VARIANTS.some((variant) => variant === value);
}

/** Rectangle in scene space (AST §4.2). */
export interface SceneRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface ImageSource {
  readonly width: number;
  readonly src: SitePath;
}

export interface SceneAsset {
  readonly version: string;
  readonly provisional: boolean;
  readonly width: number;
  readonly height: number;
  readonly sceneSpace: { readonly width: 1600; readonly height: 900 };
  readonly safeArea: SceneRect;
  readonly sources: {
    readonly avif: readonly ImageSource[];
    readonly webp: readonly ImageSource[];
    readonly jpeg: readonly ImageSource[];
  };
  readonly placeholder: {
    readonly color: `#${string}`;
    readonly dataUrl: `data:image/webp;base64,${string}`;
  };
}

/** Scene manifest: one entry per variant. */
export type SceneAssets = Readonly<Record<SceneVariant, SceneAsset>>;

export type RenderMode = "scene" | "simple";
