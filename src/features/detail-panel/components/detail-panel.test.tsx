import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Link from "next/link";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({
  locale: "es",
  pathname: "/es/",
  back: vi.fn<() => void>(),
  replace: vi.fn<(href: string) => void>(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: navigation.locale }),
  usePathname: () => navigation.pathname,
  useRouter: () => ({ back: navigation.back, replace: navigation.replace }),
}));

import { SECTION_LIST } from "@/features/registry";
import { buildSectionNav } from "@/shared/lib/section-nav";
import { useSessionStore } from "@/shared/state/session-store";

import { DetailPanel } from "./detail-panel";

const SECTIONS = buildSectionNav(SECTION_LIST, "es");

function renderPanel(pathname: string, content = "Contenido de la sección") {
  navigation.pathname = pathname;
  const view = render(<DetailPanel sections={SECTIONS}>{content}</DetailPanel>);
  return {
    ...view,
    /** Navigates on the client: the panel stays mounted and receives the new page. */
    navigate: (next: string, nextContent = "") => {
      navigation.pathname = next;
      view.rerender(<DetailPanel sections={SECTIONS}>{nextContent}</DetailPanel>);
    },
  };
}

function dialog(): HTMLDialogElement {
  const element = document.querySelector("dialog");
  if (element === null) throw new Error("The panel rendered no dialog");
  return element;
}

/** Lets the phases that only wait for their animations run to their end. */
async function settle(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

/** jsdom does not implement the methods of `<dialog>`: these do what the tests need of them. */
function stubDialogMethods(): void {
  const open = function (this: HTMLDialogElement): void {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.show = open;
  HTMLDialogElement.prototype.showModal = open;
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement): void {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}

beforeEach(() => {
  stubDialogMethods();
  navigation.locale = "es";
  navigation.back.mockReset();
  navigation.replace.mockReset();
  window.location.hash = "";
  useSessionStore.setState({ visited: [], bootSeen: false, hasHydrated: true });
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
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
});

describe("DetailPanel", () => {
  it("is closed on the home page", () => {
    renderPanel("/es/");
    expect(dialog().open).toBe(false);
    expect(dialog()).toHaveAttribute("data-phase", "closed");
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("PNL-AC01: a section in the route opens a modal named after it, with its piece and its content", () => {
    renderPanel("/es/projects/", "Simulación de banca digital segura");
    const panel = screen.getByRole("dialog", { name: "Proyectos" });

    expect(dialog().open).toBe(true);
    expect(panel).toHaveAttribute("data-phase", "open");
    const title = within(panel).getByRole("heading", { level: 2, name: "Proyectos" });
    expect(title).toHaveFocus();
    expect(within(panel).getByText("SSD NVMe")).toBeInTheDocument();
    expect(within(panel).getByTestId("panel-content")).toHaveTextContent(
      "Simulación de banca digital segura",
    );
  });

  it("PNL-AC07: previous and next show the title of their section and say where they lead", () => {
    renderPanel("/es/projects/");

    const previous = screen.getByRole("link", { name: "Sección anterior: Experiencia" });
    expect(previous).toHaveTextContent("Experiencia");
    expect(previous).toHaveAttribute("href", "/es/experience/");

    const next = screen.getByRole("link", { name: "Sección siguiente: Stack tecnológico" });
    expect(next).toHaveTextContent("Stack tecnológico");
    expect(next).toHaveAttribute("href", "/es/stack/");
  });

  it("PNL-AC05: shows the position among the seven sections, also for screen readers", () => {
    renderPanel("/es/about/");
    const panel = screen.getByRole("dialog", { name: "Acerca de este sitio" });

    expect(within(panel).getByText("7 / 7")).toHaveAttribute("aria-hidden", "true");
    expect(within(panel).getByText("Sección 7 de 7")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sección siguiente: Perfil" })).toHaveAttribute(
      "href",
      "/es/profile/",
    );
  });

  it("uses the language of the page", () => {
    navigation.locale = "en";
    navigation.pathname = "/en/projects/";
    render(<DetailPanel sections={buildSectionNav(SECTION_LIST, "en")}>{null}</DetailPanel>);

    expect(screen.getByRole("dialog", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Next section: Tech stack" })).toBeInTheDocument();
    expect(screen.getByText("Section 3 of 7")).toBeInTheDocument();
  });

  it("PNL-AC04: after a direct entry, the close button leads to the home, replacing the entry", async () => {
    renderPanel("/es/projects/");
    await userEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    await settle();

    expect(navigation.replace).toHaveBeenCalledWith("/es/");
    expect(navigation.back).not.toHaveBeenCalled();
    expect(dialog().open).toBe(false);
  });

  it("PNL-AC03: a panel opened inside the site closes by going back, whatever was visited in it", async () => {
    const { navigate } = renderPanel("/es/");
    navigate("/es/profile/", "Perfil");
    await settle();
    navigate("/es/experience/", "Experiencia");
    await settle();
    expect(screen.getByRole("dialog", { name: "Experiencia" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    await settle();

    expect(navigation.back).toHaveBeenCalledTimes(1);
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("PNL-AC02: Esc closes the panel through the same exit as the close button", async () => {
    renderPanel("/es/stack/");
    act(() => {
      dialog().dispatchEvent(new Event("cancel", { cancelable: true }));
    });
    await settle();

    expect(navigation.replace).toHaveBeenCalledWith("/es/");
  });

  it("PNL-AC02: a click on the veil closes the panel and a click inside the frame does not", async () => {
    renderPanel("/es/stack/");

    await userEvent.click(screen.getByRole("heading", { level: 2 }));
    await settle();
    expect(navigation.replace).not.toHaveBeenCalled();

    const veil = dialog().querySelector('[data-part="veil"]');
    if (veil === null) throw new Error("The panel has no veil");
    await userEvent.click(veil);
    await settle();
    expect(navigation.replace).toHaveBeenCalledWith("/es/");
  });

  it("SYS-AC09: when the route returns to the home, the panel closes without navigating again", async () => {
    const { navigate } = renderPanel("/es/projects/");
    navigate("/es/");
    await settle();

    expect(dialog().open).toBe(false);
    expect(dialog()).toHaveAttribute("data-phase", "closed");
    expect(navigation.back).not.toHaveBeenCalled();
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("PNL-AC06: changing section keeps the dialog and moves the focus to the new title", async () => {
    const { navigate } = renderPanel("/es/profile/", "Perfil");
    const node = dialog();

    navigate("/es/experience/", "Monitor académico");
    await settle();

    expect(dialog()).toBe(node);
    expect(dialog().open).toBe(true);
    const title = screen.getByRole("heading", { level: 2, name: "Experiencia" });
    expect(title).toHaveFocus();
    expect(screen.getByTestId("panel-content")).toHaveTextContent("Monitor académico");
    expect(screen.getByTestId("panel-content").scrollTop).toBe(0);
  });

  it("PNL-AC10: showing a primary section marks it as visited, and the about section does not", async () => {
    const { navigate } = renderPanel("/es/profile/");
    navigate("/es/projects/");
    await settle();
    navigate("/es/about/");
    await settle();
    navigate("/es/profile/");
    await settle();

    expect(useSessionStore.getState().visited).toEqual(["cpu", "ssd"]);
    expect(window.sessionStorage.getItem("portfolio:v1:session")).toBe(
      '{"bootSeen":false,"visited":["cpu","ssd"],"welcomeSeen":false}',
    );
  });

  it("a link of the content to another section moves inside the panel, replacing the entry", async () => {
    navigation.pathname = "/es/profile/";
    render(
      <DetailPanel sections={SECTIONS}>
        <Link href="/es/projects/#projects-dental">Ver el proyecto</Link>
        <Link href="/es/cv/">Vista simple</Link>
      </DetailPanel>,
    );

    await userEvent.click(screen.getByRole("link", { name: "Ver el proyecto" }));
    expect(navigation.replace).toHaveBeenCalledWith("/es/projects/#projects-dental");

    navigation.replace.mockReset();
    await userEvent.click(screen.getByRole("link", { name: "Vista simple" }));
    expect(navigation.replace).not.toHaveBeenCalled();
  });
});
