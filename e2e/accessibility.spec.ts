import { SECTION_SLUGS } from "../src/shared/contracts/ids";
import { LOCALES } from "../src/shared/contracts/locale";
import { findAccessibilityViolations } from "./support/a11y";
import { expect, test } from "./support/base";
import { VIEWPORTS } from "./support/viewports";

const LANGUAGE_RULES = ["html-has-lang", "html-lang-valid", "valid-lang"];

const PAGES = LOCALES.flatMap((locale) => [
  `/${locale}/`,
  `/${locale}/cv/`,
  ...SECTION_SLUGS.map((section) => `/${locale}/${section}/`),
]);

test("I18N-AC17: no page breaks the language rules", async ({ page }) => {
  test.slow();
  for (const path of PAGES) {
    await page.goto(path);
    const violations = await findAccessibilityViolations(page);
    expect(
      violations.filter((violation) => LANGUAGE_RULES.includes(violation.rule)),
      path,
    ).toEqual([]);
  }
});

test.describe("language rules on pages without a language", () => {
  // The 404 response is expected, and so are the refusal of the inline scripts provoked below and
  // the error of the application, which cannot start without its data.
  test.use({ allowedIssues: ["error-response", "console", "exception"] });

  test("I18N-AC17: the entry page and the 404 page declare the language of each part", async ({
    page,
  }) => {
    // The entry page redirects at once. Serving it with a policy that allows no inline script
    // stops the redirect and keeps the page on screen, so that it can be analyzed.
    await page.route(
      (url) => url.pathname === "/",
      async (route) => {
        const response = await route.fetch();
        await route.fulfill({
          response,
          headers: { ...response.headers(), "content-security-policy": "script-src 'self'" },
        });
      },
    );
    for (const path of ["/", "/es/unknown/"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const violations = await findAccessibilityViolations(page);
      expect(
        violations.filter((violation) => LANGUAGE_RULES.includes(violation.rule)),
        path,
      ).toEqual([]);
    }
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
  });
});

for (const [name, viewport] of [
  ["desktop", VIEWPORTS.desktop],
  ["mobile", VIEWPORTS.mobile],
] as const) {
  test.describe(`simple view on ${name}`, () => {
    test.use({ viewport });

    for (const locale of LOCALES) {
      test(`the simple view has no accessibility violations (${locale})`, async ({ page }) => {
        await page.goto(`/${locale}/cv/`);
        expect(await findAccessibilityViolations(page)).toEqual([]);
      });
    }
  });
}
