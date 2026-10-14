import type { Locator, Page } from "@playwright/test";

import { expect, test } from "./support/base";

/** Opens a section from the scene with one click on its piece and returns its panel. */
async function openFromScene(page: Page, zone: string, title: string): Promise<Locator> {
  await page.getByRole("link", { name: zone }).click();
  const dialog = page.getByRole("dialog", { name: title });
  await expect(dialog).toBeVisible();
  return dialog;
}

test.describe("profile", () => {
  test("CPU-AC07: the processor opens the profile, with the availability and the CV (es)", async ({
    page,
  }) => {
    await page.goto("/es/");
    const dialog = await openFromScene(page, "Procesador (CPU): Perfil", "Perfil");

    await expect(dialog.getByText("Disponible desde enero de 2027")).toBeVisible();
    // In the content: the bar drawn inside the panel has a résumé link of its own.
    await expect(
      dialog.getByTestId("panel-content").getByRole("link", { name: "Descargar CV (PDF)" }),
    ).toBeVisible();
  });

  test("CPU-AC07: the processor opens the profile, with the availability and the CV (en)", async ({
    page,
  }) => {
    await page.goto("/en/");
    const dialog = await openFromScene(page, "Processor (CPU): Profile", "Profile");

    await expect(dialog.getByText("Available from January 2027")).toBeVisible();
    await expect(
      dialog.getByTestId("panel-content").getByRole("link", { name: "Download résumé (PDF)" }),
    ).toBeVisible();
  });

  test("CPU-AC08: the link to the projects opens the projects panel without adding history", async ({
    page,
  }) => {
    await page.goto("/es/");
    const dialog = await openFromScene(page, "Procesador (CPU): Perfil", "Perfil");

    await dialog.getByRole("link", { name: "Ver los proyectos" }).click();
    await expect(page.getByRole("dialog", { name: "Proyectos" })).toBeVisible();
    await expect(page).toHaveURL("/es/projects/");

    await page.goBack();
    await expect(page).toHaveURL("/es/");
  });
});

test.describe("experience", () => {
  test("PSU-AC06: the power supply opens the experience, and its project link shows that project (es)", async ({
    page,
  }) => {
    await page.goto("/es/");
    const dialog = await openFromScene(page, "Fuente de poder (PSU): Experiencia", "Experiencia");
    await expect(dialog.getByText("Monitor académico").first()).toBeVisible();

    await dialog.getByRole("link", { name: "Ver el proyecto" }).click();
    await expect(page.getByRole("dialog", { name: "Proyectos" })).toBeVisible();
    await expect(page).toHaveURL("/es/projects/#projects-dental-site");
    await expect(page.locator("#panel-projects-dental-site")).toBeInViewport();
  });

  test("PSU-AC06: the power supply opens the experience (en)", async ({ page }) => {
    await page.goto("/en/");
    const dialog = await openFromScene(page, "Power supply (PSU): Experience", "Experience");
    await expect(dialog.getByText("Teaching Assistant").first()).toBeVisible();
  });
});

test.describe("projects, stack and ecosystem", () => {
  test("SSD-AC08: the SSD opens the projects with the featured ones (es)", async ({ page }) => {
    await page.goto("/es/");
    const dialog = await openFromScene(page, "SSD NVMe: Proyectos", "Proyectos");

    await expect(dialog.getByRole("heading", { name: "Destacados" })).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "HabiCapital" })).toBeAttached();
    await expect(dialog.getByText("Simulación de banca digital segura")).toBeAttached();
  });

  test("SSD-AC08: the SSD opens the projects with the featured ones (en)", async ({ page }) => {
    await page.goto("/en/");
    const dialog = await openFromScene(page, "NVMe SSD: Projects", "Projects");

    await expect(dialog.getByRole("heading", { name: "Featured" })).toBeVisible();
    await expect(dialog.getByText("Secure digital banking simulation")).toBeAttached();
  });

  test("RAM-AC07: the memory opens the tech stack with its categories (es)", async ({ page }) => {
    await page.goto("/es/");
    const dialog = await openFromScene(page, "Memoria RAM: Stack tecnológico", "Stack tecnológico");

    await expect(dialog.getByRole("heading", { name: "Lenguajes" })).toBeVisible();
    await expect(dialog.getByText("Python", { exact: true }).first()).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Seguridad y criptografía" })).toBeAttached();
  });

  test("RAM-AC07: the memory opens the tech stack with its categories (en)", async ({ page }) => {
    await page.goto("/en/");
    const dialog = await openFromScene(page, "RAM: Tech stack", "Tech stack");

    await expect(dialog.getByRole("heading", { name: "Languages" })).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Security and cryptography" })).toBeAttached();
  });

  test("FAN-AC07: the fan opens the personal ecosystem with its two groups (es)", async ({
    page,
  }) => {
    await page.goto("/es/");
    const dialog = await openFromScene(
      page,
      "Ventilador ARGB: Ecosistema personal",
      "Ecosistema personal",
    );

    await expect(dialog.getByRole("heading", { name: "Desarrollado por mí" })).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Configurado e integrado" })).toBeAttached();
  });

  test("FAN-AC07: the fan opens the personal ecosystem with its two groups (en)", async ({
    page,
  }) => {
    await page.goto("/en/");
    const dialog = await openFromScene(page, "ARGB fan: Personal ecosystem", "Personal ecosystem");

    await expect(dialog.getByRole("heading", { name: "Built by me" })).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Configured and integrated" })).toBeAttached();
  });
});

test.describe("contact", () => {
  test("IO-AC07, VSN-AC02: the I/O panel opens the contact, two interactions away from every channel (es)", async ({
    page,
  }) => {
    await page.goto("/es/");
    const dialog = await openFromScene(page, "Panel I/O: Contacto", "Contacto");

    await expect(dialog.getByText("juanalvarezgcl@gmail.com").first()).toBeVisible();
    await expect(dialog.getByText("+57 300 562 8702")).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Descargar en español (PDF)" })).toBeAttached();
    for (const href of [
      "mailto:juanalvarezgcl@gmail.com",
      "https://wa.me/573005628702",
      "https://www.linkedin.com/in/juan-esteban-alvarez-garcia-21bb70364/",
      "https://github.com/Onstrax",
    ]) {
      // In the content: the bar drawn inside the panel links some channels too.
      await expect(dialog.getByTestId("panel-content").locator(`a[href="${href}"]`)).toBeAttached();
    }
  });

  test("IO-AC07: the I/O panel opens the contact (en)", async ({ page }) => {
    await page.goto("/en/");
    const dialog = await openFromScene(page, "I/O panel: Contact", "Contact");

    await expect(dialog.getByRole("link", { name: "Download in English (PDF)" })).toBeAttached();
  });

  test("IO-AC08, VSN-AC02: the download link of the contact panel downloads the CV in Spanish", async ({
    page,
  }) => {
    await page.goto("/es/");
    const dialog = await openFromScene(page, "Panel I/O: Contacto", "Contacto");

    const download = page.waitForEvent("download");
    await dialog.getByRole("link", { name: "Descargar en español (PDF)" }).click();
    expect((await download).suggestedFilename()).toBe("juan-esteban-alvarez-garcia-cv-es.pdf");
  });

  test.describe("clipboard", () => {
    test.skip(
      ({ browserName }) => browserName !== "chromium",
      "only Chromium grants clipboard permissions to a test (IO-AC09)",
    );
    test.use({ permissions: ["clipboard-read", "clipboard-write"] });

    test("IO-AC09: the copy button leaves the email address in the clipboard", async ({ page }) => {
      await page.goto("/es/");
      const dialog = await openFromScene(page, "Panel I/O: Contacto", "Contacto");

      await dialog
        .getByRole("button", { name: /^Copiar/ })
        .first()
        .click();
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toBe("juanalvarezgcl@gmail.com");
    });
  });
});

test.describe("about", () => {
  test("CMOS-AC06: the battery opens the about section and the display does not change (es)", async ({
    page,
  }) => {
    await page.goto("/es/");
    const display = page.getByTestId("post-display");
    await expect(display).toHaveAttribute("data-value", "00");
    const dialog = await openFromScene(
      page,
      "Pila CMOS: Acerca de este sitio",
      "Acerca de este sitio",
    );

    await expect(dialog.getByRole("heading", { name: "Cómo se construyó" })).toBeVisible();
    await expect(
      dialog.getByRole("link", { name: /Código y especificaciones en GitHub/ }),
    ).toBeAttached();
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL("/es/");
    await expect(display).toHaveAttribute("data-value", "00");
  });

  test("CMOS-AC06: the battery opens the about section (en)", async ({ page }) => {
    await page.goto("/en/");
    const dialog = await openFromScene(page, "CMOS battery: About this site", "About this site");

    await expect(dialog.getByRole("heading", { name: "How it was built" })).toBeVisible();
  });
});
