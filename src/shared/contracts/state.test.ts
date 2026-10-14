import { describe, expect, it } from "vitest";

import { DEFAULT_PREFS, DEFAULT_SESSION, STORAGE_KEYS } from "./state";

describe("state contract", () => {
  it("uses the storage keys of SYS §4.6", () => {
    expect(STORAGE_KEYS).toEqual({ prefs: "portfolio:v1:prefs", session: "portfolio:v1:session" });
  });

  it("starts with sound off, the photograph and no preferred language", () => {
    expect(DEFAULT_PREFS).toEqual({ soundEnabled: false, sceneVariant: "photo" });
  });

  it("starts a session with the boot sequence and the welcome unseen and no visited sections", () => {
    expect(DEFAULT_SESSION).toEqual({ bootSeen: false, visited: [], welcomeSeen: false });
  });
});
