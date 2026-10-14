import { describe, expect, it } from "vitest";

import { readRepoFile } from "./files";

const WORKFLOW = readRepoFile(".github/workflows/deploy.yml");
const PINNED_ACTION = /^(?:actions|pnpm|cloudflare)\/[\w.-]+@[0-9a-f]{40}$/;

/** The lines of the top-level block that starts with `key:`, without the line of the key. */
function topLevelBlock(text: string, key: string): readonly string[] {
  const lines = text.split("\n");
  const start = lines.indexOf(`${key}:`);
  if (start === -1) return [];
  const end = lines.findIndex((line, index) => index > start && /^\S/.test(line));
  return lines.slice(start + 1, end === -1 ? undefined : end).filter((line) => line.trim() !== "");
}

describe("deploy.yml", () => {
  it("DEP-AC06: is triggered only by a CI run on main and by hand", () => {
    expect(topLevelBlock(WORKFLOW, "on")).toEqual([
      "  workflow_run:",
      "    workflows: [CI]",
      "    types: [completed]",
      "    branches: [main]",
      "  workflow_dispatch:",
    ]);
  });

  it("DEP-AC06: publishes only a commit of main whose CI ended well", () => {
    expect(WORKFLOW).toContain("github.event.workflow_run.conclusion == 'success'");
    expect(WORKFLOW).toContain("github.event.workflow_run.head_branch == 'main'");
    expect(WORKFLOW).toContain("github.ref == 'refs/heads/main'");
    // A run started by hand asks the commit itself for the result of its `ci-ok` job.
    expect(WORKFLOW).toContain("check-runs?check_name=ci-ok");
    expect(WORKFLOW).toContain('test "${conclusion}" = "success"');
  });

  it("DEP-AC06: uses the two secrets of the host and no other", () => {
    const secrets = [...WORKFLOW.matchAll(/\bsecrets\.(\w+)/g)].map((match) => match[1]);

    expect([...new Set(secrets)].sort()).toEqual(["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN"]);
    expect(topLevelBlock(WORKFLOW, "permissions")).toEqual(["  contents: read", "  checks: read"]);
  });

  it("DEP-AC06: pins every action to a commit of an allowed organization", () => {
    const actions = [...WORKFLOW.matchAll(/\buses:\s*(\S+)/g)].map((match) => match[1] ?? "");

    expect(actions.length).toBeGreaterThan(0);
    for (const action of actions) {
      expect(action).toMatch(PINNED_ACTION);
    }
  });

  it("DEP-AC06: refuses a provisional master before it builds, and checks the site at the end", () => {
    const steps = [
      "pnpm install --frozen-lockfile",
      "pnpm assets:check --release",
      "pnpm build",
      "pages deploy out",
      "node scripts/smoke-test.mjs",
    ].map((step) => WORKFLOW.indexOf(step));

    expect(steps.every((position) => position !== -1)).toBe(true);
    expect(steps).toEqual([...steps].sort((a, b) => a - b));
    expect(WORKFLOW).toMatch(/^ {2}WRANGLER_VERSION: \d+\.\d+\.\d+$/m);
    expect(WORKFLOW).toContain("--ignore-scripts");
  });
});
