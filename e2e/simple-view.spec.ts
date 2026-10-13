import { expect, test } from "./support/base";
import { hasHorizontalScroll, recordSceneImageRequests } from "./support/measure";
import { VIEWPORTS } from "./support/viewports";

const SECTION_TITLES = [
  "Perfil",
  "Experiencia",
  "Proyectos",
  "Stack tecnológico",
  "Contacto",
  "Ecosistema personal",
  "Acerca de este sitio",
];

test.describe("simple view on a phone", () => {
  test.use({ viewport: VIEWPORTS.mobile });

  test("SMP-AC02: the home shows the profile as a plain page", async ({ page }) => {
    await page.goto("/es/");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Juan Esteban Álvarez García");
    await expect(
      page.getByText(
        "La versión interactiva de este portfolio está disponible en pantallas de escritorio.",
      ),
    ).toBeVisible();
    const navigation = page.getByRole("navigation", { name: "Secciones" });
    await expect(navigation.getByRole("link")).toHaveText(SECTION_TITLES);
    await expect(page.getByRole("link", { name: "Descargar CV (PDF)" }).first()).toHaveAttribute(
      "href",
      "/cv/juan-esteban-alvarez-garcia-cv-es.pdf",
    );
    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test("VSN-AC04: a phone gets the simple view and never requests the scene image", async ({
    page,
  }) => {
    const sceneRequests = recordSceneImageRequests(page);
    await page.goto("/es/");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 2 })).toHaveText(SECTION_TITLES);
    expect(await hasHorizontalScroll(page)).toBe(false);
    expect(sceneRequests).toEqual([]);
  });

  test("SMP-AC04: a navigation link scrolls to its section without leaving the page", async ({
    page,
  }) => {
    await page.goto("/es/");
    await page
      .getByRole("navigation", { name: "Secciones" })
      .getByRole("link", { name: "Proyectos" })
      .click();

    await expect(page).toHaveURL("/es/#projects");
    await expect(page.getByRole("region", { name: "Proyectos" })).toBeInViewport();
    await expect(page.getByRole("heading", { level: 1 })).not.toBeInViewport();
  });

  test("SMP-AC05: a section URL opens the simple view at that section, with focus on its title", async ({
    page,
  }) => {
    await page.goto("/es/projects/");

    const title = page.getByRole("heading", { level: 2, name: "Proyectos" });
    await expect(title).toBeFocused();
    await expect(title).toBeInViewport();
    await expect
      .poll(async () => (await page.getByRole("region", { name: "Proyectos" }).boundingBox())?.y)
      .toBeLessThan(40);
  });

  test("SMP-AC05: a section URL with a fragment leaves that project in view", async ({ page }) => {
    await page.goto("/es/projects/#projects-habicapital");

    await expect(page.getByRole("heading", { level: 4, name: "HabiCapital" })).toBeInViewport();
  });
});

test.describe("simple view on a desktop", () => {
  test("SMP-AC03: the cv page always shows the simple view, with a way to the scene", async ({
    page,
  }) => {
    await page.goto("/es/cv/");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Juan Esteban Álvarez García");
    await expect(page.getByRole("link", { name: "Ver la versión interactiva" })).toHaveAttribute(
      "href",
      "/es/",
    );
    await expect(
      page.getByText(
        "La versión interactiva de este portfolio está disponible en pantallas de escritorio.",
      ),
    ).toBeHidden();
    await expect(page.locator("html")).not.toHaveAttribute("data-mode", "scene");
    await expect(page.locator("[data-layer=scene]")).toHaveCount(0);
  });

  test("SMP-AC08: printing hides the controls and uses black on white", async ({ page }) => {
    await page.goto("/es/cv/");
    await page.emulateMedia({ media: "print" });

    await expect(page.getByRole("navigation", { name: "Secciones" })).toBeHidden();
    await expect(page.getByRole("group", { name: "Idioma" })).toBeHidden();
    await expect(page.getByRole("link", { name: "Descargar CV (PDF)" }).first()).toBeHidden();
    await expect(page.getByRole("link", { name: "Ver la versión interactiva" })).toBeHidden();
    await expect(page.getByRole("heading", { level: 2, name: "Perfil" })).toBeVisible();
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(
      "rgb(255, 255, 255)",
    );
  });

  test("VSN-AC10: the exported folder works when served as plain static files", async ({
    page,
    request,
  }) => {
    const response = await page.goto("/en/");
    expect(response?.status()).toBe(200);
    expect(response?.headers()["content-type"]).toContain("text/html");
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(7);

    const stylesheet = await page.locator("link[rel=stylesheet]").first().getAttribute("href");
    const asset = await request.get(stylesheet ?? "/missing");
    expect(asset.status()).toBe(200);
    expect(asset.headers()["cache-control"]).toBe("public, max-age=31536000, immutable");
  });
});

test.describe("simple view in narrow viewports", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "Viewports other than desktop and mobile run only in Chromium (TST-R22)",
  );

  for (const locale of ["es", "en"]) {
    test(`SMP-AC07, QLT-AC07: no horizontal scroll at 320 px (${locale})`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      await page.goto(`/${locale}/cv/`);
      await expect(page.getByRole("heading", { level: 2 })).toHaveCount(7);
      expect(await hasHorizontalScroll(page)).toBe(false);
    });
  }

  test("QLT-AC07: at 200 % zoom on a 1280×720 screen the page is the simple view, without horizontal scroll", async ({
    page,
  }) => {
    // Zooming to 200 % halves the viewport that the page sees.
    await page.setViewportSize({ width: 640, height: 360 });
    await page.goto("/es/");

    await expect(page.locator("html")).not.toHaveAttribute("data-mode", "scene");
    await expect(page.getByRole("main")).toBeVisible();
    expect(await hasHorizontalScroll(page)).toBe(false);
  });
});
