import type { MetadataRoute } from "next";

import { SECTION_SLUGS } from "@/shared/contracts/ids";
import { LOCALES } from "@/shared/contracts/locale";

import { absoluteUrl, languageAlternates, pagePath, type PageView } from "./page-urls";

/** Every kind of page that has a language: the home, the seven sections and the simple view. */
const PAGES: readonly PageView[] = [
  { view: "home" },
  ...SECTION_SLUGS.map((section): PageView => ({ view: "section", section })),
  { view: "cv" },
];

/**
 * The 18 pages with language, each with its alternates in the other languages (SMP-R19).
 * The `/` page is not listed: it only redirects.
 */
export function getSitemapEntries(): MetadataRoute.Sitemap {
  return PAGES.flatMap((page) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(pagePath(page, locale)),
      alternates: { languages: languageAlternates(page) },
    })),
  );
}
