import type { Locator, Page } from "@playwright/test";

import { expect, test } from "./support/base";
import { VIEWPORTS } from "./support/viewports";

const AUTHOR = "Juan Esteban Álvarez García";

/** Number of elements with a role that assistive technology is given, hidden ones left out. */
async function exposed(page: Page, role: "main" | "heading"): Promise<number> {
  const locator: Locator =
    role === "main" ? page.getByRole("main") : page.getByRole("heading", { level: 1 });
  return locator.count();
}

test.describe("landmarks and skip link", () => {
  test("QLT-AC02: the scene exposes one main and one h1, and its skip link leads to that main", async ({
    page,
  }) => {
    await page.goto("/es/");
    await expect(page.getByTestId("scene-root")).toBeVisible();

    expect(await exposed(page, "main")).toBe(1);
    expect(await exposed(page, "heading")).toBe(1);
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Saltar al contenido" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
    await expect(page.getByRole("main")).toHaveAttribute("id", "scene");
  });

  for (const path of ["/es/", "/es/cv/"]) {
    test.describe(`simple view at ${path}`, () => {
      test.use({ viewport: VIEWPORTS.mobile });

      test(`QLT-AC02: ${path} on a phone exposes one main and one h1, and its skip link leads to that main`, async ({
        page,
      }) => {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(AUTHOR);

        expect(await exposed(page, "main")).toBe(1);
        expect(await exposed(page, "heading")).toBe(1);
        await page.keyboard.press("Tab");
        await expect(page.getByRole("link", { name: "Saltar al contenido" })).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(page.getByRole("main")).toBeFocused();
      });
    });
  }
});

test.describe("text spacing", () => {
  /** The spacing that WCAG 1.4.12 asks a page to withstand (QLT-R15). */
  const SPACING = `* {
    line-height: 1.5 !important;
    letter-spacing: 0.12em !important;
    word-spacing: 0.16em !important;
  }
  p { margin-bottom: 2em !important; }`;

  /**
   * Applies the spacing through the object model of the page: the policy of the site forbids
   * inline styles, and a style sheet built from a script is not one (QLT-R31).
   */
  async function applySpacing(page: Page): Promise<void> {
    await page.evaluate((css) => {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    }, SPACING);
  }

  /** Elements that cut their own text, apart from those hidden on purpose and the given one. */
  function clipped(page: Page, allowed: string): Promise<readonly string[]> {
    return page.evaluate((scrollZone) => {
      const found: string[] = [];
      for (const element of document.querySelectorAll<HTMLElement>("body *")) {
        const style = getComputedStyle(element);
        const hasText = [...element.childNodes].some(
          (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").trim() !== "",
        );
        // Not rendered, or one of the boxes that hold text only for screen readers: 1 px wide
        // or, as the skip link while it has no focus, clipped away whole.
        if (!hasText || element.clientWidth <= 1 || element.clientHeight <= 1) continue;
        if (style.clipPath !== "none") continue;
        if (style.overflowX === "visible" && style.overflowY === "visible") continue;
        if (element.matches(scrollZone)) continue;
        const cutsWidth = element.scrollWidth > element.clientWidth + 1;
        const cutsHeight = element.scrollHeight > element.clientHeight + 1;
        if (cutsWidth || cutsHeight) {
          found.push(`${element.tagName} ${element.textContent.trim().slice(0, 40)}`);
        }
      }
      return found;
    }, allowed);
  }

  test("QLT-AC08: with the text spacing of WCAG, no text of the simple view is cut", async ({
    page,
  }) => {
    await page.goto("/es/cv/");
    await applySpacing(page);

    expect(await clipped(page, "[data-none]")).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
  });

  test("QLT-AC08: with the text spacing of WCAG, no text of a panel is cut", async ({ page }) => {
    await page.goto("/es/projects/");
    await expect(page.getByRole("dialog", { name: "Proyectos" })).toBeVisible();
    await applySpacing(page);

    expect(await clipped(page, "[data-testid=panel-content]")).toEqual([]);
    await expect(page.getByRole("button", { name: "Cerrar" })).toBeInViewport();
    await expect(page.getByRole("link", { name: /^Sección siguiente/ })).toBeInViewport();
  });
});

test.describe("what the site leaves in the browser", () => {
  test("QLT-AC23: after a whole visit there are no cookies and only the two storage keys of the site", async ({
    page,
  }) => {
    await page.goto("/es/");
    await page.getByRole("link", { name: "SSD NVMe: Proyectos" }).click();
    await expect(page.getByRole("dialog", { name: "Proyectos" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL("/es/");
    await page.getByRole("button", { name: "Panel frontal: Ajustes" }).click();
    await page.getByRole("switch", { name: "Sonido" }).click();
    await page.getByRole("radio", { name: "Boceto" }).check();
    await page
      .getByRole("dialog", { name: "Ajustes" })
      .getByRole("link", { name: "English" })
      .click();
    await expect(page).toHaveURL("/en/");
    await page.goto("/en/cv/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(AUTHOR);

    const left = await page.evaluate(() => ({
      cookies: document.cookie,
      local: Object.keys(window.localStorage),
      session: Object.keys(window.sessionStorage),
    }));
    expect(left).toEqual({
      cookies: "",
      local: ["portfolio:v1:prefs"],
      session: ["portfolio:v1:session"],
    });
    expect(await page.context().cookies()).toEqual([]);
  });
});

test.describe("controls and fonts", () => {
  /** Smallest side, in pixels, of every control that the locator matches. */
  async function smallestSide(controls: Locator): Promise<number> {
    const sides = await controls.evaluateAll((elements) =>
      elements.map((element) => {
        const box = element.getBoundingClientRect();
        return Math.min(box.width, box.height);
      }),
    );
    expect(sides.length).toBeGreaterThan(0);
    return Math.min(...sides);
  }

  test("VIS-AC08: the controls of the fixed bar, the settings menu and the panel measure 44 px or more", async ({
    page,
  }) => {
    await page.goto("/es/");
    const bar = page.getByRole("navigation", { name: "Controles del sitio" });
    await expect(bar).toBeVisible();
    expect(await smallestSide(bar.getByRole("link"))).toBeGreaterThanOrEqual(44);

    await page.getByRole("button", { name: "Panel frontal: Ajustes" }).click();
    const menu = page.getByRole("dialog", { name: "Ajustes" });
    await expect(menu).toBeVisible();
    await expect
      .poll(() =>
        page
          .getByTestId("settings-menu")
          .evaluate((element) =>
            element.getAnimations().every((animation) => animation.playState === "finished"),
          ),
      )
      .toBe(true);
    expect(await smallestSide(menu.getByRole("button"))).toBeGreaterThanOrEqual(44);
    expect(await smallestSide(menu.getByRole("switch"))).toBeGreaterThanOrEqual(44);
    expect(await smallestSide(menu.getByRole("link"))).toBeGreaterThanOrEqual(44);
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();

    await page.getByRole("link", { name: "Panel I/O: Contacto" }).click();
    const panel = page.getByRole("dialog", { name: "Contacto" });
    await expect(panel).toHaveAttribute("data-phase", "open");
    expect(
      await smallestSide(panel.getByRole("button", { name: "Cerrar" })),
    ).toBeGreaterThanOrEqual(44);
    expect(
      await smallestSide(panel.getByRole("link", { name: /^Sección (?:anterior|siguiente)/ })),
    ).toBeGreaterThanOrEqual(44);
  });

  for (const path of ["/es/", "/es/cv/"]) {
    test(`VIS-AC09: ${path} loads only the two families of the visual system`, async ({ page }) => {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);

      const families = await page.evaluate(() =>
        [...document.fonts]
          .filter((face) => face.status === "loaded")
          .map((face) => face.family.replaceAll('"', "")),
      );
      expect(families.length).toBeGreaterThan(0);
      for (const family of families) {
        expect(family).toMatch(/^(?:Inter|JetBrains Mono)(?: Fallback)?$/);
      }
    });
  }
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  /** Longest transition declared on any element, and how many animations loop without end. */
  function motion(page: Page): Promise<{ longest: number; looping: number }> {
    return page.evaluate(() => {
      let longest = 0;
      for (const element of document.querySelectorAll("*")) {
        for (const duration of getComputedStyle(element).transitionDuration.split(",")) {
          const value = duration.trim();
          const milliseconds = value.endsWith("ms")
            ? Number.parseFloat(value)
            : Number.parseFloat(value) * 1000;
          longest = Math.max(longest, milliseconds);
        }
      }
      const looping = document
        .getAnimations()
        .filter(
          (animation) =>
            animation.playState === "running" &&
            animation.effect?.getComputedTiming().iterations === Infinity,
        ).length;
      return { longest, looping };
    });
  }

  test("VIS-AC05: with reduced motion nothing loops and no transition lasts more than 150 ms", async ({
    page,
  }) => {
    await page.goto("/es/");
    await expect(page.getByTestId("scene-root")).toBeVisible();
    expect(await motion(page)).toEqual({ longest: 150, looping: 0 });

    await page.getByRole("link", { name: "SSD NVMe: Proyectos" }).click();
    await expect(page.getByRole("dialog", { name: "Proyectos" })).toHaveAttribute(
      "data-phase",
      "open",
    );
    expect(await motion(page)).toEqual({ longest: 150, looping: 0 });
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL("/es/");

    await page.getByRole("button", { name: "Panel frontal: Ajustes" }).click();
    await expect(page.getByTestId("settings-menu")).toBeVisible();
    expect(await motion(page)).toEqual({ longest: 150, looping: 0 });

    await page.goto("/es/cv/");
    const simple = await motion(page);
    expect(simple.looping).toBe(0);
    expect(simple.longest).toBeLessThanOrEqual(150);
  });
});
