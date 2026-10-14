import { describe, expect, it } from "vitest";

import { COMPONENT_IDS, SECTION_BY_COMPONENT } from "@/shared/contracts/ids";
import type { LinkFact } from "@/shared/contracts/content";
import type { AnySectionDefinition } from "@/shared/contracts/section";

import { buildQuickContacts, buildSceneIdentity, buildSectionNav } from "./section-nav";

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

describe("buildSceneIdentity", () => {
  it("SCN-AC21: builds the plate from the name and the degree and focus areas of the profile", () => {
    expect(
      buildSceneIdentity("Ada Lovelace", {
        degree: "Matemáticas",
        focusAreas: ["Análisis", "Máquinas"],
      }),
    ).toEqual({
      name: "Ada Lovelace",
      degree: "Matemáticas",
      focusAreas: ["Análisis", "Máquinas"],
    });
  });

  it("keeps only the fields of the plate", () => {
    const profile = { degree: "Maths", focusAreas: ["Engines"], intro: "Not on the plate" };
    expect(Object.keys(buildSceneIdentity("Ada", profile))).toEqual([
      "name",
      "degree",
      "focusAreas",
    ]);
  });
});

describe("buildQuickContacts", () => {
  const CHANNELS: readonly LinkFact[] = [
    { id: "email", href: "mailto:ada@example.com" },
    { id: "whatsapp", href: "https://wa.me/1" },
    { id: "linkedin", href: "https://www.linkedin.com/in/ada/" },
    { id: "github", href: "https://github.com/ada" },
  ];

  it("SET-AC14: puts the résumé first and then the mail, LinkedIn and GitHub channels", () => {
    expect(buildQuickContacts(CHANNELS, "/cv/ada.pdf")).toEqual([
      { id: "cv", href: "/cv/ada.pdf" },
      { id: "email", href: "mailto:ada@example.com" },
      { id: "linkedin", href: "https://www.linkedin.com/in/ada/" },
      { id: "github", href: "https://github.com/ada" },
    ]);
  });

  it("SET-AC14: keeps that order whatever the order of the channels", () => {
    const ids = buildQuickContacts([...CHANNELS].reverse(), "/cv/ada.pdf").map(({ id }) => id);
    expect(ids).toEqual(["cv", "email", "linkedin", "github"]);
  });

  it("SET-AC14: throws when a channel is missing", () => {
    const withoutGithub = CHANNELS.filter(({ id }) => id !== "github");
    expect(() => buildQuickContacts(withoutGithub, "/cv/ada.pdf")).toThrow(/github/);
  });
});
