import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { SECTION_SLUGS } from "@/shared/contracts/ids";
import { findContentIssues, formatContentIssues } from "@/shared/lib/content-integrity";

import { getSection, PRIMARY_SECTION_LIST, SECTION_LIST, SECTIONS } from "./registry";

const PUBLIC_DIR = fileURLToPath(new URL("../../public", import.meta.url));

/** Exceptions to rules C4 and C5: path of the data and the reason (TSC-R46). None so far. */
const CONTENT_EXCEPTIONS: readonly { readonly path: string; readonly reason: string }[] = [];

/** Every string of the facts that is a path of a file served by the site. */
function sitePaths(value: unknown): readonly string[] {
  if (typeof value === "string") return value.startsWith("/") ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(sitePaths);
  if (typeof value === "object" && value !== null) return Object.values(value).flatMap(sitePaths);
  return [];
}

describe("section registry", () => {
  it("TSC-AC07: lists the seven sections in canonical order and the six primary ones", () => {
    expect(SECTION_LIST.map((section) => section.slug)).toEqual([...SECTION_SLUGS]);
    expect(SECTION_LIST).toHaveLength(7);
    expect(PRIMARY_SECTION_LIST).toEqual(SECTION_LIST.slice(0, 6));
  });

  it("TSC-AC07: gives every section its own component and finds it by its slug", () => {
    const components = SECTION_LIST.map((section) => section.componentId);
    expect(new Set(components).size).toBe(7);
    expect(components).toEqual(["cpu", "psu", "ssd", "ram", "io", "fan", "cmos"]);
    for (const slug of SECTION_SLUGS) {
      expect(getSection(slug).slug).toBe(slug);
      expect(getSection(slug)).toBe(SECTIONS[slug]);
    }
  });

  it("TSC-AC08: the content of every section passes the integrity rules", () => {
    const issues = findContentIssues(SECTION_LIST).filter(
      (issue) => !CONTENT_EXCEPTIONS.some((exception) => exception.path === issue.path),
    );
    expect(formatContentIssues(issues)).toBe("");
  });

  it("VSN-AC07: both languages have the same content keys and the same number of elements", () => {
    const shapeIssues = findContentIssues(SECTION_LIST).filter((issue) => issue.rule === "C1");
    expect(formatContentIssues(shapeIssues)).toBe("");
  });

  it("TSC-AC10: every site path in the facts is a file that exists in public", () => {
    const paths = SECTION_LIST.flatMap((section) => sitePaths(section.facts));
    for (const path of paths) {
      expect(existsSync(`${PUBLIC_DIR}${path}`), path).toBe(true);
    }
    expect(existsSync(`${PUBLIC_DIR}/cv`)).toBe(true);
  });

  it("the boot lines of the sections fit the limits of the boot log", () => {
    const counts = SECTION_LIST.map((section) => section.bootLines.length);
    expect(counts.every((count) => count === 1 || count === 2)).toBe(true);
    for (const line of SECTION_LIST.flatMap((section) => section.bootLines)) {
      expect(line.message.length, line.message).toBeLessThanOrEqual(72);
    }
  });
});
