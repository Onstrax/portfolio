import type { Metadata } from "next";

import { getSection } from "@/features/registry";
import { OG_ASSET } from "@/shared/assets/manifest.generated";
import { SITE } from "@/shared/config/site";
import { FALLBACK_LOCALE, type Locale, LOCALES } from "@/shared/contracts/locale";
import { getUiDictionary } from "@/shared/i18n/get-ui-dictionary";
import { LOCALE_META } from "@/shared/i18n/locales";

import { absoluteUrl, languageAlternates, pagePath, type PageView } from "./page-urls";

function pageText(
  page: PageView,
  locale: Locale,
): { readonly title: string; readonly description: string } {
  const { site } = getUiDictionary(locale);
  switch (page.view) {
    case "home":
      return { title: site.homeTitle, description: site.description };
    case "section": {
      const { meta } = getSection(page.section).text[locale];
      return { title: site.sectionTitle({ title: meta.title }), description: meta.description };
    }
    case "cv":
      return { title: site.cvTitle, description: site.cvDescription };
  }
}

/** The data that social networks read for a page in `locale`, without its type (SMP-R15). */
function sharingData(title: string, description: string, url: string, locale: Locale) {
  return {
    title,
    description,
    url,
    locale: LOCALE_META[locale].ogLocale,
    alternateLocale: LOCALES.filter((other) => other !== locale).map(
      (other) => LOCALE_META[other].ogLocale,
    ),
    siteName: SITE.authorName,
    images: [
      {
        url: absoluteUrl(OG_ASSET.src),
        width: OG_ASSET.width,
        height: OG_ASSET.height,
        alt: getUiDictionary(locale).site.ogImageAlt,
      },
    ],
  };
}

/**
 * Metadata of a page with language: title, description, canonical URL, alternates per language
 * and the data that social networks read (SMP-R13 to SMP-R16). Pages never write it by hand.
 */
export function getPageMetadata(page: PageView, locale: Locale): Metadata {
  const { title, description } = pageText(page, locale);
  const url = absoluteUrl(pagePath(page, locale));
  const shared = sharingData(title, description, url, locale);

  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(page) },
    openGraph:
      page.view === "home" ? { ...shared, type: "profile" } : { ...shared, type: "website" },
    twitter: { card: "summary_large_image" },
  };
}

/**
 * Metadata of the entry page `/`: not indexed and titled for the choice of language (SMP-R17),
 * but it is the address that people share, and social networks do not run its redirect. So it
 * carries the description and the sharing data of the home in the fallback language.
 */
export function getEntryMetadata(): Metadata {
  const { site, languageGate } = getUiDictionary(FALLBACK_LOCALE);
  return {
    title: languageGate.title,
    description: site.description,
    robots: { index: false },
    openGraph: {
      ...sharingData(site.homeTitle, site.description, absoluteUrl("/"), FALLBACK_LOCALE),
      type: "profile",
    },
    twitter: { card: "summary_large_image" },
  };
}
