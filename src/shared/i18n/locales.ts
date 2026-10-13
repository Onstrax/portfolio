import type { Locale } from "@/shared/contracts/locale";

export interface LocaleMeta {
  /** Name of the language written in that language. */
  readonly nativeName: string;
  /** Short code shown by the language switcher. */
  readonly shortCode: string;
  /** Value of the `lang` and `hreflang` attributes. */
  readonly htmlLang: string;
  /** BCP 47 tag used by the formatters. */
  readonly intlTag: string;
  /** Value of `og:locale`. */
  readonly ogLocale: string;
}

export const LOCALE_META = {
  es: {
    nativeName: "Español",
    shortCode: "ES",
    htmlLang: "es",
    intlTag: "es-CO",
    ogLocale: "es_CO",
  },
  en: {
    nativeName: "English",
    shortCode: "EN",
    htmlLang: "en",
    intlTag: "en-US",
    ogLocale: "en_US",
  },
} as const satisfies Record<Locale, LocaleMeta>;
