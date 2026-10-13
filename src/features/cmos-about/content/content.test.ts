import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { SITE } from "@/shared/config/site";

import { aboutEn } from "./en";
import { aboutEs } from "./es";
import { aboutFacts } from "./facts";

/** Package that provides each technology named in the stack. */
const PACKAGES: Readonly<Record<string, string>> = {
  "Next.js": "next",
  React: "react",
  TypeScript: "typescript",
  "Tailwind CSS": "tailwindcss",
  Motion: "motion",
  Zustand: "zustand",
  Vitest: "vitest",
  Playwright: "@playwright/test",
};

function installedPackages(): readonly string[] {
  const manifest: unknown = JSON.parse(
    readFileSync(fileURLToPath(new URL("../../../../package.json", import.meta.url)), "utf8"),
  );
  const groups =
    typeof manifest === "object" && manifest !== null
      ? [Reflect.get(manifest, "dependencies"), Reflect.get(manifest, "devDependencies")]
      : [];
  return groups.flatMap((group: unknown) =>
    typeof group === "object" && group !== null ? Object.keys(group) : [],
  );
}

describe("about facts", () => {
  it("CMOS-AC01: lists the stack of the spec, and every entry is a real dependency", () => {
    expect(aboutFacts.stack).toEqual([
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Motion",
      "Zustand",
      "Vitest",
      "Playwright",
    ]);
    const installed = installedPackages();
    for (const technology of aboutFacts.stack) {
      expect(installed, technology).toContain(PACKAGES[technology]);
    }
  });

  it("CMOS-AC02: links the public repository of the site", () => {
    expect(aboutFacts.repository).toEqual({ id: "repository", href: SITE.repositoryUrl });
    expect(aboutFacts.repository.href.startsWith("https://github.com/")).toBe(true);
  });
});

describe("about texts", () => {
  it("CMOS-AC03: each language has three method points and three quality claims", () => {
    for (const text of [aboutEs, aboutEn]) {
      expect(text.method).toHaveLength(3);
      expect(text.quality).toHaveLength(3);
    }
  });

  it("CMOS-AC03: uses the section and hardware names of VSN §4", () => {
    expect([aboutEs.meta.title, aboutEs.meta.hardwareName]).toEqual([
      "Acerca de este sitio",
      "Pila CMOS",
    ]);
    expect([aboutEn.meta.title, aboutEn.meta.hardwareName]).toEqual([
      "About this site",
      "CMOS battery",
    ]);
  });
});
