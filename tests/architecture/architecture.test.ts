import { describe, expect, it } from "vitest";

import { LOCALES } from "../../src/shared/contracts/locale";
import {
  findAttributeLiteralViolations,
  findClientBoundaryViolations,
  findClientSectionViolations,
  findColorViolations,
  findContentFileViolations,
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
  formatViolations,
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
