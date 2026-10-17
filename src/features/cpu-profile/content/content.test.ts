import { describe, expect, it } from "vitest";

import { EDUCATION_IDS, LANGUAGE_IDS } from "../types";
import { profileEn } from "./en";
import { profileEs } from "./es";
import { profileFacts } from "./facts";

describe("profile facts", () => {
  it("CPU-AC01: holds two education entries, the grade, the graduation year and three languages", () => {
    expect(profileFacts.name).toBe("Juan Esteban Álvarez García");
    expect(profileFacts.location).toBe("Bogotá, Colombia");
    expect([profileFacts.city, profileFacts.countryCode]).toEqual(["Bogotá", "CO"]);
    expect(profileFacts.education).toEqual([
      {
        id: "uniandes",
        institution: "Universidad de los Andes",
        period: { start: { year: 2022, month: 1 }, end: { year: 2026, month: 12 } },
      },
      {
        id: "hm",
        institution: "Hochschule München",
        period: { start: { year: 2025, month: 2 }, end: { year: 2025, month: 7 } },
      },
    ]);
    expect(profileFacts.gpa).toEqual({ value: 4.2, scale: 5 });
    expect("graduationYear" in profileFacts).toBe(false);
    expect(profileFacts.exchangeCredits).toBe("17 ECTS");
    expect(profileFacts.languages).toEqual(["es", "en", "de"]);
  });
});

describe("profile texts", () => {
  it("CPU-AC02: each language has the same number of elements and a text per identifier", () => {
    for (const text of [profileEs, profileEn]) {
      expect(text.summary).toHaveLength(5);
      expect(text.courses).toHaveLength(13);
      expect(text.focusAreas).toHaveLength(4);
      expect(Object.keys(text.education)).toEqual([...EDUCATION_IDS]);
      expect(Object.keys(text.languages)).toEqual([...LANGUAGE_IDS]);
    }
  });

  it("CPU-AC02: uses the section and hardware names of VSN §4", () => {
    expect([profileEs.meta.title, profileEs.meta.hardwareName]).toEqual([
      "Perfil",
      "Procesador (CPU)",
    ]);
    expect([profileEn.meta.title, profileEn.meta.hardwareName]).toEqual([
      "Profile",
      "Processor (CPU)",
    ]);
  });

  it("states the availability and the certified level of English in both languages", () => {
    expect(profileEs.availability).toBe(
      "Tiempo completo · Presencial o híbrido en Bogotá · Remoto a nivel mundial",
    );
    expect(profileEn.availability).toBe(
      "Full-time · On-site or hybrid in Bogotá · Remote worldwide",
    );
    expect(profileEs.languages.en.level).toBe("C1, IELTS General Training 7,5 (2025)");
    expect(profileEn.languages.en.level).toBe("C1, IELTS General Training 7.5 (2025)");
  });
});
