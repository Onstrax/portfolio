import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));

const SKIPPED_FOLDERS = [".git", ".next", "node_modules", "out", "coverage", "test-results"];

export function readRepoFile(file: string): string {
  return readFileSync(path.join(REPO_ROOT, file), "utf8");
}

export function readJson(file: string): unknown {
  return JSON.parse(readRepoFile(file));
}

/** Names of the files in the repository that match the pattern, skipping generated folders. */
export function findFiles(pattern: RegExp, directory = ""): readonly string[] {
  const found: string[] = [];
  for (const entry of readdirSync(path.join(REPO_ROOT, directory), { withFileTypes: true })) {
    const relative = directory === "" ? entry.name : `${directory}/${entry.name}`;
    if (entry.isDirectory()) {
      if (!SKIPPED_FOLDERS.includes(entry.name)) found.push(...findFiles(pattern, relative));
    } else if (pattern.test(entry.name)) {
      found.push(relative);
    }
  }
  return found;
}

export function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
