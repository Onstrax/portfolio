import { describe, expect, it } from "vitest";

import { readSources } from "../architecture/repository";
import { findTraceabilityIssues, formatIssues } from "./trace";

const SPECS = readSources(["specs"]).filter((file) => file.path.endsWith(".md"));
const TESTS = readSources(["src", "tests", "e2e"]).filter((file) =>
  /\.(?:test\.tsx?|spec\.ts)$/.test(file.path),
);

describe("traceability between specs and tests", () => {
  it("TST-AC12: every cited criterion exists and every implemented spec is fully covered", () => {
    expect(SPECS.length).toBeGreaterThan(20);
    expect(formatIssues(findTraceabilityIssues(SPECS, TESTS))).toBe("");
  });
});
