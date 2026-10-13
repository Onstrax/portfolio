import { describe, expect, it } from "vitest";

import {
  findClientBoundaryViolations,
  findAttributeLiteralViolations,
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
  type SourceFile,
  type Violation,
} from "./detect";

function file(path: string, content: string): SourceFile {
  return { path, content };
}

function importing(path: string, specifier: string): SourceFile {
  return file(path, `import { value } from "${specifier}";\n\nexport const copy = value;\n`);
}

function rules(violations: readonly Violation[]): readonly string[] {
  return violations.map((violation) => violation.rule);
}

// The samples below must not trip the real architecture tests when this file is scanned, so the
// forbidden fragments are assembled at runtime instead of being written out.
const DOT = ".";
const SLASH = "/";
const DATE = "Date";
const TICK = "`";
const TRANSITION = "transition";
const OPEN = "(";
const SNAPSHOT = "Snapshot";
const TIMEOUT = "Timeout";
const CLASS_ATTRIBUTE = "class";
const HASH = "#";
const PRIVATE_ROOT = ["do", "cs"].join("");
const PRIVATE_FOLDER = `${PRIVATE_ROOT}/CVs`;
const DISABLE = ["eslint", "disable-next-line"].join("-");

describe("layer table (STR-AC02)", () => {
  it.each([
    ["src/app/[locale]/page.tsx", "@/features/cpu-profile"],
    ["src/features/detail-panel/components/panel.tsx", "@/styles/globals.css"],
    ["src/features/registry.ts", "@/features/detail-panel"],
    ["src/features/ssd-projects/index.ts", "@/features/registry"],
    ["src/features/ssd-projects/index.ts", "@/app/layout"],
    ["src/shared/ui/chip.tsx", "@/styles/tokens.css"],
  ])("STR-AC09: reports %s importing %s", (path, specifier) => {
    expect(rules(findImportViolations([importing(path, specifier)]))).toEqual(["STR-AC02"]);
  });

  it.each([
    ["src/app/[locale]/layout.tsx", "@/features/simple-view/server"],
    ["src/app/[locale]/layout.tsx", "@/features/registry"],
    ["src/app/[locale]/layout.tsx", "@/styles/globals.css"],
    ["src/app/[locale]/layout.tsx", "./scene-layer"],
    ["src/features/detail-panel/components/panel.tsx", "@/features/registry"],
    ["src/features/detail-panel/components/panel.tsx", "../hooks/use-panel"],
    ["src/features/registry.ts", "@/features/ssd-projects"],
    ["src/features/ssd-projects/index.ts", "@/shared/contracts/section"],
    ["src/shared/ui/chip.tsx", "@/shared/lib/cn"],
    ["src/shared/ui/chip.tsx", "react"],
  ])("STR-AC09: accepts %s importing %s", (path, specifier) => {
    expect(findImportViolations([importing(path, specifier)])).toEqual([]);
  });
});

describe("deep imports (STR-AC03)", () => {
  it("STR-AC09: reports an import of a file inside another feature", () => {
    const violations = findImportViolations([
      importing("src/app/[locale]/layout.tsx", "@/features/detail-panel/components/panel"),
      importing("src/features/registry.ts", "@/features/ssd-projects/content/facts"),
    ]);
    expect(rules(violations)).toEqual(["STR-AC03", "STR-AC03"]);
  });

  it("STR-AC09: accepts the index and server entry points, and relative imports inside a feature", () => {
    const violations = findImportViolations([
      importing("src/app/[locale]/layout.tsx", "@/features/detail-panel"),
      importing("src/app/[locale]/layout.tsx", "@/features/boot-sequence/server"),
      importing("src/features/ssd-projects/components/list.tsx", "../content/facts"),
    ]);
    expect(violations).toEqual([]);
  });
});

describe("feature isolation (STR-AC04)", () => {
  it("STR-AC09: reports a feature importing another feature", () => {
    const violations = findImportViolations([
      importing("src/features/detail-panel/index.ts", "@/features/settings"),
      importing("src/features/simple-view/server.ts", "@/features/cpu-profile"),
      importing("src/features/cpu-profile/index.ts", "../ssd-projects"),
    ]);
    expect(rules(violations)).toEqual(["STR-AC04", "STR-AC04", "STR-AC04"]);
  });

  it("STR-AC09: accepts the registry importing the public API of a section", () => {
    expect(findImportViolations([importing("src/features/registry.ts", "./cpu-profile")])).toEqual(
      [],
    );
  });
});

describe("shared boundaries (STR-AC05)", () => {
  it("STR-AC09: reports shared importing features or app, and contracts importing other folders", () => {
    const violations = findImportViolations([
      importing("src/shared/lib/section-nav.ts", "@/features/registry"),
      importing("src/shared/ui/chip.tsx", "@/app/layout"),
      importing("src/shared/contracts/section.ts", "@/shared/lib/cn"),
      importing("src/shared/contracts/section.ts", "../i18n/locales"),
    ]);
    expect(rules(violations)).toEqual(["STR-AC05", "STR-AC05", "STR-AC05", "STR-AC05"]);
  });

  it("STR-AC09: accepts contracts importing contracts and packages", () => {
    const violations = findImportViolations([
      importing("src/shared/contracts/section.ts", "./ids"),
      importing("src/shared/contracts/section.ts", "react"),
      importing("src/shared/i18n/format.ts", "@/shared/contracts/content"),
    ]);
    expect(violations).toEqual([]);
  });
});

describe("repository structure (STR-AC01)", () => {
  it("reports folders and features that STR does not list", () => {
    const violations = findStructureViolations([
      "src/utils/helper.ts",
      "src/helper.ts",
      "src/features/gpu-gallery/index.ts",
      "src/features/helpers.ts",
      "src/shared/hooks/use-thing.ts",
      "src/shared/util.ts",
    ]);
    expect(violations.map((violation) => violation.file)).toEqual([
      "src/utils",
      "src/helper.ts",
      "src/features/gpu-gallery",
      "src/features/helpers.ts",
      "src/shared/hooks",
      "src/shared/util.ts",
    ]);
  });

  it("accepts the folders, the registry and the features of STR", () => {
    const violations = findStructureViolations([
      "src/app/layout.tsx",
      "src/features/registry.ts",
      "src/features/registry.test.ts",
      "src/features/registry.sections.test.tsx",
      "src/features/detail-panel/index.ts",
      "src/features/cmos-about/content/facts.ts",
      "src/shared/contracts/ids.ts",
      "src/shared/ui/icons/close.tsx",
      "src/styles/tokens.css",
    ]);
    expect(violations).toEqual([]);
  });
});

describe("feature anatomy (STR-AC06)", () => {
  const COMPLETE_SECTION = [
    "src/features/ssd-projects/index.ts",
    "src/features/ssd-projects/content/facts.ts",
    "src/features/ssd-projects/content/facts.test.ts",
    "src/features/ssd-projects/content/es.ts",
    "src/features/ssd-projects/content/en.ts",
  ];

  it("STR-AC09: reports a feature without index.ts and a section with a wrong content folder", () => {
    const violations = findFeatureAnatomyViolations([
      "src/features/detail-panel/components/panel.tsx",
      "src/features/ssd-projects/index.ts",
      "src/features/ssd-projects/content/facts.ts",
      "src/features/ssd-projects/content/es.ts",
      "src/features/ssd-projects/content/de.ts",
    ]);
    expect(violations.map((violation) => violation.file)).toEqual([
      "src/features/detail-panel",
      "src/features/ssd-projects/content/en.ts",
      "src/features/ssd-projects/content/de.ts",
    ]);
  });

  it("STR-AC09: accepts a complete section feature and a shell feature with an index", () => {
    expect(
      findFeatureAnatomyViolations([...COMPLETE_SECTION, "src/features/detail-panel/index.ts"]),
    ).toEqual([]);
  });
});

describe("literal colors (STR-AC07)", () => {
  it.each([
    `const color = "${HASH}FFC53D";`,
    `const color = "${HASH}fff";`,
    `const color = "${HASH}0a0907cc";`,
    `const shadow = "0 4px 16px rgb${OPEN}0 0 0 / 0.5)";`,
    `const color = "hsl${OPEN}40 100% 62%)";`,
    `const color = "oklch${OPEN}0.8 0.1 90)";`,
  ])("STR-AC09: reports %s", (line) => {
    expect(rules(findColorViolations([file("src/shared/ui/chip.tsx", line)]))).toEqual([
      "STR-AC07",
    ]);
  });

  it("STR-AC09: accepts colors in the three allowed places and non-color fragments", () => {
    const color = `const color = "${HASH}FFC53D";`;
    const violations = findColorViolations([
      file("src/styles/tokens.css", color),
      file("src/app/icon.svg", color),
      file("src/shared/assets/manifest.generated.ts", color),
      file(
        "src/shared/ui/chip.tsx",
        `const anchor = "${HASH}content"; const id = "${HASH}projects";`,
      ),
      file("tests/repo/tokens.test.ts", color),
    ]);
    expect(violations).toEqual([]);
  });
});

describe('"use client" in section features (STR-AC08)', () => {
  const clientFile = file(
    "src/features/io-contact/components/copy.tsx",
    '// A client component.\n"use client";\n\nexport const value = 1;\n',
  );

  it("STR-AC09: reports a client file in a section feature", () => {
    expect(rules(findClientSectionViolations([clientFile], []))).toEqual(["STR-AC08"]);
  });

  it("STR-AC09: accepts listed exceptions, server files and client files in shell features", () => {
    const violations = findClientSectionViolations(
      [
        clientFile,
        file("src/features/io-contact/components/section.tsx", "export const value = 1;\n"),
        file("src/features/detail-panel/components/panel.tsx", '"use client";\n'),
      ],
      [clientFile.path],
    );
    expect(violations).toEqual([]);
  });
});

describe("private docs folder (STR-AC11)", () => {
  it("reports a path inside the private folder", () => {
    const violations = findDocsReadViolations([
      file("scripts/build-assets.mjs", `const source = "${PRIVATE_FOLDER}/cv.pdf";`),
      file("src/shared/config/site.ts", `const source = "../../${PRIVATE_FOLDER}";`),
      file("tests/repo/files.test.ts", `const folder = path.join(root, "${PRIVATE_ROOT}");`),
    ]);
    expect(rules(violations)).toEqual(["STR-AC11", "STR-AC11", "STR-AC11"]);
  });

  it("accepts documentation URLs and files outside the checked folders", () => {
    const violations = findDocsReadViolations([
      file("scripts/build-assets.mjs", "// See https://nextjs.org/docs/app for details."),
      file("README.md", `The folder "${PRIVATE_FOLDER}" is private.`),
    ]);
    expect(violations).toEqual([]);
  });
});

describe("client boundary (STR-AC12)", () => {
  it("reports a client file that imports the registry, a section or a server entry point", () => {
    const violations = findClientBoundaryViolations([
      file(
        "src/features/detail-panel/components/panel.tsx",
        '"use client";\nimport { SECTIONS } from "@/features/registry";\nimport { Poster } from "@/features/motherboard-scene/server";\n',
      ),
    ]);
    expect(rules(violations)).toEqual(["STR-AC12", "STR-AC12"]);
  });

  it("reports an indirect import and names the client file it was reached from", () => {
    const violations = findClientBoundaryViolations([
      file(
        "src/features/detail-panel/components/panel.tsx",
        '"use client";\nimport { titles } from "../lib/titles";\n',
      ),
      file(
        "src/features/detail-panel/lib/titles.ts",
        'import { cpuProfileSection } from "@/features/cpu-profile";\n\nexport const titles = [cpuProfileSection];\n',
      ),
    ]);
    expect(violations).toHaveLength(1);
    expect(violations[0]?.file).toBe("src/features/detail-panel/lib/titles.ts");
    expect(violations[0]?.message).toContain("src/features/detail-panel/components/panel.tsx");
  });

  it("accepts server files that import the registry and client files that receive props", () => {
    const violations = findClientBoundaryViolations([
      file(
        "src/app/[locale]/(scene)/layout.tsx",
        'import { SECTION_LIST } from "@/features/registry";\n',
      ),
      file(
        "src/features/detail-panel/components/panel.tsx",
        '"use client";\nimport type { SectionNavItem } from "@/shared/contracts/navigation";\n',
      ),
      file("src/shared/contracts/navigation.ts", "export interface SectionNavItem {}\n"),
    ]);
    expect(violations).toEqual([]);
  });
});

describe("test hygiene (TST-AC03)", () => {
  it.each([
    `it${DOT}only("runs alone", () => {});`,
    `expect(value).toMatch${SNAPSHOT}();`,
    `await expect(value).toMatchFile${SNAPSHOT}("out.txt");`,
    `await page.waitFor${TIMEOUT}(500);`,
    `test${DOT}skip("not ready", () => {});`,
    `test${DOT}skip();`,
  ])("reports %s", (line) => {
    expect(rules(findTestHygieneViolations([file("e2e/sample.spec.ts", line)]))).toEqual([
      "TST-AC03",
    ]);
  });

  it("accepts a skip with a reason and ignores files that are not tests", () => {
    const violations = findTestHygieneViolations([
      file(
        "e2e/sample.spec.ts",
        `test${DOT}skip(browserName !== "chromium", "Chromium only: measures weight");`,
      ),
      file("src/shared/lib/helper.ts", `list${DOT}only(1);`),
    ]);
    expect(violations).toEqual([]);
  });
});

describe("eslint-disable comments (TST-AC06)", () => {
  const allowed = "src/shared/lib/typed-object.ts";

  it("reports a disable comment in a file that is not allowed, or without a reason", () => {
    const violations = findDisableCommentViolations(
      [
        file("src/shared/ui/chip.tsx", `// ${DISABLE} no-console -- debugging\n`),
        file(allowed, `// ${DISABLE} no-restricted-syntax\n`),
      ],
      [allowed],
    );
    expect(rules(violations)).toEqual(["TST-AC06", "TST-AC06"]);
  });

  it("accepts a disable comment with a reason in an allowed file", () => {
    const violations = findDisableCommentViolations(
      [file(allowed, `// ${DISABLE} no-restricted-syntax -- Object.keys returns string[]\n`)],
      [allowed],
    );
    expect(violations).toEqual([]);
  });
});

describe("E2E conventions (TST-AC09)", () => {
  it("reports imports from src outside contracts and config, and class selectors", () => {
    const violations = findE2eViolations([
      importing("e2e/open-section.spec.ts", "../src/features/registry"),
      importing("e2e/open-section.spec.ts", "@/shared/i18n/format"),
      file("e2e/open-section.spec.ts", `await page.locator("${DOT}panel-title").click();`),
      file(
        "e2e/open-section.spec.ts",
        `await page.locator('div[${CLASS_ATTRIBUTE}*="panel"]').click();`,
      ),
    ]);
    expect(rules(violations)).toEqual(["TST-AC09", "TST-AC09", "TST-AC09", "TST-AC09"]);
  });

  it("accepts contracts, config, support files and role locators", () => {
    const violations = findE2eViolations([
      importing("e2e/open-section.spec.ts", "../src/shared/contracts/ids"),
      importing("e2e/export/documents.spec.ts", "../../src/shared/config/routes"),
      importing("e2e/open-section.spec.ts", "./support/base"),
      file("e2e/open-section.spec.ts", 'await page.getByRole("link", { name: "Perfil" }).click();'),
      file("e2e/open-section.spec.ts", `await page.locator('a[href$="${DOT}pdf"]').click();`),
      file("e2e/support/export.ts", `files.filter((name) => name.endsWith("${DOT}html"));`),
    ]);
    expect(violations).toEqual([]);
  });
});

describe("transitions (VIS-AC06)", () => {
  it.each([`className="${TRANSITION}-all duration-150"`, `${TRANSITION}: all 150ms ease;`])(
    "reports %s",
    (line) => {
      expect(rules(findTransitionAllViolations([file("src/shared/ui/chip.tsx", line)]))).toEqual([
        "VIS-AC06",
      ]);
    },
  );

  it("accepts transitions that name their properties", () => {
    const violations = findTransitionAllViolations([
      file("src/shared/ui/chip.tsx", `className="${TRANSITION}-opacity duration-150"`),
      file("src/styles/globals.css", `${TRANSITION}: opacity 150ms, transform 150ms;`),
    ]);
    expect(violations).toEqual([]);
  });
});

describe("route literals (TSC-AC15)", () => {
  const LOCALES = ["es", "en"];

  it.each([
    `const href = "${SLASH}es${SLASH}projects${SLASH}";`,
    `const href = '${SLASH}en';`,
    `const href = ${TICK}${SLASH}\${locale}${SLASH}cv${SLASH}${TICK};`,
    `const href = ${TICK}${SLASH}\${props.locale}${TICK};`,
  ])("reports %s", (line) => {
    const violations = findRouteLiteralViolations([file("src/shared/ui/chip.tsx", line)], LOCALES);
    expect(rules(violations)).toEqual(["TSC-AC15"]);
  });

  it("accepts routes.ts, test files and strings that are not locale paths", () => {
    const path = `const href = "${SLASH}es${SLASH}";`;
    const violations = findRouteLiteralViolations(
      [
        file("src/shared/config/routes.ts", path),
        file("src/shared/config/routes.test.ts", path),
        file("src/shared/ui/chip.test.tsx", path),
        file(
          "src/shared/ui/chip.tsx",
          `const file = "${SLASH}cv${SLASH}resume.pdf"; const word = "${SLASH}enable";`,
        ),
      ],
      LOCALES,
    );
    expect(violations).toEqual([]);
  });
});

describe("storage access (TSC-AC15)", () => {
  const allowed = "src/shared/state/safe-storage.ts";

  it.each([
    `window${DOT}localStorage${DOT}getItem("key");`,
    `sessionStorage${DOT}setItem("key", "value");`,
    `const area = globalThis${DOT}sessionStorage;`,
    `localStorage["key"] = "value";`,
  ])("reports %s", (line) => {
    const violations = findStorageAccessViolations(
      [file("src/shared/ui/chip.tsx", line)],
      [allowed],
    );
    expect(rules(violations)).toEqual(["TSC-AC15"]);
  });

  it("accepts the allowed files, test files and mentions in comments", () => {
    const access = `window${DOT}localStorage${DOT}getItem("key");`;
    const violations = findStorageAccessViolations(
      [
        file(allowed, access),
        file("src/shared/state/stores.test.ts", access),
        file(
          "src/shared/contracts/state.ts",
          "/** Value stored in `localStorage` under the key. */",
        ),
      ],
      [allowed],
    );
    expect(violations).toEqual([]);
  });
});

describe("attribute literals (I18N-AC09)", () => {
  it.each([
    "aria-label",
    "aria-description",
    "aria-roledescription",
    "aria-valuetext",
    "title",
    "alt",
    "placeholder",
  ])("I18N-AC09: reports a hand-written %s", (attribute) => {
    const violations = findAttributeLiteralViolations([
      file("src/shared/ui/sample.tsx", `<div ${attribute}="Close the panel" />`),
      file("src/shared/ui/other.tsx", `<div ${attribute}={'Close the panel'} />`),
    ]);
    expect(rules(violations)).toEqual(["I18N-AC09", "I18N-AC09"]);
  });

  it("I18N-AC09: accepts an empty alt, values from a dictionary and test files", () => {
    const violations = findAttributeLiteralViolations([
      file(
        "src/shared/ui/sample.tsx",
        '<img alt="" src={source} /><button aria-label={labels.close} />',
      ),
      file("src/shared/ui/sample.tsx", "<button aria-label={closeLabel} data-title={title} />"),
      file("src/shared/ui/sample.test.tsx", '<button aria-label="Close" />'),
      file("src/shared/lib/helper.ts", 'const title = "Close";'),
    ]);
    expect(violations).toEqual([]);
  });
});

describe("content files (TSC-AC18)", () => {
  const FACTS = "src/features/ssd-projects/content/facts.ts";
  const TEXT = "src/features/ssd-projects/content/es.ts";

  it("reports Date objects in content", () => {
    const violations = findContentFileViolations([
      file(
        FACTS,
        `export const facts = {\n  start: new ${DATE}(2024, 6),\n} as const satisfies Facts;\n`,
      ),
      file(TEXT, `export const text = {\n  now: String(${DATE}.now()),\n} satisfies Text;\n`),
    ]);
    expect(rules(violations)).toEqual(["TSC-AC18", "TSC-AC18"]);
  });

  it("reports facts and texts that are not declared with satisfies", () => {
    const violations = findContentFileViolations([
      file(FACTS, "export const facts: Facts = {\n  id: 1,\n};\n"),
      file(FACTS, "export const facts = {\n  id: 1,\n} satisfies Facts;\n"),
      file(TEXT, "export const text: Text = {\n  title: 1,\n};\n"),
    ]);
    expect(violations.map((violation) => violation.message)).toEqual([
      "facts must be declared with `as const satisfies` (TSC-R40)",
      "facts must be declared with `as const satisfies` (TSC-R40)",
      "texts must be declared with `satisfies` (TSC-R40)",
    ]);
  });

  it("accepts well-declared content and ignores files outside content folders", () => {
    const violations = findContentFileViolations([
      file(FACTS, "export const facts = {\n  id: 1,\n} as const satisfies Facts;\n"),
      file(TEXT, "export const text = {\n  title: 1,\n} satisfies Text;\n"),
      file("src/features/ssd-projects/lib/helper.ts", `export const now = ${DATE}.now();\n`),
      file("src/features/ssd-projects/content/content.test.ts", `const today = new ${DATE}();\n`),
    ]);
    expect(violations).toEqual([]);
  });
});

describe("formatViolations", () => {
  it("prints file, line, rule and message on one line per violation", () => {
    const text = formatViolations([
      { rule: "STR-AC02", file: "src/app/page.tsx", line: 3, message: "not allowed" },
    ]);
    expect(text).toBe("src/app/page.tsx:3 [STR-AC02] not allowed");
  });
});
