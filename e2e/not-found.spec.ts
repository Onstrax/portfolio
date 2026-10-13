import { expect, test } from "./support/base";

test.describe("unknown URLs", () => {
  // The 404 response is the point of the test; browsers also report it in the console.
  test.use({ allowedIssues: ["error-response", "console"] });

  test("SYS-AC12: an unknown URL gets the 404 page with status 404", async ({ page }) => {
    const response = await page.goto("/es/unknown/");

    expect(response?.status()).toBe(404);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});
