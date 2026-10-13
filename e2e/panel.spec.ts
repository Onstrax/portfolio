import type { Locator, Page } from "@playwright/test";

import { expect, test } from "./support/base";
import { VIEWPORTS } from "./support/viewports";

const SESSION_KEY = "portfolio:v1:session";

/** The seven sections in canonical order, with the piece that opens each. */
const SECTIONS = [
  { zone: "Procesador (CPU): Perfil", title: "Perfil", path: "/es/profile/" },
  { zone: "Fuente de poder (PSU): Experiencia", title: "Experiencia", path: "/es/experience/" },
  { zone: "SSD NVMe: Proyectos", title: "Proyectos", path: "/es/projects/" },
  { zone: "Memoria RAM: Stack tecnológico", title: "Stack tecnológico", path: "/es/stack/" },
  { zone: "Panel I/O: Contacto", title: "Contacto", path: "/es/contact/" },
  {
    zone: "Ventilador ARGB: Ecosistema personal",
    title: "Ecosistema personal",
    path: "/es/ecosystem/",
  },
  { zone: "Pila CMOS: Acerca de este sitio", title: "Acerca de este sitio", path: "/es/about/" },
] as const;

function panel(page: Page, name: string): Locator {
  return page.getByRole("dialog", { name });
}

function zone(page: Page, name: string): Locator {
  return page.getByRole("link", { name });
}

/** Opens a section from the scene with one click on its piece. */
async function open(page: Page, section: (typeof SECTIONS)[number]): Promise<Locator> {
  await zone(page, section.zone).click();
  const dialog = panel(page, section.title);
  await expect(dialog).toBeVisible();
  return dialog;
}

async function expectClosed(page: Page, url = "/es/"): Promise<void> {
  await expect(page).toHaveURL(url);
  await expect(page.getByRole("dialog")).toBeHidden();
}

function visited(page: Page): Promise<unknown> {
  return page.evaluate((key) => {
    const stored = window.sessionStorage.getItem(key);
    return stored === null ? null : (JSON.parse(stored) as { visited: unknown }).visited;
  }, SESSION_KEY);
}

test.describe("opening and closing the panel", () => {
  for (const { locale, zoneName, title, chip } of [
    { locale: "es", zoneName: "SSD NVMe: Proyectos", title: "Proyectos", chip: "SSD NVMe" },
    { locale: "en", zoneName: "NVMe SSD: Projects", title: "Projects", chip: "NVMe SSD" },
  ]) {
    test(`PNL-AC01: opening Projects shows a modal named after the section, with the focus on its title (${locale})`, async ({
      page,
    }) => {
      await page.goto(`/${locale}/`);
      await zone(page, zoneName).click();

      const dialog = panel(page, title);
      await expect(dialog).toBeVisible();
      await expect(page).toHaveURL(`/${locale}/projects/`);
      await expect(dialog.getByText(chip, { exact: true })).toBeVisible();
      await expect(dialog.getByRole("heading", { level: 2, name: title })).toBeFocused();
      expect(await dialog.evaluate((element) => element.matches(":modal"))).toBe(true);
    });
  }

  test("PNL-AC02: the close button, Esc and a click on the veil close the panel; a click inside does not", async ({
    page,
  }) => {
    await page.goto("/es/");

    let dialog = await open(page, SECTIONS[2]);
    await dialog.getByRole("heading", { level: 2 }).click();
    await dialog.getByTestId("panel-content").click({ position: { x: 20, y: 20 } });
    await expect(page).toHaveURL("/es/projects/");
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Cerrar" }).click();
    await expectClosed(page);

    dialog = await open(page, SECTIONS[2]);
    await page.keyboard.press("Escape");
    await expectClosed(page);

    dialog = await open(page, SECTIONS[2]);
    await expect(dialog).toHaveAttribute("data-phase", "open");
    await page.mouse.click(24, 24);
    await expectClosed(page);
  });

  test("PNL-AC03: after moving through three sections, a single Back returns to the scene", async ({
    page,
  }) => {
    await page.goto("/es/");
    await open(page, SECTIONS[0]);

    for (const next of ["Experiencia", "Proyectos", "Stack tecnológico"]) {
      await page.getByRole("link", { name: `Sección siguiente: ${next}` }).click();
      await expect(panel(page, next)).toBeVisible();
    }
    await expect(page).toHaveURL("/es/stack/");

    await page.goBack();
    await expectClosed(page);
  });

  test("PNL-AC04: closing after a direct entry leads to the home, and Back does not reopen the panel", async ({
    page,
  }) => {
    await page.goto("/es/projects/");
    await expect(panel(page, "Proyectos")).toBeVisible();

    await page.getByRole("button", { name: "Cerrar" }).click();
    await expectClosed(page);

    await page.goBack();
    await expect(page).not.toHaveURL(/projects/);
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("SYS-AC09: the Back button of the browser closes the panel", async ({ page }) => {
    await page.goto("/es/");
    await open(page, SECTIONS[4]);

    await page.goBack();
    await expectClosed(page);
    await expect(zone(page, "Panel I/O: Contacto")).toBeVisible();
  });

  test("SCN-AC14: closing a panel opened by its URL leaves the focus on the piece of that section", async ({
    page,
  }) => {
    await page.goto("/es/projects/");
    await expect(panel(page, "Proyectos")).toBeVisible();

    await page.keyboard.press("Escape");
    await expectClosed(page);
    await expect(zone(page, "SSD NVMe: Proyectos")).toBeFocused();
  });

  test("QLT-AC04, PNL-AC08: the keyboard opens a panel, stays inside it and returns to the piece on Esc", async ({
    page,
  }) => {
    await page.goto("/es/");
    const piece = zone(page, "Memoria RAM: Stack tecnológico");
    await piece.focus();
    await page.keyboard.press("Enter");

    const dialog = panel(page, "Stack tecnológico");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { level: 2 })).toBeFocused();

    for (let presses = 0; presses < 40; presses += 1) {
      await page.keyboard.press("Tab");
      const isOutside = await page.evaluate(() => {
        const active = document.activeElement;
        const modal = document.querySelector("dialog[data-phase]");
        return active !== null && active !== document.body && modal?.contains(active) !== true;
      });
      expect(isOutside, `after ${String(presses + 1)} presses of Tab`).toBe(false);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollHeight <= document.documentElement.clientHeight,
      ),
    ).toBe(true);

    await page.keyboard.press("Escape");
    await expectClosed(page);
    await expect(piece).toBeFocused();
  });
});

test.describe("moving between sections", () => {
  test("PNL-AC05: next and previous walk the seven sections in a circle, showing the position", async ({
    page,
  }) => {
    await page.goto("/es/");
    await open(page, SECTIONS[0]);
    await expect(page.getByText("1 / 7")).toBeVisible();

    for (const step of [1, 2, 3, 4, 5, 6, 0]) {
      const { title, path } = SECTIONS[step] ?? SECTIONS[0];
      await page.getByRole("link", { name: `Sección siguiente: ${title}` }).click();
      await expect(panel(page, title)).toBeVisible();
      await expect(page).toHaveURL(path);
      await expect(page.getByText(`${String(step + 1)} / 7`)).toBeVisible();
    }
    for (const step of [6, 5, 4, 3, 2, 1, 0]) {
      const { title, path } = SECTIONS[step] ?? SECTIONS[0];
      await page.getByRole("link", { name: `Sección anterior: ${title}` }).click();
      await expect(panel(page, title)).toBeVisible();
      await expect(page).toHaveURL(path);
      await expect(page.getByText(`${String(step + 1)} / 7`)).toBeVisible();
    }
  });

  test("PNL-AC06: changing section keeps the dialog, resets the scroll and focuses the new title", async ({
    page,
  }) => {
    await page.goto("/es/");
    const dialog = await open(page, SECTIONS[2]);
    await dialog.evaluate((element) => {
      element.setAttribute("data-kept", "yes");
    });
    const content = page.getByTestId("panel-content");
    await content.evaluate((element) => {
      element.scrollTop = 300;
    });
    expect(await content.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

    await page.getByRole("link", { name: "Sección siguiente: Stack tecnológico" }).click();
    const next = panel(page, "Stack tecnológico");
    await expect(next).toBeVisible();
    await expect(next).toHaveAttribute("data-kept", "yes");
    await expect(next.getByRole("heading", { level: 2, name: "Stack tecnológico" })).toBeFocused();
    await expect(next).toHaveAttribute("data-phase", "open");
    expect(await content.evaluate((element) => element.scrollTop)).toBe(0);
  });

  test("PNL-AC07: previous and next show the title of their section and name where they lead", async ({
    page,
  }) => {
    await page.goto("/es/projects/");
    const dialog = panel(page, "Proyectos");

    const previous = dialog.getByRole("link", { name: "Sección anterior: Experiencia" });
    await expect(previous).toHaveText("Experiencia");
    await expect(previous).toHaveAttribute("href", "/es/experience/");
    const next = dialog.getByRole("link", { name: "Sección siguiente: Stack tecnológico" });
    await expect(next).toHaveText("Stack tecnológico");
    await expect(next).toHaveAttribute("href", "/es/stack/");
  });

  test("PNL-AC09: a fragment scrolls the content to its element, and an unknown one is ignored", async ({
    page,
  }) => {
    await page.goto("/es/projects/#projects-habicapital");
    const content = page.getByTestId("panel-content");
    await expect(panel(page, "Proyectos")).toBeVisible();
    await expect(page.locator("#panel-projects-habicapital")).toBeInViewport();
    expect(await content.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    expect(
      await page
        .locator("dialog[data-phase]")
        .evaluate((element) => element.scrollTop + document.documentElement.scrollTop),
    ).toBe(0);

    // A different path first: changing only the fragment would not load the page again.
    await page.goto("/es/cv/");
    await page.goto("/es/projects/#no-such-element");
    await expect(panel(page, "Proyectos")).toBeVisible();
    expect(await content.evaluate((element) => element.scrollTop)).toBe(0);
  });

  test("PNL-AC13: a long section scrolls with the keyboard while header and footer stay in place", async ({
    page,
  }) => {
    await page.goto("/es/projects/");
    const dialog = panel(page, "Proyectos");
    const content = page.getByTestId("panel-content");
    await expect(content).toHaveAttribute("tabindex", "0");

    await content.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    await page.keyboard.press("End");
    await expect
      .poll(() =>
        content.evaluate(
          (element) => element.scrollTop + element.clientHeight >= element.scrollHeight - 1,
        ),
      )
      .toBe(true);

    await expect(dialog.getByRole("heading", { level: 2 })).toBeInViewport();
    await expect(dialog.getByRole("button", { name: "Cerrar" })).toBeInViewport();
    await expect(dialog.getByRole("link", { name: /^Sección siguiente/ })).toBeInViewport();
  });
});

test.describe("visited sections", () => {
  test("PNL-AC10, SCN-AC10: opening primary sections counts them once; the about section does not count", async ({
    page,
  }) => {
    await page.goto("/es/");
    const display = page.getByTestId("post-display");
    await expect(display).toHaveAttribute("data-value", "00");

    for (const index of [0, 2]) {
      await open(page, SECTIONS[index] ?? SECTIONS[0]);
      await page.keyboard.press("Escape");
      await expectClosed(page);
    }
    await expect(display).toHaveAttribute("data-value", "02");
    expect(await visited(page)).toEqual(["cpu", "ssd"]);
    await expect(page.getByRole("main").getByRole("status")).toHaveText(
      "2 de 6 secciones visitadas",
    );

    for (const index of [0, 6]) {
      await open(page, SECTIONS[index] ?? SECTIONS[0]);
      await page.keyboard.press("Escape");
      await expectClosed(page);
    }
    await expect(display).toHaveAttribute("data-value", "02");
    expect(await visited(page)).toEqual(["cpu", "ssd"]);
  });

  test("SCN-AC11: the hint shows in a new session and is gone once a section has been opened", async ({
    page,
  }) => {
    await page.goto("/es/");
    const hint = page.getByTestId("scene-hint");
    await expect(hint).toBeVisible();
    await expect(hint).toHaveText("Cada componente iluminado abre una sección.");

    await open(page, SECTIONS[6]);
    await expect(hint).toBeHidden();
    await page.keyboard.press("Escape");
    await expectClosed(page);
    await expect(hint).toBeHidden();
  });
});

test.describe("panel and render mode", () => {
  test("PNL-AC11: shrinking to a phone closes the dialog and shows that section in the simple view", async ({
    page,
  }) => {
    await page.goto("/es/");
    await open(page, SECTIONS[2]);

    await page.setViewportSize(VIEWPORTS.mobile);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL("/es/projects/");
    await expect(page.getByRole("region", { name: "Proyectos" })).toBeInViewport();
    await expect(page.getByRole("heading", { level: 1 })).not.toBeInViewport();

    await page.setViewportSize(VIEWPORTS.desktop);
    await expect(panel(page, "Proyectos")).toBeVisible();
    await expect(page).toHaveURL("/es/projects/");
  });

  for (const section of SECTIONS) {
    test(`VSN-AC05: the URL of ${section.title} shows the scene with its panel open and no boot sequence`, async ({
      page,
    }) => {
      await page.goto(section.path);

      await expect(page.locator("html")).toHaveAttribute("data-mode", "scene");
      await expect(page.locator("html")).toHaveAttribute("data-boot", "done");
      await expect(page.getByTestId("scene-root")).toBeVisible();
      await expect(panel(page, section.title)).toBeVisible();
    });
  }

  test("VSN-AC01: every section opens with one click, or with one activation from the keyboard", async ({
    page,
  }) => {
    await page.goto("/es/");
    for (const section of SECTIONS) {
      await open(page, section);
      await page.keyboard.press("Escape");
      await expectClosed(page);
    }

    await zone(page, SECTIONS[5].zone).focus();
    await page.keyboard.press("Enter");
    await expect(panel(page, SECTIONS[5].title)).toBeVisible();
  });

  for (const { locale, names } of [
    {
      locale: "es",
      names: SECTIONS.map((section) => section.zone),
    },
    {
      locale: "en",
      names: [
        "Processor (CPU): Profile",
        "Power supply (PSU): Experience",
        "NVMe SSD: Projects",
        "RAM: Tech stack",
        "I/O panel: Contact",
        "ARGB fan: Personal ecosystem",
        "CMOS battery: About this site",
      ],
    },
  ]) {
    test(`QLT-AC11: the name of each piece holds its hardware name and its section (${locale})`, async ({
      page,
    }) => {
      await page.goto(`/${locale}/`);
      await expect(page.getByRole("main").getByRole("link")).toHaveText(names);
    });
  }
});

test.describe("look of the panel", () => {
  test("VIS-AC10: the frame respects its maximum size and stays inside the viewport", async ({
    page,
  }) => {
    await page.goto("/es/projects/");
    const dialog = panel(page, "Proyectos");
    await expect(dialog).toBeVisible();
    const heading = dialog.getByRole("heading", { level: 2 });
    const footer = dialog.getByRole("link", { name: /^Sección siguiente/ });

    const measure = async () => {
      const top = (await heading.boundingBox())?.y ?? Number.NaN;
      const link = await footer.boundingBox();
      const frame = await page.getByTestId("panel-content").evaluate((element) => {
        const box = element.parentElement?.parentElement?.getBoundingClientRect();
        return box === undefined
          ? null
          : { x: box.x, y: box.y, width: box.width, height: box.height };
      });
      return { top, bottom: (link?.y ?? Number.NaN) + (link?.height ?? 0), frame };
    };

    const { top, bottom, frame } = await measure();
    expect(frame).not.toBeNull();
    expect(frame?.width).toBeLessThanOrEqual(760);
    expect(frame?.height).toBeLessThanOrEqual(Math.min(720 * 0.86, 900) + 1);
    expect(frame?.y).toBeGreaterThanOrEqual(0);
    expect((frame?.y ?? 0) + (frame?.height ?? 0)).toBeLessThanOrEqual(720);
    expect(top).toBeGreaterThan(frame?.y ?? 0);
    expect(bottom).toBeLessThanOrEqual((frame?.y ?? 0) + (frame?.height ?? 0));
  });

  test("VIS-AC04: every focusable element of a panel shows a focus ring, in ink or in the aura color", async ({
    page,
  }) => {
    await page.goto("/es/contact/");
    const dialog = panel(page, "Contacto");
    await expect(dialog).toBeVisible();
    const colors = new Set<string>();

    // The tour ends when Tab comes back to an element already visited.
    for (let presses = 0; presses < 60; presses += 1) {
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(() => {
        const element = document.activeElement;
        if (element === null || element === document.body) return "outside";
        if (element.hasAttribute("data-focus-visited")) return "visited";
        element.setAttribute("data-focus-visited", "");
        const style = getComputedStyle(element);
        return {
          name: [element.tagName, element.textContent.trim().slice(0, 30)].join(" "),
          isInside: document.querySelector("dialog[data-phase]")?.contains(element) === true,
          width: Number.parseFloat(style.outlineWidth),
          style: style.outlineStyle,
          color: style.outlineColor,
        };
      });
      if (focused === "visited") break;
      if (focused === "outside") continue;
      expect(focused.isInside, focused.name).toBe(true);
      expect(focused.width, focused.name).toBeGreaterThanOrEqual(2);
      expect(focused.style, focused.name).toBe("solid");
      colors.add(focused.color);
    }

    // Ink on the light screen of the panel, the aura on the dark plate of the bar.
    expect([...colors].sort()).toEqual(["rgb(21, 23, 26)", "rgb(255, 197, 61)"]);
  });

  test("VIS-AC07: body text in a panel measures 16 px or more, and no visible text less than 12 px", async ({
    page,
  }) => {
    await page.goto("/es/projects/");
    const dialog = panel(page, "Proyectos");
    await expect(dialog).toBeVisible();

    const sizes = await dialog.evaluate((element) => {
      const texts = [...element.querySelectorAll("*")].filter((node) =>
        [...node.childNodes].some(
          (child) => child.nodeType === Node.TEXT_NODE && (child.textContent ?? "").trim() !== "",
        ),
      );
      const size = (node: Element) => Number.parseFloat(getComputedStyle(node).fontSize);
      return {
        smallest: Math.min(...texts.map(size)),
        body: [...element.querySelectorAll("[data-testid=panel-content] li")].map(size),
      };
    });
    expect(sizes.smallest).toBeGreaterThanOrEqual(12);
    expect(sizes.body.length).toBeGreaterThan(3);
    expect(Math.min(...sizes.body)).toBeGreaterThanOrEqual(16);
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("PNL-AC14: opening, changing section and closing use no transform and nothing longer than 150 ms", async ({
      page,
    }) => {
      await page.goto("/es/");
      /** Animations in course inside the dialog: their longest duration and whether one moves it. */
      const animations = () =>
        page.locator("dialog[data-phase]").evaluate((element) => {
          const running = element.getAnimations({ subtree: true });
          return {
            longest: Math.max(
              0,
              ...running.map((animation) => Number(animation.effect?.getComputedTiming().duration)),
            ),
            moves: running.some((animation) =>
              (animation.effect as KeyframeEffect)
                .getKeyframes()
                .some((frame) => "transform" in frame),
            ),
          };
        });

      await zone(page, "SSD NVMe: Proyectos").click();
      expect(await animations()).toMatchObject({ moves: false });
      expect((await animations()).longest).toBeLessThanOrEqual(150);
      await expect(panel(page, "Proyectos")).toHaveAttribute("data-phase", "open");

      await page.getByRole("link", { name: "Sección siguiente: Stack tecnológico" }).click();
      expect(await animations()).toEqual({ longest: 0, moves: false });
      await expect(panel(page, "Stack tecnológico")).toHaveAttribute("data-phase", "open");

      await page.getByRole("button", { name: "Cerrar" }).click();
      expect(await animations()).toMatchObject({ moves: false });
      expect((await animations()).longest).toBeLessThanOrEqual(150);
      await expectClosed(page);
    });
  });
});

test.describe("panel at full HD", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "viewports other than desktop and mobile run only in Chromium (TST-R22)",
  );
  test.use({ viewport: VIEWPORTS["desktop-hd"] });

  test("VIS-AC10: at 1920×1080 px the frame keeps its maximum width and height", async ({
    page,
  }) => {
    await page.goto("/es/projects/");
    await expect(panel(page, "Proyectos")).toBeVisible();

    const frame = await page.getByTestId("panel-content").evaluate((element) => {
      const box = element.parentElement?.parentElement?.getBoundingClientRect();
      return box === undefined ? null : { y: box.y, width: box.width, height: box.height };
    });
    expect(frame?.width).toBe(760);
    expect(frame?.height).toBeLessThanOrEqual(900);
    expect(frame?.y).toBeGreaterThanOrEqual(0);
    await expect(page.getByRole("link", { name: /^Sección siguiente/ })).toBeInViewport();
  });
});
