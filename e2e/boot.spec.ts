import type { Locator, Page } from "@playwright/test";

import { expect, test } from "./support/base";
import { VIEWPORTS } from "./support/viewports";

const SESSION_KEY = "portfolio:v1:session";

function bootScreen(page: Page): Locator {
  return page.getByTestId("boot-screen");
}

function html(page: Page): Locator {
  return page.locator("html");
}

interface BootTimes {
  /** Last key or pointer press of the visitor. */
  inputAt?: number;
  /** Moment in which the boot screen finished fading out. */
  fadedAt?: number;
}

/**
 * Notes, on the clock of the page, when the visitor last pressed something and when the boot
 * screen finished fading. The test runner, busy with other browsers, would notice both later than
 * they happened, and the limits of the boot sequence are of a few hundred milliseconds.
 */
async function trackBootTimes(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const times: Record<string, number> = {};
    Object.assign(window, { bootTimes: times });
    const noteInput = (): void => {
      times["inputAt"] = performance.now();
    };
    window.addEventListener("keydown", noteInput, true);
    window.addEventListener("pointerdown", noteInput, true);
    document.addEventListener("animationend", (event) => {
      const { target } = event;
      if (target instanceof HTMLElement && target.dataset["testid"] === "boot-screen") {
        times["fadedAt"] = performance.now();
      }
    });
  });
}

function bootTimes(page: Page): Promise<BootTimes> {
  return page.evaluate(() => (window as unknown as { bootTimes: BootTimes }).bootTimes);
}

/** Milliseconds from the last press of the visitor to the end of the fade of the boot screen. */
async function fadeAfterInput(page: Page): Promise<number> {
  const { inputAt = Number.NaN, fadedAt = Number.NaN } = await bootTimes(page);
  return fadedAt - inputAt;
}

/**
 * Waits until the code that runs the boot sequence has arrived, which shows in the scene being
 * mounted under the boot screen. Before that, a press is only noted and takes effect later.
 */
async function waitForBootCode(page: Page): Promise<void> {
  await expect(page.getByTestId("scene-root")).toBeAttached();
  await expect(bootScreen(page)).toBeVisible();
}

/**
 * Opens the home in Spanish with every JavaScript file held back, and waits until the boot log is
 * running, which needs none. Returns the function that lets the files through.
 */
async function openWithScriptsHeld(page: Page): Promise<() => void> {
  let release = (): void => undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/*.js", async (route) => {
    await held;
    await route.continue();
  });
  await page.goto("/es/", { waitUntil: "commit" });
  await waitForFourthLine(page);
  return release;
}

/** Waits until the fourth line of the log is on screen, some 300 ms after the first paint. */
async function waitForFourthLine(page: Page): Promise<void> {
  await expect(bootScreen(page).locator('[data-part="line"]').nth(3)).toHaveCSS("opacity", "1");
}

function session(page: Page): Promise<unknown> {
  return page.evaluate((key) => {
    const stored = window.sessionStorage.getItem(key);
    return stored === null ? null : (JSON.parse(stored) as unknown);
  }, SESSION_KEY);
}

test.describe("first visit", () => {
  test.use({ bootSeen: false });

  test("BOOT-AC05: the boot sequence shows on a first visit and ends by itself", async ({
    page,
  }) => {
    await page.goto("/es/");
    await expect(html(page)).toHaveAttribute("data-boot", "play");
    await expect(bootScreen(page)).toBeVisible();
    await expect(bootScreen(page)).toContainText("Booting portfolio kernel 1.0");

    await expect(bootScreen(page)).toBeHidden();
    await expect(html(page)).toHaveAttribute("data-boot", "done");
    await expect(bootScreen(page)).not.toHaveAttribute("data-skipped", "true");
    await expect(page.getByTestId("scene-root")).toBeVisible();
    expect(await session(page)).toMatchObject({ bootSeen: true });
  });

  // The skip tests hold the JavaScript files back until the visitor has acted. That is the hard
  // case, a press that arrives before the code, and it does not depend on how fast the machine
  // is: the sequence cannot end by itself while its code has not arrived.
  test("BOOT-AC06: a letter key skips the boot sequence, and Shift alone does not", async ({
    page,
  }) => {
    const release = await openWithScriptsHeld(page);

    await page.keyboard.press("Shift");
    await expect(html(page)).not.toHaveAttribute("data-boot-skip", "");
    await page.keyboard.press("a");
    await expect(html(page)).toHaveAttribute("data-boot-skip", "");
    await expect(html(page)).toHaveAttribute("data-boot", "play");

    release();
    await expect(bootScreen(page)).toBeHidden();
    await expect(bootScreen(page)).toHaveAttribute("data-skipped", "true");
    await expect(html(page)).toHaveAttribute("data-boot", "done");
  });

  test("BOOT-AC06: a click anywhere skips the boot sequence", async ({ page }) => {
    const release = await openWithScriptsHeld(page);

    await page.mouse.click(640, 360);
    await expect(html(page)).toHaveAttribute("data-boot-skip", "");

    release();
    await expect(bootScreen(page)).toBeHidden();
    await expect(bootScreen(page)).toHaveAttribute("data-skipped", "true");
  });

  test("BOOT-AC06: the skip button skips the boot sequence", async ({ page }) => {
    const release = await openWithScriptsHeld(page);

    await page.getByRole("button", { name: "Saltar" }).click();
    await expect(html(page)).toHaveAttribute("data-boot-skip", "");

    release();
    await expect(bootScreen(page)).toBeHidden();
    await expect(bootScreen(page)).toHaveAttribute("data-skipped", "true");
  });

  test("BOOT-AC07: the boot sequence does not show again when the page reloads in the same session", async ({
    page,
  }) => {
    await page.goto("/es/");
    await expect(bootScreen(page)).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(html(page)).toHaveAttribute("data-boot", "done");

    await page.reload();
    await expect(html(page)).toHaveAttribute("data-boot", "done");
    await expect(bootScreen(page)).toBeHidden();
    await expect(page.getByTestId("scene-root")).toBeVisible();
  });

  test("BOOT-AC07: the boot sequence does not show on the URL of a section, nor after closing its panel", async ({
    page,
  }) => {
    await page.goto("/es/projects/");
    await expect(html(page)).toHaveAttribute("data-boot", "done");
    await expect(bootScreen(page)).toBeHidden();
    await expect(page.getByRole("dialog", { name: "Proyectos" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page).toHaveURL("/es/");
    await expect(html(page)).toHaveAttribute("data-boot", "done");
    await expect(bootScreen(page)).toBeHidden();
    expect(await session(page)).toMatchObject({ bootSeen: true });
  });

  test("BOOT-AC09: while the boot sequence shows, Tab only reaches the skip button and the scene takes no click", async ({
    page,
  }) => {
    const release = await openWithScriptsHeld(page);

    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Saltar" })).toBeFocused();
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => {
        const active = document.activeElement;
        const screen = document.querySelector('[data-testid="boot-screen"]');
        return active === document.body || screen?.contains(active) === true;
      }),
    ).toBe(true);
    // Tab moves the focus and skips nothing.
    await expect(html(page)).not.toHaveAttribute("data-boot-skip", "");

    // Where the processor is: the click skips the sequence but opens nothing.
    await page.mouse.click(654, 302);
    release();
    await expect(bootScreen(page)).toBeHidden();
    await expect(page).toHaveURL("/es/");
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("BOOT-AC12, I18N-AC16: the log is marked as English and the skip controls are in Spanish, outside it", async ({
    page,
  }) => {
    await page.goto("/es/");
    const log = bootScreen(page).locator('[data-part="log"]');

    await expect(log).toHaveAttribute("lang", "en");
    await expect(log).toHaveAttribute("aria-hidden", "true");
    await expect(bootScreen(page).getByText("Cualquier tecla salta el arranque")).toBeVisible();
    const skip = bootScreen(page).getByRole("button", { name: "Saltar" });
    await expect(skip).toBeVisible();
    expect(await skip.evaluate((element) => element.closest("[lang=en]") === null)).toBe(true);
    await expect(log.getByRole("button")).toHaveCount(0);
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("BOOT-AC07: the boot sequence does not show with reduced motion", async ({ page }) => {
      await page.goto("/es/");
      await expect(html(page)).toHaveAttribute("data-boot", "done");
      await expect(bootScreen(page)).toBeHidden();
    });
  });

  test.describe("on a phone", () => {
    test.use({ viewport: VIEWPORTS.mobile });

    test("BOOT-AC07: the boot sequence does not show on a phone", async ({ page }) => {
      await page.goto("/es/");
      await expect(html(page)).toHaveAttribute("data-mode", "simple");
      await expect(bootScreen(page)).toBeHidden();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Juan Esteban Álvarez García",
      );
    });
  });

  test.describe("when JavaScript files cannot be downloaded", () => {
    // The browser logs every blocked file, and warns that the preloaded image was never used.
    test.use({ allowedIssues: ["failed-request", "console"] });

    test("BOOT-AC08: the first lines of the log show within a second, without JavaScript files", async ({
      page,
    }) => {
      await page.route("**/*.js", (route) => route.abort());
      await page.goto("/es/");

      const lines = bootScreen(page).locator('[data-part="line"]');
      await expect(lines.first()).toBeVisible({ timeout: 1000 });
      await expect(lines.first()).toContainText("Booting portfolio kernel 1.0");
      await expect
        .poll(() => lines.nth(2).evaluate((line) => getComputedStyle(line).opacity), {
          timeout: 1000,
        })
        .toBe("1");
    });
  });
});

test.describe("replay after a session reset", () => {
  async function resetSession(page: Page): Promise<void> {
    await page.goto("/es/");
    await page.getByRole("button", { name: "Panel frontal: Ajustes" }).click();
    await page.getByRole("button", { name: "Reiniciar sesión" }).click();
  }

  test("BOOT-AC10: resetting the session shows the boot sequence again and marks it as seen at its end", async ({
    page,
  }) => {
    await resetSession(page);

    await expect(bootScreen(page)).toBeVisible();
    await expect(html(page)).toHaveAttribute("data-boot", "play");
    await expect(bootScreen(page)).toBeHidden();
    expect(await session(page)).toEqual({ bootSeen: true, visited: [] });
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("BOOT-AC11: with reduced motion the replay shows every line at once and ends quickly", async ({
      page,
    }) => {
      await resetSession(page);

      await expect(bootScreen(page)).toBeVisible();
      const lines = bootScreen(page).locator('[data-part="line"]');
      expect(
        await lines.evaluateAll((all) =>
          all.every(
            (line) => getComputedStyle(line).opacity === "1" && line.getAnimations().length === 0,
          ),
        ),
      ).toBe(true);
      await expect(bootScreen(page)).toBeHidden();
    });
  });
});

test.describe("time limits of the boot sequence", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "the time limits of the boot sequence are measured only in Chromium (TST-R22)",
  );

  test.describe("on a first visit", () => {
    test.use({ bootSeen: false });

    test("BOOT-AC05: the boot screen has faded out within 2600 ms of the first paint", async ({
      page,
    }) => {
      await trackBootTimes(page);
      await page.goto("/es/");
      await expect(bootScreen(page)).toBeHidden();

      const firstPaint = await page.evaluate(
        () => performance.getEntriesByName("first-contentful-paint").at(0)?.startTime ?? 0,
      );
      const elapsed = ((await bootTimes(page)).fadedAt ?? Number.NaN) - firstPaint;
      expect(elapsed).toBeGreaterThan(1800);
      expect(elapsed).toBeLessThanOrEqual(2600);
    });

    for (const { way, act } of [
      { way: "a key press", act: (page: Page) => page.keyboard.press("a") },
      { way: "a click", act: (page: Page) => page.mouse.click(640, 360) },
      {
        way: "the skip button",
        act: (page: Page) => page.getByRole("button", { name: "Saltar" }).click(),
      },
    ]) {
      test(`BOOT-AC06: after ${way} the boot screen has faded out within 700 ms`, async ({
        page,
      }) => {
        await trackBootTimes(page);
        await page.goto("/es/");
        await waitForFourthLine(page);
        await waitForBootCode(page);

        await act(page);
        await expect(bootScreen(page)).toBeHidden();
        await expect(bootScreen(page)).toHaveAttribute("data-skipped", "true");
        expect(await fadeAfterInput(page)).toBeLessThanOrEqual(700);
      });
    }
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("BOOT-AC11: the replay with reduced motion has faded out within 800 ms of the reset", async ({
      page,
    }) => {
      await trackBootTimes(page);
      await page.goto("/es/");
      await page.getByRole("button", { name: "Panel frontal: Ajustes" }).click();
      await page.getByRole("button", { name: "Reiniciar sesión" }).click();

      await expect(bootScreen(page)).toBeVisible();
      await expect(bootScreen(page)).toBeHidden();
      // From the click on the reset button to the end of the fade.
      expect(await fadeAfterInput(page)).toBeLessThanOrEqual(800);
    });
  });
});
