import { expect, test } from "@playwright/test";
import { gzipSync } from "node:zlib";

import { CASE_STUDY_IDS, SECTION_SLUGS } from "../../src/shared/contracts/ids";
import { LOCALES } from "../../src/shared/contracts/locale";
import { listHtmlDocuments, NEXT_INTERNAL_DOCUMENTS, readExportedFile } from "../support/export";

const ORIGIN = "http://localhost:4173";
const OG_LOCALES: Readonly<Record<string, string>> = { es: "es_CO", en: "en_US" };

interface LocalePage {
  readonly locale: string;
  readonly file: string;
  readonly path: string;
  /** Builds the path of the same page in another language. */
  readonly inLocale: (locale: string) => string;
}

const LOCALE_PAGES: readonly LocalePage[] = LOCALES.flatMap((locale) =>
  [
    "",
    "cv/",
    ...SECTION_SLUGS.map((section) => `${section}/`),
    ...CASE_STUDY_IDS.map((caseStudy) => `projects/${caseStudy}/`),
  ].map((rest) => ({
    locale,
    file: `${locale}/${rest}index.html`,
    path: `/${locale}/${rest}`,
    inLocale: (other: string) => `/${other}/${rest}`,
  })),
);

function isCasePage(page: LocalePage): boolean {
  return /\/projects\/[^/]+\/$/.test(page.path);
}

function attribute(tag: string, name: string): string | undefined {
  return new RegExp(`\\s${name}="([^"]*)"`, "i").exec(tag)?.[1]?.replaceAll("&amp;", "&");
}

function tags(html: string, name: string): readonly string[] {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) ?? [];
}

function meta(html: string, key: string): readonly string[] {
  return tags(html, "meta")
    .filter((tag) => attribute(tag, "property") === key || attribute(tag, "name") === key)
    .map((tag) => attribute(tag, "content") ?? "");
}

function links(html: string, rel: string): readonly string[] {
  return tags(html, "link").filter((tag) => attribute(tag, "rel") === rel);
}

function title(html: string): string {
  return (/<title>([^<]*)<\/title>/i.exec(html)?.[1] ?? "").replaceAll("&amp;", "&");
}

function jsonLdBlocks(html: string): readonly string[] {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (match) => match[1] ?? "",
  );
}

test("SMP-AC01: every page with content holds the seven sections in the base markup", () => {
  for (const file of ["es/index.html", "es/projects/index.html", "es/cv/index.html"]) {
    const html = readExportedFile(file);
    const main = /<main id="content"[^>]*>([\s\S]*?)<\/main>/.exec(html)?.[1] ?? "";
    const sections = [...main.matchAll(/<section id="([a-z]+)" aria-labelledby="([a-z-]+)"/g)];
    expect(
      sections.map((match) => match[1]),
      file,
    ).toEqual([...SECTION_SLUGS]);
    expect(
      sections.map((match) => match[2]),
      file,
    ).toEqual(SECTION_SLUGS.map((slug) => `${slug}-title`));
    expect(main.match(/<h2 id="[a-z]+-title"/g), file).toHaveLength(7);
    for (const part of main.split(/<section id="/).slice(1)) {
      expect(part.length, file).toBeGreaterThan(500);
    }
  }
});

test("SMP-AC10, I18N-AC15: every page with language declares its metadata with absolute URLs", () => {
  for (const page of LOCALE_PAGES) {
    const html = readExportedFile(page.file);
    const url = `${ORIGIN}${page.path}`;

    expect(
      links(html, "canonical").map((tag) => attribute(tag, "href")),
      page.file,
    ).toEqual([url]);
    const alternates = Object.fromEntries(
      links(html, "alternate").map((tag): [string, string] => [
        attribute(tag, "hreflang") ?? "",
        attribute(tag, "href") ?? "",
      ]),
    );
    expect(alternates, page.file).toEqual({
      es: `${ORIGIN}${page.inLocale("es")}`,
      en: `${ORIGIN}${page.inLocale("en")}`,
      "x-default": `${ORIGIN}${page.inLocale("en")}`,
    });

    expect(meta(html, "og:title"), page.file).toEqual([title(html)]);
    expect(meta(html, "og:description"), page.file).toEqual(meta(html, "description"));
    expect(meta(html, "og:url"), page.file).toEqual([url]);
    expect(meta(html, "og:type"), page.file).toEqual([
      page.path === `/${page.locale}/` ? "profile" : "website",
    ]);
    expect(meta(html, "og:locale"), page.file).toEqual([OG_LOCALES[page.locale]]);
    expect(meta(html, "og:locale:alternate"), page.file).toEqual(
      LOCALES.filter((other) => other !== page.locale).map((other) => OG_LOCALES[other]),
    );
    expect(meta(html, "og:site_name"), page.file).toEqual(["Juan Esteban Álvarez García"]);
    expect(meta(html, "og:image")[0], page.file).toMatch(
      /^http:\/\/localhost:4173\/og\/og-image\.[0-9a-f]{12}\.jpg$/,
    );
    expect(meta(html, "og:image:width"), page.file).toEqual(["1200"]);
    expect(meta(html, "og:image:height"), page.file).toEqual(["630"]);
    expect(meta(html, "og:image:alt")[0]?.length, page.file).toBeGreaterThan(10);
    expect(meta(html, "twitter:card"), page.file).toEqual(["summary_large_image"]);
    expect(meta(html, "theme-color"), page.file).toEqual(["#0a0907"]);
  }
});

test("SMP-AC19: the entry page, which is the address people share, carries the sharing data", () => {
  const html = readExportedFile("index.html");
  const home = readExportedFile("en/index.html");

  expect(meta(html, "description")).toEqual(meta(home, "description"));
  expect(meta(html, "og:title")).toEqual([title(home)]);
  expect(meta(html, "og:description")).toEqual(meta(home, "description"));
  expect(meta(html, "og:url")).toEqual([`${ORIGIN}/`]);
  expect(meta(html, "og:type")).toEqual(["profile"]);
  for (const key of ["og:image", "og:image:width", "og:image:height", "og:image:alt"]) {
    expect(meta(html, key), key).toEqual(meta(home, key));
  }
  expect(meta(html, "twitter:card")).toEqual(["summary_large_image"]);
  expect(meta(html, "robots")).toEqual(["noindex"]);
});

test("QLT-AC19: titles and descriptions are within their limits and unique", () => {
  const titles = LOCALE_PAGES.map((page) => title(readExportedFile(page.file)));
  const descriptions = LOCALE_PAGES.map(
    (page) => meta(readExportedFile(page.file), "description")[0] ?? "",
  );
  expect(LOCALE_PAGES).toHaveLength(24);
  expect(new Set(titles).size).toBe(24);
  expect(new Set(descriptions).size).toBe(24);
  for (const text of titles) {
    expect(text.length, text).toBeGreaterThan(0);
    expect(text.length, text).toBeLessThanOrEqual(60);
  }
  for (const text of descriptions) {
    expect(text.length, text).toBeGreaterThanOrEqual(50);
    expect(text.length, text).toBeLessThanOrEqual(160);
  }
});

test("SMP-AC11, QLT-AC20: the pages of the scene group carry one valid Person block", () => {
  for (const page of LOCALE_PAGES) {
    const blocks = jsonLdBlocks(readExportedFile(page.file));
    // The plain pages, the simple view and the case studies, carry no structured data.
    if (page.path.endsWith("/cv/") || isCasePage(page)) {
      expect(blocks, page.file).toEqual([]);
      continue;
    }
    expect(blocks, page.file).toHaveLength(1);
    const person = JSON.parse(blocks[0] ?? "{}") as Record<string, unknown>;
    expect(person["@type"], page.file).toBe("Person");
    expect(Object.keys(person).sort(), page.file).toEqual([
      "@context",
      "@type",
      "address",
      "alumniOf",
      "description",
      "email",
      "image",
      "knowsLanguage",
      "name",
      "sameAs",
      "url",
    ]);
    expect(person["url"], page.file).toBe(`${ORIGIN}/${page.locale}/`);
  }
  for (const file of ["index.html", "404.html"]) {
    expect(jsonLdBlocks(readExportedFile(file)), file).toEqual([]);
  }
});

test("SMP-AC12, QLT-AC20: the sitemap lists the 24 pages and robots.txt points to it", () => {
  const sitemap = readExportedFile("sitemap.xml");
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  expect([...urls].sort()).toEqual(LOCALE_PAGES.map((page) => `${ORIGIN}${page.path}`).sort());
  expect(sitemap.match(/hreflang="x-default"/g)).toHaveLength(24);
  expect(sitemap.match(/hreflang="es"/g)).toHaveLength(24);

  const robots = readExportedFile("robots.txt");
  expect(robots).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
  expect(robots).toMatch(/User-Agent: \*\nAllow: \//i);
});

test("SMP-AC13, QLT-AC20: only the entry page and the 404 page ask not to be indexed", () => {
  const documents = listHtmlDocuments().filter((file) => !NEXT_INTERNAL_DOCUMENTS.includes(file));
  for (const file of documents) {
    const isUtilityPage = file === "index.html" || file === "404.html";
    const robots = meta(readExportedFile(file), "robots").join(",");
    expect(robots.includes("noindex"), file).toBe(isUtilityPage);
  }
});

test("QLT-AC18: every image declares its width and its height", () => {
  let count = 0;
  for (const file of listHtmlDocuments()) {
    for (const image of tags(readExportedFile(file), "img")) {
      count += 1;
      expect(attribute(image, "width"), `${file} ${image}`).toMatch(/^\d+$/);
      expect(attribute(image, "height"), `${file} ${image}`).toMatch(/^\d+$/);
    }
  }
  expect(count).toBeGreaterThan(0);
});

test("SYS-AC14: every link to another origin opens in a new tab without leaking the opener", () => {
  let count = 0;
  for (const file of listHtmlDocuments()) {
    for (const anchor of tags(readExportedFile(file), "a")) {
      const href = attribute(anchor, "href") ?? "";
      if (!/^https?:\/\//.test(href)) continue;
      count += 1;
      expect(attribute(anchor, "target"), `${file} ${href}`).toBe("_blank");
      expect(attribute(anchor, "rel"), `${file} ${href}`).toBe("noopener noreferrer");
    }
  }
  expect(count).toBeGreaterThan(100);
});

test("QLT-AC15: every exported document weighs 45 kB at most when compressed", () => {
  for (const file of listHtmlDocuments()) {
    const bytes = gzipSync(readExportedFile(file), { level: 9 }).length;
    expect(bytes, file).toBeLessThanOrEqual(45_000);
  }
});

/** Fragments that each case study shows, in Spanish and in English (SSD §4.6). */
const CASE_FRAGMENTS: Readonly<Record<string, readonly string[]>> = {
  "es/projects/thesis": [
    "Se estima que, entre 2028 y 2035",
    "Lidero el componente matemático",
    "Un protocolo no interactivo basado en Module-LWE.",
  ],
  "en/projects/thesis": [
    "Quantum computing is expected to break",
    "Lead the Learning with Errors",
    "A non-interactive protocol based on Module-LWE.",
  ],
  "es/projects/andespace": [
    "En la universidad había espacios desaprovechados",
    "Diseñé y construí la pantalla de inicio",
    "Un inicio sencillo y un diseño sobrio.",
  ],
  "en/projects/andespace": [
    "University spaces went unused",
    "Designed and built the home screen",
    "A simple home screen and a restrained design.",
  ],
  "es/projects/dental-site": [
    "El consultorio no tenía presencia en línea.",
    "Identifiqué el problema",
    "Reescribir los textos con un lenguaje cercano al paciente.",
  ],
  "en/projects/dental-site": [
    "The practice had no online presence.",
    "Identified the problem",
    "Rewriting the copy in plain, patient-friendly language.",
  ],
};

test("SMP-AC20: every case study page has its title, its four blocks and no scene", () => {
  const names: Readonly<Record<string, string>> = {
    "es/projects/thesis": "Tesis: autenticación poscuántica de conocimiento cero",
    "en/projects/thesis": "Thesis: post-quantum zero-knowledge authentication",
    "es/projects/andespace": "AndeSpace",
    "en/projects/andespace": "AndeSpace",
    "es/projects/dental-site": "Web para un consultorio odontológico",
    "en/projects/dental-site": "Dental practice website",
  };
  for (const [page, fragments] of Object.entries(CASE_FRAGMENTS)) {
    const html = readExportedFile(`${page}/index.html`);
    const main = /<main[^>]*id="content"[^>]*>([\s\S]*)<\/main>/.exec(html)?.[1] ?? "";
    const headings = [...main.matchAll(/<h1[^>]*>([^<]*)<\/h1>/g)].map((match) => match[1]);
    expect(headings, page).toEqual([names[page]]);
    const ids = [...main.matchAll(/<h2[^>]*\sid="([^"]+)"/g)].map((match) => match[1]);
    expect(ids, page).toEqual(["case-problem", "case-role", "case-process", "case-outcome"]);
    for (const fragment of fragments) {
      expect(main, `${page}: ${fragment}`).toContain(fragment);
    }
    expect(html, page).not.toContain('data-layer="scene"');
    expect(jsonLdBlocks(html), page).toEqual([]);
  }
});
