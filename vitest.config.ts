import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/** Paths whose coverage is mandatory: the logic and the section registry (TST-R08). */
export const COVERAGE_INCLUDE = [
  "src/**/lib/**/*.ts",
  "src/shared/state/**/*.ts",
  "src/shared/i18n/**/*.ts",
  "src/shared/config/**/*.ts",
  "src/shared/contracts/**/*.ts",
  "src/features/registry.ts",
];

export const COVERAGE_EXCLUDE = ["**/*.generated.ts", "**/*.test.ts", "**/*.test.tsx"];

export const COVERAGE_THRESHOLDS = { lines: 95, functions: 95, statements: 95, branches: 90 };

const UNIT_TESTS = ["src/**/*.test.ts", "tests/**/*.test.ts"];
const COMPONENT_TESTS = ["src/**/*.test.tsx"];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    projects: [
      {
        extends: true,
        test: { name: "unit", environment: "node", include: UNIT_TESTS },
      },
      {
        extends: true,
        test: {
          name: "component",
          environment: "jsdom",
          include: COMPONENT_TESTS,
          setupFiles: ["./vitest.setup.ts"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      include: COVERAGE_INCLUDE,
      exclude: COVERAGE_EXCLUDE,
      thresholds: COVERAGE_THRESHOLDS,
      reporter: ["text-summary", "json-summary", "html"],
    },
  },
});
