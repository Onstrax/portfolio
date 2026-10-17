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
  return page.getByRole("button", { name: "Panel de control: Ajustes" });
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
  test("SET-AC01: the bar sits on the top right corner of the stage, with the languages, the simple view and the contacts", async ({
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
    const views = bar(page).getByRole("group", { name: "Vista" });
    await expect(views.locator("[aria-current=true]")).toHaveText("Interactiva");
    await expect(views.getByRole("link", { name: "Simple", exact: true })).toHaveAttribute(
      "href",
      "/es/cv/",
    );
    // After the other language, in this order.
    const names = await bar(page)
      .getByRole("link")
      .evaluateAll((links) =>
        links.slice(1).map((link) => link.getAttribute("aria-label") ?? link.textContent.trim()),
      );
    expect(names).toEqual([
      "Simple",
      "Descargar CV (PDF)",
      "Escribir un correo",
      "LinkedIn (se abre en una pestaña nueva)",
      "GitHub (se abre en una pestaña nueva)",
    ]);
  });

  test("SET-AC14: the bar links the résumé, the mail, LinkedIn and GitHub, at least 44×44 px each", async ({
    page,
  }) => {
    await page.goto("/es/");
    const contacts = bar(page).getByRole("list").getByRole("link");
    await expect(contacts).toHaveCount(4);

    const cv = bar(page).getByRole("link", { name: "Descargar CV (PDF)" });
    await expect(cv).toHaveAttribute("href", "/cv/juan-esteban-alvarez-garcia-cv-es.pdf");
    await expect(cv).toHaveAttribute("download", "");
    await expect(cv).toHaveText("CV");
    await expect(bar(page).getByRole("link", { name: "Escribir un correo" })).toHaveAttribute(
      "href",
      "mailto:juanalvarezgcl@gmail.com",
    );
    for (const [name, href] of [
      ["LinkedIn", "https://www.linkedin.com/in/juan-esteban-alvarez-garcia-21bb70364/"],
      ["GitHub", "https://github.com/Onstrax"],
    ] as const) {
      const link = bar(page).getByRole("link", { name: `${name} (se abre en una pestaña nueva)` });
      await expect(link).toHaveAttribute("href", href);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    for (const contact of await contacts.all()) {
      const box = await boxOf(contact);
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("SET-AC14: with a panel open the contacts stay at hand, in the bar drawn inside it", async ({
    page,
  }) => {
    await page.goto("/es/projects/");
    const panel = page.getByRole("dialog", { name: "Proyectos" });
    await expect(panel).toBeVisible();

    const panelBar = panel.getByRole("navigation", { name: "Controles del sitio" });
    await expect(panelBar.getByRole("list").getByRole("link")).toHaveCount(4);
    const email = panelBar.getByRole("link", { name: "Escribir un correo" });
    await expect(email).toBeVisible();
    await expect(email).toHaveAttribute("href", "mailto:juanalvarezgcl@gmail.com");
  });

  test("VSN-AC11: from the scene at rest, each contact is one activation away, with no panel open", async ({
    page,
  }) => {
    await page.goto("/es/");
    await expect(bar(page)).toBeVisible();

    // The résumé downloads at once.
    const download = page.waitForEvent("download");
    await bar(page).getByRole("link", { name: "Descargar CV (PDF)" }).click();
    expect((await download).suggestedFilename()).toBe("juan-esteban-alvarez-garcia-cv-es.pdf");
    await expect(page.getByRole("dialog")).toHaveCount(0);

    // LinkedIn and GitHub open in a new tab; the requests to other origins are stopped there.
    const context = page.context();
    await context.route(/^https:\/\/(www\.linkedin\.com|github\.com)\//, (route) =>
      route.fulfill({ status: 200, contentType: "text/plain", body: "" }),
    );
    for (const [name, url] of [
      ["LinkedIn", "https://www.linkedin.com/in/juan-esteban-alvarez-garcia-21bb70364/"],
      ["GitHub", "https://github.com/Onstrax"],
    ] as const) {
      const opened = context.waitForEvent("page");
      await bar(page)
        .getByRole("link", { name: `${name} (se abre en una pestaña nueva)` })
        .click();
      const tab = await opened;
      await expect(tab).toHaveURL(url);
      await tab.close();
    }
    await expect(page).toHaveURL("/es/");

    // The mail link hands the address to the mail program in one activation.
    await expect(bar(page).getByRole("link", { name: "Escribir un correo" })).toHaveAttribute(
      "href",
      "mailto:juanalvarezgcl@gmail.com",
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

  test("the simple view option of the bar leads to the cv page", async ({ page }) => {
    await page.goto("/es/");
    await bar(page).getByRole("link", { name: "Simple", exact: true }).click();

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

  for (const name of SCENE_VIEWPORTS) {
    test(`SET-AC16: on ${name} the bar inside an open panel leaves the header of the panel clear`, async ({
      page,
    }) => {
      await page.setViewportSize(VIEWPORTS[name]);
      await page.goto("/es/experience/");
      const panel = page.getByRole("dialog", { name: "Experiencia" });
      await expect(panel).toHaveAttribute("data-phase", "open");

      const bar = await boxOf(panel.getByRole("navigation", { name: "Controles del sitio" }));
      const header = await boxOf(panel.getByRole("heading", { level: 2 }).locator(".."));
      expect(boxesOverlap(bar, header)).toBe(false);
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
  test("SET-AC04: the control panel opens a modal with the focus on the sound switch, and four ways close it", async ({
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
      zone: "Panel de control: Ajustes",
      title: "Ajustes",
      group: "Imagen de la escena",
      options: ["Fotografía", "Boceto"],
    },
    {
      locale: "en",
      zone: "Control panel: Settings",
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
      .getByRole("group", { name: "Language" })
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

  test("SET-AC09, SCN-AC23: the menu shows the progress, and resetting replays the boot and the welcome", async ({
    page,
  }) => {
    await page.goto("/es/");
    await visit(page, "Procesador (CPU): Perfil");
    await visit(page, "SSD NVMe: Proyectos");
    await expect(page.getByTestId("scene-welcome")).toHaveCount(0);

    const dialog = await openMenu(page);
    await expect(dialog.getByText("2 de 6 secciones visitadas")).toBeVisible();
    await dialog.getByRole("button", { name: "Reiniciar sesión" }).click();

    await expect(menu(page)).toBeHidden();
    await expect(page).toHaveURL("/es/");
    await expect(page.getByTestId("boot-screen")).toBeVisible();
    await expect(page.getByTestId("boot-screen")).toBeHidden();
    await expect(page.getByTestId("post-display")).toHaveAttribute("data-value", "00");
    await expect(page.getByTestId("scene-welcome")).toBeVisible();
    expect(await stored(page, SESSION_KEY)).toEqual({
      bootSeen: true,
      visited: [],
      welcomeSeen: false,
    });
  });

  test("SET-AC10: resetting keeps the language, the sound and the scene image", async ({
    page,
  }) => {
    await page.goto("/en/");
    await page.getByRole("button", { name: "Control panel: Settings" }).click();
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
