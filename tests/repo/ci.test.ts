import { describe, expect, it } from "vitest";

import { readRepoFile } from "./files";

const WORKFLOW = readRepoFile(".github/workflows/ci.yml");
const PINNED_ACTION = /^(?:actions|pnpm)\/[\w.-]+@[0-9a-f]{40}$/;

/** Reads each job of the workflow with the jobs it needs, from the two-space indented YAML. */
function parseJobs(text: string): Readonly<Record<string, readonly string[]>> {
  const jobs: Record<string, readonly string[]> = {};
  let insideJobs = false;
  let current: string | undefined;
  for (const line of text.split("\n")) {
    if (/^\S/.test(line)) insideJobs = line.startsWith("jobs:");
    if (!insideJobs) continue;
    const job = /^ {2}([\w-]+):\s*$/.exec(line)?.[1];
    if (job !== undefined) {
      current = job;
      jobs[job] = [];
      continue;
    }
    const needs = /^ {4}needs:\s*(.+)$/.exec(line)?.[1];
    if (needs !== undefined && current !== undefined) {
      jobs[current] = needs
        .replace(/[[\]]/g, "")
        .split(",")
        .map((name) => name.trim());
    }
  }
  return jobs;
}

describe("ci.yml", () => {
  it("TST-AC13: has the six jobs with their dependencies", () => {
    expect(parseJobs(WORKFLOW)).toEqual({
      static: [],
      unit: [],
      build: [],
      e2e: ["build"],
      lighthouse: ["build"],
      "ci-ok": ["static", "unit", "build", "e2e", "lighthouse"],
    });
  });

  it("TST-AC13: has read-only permissions, pinned actions and no secrets", () => {
    expect(WORKFLOW).toMatch(/^permissions:\n {2}contents: read\n\n/m);
    const actions = [...WORKFLOW.matchAll(/\buses:\s*(\S+)/g)].map((match) => match[1] ?? "");
    expect(actions.length).toBeGreaterThan(0);
    for (const action of actions) {
      expect(action).toMatch(PINNED_ACTION);
    }
    expect(WORKFLOW).not.toContain("secrets.");
  });
});
