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
  /**
   * `true` to start with the boot sequence already seen, which saves two seconds per test; the
   * tests of the boot sequence itself turn it off (TST-R26).
   */
  readonly bootSeen: boolean;
}

interface BaseFixtures {
  readonly pageGuard: undefined;
}

const LOCAL_SCHEMES = ["data:", "blob:", "about:"];
const SESSION_KEY = "portfolio:v1:session";

/** Error text of a cancelled request in Chromium, Firefox and WebKit, in that order. */
const CANCELLED_BY_BROWSER = /ERR_ABORTED|NS_BINDING_ABORTED|cancell?ed/i;

/**
 * What WebKit logs, as an error, for a `fetch` that a navigation cancels. For a URL of the site
 * itself it cannot mean anything else: access control never blocks a same-origin request.
 */
const CANCELLED_FETCH = /localhost:4173\/\S* due to access control checks\.$/;

/**
 * What Firefox logs, as a warning, for a script of the site whose download a navigation cancels.
 * A script that really fails still shows up as a failed request or as an error response.
 */
const CANCELLED_SCRIPT = /Loading failed for the <script> with source .http:\/\/localhost:4173\//;

/** Time after which a navigation of Firefox is checked by hand (TST-R26). */
const FIREFOX_LOAD_TIMEOUT_MS = 10_000;

/**
 * Base test of every E2E spec. It fails any test in which the page logs an error or a warning,
 * throws, has a failed or error response, or requests another origin (TST-R23).
 */
export const test = base.extend<BaseOptions & BaseFixtures>({
  allowedIssues: [[], { option: true }],
  bootSeen: [true, { option: true }],

  pageGuard: [
    async ({ page, allowedIssues, bootSeen, browserName, javaScriptEnabled }, use) => {
      const issues: PageIssue[] = [];
      const record = (kind: PageIssueKind, detail: string): void => {
        if (!allowedIssues.includes(kind)) issues.push({ kind, detail });
      };

      page.on("console", (message) => {
        const type = message.type();
        if (type !== "error" && type !== "warning") return;
        const text = message.text();
        if (CANCELLED_FETCH.test(text) || CANCELLED_SCRIPT.test(text)) return;
        record("console", `${type}: ${text}`);
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

      if (bootSeen) {
        // Only when the session is new: a reload must find what the page stored.
        await page.addInitScript((key) => {
          try {
            if (window.sessionStorage.getItem(key) === null) {
              window.sessionStorage.setItem(key, JSON.stringify({ bootSeen: true, visited: [] }));
            }
          } catch {
            // A test that disables storage starts without a session.
          }
        }, SESSION_KEY);
      }

      // Firefox, under load, can report the end of the initial blank page after the first
      // navigation of the test has started; Playwright then waits forever for a load that already
      // happened. Navigating once to the blank page settles it before the test begins.
      if (browserName === "firefox") {
        await page.goto("about:blank");
        // Rarely, and only under load, it still happens. Then the page is there and complete, but
        // Playwright keeps waiting: after a while the navigation is checked by hand.
        const goto = page.goto.bind(page);
        page.goto = async (url, options) => {
          try {
            return await goto(url, { timeout: FIREFOX_LOAD_TIMEOUT_MS, ...options });
          } catch (error) {
            const isTimeout = error instanceof Error && error.name === "TimeoutError";
            // Without JavaScript a page keeps no state, so loading it again changes nothing, and
            // it leaves Playwright with a navigation that it did see end. The tests that follow
            // links need that: there every click is a navigation, and one started from a page
            // that Playwright still believes to be loading is never seen to end either.
            if (isTimeout && !javaScriptEnabled) {
              return await goto(url, { timeout: FIREFOX_LOAD_TIMEOUT_MS, ...options });
            }
            const wanted = new URL(url, ORIGIN).pathname;
            const isThere = await page
              .evaluate(
                (path) => document.readyState === "complete" && window.location.pathname === path,
                wanted,
              )
              .catch(() => false);
            if (!isTimeout || !isThere) throw error;
            return null;
          }
        };
      }

      await use(undefined);

      expect(issues, "the page must load without errors, warnings or foreign requests").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
