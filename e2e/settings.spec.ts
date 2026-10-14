import type { Locator, Page } from "@playwright/test";

import { expect, test } from "./support/base";
import { boxesOverlap, type Box } from "./support/measure";
import { type ViewportName, VIEWPORTS } from "./support/viewports";

const PREFS_KEY = "portfolio:v1:prefs";
const SESSION_KEY = "portfolio:v1:session";
const AURA_SKETCH = "rgb(31, 79, 191)";

const SCENE_VIEWPORTS: readonly ViewportName[] = [
  "desktop",
  "desktop-min",
  "desktop-hd",
  "ultrawide",
  "classic",
];

function bar(page: Page): Locator {
  return page.getByRole("navigation", { name: "Controles del sitio" });
}

function frontPanel(page: Page): Locator {
  return page.getByRole("button", { name: "Panel frontal: Ajustes" });
}

function menu(page: Page): Locator {
  return page.getByRole("dialog", { name: "Ajustes" });
}

async function openMenu(page: Page): Promise<Locator> {
  await frontPanel(page).click();
  await expect(menu(page)).toBeVisible();
  return menu(page);
}

async function boxOf(locator: Locator): Promise<Box> {
  const box = await locator.boundingBox();
  if (box === null) throw new Error("The element has no box");
  return box;
}

function stored(page: Page, key: string): Promise<Record<string, unknown> | null> {
  return page.evaluate((name) => {
    const local = window.localStorage.getItem(name);
    const value = local ?? window.sessionStorage.getItem(name);
    return value === null ? null : (JSON.parse(value) as Record<string, unknown>);
  }, key);
}

test.describe("fixed bar", () => {
  test("SET-AC01: the bar sits on the top right corner of the stage, with the languages and the simple view", async ({
    page,
  }) => {
    await page.goto("/es/");
    await expect(bar(page)).toBeVisible();

    const stage = await boxOf(page.getByTestId("scene-root"));
    const box = await boxOf(bar(page));
    expect(Math.round(box.y - stage.y)).toBe(16);
    expect(Math.round(stage.x + stage.width - (box.x + box.width))).toBe(16);
    expect(Math.round(box.height)).toBe(44);

    const languages = bar(page).getByRole("group", { name: "Idioma" });
    await expect(languages).toContainText("ES");
    await expect(languages).toContainText("EN");
    await expect(bar(page).getByRole("link", { name: "Vista simple" })).toHaveAttribute(
      "href",
      "/es/cv/",
    );
  });

  test("I18N-AC14: the bar names each language in its own language and marks the active one", async ({
    page,
  }) => {
    await page.goto("/es/");
    const languages = bar(page).getByRole("group", { name: "Idioma" });

    const english = languages.getByRole("link", { name: "English" });
    await expect(english).toHaveAttribute("lang", "en");
    await expect(english).toHaveAttribute("hreflang", "en");
    await expect(english).toHaveAttribute("href", "/en/");
    const spanish = languages.locator("[aria-current=true]");
    await expect(spanish).toHaveText(/Español/);
    await expect(spanish).toHaveAttribute("lang", "es");
  });

  test("the simple view link of the bar leads to the cv page", async ({ page }) => {
    await page.goto("/es/");
    await bar(page).getByRole("link", { name: "Vista simple" }).click();

    await expect(page).toHaveURL("/es/cv/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Juan Esteban Álvarez García");
  });

  test.describe("on a phone", () => {
    test.use({ viewport: VIEWPORTS.mobile });

    test("SET-AC11: a phone gets neither the fixed bar nor the settings menu", async ({ page }) => {
      await page.goto("/es/");
      await expect(page.locator("html")).toHaveAttribute("data-app", "ready");

      await expect(bar(page)).toHaveCount(0);
      await expect(page.getByTestId("settings-menu")).toHaveCount(0);
      await expect(page.locator("dialog")).toHaveCount(0);
    });
  });
});

test.describe("fixed bar in every scene viewport", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "viewports other than desktop and mobile run only in Chromium (TST-R22)",
  );

  for (const name of SCENE_VIEWPORTS) {
    test(`SET-AC02: on ${name} the bar does not cover any piece of the scene`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS[name]);
      await page.goto("/es/");
      await expect(bar(page)).toBeVisible();

      const box = await boxOf(bar(page));
      const zones = page.locator("[data-zone]");
      await expect(zones).toHaveCount(9);
      for (const zone of await zones.all()) {
        const name = (await zone.getAttribute("data-zone")) ?? "";
        expect(boxesOverlap(box, await boxOf(zone)), name).toBe(false);
      }
    });
  }

  for (const name of ["desktop-min", "desktop-hd"] as const) {
    test(`SET-AC05: on ${name} the settings menu stays inside the stage`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS[name]);
      await page.goto("/es/");
      await openMenu(page);

      const stage = await boxOf(page.getByTestId("scene-root"));
      const settings = page.getByTestId("settings-menu");
      // Its opening animation scales it: measure once it has finished.
      await expect
        .poll(() =>
          settings.evaluate((element) =>
            element.getAnimations().every((animation) => animation.playState === "finished"),
          ),
        )
        .toBe(true);
      const plate = await boxOf(settings);
      expect(plate.width).toBe(320);
      expect(boxesOverlap(plate, await boxOf(frontPanel(page)))).toBe(false);
      expect(plate.x).toBeGreaterThanOrEqual(stage.x + 8);
      expect(plate.y).toBeGreaterThanOrEqual(stage.y + 8);
      expect(plate.x + plate.width).toBeLessThanOrEqual(stage.x + stage.width - 8);
      expect(plate.y + plate.height).toBeLessThanOrEqual(stage.y + stage.height - 8);
    });
  }
});

test.describe("settings menu", () => {
  test("SET-AC04: the front panel opens a modal with the focus on the sound switch, and four ways close it", async ({
    page,
  }) => {
    await page.goto("/es/");

    await frontPanel(page).focus();
    await page.keyboard.press("Enter");
    const dialog = menu(page);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("switch", { name: "Sonido" })).toBeFocused();
    expect(await dialog.evaluate((element) => element.matches(":modal"))).toBe(true);
    await expect(frontPanel(page)).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(frontPanel(page)).toBeFocused();
    await expect(frontPanel(page)).toHaveAttribute("aria-expanded", "false");

    await openMenu(page);
    await menu(page).getByRole("button", { name: "Cerrar ajustes" }).click();
    await expect(menu(page)).toBeHidden();
    await expect(frontPanel(page)).toBeFocused();

    await openMenu(page);
    await page.mouse.click(200, 120);
    await expect(menu(page)).toBeHidden();
    await expect(frontPanel(page)).toBeFocused();

    // The menu is modal, so a second activation of the piece is a click on what lies behind it.
    await openMenu(page);
    const piece = await boxOf(frontPanel(page));
    await page.mouse.click(piece.x + piece.width / 2, piece.y + piece.height / 2);
    await expect(menu(page)).toBeHidden();
    await expect(frontPanel(page)).toBeFocused();
  });

  test("SET-AC06: the sound switch starts off, turns on and stays on after a reload", async ({
    page,
  }) => {
    await page.goto("/es/");
    const dialog = await openMenu(page);
    const sound = dialog.getByRole("switch", { name: "Sonido" });
    await expect(sound).toHaveAttribute("aria-checked", "false");
    await expect(dialog.getByText("Efectos breves al abrir y cerrar secciones.")).toBeVisible();

    await sound.click();
    await expect(sound).toHaveAttribute("aria-checked", "true");
    expect(await stored(page, PREFS_KEY)).toMatchObject({ soundEnabled: true });

    await page.reload();
    await openMenu(page);
    await expect(menu(page).getByRole("switch", { name: "Sonido" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  for (const { locale, zone, title, group, options } of [
    {
      locale: "es",
      zone: "Panel frontal: Ajustes",
      title: "Ajustes",
      group: "Imagen de la escena",
      options: ["Fotografía", "Boceto"],
    },
    {
      locale: "en",
      zone: "Front panel: Settings",
      title: "Settings",
      group: "Scene image",
      options: ["Photo", "Sketch"],
    },
  ]) {
    test(`SET-AC13: the menu offers the two scene images, with the photograph chosen at first (${locale})`, async ({
      page,
    }) => {
      await page.goto(`/${locale}/`);
      await page.getByRole("button", { name: zone }).click();
      const images = page.getByRole("dialog", { name: title }).getByRole("group", { name: group });

      await expect(images.getByRole("radio")).toHaveCount(2);
      await expect(images.getByRole("radio", { name: options[0] })).toBeChecked();
      await expect(images.getByRole("radio", { name: options[1] })).not.toBeChecked();
    });
  }

  test("SET-AC13, SCN-AC18: choosing the sketch changes image and colors at once, and it stays after a reload", async ({
    page,
  }) => {
    await page.goto("/es/");
    const processor = page.getByRole("link", { name: "Procesador (CPU): Perfil" });
    await expect(page.locator("img[data-state=shown]")).toHaveAttribute("data-variant", "photo");
    const before = await boxOf(processor);

    const dialog = await openMenu(page);
    await dialog.getByRole("radio", { name: "Boceto" }).check();

    const expectSketch = async (): Promise<void> => {
      await expect(page.locator("html")).toHaveAttribute("data-scene", "sketch");
      const image = page.locator("img[data-state=shown]");
      await expect(image).toHaveAttribute("data-variant", "sketch");
      expect(await image.evaluate((element: HTMLImageElement) => element.currentSrc)).toContain(
        "b71cba0939ff",
      );
      expect(
        await page
          .locator('[data-aura="cpu"] [data-part="glow"] polygon')
          .evaluate((element) => getComputedStyle(element).fill),
      ).toBe(AURA_SKETCH);
    };
    await expectSketch();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("radio", { name: "Boceto" })).toBeChecked();
    expect(await stored(page, PREFS_KEY)).toMatchObject({ sceneVariant: "sketch" });

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    expect(await boxOf(processor)).toEqual(before);
    await expect(processor).toHaveAccessibleName("Procesador (CPU): Perfil");

    await page.reload();
    await expectSketch();
    expect(await boxOf(processor)).toEqual(before);
    await openMenu(page);
    await expect(menu(page).getByRole("radio", { name: "Boceto" })).toBeChecked();
  });

  test("I18N-AC14: the menu names each language in its own language and marks the active one", async ({
    page,
  }) => {
    await page.goto("/es/");
    const languages = (await openMenu(page)).getByRole("group", { name: "Idioma" });

    await expect(languages.getByRole("link", { name: "English" })).toHaveAttribute("lang", "en");
    await expect(languages.locator("[aria-current=true]")).toHaveText(/Español/);
  });

  test("SET-AC03: choosing a language in the menu changes the page and leaves the focus on a language switcher", async ({
    page,
  }) => {
    await page.goto("/es/");
    const dialog = await openMenu(page);
    await dialog.getByRole("link", { name: "English" }).click();

    await expect(page).toHaveURL("/en/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("dialog")).toBeHidden();
    const current = page
      .getByRole("navigation", { name: "Site controls" })
      .locator("[aria-current=true]");
    await expect(current).toHaveText(/English/);
    await expect(current).toBeFocused();
    expect(await stored(page, PREFS_KEY)).toMatchObject({ locale: "en" });
  });
});

test.describe("session reset", () => {
  /** Opens a section from its piece and closes it again. */
  async function visit(page: Page, zone: string): Promise<void> {
    await page.getByRole("link", { name: zone }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/(?:es|en)\/$/);
  }

  test("SET-AC09: the menu shows the progress, and resetting replays the boot and clears it", async ({
    page,
  }) => {
    await page.goto("/es/");
    await visit(page, "Procesador (CPU): Perfil");
    await visit(page, "SSD NVMe: Proyectos");
    await expect(page.getByTestId("scene-hint")).toBeHidden();

    const dialog = await openMenu(page);
    await expect(dialog.getByText("2 de 6 secciones visitadas")).toBeVisible();
    await dialog.getByRole("button", { name: "Reiniciar sesión" }).click();

    await expect(menu(page)).toBeHidden();
    await expect(page).toHaveURL("/es/");
    await expect(page.getByTestId("boot-screen")).toBeVisible();
    await expect(page.getByTestId("boot-screen")).toBeHidden();
    await expect(page.getByTestId("post-display")).toHaveAttribute("data-value", "00");
    await expect(page.getByTestId("scene-hint")).toBeVisible();
    expect(await stored(page, SESSION_KEY)).toEqual({ bootSeen: true, visited: [] });
  });

  test("SET-AC10: resetting keeps the language, the sound and the scene image", async ({
    page,
  }) => {
    await page.goto("/en/");
    await page.getByRole("button", { name: "Front panel: Settings" }).click();
    const dialog = page.getByRole("dialog", { name: "Settings" });
    await dialog.getByRole("switch", { name: "Sound" }).click();
    await dialog.getByRole("radio", { name: "Sketch" }).check();
    await expect(page.locator("html")).toHaveAttribute("data-scene", "sketch");

    await dialog.getByRole("button", { name: "Reset session" }).click();
    await expect(page.getByTestId("boot-screen")).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("boot-screen")).toBeHidden();

    await expect(page).toHaveURL("/en/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("data-scene", "sketch");
    expect(await stored(page, PREFS_KEY)).toMatchObject({
      soundEnabled: true,
      sceneVariant: "sketch",
    });
  });
});
