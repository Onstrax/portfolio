import { act, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ locale: "es", pathname: "/es/" }));

vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: navigation.locale }),
  usePathname: () => navigation.pathname,
  useRouter: () => ({ back: vi.fn(), replace: vi.fn() }),
}));

import { SECTION_LIST } from "@/features/registry";
import { buildSectionNav } from "@/shared/lib/section-nav";

import { SceneLayer } from "./scene-layer";

const root = document.documentElement;
const SECTIONS = buildSectionNav(SECTION_LIST, "es");

/** Replaces `matchMedia` with a query whose result the test controls. */
function stubViewport(isSceneCapable: boolean) {
  const listeners = new Set<() => void>();
  const state = { matches: isSceneCapable };
  vi.stubGlobal("matchMedia", () => ({
    get matches() {
      return state.matches;
    },
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  }));
  return {
    resize(matches: boolean) {
      state.matches = matches;
      for (const listener of listeners) listener();
    },
  };
}

/** The scene arrives with a dynamic import, which can take a moment the first time. */
function findScene(): Promise<HTMLElement> {
  return screen.findByTestId("scene-root", undefined, { timeout: 10_000 });
}

function Broken(): never {
  throw new Error("The scene layer broke on purpose");
}

beforeEach(() => {
  navigation.pathname = "/es/";
  // jsdom does not implement the methods of `<dialog>`: these do what the tests need of them.
  const open = function (this: HTMLDialogElement): void {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.show = open;
  HTMLDialogElement.prototype.showModal = open;
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement): void {
    this.removeAttribute("open");
  };
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
  for (const name of ["data-mode", "data-boot", "data-app", "data-scene"]) {
    root.removeAttribute(name);
  }
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("SceneLayer", () => {
  it("SYS-AC19: tells the pre-paint script that the application has started", () => {
    stubViewport(false);
    render(<SceneLayer sections={SECTIONS}>{null}</SceneLayer>);
    expect(root.dataset["app"]).toBe("ready");
  });

  it("SYS-AC05: in a viewport that can show it, writes the scene mode and loads the scene", async () => {
    stubViewport(true);
    render(<SceneLayer sections={SECTIONS}>{null}</SceneLayer>);

    expect(root.dataset["mode"]).toBe("scene");
    expect(await findScene()).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "SSD NVMe: Proyectos" })).toBeInTheDocument();
  });

  it("SYS-AC17: in simple mode renders nothing, not even the content of the page", () => {
    stubViewport(false);
    const { container } = render(
      <SceneLayer sections={SECTIONS}>
        <p>Contenido de la sección</p>
      </SceneLayer>,
    );
    expect(root.dataset["mode"]).toBe("simple");
    expect(container).toBeEmptyDOMElement();
  });

  it("SYS-AC17: on the server renders nothing", () => {
    stubViewport(true);
    const html = renderToString(
      <SceneLayer sections={SECTIONS}>
        <p>Contenido de la sección</p>
      </SceneLayer>,
    );
    expect(html).toBe("");
  });

  it("SYS-AC07: follows the viewport across the threshold without reloading, both ways", async () => {
    const viewport = stubViewport(true);
    const { container } = render(<SceneLayer sections={SECTIONS}>{null}</SceneLayer>);
    await findScene();

    act(() => {
      viewport.resize(false);
    });
    expect(root.dataset["mode"]).toBe("simple");
    expect(container).toBeEmptyDOMElement();

    act(() => {
      viewport.resize(true);
    });
    expect(root.dataset["mode"]).toBe("scene");
    expect(await findScene()).toBeInTheDocument();
  });

  it("QLT-AC22: when a component of the layer throws, the page is left in the simple view", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const viewport = stubViewport(true);
    // The content of a section is drawn by the panel: a section that throws breaks the layer.
    navigation.pathname = "/es/projects/";
    const { container } = render(
      <SceneLayer sections={SECTIONS}>
        <Broken />
      </SceneLayer>,
    );

    await vi.waitFor(() => {
      expect(root.dataset["mode"]).toBe("simple");
    });
    expect(container).toBeEmptyDOMElement();

    // The viewport still allows the scene, but a layer that failed is not tried again.
    act(() => {
      viewport.resize(true);
    });
    expect(root.dataset["mode"]).toBe("simple");
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the content of a section inside the detail panel", async () => {
    stubViewport(true);
    navigation.pathname = "/es/projects/";
    render(
      <SceneLayer sections={SECTIONS}>
        <p>Simulación de banca digital segura</p>
      </SceneLayer>,
    );

    const panel = await screen.findByRole("dialog", { name: "Proyectos" }, { timeout: 10_000 });
    expect(panel).toHaveTextContent("Simulación de banca digital segura");
  });

  it("marks the boot sequence as done when a client navigation lost what the script wrote", () => {
    stubViewport(true);
    render(<SceneLayer sections={SECTIONS}>{null}</SceneLayer>);
    expect(root.dataset["boot"]).toBe("done");
  });

  it("keeps the state of the boot sequence that the pre-paint script wrote", () => {
    stubViewport(true);
    root.dataset["boot"] = "play";
    render(<SceneLayer sections={SECTIONS}>{null}</SceneLayer>);
    expect(root.dataset["boot"]).toBe("play");
  });
});
