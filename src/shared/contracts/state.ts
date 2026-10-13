import { DEFAULT_SCENE_VARIANT, type SceneVariant } from "./assets";
import type { PrimaryComponentId } from "./ids";
import type { Locale } from "./locale";

/** Value stored in `localStorage` under `STORAGE_KEYS.prefs`. */
export interface PersistedPrefs {
  readonly locale?: Locale;
  readonly soundEnabled: boolean;
  readonly sceneVariant: SceneVariant;
}

/** Value stored in `sessionStorage` under `STORAGE_KEYS.session`. */
export interface PersistedSession {
  readonly bootSeen: boolean;
  readonly visited: readonly PrimaryComponentId[];
}

export const STORAGE_KEYS = {
  prefs: "portfolio:v1:prefs",
  session: "portfolio:v1:session",
} as const;

export const DEFAULT_PREFS: PersistedPrefs = {
  soundEnabled: false,
  sceneVariant: DEFAULT_SCENE_VARIANT,
};
export const DEFAULT_SESSION: PersistedSession = { bootSeen: false, visited: [] };

export interface PrefsStore extends PersistedPrefs {
  readonly hasHydrated: boolean;
  readonly setLocale: (locale: Locale) => void;
  readonly setSoundEnabled: (enabled: boolean) => void;
  readonly setSceneVariant: (variant: SceneVariant) => void;
}

export interface SessionStore extends PersistedSession {
  readonly hasHydrated: boolean;
  readonly markBootSeen: () => void;
  readonly markVisited: (id: PrimaryComponentId) => void;
  readonly reset: () => void;
}

export interface UiStore {
  readonly settingsOpen: boolean;
  readonly openSettings: () => void;
  readonly closeSettings: () => void;
  readonly toggleSettings: () => void;
}
