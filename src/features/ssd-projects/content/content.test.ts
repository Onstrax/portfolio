import { describe, expect, it } from "vitest";

import { CASE_STUDY_IDS } from "@/shared/contracts/ids";

import { PROJECT_IDS, type ProjectId } from "../types";
import { projectsEn } from "./en";
import { projectsEs } from "./es";
import { projectsFacts } from "./facts";

const { projects } = projectsFacts;

describe("projects facts", () => {
  it("SSD-AC01: holds the eleven projects in order with their category, team and repository", () => {
    expect(projects.map((project) => project.id)).toEqual([...PROJECT_IDS]);
    expect(projects.map((project) => project.featured)).toEqual([
      true,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ]);
    expect(projects.map((project) => project.teamSize)).toEqual([2, 6, 1, 1, 4, 4, 3, 5, 2, 3, 3]);
    expect(projects.map((project) => project.repository)).toEqual([
      "public",
      "public",
      "private",
      "public",
      "private",
      "public",
      "public",
      "private",
      "private",
      "public",
      "public",
    ]);
  });

  it("SSD-AC01: holds the stack of every project", () => {
    expect(projects.map((project): readonly string[] => project.stack)).toEqual([
      ["Python", "SageMath", "LaTeX"],
      ["Flutter", "FastAPI", "PostgreSQL", "GitHub Actions"],
      ["Next.js", "TypeScript", "Tailwind CSS", "Leaflet", "Netlify"],
      ["Python", "FastAPI", "Next.js", "PostgreSQL", "Docker"],
      ["GCP", "GitHub Actions", "CI/CD"],
      ["AWS", "GitHub Actions", "CI/CD"],
      ["Angular"],
      ["Angular", "Spring", "MySQL"],
      ["Java", "Python"],
      ["Python", "pandas", "FastAPI", "SQLAlchemy", "SQLite"],
      ["Python", "scikit-learn", "FastAPI", "Next.js"],
    ]);
  });

  it("SSD-AC01: holds the twelve links with their exact addresses", () => {
    const links = projects.flatMap((project) =>
      project.links.map((link) => `${project.id} ${link.id} ${link.href}`),
    );
    expect(links).toEqual([
      "thesis repository https://github.com/CesarAAC/Tesis-ZPK-LWE-Autentication",
      "andespace flutter https://github.com/G33-Moviles-2026-1/G33-Flutter-Moviles-2026-1",
      "andespace backend https://github.com/G33-Moviles-2026-1/G33-Backend-Moviles-2026-1",
      "andespace wiki https://github.com/G33-Moviles-2026-1/Wiki",
      "dental-site live-site https://martha-landing.netlify.app/",
      "habicapital code https://github.com/Onstrax/HabiCapital",
      "email-blacklist repository https://github.com/DevOps-Misw4304-202610/Proyecto1",
      "ahorrapp frontend https://github.com/Onstrax/AhorrApp",
      "ahorrapp backend https://github.com/Onstrax/AhorrApp-Backend",
      "ahorrapp landing https://github.com/Onstrax/Ahorrapp-Landing",
      "respiratory-etl repository https://github.com/Onstrax/ETL",
      "sdg-text-classifier repository https://github.com/Onstrax/Analitica-de-textos",
    ]);
  });
});

describe("projects names", () => {
  it("SSD-AC02: every project has a proper name in the facts or a name in both languages, never both", () => {
    for (const project of projects) {
      const hasProperName = "properName" in project;
      expect("name" in projectsEs.projects[project.id], project.id).toBe(!hasProperName);
      expect("name" in projectsEn.projects[project.id], project.id).toBe(!hasProperName);
    }
    expect(
      projects.filter((project) => "properName" in project).map((project) => project.id),
    ).toEqual(["andespace", "habicapital", "ahorrapp", "dogspa"]);
  });
});

describe("projects texts", () => {
  it("SSD-AC03: both languages have the same highlights, awards and notes per project", () => {
    for (const text of [projectsEs, projectsEn]) {
      expect(PROJECT_IDS.map((id) => text.projects[id].highlights.length)).toEqual([
        2, 2, 3, 2, 1, 1, 1, 1, 2, 1, 2,
      ]);
      expect(PROJECT_IDS.filter((id) => "award" in text.projects[id])).toEqual([
        "andespace",
        "ahorrapp",
        "dogspa",
        "algorithms",
      ]);
      expect(PROJECT_IDS.filter((id) => "note" in text.projects[id])).toEqual(["thesis"]);
    }
  });

  it("uses the section and hardware names of VSN §4", () => {
    expect([projectsEs.meta.title, projectsEs.meta.hardwareName]).toEqual([
      "Proyectos",
      "SSD NVMe",
    ]);
    expect([projectsEn.meta.title, projectsEn.meta.hardwareName]).toEqual(["Projects", "NVMe SSD"]);
  });

  it("separates the percentage sign with a non-breaking space in Spanish only (I18N-R40)", () => {
    expect(projectsEs.projects.habicapital.highlights[1]).toEqual({
      text: expect.stringContaining("~94 % de cobertura") as unknown,
      emphasis: "~94 % de cobertura reportada",
    });
    expect(projectsEn.projects.habicapital.highlights[1]).toEqual({
      text: expect.stringContaining("~94% reported") as unknown,
      emphasis: "~94% reported code coverage",
    });
  });
});

describe("case studies", () => {
  it("TSC-AC19: every case study is a project of this section", () => {
    // Compiles only while every `CaseStudyId` is also a `ProjectId`.
    const projectIds: readonly ProjectId[] = CASE_STUDY_IDS;
    for (const id of projectIds) {
      expect(PROJECT_IDS).toContain(id);
    }
  });

  it("SSD-AC11: both languages hold one case per case study, with team contributions only for team work", () => {
    for (const text of [projectsEs, projectsEn]) {
      expect(Object.keys(text.cases)).toEqual([...CASE_STUDY_IDS]);
      for (const id of CASE_STUDY_IDS) {
        const project = projects.find((item) => item.id === id);
        const isTeamWork = project !== undefined && project.teamSize > 1;
        expect("teamContributions" in text.cases[id], id).toBe(isTeamWork);
      }
    }
    expect(CASE_STUDY_IDS.filter((id) => "teamContributions" in projectsEs.cases[id])).toEqual([
      "thesis",
      "andespace",
    ]);
  });

  it("SSD-AC11: holds the texts of the spec, with the emphasized outcomes", () => {
    expect(projectsEs.cases.thesis.title).toBe("Tesis de autenticación poscuántica");
    expect(projectsEn.cases["dental-site"].title).toBe("Dental practice website");
    expect(projectsEs.cases.thesis.outcome[1]).toEqual({
      text: "El tiempo de ejecución pasó de varios segundos a menos de medio segundo.",
      emphasis: "menos de medio segundo",
    });
    expect(projectsEn.cases.andespace.outcome[0]).toEqual({
      text: "Best Project in its section in Mobile Application Development.",
      emphasis: "Best Project in its section",
    });
    expect(projectsEs.cases["dental-site"].decisions[0]?.choice).toBe(
      "Reescribir los textos con un lenguaje cercano al paciente.",
    );
    expect(projectsEs.caseLinkLabel).toBe("Leer el caso completo");
    expect(projectsEn.caseLinkLabel).toBe("Read the full case study");
  });
});
