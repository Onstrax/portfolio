import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { readRepoFile, REPO_ROOT } from "./files";

const README = readRepoFile("README.md");

describe("README.md", () => {
  it("links only to files that exist in the repository", () => {
    const targets = [...README.matchAll(/\]\(([^)\s]+)\)/g)]
      .map((match) => match[1] ?? "")
      .filter((target) => !/^https?:\/\//.test(target));

    // The scene image carries the version of its master in its name: a new master renames it.
    expect(targets.some((target) => target.startsWith("public/scene/"))).toBe(true);
    for (const target of targets) {
      expect(existsSync(path.join(REPO_ROOT, target)), target).toBe(true);
    }
  });

  it("has its sections in the order that the deployment spec asks for", () => {
    const headings = [...README.matchAll(/^## (.+)$/gm)].map((match) => match[1]);

    expect(headings).toEqual(["How it is built", "Stack", "Commands", "Status", "License"]);
    // Before them: the link to the published site and, after it, the image of the scene.
    const link = README.indexOf("https://juan-esteban-alvarez.pages.dev");
    const image = README.indexOf("![");
    expect(link).toBeGreaterThan(0);
    expect(image).toBeGreaterThan(link);
    expect(README.indexOf("\n## ")).toBeGreaterThan(image);
  });
});
