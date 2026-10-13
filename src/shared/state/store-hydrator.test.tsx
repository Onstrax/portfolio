import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  window.localStorage.setItem(
    "portfolio:v1:prefs",
    '{"soundEnabled":true,"sceneVariant":"sketch","locale":"en"}',
  );
  window.sessionStorage.setItem("portfolio:v1:session", '{"bootSeen":true,"visited":["cpu","io"]}');
});

afterEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe("StoreHydrator", () => {
  it("TSC-AC13: stores keep their defaults until the hydrator mounts, then take the stored values", async () => {
    const { usePrefsStore } = await import("./prefs-store");
    const { useSessionStore } = await import("./session-store");
    const { StoreHydrator } = await import("./store-hydrator");

    expect(usePrefsStore.getState()).toMatchObject({
      soundEnabled: false,
      sceneVariant: "photo",
      hasHydrated: false,
    });
    expect(usePrefsStore.getState().locale).toBeUndefined();
    expect(useSessionStore.getState()).toMatchObject({
      bootSeen: false,
      visited: [],
      hasHydrated: false,
    });

    const { container } = render(<StoreHydrator />);

    expect(container).toBeEmptyDOMElement();
    expect(usePrefsStore.getState()).toMatchObject({
      soundEnabled: true,
      sceneVariant: "sketch",
      locale: "en",
      hasHydrated: true,
    });
    expect(useSessionStore.getState()).toMatchObject({
      bootSeen: true,
      visited: ["cpu", "io"],
      hasHydrated: true,
    });
  });

  it("TSC-AC13: hydrates with the defaults when storage holds unusable data", async () => {
    window.localStorage.setItem("portfolio:v1:prefs", "not json");
    window.sessionStorage.setItem("portfolio:v1:session", "[]");
    const { usePrefsStore } = await import("./prefs-store");
    const { useSessionStore } = await import("./session-store");
    const { StoreHydrator } = await import("./store-hydrator");

    render(<StoreHydrator />);

    expect(usePrefsStore.getState()).toMatchObject({
      soundEnabled: false,
      sceneVariant: "photo",
      hasHydrated: true,
    });
    expect(useSessionStore.getState()).toMatchObject({
      bootSeen: false,
      visited: [],
      hasHydrated: true,
    });
  });
});
