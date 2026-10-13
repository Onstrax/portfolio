// Traceability between acceptance criteria and tests (TST §4.7). Pure functions over text.

export interface TextFile {
  readonly path: string;
  readonly content: string;
}

export type VerificationClass = "automatic" | "gate" | "manual";

export interface Criterion {
  readonly id: string;
  readonly spec: string;
  readonly verification: string;
  /** `null` when the verification does not start with a term of the vocabulary. */
  readonly verificationClass: VerificationClass | null;
}

export interface ParsedSpec {
  readonly path: string;
  readonly isImplemented: boolean;
  readonly criteria: readonly Criterion[];
}

export interface TraceabilityIssue {
  readonly kind:
    "uncited-criterion" | "unknown-criterion" | "invalid-verification" | "duplicate-criterion";
  readonly id: string;
  readonly file: string;
  readonly message: string;
}

/** Vocabulary of README §4.5: the first words of the "Verificación" column decide the class. */
const VOCABULARY: readonly (readonly [string, VerificationClass])[] = [
  ["Prueba unitaria", "automatic"],
  ["Prueba de componente", "automatic"],
  ["Prueba de arquitectura", "automatic"],
  ["Prueba de script", "automatic"],
  ["Prueba E2E", "automatic"],
  ["Prueba de exportación", "automatic"],
  ["Ejecución", "gate"],
  ["Revisión manual", "manual"],
  ["Medición manual", "manual"],
];

const CRITERION_ID = "[A-Z][A-Z0-9]*-AC\\d+";
const CRITERION_ROW = new RegExp(`^\\|\\s*(${CRITERION_ID})\\s*\\|`);
const STATUS_ROW = /^\|\s*Estado\s*\|\s*([^|]+?)\s*\|/m;
const CITATION = new RegExp(
  `\\(\\s*["'\`]((?:${CRITERION_ID})(?:\\s*,\\s*(?:${CRITERION_ID}))*):`,
  "g",
);

export function classifyVerification(verification: string): VerificationClass | null {
  const text = verification.trim();
  for (const [term, verificationClass] of VOCABULARY) {
    // The term must be a whole prefix: "Prueba unitaria:" matches, "Prueba unitarias" does not.
    if (text.startsWith(term) && !/\p{L}/u.test(text.charAt(term.length))) {
      return verificationClass;
    }
  }
  return null;
}

export function parseSpec(file: TextFile): ParsedSpec {
  const status = STATUS_ROW.exec(file.content)?.[1] ?? "";
  const criteria: Criterion[] = [];
  for (const line of file.content.split("\n")) {
    const id = CRITERION_ROW.exec(line)?.[1];
    if (id === undefined) continue;
    const cells = line
      .split(/(?<!\\)\|/)
      .map((cell) => cell.trim())
      .filter((cell) => cell !== "");
    const verification = cells.length >= 3 ? (cells.at(-1) ?? "") : "";
    criteria.push({
      id,
      spec: file.path,
      verification,
      verificationClass: classifyVerification(verification),
    });
  }
  return { path: file.path, isImplemented: status.startsWith("Implementada"), criteria };
}

/** Criteria cited at the start of a test title, such as `"SYS-AC05, SYS-AC06: ..."`. */
export function findCitations(file: TextFile): readonly string[] {
  const ids: string[] = [];
  for (const match of file.content.matchAll(CITATION)) {
    for (const id of (match[1] ?? "").split(",")) ids.push(id.trim());
  }
  return ids;
}

export function findTraceabilityIssues(
  specs: readonly TextFile[],
  tests: readonly TextFile[],
): readonly TraceabilityIssue[] {
  const issues: TraceabilityIssue[] = [];
  const parsed = specs.map(parseSpec);
  const definedIn = new Map<string, string>();

  for (const spec of parsed) {
    for (const criterion of spec.criteria) {
      const previous = definedIn.get(criterion.id);
      if (previous !== undefined) {
        issues.push({
          kind: "duplicate-criterion",
          id: criterion.id,
          file: spec.path,
          message: `${criterion.id} is already defined in ${previous}`,
        });
        continue;
      }
      definedIn.set(criterion.id, spec.path);
      if (criterion.verificationClass === null) {
        issues.push({
          kind: "invalid-verification",
          id: criterion.id,
          file: spec.path,
          message: `the verification of ${criterion.id} does not start with a term of README §4.5: "${criterion.verification}"`,
        });
      }
    }
  }

  const cited = new Set<string>();
  for (const test of tests) {
    for (const id of findCitations(test)) {
      cited.add(id);
      if (!definedIn.has(id)) {
        issues.push({
          kind: "unknown-criterion",
          id,
          file: test.path,
          message: `a test cites ${id}, which no spec defines`,
        });
      }
    }
  }

  for (const spec of parsed) {
    if (!spec.isImplemented) continue;
    for (const criterion of spec.criteria) {
      if (criterion.verificationClass === "automatic" && !cited.has(criterion.id)) {
        issues.push({
          kind: "uncited-criterion",
          id: criterion.id,
          file: spec.path,
          message: `${criterion.id} belongs to an implemented spec and no test cites it`,
        });
      }
    }
  }
  return issues;
}

export function formatIssues(issues: readonly TraceabilityIssue[]): string {
  return issues.map((issue) => `${issue.file} [${issue.kind}] ${issue.message}`).join("\n");
}
