import { beforeAll, describe, expect, it, vi } from "vitest";

import { HOST, lintSnippet, WARM_UP_TIMEOUT, warmUp } from "./lint";

vi.setConfig({ testTimeout: 30_000 });
beforeAll(warmUp, WARM_UP_TIMEOUT);

interface RuleCase {
  readonly name: string;
  readonly rule: string;
  readonly invalid: string;
  readonly valid: string;
}

const CASES: readonly RuleCase[] = [
  {
    name: "enum declarations",
    rule: "no-restricted-syntax",
    invalid: "export enum Color {\n  Red,\n}\n",
    valid: 'export const COLORS = ["red"] as const;\n',
  },
  {
    name: "type assertions other than as const",
    rule: "no-restricted-syntax",
    invalid: 'const raw: unknown = JSON.parse("1");\nexport const count = raw as number;\n',
    valid:
      'const raw: unknown = JSON.parse("1");\nexport const count = typeof raw === "number" ? raw : 0;\n',
  },
  {
    name: "non-exhaustive switch statements",
    rule: "@typescript-eslint/switch-exhaustiveness-check",
    invalid:
      'type Mode = "scene" | "simple";\nexport function weight(mode: Mode): number {\n  switch (mode) {\n    case "scene":\n      return 1;\n  }\n  return 0;\n}\n',
    valid:
      'type Mode = "scene" | "simple";\nexport function weight(mode: Mode): number {\n  switch (mode) {\n    case "scene":\n      return 1;\n    case "simple":\n      return 0;\n  }\n}\n',
  },
  {
    name: "types imported as values",
    rule: "@typescript-eslint/consistent-type-imports",
    invalid: 'import { ComponentId } from "./ids";\n\nexport const first: ComponentId = "cpu";\n',
    valid:
      'import type { ComponentId } from "./ids";\n\nexport const first: ComponentId = "cpu";\n',
  },
  {
    name: "exported functions without a return type",
    rule: "@typescript-eslint/explicit-module-boundary-types",
    invalid: "export function double(value: number) {\n  return value * 2;\n}\n",
    valid: "export function double(value: number): number {\n  return value * 2;\n}\n",
  },
  {
    name: "default exports",
    rule: "import/no-default-export",
    invalid: "const value = 1;\nexport default value;\n",
    valid: "export const value = 1;\n",
  },
  {
    name: "explicit any",
    rule: "@typescript-eslint/no-explicit-any",
    invalid: "export function size(value: any): number {\n  return String(value).length;\n}\n",
    valid: "export function size(value: unknown): number {\n  return String(value).length;\n}\n",
  },
  {
    name: "non-null assertions",
    rule: "@typescript-eslint/no-non-null-assertion",
    invalid: "export function size(value?: string): number {\n  return value!.length;\n}\n",
    valid: "export function size(value?: string): number {\n  return value?.length ?? 0;\n}\n",
  },
  {
    name: "@ts-ignore comments",
    rule: "@typescript-eslint/ban-ts-comment",
    invalid: "// @ts-ignore\nexport const value: number = 1;\n",
    valid: "export const value = 1;\n",
  },
];

const TYPE_ASSERTION =
  'const raw: unknown = JSON.parse("1");\nexport const count = raw as number;\n';
const DEFAULT_EXPORT_COMPONENT = "export default function Sample() {\n  return null;\n}\n";

describe("ESLint configuration: TypeScript rules", () => {
  it.each(CASES)("TSC-AC03: reports $name and accepts the correct equivalent", async (ruleCase) => {
    expect(await lintSnippet(ruleCase.invalid, HOST.source)).toContain(ruleCase.rule);
    expect(await lintSnippet(ruleCase.valid, HOST.source)).toEqual([]);
  });

  it("TSC-AC04: allows type assertions only in typed-object.ts and in test files", async () => {
    expect(await lintSnippet(TYPE_ASSERTION, HOST.source)).toContain("no-restricted-syntax");
    expect(await lintSnippet(TYPE_ASSERTION, HOST.typedObject)).not.toContain(
      "no-restricted-syntax",
    );
    expect(await lintSnippet(TYPE_ASSERTION, HOST.test)).not.toContain("no-restricted-syntax");
  });

  it("STR-AC10: reports a default export except where a tool requires one", async () => {
    expect(await lintSnippet("const value = 1;\nexport default value;\n", HOST.source)).toContain(
      "import/no-default-export",
    );
    for (const host of [HOST.page, HOST.layout]) {
      expect(await lintSnippet(DEFAULT_EXPORT_COMPONENT, host)).not.toContain(
        "import/no-default-export",
      );
    }
    expect(await lintSnippet("const config = {};\nexport default config;\n", HOST.config)).toEqual(
      [],
    );
  });
});
