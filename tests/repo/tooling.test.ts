import { describe, expect, it } from "vitest";

import playwrightConfig from "../../playwright.config";
import vitestConfig from "../../vitest.config";
import { findFiles, isRecord, readJson, readRepoFile } from "./files";

const COMPILER_OPTIONS = {
  target: "ES2022",
  lib: ["dom", "dom.iterable", "ES2022"],
  module: "esnext",
  moduleResolution: "bundler",
  jsx: "react-jsx",
  allowJs: false,
  noEmit: true,
  incremental: true,
  isolatedModules: true,
  verbatimModuleSyntax: true,
  resolveJsonModule: true,
  esModuleInterop: true,
  plugins: [{ name: "next" }],
  strict: true,
  noUncheckedIndexedAccess: true,
  noImplicitOverride: true,
  noImplicitReturns: true,
  noFallthroughCasesInSwitch: true,
  noPropertyAccessFromIndexSignature: true,
  noUnusedLocals: true,
  noUnusedParameters: true,
  allowUnreachableCode: false,
  allowUnusedLabels: false,
  forceConsistentCasingInFileNames: true,
  skipLibCheck: true,
  paths: { "@/*": ["./src/*"] },
};

describe("tsconfig.json", () => {
  it("TSC-AC01: sets exactly the compiler options, include and exclude of TSC, in a single file", () => {
    expect(readJson("tsconfig.json")).toEqual({
      compilerOptions: COMPILER_OPTIONS,
      include: [
        "next-env.d.ts",
        "**/*.ts",
        "**/*.tsx",
        ".next/types/**/*.ts",
        ".next/dev/types/**/*.ts",
      ],
      exclude: ["node_modules", "out"],
    });
    expect(findFiles(/^tsconfig.*\.json$/)).toEqual(["tsconfig.json"]);
  });
});

describe("vitest.config.ts", () => {
  it("TST-AC01: measures coverage of the logic with the four minimums and skips generated files", () => {
    const coverage = "test" in vitestConfig ? vitestConfig.test?.coverage : undefined;
    expect(coverage).toMatchObject({
      provider: "v8",
      include: [
        "src/**/lib/**/*.ts",
        "src/shared/state/**/*.ts",
        "src/shared/i18n/**/*.ts",
        "src/shared/config/**/*.ts",
        "src/shared/contracts/**/*.ts",
        "src/features/registry.ts",
      ],
      thresholds: { lines: 95, functions: 95, statements: 95, branches: 90 },
    });
    expect(isRecord(coverage) ? coverage["exclude"] : undefined).toContain("**/*.generated.ts");
  });
});

describe("playwright.config.ts", () => {
  it("TST-AC07: defines the four projects and runs against the preview server", () => {
    expect(playwrightConfig.projects?.map((project) => project.name)).toEqual([
      "chromium",
      "firefox",
      "webkit",
      "export",
    ]);
    expect(playwrightConfig.use?.baseURL).toBe("http://localhost:4173");
    expect(playwrightConfig.webServer).toMatchObject({
      command: "pnpm preview",
      url: "http://localhost:4173",
    });
  });
});

describe("LICENSE", () => {
  it("DEP-AC08: is the MIT license in the name of the author", () => {
    const license = readRepoFile("LICENSE");
    expect(license.startsWith("MIT License\n")).toBe(true);
    expect(license).toContain("Copyright (c) 2026 Juan Esteban Álvarez García");
    expect(license).toContain("Permission is hereby granted, free of charge, to any person");
    expect(license).toContain('THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND');
  });
});
