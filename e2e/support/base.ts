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

/** Error text of a cancelled request in Chromium, Firefox and WebKit, in that order. */
const CANCELLED_BY_BROWSER = /ERR_ABORTED|NS_BINDING_ABORTED|cancell?ed/i;

/**
 * What WebKit logs, as an error, for a `fetch` that a navigation cancels. For a URL of the site
 * itself it cannot mean anything else: access control never blocks a same-origin request.
 */
const CANCELLED_FETCH = /localhost:4173\/\S* due to access control checks\.$/;

/**
 * Base test of every E2E spec. It fails any test in which the page logs an error or a warning,
 * throws, has a failed or error response, or requests another origin (TST-R23).
 */
export const test = base.extend<BaseOptions & BaseFixtures>({
  allowedIssues: [[], { option: true }],

  pageGuard: [
    async ({ page, allowedIssues, browserName }, use) => {
      const issues: PageIssue[] = [];
      const record = (kind: PageIssueKind, detail: string): void => {
        if (!allowedIssues.includes(kind)) issues.push({ kind, detail });
      };

      page.on("console", (message) => {
        const type = message.type();
        if (type !== "error" && type !== "warning") return;
        if (CANCELLED_FETCH.test(message.text())) return;
        record("console", `${type}: ${message.text()}`);
      });
      page.on("pageerror", (error) => {
        if (CANCELLED_FETCH.test(error.message)) return;
        record("exception", error.message);
      });
      // A request that the browser itself cancels is not a failure: a navigation interrupts the
      // downloads and prefetches in progress, and the Next.js router probes a page with HEAD and
      // drops the request as soon as the headers arrive.
      page.on("requestfailed", (request) => {
        const errorText = request.failure()?.errorText ?? "";
        if (CANCELLED_BY_BROWSER.test(errorText)) return;
        record("failed-request", `${request.url()} ${errorText}`.trim());
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

      // Firefox, under load, can report the end of the initial blank page after the first
      // navigation of the test has started; Playwright then waits forever for a load that already
      // happened. Navigating once to the blank page settles it before the test begins.
      if (browserName === "firefox") await page.goto("about:blank");

      await use(undefined);

      expect(issues, "the page must load without errors, warnings or foreign requests").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
