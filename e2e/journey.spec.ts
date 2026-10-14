import type { Locator, Page } from "@playwright/test";

import { expect, test } from "./support/base";

const PREFS_KEY = "portfolio:v1:prefs";

function html(page: Page): Locator {
  return page.locator("html");
}

/** The skip link and the controls of the fixed bar, by their accessible names (QLT-R07). */
const BAR_ORDER = [
  "Saltar al contenido",
  "ENEnglish",
  "Vista simple",
  "Descargar CV (PDF)",
  "Escribir un correo",
  "LinkedIn (se abre en una pestaña nueva)",
  "GitHub (se abre en una pestaña nueva)",
];

/** Presses Tab as many times as asked, and returns the name of each element that got the focus. */
async function tabOrder(page: Page, presses: number): Promise<readonly string[]> {
  const order: string[] = [];
  for (let press = 0; press < presses; press += 1) {
    await page.keyboard.press("Tab");
    order.push(
      await page.evaluate(() => {
        const element = document.activeElement;
        return (element?.getAttribute("aria-label") ?? element?.textContent ?? "").trim();
      }),
    );
  }
  return order;
}

/**
 * Presses Tab, or Shift+Tab to go backwards, until the element has the focus, as a keyboard user
 * would reach it.
 */
async function tabTo(page: Page, target: Locator, key = "Tab"): Promise<void> {
  for (let presses = 0; presses < 30; presses += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) return;
    await page.keyboard.press(key);
  }
  await expect(target).toBeFocused();
}

test.describe("keyboard", () => {
  test("QLT-AC03: Tab walks the skip link, the fixed bar and the eight pieces in canonical order", async ({
    page,
  }) => {
    await page.goto("/es/");
    await expect(page.getByTestId("scene-root")).toBeVisible();

    expect(await tabOrder(page, 15)).toEqual([
      ...BAR_ORDER,
      "Procesador (CPU): Perfil",
      "Fuente de poder (PSU): Experiencia",
      "SSD NVMe: Proyectos",
      "Memoria RAM: Stack tecnológico",
      "Panel I/O: Contacto",
      "Ventilador ARGB: Ecosistema personal",
      "Pila CMOS: Acerca de este sitio",
      "Panel frontal: Ajustes",
    ]);
  });

  test.describe("with the welcome open", () => {
    test.use({ welcomeSeen: false });

    test("QLT-AC03: while the welcome is open, Tab only walks its three controls", async ({
      page,
    }) => {
      await page.goto("/es/");
      const dialog = page.getByRole("dialog", { name: "Sistema listo" });
      await expect(dialog.getByRole("heading", { level: 2 })).toBeFocused();

      expect(await tabOrder(page, 3)).toEqual(["Cerrar bienvenida", "Explorar", "Ver mi perfil"]);
    });
  });

  test.describe("from a first visit", () => {
    test.use({ bootSeen: false, welcomeSeen: false });

    test("VSN-AC08: the whole site can be used with the keyboard alone", async ({ page }) => {
      // A whole tour of the site: in WebKit under load it takes over 20 seconds.
      test.slow();
      await page.goto("/es/");
      await expect(page.getByTestId("boot-screen")).toBeVisible();

      // Skip the boot sequence.
      await page.keyboard.press("Enter");
      await expect(html(page)).toHaveAttribute("data-boot", "done");

      // The welcome opens with the focus on its title; Esc closes it and goes on to the first piece.
      const welcomeTitle = page
        .getByRole("dialog", { name: "Sistema listo" })
        .getByRole("heading", { level: 2 });
      await expect(welcomeTitle).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(page.getByTestId("scene-welcome")).toHaveCount(0);
      await expect(page.getByRole("link", { name: "Procesador (CPU): Perfil" })).toBeFocused();

      // Open and close each of the seven panels from its piece.
      for (const [zone, title] of [
        ["Procesador (CPU): Perfil", "Perfil"],
        ["Fuente de poder (PSU): Experiencia", "Experiencia"],
        ["SSD NVMe: Proyectos", "Proyectos"],
        ["Memoria RAM: Stack tecnológico", "Stack tecnológico"],
        ["Panel I/O: Contacto", "Contacto"],
        ["Ventilador ARGB: Ecosistema personal", "Ecosistema personal"],
        ["Pila CMOS: Acerca de este sitio", "Acerca de este sitio"],
      ] as const) {
        const piece = page.getByRole("link", { name: zone });
        await tabTo(page, piece);
        await page.keyboard.press("Enter");
        await expect(page.getByRole("dialog", { name: title })).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(page).toHaveURL("/es/");
        await expect(piece).toBeFocused();
      }

      // Turn the sound on from the settings menu.
      const frontPanel = page.getByRole("button", { name: "Panel frontal: Ajustes" });
      await tabTo(page, frontPanel);
      await page.keyboard.press("Enter");
      const sound = page.getByRole("switch", { name: "Sonido" });
      await expect(sound).toBeFocused();
      await page.keyboard.press("Space");
      await expect(sound).toHaveAttribute("aria-checked", "true");

      // Reset the session, which replays the boot sequence; skip it again.
      const reset = page.getByRole("button", { name: "Reiniciar sesión" });
      await tabTo(page, reset);
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("boot-screen")).toBeVisible();
      await page.keyboard.press("Enter");
      await expect(html(page)).toHaveAttribute("data-boot", "done");
      await expect(page.getByTestId("post-display")).toHaveAttribute("data-value", "00");
      // A new session greets again, with the focus on the welcome; "Explore" closes it and goes
      // on to the first piece.
      await expect(welcomeTitle).toBeFocused();
      const explore = page.getByRole("button", { name: "Explorar" });
      await tabTo(page, explore);
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("scene-welcome")).toHaveCount(0);
      await expect(page.getByRole("link", { name: "Procesador (CPU): Perfil" })).toBeFocused();

      // Change the language from the fixed bar.
      const english = page
        .getByRole("navigation", { name: "Controles del sitio" })
        .getByRole("link", { name: "English" });
      // The bar comes before the pieces: from the last piece, the way to it is backwards.
      await tabTo(page, frontPanel);
      await tabTo(page, english, "Shift+Tab");
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL("/en/");
      await expect(html(page)).toHaveAttribute("lang", "en");
      expect(await page.evaluate((key) => window.localStorage.getItem(key), PREFS_KEY)).toContain(
        '"soundEnabled":true',
      );
    });
  });
});

test.describe("language with a section open", () => {
  test("VSN-AC06, I18N-AC11: changing language keeps the section and the fragment, with its panel open", async ({
    page,
  }) => {
    await page.goto("/es/projects/#projects-habicapital");
    const panel = page.getByRole("dialog", { name: "Proyectos" });
    await expect(panel).toBeVisible();

    await panel.getByRole("link", { name: "English" }).click();

    await expect(page).toHaveURL("/en/projects/#projects-habicapital");
    await expect(page.getByRole("dialog", { name: "Projects" })).toBeVisible();
    await expect(page.locator("#panel-projects-habicapital")).toBeInViewport();
  });

  test("I18N-AC12: after the change the page is in English, with no boot, the same progress and the focus on the switcher", async ({
    page,
  }) => {
    await page.goto("/es/");
    await page.getByRole("link", { name: "Procesador (CPU): Perfil" }).click();
    await expect(page.getByRole("dialog", { name: "Perfil" })).toBeVisible();
    await page.getByRole("link", { name: "Sección siguiente: Experiencia" }).click();
    const panel = page.getByRole("dialog", { name: "Experiencia" });
    await expect(panel).toBeVisible();

    await panel.getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL("/en/experience/");
    const english = page.getByRole("dialog", { name: "Experience" });
    await expect(english).toBeVisible();

    await expect(html(page)).toHaveAttribute("lang", "en");
    await expect(page).toHaveTitle(/Experience/);
    await expect(html(page)).toHaveAttribute("data-boot", "done");
    await expect(page.getByTestId("boot-screen")).toBeHidden();
    await expect(page.getByTestId("post-display")).toHaveAttribute("data-value", "02");
    const current = english.getByRole("group", { name: "Language" }).locator("[aria-current=true]");
    await expect(current).toHaveText(/English/);
    await expect(current).toBeFocused();
  });

  test("SET-AC03: the switcher of the fixed bar changes the language of the scene", async ({
    page,
  }) => {
    await page.goto("/es/");
    await page
      .getByRole("navigation", { name: "Controles del sitio" })
      .getByRole("link", { name: "English" })
      .click();

    await expect(page).toHaveURL("/en/");
    await expect(html(page)).toHaveAttribute("lang", "en");
    await expect(html(page)).toHaveAttribute("data-mode", "scene");
    await expect(html(page)).toHaveAttribute("data-boot", "done");
    const current = page
      .getByRole("navigation", { name: "Site controls" })
      .locator("[aria-current=true]");
    await expect(current).toBeFocused();
    await expect(page.getByRole("link", { name: "Processor (CPU): Profile" })).toBeVisible();
  });
});

test.describe("quiet page", () => {
  test.describe("from a first visit", () => {
    test.use({ bootSeen: false });

    test("QLT-AC10: with the sound off, a whole visit creates no audio context, element or request", async ({
      page,
    }) => {
      await page.addInitScript(() => {
        const created: string[] = [];
        Object.assign(window, { audioContextsCreated: created });
        for (const name of ["AudioContext", "webkitAudioContext"] as const) {
          const original = (window as unknown as Record<string, unknown>)[name];
          if (typeof original !== "function") continue;
          Object.assign(window, {
            [name]: new Proxy(original, {
              construct(target, args: unknown[]) {
                created.push(name);
                return Reflect.construct(target, args) as object;
              },
            }),
          });
        }
      });
      const media: string[] = [];
      page.on("request", (request) => {
        if (
          request.resourceType() === "media" ||
          /\.(?:mp3|ogg|wav|m4a|aac|flac)(?:$|\?)/.test(request.url())
        ) {
          media.push(request.url());
        }
      });

      await page.goto("/es/");
      await expect(html(page)).toHaveAttribute("data-boot", "done", { timeout: 4000 });
      await page.getByRole("link", { name: "SSD NVMe: Proyectos" }).click();
      await expect(page.getByRole("dialog", { name: "Proyectos" })).toBeVisible();
      await page.getByRole("link", { name: "Sección siguiente: Stack tecnológico" }).click();
      await expect(page.getByRole("dialog", { name: "Stack tecnológico" })).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page).toHaveURL("/es/");
      await page.getByRole("button", { name: "Panel frontal: Ajustes" }).click();
      await page.getByRole("radio", { name: "Boceto" }).check();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toBeHidden();

      expect(
        await page.evaluate(
          () => (window as unknown as { audioContextsCreated: string[] }).audioContextsCreated,
        ),
      ).toEqual([]);
      expect(await page.locator("audio, video").count()).toBe(0);
      expect(media).toEqual([]);
    });
  });

  test("QLT-AC09: six seconds after the scene shows, nothing on the page is still animating", async ({
    page,
  }) => {
    await page.goto("/es/");
    await expect(page.getByTestId("scene-root")).toBeVisible();
    const start = Date.now();

    await expect
      .poll(
        () =>
          page.evaluate(
            () =>
              document.getAnimations().filter((animation) => animation.playState === "running")
                .length,
          ),
        { timeout: 6000 },
      )
      .toBe(0);
    expect(Date.now() - start).toBeLessThanOrEqual(6000);
  });
});

test.describe("time to explore", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "measured only in Chromium (QLT-AC13)",
  );

  function sceneReady(page: Page): Promise<number> {
    return page.evaluate(
      () => performance.getEntriesByName("scene:ready").at(0)?.startTime ?? Number.NaN,
    );
  }

  test("QLT-AC13: without boot sequence the scene is ready within 1200 ms", async ({ page }) => {
    await page.goto("/es/");
    await expect.poll(() => sceneReady(page)).toBeLessThanOrEqual(1200);
  });

  test.describe("on a first visit", () => {
    test.use({ bootSeen: false });

    test("QLT-AC13: with the boot sequence the scene is ready within 3000 ms", async ({ page }) => {
      await page.goto("/es/");
      await expect(html(page)).toHaveAttribute("data-boot", "done", { timeout: 4000 });
      await expect.poll(() => sceneReady(page)).toBeLessThanOrEqual(3000);
    });
  });
});
