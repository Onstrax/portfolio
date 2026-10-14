import { expect, test } from "./support/base";
import { VIEWPORTS } from "./support/viewports";

const THESIS_ES = "Tesis: autenticación poscuántica de conocimiento cero";
const THESIS_EN = "Thesis: post-quantum zero-knowledge authentication";

test.describe("case studies on a desktop", () => {
  test("SMP-AC22: the projects panel leads to a case, which changes language and leads back to the panel", async ({
    page,
  }) => {
    await page.goto("/es/projects/");
    const panel = page.getByRole("dialog", { name: "Proyectos" });
    await expect(panel).toHaveAttribute("data-phase", "open");
    await panel
      .locator("#panel-projects-thesis")
      .getByRole("link", { name: "Leer el caso completo" })
      .click();

    await expect(page).toHaveURL("/es/projects/thesis/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(THESIS_ES);

    await page.getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL("/en/projects/thesis/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(THESIS_EN);

    await page.getByRole("banner").getByRole("link", { name: "All projects" }).click();
    await expect(page).toHaveURL("/en/projects/");
    await expect(page.getByRole("dialog", { name: "Projects" })).toHaveAttribute(
      "data-phase",
      "open",
    );
  });

  test("QLT-AC02: a case study exposes one main and one h1, and its skip link leads to that main", async ({
    page,
  }) => {
    await page.goto("/es/projects/dental-site/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Web para un consultorio odontológico",
    );
    expect(await page.getByRole("main").count()).toBe(1);
    expect(await page.getByRole("heading", { level: 1 }).count()).toBe(1);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Saltar al contenido" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
  });
});

test.describe("case studies on a phone", () => {
  test.use({ viewport: VIEWPORTS.mobile });

  test("SMP-AC22: the link back to the projects shows the simple view scrolled to them", async ({
    page,
  }) => {
    await page.goto("/es/projects/andespace/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("AndeSpace");

    await page.getByRole("banner").getByRole("link", { name: "Todos los proyectos" }).click();
    await expect(page).toHaveURL("/es/projects/");
    await expect(page.getByRole("heading", { level: 2, name: "Proyectos" })).toBeInViewport();
  });
});
