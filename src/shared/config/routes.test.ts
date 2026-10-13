import { describe, expect, it } from "vitest";

import { CV_SEGMENT, cvPath, homePath, parsePath, sectionPath, toPath, withLocale } from "./routes";

describe("routes", () => {
  it("TSC-AC14: builds the three kinds of path", () => {
    expect(homePath("es")).toBe("/es/");
    expect(sectionPath("en", "projects")).toBe("/en/projects/");
    expect(cvPath("es")).toBe("/es/cv/");
    expect(CV_SEGMENT).toBe("cv");
  });

  it("TSC-AC14: parses the home path with or without the trailing slash", () => {
    expect(parsePath("/es/")).toEqual({ view: "home", locale: "es" });
    expect(parsePath("/es")).toEqual({ view: "home", locale: "es" });
  });

  it("TSC-AC14: parses section and cv paths", () => {
    expect(parsePath("/en/projects/")).toEqual({
      view: "section",
      locale: "en",
      section: "projects",
    });
    expect(parsePath("/en/projects")).toEqual({
      view: "section",
      locale: "en",
      section: "projects",
    });
    expect(parsePath("/es/cv/")).toEqual({ view: "cv", locale: "es" });
  });

  it("TSC-AC14: returns null for paths that are none of the three views", () => {
    for (const path of [
      "/",
      "",
      "/de/",
      "/es/unknown/",
      "/es/projects/extra/",
      "es/projects",
      "/es//projects/",
    ]) {
      expect(parsePath(path), path).toBeNull();
    }
  });

  it("TSC-AC14: toPath is the inverse of parsePath", () => {
    for (const path of ["/es/", "/en/stack/", "/en/cv/"]) {
      const parsed = parsePath(path);
      expect(parsed).not.toBeNull();
      if (parsed !== null) expect(toPath(parsed)).toBe(path);
    }
  });

  it("TSC-AC14: withLocale keeps the view and the section in the other language", () => {
    expect(withLocale("/es/projects/", "en")).toBe("/en/projects/");
    expect(withLocale("/es/cv/", "en")).toBe("/en/cv/");
    expect(withLocale("/en/", "es")).toBe("/es/");
  });

  it("TSC-AC14: withLocale sends an unknown path to the home of the target language", () => {
    expect(withLocale("/algo/desconocido/", "en")).toBe("/en/");
  });
});
