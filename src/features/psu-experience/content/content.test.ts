import { describe, expect, it } from "vitest";

import { experienceEn } from "./en";
import { experienceEs } from "./es";
import { experienceFacts } from "./facts";

describe("experience facts", () => {
  it("PSU-AC01: holds the three jobs in order, all individual, and the leadership period", () => {
    expect(experienceFacts.jobs.map((job) => job.id)).toEqual([
      "teaching-assistant",
      "freelance",
      "tutor",
    ]);
    expect(experienceFacts.jobs.map((job) => job.period)).toEqual([
      { start: { year: 2026, month: 1 }, end: "present" },
      { start: { year: 2024, month: 7 }, end: { year: 2025, month: 1 } },
      { start: { year: 2022, month: 1 }, end: "present" },
    ]);
    expect(experienceFacts.jobs.map((job) => job.teamSize)).toEqual([1, 1, 1]);
    expect(experienceFacts.jobs[0].organization).toBe("Universidad de los Andes");
    expect(experienceFacts.jobs[1].stack).toEqual(["Python", "Selenium"]);
    expect(experienceFacts.jobs[1].repository).toBe("public");
    expect(experienceFacts.jobs[1].repositoryLink).toEqual({
      id: "repository",
      href: "https://github.com/PortafolioSor0/All-Inclusive",
    });
    expect(experienceFacts.leadershipPeriod).toEqual({
      start: { year: 2022 },
      end: { year: 2024 },
    });
  });
});

describe("experience texts", () => {
  it("PSU-AC02: each language has 1, 2 and 3 highlights for the jobs, and six skills", () => {
    for (const text of [experienceEs, experienceEn]) {
      expect(experienceFacts.jobs.map((job) => text.jobs[job.id].highlights.length)).toEqual([
        1, 2, 3,
      ]);
      expect(text.skills).toHaveLength(6);
    }
  });

  it("PSU-AC02: uses the section and hardware names of VSN §4", () => {
    expect([experienceEs.meta.title, experienceEs.meta.hardwareName]).toEqual([
      "Experiencia",
      "Fuente de poder (PSU)",
    ]);
    expect([experienceEn.meta.title, experienceEn.meta.hardwareName]).toEqual([
      "Experience",
      "Power supply (PSU)",
    ]);
  });

  it("translates the job titles with the fixed terms of I18N", () => {
    expect(experienceFacts.jobs.map((job) => experienceEs.jobs[job.id].role)).toEqual([
      "Monitor académico",
      "Desarrollador freelance",
      "Tutor particular de programación",
    ]);
    expect(experienceFacts.jobs.map((job) => experienceEn.jobs[job.id].role)).toEqual([
      "Teaching Assistant",
      "Freelance Software Developer",
      "Private Programming Tutor",
    ]);
  });
});
