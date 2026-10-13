/** Interface languages, in the order they are listed to the visitor. */
export const LOCALES = ["es", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/** Fallback language when no other can be determined (F-20). */
export const FALLBACK_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return LOCALES.some((locale) => locale === value);
}
