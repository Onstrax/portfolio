import { describe, expect, it } from "vitest";

import { isRecord, readJson, readRepoFile } from "./files";

const manifest = readJson("package.json");

function manifestField(group: string, name: string): unknown {
  if (!isRecord(manifest)) return undefined;
  const value = manifest[group];
  return isRecord(value) ? value[name] : undefined;
}

describe("container environment", () => {
  const dockerfile = readRepoFile("Dockerfile");
  const compose = readRepoFile("compose.yaml");

  it("TST-AC16: the image is the Playwright image of the installed version, with the project pnpm", () => {
    const playwright = String(manifestField("devDependencies", "@playwright/test"));
    const packageManager = isRecord(manifest) ? String(manifest["packageManager"]) : "";

    expect(dockerfile).toContain(`FROM mcr.microsoft.com/playwright:v${playwright}-noble\n`);
    expect(dockerfile).toContain(`RUN npm install --global ${packageManager}\n`);
    expect(dockerfile).not.toMatch(/^\s*(?:COPY|ADD)\b/m);
  });

  it("TST-AC16: the check service mounts the repository and runs the full gate", () => {
    expect(compose).toMatch(/^ {2}check:\n/m);
    expect(compose).toContain("      - .:/work\n");
    expect(compose).toContain("      NEXT_PUBLIC_SITE_URL: http://localhost:4173\n");
    expect(compose).toContain('      pnpm_config_verify_deps_before_run: "false"\n');
    expect(compose).toContain("    command: pnpm check\n");
    expect(manifestField("scripts", "check:docker")).toBe(
      "docker compose run --rm --user $(id -u):$(id -g) check",
    );
    expect(readRepoFile(".dockerignore").split("\n")).toContain("*");
  });
});
