import { describe, expect, it } from "vitest";

import { FALLBACK_LOCALE, isLocale, LOCALES } from "./locale";

describe("locale contract", () => {
  it("lists Spanish first and English second", () => {
    expect(LOCALES).toEqual(["es", "en"]);
  });

  it("falls back to English (F-20)", () => {
    expect(FALLBACK_LOCALE).toBe("en");
  });

  it("TSC-AC06: isLocale accepts every locale and rejects anything else", () => {
    for (const locale of LOCALES) {
      expect(isLocale(locale)).toBe(true);
    }
    for (const value of ["de", "ES", "", null, undefined, 1]) {
      expect(isLocale(value)).toBe(false);
    }
  });
});
