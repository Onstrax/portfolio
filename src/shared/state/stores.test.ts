import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const writes: { readonly area: string; readonly key: string; readonly value: string }[] = [];

function recordingStorage(area: string) {
  return {
    getItem: () => null,
    setItem: (key: string, value: string) => {
      writes.push({ area, key, value });
    },
  };
}

async function loadStores() {
  const prefs = await import("./prefs-store");
  const session = await import("./session-store");
  const ui = await import("./ui-store");
  return {
    prefs: prefs.usePrefsStore,
    session: session.useSessionStore,
    ui: ui.useUiStore,
  };
}

beforeEach(() => {
  writes.length = 0;
  vi.resetModules();
  vi.stubGlobal("window", {
    localStorage: recordingStorage("local"),
    sessionStorage: recordingStorage("session"),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("preferences store", () => {
  it("starts with the defaults and not hydrated", async () => {
    const { prefs } = await loadStores();
    expect(prefs.getState()).toMatchObject({
      soundEnabled: false,
      sceneVariant: "photo",
      hasHydrated: false,
    });
    expect(prefs.getState().locale).toBeUndefined();
  });

  it("TSC-AC12: every action updates the store and writes the preferences at once", async () => {
    const { prefs } = await loadStores();

    prefs.getState().setLocale("en");
    prefs.getState().setSoundEnabled(true);
    prefs.getState().setSceneVariant("sketch");

    expect(prefs.getState()).toMatchObject({
      locale: "en",
      soundEnabled: true,
      sceneVariant: "sketch",
    });
    expect(writes).toEqual([
      {
        area: "local",
        key: "portfolio:v1:prefs",
        value: '{"soundEnabled":false,"sceneVariant":"photo","locale":"en"}',
      },
      {
        area: "local",
        key: "portfolio:v1:prefs",
        value: '{"soundEnabled":true,"sceneVariant":"photo","locale":"en"}',
      },
      {
        area: "local",
        key: "portfolio:v1:prefs",
        value: '{"soundEnabled":true,"sceneVariant":"sketch","locale":"en"}',
      },
    ]);
  });
});

describe("session store", () => {
  it("TSC-AC12: markBootSeen and reset write the session at once", async () => {
    const { session } = await loadStores();

    session.getState().markBootSeen();
    expect(session.getState().bootSeen).toBe(true);
    session.getState().markVisited("cpu");
    session.getState().reset();

    expect(session.getState()).toMatchObject({ bootSeen: false, visited: [] });
    expect(writes.map((write) => write.value)).toEqual([
      '{"bootSeen":true,"visited":[]}',
      '{"bootSeen":true,"visited":["cpu"]}',
      '{"bootSeen":false,"visited":[]}',
    ]);
    expect(writes.every((write) => write.area === "session")).toBe(true);
    expect(writes.every((write) => write.key === "portfolio:v1:session")).toBe(true);
  });

  it("TSC-AC12: markVisited appends new components in order and does not write a repeated one", async () => {
    const { session } = await loadStores();

    session.getState().markVisited("ssd");
    session.getState().markVisited("cpu");
    session.getState().markVisited("ssd");

    expect(session.getState().visited).toEqual(["ssd", "cpu"]);
    expect(writes).toHaveLength(2);
  });
});

describe("interface store", () => {
  it("TSC-AC12: opens, closes and toggles the settings menu without writing anything", async () => {
    const { ui } = await loadStores();
    expect(ui.getState().settingsOpen).toBe(false);

    ui.getState().openSettings();
    expect(ui.getState().settingsOpen).toBe(true);
    ui.getState().closeSettings();
    expect(ui.getState().settingsOpen).toBe(false);
    ui.getState().toggleSettings();
    expect(ui.getState().settingsOpen).toBe(true);
    ui.getState().toggleSettings();
    expect(ui.getState().settingsOpen).toBe(false);

    expect(writes).toEqual([]);
  });
});
