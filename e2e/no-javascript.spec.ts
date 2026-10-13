import { expect, test } from "./support/base";

// With JavaScript disabled the browser blocks every script, and reports each one as a failed request.
test.use({ javaScriptEnabled: false, allowedIssues: ["failed-request"] });

/** A fragment of the content of each section, to prove that the whole text is in the HTML. */
const CONTENT: Readonly<Record<string, readonly string[]>> = {
  es: [
    "Disponible desde enero de 2027",
    "Monitor académico",
    "Simulación de banca digital segura",
    "Seguridad y criptografía",
    "juanalvarezgcl@gmail.com",
    "Desarrollado por mí",
    "Cómo se construyó",
  ],
  en: [
    "Available from January 2027",
    "Teaching Assistant",
    "Secure digital banking simulation",
    "Security and cryptography",
    "juanalvarezgcl@gmail.com",
    "Built by me",
    "How it was built",
  ],
};

for (const [locale, fragments] of Object.entries(CONTENT)) {
  test(`VSN-AC03: the server HTML holds the seven sections without JavaScript (${locale})`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/`);

    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(7);
    for (const fragment of fragments) {
      await expect(page.getByText(fragment, { exact: false }).first()).toBeVisible();
    }
  });
}

// The download has a test of its own: in Firefox, the navigation that a download link starts and
// abandons can be reported late, and then the next navigation of the page is never seen to end.
test("SMP-AC06: the download link works without JavaScript", async ({ page }) => {
  await page.goto("/es/");

  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Descargar CV (PDF)" }).first().click();
  expect((await download).suggestedFilename()).toBe("juan-esteban-alvarez-garcia-cv-es.pdf");
});

test("SMP-AC06: language and navigation links work without JavaScript", async ({ page }) => {
  await page.goto("/es/");

  await page.getByRole("link", { name: "English" }).click();
  await expect(page).toHaveURL("/en/");
  await expect(page.getByRole("heading", { level: 2, name: "Profile" })).toBeVisible();

  await page
    .getByRole("navigation", { name: "Sections" })
    .getByRole("link", { name: "Contact" })
    .click();
  await expect(page).toHaveURL("/en/#contact");
  await expect(page.getByRole("region", { name: "Contact" })).toBeInViewport();
});

test("SYS-AC04: without JavaScript the entry page offers a link to each language", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Continue in English" })).toHaveAttribute(
    "href",
    "/en/",
  );
  await expect(page.getByRole("link", { name: "Continuar en español" })).toHaveAttribute(
    "href",
    "/es/",
  );
});

test("I18N-AC16: the Spanish texts of the entry page are marked as Spanish", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.locator("[lang=es]").filter({ hasText: "Continuar en español" }).first(),
  ).toBeVisible();
});
