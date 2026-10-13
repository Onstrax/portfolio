"use client";

import { useEffect } from "react";

import { STORAGE_KEYS } from "@/shared/contracts/state";

import { parsePrefs, parseSession } from "./persistence";
import { usePrefsStore } from "./prefs-store";
import { readStorage } from "./safe-storage";
import { useSessionStore } from "./session-store";

/**
 * Loads the stored values into the stores after hydration, so that the server HTML never depends
 * on them (SYS-R26). Renders nothing. The locale layout mounts it once (TSC-R52).
 */
export function StoreHydrator() {
  useEffect(() => {
    usePrefsStore.setState({
      ...parsePrefs(readStorage("local", STORAGE_KEYS.prefs)),
      hasHydrated: true,
    });
    useSessionStore.setState({
      ...parseSession(readStorage("session", STORAGE_KEYS.session)),
      hasHydrated: true,
    });
  }, []);

  return null;
}
