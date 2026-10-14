import type { MetadataRoute } from "next";

import { CASE_STUDY_IDS, SECTION_SLUGS } from "@/shared/contracts/ids";
import { LOCALES } from "@/shared/contracts/locale";

import { absoluteUrl, languageAlternates, pagePath, type PageView } from "./page-urls";

/**
 * Every page that has a language: the home, the seven sections, the simple view and the three
 * case studies.
 */
const PAGES: readonly PageView[] = [
  { view: "home" },
  ...SECTION_SLUGS.map((section): PageView => ({ view: "section", section })),
  { view: "cv" },
  ...CASE_STUDY_IDS.map((caseStudy): PageView => ({ view: "case", caseStudy })),
];

/**
 * The 24 pages with language, each with its alternates in the other languages (SMP-R19).
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
