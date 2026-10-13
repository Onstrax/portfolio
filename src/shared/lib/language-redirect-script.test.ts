import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

import { buildLanguageRedirectScript } from "./language-redirect-script";

interface Browser {
  readonly languages?: readonly string[];
  readonly language?: string;
  readonly stored?: string | null;
  readonly storageThrows?: boolean;
}

/** Runs the script in a fake browser and returns the path it redirected to. */
function redirect(browser: Browser): string | undefined {
  let destination: string | undefined;
  runInNewContext(buildLanguageRedirectScript(), {
    navigator: { languages: browser.languages, language: browser.language },
    localStorage: {
      getItem: (key: string) => {
        if (browser.storageThrows === true) throw new Error("denied");
        return key === "portfolio:v1:prefs" ? (browser.stored ?? null) : null;
      },
    },
    location: {
      replace: (path: string) => {
        destination = path;
      },
    },
  });
  return destination;
}

describe("language redirect script", () => {
  it("SYS-AC04: sends a Spanish browser to the Spanish home", () => {
    expect(redirect({ languages: ["es-CO"] })).toBe("/es/");
    expect(redirect({ languages: ["en-US", "es"] })).toBe("/es/");
  });

  it("SYS-AC04: sends any other browser to the English home", () => {
    expect(redirect({ languages: ["de-DE"] })).toBe("/en/");
    expect(redirect({ languages: ["en-US"] })).toBe("/en/");
    expect(redirect({ languages: [] })).toBe("/en/");
  });

  it("SYS-AC04: prefers the stored language over the browser", () => {
    const stored = '{"soundEnabled":false,"sceneVariant":"photo","locale":"es"}';
    expect(redirect({ languages: ["en-US"], stored })).toBe("/es/");
    expect(redirect({ languages: ["es-CO"], stored: stored.replace('"es"', '"en"') })).toBe("/en/");
  });

  it("ignores a stored value that is not a language of the site", () => {
    for (const stored of [
      '{"locale":"de"}',
      '{"locale":"constructor"}',
      '{"locale":3}',
      "not json",
      "[]",
    ]) {
      expect(redirect({ languages: ["es-CO"], stored }), stored).toBe("/es/");
    }
  });

  it("falls back to the browser language when storage throws", () => {
    expect(redirect({ languages: ["es-MX"], storageThrows: true })).toBe("/es/");
    expect(redirect({ languages: ["fr"], storageThrows: true })).toBe("/en/");
  });

  it("uses navigator.language when the list of languages is missing", () => {
    expect(redirect({ language: "es-ES" })).toBe("/es/");
    expect(redirect({})).toBe("/en/");
  });

  it("is a single self-contained expression, so that its hash is stable", () => {
    const script = buildLanguageRedirectScript();
    expect(script.startsWith("(function(){")).toBe(true);
    expect(script.endsWith("})();")).toBe(true);
    expect(script).toBe(buildLanguageRedirectScript());
  });
});
