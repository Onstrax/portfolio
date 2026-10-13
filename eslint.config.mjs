import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

const TS_FILES = ["**/*.ts", "**/*.tsx"];

/** Files where type assertions are allowed (TSC-R07). */
const ASSERTION_ALLOWED_FILES = [
  "src/shared/lib/typed-object.ts",
  "**/*.test.ts",
  "**/*.test.tsx",
  "e2e/**",
  "tests/**",
];

/** Files where a tool requires a default export (STR-R28). */
const DEFAULT_EXPORT_FILES = [
  "src/app/**/page.tsx",
  "src/app/**/layout.tsx",
  "src/app/**/not-found.tsx",
  "src/app/robots.ts",
  "src/app/sitemap.ts",
  "*.config.ts",
  "*.config.mjs",
];

const NO_ENUM = {
  selector: "TSEnumDeclaration",
  message: "Declare a closed set of values as an `as const` array and derive its type (TSC-R08).",
};
const NO_TYPE_ASSERTION = {
  selector: "TSAsExpression:not([typeAnnotation.typeName.name='const'])",
  message: "Type assertions are not allowed, except `as const` (TSC-R07).",
};

/** Accessibility rules that fail the build (TST-R16). */
const A11Y_RULES = [
  "alt-text",
  "anchor-has-content",
  "anchor-is-valid",
  "aria-activedescendant-has-tabindex",
  "aria-props",
  "aria-proptypes",
  "aria-role",
  "aria-unsupported-elements",
  "click-events-have-key-events",
  "heading-has-content",
  "html-has-lang",
  "iframe-has-title",
  "img-redundant-alt",
  "interactive-supports-focus",
  "label-has-associated-control",
  "mouse-events-have-key-events",
  "no-access-key",
  "no-autofocus",
  "no-distracting-elements",
  "no-interactive-element-to-noninteractive-role",
  "no-noninteractive-element-interactions",
  "no-noninteractive-element-to-interactive-role",
  "no-noninteractive-tabindex",
  "no-redundant-roles",
  "no-static-element-interactions",
  "role-has-required-aria-props",
  "role-supports-aria-props",
  "scope",
  "tabindex-no-positive",
];

/** Punctuation that may be written by hand inside JSX (I18N-R46). */
const ALLOWED_JSX_STRINGS = ["·", "–", "—", "/", ":", "(", ")", ",", ".", "+"];

export default defineConfig([
  globalIgnores([
    ".next/",
    "out/",
    "coverage/",
    "next-env.d.ts",
    "playwright-report/",
    "test-results/",
    ".lighthouseci/",
  ]),
  ...nextVitals,
  ...nextTypescript,
  {
    files: TS_FILES,
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      "no-restricted-syntax": ["error", NO_ENUM, NO_TYPE_ASSERTION],
      "@typescript-eslint/switch-exhaustiveness-check": [
        "error",
        { allowDefaultCaseForExhaustiveSwitch: false },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "import/no-default-export": "error",
    },
  },
  {
    files: ["**/*.ts"],
    rules: { "@typescript-eslint/explicit-module-boundary-types": "error" },
  },
  {
    files: ASSERTION_ALLOWED_FILES,
    rules: { "no-restricted-syntax": ["error", NO_ENUM] },
  },
  {
    files: DEFAULT_EXPORT_FILES,
    rules: { "import/no-default-export": "off" },
  },
  {
    files: ["src/**/*.tsx"],
    ignores: ["**/*.test.tsx"],
    rules: {
      "react/jsx-no-literals": [
        "error",
        { noStrings: true, ignoreProps: true, allowedStrings: ALLOWED_JSX_STRINGS },
      ],
    },
  },
  {
    files: ["**/*.tsx"],
    rules: Object.fromEntries(A11Y_RULES.map((rule) => [`jsx-a11y/${rule}`, "error"])),
  },
  {
    // Images are served from pregenerated derivatives with <picture>, not next/image (SYS §4.1).
    rules: { "@next/next/no-img-element": "off" },
  },
  {
    linterOptions: { reportUnusedDisableDirectives: "error" },
  },
  prettier,
]);
