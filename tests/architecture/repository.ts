import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { SourceFile } from "./detect";

export const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));

const TEXT_FILE = /\.(?:ts|tsx|mjs|css|svg|json|md|yml|yaml)$/;

function walk(directory: string): readonly string[] {
  const paths: string[] = [];
  for (const entry of readdirSync(path.join(REPO_ROOT, directory), { withFileTypes: true })) {
    const relative = `${directory}/${entry.name}`;
    if (entry.isDirectory()) paths.push(...walk(relative));
    else paths.push(relative);
  }
  return paths;
}

/** Every file under the given top-level folders, as repository-relative paths. */
export function listPaths(folders: readonly string[]): readonly string[] {
  return folders.flatMap((folder) => walk(folder)).sort();
}

/** The text files under the given top-level folders, with their content. */
export function readSources(folders: readonly string[]): readonly SourceFile[] {
  return listPaths(folders)
    .filter((file) => TEXT_FILE.test(file))
    .map((file) => ({ path: file, content: readFileSync(path.join(REPO_ROOT, file), "utf8") }));
}
