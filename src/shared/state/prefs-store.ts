import { create } from "zustand";

import { DEFAULT_PREFS, type PrefsStore, STORAGE_KEYS } from "@/shared/contracts/state";

import { serializePrefs } from "./persistence";
import { writeStorage } from "./safe-storage";

/** Preferences kept between visits: preferred language, sound and scene image (SYS §4.6). */
export const usePrefsStore = create<PrefsStore>()((set, get) => {
  const persist = (): void => {
    writeStorage("local", STORAGE_KEYS.prefs, serializePrefs(get()));
  };
  return {
    ...DEFAULT_PREFS,
    hasHydrated: false,
    setLocale: (locale) => {
      set({ locale });
      persist();
    },
    setSoundEnabled: (soundEnabled) => {
      set({ soundEnabled });
      persist();
    },
    setSceneVariant: (sceneVariant) => {
      set({ sceneVariant });
      persist();
    },
  };
});
