import { type AppPath, cvPath, homePath, sectionPath } from "@/shared/config/routes";
import { getSiteUrl } from "@/shared/config/site";
import type { SectionSlug } from "@/shared/contracts/ids";
import { FALLBACK_LOCALE, type Locale, LOCALES } from "@/shared/contracts/locale";
import { LOCALE_META } from "@/shared/i18n/locales";

/** One of the three kinds of page that have a language (SMP §3). */
export type PageView =
  | { readonly view: "home" }
  | { readonly view: "section"; readonly section: SectionSlug }
  | { readonly view: "cv" };

export function pagePath(page: PageView, locale: Locale): AppPath {
  switch (page.view) {
    case "home":
      return homePath(locale);
    case "section":
      return sectionPath(locale, page.section);
    case "cv":
      return cvPath(locale);
  }
}

/** Absolute URL of a path of the site, built from the validated origin (SMP-R16). */
export function absoluteUrl(path: string): string {
  return `${getSiteUrl(process.env)}${path}`;
}

/**
 * The same page in every language, keyed by `hreflang`, plus `x-default` pointing to the
 * fallback language (I18N-R29).
 */
export function languageAlternates(page: PageView): Readonly<Record<string, string>> {
  const alternates: Record<string, string> = {};
  for (const locale of LOCALES) {
    alternates[LOCALE_META[locale].htmlLang] = absoluteUrl(pagePath(page, locale));
  }
  alternates["x-default"] = absoluteUrl(pagePath(page, FALLBACK_LOCALE));
  return alternates;
}
