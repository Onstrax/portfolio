import { expect, test } from "@playwright/test";

import { CASE_STUDY_IDS, SECTION_SLUGS } from "../../src/shared/contracts/ids";
import { LOCALES } from "../../src/shared/contracts/locale";
import { listHtmlDocuments, NEXT_INTERNAL_DOCUMENTS, readExportedFile } from "../support/export";

const LOCALE_DOCUMENTS = LOCALES.flatMap((locale) => [
  `${locale}/index.html`,
  `${locale}/cv/index.html`,
  ...SECTION_SLUGS.map((section) => `${locale}/${section}/index.html`),
  ...CASE_STUDY_IDS.map((caseStudy) => `${locale}/projects/${caseStudy}/index.html`),
]);

const EXPECTED_DOCUMENTS = ["index.html", "404.html", ...LOCALE_DOCUMENTS].sort();

function langOf(html: string): string | undefined {
  return /<html\b[^>]*\slang="([^"]*)"/i.exec(html)?.[1];
}

test("SYS-AC01: the export contains one HTML document per route and no other", () => {
  const documents = listHtmlDocuments().filter((file) => !NEXT_INTERNAL_DOCUMENTS.includes(file));
  expect(documents).toEqual(EXPECTED_DOCUMENTS);
  expect(EXPECTED_DOCUMENTS).toHaveLength(26);
});

test("SYS-AC02: every document declares the language of its route", () => {
  for (const file of ["index.html", "404.html"]) {
    expect(langOf(readExportedFile(file)), file).toBe("en");
  }
  for (const locale of LOCALES) {
    for (const file of LOCALE_DOCUMENTS.filter((name) => name.startsWith(`${locale}/`))) {
      expect(langOf(readExportedFile(file)), file).toBe(locale);
    }
  }
});
