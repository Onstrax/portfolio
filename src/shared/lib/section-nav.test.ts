import { describe, expect, it } from "vitest";

import { COMPONENT_IDS, SECTION_BY_COMPONENT } from "@/shared/contracts/ids";
import type { AnySectionDefinition } from "@/shared/contracts/section";

import { buildSectionNav } from "./section-nav";

const SECTIONS: readonly AnySectionDefinition[] = COMPONENT_IDS.map((componentId) => ({
  componentId,
  slug: SECTION_BY_COMPONENT[componentId],
  facts: null,
  text: {
    es: {
      meta: {
        title: `Título ${componentId}`,
        hardwareName: `Pieza ${componentId}`,
        description: "",
      },
    },
    en: {
      meta: {
        title: `Title ${componentId}`,
        hardwareName: `Piece ${componentId}`,
        description: "",
      },
    },
  },
  bootLines: [],
  Section: () => null,
}));

describe("buildSectionNav", () => {
  it("SCN-AC01: returns the seven sections in canonical order with their path in each language", () => {
    expect(buildSectionNav(SECTIONS, "es").map((item) => item.href)).toEqual([
      "/es/profile/",
      "/es/experience/",
      "/es/projects/",
      "/es/stack/",
      "/es/contact/",
      "/es/ecosystem/",
      "/es/about/",
    ]);
    expect(buildSectionNav(SECTIONS, "en").map((item) => item.href)).toEqual([
      "/en/profile/",
      "/en/experience/",
      "/en/projects/",
      "/en/stack/",
      "/en/contact/",
      "/en/ecosystem/",
      "/en/about/",
    ]);
  });

  it("SCN-AC01: takes the title and the hardware name from the texts of the language", () => {
    const [first] = buildSectionNav(SECTIONS, "es");
    expect(first).toEqual({
      slug: "profile",
      componentId: "cpu",
      title: "Título cpu",
      hardwareName: "Pieza cpu",
      href: "/es/profile/",
      isPrimary: true,
    });
    expect(buildSectionNav(SECTIONS, "en")[2]).toMatchObject({
      slug: "projects",
      componentId: "ssd",
      title: "Title ssd",
      hardwareName: "Piece ssd",
    });
  });

  it("SCN-AC01: marks only the first six sections as primary", () => {
    expect(buildSectionNav(SECTIONS, "en").map((item) => item.isPrimary)).toEqual([
      true,
      true,
      true,
      true,
      true,
      true,
      false,
    ]);
  });

  it("keeps the order it receives", () => {
    const reversed = [...SECTIONS].reverse();
    expect(buildSectionNav(reversed, "en")[0]?.slug).toBe("about");
  });
});
