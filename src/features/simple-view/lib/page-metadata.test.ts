import type { Metadata } from "next";
import { describe, expect, it } from "vitest";

import { CASE_STUDY_IDS, SECTION_SLUGS } from "@/shared/contracts/ids";
import { LOCALES } from "@/shared/contracts/locale";

import { getEntryMetadata, getPageMetadata } from "./page-metadata";
import { languageAlternates, pagePath, type PageView } from "./page-urls";

const ORIGIN = "http://localhost:4173";

const PAGES: readonly PageView[] = [
  { view: "home" },
  ...SECTION_SLUGS.map((section): PageView => ({ view: "section", section })),
  { view: "cv" },
  ...CASE_STUDY_IDS.map((caseStudy): PageView => ({ view: "case", caseStudy })),
];

const ALL: readonly Metadata[] = PAGES.flatMap((page) =>
  LOCALES.map((locale) => getPageMetadata(page, locale)),
);

describe("getPageMetadata", () => {
  it("SMP-AC09: gives the 24 pages unique titles and descriptions within their limits", () => {
    const titles = ALL.map((metadata) =>
      typeof metadata.title === "string" ? metadata.title : "",
    );
    const descriptions = ALL.map((metadata) => metadata.description ?? "");
    expect(ALL).toHaveLength(24);
    expect(new Set(titles).size).toBe(24);
    expect(new Set(descriptions).size).toBe(24);
    for (const title of titles) {
      expect(title.length, title).toBeGreaterThan(0);
      expect(title.length, title).toBeLessThanOrEqual(60);
    }
    for (const description of descriptions) {
      expect(description.length, description).toBeGreaterThanOrEqual(50);
      expect(description.length, description).toBeLessThanOrEqual(160);
    }
  });

  it("SMP-AC09: uses the title and description of each view", () => {
    expect(getPageMetadata({ view: "home" }, "es")).toMatchObject({
      title: "Juan Esteban Álvarez García · Portfolio interactivo",
      description:
        "Portfolio de Juan Esteban Álvarez García, Ingeniero de Sistemas y Computación de la Universidad de los Andes: software, cloud/DevOps y seguridad aplicada.",
    });
    expect(getPageMetadata({ view: "home" }, "en").title).toBe(
      "Juan Esteban Álvarez García · Interactive portfolio",
    );
    expect(getPageMetadata({ view: "section", section: "projects" }, "es")).toMatchObject({
      title: "Proyectos · Juan Esteban Álvarez García",
      description:
        "Proyectos de Juan Esteban Álvarez García: tesis de autenticación poscuántica, AndeSpace, HabiCapital, una web en producción y trabajos de cloud y DevOps.",
    });
    expect(getPageMetadata({ view: "section", section: "stack" }, "en").title).toBe(
      "Tech stack · Juan Esteban Álvarez García",
    );
    expect(getPageMetadata({ view: "cv" }, "es")).toMatchObject({
      title: "Currículum · Juan Esteban Álvarez García",
      description:
        "Perfil, experiencia, proyectos, stack y contacto de Juan Esteban Álvarez García en una sola página, lista para leer o imprimir.",
    });
    expect(getPageMetadata({ view: "cv" }, "en").title).toBe(
      "Résumé · Juan Esteban Álvarez García",
    );
  });

  it("declares its own canonical URL and one alternate per language plus x-default", () => {
    const metadata = getPageMetadata({ view: "section", section: "projects" }, "es");
    expect(metadata.alternates).toEqual({
      canonical: `${ORIGIN}/es/projects/`,
      languages: {
        es: `${ORIGIN}/es/projects/`,
        en: `${ORIGIN}/en/projects/`,
        "x-default": `${ORIGIN}/en/projects/`,
      },
    });
  });

  it("describes the page for social networks with absolute URLs", () => {
    const home = getPageMetadata({ view: "home" }, "es");
    expect(home.openGraph).toMatchObject({
      type: "profile",
      url: `${ORIGIN}/es/`,
      locale: "es_CO",
      alternateLocale: ["en_US"],
      siteName: "Juan Esteban Álvarez García",
    });
    expect(home.openGraph?.images).toEqual([
      {
        url: expect.stringMatching(
          /^http:\/\/localhost:4173\/og\/og-image\.[0-9a-f]{12}\.jpg$/,
        ) as unknown,
        width: 1200,
        height: 630,
        alt: "Placa madre sobre un banco de trabajo, vista desde arriba",
      },
    ]);
    expect(home.twitter).toEqual({ card: "summary_large_image" });
    expect(getPageMetadata({ view: "cv" }, "en").openGraph).toMatchObject({
      type: "website",
      locale: "en_US",
      alternateLocale: ["es_CO"],
    });
  });
});

describe("page URLs", () => {
  it("builds the path of each view", () => {
    expect(pagePath({ view: "home" }, "es")).toBe("/es/");
    expect(pagePath({ view: "section", section: "about" }, "en")).toBe("/en/about/");
    expect(pagePath({ view: "cv" }, "en")).toBe("/en/cv/");
  });

  it("points x-default to the fallback language", () => {
    expect(languageAlternates({ view: "cv" })).toEqual({
      es: `${ORIGIN}/es/cv/`,
      en: `${ORIGIN}/en/cv/`,
      "x-default": `${ORIGIN}/en/cv/`,
    });
  });
});

describe("getEntryMetadata", () => {
  it("SMP-AC19: gives the entry page the description and sharing data of the English home", () => {
    const entry = getEntryMetadata();
    const home = getPageMetadata({ view: "home" }, "en");

    expect(entry.robots).toEqual({ index: false });
    expect(entry.description).toBe(home.description);
    expect(entry.alternates).toBeUndefined();
    expect(entry.openGraph).toEqual({ ...home.openGraph, url: `${ORIGIN}/` });
    expect(entry.twitter).toEqual(home.twitter);
  });
});

describe("metadata of a case study", () => {
  it("SMP-AC21: titles the page with the case and points to its own URL in each language", () => {
    const metadata = getPageMetadata({ view: "case", caseStudy: "thesis" }, "es");
    expect(metadata.title).toBe("Tesis de autenticación poscuántica · Caso de estudio");
    expect(metadata.description).toBe(
      "Caso de estudio de mi tesis: un protocolo de autenticación de conocimiento cero, resistente a la computación cuántica y basado en Module-LWE.",
    );
    expect(metadata.alternates?.canonical).toBe(`${ORIGIN}/es/projects/thesis/`);
    expect(metadata.alternates?.languages).toEqual({
      es: `${ORIGIN}/es/projects/thesis/`,
      en: `${ORIGIN}/en/projects/thesis/`,
      "x-default": `${ORIGIN}/en/projects/thesis/`,
    });
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      url: `${ORIGIN}/es/projects/thesis/`,
    });
    expect(getPageMetadata({ view: "case", caseStudy: "andespace" }, "en").title).toBe(
      "AndeSpace · Case study",
    );
  });
});
