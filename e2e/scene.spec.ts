import type { Locator, Page } from "@playwright/test";

import { expect, ORIGIN, test } from "./support/base";
import {
  type Box,
  boxesOverlap,
  hasHorizontalScroll,
  recordSceneImageRequests,
  recordScriptRequests,
} from "./support/measure";
import { type ViewportName, VIEWPORTS } from "./support/viewports";

const PREFS_KEY = "portfolio:v1:prefs";
const AURA = "rgb(255, 197, 61)";
const VOID = "rgb(10, 9, 7)";
const SCENE_TITLE = "Juan Esteban Álvarez García: portfolio interactivo";

const ZONES = [
  { id: "cpu", name: "Procesador (CPU): Perfil", href: "/es/profile/" },
  { id: "psu", name: "Fuente de poder (PSU): Experiencia", href: "/es/experience/" },
  { id: "ssd", name: "SSD NVMe: Proyectos", href: "/es/projects/" },
  { id: "ram", name: "Memoria RAM: Stack tecnológico", href: "/es/stack/" },
  { id: "io", name: "Panel I/O: Contacto", href: "/es/contact/" },
  { id: "fan", name: "Ventilador ARGB: Ecosistema personal", href: "/es/ecosystem/" },
  { id: "cmos", name: "Pila CMOS: Acerca de este sitio", href: "/es/about/" },
] as const;

const SCENE_VIEWPORTS: readonly ViewportName[] = [
  "desktop",
  "desktop-min",
  "desktop-hd",
  "ultrawide",
  "classic",
];

function html(page: Page): Locator {
  return page.locator("html");
}

function stage(page: Page): Locator {
  return page.getByTestId("scene-root");
}

function label(page: Page, name: string): Locator {
  return page.getByTestId("scene-label").filter({ hasText: name });
}

async function boxOf(locator: Locator): Promise<Box> {
  const box = await locator.boundingBox();
  if (box === null) throw new Error("The element has no box");
  return box;
}

/** Presses Tab until the element has the focus, as a keyboard user would reach it. */
async function tabTo(page: Page, target: Locator): Promise<void> {
  for (let presses = 0; presses < 20; presses += 1) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  throw new Error("The element was not reached with the Tab key");
}

/** Opacity of a part of the aura of a zone, as the browser computes it. */
function auraOpacity(page: Page, id: string, part: string): Promise<string> {
  return page
    .locator(`[data-aura="${id}"] [data-part="${part}"]`)
    .evaluate((element) => getComputedStyle(element).opacity);
}

test.describe("scene on a desktop", () => {
  test("SYS-AC05, SYS-AC19: at 1280×720 px the page is the scene and the application has started", async ({
    page,
  }) => {
    await page.goto("/es/");

    await expect(html(page)).toHaveAttribute("data-mode", "scene");
    await expect(html(page)).toHaveAttribute("data-app", "ready");
    await expect(stage(page)).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(SCENE_TITLE);
    await expect(page.getByRole("navigation", { name: "Secciones" })).toBeHidden();
    await expect(page.getByRole("main")).toHaveCount(1);
  });

  test("the page never passes through the simple mode while the scene loads", async ({ page }) => {
    // Every value that data-mode had and lost, from the first moment of the document.
    await page.addInitScript(() => {
      const seen: (string | null)[] = [];
      Object.assign(window, { modesSeen: seen });
      // The document, not <html>: when this runs the root element may not exist yet.
      new MutationObserver((mutations) => {
        seen.push(...mutations.map((mutation) => mutation.oldValue));
      }).observe(document, {
        subtree: true,
        attributes: true,
        attributeFilter: ["data-mode"],
        attributeOldValue: true,
      });
    });
    await page.goto("/es/");
    await expect(stage(page)).toBeVisible();
    await expect(page.locator("img[data-state=shown]")).toBeVisible();

    expect(
      await page.evaluate(() => (window as unknown as { modesSeen: unknown }).modesSeen),
    ).not.toContain("simple");
    await expect(html(page)).toHaveAttribute("data-mode", "scene");
  });

  test("SYS-AC07: crossing the threshold switches between scene and simple view without reloading", async ({
    page,
  }) => {
    await page.goto("/es/");
    await expect(stage(page)).toBeVisible();
    await page.evaluate(() => {
      document.body.dataset["loadedOnce"] = "yes";
    });

    await page.setViewportSize({ width: 800, height: 720 });
    await expect(html(page)).toHaveAttribute("data-mode", "simple");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Juan Esteban Álvarez García");
    await expect(stage(page)).toHaveCount(0);

    await page.setViewportSize(VIEWPORTS.desktop);
    await expect(html(page)).toHaveAttribute("data-mode", "scene");
    await expect(stage(page)).toBeVisible();
    await expect(page.locator("body")).toHaveAttribute("data-loaded-once", "yes");
  });

  test("SYS-AC08: opening a section and coming back keeps the scene and requests no image again", async ({
    page,
  }) => {
    const sceneRequests = recordSceneImageRequests(page);
    await page.goto("/es/");
    await expect(page.locator("img[data-state=shown]")).toBeVisible();
    await stage(page).evaluate((element) => {
      element.setAttribute("data-kept", "yes");
    });

    await page.getByRole("link", { name: "SSD NVMe: Proyectos" }).click();
    await expect(page).toHaveURL("/es/projects/");
    await expect(page.getByRole("dialog", { name: "Proyectos" })).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL("/es/");
    await expect(page.getByRole("dialog")).toBeHidden();

    await expect(stage(page)).toHaveAttribute("data-kept", "yes");
    expect(sceneRequests).toHaveLength(1);
  });

  test("SYS-AC11, QLT-AC21: a tour of the site only requests its own origin, without errors or warnings", async ({
    page,
  }) => {
    // A whole tour of the site: in WebKit under load it takes over 20 seconds.
    test.slow();
    const origins = new Set<string>();
    page.on("request", (request) => {
      if (/^https?:/.test(request.url())) origins.add(new URL(request.url()).origin);
    });

    await page.goto("/es/");
    for (const { name, href } of ZONES) {
      await page.getByRole("link", { name }).click();
      await expect(page).toHaveURL(href);
      await page.keyboard.press("Escape");
      await expect(page).toHaveURL("/es/");
    }
    await page.goto("/es/cv/");
    await page.getByRole("link", { name: "Ver la versión interactiva" }).click();
    await expect(page).toHaveURL("/es/");
    await expect(stage(page)).toBeVisible();
    await page.goto("/en/");
    await expect(page.getByRole("link", { name: "Processor (CPU): Profile" })).toBeVisible();

    expect([...origins]).toEqual(["http://localhost:4173"]);
  });

  test("SCN-AC05: the scene has seven links and a button, named and ordered as the canonical list", async ({
    page,
  }) => {
    await page.goto("/es/");
    const main = page.getByRole("main");

    await expect(main.getByRole("link")).toHaveText(ZONES.map((zone) => zone.name));
    for (const { name, href } of ZONES) {
      await expect(main.getByRole("link", { name })).toHaveAttribute("href", href);
    }
    const settings = main.getByRole("button", { name: "Panel frontal: Ajustes" });
    await expect(settings).toHaveAttribute("aria-expanded", "false");
    await expect(main.getByRole("button")).toHaveCount(1);
  });

  test("SCN-AC06: clicking the center of a piece opens its section, and clicking elsewhere does nothing", async ({
    page,
  }) => {
    await page.goto("/es/");
    await expect(stage(page)).toBeVisible();

    for (const { name, href } of ZONES) {
      const box = await boxOf(page.getByRole("link", { name }));
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await expect(page).toHaveURL(href);
      await page.goBack();
      await expect(page).toHaveURL("/es/");
      await expect(page.getByRole("dialog")).toBeHidden();
    }

    // A point of the workbench, between the power supply and the board.
    const frame = await boxOf(stage(page));
    await page.mouse.click(frame.x + frame.width * 0.2, frame.y + frame.height * 0.15);
    await page.mouse.click(frame.x + frame.width * 0.72, frame.y + frame.height * 0.9);
    await expect(page).toHaveURL("/es/");
  });

  for (const { locale, zone, name, title } of [
    { locale: "es", zone: "Procesador (CPU): Perfil", name: "Procesador (CPU)", title: "Perfil" },
    { locale: "en", zone: "Processor (CPU): Profile", name: "Processor (CPU)", title: "Profile" },
  ]) {
    test(`SCN-AC07: keyboard focus on the processor shows its label, its lit aura and the focus rectangle (${locale})`, async ({
      page,
    }) => {
      await page.goto(`/${locale}/`);
      await expect(stage(page)).toBeVisible();
      await tabTo(page, page.getByRole("link", { name: zone }));

      await expect(label(page, name)).toBeVisible();
      await expect(label(page, name)).toContainText(title);
      await expect.poll(() => auraOpacity(page, "cpu", "glow")).toBe("1");
      await expect.poll(() => auraOpacity(page, "cpu", "fill")).toBe("0.14");
      await expect(page.locator('[data-aura="cpu"] [data-part="focus-ring"]')).toHaveCount(1);
    });
  }

  test("SCN-AC08, QLT-AC06: a label follows the pointer, stays under it and is dismissed with Esc", async ({
    page,
  }) => {
    await page.goto("/es/");
    const fan = page.getByRole("link", { name: "Ventilador ARGB: Ecosistema personal" });
    const plate = label(page, "Ventilador ARGB");
    await expect(plate).toBeHidden();

    await fan.hover();
    await expect(plate).toBeVisible();

    await plate.hover();
    await expect(plate).toBeVisible();
    await expect(plate).toHaveAttribute("data-visible", "true");

    await page.keyboard.press("Escape");
    await expect(plate).toBeHidden();

    await fan.hover();
    await expect(plate).toBeVisible();
    const frame = await boxOf(stage(page));
    await page.mouse.move(frame.x + frame.width * 0.2, frame.y + frame.height * 0.15);
    await expect(plate).toBeHidden();
  });

  test("SCN-AC20: the arrow keys move the focus to the nearest piece in their direction", async ({
    page,
  }) => {
    await page.goto("/es/");
    const cpu = page.locator('[data-zone="cpu"]');
    await tabTo(page, cpu);
    await expect(label(page, "Procesador (CPU)")).toBeVisible();

    const moves: readonly (readonly [string, string, string])[] = [
      ["ArrowRight", "ram", "Memoria RAM"],
      ["ArrowLeft", "cpu", "Procesador (CPU)"],
      ["ArrowDown", "ssd", "SSD NVMe"],
    ];
    for (const [key, id, name] of moves) {
      await page.keyboard.press(key);
      await expect(page.locator(`[data-zone="${id}"]`), key).toBeFocused();
      await expect(label(page, name), key).toBeVisible();
    }
    await page.locator('[data-zone="fan"]').focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.locator('[data-zone="settings"]')).toBeFocused();
    expect(await page.evaluate(() => [window.scrollX, window.scrollY])).toEqual([0, 0]);
  });

  test("VIS-AC04: every focusable element of the scene shows a focus indicator in the aura color", async ({
    page,
  }) => {
    await page.goto("/es/");
    await expect(stage(page)).toBeVisible();

    // First the skip link and the controls of the fixed bar, which sit on dark plates.
    for (const name of ["Saltar al contenido", "English", "Vista simple"]) {
      await page.keyboard.press("Tab");
      const control = page.getByRole("link", { name });
      await expect(control).toBeFocused();
      const outline = await control.evaluate((element) => {
        const style = getComputedStyle(element);
        return { width: Number.parseFloat(style.outlineWidth), color: style.outlineColor };
      });
      expect(outline.width, name).toBeGreaterThanOrEqual(2);
      expect(outline.color, name).toBe(AURA);
    }

    for (const id of [...ZONES.map((zone) => zone.id), "settings"]) {
      await page.keyboard.press("Tab");
      await expect(page.locator(`[data-zone="${id}"]`)).toBeFocused();
      const ring = page.locator(`[data-aura="${id}"] [data-part="focus-ring"]`);
      await expect(ring).toBeVisible();
      const stroke = await ring.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          width: Number.parseFloat(style.strokeWidth),
          color: style.stroke,
          scaling: style.vectorEffect,
        };
      });
      expect(stroke, id).toEqual({ width: 2, color: AURA, scaling: "non-scaling-stroke" });
    }
  });

  test("VIS-AC13: the breath of the aura ends within 5 seconds and leaves the glow at its maximum", async ({
    page,
  }) => {
    await page.goto("/es/");
    const glow = page.locator('[data-aura="psu"] [data-part="glow"]');
    await expect(glow).toHaveCount(1);

    // The animation starts when the scene appears; its own timeline says when it will end.
    const duration = await glow.evaluate((element) =>
      Number(element.getAnimations()[0]?.effect?.getComputedTiming().endTime),
    );
    expect(duration).toBe(4800);
    expect(duration).toBeLessThan(5000);

    await expect
      .poll(() => glow.evaluate((element) => element.getAnimations().length), { timeout: 6000 })
      .toBe(0);
    expect(await auraOpacity(page, "psu", "glow")).toBe("0.5");
    expect(await auraOpacity(page, "cmos", "glow")).toBe("0.42");
    expect(await auraOpacity(page, "psu", "fill")).toBe("0.08");
  });
});

test.describe("scene without browser storage", () => {
  test("SYS-AC10: the scene loads and the panels open when storage throws on every access", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      for (const area of ["localStorage", "sessionStorage"]) {
        Object.defineProperty(window, area, {
          get: () => {
            throw new DOMException("Storage is disabled", "SecurityError");
          },
        });
      }
    });
    await page.goto("/es/");

    await expect(html(page)).toHaveAttribute("data-mode", "scene");
    await expect(html(page)).toHaveAttribute("data-scene", "photo");
    await expect(page.locator("img[data-state=shown]")).toBeVisible();

    await page.getByRole("link", { name: "Memoria RAM: Stack tecnológico" }).click();
    await expect(page).toHaveURL("/es/stack/");
    const panel = page.getByRole("dialog", { name: "Stack tecnológico" });
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("heading", { name: "Lenguajes" })).toBeVisible();

    await panel.getByRole("link", { name: "Sección siguiente: Contacto" }).click();
    await expect(page.getByRole("dialog", { name: "Contacto" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL("/es/");
    await expect(page.getByTestId("post-display")).toHaveAttribute("data-value", "02");
  });
});

test.describe("scene on a phone", () => {
  test.use({ viewport: VIEWPORTS.mobile });

  test("SYS-AC05: at 390×844 px the page is the simple view", async ({ page }) => {
    await page.goto("/es/");

    await expect(html(page)).toHaveAttribute("data-mode", "simple");
    await expect(html(page)).toHaveAttribute("data-app", "ready");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Juan Esteban Álvarez García");
    await expect(stage(page)).toHaveCount(0);
  });
});

test.describe("scripts of the scene", () => {
  test("QLT-AC16: a phone downloads none of the JavaScript that only the scene needs", async ({
    page,
    browser,
  }) => {
    const onDesktop = recordScriptRequests(page);
    await page.goto("/es/");
    await expect(stage(page)).toBeVisible();
    await page.waitForLoadState("networkidle");

    // A second browser, so that the phone does not find the files of the desktop in its cache.
    const context = await browser.newContext({ viewport: VIEWPORTS.mobile });
    const phone = await context.newPage();
    // Same precaution that the base test takes with its own page (TST-R26).
    await phone.goto("about:blank");
    const onPhone = recordScriptRequests(phone);
    await phone.goto(`${ORIGIN}/es/`);
    await expect(html(phone)).toHaveAttribute("data-app", "ready");
    await phone.waitForLoadState("networkidle");
    await context.close();

    expect(onPhone.size).toBeGreaterThan(0);
    expect([...onPhone].filter((script) => !onDesktop.has(script))).toEqual([]);
    expect(onDesktop.size).toBeGreaterThan(onPhone.size);
  });
});

test.describe("when JavaScript files cannot be downloaded", () => {
  // The browser logs every blocked file, and warns that the preloaded image was never used.
  test.use({ allowedIssues: ["failed-request", "console"] });

  test.beforeEach(async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
  });

  test("QLT-AC14: at 1280×720 px the page falls back to the simple view after 5 seconds", async ({
    page,
  }) => {
    await page.goto("/es/");
    await expect(html(page)).toHaveAttribute("data-mode", "scene");
    await expect(page.getByRole("heading", { level: 1 })).toBeHidden();

    // The timer is of 5 s, which a unit test checks; a busy machine can fire it somewhat later.
    await expect(html(page)).toHaveAttribute("data-mode", "simple", { timeout: 10_000 });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Juan Esteban Álvarez García");
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(7);
  });

  test.describe("on a phone", () => {
    test.use({ viewport: VIEWPORTS.mobile });

    test("QLT-AC14: at 390×844 px the whole simple view is shown", async ({ page }) => {
      await page.goto("/es/");

      await expect(html(page)).toHaveAttribute("data-mode", "simple");
      await expect(page.getByRole("heading", { level: 2 })).toHaveCount(7);
      await expect(page.getByText("Disponible desde enero de 2027")).toBeVisible();
    });
  });
});

test.describe("scene in every viewport", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "viewports other than desktop and mobile run only in Chromium (TST-R22)",
  );

  for (const [name, viewport] of Object.entries(VIEWPORTS)) {
    const expected = SCENE_VIEWPORTS.some((candidate) => candidate === name) ? "scene" : "simple";

    test(`QLT-AC26: ${name} is in ${expected} mode and does not scroll sideways`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto("/es/");

      await expect(html(page)).toHaveAttribute("data-mode", expected);
      await expect(html(page)).toHaveAttribute("data-app", "ready");
      expect(await hasHorizontalScroll(page)).toBe(false);
    });
  }

  for (const name of SCENE_VIEWPORTS) {
    const viewport = VIEWPORTS[name];

    test(`SCN-AC13, AST-AC12: on ${name} the stage is 16:9, centered and whole, on the backdrop of the variant`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto("/es/");
      const image = page.locator("img[data-state=shown]");
      await expect(image).toBeVisible();

      const frame = await boxOf(stage(page));
      expect(Math.abs(frame.width - (frame.height * 16) / 9)).toBeLessThan(1);
      expect(Math.abs(frame.x - (viewport.width - frame.width) / 2)).toBeLessThan(1);
      expect(Math.abs(frame.y - (viewport.height - frame.height) / 2)).toBeLessThan(1);
      expect(frame.width).toBeLessThanOrEqual(viewport.width);
      expect(frame.height).toBeLessThanOrEqual(viewport.height);
      expect(
        Math.max(viewport.width - frame.width, viewport.height - frame.height),
      ).toBeGreaterThan(name === "desktop" || name === "desktop-hd" ? -1 : 0);
      expect(await boxOf(image)).toEqual(frame);

      const backdrop = await page
        .getByTestId("scene-poster")
        .evaluate((element) => getComputedStyle(element).backgroundColor);
      expect(backdrop).toBe(VOID);
    });
  }

  test("SYS-AC05: at 1280×500 px the page is the simple view", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.short);
    await page.goto("/es/");
    await expect(html(page)).toHaveAttribute("data-mode", "simple");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Juan Esteban Álvarez García");
  });
});

test.describe("scene image", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "measured only in Chromium (SCN-AC12)",
  );

  test("SCN-AC12, SYS-AC20: a first visit shows the photograph and requests one AVIF file of it", async ({
    page,
  }) => {
    const sceneRequests = recordSceneImageRequests(page);
    await page.goto("/es/");

    await expect(html(page)).toHaveAttribute("data-scene", "photo");
    await expect(page.locator("img[data-state=shown]")).toBeVisible();
    await page.waitForLoadState("networkidle");
    expect(sceneRequests).toEqual(["/scene/scene-1920.dc169b385cc7.avif"]);
  });

  test("SYS-AC20: with the sketch stored, only files of the sketch are requested", async ({
    page,
  }) => {
    await page.addInitScript((key) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({ soundEnabled: false, sceneVariant: "sketch" }),
      );
    }, PREFS_KEY);
    const sceneRequests = recordSceneImageRequests(page);
    await page.goto("/es/");

    await expect(html(page)).toHaveAttribute("data-scene", "sketch");
    const image = page.locator("img[data-state=shown]");
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute("data-variant", "sketch");
    await page.waitForLoadState("networkidle");
    expect(sceneRequests).toEqual(["/scene/scene-1920.b71cba0939ff.avif"]);
  });
});

test.describe("scene on a device without hover", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "only Chromium can emulate a device without hover",
  );
  test.use({ viewport: VIEWPORTS.classic, hasTouch: true, isMobile: true });

  for (const locale of ["es", "en"]) {
    test(`SCN-AC09: the eight labels are always visible, inside the stage and apart from each other (${locale})`, async ({
      page,
    }) => {
      await page.goto(`/${locale}/`);
      await expect(html(page)).toHaveAttribute("data-mode", "scene");
      const labels = page.getByTestId("scene-label").filter({ visible: true });
      await expect(labels).toHaveCount(8);

      const frame = await boxOf(stage(page));
      const boxes = await Promise.all((await labels.all()).map((plate) => boxOf(plate)));
      for (const box of boxes) {
        expect(box.x).toBeGreaterThanOrEqual(frame.x + 8);
        expect(box.y).toBeGreaterThanOrEqual(frame.y + 8);
        expect(box.x + box.width).toBeLessThanOrEqual(frame.x + frame.width - 8);
        expect(box.y + box.height).toBeLessThanOrEqual(frame.y + frame.height - 8);
        expect(box.width).toBeLessThanOrEqual(128);
      }
      boxes.forEach((first, index) => {
        for (const second of boxes.slice(index + 1)) {
          expect(boxesOverlap(first, second), JSON.stringify([first, second])).toBe(false);
        }
      });
    });
  }
});
