import type { Page } from "@playwright/test";

import { expect, test } from "./support/base";

const PREFS_KEY = "portfolio:v1:prefs";

/**
 * Waits until the entry page has sent the browser to a home. The page itself is asked where it
 * is: Firefox sometimes does not report the end of a navigation that a script started, and an
 * assertion on the URL of Playwright would then wait for it in vain (TST-R26).
 */
async function expectRedirectTo(page: Page, path: string): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => window.location.pathname).catch(() => "navigating"))
    .toBe(path);
}

test.describe("entry page with a Spanish browser", () => {
  test.use({ locale: "es-CO" });

  test("SYS-AC04: leads to the Spanish home", async ({ page }) => {
    await page.goto("/");
    await expectRedirectTo(page, "/es/");
  });

  test("I18N-AC10: a URL in English stays in English", async ({ page }) => {
    await page.goto("/en/projects/");

    await expect(page).toHaveURL("/en/projects/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("dialog", { name: "Projects" })).toBeVisible();
  });

  test("I18N-AC13: after choosing English, the entry page leads to the English home", async ({
    page,
  }) => {
    await page.goto("/es/cv/");
    await page.getByRole("banner").getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL("/en/cv/");

    await page.goto("/");
    await expectRedirectTo(page, "/en/");
  });

  test("I18N-AC13: opening a URL in English does not change the preference", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.getByRole("link", { name: "Processor (CPU): Profile" })).toBeVisible();

    await page.goto("/");
    await expectRedirectTo(page, "/es/");
  });
});

test.describe("entry page with a German browser", () => {
  test.use({ locale: "de-DE" });

  test("SYS-AC04: leads to the English home", async ({ page }) => {
    await page.goto("/");
    await expectRedirectTo(page, "/en/");
  });
});

test.describe("entry page with an English browser", () => {
  test.use({ locale: "en-US" });

  test("SYS-AC04: a stored preference for Spanish wins over the browser", async ({ page }) => {
    await page.addInitScript((key) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({ soundEnabled: false, sceneVariant: "photo", locale: "es" }),
      );
    }, PREFS_KEY);

    await page.goto("/");
    await expectRedirectTo(page, "/es/");
  });
});

test("I18N-AC14: every language option is named in its language, and the active one is marked", async ({
  page,
}) => {
  await page.goto("/es/cv/");
  const switcher = page.getByRole("group", { name: "Idioma" });

  const english = switcher.getByRole("link", { name: "English" });
  await expect(english).toHaveAttribute("lang", "en");
  await expect(english).toHaveAttribute("hreflang", "en");
  await expect(english).toHaveAttribute("href", "/en/cv/");

  const spanish = switcher.locator("[aria-current=true]");
  await expect(spanish).toHaveText(/Español/);
  await expect(spanish).toHaveAttribute("lang", "es");
  await expect(switcher.getByRole("link")).toHaveCount(1);

  await english.click();
  await expect(page).toHaveURL("/en/cv/");
  await expect(
    page.getByRole("group", { name: "Language" }).locator("[aria-current=true]"),
  ).toHaveText(/English/);
});

test.describe("404 page", () => {
  test.use({ allowedIssues: ["error-response", "console"] });

  test("I18N-AC16: the Spanish texts of the 404 page are marked as Spanish", async ({ page }) => {
    await page.goto("/es/unknown/");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
    await expect(
      page.locator("[lang=es]").filter({ hasText: "Página no encontrada" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Go to the portfolio" })).toHaveAttribute(
      "href",
      "/en/",
    );
    await expect(page.getByRole("link", { name: "Ir al portfolio" })).toHaveAttribute(
      "href",
      "/es/",
    );
  });
});
