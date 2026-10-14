import { describe, expect, it } from "vitest";

import type { Locale } from "@/shared/contracts/locale";
import type { AnySectionDefinition, BootLine, SectionTextBase } from "@/shared/contracts/section";

import {
  CONTENT_RULES,
  type ContentRule,
  findContentIssues,
  findStringIssues,
  findTranslationIssues,
  formatContentIssues,
} from "./content-integrity";

type Text = SectionTextBase & Readonly<Record<string, unknown>>;

const DESCRIPTION_ES = "Proyectos de ejemplo con su stack, su equipo y sus enlaces públicos.";
const DESCRIPTION_EN = "Sample projects with their stack, their team and their public links.";

const TEXT_ES: Text = {
  meta: { title: "Proyectos", hardwareName: "SSD NVMe", description: DESCRIPTION_ES },
  intro: "Más de 100 pruebas automatizadas y 94 % de cobertura.",
  items: ["Primer elemento", "Segundo elemento"],
};
const TEXT_EN: Text = {
  meta: { title: "Projects", hardwareName: "NVMe SSD", description: DESCRIPTION_EN },
  intro: "Over 100 automated tests and 94% coverage.",
  items: ["First item", "Second item"],
};

const FACTS = {
  projects: [
    {
      id: "habicapital",
      teamSize: 1,
      period: { start: { year: 2024, month: 7 }, end: { year: 2025, month: 1 } },
      link: { id: "code", href: "https://github.com/Onstrax/HabiCapital" },
    },
    { id: "thesis", teamSize: 2, period: { start: { year: 2025 }, end: "present" } },
  ],
  email: "mailto:someone@example.com",
};

const BOOT_LINES: readonly BootLine[] = [{ message: "nvme0n1: 2 projects mounted", status: "ok" }];

interface Overrides {
  readonly facts?: unknown;
  readonly text?: Readonly<Record<Locale, Text>>;
  readonly bootLines?: readonly BootLine[];
}

function section(overrides: Overrides = {}): AnySectionDefinition {
  return {
    componentId: "ssd",
    slug: "projects",
    facts: overrides.facts ?? FACTS,
    text: overrides.text ?? { es: TEXT_ES, en: TEXT_EN },
    bootLines: overrides.bootLines ?? BOOT_LINES,
    Section: () => null,
  };
}

function rulesOf(overrides: Overrides): readonly ContentRule[] {
  return [...new Set(findContentIssues([section(overrides)]).map((issue) => issue.rule))];
}

function withEnglish(changes: Readonly<Record<string, unknown>>): Overrides {
  return { text: { es: TEXT_ES, en: { ...TEXT_EN, ...changes } } };
}

function withBoth(changes: Readonly<Record<string, unknown>>): Overrides {
  return { text: { es: { ...TEXT_ES, ...changes }, en: { ...TEXT_EN, ...changes } } };
}

function withProject(changes: Readonly<Record<string, unknown>>): Overrides {
  return { facts: { projects: [{ ...FACTS.projects[0], ...changes }] } };
}

describe("findContentIssues", () => {
  it("TSC-AC09: reports nothing for sound content", () => {
    expect(formatContentIssues(findContentIssues([section()]))).toBe("");
  });

  it("TSC-AC09: C1 reports a missing key, a different list length and a different kind", () => {
    const withoutIntro: Text = { meta: TEXT_EN.meta, items: TEXT_EN["items"] };
    expect(rulesOf({ text: { es: TEXT_ES, en: withoutIntro } })).toEqual(["C1"]);
    expect(rulesOf(withEnglish({ items: ["First item"] }))).toEqual(["C1"]);
    expect(rulesOf(withEnglish({ items: "First item" }))).toEqual(["C1"]);
  });

  it("TSC-AC09: C2 reports empty strings and stray spaces", () => {
    expect(rulesOf(withEnglish({ items: ["First item", ""] }))).toEqual(["C2"]);
    expect(rulesOf(withEnglish({ items: ["First item ", "Second item"] }))).toEqual(["C2"]);
    expect(rulesOf(withEnglish({ items: ["First  item", "Second item"] }))).toEqual(["C2"]);
  });

  it("TSC-AC09: C3 reports markup inside a string", () => {
    for (const value of [
      "<b>First</b> item",
      "First **item**",
      "First `item`",
      "First __item__",
      "First\nitem",
    ]) {
      expect(rulesOf(withEnglish({ items: [value, "Second item"] })), value).toEqual(["C3"]);
    }
  });

  it("TSC-AC09: C4 reports figures that differ between languages", () => {
    expect(rulesOf(withEnglish({ intro: "Over 110 automated tests and 94% coverage." }))).toEqual([
      "C4",
    ]);
    expect(
      rulesOf(withEnglish({ intro: "Over a hundred automated tests and 94% coverage." })),
    ).toEqual(["C4"]);
  });

  it("TSC-AC09: C4 accepts the same figures written with another decimal sign", () => {
    expect(
      rulesOf({
        text: {
          es: { ...TEXT_ES, intro: "Promedio de 4,2" },
          en: { ...TEXT_EN, intro: "GPA of 4.2" },
        },
      }),
    ).toEqual([]);
  });

  it("TSC-AC09: C5 reports a long string that is identical in both languages", () => {
    expect(rulesOf(withBoth({ intro: "This sentence was never translated" }))).toEqual(["C5"]);
    expect(rulesOf(withBoth({ intro: "Design Thinking" }))).toEqual([]);
  });

  it("TSC-AC09: C6 reports metadata outside its limits", () => {
    const meta = TEXT_EN.meta;
    expect(rulesOf(withEnglish({ meta: { ...meta, title: "A".repeat(41) } }))).toEqual(["C6"]);
    expect(rulesOf(withEnglish({ meta: { ...meta, description: "Too short." } }))).toEqual(["C6"]);
    expect(
      rulesOf(withEnglish({ meta: { ...meta, description: "Long text. ".repeat(20).trim() } })),
    ).toEqual(["C6"]);
    expect(rulesOf(withEnglish({ meta: { ...meta, hardwareName: "" } }))).toContain("C6");
  });

  it("TSC-AC09: C7 reports insecure, malformed and ambiguous links", () => {
    expect(rulesOf({ facts: { link: "http://example.com" } })).toEqual(["C7"]);
    expect(rulesOf({ facts: { link: "https://" } })).toEqual(["C7"]);
    expect(rulesOf({ facts: { link: "mailto:a@b@example.com" } })).toEqual(["C7"]);
    expect(
      rulesOf({ facts: { link: "https://example.com/path", mail: "mailto:a@example.com" } }),
    ).toEqual([]);
  });

  it("TSC-AC09: C8 reports repeated identifiers and identifiers that are not kebab-case", () => {
    expect(rulesOf({ facts: { projects: [{ id: "thesis" }, { id: "thesis" }] } })).toEqual(["C8"]);
    expect(rulesOf({ facts: { projects: [{ id: "HabiCapital" }] } })).toEqual(["C8"]);
    expect(
      rulesOf({ facts: { projects: [{ id: "dental-site" }, { id: "email-blacklist" }] } }),
    ).toEqual([]);
  });

  it("TSC-AC09: C9 reports periods that are out of range, reversed or of mixed precision", () => {
    expect(
      rulesOf(withProject({ period: { start: { year: 1999 }, end: { year: 2024 } } })),
    ).toEqual(["C9"]);
    expect(
      rulesOf(
        withProject({ period: { start: { year: 2025, month: 3 }, end: { year: 2025, month: 1 } } }),
      ),
    ).toEqual(["C9"]);
    expect(
      rulesOf(withProject({ period: { start: { year: 2025 }, end: { year: 2024 } } })),
    ).toEqual(["C9"]);
    expect(
      rulesOf(withProject({ period: { start: { year: 2024, month: 7 }, end: { year: 2025 } } })),
    ).toEqual(["C9"]);
    expect(
      rulesOf(withProject({ period: { start: { year: 2024, month: 13 }, end: "present" } })),
    ).toEqual(["C9"]);
    expect(rulesOf(withProject({ period: { start: "2024", end: "present" } }))).toEqual(["C9"]);
  });

  it("TSC-AC09: C9 accepts an ongoing period of any precision", () => {
    expect(
      rulesOf(withProject({ period: { start: { year: 2022, month: 1 }, end: "present" } })),
    ).toEqual([]);
    expect(rulesOf(withProject({ period: { start: { year: 2022 }, end: "present" } }))).toEqual([]);
  });

  it("TSC-AC09: C10 reports a team size that is not an integer of 1 or more", () => {
    for (const teamSize of [0, 2.5, "2", -1]) {
      expect(rulesOf(withProject({ teamSize })), String(teamSize)).toEqual(["C10"]);
    }
  });

  it("TSC-AC09: C11 reports boot messages that are empty, too long or multi-line", () => {
    expect(rulesOf({ bootLines: [{ message: "", status: "ok" }] })).toEqual(["C11"]);
    expect(rulesOf({ bootLines: [{ message: "x".repeat(97), status: "none" }] })).toEqual(["C11"]);
    expect(rulesOf({ bootLines: [{ message: "x".repeat(96), status: "none" }] })).toEqual([]);
    expect(rulesOf({ bootLines: [{ message: "first\nsecond", status: "ok" }] })).toContain("C11");
  });

  it("TSC-AC09: C12 reports a string of three or more words written in capitals", () => {
    expect(rulesOf(withEnglish({ items: ["FIRST ITEM HERE", "Second item"] }))).toEqual(["C12"]);
    expect(rulesOf({ facts: { stack: ["AWS", "CI/CD", "ECS FARGATE"] } })).toEqual([]);
  });

  it("TSC-AC09: C13 reports an emphasis that is empty, the whole text or not found once", () => {
    const line = (text: string, emphasis: string) => ({ text, emphasis });
    const both = (es: unknown, en: unknown): Overrides => ({
      text: { es: { ...TEXT_ES, lines: [es] }, en: { ...TEXT_EN, lines: [en] } },
    });
    const sound = both(
      line("Más de 100 pruebas", "100 pruebas"),
      line("Over 100 tests", "100 tests"),
    );
    expect(rulesOf(sound)).toEqual([]);
    expect(rulesOf(both(line("Una frase", ""), line("A sentence", "sentence")))).toContain("C13");
    expect(rulesOf(both(line("Una frase", "Una frase"), line("A sentence", "A")))).toEqual(["C13"]);
    expect(rulesOf(both(line("Una frase", "otra"), line("A sentence", "A")))).toEqual(["C13"]);
    expect(rulesOf(both(line("la a y la a", "la a"), line("A sentence", "A")))).toEqual(["C13"]);
  });

  it("TSC-AC09: C13 reports a line emphasized in one language and plain in the other", () => {
    const overrides: Overrides = {
      text: {
        es: { ...TEXT_ES, lines: [{ text: "Una frase larga", emphasis: "frase" }] },
        en: { ...TEXT_EN, lines: ["A long sentence"] },
      },
    };
    expect(rulesOf(overrides)).toEqual(["C13"]);
  });

  it("TSC-AC09: C14 reports a case study with a long title, a description out of range or no decisions", () => {
    const sound = {
      title: "Un caso",
      description: DESCRIPTION_ES,
      problem: ["Un problema"],
      team: "Trabajo individual.",
      contributions: ["Lo hice"],
      decisions: [{ options: "A o B", choice: "A", reason: "Porque sí" }],
      changes: ["Un cambio"],
      outcome: ["Un resultado"],
      learned: ["Una lección"],
    };
    // The same case in both languages, apart from the description, which has five words or more.
    const withCase = (changes: Readonly<Record<string, unknown>>): Overrides => ({
      text: {
        es: { ...TEXT_ES, cases: { thesis: { ...sound, ...changes } } },
        en: {
          ...TEXT_EN,
          cases: { thesis: { ...sound, description: DESCRIPTION_EN, ...changes } },
        },
      },
    });
    expect(rulesOf(withCase({}))).toEqual([]);
    expect(rulesOf(withCase({ title: "x".repeat(41) }))).toEqual(["C14"]);
    expect(rulesOf(withCase({ description: "Corta." }))).toEqual(["C14"]);
    expect(rulesOf(withCase({ decisions: [] }))).toEqual(["C14"]);
    expect(rulesOf(withCase({ outcome: [] }))).toEqual(["C14"]);
  });

  it("covers the fourteen rules", () => {
    expect(CONTENT_RULES).toHaveLength(14);
  });

  it("names the section, the path and the rule of every issue", () => {
    const issues = findContentIssues([section(withProject({ teamSize: 0 }))]);
    expect(issues).toEqual([
      {
        section: "projects",
        path: "facts.projects[0].teamSize",
        rule: "C10",
        detail: "the team size is an integer of 1 or more",
      },
    ]);
    expect(formatContentIssues(issues)).toBe(
      "projects facts.projects[0].teamSize [C10] the team size is an integer of 1 or more",
    );
  });
});

describe("findStringIssues", () => {
  it("accepts a clean string", () => {
    expect(findStringIssues("Sección anterior: Proyectos")).toEqual([]);
  });

  it("reports each broken rule once", () => {
    expect(findStringIssues(" <B>LOUD AND WRONG</B>").map((issue) => issue.rule)).toEqual([
      "C2",
      "C3",
      "C12",
    ]);
  });
});

describe("findTranslationIssues", () => {
  it("accepts a translated pair with the same figures", () => {
    expect(findTranslationIssues("2 de 6 secciones visitadas", "2 of 6 sections visited")).toEqual(
      [],
    );
  });

  it("reports different figures and untranslated text", () => {
    expect(findTranslationIssues("Equipo de 6", "Team of 5").map((issue) => issue.rule)).toEqual([
      "C4",
    ]);
    expect(
      findTranslationIssues("one two three four five", "one two three four five").map(
        (issue) => issue.rule,
      ),
    ).toEqual(["C5"]);
  });
});
