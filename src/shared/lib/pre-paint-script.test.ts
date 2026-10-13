import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

import { SCENE_ASSETS } from "@/shared/assets/manifest.generated";

import { APP_START_TIMEOUT_MS, buildPrePaintScript } from "./pre-paint-script";

interface Browser {
  /** Whether the viewport matches the query of the scene. */
  readonly sceneCapable?: boolean;
  readonly mediaThrows?: boolean;
  readonly stored?: string | null;
  readonly storageThrows?: boolean;
  /** Path of the page. The home in Spanish when omitted. */
  readonly pathname?: string;
  readonly reducedMotion?: boolean;
  /** Content of the session storage. */
  readonly session?: string | null;
}

interface Timer {
  readonly callback: () => void;
  readonly delay: number;
}

interface Outcome {
  /** Fires an event on the fake window, as the browser would. */
  readonly fire: (type: string, event?: { readonly key?: string }) => void;
  readonly attributes: Map<string, string>;
  readonly links: readonly Readonly<Record<string, string>>[];
  readonly timers: readonly Timer[];
  readonly queries: readonly string[];
}

/** Runs the script in a fake browser and returns what it did to the document. */
function run(browser: Browser): Outcome {
  const attributes = new Map<string, string>();
  const links: Record<string, string>[] = [];
  const timers: Timer[] = [];
  const queries: string[] = [];
  const listeners = new Map<string, Set<(event: object) => void>>();
  const fire = (type: string, event: { readonly key?: string } = {}): void => {
    for (const listener of [...(listeners.get(type) ?? [])]) listener({ type, ...event });
  };
  runInNewContext(buildPrePaintScript(SCENE_ASSETS), {
    document: {
      documentElement: {
        setAttribute: (name: string, value: string) => attributes.set(name, value),
        getAttribute: (name: string) => attributes.get(name) ?? null,
      },
      createElement: (tag: string) => {
        const element: Record<string, string> = { tag };
        return {
          element,
          setAttribute: (name: string, value: string) => {
            element[name] = value;
          },
        };
      },
      head: {
        appendChild: (node: { readonly element: Record<string, string> }) => {
          links.push(node.element);
        },
      },
    },
    matchMedia: (query: string) => {
      if (browser.mediaThrows === true) throw new Error("unsupported");
      if (query === "(prefers-reduced-motion: reduce)") {
        return { matches: browser.reducedMotion === true };
      }
      queries.push(query);
      return { matches: browser.sceneCapable === true };
    },
    location: { pathname: browser.pathname ?? "/es/" },
    sessionStorage: {
      getItem: (key: string) => {
        if (browser.storageThrows === true) throw new Error("denied");
        return key === "portfolio:v1:session" ? (browser.session ?? null) : null;
      },
    },
    localStorage: {
      getItem: (key: string) => {
        if (browser.storageThrows === true) throw new Error("denied");
        return key === "portfolio:v1:prefs" ? (browser.stored ?? null) : null;
      },
    },
    setTimeout: (callback: () => void, delay: number) => {
      timers.push({ callback, delay });
    },
    addEventListener: (type: string, listener: (event: object) => void) => {
      listeners.set(type, (listeners.get(type) ?? new Set()).add(listener));
    },
    removeEventListener: (type: string, listener: (event: object) => void) => {
      listeners.get(type)?.delete(listener);
    },
  });
  return { fire, attributes, links, timers, queries };
}

const SKETCH_PREFS = '{"soundEnabled":false,"sceneVariant":"sketch"}';

describe("pre-paint script", () => {
  it("SYS-AC05: writes the scene mode when the viewport matches the query, simple otherwise", () => {
    const capable = run({ sceneCapable: true });
    expect(capable.attributes.get("data-mode")).toBe("scene");
    expect(capable.queries).toEqual(["(min-width: 1024px) and (min-height: 600px)"]);

    expect(run({ sceneCapable: false }).attributes.get("data-mode")).toBe("simple");
    expect(run({ mediaThrows: true }).attributes.get("data-mode")).toBe("simple");
  });

  const boot = (browser: Browser) => run(browser).attributes.get("data-boot");

  it("BOOT-AC05: plays the boot sequence on a first visit to a home page in scene mode", () => {
    expect(boot({ sceneCapable: true, pathname: "/es/" })).toBe("play");
    expect(boot({ sceneCapable: true, pathname: "/en/" })).toBe("play");
    expect(boot({ sceneCapable: true, session: '{"bootSeen":false,"visited":["cpu"]}' })).toBe(
      "play",
    );
  });

  it("BOOT-AC07: does not play it again in the same session", () => {
    expect(boot({ sceneCapable: true, session: '{"bootSeen":true,"visited":[]}' })).toBe("done");
  });

  it("BOOT-AC07: does not play it on the URL of a section, on the cv page or in simple mode", () => {
    expect(boot({ sceneCapable: true, pathname: "/es/projects/" })).toBe("done");
    expect(boot({ sceneCapable: true, pathname: "/es/cv/" })).toBe("done");
    expect(boot({ sceneCapable: true, pathname: "/" })).toBe("done");
    expect(boot({ sceneCapable: false, pathname: "/es/" })).toBe("done");
  });

  it("BOOT-AC07: does not play it with reduced motion", () => {
    expect(boot({ sceneCapable: true, reducedMotion: true })).toBe("done");
  });

  it("BOOT-AC06: notes a key or a pointer press that arrives before the application, once", () => {
    const byKey = run({ sceneCapable: true });
    expect(byKey.attributes.has("data-boot-skip")).toBe(false);
    byKey.fire("keydown", { key: "a" });
    expect(byKey.attributes.get("data-boot-skip")).toBe("");

    // The note is taken once: a later press must not skip a replay that has not been asked for.
    byKey.attributes.delete("data-boot-skip");
    byKey.fire("keydown", { key: "b" });
    byKey.fire("pointerdown");
    expect(byKey.attributes.has("data-boot-skip")).toBe(false);

    const byPointer = run({ sceneCapable: true });
    byPointer.fire("pointerdown");
    expect(byPointer.attributes.get("data-boot-skip")).toBe("");
  });

  it("BOOT-AC06, BOOT-AC09: does not note Tab nor a modifier pressed alone", () => {
    const outcome = run({ sceneCapable: true });
    for (const key of ["Tab", "Shift", "Control", "Alt", "AltGraph", "Meta"]) {
      outcome.fire("keydown", { key });
    }
    expect(outcome.attributes.has("data-boot-skip")).toBe(false);
    outcome.fire("keydown", { key: "Enter" });
    expect(outcome.attributes.has("data-boot-skip")).toBe(true);
  });

  it("listens for nothing when the boot sequence does not play", () => {
    const outcome = run({ sceneCapable: true, session: '{"bootSeen":true,"visited":[]}' });
    outcome.fire("keydown", { key: "a" });
    outcome.fire("pointerdown");
    expect(outcome.attributes.has("data-boot-skip")).toBe(false);
  });

  it("plays it when the session storage holds nothing usable or cannot be read", () => {
    for (const session of ["not json", "[]", '{"bootSeen":"yes"}', "3"]) {
      expect(boot({ sceneCapable: true, session }), session).toBe("play");
    }
    expect(boot({ sceneCapable: true, storageThrows: true })).toBe("play");
  });

  it("SYS-AC20: writes the stored scene variant, and the photograph when there is none", () => {
    expect(run({ sceneCapable: true }).attributes.get("data-scene")).toBe("photo");
    expect(run({ sceneCapable: true, stored: SKETCH_PREFS }).attributes.get("data-scene")).toBe(
      "sketch",
    );
    expect(run({ sceneCapable: false, stored: SKETCH_PREFS }).attributes.get("data-scene")).toBe(
      "sketch",
    );
  });

  it("ignores a stored value that is not a scene variant", () => {
    for (const stored of [
      '{"sceneVariant":"blueprint"}',
      '{"sceneVariant":3}',
      '{"sceneVariant":["sketch"]}',
      "not json",
      "[]",
      "3",
      '"sketch"',
    ]) {
      expect(run({ sceneCapable: true, stored }).attributes.get("data-scene"), stored).toBe(
        "photo",
      );
    }
  });

  it("SYS-AC10: uses the photograph when storage throws", () => {
    const outcome = run({ sceneCapable: true, storageThrows: true });
    expect(outcome.attributes.get("data-scene")).toBe("photo");
    expect(outcome.attributes.get("data-mode")).toBe("scene");
    expect(outcome.links).toHaveLength(1);
  });

  it("SYS-AC20: in scene mode preloads the AVIF image of the active variant, and only that one", () => {
    const [photo, ...others] = run({ sceneCapable: true }).links;
    expect(others).toEqual([]);
    expect(photo).toEqual({
      tag: "link",
      rel: "preload",
      as: "image",
      type: "image/avif",
      fetchpriority: "high",
      imagesrcset: [
        "/scene/scene-1920.dc169b385cc7.avif 1920w",
        "/scene/scene-2560.dc169b385cc7.avif 2560w",
        "/scene/scene-3840.dc169b385cc7.avif 3840w",
      ].join(", "),
      imagesizes: "min(100vw, 177.78vh)",
    });

    const [sketch] = run({ sceneCapable: true, stored: SKETCH_PREFS }).links;
    expect(sketch?.["imagesrcset"]).toContain("/scene/scene-1920.b71cba0939ff.avif 1920w");
    expect(sketch?.["imagesrcset"]).not.toContain("dc169b385cc7");
  });

  it("in simple mode requests no image and schedules nothing", () => {
    const outcome = run({ sceneCapable: false, stored: SKETCH_PREFS });
    expect(outcome.links).toEqual([]);
    expect(outcome.timers).toEqual([]);
  });

  it("QLT-AC14: falls back to the simple view when the application has not started in 5 s", () => {
    const { attributes, timers } = run({ sceneCapable: true });
    expect(timers.map((timer) => timer.delay)).toEqual([5000]);
    expect(APP_START_TIMEOUT_MS).toBe(5000);

    timers[0]?.callback();
    expect(attributes.get("data-mode")).toBe("simple");
  });

  it("QLT-AC14: keeps the scene when the application started in time", () => {
    const { attributes, timers } = run({ sceneCapable: true });
    attributes.set("data-app", "ready");

    timers[0]?.callback();
    expect(attributes.get("data-mode")).toBe("scene");
  });

  it("is a single self-contained expression, so that its hash is stable", () => {
    const script = buildPrePaintScript(SCENE_ASSETS);
    expect(script.startsWith("(function(){")).toBe(true);
    expect(script.endsWith("})();")).toBe(true);
    expect(script).toBe(buildPrePaintScript(SCENE_ASSETS));
    expect(script).not.toContain("</");
  });
});
