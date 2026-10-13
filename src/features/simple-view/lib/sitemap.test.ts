import { describe, expect, it } from "vitest";

import { getSitemapEntries } from "./sitemap";

describe("getSitemapEntries", () => {
  it("lists the 18 pages with language and leaves out the redirect page", () => {
    const urls = getSitemapEntries().map((entry) => entry.url);
    expect(urls).toHaveLength(18);
    expect(new Set(urls).size).toBe(18);
    expect(urls.slice(0, 4)).toEqual([
      "http://localhost:4173/es/",
      "http://localhost:4173/en/",
      "http://localhost:4173/es/profile/",
      "http://localhost:4173/en/profile/",
    ]);
    expect(urls.slice(-2)).toEqual([
      "http://localhost:4173/es/cv/",
      "http://localhost:4173/en/cv/",
    ]);
    expect(urls).not.toContain("http://localhost:4173/");
  });

  it("gives every page its alternates in the other languages", () => {
    const entry = getSitemapEntries().find(
      (item) => item.url === "http://localhost:4173/es/projects/",
    );
    expect(entry?.alternates?.languages).toEqual({
      es: "http://localhost:4173/es/projects/",
      en: "http://localhost:4173/en/projects/",
      "x-default": "http://localhost:4173/en/projects/",
    });
  });
});
