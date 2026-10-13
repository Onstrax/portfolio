import { describe, expect, it } from "vitest";

import { getSiteUrl } from "./site";

describe("getSiteUrl", () => {
  it("SYS-AC13: returns the origin when the variable is a valid http or https origin", () => {
    expect(getSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://example.pages.dev" })).toBe(
      "https://example.pages.dev",
    );
    expect(getSiteUrl({ NEXT_PUBLIC_SITE_URL: "http://localhost:4173" })).toBe(
      "http://localhost:4173",
    );
  });

  it("SYS-AC13: throws an error naming the variable when it is missing or empty", () => {
    expect(() => getSiteUrl({})).toThrow("NEXT_PUBLIC_SITE_URL");
    expect(() => getSiteUrl({ NEXT_PUBLIC_SITE_URL: "" })).toThrow("NEXT_PUBLIC_SITE_URL");
  });

  it("SYS-AC13: throws an error naming the variable when it is not an http or https origin", () => {
    for (const value of [
      "example.pages.dev",
      "ftp://example.pages.dev",
      "not a url",
      "https://example.pages.dev/portfolio",
      "https://example.pages.dev?x=1",
    ]) {
      expect(() => getSiteUrl({ NEXT_PUBLIC_SITE_URL: value })).toThrow("NEXT_PUBLIC_SITE_URL");
    }
  });

  it("SYS-AC13: throws an error naming the variable when it ends with a slash", () => {
    expect(() => getSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://example.pages.dev/" })).toThrow(
      "NEXT_PUBLIC_SITE_URL",
    );
  });
});
