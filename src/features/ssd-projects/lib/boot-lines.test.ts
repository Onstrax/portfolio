import { describe, expect, it } from "vitest";

import { projectsEn } from "../content/en";
import { projectsEs } from "../content/es";
import { projectsFacts } from "../content/facts";
import { ssdProjectsSection } from "../index";
import { buildProjectsBootLines } from "./boot-lines";
import { projectName } from "./project-name";

describe("projects boot lines", () => {
  it("SSD-AC07: are exactly the two lines of the spec", () => {
    expect(ssdProjectsSection.bootLines).toEqual([
      { message: "nvme0n1: 9 projects mounted, 4 featured", status: "ok" },
      { message: "Loading thesis: post-quantum zero-knowledge authentication", status: "none" },
    ]);
  });

  it("omits the second line when no project is featured", () => {
    const compact = projectsFacts.projects.filter((project) => !project.featured);
    expect(buildProjectsBootLines({ projects: compact }, projectsEn)).toEqual([
      { message: "nvme0n1: 5 projects mounted, 0 featured", status: "ok" },
    ]);
  });
});

describe("projectName", () => {
  it("prefers the proper name of the facts and falls back to the name of the language", () => {
    const [thesis, andespace] = projectsFacts.projects;
    expect(projectName(andespace, projectsEs)).toBe("AndeSpace");
    expect(projectName(thesis, projectsEs)).toBe(
      "Tesis: autenticación poscuántica de conocimiento cero",
    );
    expect(projectName(thesis, projectsEn)).toBe(
      "Thesis: post-quantum zero-knowledge authentication",
    );
  });

  it("returns an empty string for a project without any name", () => {
    const nameless = { ...projectsFacts.projects[0], id: "andespace" as const };
    expect(projectName(nameless, projectsEs)).toBe("");
  });
});
