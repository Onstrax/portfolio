import { describe, expect, it } from "vitest";

import {
  classifyVerification,
  findCitations,
  findTraceabilityIssues,
  formatIssues,
  parseSpec,
  type TextFile,
} from "./trace";

function spec(path: string, status: string, rows: readonly string[]): TextFile {
  const header = `# Sample\n\n| Campo | Valor |\n| --- | --- |\n| Estado | ${status} |\n\n`;
  const table = "| ID | Criterio | Verificación |\n| --- | --- | --- |\n";
  return { path, content: `${header}${table}${rows.join("\n")}\n` };
}

// Titles are assembled at runtime so that the real traceability test, which scans this file,
// does not read the sample identifiers as citations.
function testFile(path: string, ...titles: readonly string[]): TextFile {
  const open = 'it("';
  return { path, content: titles.map((title) => `${open}${title}", () => {});`).join("\n") };
}

const AUTOMATIC = "| AAA-AC01 | Returns the list. | Prueba unitaria |";
const GATE = "| AAA-AC02 | The command passes. | Ejecución en CI |";
const MANUAL = "| AAA-AC03 | The author checks it. | Revisión manual del autor |";

describe("classifyVerification", () => {
  it("TST-AC11: classifies automatic, gate and manual verifications by their first term", () => {
    expect(classifyVerification("Prueba unitaria que lee el archivo")).toBe("automatic");
    expect(classifyVerification("Prueba E2E, solo en Chromium")).toBe("automatic");
    expect(classifyVerification("Prueba de exportación")).toBe("automatic");
    expect(classifyVerification("Ejecución de `pnpm assets:check`")).toBe("gate");
    expect(classifyVerification("Revisión manual del autor")).toBe("manual");
    expect(classifyVerification("Medición manual con GIMP")).toBe("manual");
  });

  it("returns null when the text does not start with a term of the vocabulary", () => {
    expect(classifyVerification("Se comprueba con una prueba unitaria")).toBeNull();
    expect(classifyVerification("Pruebas unitarias")).toBeNull();
    expect(classifyVerification("")).toBeNull();
  });
});

describe("parseSpec", () => {
  it("reads the status and the criteria, keeping escaped pipes inside a cell", () => {
    const parsed = parseSpec(
      spec("specs/a.md", "Implementada", [
        "| AAA-AC01 | Accepts `string \\| null` values. | Prueba unitaria |",
        GATE,
      ]),
    );
    expect(parsed.isImplemented).toBe(true);
    expect(parsed.criteria.map((criterion) => [criterion.id, criterion.verificationClass])).toEqual(
      [
        ["AAA-AC01", "automatic"],
        ["AAA-AC02", "gate"],
      ],
    );
  });

  it("does not treat an approved spec as implemented", () => {
    expect(parseSpec(spec("specs/a.md", "Aprobada", [AUTOMATIC])).isImplemented).toBe(false);
  });
});

describe("findCitations", () => {
  it("reads one or several identifiers at the start of a test title", () => {
    const file = testFile("a.test.ts", "AAA-AC01: does one thing", "AAA-AC02, BBB-AC10: does two");
    expect(findCitations(file)).toEqual(["AAA-AC01", "AAA-AC02", "BBB-AC10"]);
  });

  it("ignores identifiers that are not at the start of a title", () => {
    expect(findCitations(testFile("a.test.ts", "covers the case of AAA-AC01"))).toEqual([]);
  });
});

describe("findTraceabilityIssues", () => {
  it("TST-AC11: reports an automatic criterion of an implemented spec that no test cites", () => {
    const issues = findTraceabilityIssues(
      [spec("specs/a.md", "Implementada", [AUTOMATIC, GATE, MANUAL])],
      [],
    );
    expect(issues.map((issue) => [issue.kind, issue.id])).toEqual([
      ["uncited-criterion", "AAA-AC01"],
    ]);
  });

  it("TST-AC11: reports a test that cites a criterion no spec defines", () => {
    const issues = findTraceabilityIssues(
      [spec("specs/a.md", "Aprobada", [AUTOMATIC])],
      [testFile("a.test.ts", "AAA-AC99: checks nothing real")],
    );
    expect(issues.map((issue) => [issue.kind, issue.id])).toEqual([
      ["unknown-criterion", "AAA-AC99"],
    ]);
  });

  it("TST-AC11: reports a verification outside the vocabulary, in any spec", () => {
    const issues = findTraceabilityIssues(
      [spec("specs/a.md", "Aprobada", ["| AAA-AC01 | Works. | Se revisa a mano |"])],
      [],
    );
    expect(issues.map((issue) => [issue.kind, issue.id])).toEqual([
      ["invalid-verification", "AAA-AC01"],
    ]);
  });

  it("TST-AC11: reports a criterion defined in more than one spec", () => {
    const issues = findTraceabilityIssues(
      [spec("specs/a.md", "Aprobada", [AUTOMATIC]), spec("specs/b.md", "Aprobada", [AUTOMATIC])],
      [],
    );
    expect(issues.map((issue) => [issue.kind, issue.id, issue.file])).toEqual([
      ["duplicate-criterion", "AAA-AC01", "specs/b.md"],
    ]);
  });

  it("reports nothing when every automatic criterion of an implemented spec is cited", () => {
    const issues = findTraceabilityIssues(
      [spec("specs/a.md", "Implementada", [AUTOMATIC, GATE, MANUAL])],
      [testFile("a.test.ts", "AAA-AC01: returns the list")],
    );
    expect(issues).toEqual([]);
  });

  it("does not require tests for the criteria of a spec that is not implemented", () => {
    expect(findTraceabilityIssues([spec("specs/a.md", "Aprobada", [AUTOMATIC])], [])).toEqual([]);
  });
});

describe("formatIssues", () => {
  it("prints one line per issue with its file and kind", () => {
    const text = formatIssues([
      { kind: "unknown-criterion", id: "AAA-AC99", file: "a.test.ts", message: "not defined" },
    ]);
    expect(text).toBe("a.test.ts [unknown-criterion] not defined");
  });
});
