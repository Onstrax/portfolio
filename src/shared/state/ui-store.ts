import { create } from "zustand";

import type { UiStore } from "@/shared/contracts/state";

/** Interface state that lives only in memory. */
export const useUiStore = create<UiStore>()((set) => ({
  settingsOpen: false,
  openSettings: () => {
    set({ settingsOpen: true });
  },
  closeSettings: () => {
    set({ settingsOpen: false });
  },
  toggleSettings: () => {
    set((state) => ({ settingsOpen: !state.settingsOpen }));
  },
}));
