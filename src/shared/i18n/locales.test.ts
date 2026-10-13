import { describe, expect, it } from "vitest";

import { LOCALES } from "@/shared/contracts/locale";

import { LOCALE_META } from "./locales";

describe("LOCALE_META", () => {
  it("I18N-AC01: holds exactly the data of every language", () => {
    expect(Object.keys(LOCALE_META)).toEqual([...LOCALES]);
    expect(LOCALE_META.es).toEqual({
      nativeName: "Español",
      shortCode: "ES",
      htmlLang: "es",
      intlTag: "es-CO",
      ogLocale: "es_CO",
    });
    expect(LOCALE_META.en).toEqual({
      nativeName: "English",
      shortCode: "EN",
      htmlLang: "en",
      intlTag: "en-US",
      ogLocale: "en_US",
    });
  });
});
