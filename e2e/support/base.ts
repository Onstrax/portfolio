import { expect, test as base } from "@playwright/test";

/** Origin of the exported site served by `pnpm preview` (TST-R20). */
export const ORIGIN = "http://localhost:4173";

export type PageIssueKind =
  "console" | "exception" | "failed-request" | "error-response" | "foreign-request";

export interface PageIssue {
  readonly kind: PageIssueKind;
  readonly detail: string;
}

interface BaseOptions {
  /** Kinds of issue that a test provokes on purpose. Declared locally with `test.use` (TST-R23). */
  readonly allowedIssues: readonly PageIssueKind[];
}

interface BaseFixtures {
  readonly pageGuard: undefined;
}

const LOCAL_SCHEMES = ["data:", "blob:", "about:"];

/**
 * Base test of every E2E spec. It fails any test in which the page logs an error or a warning,
 * throws, has a failed or error response, or requests another origin (TST-R23).
 */
export const test = base.extend<BaseOptions & BaseFixtures>({
  allowedIssues: [[], { option: true }],

  pageGuard: [
    async ({ page, allowedIssues }, use) => {
      const issues: PageIssue[] = [];
      const record = (kind: PageIssueKind, detail: string): void => {
        if (!allowedIssues.includes(kind)) issues.push({ kind, detail });
      };

      page.on("console", (message) => {
        const type = message.type();
        if (type === "error" || type === "warning") record("console", `${type}: ${message.text()}`);
      });
      page.on("pageerror", (error) => {
        record("exception", error.message);
      });
      page.on("requestfailed", (request) => {
        record("failed-request", `${request.url()} ${request.failure()?.errorText ?? ""}`.trim());
      });
      page.on("response", (response) => {
        if (response.status() >= 400) {
          record("error-response", `${String(response.status())} ${response.url()}`);
        }
      });
      page.on("request", (request) => {
        const url = request.url();
        if (LOCAL_SCHEMES.some((scheme) => url.startsWith(scheme))) return;
        if (new URL(url).origin !== ORIGIN) record("foreign-request", url);
      });

      await use(undefined);

      expect(issues, "the page must load without errors, warnings or foreign requests").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
