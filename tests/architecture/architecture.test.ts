import { describe, expect, it } from "vitest";

import { RENDER_MODE_QUERY } from "../../src/shared/config/render-mode";
import { LOCALES } from "../../src/shared/contracts/locale";
import {
  findAttributeLiteralViolations,
  findClientBoundaryViolations,
  findClientSectionViolations,
  findColorViolations,
  findContentFileViolations,
  findCustomVariantQuery,
  findDisableCommentViolations,
  findDocsReadViolations,
  findE2eViolations,
  findFeatureAnatomyViolations,
  findImportViolations,
  findRouteLiteralViolations,
  findStorageAccessViolations,
  findStructureViolations,
  findTestHygieneViolations,
  findTransitionAllViolations,
  findUnsafeHtmlViolations,
  formatViolations,
  SECTION_FEATURES,
  SHARED_FOLDERS,
  SHELL_FEATURES,
  SRC_FOLDERS,
  type Violation,
} from "./detect";
import { listPaths, readSources } from "./repository";

const SRC_PATHS = listPaths(["src"]);
const SRC = readSources(["src"]);
const CHECKED = readSources(["src", "scripts", "e2e", "tests"]);

/** Client files allowed inside section features, with the requirement that authorizes each. */
const CLIENT_SECTION_EXCEPTIONS: readonly string[] = [];

/** Files that may touch browser storage directly (TSC-R53). */
const STORAGE_FILES: readonly string[] = [
  "src/shared/state/safe-storage.ts",
  "src/shared/lib/pre-paint-script.ts",
  "src/shared/lib/language-redirect-script.ts",
];

/** The three places where raw HTML may be set (QLT-R48). */
const RAW_HTML_FILES: readonly string[] = [
  "src/app/[locale]/(scene)/layout.tsx",
  "src/app/page.tsx",
  "src/features/simple-view/components/person-json-ld.tsx",
];

/** Files where an ESLint rule may be disabled (TST-R17). */
const DISABLE_COMMENT_FILES: readonly string[] = ["src/shared/lib/typed-object.ts"];

function expectNone(violations: readonly Violation[]): void {
  expect(formatViolations(violations)).toBe("");
}

function only(rule: string, violations: readonly Violation[]): readonly Violation[] {
  return violations.filter((violation) => violation.rule === rule);
}

describe("architecture of src", () => {
  const importViolations = findImportViolations(SRC);

  it("STR-AC01: src holds nothing outside the folders and features of STR", () => {
    expectNone(findStructureViolations(SRC_PATHS));
  });

  it("STR-AC01: src holds every folder and the twelve features of STR", () => {
    const entries = (prefix: string): readonly string[] =>
      [
        ...new Set(
          SRC_PATHS.filter((path) => path.startsWith(prefix)).map(
            (path) => path.slice(prefix.length).split("/")[0] ?? "",
          ),
        ),
      ].sort();

    expect(entries("src/")).toEqual([...SRC_FOLDERS].sort());
    expect(entries("src/shared/")).toEqual([...SHARED_FOLDERS].sort());
    // Besides the features there is only the registry, with its tests.
    const features = entries("src/features/").filter((entry) => !entry.startsWith("registry."));
    expect(features).toEqual([...SHELL_FEATURES, ...SECTION_FEATURES].sort());
    expect(entries("src/features/")).toContain("registry.ts");
  });

  it("STR-AC02: no file imports against the layer table", () => {
    expectNone(only("STR-AC02", importViolations));
  });

  it("STR-AC03: there are no deep imports into a feature", () => {
    expectNone(only("STR-AC03", importViolations));
  });

  it("STR-AC04: no feature imports another feature", () => {
    expectNone(only("STR-AC04", importViolations));
  });

  it("STR-AC05: shared does not import features or app, and contracts import nothing else", () => {
    expectNone(only("STR-AC05", importViolations));
  });

  it("STR-AC06: every feature has its required files", () => {
    expectNone(findFeatureAnatomyViolations(SRC_PATHS));
  });

  it("STR-AC07: there are no literal colors outside the allowed files", () => {
    expectNone(findColorViolations(SRC));
  });

  it("STR-AC08: section features have no client components beyond the listed exceptions", () => {
    expectNone(findClientSectionViolations(SRC, CLIENT_SECTION_EXCEPTIONS));
  });

  it("STR-AC11: nothing reads the private docs folder", () => {
    expectNone(findDocsReadViolations(CHECKED));
  });

  it("STR-AC12: client code never reaches the registry, a section or a server entry point", () => {
    expectNone(findClientBoundaryViolations(SRC));
  });
});

describe("conventions of src", () => {
  it("VIS-AC06: no transition animates every property", () => {
    expectNone(findTransitionAllViolations(SRC));
  });

  it("TSC-AC15: paths come from the route helpers and storage from the guarded module", () => {
    expectNone(findRouteLiteralViolations(SRC, LOCALES));
    expectNone(findStorageAccessViolations(SRC, STORAGE_FILES));
  });

  it("TSC-AC18: content files use no Date objects and declare their content with satisfies", () => {
    expectNone(findContentFileViolations(SRC));
  });

  it("I18N-AC09: no perceivable attribute carries a hand-written string", () => {
    expectNone(findAttributeLiteralViolations(SRC));
  });

  it("QLT-AC25: raw HTML is set only in three places, and nothing evaluates strings as code", () => {
    expectNone(findUnsafeHtmlViolations(SRC, RAW_HTML_FILES));
    const rawHtml = ["dangerously", "SetInnerHTML"].join("");
    for (const file of RAW_HTML_FILES) {
      expect(SRC.find((source) => source.path === file)?.content, file).toContain(rawHtml);
    }
  });

  it("SYS-AC18: the scene-capable variant uses the media query of the render mode constant", () => {
    const globals = SRC.find((file) => file.path === "src/styles/globals.css");
    expect(findCustomVariantQuery(globals?.content ?? "", "scene-capable")).toBe(RENDER_MODE_QUERY);
  });
});

describe("test conventions", () => {
  it("TST-AC03: tests have no focused runs, snapshots, fixed waits or unexplained skips", () => {
    expectNone(findTestHygieneViolations(CHECKED));
  });

  it("TST-AC06: ESLint is only disabled in the allowed files, with a reason", () => {
    expectNone(findDisableCommentViolations(SRC, DISABLE_COMMENT_FILES));
  });

  it("TST-AC09: E2E tests import only contracts and config, and use no class selectors", () => {
    expectNone(findE2eViolations(CHECKED));
  });
});
