import { test } from "./support/base";

test("TST-AC08: a console error fails a test built on the base test", async ({ page }) => {
  test.fail();
  await page.goto("/es/");

  await page.evaluate(() => {
    console.error("deliberate error");
  });
});

test.describe("requests to another origin", () => {
  // Only the foreign request may fail this test: the unreachable server would also be reported
  // as a failed request and as a console error.
  test.use({ allowedIssues: ["console", "failed-request", "exception"] });

  test("TST-AC08: a request to another origin fails a test built on the base test", async ({
    page,
  }) => {
    test.fail();
    await page.goto("/es/");

    await page.goto("http://localhost:4174/elsewhere/").catch(() => undefined);
  });
});
