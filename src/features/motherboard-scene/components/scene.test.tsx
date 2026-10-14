import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ locale: "es", pathname: "/es/" }));

vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: navigation.locale }),
  usePathname: () => navigation.pathname,
}));

import { SECTION_LIST } from "@/features/registry";
import { buildSectionNav } from "@/shared/lib/section-nav";
import { usePrefsStore } from "@/shared/state/prefs-store";
import { useSessionStore } from "@/shared/state/session-store";
import { useUiStore } from "@/shared/state/ui-store";

import { Scene } from "./scene";

const root = document.documentElement;
const IDENTITY = {
  name: "Ada Lovelace",
  degree: "Matemáticas",
  focusAreas: ["Análisis", "Máquinas analíticas"],
};

function renderScene(locale: "es" | "en" = "es", pathname = `/${locale}/`) {
  navigation.locale = locale;
  navigation.pathname = pathname;
  const sections = buildSectionNav(SECTION_LIST, locale);
  const view = render(<Scene sections={sections} identity={IDENTITY} />);
  return {
    ...view,
    /** Navigates on the client: the scene stays mounted and only the path changes. */
    navigate: (next: string) => {
      navigation.pathname = next;
      view.rerender(<Scene sections={sections} identity={IDENTITY} />);
    },
  };
}

function zone(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-zone="${id}"]`);
  if (element === null) throw new Error(`Zone ${id} not found`);
  return element;
}

/** Opacity of each part of the aura of a zone, as written in the SVG. */
function aura(id: string) {
  const group = document.querySelector(`[data-aura="${id}"]`);
  const part = (name: string) =>
    Number(group?.querySelector(`[data-part="${name}"]`)?.getAttribute("opacity"));
  return {
    state: group?.getAttribute("data-state"),
    glow: part("glow"),
    fill: part("fill"),
  };
}

function label(name: string): HTMLElement {
  const match = screen
    .getAllByTestId("scene-label")
    .find((candidate) => candidate.textContent.startsWith(name));
  if (match === undefined) throw new Error(`Label ${name} not found`);
  return match;
}

function images(): readonly HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>("img[data-variant]")];
}

// jsdom loads no stylesheet. The welcome, while closed, stays in the page to fade out (M-12) and
// is hidden with the `invisible` class: this rule gives the class its meaning, so that the queries
// by role leave the closed welcome out, as a browser does.
const INVISIBLE_RULE = document.createElement("style");
INVISIBLE_RULE.textContent = ".invisible { visibility: hidden; }";
document.head.append(INVISIBLE_RULE);

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe(): void {
        // jsdom has no layout: there is nothing to observe.
      }
      disconnect(): void {
        // Nothing to release.
      }
    },
  );
  root.dataset["boot"] = "done";
  delete root.dataset["scene"];
  usePrefsStore.setState({ sceneVariant: "photo", hasHydrated: false });
  // The welcome is closed unless a test is about it: its controls are links and buttons too.
  useSessionStore.setState({ visited: [], bootSeen: false, welcomeSeen: true, hasHydrated: true });
  useUiStore.setState({ settingsOpen: false });
  performance.clearMarks();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe("Scene: structure", () => {
  it("SCN-AC05: has seven links and a button, named after piece and section, in canonical order", () => {
    renderScene();
    const main = screen.getByRole("main");

    const links = within(main).getAllByRole("link");
    expect(links.map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      ["Procesador (CPU): Perfil", "/es/profile/"],
      ["Fuente de poder (PSU): Experiencia", "/es/experience/"],
      ["SSD NVMe: Proyectos", "/es/projects/"],
      ["Memoria RAM: Stack tecnológico", "/es/stack/"],
      ["Panel I/O: Contacto", "/es/contact/"],
      ["Ventilador ARGB: Ecosistema personal", "/es/ecosystem/"],
      ["Pila CMOS: Acerca de este sitio", "/es/about/"],
    ]);

    const button = within(main).getByRole("button", { name: "Panel frontal: Ajustes" });
    expect(button).toHaveAttribute("aria-haspopup", "dialog");
    expect(links.at(-1)?.compareDocumentPosition(button)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("names the zones in the language of the page", () => {
    renderScene("en");
    expect(screen.getByRole("link", { name: "Processor (CPU): Profile" })).toHaveAttribute(
      "href",
      "/en/profile/",
    );
    expect(screen.getByRole("button", { name: "Front panel: Settings" })).toBeInTheDocument();
  });

  it("has a single heading, the title of the page for screen readers", () => {
    renderScene();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Juan Esteban Álvarez García: portfolio interactivo",
    );
    expect(screen.getAllByRole("heading")).toHaveLength(1);
  });

  it("SCN-AC16: the image has an empty alt, and the drawings and labels are hidden from assistive technology", () => {
    renderScene();

    const [image, ...others] = images();
    expect(others).toEqual([]);
    expect(image).toHaveAttribute("alt", "");
    expect(image).toHaveAttribute("width", "3840");
    expect(image).toHaveAttribute("height", "2160");
    expect(image).toHaveAttribute("decoding", "async");
    expect(image).toHaveAttribute("fetchpriority", "high");

    const drawings = [...document.querySelectorAll("svg")];
    expect(drawings).toHaveLength(2);
    for (const drawing of drawings) expect(drawing).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("scene-auras")).toHaveAttribute("viewBox", "0 0 1600 900");

    const labels = screen.getAllByTestId("scene-label");
    expect(labels).toHaveLength(9);
    for (const candidate of labels) expect(candidate).toHaveAttribute("aria-hidden", "true");
  });

  it("gives the image no address of its own, so that no browser downloads a format before choosing", () => {
    renderScene();
    expect(images()[0]).not.toHaveAttribute("src");
    expect(images()[0]).not.toHaveAttribute("srcset");
  });

  it("offers the image in AVIF, WebP and JPEG, in that order, with the three widths", () => {
    renderScene();
    const picture = images()[0]?.parentElement;
    const sources = [...(picture?.querySelectorAll("source") ?? [])];

    expect(sources.map((source) => source.getAttribute("type"))).toEqual([
      "image/avif",
      "image/webp",
      "image/jpeg",
    ]);
    expect(sources[0]).toHaveAttribute(
      "srcset",
      [
        "/scene/scene-1920.dc169b385cc7.avif 1920w",
        "/scene/scene-2560.dc169b385cc7.avif 2560w",
        "/scene/scene-3840.dc169b385cc7.avif 3840w",
      ].join(", "),
    );
    expect(sources[2]).toHaveAttribute(
      "srcset",
      [
        "/scene/scene-1920.dc169b385cc7.jpg 1920w",
        "/scene/scene-2560.dc169b385cc7.jpg 2560w",
        "/scene/scene-3840.dc169b385cc7.jpg 3840w",
      ].join(", "),
    );
    for (const source of sources) {
      expect(source).toHaveAttribute("sizes", "min(100vw, 177.78vh)");
    }
  });

  it("places every zone on its hit area, cut to its shape", () => {
    renderScene();
    expect(zone("ssd").style.left).toBe("43.875%");
    expect(zone("ssd").style.top).toBe("54.444%");
    expect(zone("ssd").style.width).toBe("11.688%");
    expect(zone("ssd").style.height).toBe("7.667%");
    expect(zone("ssd").style.clipPath).toBe("polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)");
    expect(zone("cpu").style.clipPath).toBe(
      "polygon(0% 0%, 100% 0%, 100% 91.463%, 81.481% 100%, 18.519% 100%, 0% 91.463%)",
    );
  });

  it("marks the zone whose section is open as the current page", () => {
    renderScene("es", "/es/projects/");
    expect(zone("ssd")).toHaveAttribute("aria-current", "page");
    expect(zone("cpu")).not.toHaveAttribute("aria-current");
  });
});

describe("Scene: auras", () => {
  it("VIS-AC11: a primary and a secondary zone at rest have the opacities of the table", () => {
    renderScene();
    expect(aura("cpu")).toEqual({ state: "rest", glow: 0.5, fill: 0.08 });
    expect(aura("cmos")).toEqual({ state: "rest", glow: 0.42, fill: 0.08 });
    expect(aura("settings")).toEqual({ state: "rest", glow: 0.42, fill: 0.08 });
  });

  it("VIS-AC11: under the pointer they take the hover opacities", () => {
    renderScene();
    fireEvent.pointerEnter(zone("cpu"));
    expect(aura("cpu")).toEqual({ state: "hover", glow: 1, fill: 0.14 });
    expect(aura("psu").state).toBe("rest");

    fireEvent.pointerEnter(zone("cmos"));
    expect(aura("cmos")).toEqual({ state: "hover", glow: 0.9, fill: 0.14 });
  });

  it("VIS-AC11: with their section or menu open they take the active opacities", () => {
    renderScene("es", "/es/profile/");
    expect(aura("cpu")).toEqual({ state: "active", glow: 1, fill: 0.14 });

    act(() => {
      useUiStore.getState().openSettings();
    });
    expect(aura("settings")).toEqual({ state: "active", glow: 0.9, fill: 0.14 });
  });

  it("draws the aura as a halo around the piece, without any outline", () => {
    renderScene();
    const group = document.querySelector('[data-aura="psu"]');
    const shapes = [...(group?.querySelectorAll("polygon") ?? [])];

    expect(shapes).toHaveLength(2);
    for (const shape of shapes) expect(shape).not.toHaveAttribute("stroke-width");
    expect(group?.querySelector('[data-part="stroke"]')).toBeNull();

    // The halo is the blurred silhouette minus the piece itself.
    const filter = group?.querySelector("filter");
    expect(
      [...(filter?.querySelectorAll("feGaussianBlur") ?? [])].map((blur) =>
        blur.getAttribute("stdDeviation"),
      ),
    ).toEqual(["18", "6", "1.5"]);
    expect(filter?.querySelector("feComposite")).toHaveAttribute("operator", "out");
    expect(group?.querySelector('[data-part="glow"] polygon')).toHaveAttribute(
      "filter",
      "url(#scene-aura-halo-psu)",
    );
  });

  it("gives the halo of every zone room to fade out before its filter ends", () => {
    renderScene();
    const filter = document.querySelector('[data-aura="cmos"] filter');
    expect(filter).toHaveAttribute("filterUnits", "userSpaceOnUse");
    expect(["x", "y", "width", "height"].map((name) => filter?.getAttribute(name))).toEqual([
      "553",
      "400",
      "156",
      "157",
    ]);
  });

  it("draws one aura per interactive zone and none for the diagnostic display", () => {
    renderScene();
    expect(
      [...document.querySelectorAll("[data-aura]")].map((group) => group.getAttribute("data-aura")),
    ).toEqual(["cpu", "psu", "ssd", "ram", "io", "fan", "cmos", "settings"]);
  });

  it("SCN-AC07: keyboard focus lights the aura, shows the label and draws the focus rectangle", async () => {
    renderScene();
    await userEvent.tab();

    expect(zone("cpu")).toHaveFocus();
    expect(aura("cpu")).toMatchObject({ state: "hover", glow: 1 });
    expect(label("Procesador (CPU)")).toHaveAttribute("data-visible", "true");
    expect(label("Procesador (CPU)")).toHaveTextContent("Procesador (CPU)Perfil");

    const ring = document.querySelector('[data-aura="cpu"] [data-part="focus-ring"]');
    expect(ring).toHaveAttribute("x", "760");
    expect(ring).toHaveAttribute("y", "292");
    expect(ring).toHaveAttribute("width", "116");
    expect(ring).toHaveAttribute("height", "172");
    expect(ring).toHaveAttribute("vector-effect", "non-scaling-stroke");

    await userEvent.tab();
    expect(zone("psu")).toHaveFocus();
    expect(document.querySelector('[data-aura="cpu"] [data-part="focus-ring"]')).toBeNull();
    expect(aura("cpu").state).toBe("rest");
    expect(label("Procesador (CPU)")).toHaveAttribute("data-visible", "false");
  });

  it("SCN-AC07: the label of the focused zone is in the language of the page", async () => {
    renderScene("en");
    await userEvent.tab();
    expect(label("Processor (CPU)")).toHaveAttribute("data-visible", "true");
    expect(label("Processor (CPU)")).toHaveTextContent("Processor (CPU)Profile");
  });
});

describe("Scene: labels", () => {
  it("SCN-AC08: follows the pointer from the zone to its label and hides 150 ms after it leaves", () => {
    vi.useFakeTimers();
    renderScene();
    const plate = label("SSD NVMe");
    expect(plate).toHaveAttribute("data-visible", "false");

    fireEvent.pointerEnter(zone("ssd"));
    expect(plate).toHaveAttribute("data-visible", "true");

    fireEvent.pointerLeave(zone("ssd"));
    act(() => {
      vi.advanceTimersByTime(100);
    });
    fireEvent.pointerEnter(plate);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(plate).toHaveAttribute("data-visible", "true");

    fireEvent.pointerLeave(plate);
    act(() => {
      vi.advanceTimersByTime(149);
    });
    expect(plate).toHaveAttribute("data-visible", "true");
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(plate).toHaveAttribute("data-visible", "false");
  });

  it("SCN-AC08: Esc hides the label without moving the focus, until the pointer comes back", async () => {
    renderScene();
    await userEvent.tab();
    fireEvent.pointerEnter(zone("ram"));
    expect(label("Memoria RAM")).toHaveAttribute("data-visible", "true");

    await userEvent.keyboard("{Escape}");
    expect(label("Memoria RAM")).toHaveAttribute("data-visible", "false");
    expect(label("Procesador (CPU)")).toHaveAttribute("data-visible", "false");
    expect(zone("cpu")).toHaveFocus();
    expect(aura("ram").state).toBe("hover");

    fireEvent.pointerLeave(zone("ram"));
    fireEvent.pointerEnter(zone("ram"));
    expect(label("Memoria RAM")).toHaveAttribute("data-visible", "true");
  });

  it("names the front panel and the diagnostic display, which shows the progress of the session", () => {
    renderScene();
    expect(label("Panel frontal")).toHaveTextContent("Panel frontalAjustes");

    fireEvent.pointerEnter(zone("post-display"));
    expect(label("Display de diagnóstico")).toHaveAttribute("data-visible", "true");
    expect(label("Display de diagnóstico")).toHaveTextContent("0 de 6 secciones visitadas");
    expect(zone("post-display")).not.toHaveAttribute("tabindex");
  });
});

describe("Scene: diagnostic display", () => {
  it("SCN-AC10: shows the number of primary sections visited and announces it", () => {
    renderScene();
    const display = screen.getByTestId("post-display");
    expect(display).toHaveAttribute("data-value", "00");
    expect(display.querySelectorAll('[data-lit="true"]')).toHaveLength(12);
    expect(screen.getByRole("status")).toHaveTextContent("0 de 6 secciones visitadas");

    act(() => {
      useSessionStore.getState().markVisited("cpu");
      useSessionStore.getState().markVisited("ssd");
      useSessionStore.getState().markVisited("cpu");
    });
    expect(display).toHaveAttribute("data-value", "02");
    expect(display.querySelectorAll('[data-lit="true"]')).toHaveLength(11);
    expect(screen.getByRole("status")).toHaveTextContent("2 de 6 secciones visitadas");
  });

  it("draws unlit segments at a fraction of the opacity of the lit ones", () => {
    renderScene();
    const display = screen.getByTestId("post-display");
    const segments = [...display.querySelectorAll("rect[data-segment]")];
    expect(segments).toHaveLength(14);
    // Under them, the background that hides the segments drawn in the sketch.
    expect(display.querySelector('[data-part="backing"]')).toBe(display.firstElementChild);
    expect(new Set(segments.map((segment) => segment.getAttribute("opacity")))).toEqual(
      new Set(["1", "0.08"]),
    );
  });
});

describe("Scene: identity plate and welcome", () => {
  function welcome(): HTMLElement {
    return screen.getByTestId("scene-welcome");
  }

  beforeEach(() => {
    useSessionStore.setState({ welcomeSeen: false });
  });

  it("SCN-AC21: the plate shows the name, the degree and the focus areas, with nothing to focus", () => {
    renderScene();
    const plate = screen.getByTestId("scene-plate");
    expect([...plate.children].map((line) => line.textContent)).toEqual([
      "Ada Lovelace",
      "Matemáticas",
      "Análisis · Máquinas analíticas",
    ]);
    expect(plate.querySelector("a, button, [tabindex]")).toBeNull();
    expect(within(plate).queryByRole("heading")).toBeNull();
  });

  it("SCN-AC21: the plate comes right after the heading, before everything else of the scene", () => {
    renderScene();
    const stage = screen.getByTestId("scene-root");
    expect(stage.previousElementSibling).toBe(screen.getByRole("heading", { level: 1 }));
    expect(stage.firstElementChild).toBe(screen.getByTestId("scene-plate"));
  });

  it("SCN-AC22: shows the welcome once the session is known, without taking the focus", () => {
    useSessionStore.setState({ hasHydrated: false });
    renderScene();
    expect(welcome()).toHaveAttribute("data-visible", "false");

    act(() => {
      useSessionStore.setState({ hasHydrated: true });
    });
    expect(welcome()).toHaveAttribute("data-visible", "true");
    expect(welcome()).not.toContainElement(document.activeElement as HTMLElement | null);
    expect(within(welcome()).getByRole("heading", { level: 2 })).toHaveTextContent("Sistema listo");
    expect(screen.getByRole("region", { name: "Sistema listo" })).toBe(welcome());
    expect(welcome()).toHaveTextContent("Te doy la bienvenida a mi portfolio.");
    expect(within(welcome()).getByRole("link", { name: "Ver mi perfil" })).toHaveAttribute(
      "href",
      "/es/profile/",
    );
  });

  it("SCN-AC22: comes before the zones in the tab order", () => {
    renderScene();
    const explore = within(welcome()).getByRole("button", { name: "Explorar" });
    expect(
      explore.compareDocumentPosition(zone("cpu")) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("shows no welcome while the boot sequence plays, nor once it has been closed", () => {
    root.dataset["boot"] = "play";
    renderScene();
    expect(welcome()).toHaveAttribute("data-visible", "false");

    act(() => {
      useSessionStore.setState({ welcomeSeen: true });
      root.dataset["boot"] = "done";
    });
    expect(welcome()).toHaveAttribute("data-visible", "false");
  });

  it("SCN-AC23: Explore closes it for the session and moves the focus to the cpu zone", async () => {
    renderScene();
    const explore = within(welcome()).getByRole("button", { name: "Explorar" });
    explore.focus();
    await userEvent.keyboard("{Enter}");

    expect(welcome()).toHaveAttribute("data-visible", "false");
    expect(zone("cpu")).toHaveFocus();
    expect(useSessionStore.getState().welcomeSeen).toBe(true);
  });

  it("SCN-AC23: Esc inside it closes it and moves the focus to the cpu zone", async () => {
    renderScene();
    within(welcome()).getByRole("link", { name: "Ver mi perfil" }).focus();
    await userEvent.keyboard("{Escape}");

    expect(welcome()).toHaveAttribute("data-visible", "false");
    expect(zone("cpu")).toHaveFocus();
    expect(useSessionStore.getState().welcomeSeen).toBe(true);
  });

  it("closed with the pointer while the focus is elsewhere, it leaves the focus where it was", () => {
    renderScene();
    const heading = screen.getByRole("heading", { level: 1 });
    heading.focus();
    fireEvent.click(within(welcome()).getByRole("button", { name: "Explorar" }));

    expect(welcome()).toHaveAttribute("data-visible", "false");
    expect(heading).toHaveFocus();
  });

  it("SCN-AC23: a section opened while it shows closes it, and it does not come back", () => {
    const { navigate } = renderScene();
    navigate("/es/about/");
    expect(welcome()).toHaveAttribute("data-visible", "false");
    expect(useSessionStore.getState().welcomeSeen).toBe(true);

    navigate("/es/");
    expect(welcome()).toHaveAttribute("data-visible", "false");
  });

  it("SCN-AC23: opening the settings menu while it shows closes it", () => {
    renderScene();
    act(() => {
      useUiStore.setState({ settingsOpen: true });
    });
    expect(useSessionStore.getState().welcomeSeen).toBe(true);

    act(() => {
      useUiStore.setState({ settingsOpen: false });
    });
    expect(welcome()).toHaveAttribute("data-visible", "false");
  });

  it("SCN-AC23: a section open from the start puts it off until the section closes", () => {
    const { navigate } = renderScene("es", "/es/projects/");
    expect(welcome()).toHaveAttribute("data-visible", "false");
    expect(useSessionStore.getState().welcomeSeen).toBe(false);

    navigate("/es/");
    expect(welcome()).toHaveAttribute("data-visible", "true");
  });

  it("SCN-AC23: comes back after a session reset", async () => {
    renderScene();
    await userEvent.click(within(welcome()).getByRole("button", { name: "Explorar" }));
    expect(welcome()).toHaveAttribute("data-visible", "false");

    act(() => {
      useSessionStore.getState().reset();
    });
    expect(welcome()).toHaveAttribute("data-visible", "true");
  });

  it("speaks the language of the page", () => {
    renderScene("en");
    expect(screen.getByRole("region", { name: "System ready" })).toHaveTextContent(
      "Welcome to my portfolio.",
    );
    expect(within(welcome()).getByRole("link", { name: "See my profile" })).toHaveAttribute(
      "href",
      "/en/profile/",
    );
  });
});

describe("Scene: behaviour", () => {
  it("the front panel toggles the settings menu and tells whether it is open", async () => {
    renderScene();
    const button = screen.getByRole("button", { name: "Panel frontal: Ajustes" });
    expect(button).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(button);
    expect(useUiStore.getState().settingsOpen).toBe(true);
    expect(button).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(button);
    expect(useUiStore.getState().settingsOpen).toBe(false);
  });

  it("SCN-AC14: when a section closes and the scene has no focus, focuses the piece that opened it", () => {
    const { navigate } = renderScene("es", "/es/projects/");
    expect(document.body).toHaveFocus();

    navigate("/es/");
    expect(zone("ssd")).toHaveFocus();
  });

  it("leaves the focus where it is when it is already in the scene", async () => {
    const { navigate } = renderScene("es", "/es/projects/");
    await userEvent.tab();
    expect(zone("cpu")).toHaveFocus();

    navigate("/es/");
    expect(zone("cpu")).toHaveFocus();
  });

  it("is inert until the boot sequence is done", async () => {
    root.dataset["boot"] = "play";
    renderScene();
    expect(screen.getByRole("main")).toHaveAttribute("inert");

    root.dataset["boot"] = "done";
    await vi.waitFor(() => {
      expect(screen.getByRole("main")).not.toHaveAttribute("inert");
    });
  });

  it("marks scene:ready once, when the image is decoded and the boot sequence is done", async () => {
    root.dataset["boot"] = "play";
    renderScene();
    const [image] = images();
    if (image === undefined) throw new Error("The scene has no image");

    fireEvent.load(image);
    await vi.waitFor(() => {
      expect(image).toHaveAttribute("data-state", "shown");
    });
    expect(performance.getEntriesByName("scene:ready")).toHaveLength(0);

    root.dataset["boot"] = "done";
    await vi.waitFor(() => {
      expect(performance.getEntriesByName("scene:ready")).toHaveLength(1);
    });
  });
});

describe("Scene: variants", () => {
  it("starts with the variant that the pre-paint script wrote, before the store has loaded", () => {
    root.dataset["scene"] = "sketch";
    renderScene();
    expect(images().map((image) => image.getAttribute("data-variant"))).toEqual(["sketch"]);
    expect(images()[0]?.parentElement?.querySelector("source")).toHaveAttribute(
      "srcset",
      expect.stringContaining("/scene/scene-1920.b71cba0939ff.avif 1920w"),
    );
    expect(root.dataset["scene"]).toBe("sketch");
  });

  it("uses the photograph when the document names no valid variant", () => {
    root.dataset["scene"] = "blueprint";
    renderScene();
    expect(images().map((image) => image.getAttribute("data-variant"))).toEqual(["photo"]);
    expect(root.dataset["scene"]).toBe("photo");
  });

  it("SCN-AC18: switching keeps the previous image until the new one is decoded, and nothing else moves", async () => {
    renderScene();
    const [photo] = images();
    if (photo === undefined) throw new Error("The scene has no image");
    fireEvent.load(photo);
    await vi.waitFor(() => {
      expect(photo).toHaveAttribute("data-state", "shown");
    });
    const before = { style: zone("cpu").getAttribute("style"), name: zone("cpu").textContent };

    act(() => {
      usePrefsStore.setState({ sceneVariant: "sketch", hasHydrated: true });
    });
    expect(root.dataset["scene"]).toBe("sketch");
    const sketch = images()[1];
    if (sketch === undefined) throw new Error("The sketch was not requested");
    expect(sketch).toHaveAttribute("data-variant", "sketch");
    expect(sketch).toHaveAttribute("data-state", "pending");
    expect(photo).toHaveAttribute("data-state", "kept");

    fireEvent.load(sketch);
    await vi.waitFor(() => {
      expect(sketch).toHaveAttribute("data-state", "shown");
    });
    expect(photo).toHaveAttribute("data-state", "replaced");
    expect({ style: zone("cpu").getAttribute("style"), name: zone("cpu").textContent }).toEqual(
      before,
    );

    act(() => {
      usePrefsStore.getState().setSceneVariant("photo");
    });
    expect(root.dataset["scene"]).toBe("photo");
    expect(photo).toHaveAttribute("data-state", "shown");
    expect(sketch).toHaveAttribute("data-state", "replaced");
    expect(images()).toHaveLength(2);
  });
});
