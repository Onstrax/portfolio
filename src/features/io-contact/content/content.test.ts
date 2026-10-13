import { describe, expect, it } from "vitest";

import { contactEn } from "./en";
import { contactEs } from "./es";
import { contactFacts } from "./facts";

describe("contact facts", () => {
  it("IO-AC01: holds the four channels in order with their exact address and visible value", () => {
    expect(contactFacts.email).toBe("juanalvarezgcl@gmail.com");
    expect(contactFacts.channels).toEqual([
      {
        id: "email",
        href: "mailto:juanalvarezgcl@gmail.com",
        display: "juanalvarezgcl@gmail.com",
      },
      { id: "whatsapp", href: "https://wa.me/573005628702", display: "+57 300 562 8702" },
      {
        id: "linkedin",
        href: "https://www.linkedin.com/in/juan-esteban-alvarez-garcia-21bb70364/",
        display: "juan-esteban-alvarez-garcia",
      },
      { id: "github", href: "https://github.com/Onstrax", display: "Onstrax" },
    ]);
  });
});

describe("contact texts", () => {
  it("uses the section and hardware names of VSN §4", () => {
    expect([contactEs.meta.title, contactEs.meta.hardwareName]).toEqual(["Contacto", "Panel I/O"]);
    expect([contactEn.meta.title, contactEn.meta.hardwareName]).toEqual(["Contact", "I/O panel"]);
  });

  it("labels the résumé of each language in both languages", () => {
    expect(contactEs.cvLabels).toEqual({
      es: "Descargar en español (PDF)",
      en: "Descargar en inglés (PDF)",
    });
    expect(contactEn.cvLabels).toEqual({
      es: "Download in Spanish (PDF)",
      en: "Download in English (PDF)",
    });
  });
});
