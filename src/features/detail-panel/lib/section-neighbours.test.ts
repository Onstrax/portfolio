import { describe, expect, it } from "vitest";

import { SECTION_LIST } from "@/features/registry";
import { buildSectionNav } from "@/shared/lib/section-nav";

import { findNeighbours } from "./section-neighbours";

const sections = buildSectionNav(SECTION_LIST, "es");

describe("findNeighbours", () => {
  it("PNL-AC05: walks the seven sections in canonical order and gives each its position", () => {
    const walk = sections.map((section) => {
      const found = findNeighbours(sections, section.slug);
      return [found?.previous.slug, found?.current.slug, found?.next.slug, found?.position];
    });
    expect(walk).toEqual([
      ["about", "profile", "experience", 1],
      ["profile", "experience", "projects", 2],
      ["experience", "projects", "stack", 3],
      ["projects", "stack", "contact", 4],
      ["stack", "contact", "ecosystem", 5],
      ["contact", "ecosystem", "about", 6],
      ["ecosystem", "about", "profile", 7],
    ]);
    expect(findNeighbours(sections, "stack")?.total).toBe(7);
  });

  it("is circular: the first follows the last and the last precedes the first", () => {
    expect(findNeighbours(sections, "about")?.next.title).toBe("Perfil");
    expect(findNeighbours(sections, "profile")?.previous.title).toBe("Acerca de este sitio");
  });

  it("finds nothing for a section that is not in the list", () => {
    expect(findNeighbours([], "profile")).toBeNull();
    expect(findNeighbours(sections.slice(0, 2), "about")).toBeNull();
  });
});
