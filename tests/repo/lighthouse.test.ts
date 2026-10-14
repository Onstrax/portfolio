import { describe, expect, it } from "vitest";

import { readRepoFile } from "./files";

interface LighthouseConfig {
  readonly ci: {
    readonly collect: {
      readonly url: readonly string[];
      readonly numberOfRuns: number;
      readonly settings: Readonly<Record<string, unknown>>;
    };
    readonly assert: {
      readonly aggregationMethod: string;
      readonly assertions: Readonly<
        Record<string, readonly [string, Readonly<Record<string, number>>]>
      >;
    };
  };
}

function readConfig(name: string): LighthouseConfig {
  return JSON.parse(readRepoFile(name)) as LighthouseConfig;
}

const ORIGIN = "http://localhost:4173";
/** Minimum score of each category, the same in both presets (QLT-R29). */
const SCORES = {
  "categories:performance": ["error", { minScore: 0.9 }],
  "categories:accessibility": ["error", { minScore: 0.95 }],
  "categories:best-practices": ["error", { minScore: 0.95 }],
  "categories:seo": ["error", { minScore: 0.95 }],
};

describe("Lighthouse configuration", () => {
  it("TST-AC10: the desktop preset measures the scene pages against the limits of the quality bar", () => {
    const { collect, assert } = readConfig("lighthouserc.desktop.json").ci;

    expect(collect.url).toEqual([`${ORIGIN}/es/`, `${ORIGIN}/en/projects/`]);
    expect(collect.numberOfRuns).toBe(3);
    expect(collect.settings["preset"]).toBe("desktop");
    expect(assert.aggregationMethod).toBe("median");
    expect(assert.assertions).toEqual({
      ...SCORES,
      "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
      "cumulative-layout-shift": ["error", { maxNumericValue: 0.02 }],
      "total-blocking-time": ["error", { maxNumericValue: 200 }],
    });
  });

  it("TST-AC10: the mobile preset measures the simple view pages against the limits of the quality bar", () => {
    const { collect, assert } = readConfig("lighthouserc.mobile.json").ci;

    expect(collect.url).toEqual([`${ORIGIN}/es/`, `${ORIGIN}/en/cv/`]);
    expect(collect.numberOfRuns).toBe(3);
    // Mobile is the default preset of Lighthouse: none is named.
    expect(collect.settings["preset"]).toBeUndefined();
    expect(collect.settings["throttlingMethod"]).toBeUndefined();
    expect(assert.aggregationMethod).toBe("median");
    expect(assert.assertions).toEqual({
      ...SCORES,
      "cumulative-layout-shift": ["error", { maxNumericValue: 0.02 }],
      "total-blocking-time": ["error", { maxNumericValue: 350 }],
    });
  });

  it("TST-AC10: the paint of the mobile pages is measured with applied throttling, against its limit", () => {
    const { collect, assert } = readConfig("lighthouserc.mobile-lcp.json").ci;

    expect(collect.url).toEqual(readConfig("lighthouserc.mobile.json").ci.collect.url);
    expect(collect.numberOfRuns).toBe(3);
    expect(collect.settings["preset"]).toBeUndefined();
    expect(collect.settings["throttlingMethod"]).toBe("devtools");
    expect(assert.aggregationMethod).toBe("median");
    expect(assert.assertions).toEqual({
      "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
    });
  });

  it("the script runs the three configurations with the browser of Playwright", () => {
    const script = readRepoFile("scripts/run-lighthouse.mjs");
    for (const name of [
      "lighthouserc.desktop.json",
      "lighthouserc.mobile.json",
      "lighthouserc.mobile-lcp.json",
    ]) {
      expect(script).toContain(`"${name}"`);
    }
    expect(script).toContain("chromium.executablePath()");
    expect(script).toContain("CHROME_PATH");
  });
});
