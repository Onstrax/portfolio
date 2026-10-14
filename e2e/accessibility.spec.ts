import { CASE_STUDY_IDS, SECTION_SLUGS } from "../src/shared/contracts/ids";
import { LOCALES } from "../src/shared/contracts/locale";
import type { Page } from "@playwright/test";

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

/** Titles of the seven sections, by slug, to wait for the panel of each one. */
const TITLES: Readonly<Record<string, readonly [string, string]>> = {
  profile: ["Perfil", "Profile"],
  experience: ["Experiencia", "Experience"],
  projects: ["Proyectos", "Projects"],
  stack: ["Stack tecnológico", "Tech stack"],
  contact: ["Contacto", "Contact"],
  ecosystem: ["Ecosistema personal", "Personal ecosystem"],
  about: ["Acerca de este sitio", "About this site"],
};

/**
 * Waits until the welcome has faded in: while it fades (M-12), its text has less contrast than its
 * colors give.
 */
async function waitForWelcome(page: Page): Promise<void> {
  const welcome = page.getByTestId("scene-welcome");
  await expect(welcome).toBeVisible();
  await expect
    .poll(() => welcome.evaluate((element) => element.getAnimations({ subtree: true }).length))
    .toBe(0);
}

async function expectNoViolations(page: Page): Promise<void> {
  expect(await findAccessibilityViolations(page)).toEqual([]);
}

/** The states of QLT §4.1.7. Contrast is one of the rules, which is what VIS-AC03 asks for. */
test.describe("auditable states of the scene", () => {
  for (const [index, locale] of LOCALES.entries()) {
    test(`QLT-AC01, VIS-AC03: the scene at rest has no accessibility violations (${locale})`, async ({
      page,
    }) => {
      await page.goto(`/${locale}/`);
      await expect(page.locator("img[data-state=shown]")).toBeVisible();
      await expectNoViolations(page);
    });

    test(`QLT-AC01, VIS-AC03: the settings menu has no accessibility violations (${locale})`, async ({
      page,
    }) => {
      await page.goto(`/${locale}/`);
      await page.locator("button[data-zone=settings]").click();
      await expect(page.getByTestId("settings-menu")).toBeVisible();
      await expectNoViolations(page);
    });

    for (const section of SECTION_SLUGS) {
      test(`QLT-AC01, VIS-AC03: the panel of ${section} has no accessibility violations (${locale})`, async ({
        page,
      }) => {
        await page.goto(`/${locale}/${section}/`);
        const title = TITLES[section]?.[index] ?? "";
        await expect(page.getByRole("dialog", { name: title })).toHaveAttribute(
          "data-phase",
          "open",
        );
        await expectNoViolations(page);
      });
    }
  }

  test("QLT-AC01: the scene in its sketch variant has no accessibility violations", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "portfolio:v1:prefs",
        JSON.stringify({ soundEnabled: false, sceneVariant: "sketch" }),
      );
    });
    await page.goto("/es/");
    await expect(page.locator("img[data-state=shown]")).toHaveAttribute("data-variant", "sketch");
    await expectNoViolations(page);
  });

  test("QLT-AC01: the scene with a label on screen has no accessibility violations", async ({
    page,
  }) => {
    await page.goto("/es/");
    await page.getByRole("link", { name: "Procesador (CPU): Perfil" }).focus();
    await expect(
      page.getByTestId("scene-label").filter({ hasText: "Procesador (CPU)" }),
    ).toBeVisible();
    await expectNoViolations(page);
  });

  test.describe("with the welcome on view", () => {
    test.use({ welcomeSeen: false });

    for (const locale of LOCALES) {
      test(`QLT-AC01, VIS-AC03: the scene with the welcome has no accessibility violations (${locale})`, async ({
        page,
      }) => {
        await page.goto(`/${locale}/`);
        await expect(page.locator("img[data-state=shown]")).toBeVisible();
        await expect(page.getByTestId("scene-welcome")).toBeVisible();
        await waitForWelcome(page);
        await expectNoViolations(page);
      });
    }

    test("QLT-AC01: the welcome over the sketch variant has no accessibility violations", async ({
      page,
    }) => {
      await page.addInitScript(() => {
        window.localStorage.setItem(
          "portfolio:v1:prefs",
          JSON.stringify({ soundEnabled: false, sceneVariant: "sketch" }),
        );
      });
      await page.goto("/es/");
      await expect(page.locator("img[data-state=shown]")).toHaveAttribute("data-variant", "sketch");
      await expect(page.getByTestId("scene-welcome")).toBeVisible();
      await waitForWelcome(page);
      await expectNoViolations(page);
    });
  });

  test.describe("during the boot sequence", () => {
    test.use({ bootSeen: false });

    test("QLT-AC01: the boot sequence has no accessibility violations", async ({ page }) => {
      // The JavaScript files are held back, so that the sequence stays on screen while it is analyzed.
      let release = (): void => undefined;
      const held = new Promise<void>((resolve) => {
        release = resolve;
      });
      await page.route("**/*.js", async (route) => {
        await held;
        await route.continue();
      });
      await page.goto("/es/", { waitUntil: "commit" });
      await expect(page.getByTestId("boot-screen")).toBeVisible();
      await expect(page.getByRole("button", { name: "Saltar" })).toBeVisible();
      // The state to audit is the whole log: a line that is still fading in has, for 100 ms, less
      // contrast than its color gives.
      await expect
        .poll(() =>
          page
            .getByTestId("boot-screen")
            .evaluate((screen) => screen.getAnimations({ subtree: true }).length),
        )
        .toBe(0);

      await expectNoViolations(page);
      await expect(page.locator("html")).toHaveAttribute("data-boot", "play");
      release();
      await expect(page.locator("html")).toHaveAttribute("data-boot", "done");
    });
  });
});

test.describe("auditable states of the pages without a language", () => {
  // The 404 response is expected, and so are the refusal of the inline scripts provoked below and
  // the error of the application, which cannot start without its data.
  test.use({ allowedIssues: ["error-response", "console", "exception"] });

  test("QLT-AC01: the entry page without JavaScript has no accessibility violations", async ({
    page,
  }) => {
    // Its redirect script is refused, which leaves the page as a browser without JavaScript sees it.
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
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Continuar en español" })).toBeVisible();
    await expectNoViolations(page);
  });

  test("QLT-AC01: the 404 page has no accessibility violations", async ({ page }) => {
    await page.goto("/es/unknown/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
    await expectNoViolations(page);
  });
});

for (const [name, viewport] of [
  ["desktop", VIEWPORTS.desktop],
  ["mobile", VIEWPORTS.mobile],
] as const) {
  test.describe(`simple view on ${name}`, () => {
    test.use({ viewport });

    for (const locale of LOCALES) {
      test(`QLT-AC01, VIS-AC03: the simple view has no accessibility violations (${locale})`, async ({
        page,
      }) => {
        await page.goto(`/${locale}/cv/`);
        await expectNoViolations(page);
      });
    }

    // On a desktop every case study in both languages; on a phone one of them (QLT-R26).
    for (const caseStudy of name === "desktop" ? CASE_STUDY_IDS : (["thesis"] as const)) {
      for (const locale of name === "desktop" ? LOCALES : (["es"] as const)) {
        test(`QLT-AC01, VIS-AC03: the case study ${caseStudy} has no accessibility violations (${locale})`, async ({
          page,
        }) => {
          await page.goto(`/${locale}/projects/${caseStudy}/`);
          await expect(page.getByRole("heading", { level: 2 })).toHaveCount(4);
          await expectNoViolations(page);
        });
      }
    }
  });
}

test.describe("home in simple mode", () => {
  test.use({ viewport: VIEWPORTS.mobile });

  for (const locale of LOCALES) {
    test(`QLT-AC01: the home on a phone has no accessibility violations (${locale})`, async ({
      page,
    }) => {
      await page.goto(`/${locale}/`);
      await expect(page.locator("html")).toHaveAttribute("data-mode", "simple");
      await expectNoViolations(page);
    });
  }
});
