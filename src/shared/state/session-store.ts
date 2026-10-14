import { create } from "zustand";

import { DEFAULT_SESSION, type SessionStore, STORAGE_KEYS } from "@/shared/contracts/state";

import { serializeSession } from "./persistence";
import { writeStorage } from "./safe-storage";

/** State that lasts as long as the browser tab: boot sequence seen, visited sections and welcome. */
export const useSessionStore = create<SessionStore>()((set, get) => {
  const persist = (): void => {
    writeStorage("session", STORAGE_KEYS.session, serializeSession(get()));
  };
  return {
    ...DEFAULT_SESSION,
    hasHydrated: false,
    markBootSeen: () => {
      set({ bootSeen: true });
      persist();
    },
    markVisited: (id) => {
      const { visited } = get();
      if (visited.includes(id)) return;
      set({ visited: [...visited, id] });
      persist();
    },
    markWelcomeSeen: () => {
      if (get().welcomeSeen) return;
      set({ welcomeSeen: true });
      persist();
    },
    reset: () => {
      set({ ...DEFAULT_SESSION });
      persist();
    },
  };
});
