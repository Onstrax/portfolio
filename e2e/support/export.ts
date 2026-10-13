import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/** Folder with the exported site (`pnpm build`). */
export const OUT_DIR = path.resolve("out");

/** Documents that Next.js writes for its own use and that are not routes of the site (SYS-AC01). */
export const NEXT_INTERNAL_DOCUMENTS: readonly string[] = [
  "404/index.html",
  "_not-found/index.html",
];

function walk(directory: string): readonly string[] {
  const files: string[] = [];
  for (const entry of readdirSync(path.join(OUT_DIR, directory), { withFileTypes: true })) {
    const relative = directory === "" ? entry.name : `${directory}/${entry.name}`;
    if (entry.isDirectory()) files.push(...walk(relative));
    else files.push(relative);
  }
  return files;
}

/** Every HTML document of the export, as paths relative to `out/`. */
export function listHtmlDocuments(): readonly string[] {
  return walk("")
    .filter((file) => file.endsWith(".html"))
    .sort();
}

export function readExportedFile(file: string): string {
  return readFileSync(path.join(OUT_DIR, file), "utf8");
}

/** URL path under which a static host serves a document. */
export function routeOfDocument(file: string): string {
  if (file === "index.html") return "/";
  if (file.endsWith("/index.html")) return `/${file.slice(0, -"index.html".length)}`;
  return `/${file}`;
}

export type HeaderRules = ReadonlyMap<string, ReadonlyMap<string, string>>;

/** Parses a `_headers` file: a route line followed by indented `Name: value` lines. */
export function parseHeaderRules(text: string): HeaderRules {
  const rules = new Map<string, Map<string, string>>();
  let current: Map<string, string> | undefined;
  for (const line of text.split("\n")) {
    if (line.trim() === "") continue;
    if (!/^\s/.test(line)) {
      current = new Map();
      rules.set(line.trim(), current);
      continue;
    }
    const separator = line.indexOf(":");
    if (current === undefined || separator === -1) continue;
    current.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
  }
  return rules;
}

const EXECUTABLE_TYPES = ["", "module", "text/javascript", "application/javascript"];

/** Content of the inline scripts that a browser executes, in document order. */
export function inlineScripts(html: string): readonly string[] {
  const scripts: string[] = [];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attributes = match[1] ?? "";
    const content = match[2] ?? "";
    if (/\ssrc\s*=/i.test(attributes) || content === "") continue;
    const type = /\stype\s*=\s*["']?([^"'\s>]*)/i.exec(attributes)?.[1]?.toLowerCase() ?? "";
    if (EXECUTABLE_TYPES.includes(type)) scripts.push(content);
  }
  return scripts;
}

export function cspHash(content: string): string {
  return `'sha256-${createHash("sha256").update(content, "utf8").digest("base64")}'`;
}

/** Splits a Content-Security-Policy into its directives: name → list of values. */
export function parsePolicy(policy: string): ReadonlyMap<string, readonly string[]> {
  const directives = new Map<string, readonly string[]>();
  for (const part of policy.split(";")) {
    const [name, ...values] = part.trim().split(/\s+/);
    if (name !== undefined && name !== "") directives.set(name, values);
  }
  return directives;
}
