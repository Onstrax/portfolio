import type { Page } from "@playwright/test";
import { gzipSync } from "node:zlib";

import { expect, test } from "./support/base";
import { VIEWPORTS } from "./support/viewports";

const KB = 1000;

interface Transfer {
  readonly path: string;
  readonly type: string;
  /** Size of the response compressed with gzip at level 9 (QLT-AC15). */
  readonly bytes: number;
}

/**
 * Records every response of the page from now on, with the weight it would have compressed. The
 * returned function waits for the responses still being read and gives the list.
 */
function recordTransfers(page: Page): () => Promise<readonly Transfer[]> {
  const pending: Promise<Transfer | null>[] = [];
  page.on("response", (response) => {
    pending.push(
      response
        .body()
        .then((body) => ({
          path: new URL(response.url()).pathname,
          type: response.request().resourceType(),
          bytes: gzipSync(body, { level: 9 }).length,
        }))
        // A response without a body, such as a redirect or the probe of a prefetch.
        .catch(() => null),
    );
  });
  return async () => (await Promise.all(pending)).filter((transfer) => transfer !== null);
}

function total(transfers: readonly Transfer[], type?: string): number {
  return transfers
    .filter((transfer) => type === undefined || transfer.type === type)
    .reduce((sum, transfer) => sum + transfer.bytes, 0);
}

/** Loads a page as a first visit and gives everything it transferred until it went quiet. */
async function firstVisit(page: Page, path: string): Promise<readonly Transfer[]> {
  const transfers = recordTransfers(page);
  await page.goto(path);
  // The pages of the scene group may play the boot sequence, during which the scene still loads.
  const root = page.locator("html");
  if ((await root.getAttribute("data-boot")) !== null) {
    await expect(root).toHaveAttribute("data-boot", "done");
  }
  await page.waitForLoadState("networkidle");
  return transfers();
}

test.describe("weight budgets", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "weight budgets are measured only in Chromium (TST-R22)",
  );
  test.use({ bootSeen: false });

  for (const path of ["/es/", "/es/cv/", "/en/cv/", "/es/projects/thesis/"]) {
    test(`QLT-AC15: ${path} in simple mode stays within the budgets of JavaScript, CSS and document`, async ({
      page,
    }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      const transfers = await firstVisit(page, path);

      expect(total(transfers, "script")).toBeLessThanOrEqual(195 * KB);
      expect(total(transfers, "stylesheet")).toBeLessThanOrEqual(20 * KB);
      expect(total(transfers, "document")).toBeLessThanOrEqual(45 * KB);
    });
  }

  test("QLT-AC15: the home on a phone transfers 420 kB at most", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    const transfers = await firstVisit(page, "/es/");

    expect(total(transfers)).toBeLessThanOrEqual(420 * KB);
    expect(transfers.filter((transfer) => transfer.path.startsWith("/scene/"))).toEqual([]);
  });

  test("QLT-AC15: the scene on a first visit stays within the budgets of JavaScript, CSS, document and image", async ({
    page,
  }) => {
    const transfers = await firstVisit(page, "/es/");

    expect(total(transfers, "script")).toBeLessThanOrEqual(250 * KB);
    expect(total(transfers, "stylesheet")).toBeLessThanOrEqual(20 * KB);
    expect(total(transfers, "document")).toBeLessThanOrEqual(45 * KB);
    const scene = transfers.filter((transfer) => transfer.path.startsWith("/scene/"));
    expect(scene).toHaveLength(1);
    // The AVIF derivative of 1920 px may weigh 350 kB at most (AST §4.7).
    expect(scene[0]?.bytes).toBeLessThanOrEqual(350 * KB);
  });

  test.describe("at full HD", () => {
    test.use({ viewport: VIEWPORTS["desktop-hd"] });

    test("QLT-AC15: the scene at 1920×1080 px transfers 800 kB at most on a first visit", async ({
      page,
    }) => {
      const transfers = await firstVisit(page, "/es/");
      expect(total(transfers)).toBeLessThanOrEqual(800 * KB);
    });
  });

  for (const { name, viewport } of [
    { name: "the scene", viewport: VIEWPORTS.desktop },
    { name: "the simple view", viewport: VIEWPORTS.mobile },
  ]) {
    test(`QLT-AC17: ${name} loads two font files at most, within the budget of fonts`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      const fonts = (await firstVisit(page, "/es/")).filter((transfer) => transfer.type === "font");

      expect(fonts.length).toBeGreaterThan(0);
      expect(fonts.length).toBeLessThanOrEqual(2);
      expect(total(fonts)).toBeLessThanOrEqual(95 * KB);
    });
  }
});
