// Detection logic of the architecture tests (STR-R29, STR-R30). Every function is pure: it receives
// the files as data and returns the violations it finds, so each rule can be proven on examples.

export interface SourceFile {
  /** Path relative to the repository root, with forward slashes. */
  readonly path: string;
  readonly content: string;
}

export interface Violation {
  /** Acceptance criterion that the violation breaks. */
  readonly rule: string;
  readonly file: string;
  readonly line: number;
  readonly message: string;
}

export const SHELL_FEATURES = [
  "boot-sequence",
  "motherboard-scene",
  "detail-panel",
  "settings",
  "simple-view",
] as const;

export const SECTION_FEATURES = [
  "cpu-profile",
  "psu-experience",
  "ssd-projects",
  "ram-stack",
  "io-contact",
  "fan-ecosystem",
  "cmos-about",
] as const;

export const SRC_FOLDERS = ["app", "features", "shared", "styles"] as const;

export const SHARED_FOLDERS = [
  "assets",
  "config",
  "contracts",
  "i18n",
  "lib",
  "state",
  "ui",
] as const;

const REGISTRY = "src/features/registry";
const CONTENT_FILES = ["facts.ts", "es.ts", "en.ts"];

type Layer =
  | { readonly kind: "app" }
  | { readonly kind: "registry" }
  | { readonly kind: "shell"; readonly feature: string }
  | { readonly kind: "section"; readonly feature: string }
  | { readonly kind: "shared"; readonly folder: string }
  | { readonly kind: "styles" }
  | { readonly kind: "other" };

interface ImportReference {
  readonly specifier: string;
  readonly line: number;
  /** Resolved path without extension, or `null` for a package. */
  readonly target: string | null;
}

function includes(list: readonly string[], value: string): boolean {
  return list.includes(value);
}

function lineAt(content: string, index: number): number {
  return content.slice(0, index).split("\n").length;
}

function isCode(path: string): boolean {
  return /\.(?:ts|tsx|mjs)$/.test(path);
}

function isTestFile(path: string): boolean {
  return /\.test\.tsx?$/.test(path) || path.endsWith(".spec.ts");
}

function stripExtension(path: string): string {
  return path.replace(/\.(?:ts|tsx|mjs)$/, "");
}

function normalize(path: string): string {
  const parts: string[] = [];
  for (const part of path.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  return parts.join("/");
}

function resolveSpecifier(fromPath: string, specifier: string): string | null {
  if (specifier.startsWith("@/")) return normalize(`src/${specifier.slice(2)}`);
  if (specifier.startsWith(".")) {
    const directory = fromPath.split("/").slice(0, -1).join("/");
    return normalize(`${directory}/${specifier}`);
  }
  return null;
}

const IMPORT_PATTERNS = [
  /\b(?:import|export)\b[^;'"`]*?\bfrom\s*["']([^"']+)["']/g,
  /\bimport\s*["']([^"']+)["']/g,
  /\bimport\(\s*["']([^"']+)["']\s*\)/g,
];

export function findImports(file: SourceFile): readonly ImportReference[] {
  const references: ImportReference[] = [];
  for (const pattern of IMPORT_PATTERNS) {
    for (const match of file.content.matchAll(pattern)) {
      const specifier = match[1];
      if (specifier === undefined) continue;
      references.push({
        specifier,
        line: lineAt(file.content, match.index + match[0].length - 1),
        target: resolveSpecifier(file.path, specifier),
      });
    }
  }
  return references.sort((a, b) => a.line - b.line);
}

function layerOf(path: string): Layer {
  const [root, area, name] = path.split("/");
  if (root !== "src" || area === undefined) return { kind: "other" };
  if (area === "app") return { kind: "app" };
  if (area === "styles") return { kind: "styles" };
  if (area === "shared") return { kind: "shared", folder: name ?? "" };
  if (area === "features" && name !== undefined) {
    if (stripExtension(name) === "registry" || path.startsWith(`${REGISTRY}.`)) {
      return { kind: "registry" };
    }
    if (includes(SHELL_FEATURES, name)) return { kind: "shell", feature: name };
    if (includes(SECTION_FEATURES, name)) return { kind: "section", feature: name };
  }
  return { kind: "other" };
}

function isFeature(layer: Layer): layer is Extract<Layer, { readonly feature: string }> {
  return layer.kind === "shell" || layer.kind === "section";
}

/** `true` when the target is a feature entry point: its folder, its index or its server file. */
function isPublicApi(target: string, feature: string): boolean {
  const base = `src/features/${feature}`;
  return target === base || target === `${base}/index` || target === `${base}/server`;
}

function describeLayer(layer: Layer): string {
  switch (layer.kind) {
    case "app":
      return "src/app";
    case "registry":
      return "the section registry";
    case "shell":
      return `the shell feature "${layer.feature}"`;
    case "section":
      return `the section feature "${layer.feature}"`;
    case "shared":
      return `src/shared/${layer.folder}`;
    case "styles":
      return "src/styles";
    case "other":
      return "an unknown location";
  }
}

function allowedByLayerTable(from: Layer, to: Layer): boolean {
  switch (from.kind) {
    case "app":
      return to.kind !== "section";
    case "shell":
      return to.kind === "registry" || to.kind === "shared" || isFeature(to);
    case "registry":
      return to.kind === "section" || to.kind === "shared" || to.kind === "registry";
    case "section":
      return to.kind === "shared" || isFeature(to);
    case "shared":
      return to.kind !== "styles";
    case "styles":
      return false;
    case "other":
      return true;
  }
}

/** STR-AC02 to STR-AC05: layer table, deep imports, feature isolation and `shared` boundaries. */
export function findImportViolations(files: readonly SourceFile[]): readonly Violation[] {
  const violations: Violation[] = [];
  for (const file of files) {
    if (!file.path.startsWith("src/") || !isCode(file.path)) continue;
    const from = layerOf(file.path);
    for (const reference of findImports(file)) {
      if (!reference.target?.startsWith("src/")) continue;
      const to = layerOf(reference.target);
      const report = (rule: string, message: string): void => {
        violations.push({ rule, file: file.path, line: reference.line, message });
      };
      const sameFeature = isFeature(from) && isFeature(to) && from.feature === to.feature;

      if (from.kind === "shared") {
        if (to.kind !== "shared" && to.kind !== "styles") {
          report("STR-AC05", `src/shared must not import from ${describeLayer(to)}`);
          continue;
        }
        if (from.folder === "contracts" && to.kind === "shared" && to.folder !== "contracts") {
          report("STR-AC05", `src/shared/contracts must not import from ${describeLayer(to)}`);
          continue;
        }
      }
      if (isFeature(from) && isFeature(to) && !sameFeature) {
        report("STR-AC04", `${describeLayer(from)} must not import from ${describeLayer(to)}`);
        continue;
      }
      if (isFeature(to) && !sameFeature && !isPublicApi(reference.target, to.feature)) {
        report(
          "STR-AC03",
          `deep import into ${describeLayer(to)}: only its index.ts or server.ts may be imported`,
        );
        continue;
      }
      if (!allowedByLayerTable(from, to)) {
        report("STR-AC02", `${describeLayer(from)} must not import from ${describeLayer(to)}`);
      }
    }
  }
  return violations;
}

/** STR-AC01: nothing outside the folders and features that STR allows. */
export function findStructureViolations(paths: readonly string[]): readonly Violation[] {
  const violations: Violation[] = [];
  const seen = new Set<string>();
  const report = (entry: string, message: string): void => {
    if (seen.has(entry)) return;
    seen.add(entry);
    violations.push({ rule: "STR-AC01", file: entry, line: 1, message });
  };
  for (const path of paths) {
    const [root, area, name, ...rest] = path.split("/");
    if (root !== "src" || area === undefined) continue;
    if (name === undefined || !includes(SRC_FOLDERS, area)) {
      report(`src/${area}`, "src only contains the folders app, features, shared and styles");
      continue;
    }
    if (area === "features") {
      const isRegistry = rest.length === 0 && /^registry(?:\.test)?\.ts$/.test(name);
      const isKnownFeature =
        rest.length > 0 && (includes(SHELL_FEATURES, name) || includes(SECTION_FEATURES, name));
      if (!isRegistry && !isKnownFeature) {
        report(`src/features/${name}`, "src/features only contains the twelve features of STR-R09");
      }
    }
    if (area === "shared" && (rest.length === 0 || !includes(SHARED_FOLDERS, name))) {
      report(`src/shared/${name}`, "src/shared only contains the folders listed in STR §4.1");
    }
  }
  return violations;
}

/** STR-AC06: every feature has an index.ts and every section feature its three content files. */
export function findFeatureAnatomyViolations(paths: readonly string[]): readonly Violation[] {
  const violations: Violation[] = [];
  const features = new Set<string>();
  for (const path of paths) {
    const [root, area, name, ...rest] = path.split("/");
    if (root === "src" && area === "features" && name !== undefined && rest.length > 0) {
      features.add(name);
    }
  }
  for (const feature of features) {
    const base = `src/features/${feature}`;
    const report = (file: string, message: string): void => {
      violations.push({ rule: "STR-AC06", file, line: 1, message });
    };
    if (!paths.includes(`${base}/index.ts`)) {
      report(base, "every feature must have an index.ts");
    }
    if (!includes(SECTION_FEATURES, feature)) continue;
    for (const required of CONTENT_FILES) {
      if (!paths.includes(`${base}/content/${required}`)) {
        report(`${base}/content/${required}`, "a section feature must have this content file");
      }
    }
    for (const path of paths) {
      if (!path.startsWith(`${base}/content/`)) continue;
      const name = path.slice(`${base}/content/`.length);
      if (!CONTENT_FILES.includes(name) && !isTestFile(name)) {
        report(path, "content/ only holds facts.ts, es.ts, en.ts and their tests");
      }
    }
  }
  return violations;
}

const COLOR_PATTERN =
  /(?<![&\w])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z_-])|\b(?:rgba?|hsla?|oklch)\(/g;

function mayContainColors(path: string): boolean {
  return (
    path === "src/styles/tokens.css" ||
    path === "src/app/icon.svg" ||
    path.endsWith(".generated.ts")
  );
}

/** STR-AC07: no literal colors in src outside the three places that STR-R22 allows. */
export function findColorViolations(files: readonly SourceFile[]): readonly Violation[] {
  const violations: Violation[] = [];
  for (const file of files) {
    if (!file.path.startsWith("src/") || mayContainColors(file.path)) continue;
    for (const match of file.content.matchAll(COLOR_PATTERN)) {
      violations.push({
        rule: "STR-AC07",
        file: file.path,
        line: lineAt(file.content, match.index),
        message: `literal color "${match[0]}": use a token from src/styles/tokens.css`,
      });
    }
  }
  return violations;
}

const USE_CLIENT_PATTERN = /^(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*["']use client["']/;

export function isClientFile(file: SourceFile): boolean {
  return USE_CLIENT_PATTERN.test(file.content);
}

/** STR-AC08: section features have no client components, except the listed files. */
export function findClientSectionViolations(
  files: readonly SourceFile[],
  exceptions: readonly string[],
): readonly Violation[] {
  return files
    .filter((file) => layerOf(file.path).kind === "section")
    .filter((file) => isClientFile(file) && !exceptions.includes(file.path))
    .map((file) => ({
      rule: "STR-AC08",
      file: file.path,
      line: 1,
      message: '"use client" is not allowed in a section feature unless its spec names the file',
    }));
}

const DOCS_PATTERN = /["'`](?:\.{1,2}\/)*docs(?:\/|["'`])/g;

/** STR-AC11: nothing reads paths inside the private docs folder. */
export function findDocsReadViolations(files: readonly SourceFile[]): readonly Violation[] {
  const violations: Violation[] = [];
  for (const file of files) {
    if (!/^(?:src|scripts|e2e|tests)\//.test(file.path)) continue;
    for (const match of file.content.matchAll(DOCS_PATTERN)) {
      violations.push({
        rule: "STR-AC11",
        file: file.path,
        line: lineAt(file.content, match.index),
        message: "the docs folder is private input material and must not be read",
      });
    }
  }
  return violations;
}

function isServerOnlyTarget(target: string): boolean {
  const layer = layerOf(target);
  return layer.kind === "registry" || layer.kind === "section" || target.endsWith("/server");
}

/** STR-AC12: nothing reachable from a client file imports the registry, a section or a server.ts. */
export function findClientBoundaryViolations(files: readonly SourceFile[]): readonly Violation[] {
  const byPath = new Map<string, SourceFile>();
  for (const file of files) {
    if (file.path.startsWith("src/") && isCode(file.path)) byPath.set(file.path, file);
  }
  const resolveFile = (target: string): SourceFile | undefined =>
    [`${target}.ts`, `${target}.tsx`, `${target}/index.ts`, `${target}/index.tsx`]
      .map((candidate) => byPath.get(candidate))
      .find((candidate) => candidate !== undefined);

  const violations: Violation[] = [];
  const reported = new Set<string>();
  for (const root of byPath.values()) {
    if (!isClientFile(root)) continue;
    const visited = new Set<string>([root.path]);
    const queue: SourceFile[] = [root];
    for (let current = queue.shift(); current !== undefined; current = queue.shift()) {
      for (const reference of findImports(current)) {
        if (reference.target === null) continue;
        if (isServerOnlyTarget(reference.target)) {
          const key = `${current.path}:${String(reference.line)}`;
          if (reported.has(key)) continue;
          reported.add(key);
          const via =
            current.path === root.path ? "" : ` (reached from the client file ${root.path})`;
          violations.push({
            rule: "STR-AC12",
            file: current.path,
            line: reference.line,
            message: `client code must not import "${reference.specifier}"${via}`,
          });
          continue;
        }
        const next = resolveFile(reference.target);
        if (next !== undefined && !visited.has(next.path)) {
          visited.add(next.path);
          queue.push(next);
        }
      }
    }
  }
  return violations;
}

const FORBIDDEN_IN_TESTS: readonly (readonly [RegExp, string])[] = [
  [/\.only\s*\(/g, "focused tests (.only) must not be committed"],
  [/\btoMatchSnapshot\b/g, "file snapshots are not allowed (TST-R12)"],
  [/\btoMatchFileSnapshot\b/g, "file snapshots are not allowed (TST-R12)"],
  [/\bwaitForTimeout\b/g, "fixed waits are not allowed (TST-R27)"],
];

/** Returns the text of the arguments of the call that opens at `openIndex`. */
function callArguments(content: string, openIndex: number): string {
  let depth = 0;
  for (let index = openIndex; index < content.length; index += 1) {
    const character = content[index];
    if (character === "(") depth += 1;
    if (character === ")") {
      depth -= 1;
      if (depth === 0) return content.slice(openIndex + 1, index);
    }
  }
  return content.slice(openIndex + 1);
}

/** TST-AC03: no focused tests, snapshots or fixed waits, and every skip states its reason. */
export function findTestHygieneViolations(files: readonly SourceFile[]): readonly Violation[] {
  const violations: Violation[] = [];
  for (const file of files) {
    if (!isTestFile(file.path)) continue;
    const report = (index: number, message: string): void => {
      violations.push({
        rule: "TST-AC03",
        file: file.path,
        line: lineAt(file.content, index),
        message,
      });
    };
    for (const [pattern, message] of FORBIDDEN_IN_TESTS) {
      for (const match of file.content.matchAll(pattern)) report(match.index, message);
    }
    for (const match of file.content.matchAll(/\.skip\s*\(/g)) {
      const args = callArguments(file.content, match.index + match[0].length - 1);
      if (!/,\s*(["'`])[^"'`]+\1\s*,?\s*$/.test(args)) {
        report(match.index, "a skipped test must give its reason as the last argument");
      }
    }
  }
  return violations;
}

const DISABLE_PATTERN = /eslint-disable(?:-next-line|-line)?\b([^\n]*)/g;

/** TST-AC06: ESLint is only silenced in the allowed files, and always with a reason. */
export function findDisableCommentViolations(
  files: readonly SourceFile[],
  allowedFiles: readonly string[],
): readonly Violation[] {
  const violations: Violation[] = [];
  for (const file of files) {
    if (!file.path.startsWith("src/")) continue;
    for (const match of file.content.matchAll(DISABLE_PATTERN)) {
      const line = lineAt(file.content, match.index);
      if (!allowedFiles.includes(file.path)) {
        violations.push({
          rule: "TST-AC06",
          file: file.path,
          line,
          message: "ESLint rules must not be disabled in this file (TST-R17)",
        });
      } else if (!/\s--\s+\S/.test(match[1] ?? "")) {
        violations.push({
          rule: "TST-AC06",
          file: file.path,
          line,
          message: "an eslint-disable comment must explain its reason after `--`",
        });
      }
    }
  }
  return violations;
}

const E2E_ALLOWED_SOURCES = ["src/shared/contracts/", "src/shared/config/"];
const SELECTOR_CALL_PATTERN =
  /\b(?:locator|querySelector|querySelectorAll|waitForSelector|\$\$?)\(\s*(["'`])((?:(?!\1)[^\\]|\\.)*)\1/g;

/** `true` when a CSS selector matches by class: `.name` outside brackets, or a `[class…]` test. */
function selectsByClass(selector: string): boolean {
  if (/\[\s*class\b/.test(selector)) return true;
  return /\.[A-Za-z_-]/.test(selector.replace(/\[[^\]]*\]/g, ""));
}

/** TST-AC09: E2E tests only import contracts and config from src, and never select by class. */
export function findE2eViolations(files: readonly SourceFile[]): readonly Violation[] {
  const violations: Violation[] = [];
  for (const file of files) {
    if (!file.path.startsWith("e2e/")) continue;
    for (const reference of findImports(file)) {
      const target = reference.target;
      if (!target?.startsWith("src/")) continue;
      if (!E2E_ALLOWED_SOURCES.some((allowed) => target.startsWith(allowed))) {
        violations.push({
          rule: "TST-AC09",
          file: file.path,
          line: reference.line,
          message: `E2E tests must not import "${reference.specifier}" (TST-R25)`,
        });
      }
    }
    for (const match of file.content.matchAll(SELECTOR_CALL_PATTERN)) {
      if (!selectsByClass(match[2] ?? "")) continue;
      violations.push({
        rule: "TST-AC09",
        file: file.path,
        line: lineAt(file.content, match.index),
        message: "class selectors are not allowed: locate by role and accessible name (TST-R24)",
      });
    }
  }
  return violations;
}

/** VIS-AC06: transitions name the properties they animate; `all` is never used. */
export function findTransitionAllViolations(files: readonly SourceFile[]): readonly Violation[] {
  const violations: Violation[] = [];
  for (const file of files) {
    if (!file.path.startsWith("src/")) continue;
    for (const match of file.content.matchAll(/\btransition-all\b|\btransition\s*:\s*all\b/g)) {
      violations.push({
        rule: "VIS-AC06",
        file: file.path,
        line: lineAt(file.content, match.index),
        message: "animate only opacity and transform: `transition: all` is not allowed (VIS-R34)",
      });
    }
  }
  return violations;
}

const ROUTES_MODULE = "src/shared/config/routes.ts";

/**
 * TSC-AC15: internal paths are built with the route helpers. Reports string literals that start
 * with a locale segment and templates that concatenate one, outside routes.ts and test files.
 */
export function findRouteLiteralViolations(
  files: readonly SourceFile[],
  locales: readonly string[],
): readonly Violation[] {
  const literal = new RegExp(`["'\`]/(?:${locales.join("|")})(?:/|["'\`])`, "g");
  const template = /`\/\$\{[^}]*locale[^}]*\}/gi;
  const violations: Violation[] = [];
  for (const file of files) {
    if (!file.path.startsWith("src/") || !isCode(file.path)) continue;
    if (file.path === ROUTES_MODULE || isTestFile(file.path)) continue;
    for (const pattern of [literal, template]) {
      for (const match of file.content.matchAll(pattern)) {
        violations.push({
          rule: "TSC-AC15",
          file: file.path,
          line: lineAt(file.content, match.index),
          message: "build internal paths with the helpers of shared/config/routes (TSC-R55)",
        });
      }
    }
  }
  return violations;
}

const STORAGE_ACCESS_PATTERN =
  /\b(?:localStorage|sessionStorage)\s*(?:\.|\[)|\.\s*(?:localStorage|sessionStorage)\b/g;

/** TSC-AC15: browser storage is only touched by the files that TSC-R53 allows. */
export function findStorageAccessViolations(
  files: readonly SourceFile[],
  allowedFiles: readonly string[],
): readonly Violation[] {
  const violations: Violation[] = [];
  for (const file of files) {
    if (!file.path.startsWith("src/") || !isCode(file.path)) continue;
    if (allowedFiles.includes(file.path) || isTestFile(file.path)) continue;
    for (const match of file.content.matchAll(STORAGE_ACCESS_PATTERN)) {
      violations.push({
        rule: "TSC-AC15",
        file: file.path,
        line: lineAt(file.content, match.index),
        message: "browser storage is only accessed through shared/state/safe-storage (TSC-R53)",
      });
    }
  }
  return violations;
}

const TEXT_ATTRIBUTE_PATTERN =
  /(?<![\w-])(aria-label|aria-description|aria-roledescription|aria-valuetext|title|alt|placeholder)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*"([^"]*)"\s*\}|\{\s*'([^']*)'\s*\}|\{\s*`([^`]*)`\s*\})/g;

/** I18N-AC09: attributes that the visitor perceives never carry a hand-written string. */
export function findAttributeLiteralViolations(files: readonly SourceFile[]): readonly Violation[] {
  const violations: Violation[] = [];
  for (const file of files) {
    if (!file.path.startsWith("src/") || !file.path.endsWith(".tsx") || isTestFile(file.path)) {
      continue;
    }
    for (const match of file.content.matchAll(TEXT_ATTRIBUTE_PATTERN)) {
      const groups: readonly (string | undefined)[] = match.slice(2);
      const text = groups.find((group) => group !== undefined) ?? "";
      if (text === "") continue;
      violations.push({
        rule: "I18N-AC09",
        file: file.path,
        line: lineAt(file.content, match.index),
        message: `the ${match[1] ?? "attribute"} attribute must take its text from a dictionary (I18N-R05)`,
      });
    }
  }
  return violations;
}

export function formatViolations(violations: readonly Violation[]): string {
  return violations
    .map((item) => `${item.file}:${String(item.line)} [${item.rule}] ${item.message}`)
    .join("\n");
}
