import { describe, expect, it } from "vitest";

import { findStringIssues, findTranslationIssues } from "@/shared/lib/content-integrity";
import { typedKeys } from "@/shared/lib/typed-object";

import { getUiDictionary } from "../get-ui-dictionary";
import { en, type UiDictionary } from "./en";
import { es } from "./es";

/** Sample arguments for every dictionary function. A function without an entry fails the tests. */
const SAMPLES: Readonly<Record<string, { readonly es: string; readonly en: string }>> = {
  "common.teamOfLabel": {
    es: es.common.teamOfLabel({ count: 6 }),
    en: en.common.teamOfLabel({ count: 6 }),
  },
  "common.visitedSectionsLabel": {
    es: es.common.visitedSectionsLabel({ count: 2, total: 6 }),
    en: en.common.visitedSectionsLabel({ count: 2, total: 6 }),
  },
  "site.sectionTitle": {
    es: es.site.sectionTitle({ title: "Proyectos" }),
    en: en.site.sectionTitle({ title: "Projects" }),
  },
  "scene.hotspotName": {
    es: es.scene.hotspotName({ hardwareName: "SSD NVMe", title: "Proyectos" }),
    en: en.scene.hotspotName({ hardwareName: "NVMe SSD", title: "Projects" }),
  },
  "panel.previousAriaLabel": {
    es: es.panel.previousAriaLabel({ title: "Perfil" }),
    en: en.panel.previousAriaLabel({ title: "Profile" }),
  },
  "panel.nextAriaLabel": {
    es: es.panel.nextAriaLabel({ title: "Proyectos" }),
    en: en.panel.nextAriaLabel({ title: "Projects" }),
  },
  "panel.positionLabel": {
    es: es.panel.positionLabel({ position: 2, total: 7 }),
    en: en.panel.positionLabel({ position: 2, total: 7 }),
  },
  "panel.positionAriaLabel": {
    es: es.panel.positionAriaLabel({ position: 2, total: 7 }),
    en: en.panel.positionAriaLabel({ position: 2, total: 7 }),
  },
};

/**
 * Pairs that are identical in both languages on purpose (I18N-R48): a proper name, and a title
 * that only composes an already translated name with the author's.
 */
const UNTRANSLATED_ON_PURPOSE = ["languageGate.title"];

interface Entry {
  readonly key: string;
  readonly es: string;
  readonly en: string;
}

function entries(): readonly Entry[] {
  const list: Entry[] = [];
  for (const namespace of typedKeys(en)) {
    const english: Readonly<Record<string, unknown>> = en[namespace];
    const spanish: Readonly<Record<string, unknown>> = es[namespace];
    for (const name of Object.keys(english)) {
      const key = `${namespace}.${name}`;
      const sample = SAMPLES[key];
      const englishValue = english[name];
      const spanishValue = spanish[name];
      if (typeof englishValue === "string" && typeof spanishValue === "string") {
        list.push({ key, es: spanishValue, en: englishValue });
      } else if (sample !== undefined) {
        list.push({ key, ...sample });
      } else {
        list.push({ key, es: "", en: "" });
      }
    }
  }
  return list;
}

describe("interface dictionaries", () => {
  it("I18N-AC03: have exactly the nine namespaces, in both languages", () => {
    const namespaces = [
      "common",
      "site",
      "languageGate",
      "notFound",
      "boot",
      "scene",
      "panel",
      "settings",
      "simpleView",
    ];
    expect(Object.keys(en)).toEqual(namespaces);
    expect(Object.keys(es)).toEqual(namespaces);
  });

  it("I18N-AC03: hold the cross-cutting strings of the common namespace", () => {
    expect(es.common).toMatchObject({
      skipToContentLabel: "Saltar al contenido",
      opensInNewTabHint: "se abre en una pestaña nueva",
      privateRepositoryLabel: "Repositorio privado",
      present: "actualidad",
      individualWorkLabel: "Trabajo individual",
      languageLabel: "Idioma",
      downloadCvLabel: "Descargar CV (PDF)",
      copyLabel: "Copiar",
      copiedAnnouncement: "Copiado",
    });
    expect(en.common).toMatchObject({
      skipToContentLabel: "Skip to content",
      opensInNewTabHint: "opens in a new tab",
      privateRepositoryLabel: "Private repository",
      present: "present",
      individualWorkLabel: "Individual work",
      languageLabel: "Language",
      downloadCvLabel: "Download résumé (PDF)",
      copyLabel: "Copy",
      copiedAnnouncement: "Copied",
    });
    expect(Object.keys(en.common)).toHaveLength(11);
  });

  it("I18N-AC03: hold the strings of the language gate and of the 404 page", () => {
    expect(es.languageGate).toEqual({
      title: "Juan Esteban Álvarez García — Portfolio",
      continueLabel: "Continuar en español",
    });
    expect(en.languageGate).toEqual({
      title: "Juan Esteban Álvarez García — Portfolio",
      continueLabel: "Continue in English",
    });
    expect(es.notFound).toEqual({
      title: "Página no encontrada",
      description: "La dirección que abriste no existe en este sitio.",
      homeLabel: "Ir al portfolio",
    });
    expect(en.notFound).toEqual({
      title: "Page not found",
      description: "The address you opened does not exist on this site.",
      homeLabel: "Go to the portfolio",
    });
  });

  it("I18N-AC02: a dictionary with a missing, extra or mistyped key does not compile", () => {
    type Boot = UiDictionary["boot"];
    const valid: Boot = {
      skipLabel: "Saltar",
      skipHint: "Indicación",
      loadingAnnouncement: "Aviso",
    };
    // @ts-expect-error -- `loadingAnnouncement` is missing
    const missing: Boot = { skipLabel: "Saltar", skipHint: "Indicación" };
    const extra: Boot = {
      ...valid,
      // @ts-expect-error -- `extraLabel` is not a key of the reference dictionary
      extraLabel: "Sobra",
    };
    const mistyped: Boot = {
      ...valid,
      // @ts-expect-error -- a string is expected
      skipLabel: 3,
    };
    expect(Object.keys(valid)).toHaveLength(3);
    expect(Object.keys(missing)).toHaveLength(2);
    expect(Object.keys(extra)).toHaveLength(4);
    expect(mistyped.skipLabel).toBe(3);
  });

  it("I18N-AC06: every dictionary function has an expected result in both languages", () => {
    expect(SAMPLES).toEqual({
      "common.teamOfLabel": { es: "Equipo de 6", en: "Team of 6" },
      "common.visitedSectionsLabel": {
        es: "2 de 6 secciones visitadas",
        en: "2 of 6 sections visited",
      },
      "site.sectionTitle": {
        es: "Proyectos · Juan Esteban Álvarez García",
        en: "Projects · Juan Esteban Álvarez García",
      },
      "scene.hotspotName": { es: "SSD NVMe: Proyectos", en: "NVMe SSD: Projects" },
      "panel.previousAriaLabel": {
        es: "Sección anterior: Perfil",
        en: "Previous section: Profile",
      },
      "panel.nextAriaLabel": { es: "Sección siguiente: Proyectos", en: "Next section: Projects" },
      "panel.positionLabel": { es: "2 / 7", en: "2 / 7" },
      "panel.positionAriaLabel": { es: "Sección 2 de 7", en: "Section 2 of 7" },
    });
    const functionKeys = typedKeys(en).flatMap((namespace) =>
      Object.entries(en[namespace])
        .filter(([, value]) => typeof value === "function")
        .map(([name]) => `${namespace}.${name}`),
    );
    expect(Object.keys(SAMPLES)).toEqual(functionKeys);
  });

  it("I18N-AC06: the singular case of a counter reads correctly", () => {
    expect(es.common.visitedSectionsLabel({ count: 1, total: 6 })).toBe(
      "1 de 6 secciones visitadas",
    );
    expect(en.common.visitedSectionsLabel({ count: 1, total: 6 })).toBe("1 of 6 sections visited");
  });

  it("I18N-AC07: every string is clean, plain and consistent between languages", () => {
    const problems: string[] = [];
    for (const entry of entries()) {
      for (const [locale, value] of [
        ["es", entry.es],
        ["en", entry.en],
      ] as const) {
        for (const issue of findStringIssues(value)) {
          problems.push(`${locale} ${entry.key} [${issue.rule}] ${issue.detail}`);
        }
      }
      for (const issue of findTranslationIssues(entry.es, entry.en)) {
        if (issue.rule === "C5" && UNTRANSLATED_ON_PURPOSE.includes(entry.key)) continue;
        problems.push(`${entry.key} [${issue.rule}] ${issue.detail}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it("getUiDictionary returns the dictionary of each language", () => {
    expect(getUiDictionary("es")).toBe(es);
    expect(getUiDictionary("en")).toBe(en);
  });
});
