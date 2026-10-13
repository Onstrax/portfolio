import { ESLint } from "eslint";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

// Type-aware rules need a file that belongs to the TypeScript project, so every snippet is linted
// under the path of a real file: the text replaces its content, the path selects the rules.
export const HOST = {
  source: "src/shared/contracts/locale.ts",
  test: "src/shared/contracts/locale.test.ts",
  typedObject: "src/shared/lib/typed-object.ts",
  page: "src/app/page.tsx",
  layout: "src/app/layout.tsx",
  config: "vitest.config.ts",
} as const;

const eslint = new ESLint({ cwd: ROOT });

/** Runs ESLint with the project configuration and returns the identifiers of the rules that fired. */
export async function lintSnippet(code: string, filePath: string): Promise<readonly string[]> {
  const results = await eslint.lintText(code, { filePath });
  return results.flatMap((result) =>
    result.messages.map((message) => message.ruleId ?? `fatal: ${message.message}`),
  );
}

/** Time allowed for the first run, which loads the TypeScript program of the whole project. */
export const WARM_UP_TIMEOUT = 120_000;

/** Lints a trivial snippet so that the tests themselves do not pay for the first run. */
export async function warmUp(): Promise<void> {
  await lintSnippet("export const value = 1;\n", HOST.source);
}
