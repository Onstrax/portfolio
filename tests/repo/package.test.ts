import { describe, expect, it } from "vitest";

import { isRecord, readJson, readRepoFile } from "./files";

const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

/** Reads the top-level settings of pnpm-workspace.yaml; one nested level is enough for this file. */
function parseWorkspaceSettings(text: string): Readonly<Record<string, unknown>> {
  const settings: Record<string, unknown> = {};
  let nested: Record<string, string> | undefined;
  for (const line of text.split("\n")) {
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue;
    const separator = line.indexOf(":");
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (/^\s/.test(line)) {
      if (nested !== undefined) nested[key] = value;
    } else if (value === "") {
      nested = {};
      settings[key] = nested;
    } else {
      nested = undefined;
      settings[key] = value;
    }
  }
  return settings;
}

describe("package.json", () => {
  const manifest = readJson("package.json");

  it("SYS-AC03: declares every dependency with an exact version and fixes Node and pnpm", () => {
    expect(isRecord(manifest)).toBe(true);
    if (!isRecord(manifest)) return;
    const groups = [manifest["dependencies"], manifest["devDependencies"]];
    for (const group of groups) {
      expect(isRecord(group)).toBe(true);
      if (!isRecord(group)) continue;
      for (const [name, version] of Object.entries(group)) {
        expect(version, name).toMatch(EXACT_VERSION);
      }
    }
    expect(manifest["packageManager"]).toBe("pnpm@11.28.4");
    expect(manifest["engines"]).toEqual({ node: ">=24" });
  });
});

describe("pnpm-workspace.yaml", () => {
  const text = readRepoFile("pnpm-workspace.yaml");

  it("SYS-AC16: holds exactly the settings of SYS-R45 and no release-age exclusions", () => {
    expect(parseWorkspaceSettings(text)).toEqual({
      minimumReleaseAge: "10080",
      trustPolicy: "no-downgrade",
      trustPolicyIgnoreAfter: "43200",
      blockExoticSubdeps: "true",
      strictDepBuilds: "true",
      allowBuilds: { "unrs-resolver": "false" },
      saveExact: "true",
    });
    expect(text).not.toContain("minimumReleaseAgeExclude");
  });
});
