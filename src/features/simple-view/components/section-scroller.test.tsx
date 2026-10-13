import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ pathname: "/es/" }));

vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));

import { SectionScroller } from "./section-scroller";

const scrolled: string[] = [];

function page() {
  return (
    <>
      <SectionScroller />
      <section id="projects">
        <h2 id="projects-title" tabIndex={-1}>
          Proyectos
        </h2>
        <article id="projects-habicapital" />
      </section>
    </>
  );
}

beforeEach(() => {
  scrolled.length = 0;
  navigation.pathname = "/es/";
  window.location.hash = "";
  document.documentElement.removeAttribute("data-mode");
  Element.prototype.scrollIntoView = function scrollIntoView(this: Element) {
    scrolled.push(this.id);
  };
});

afterEach(() => {
  document.documentElement.removeAttribute("data-mode");
});

describe("SectionScroller", () => {
  it("renders nothing and does not scroll on the home page", () => {
    const { container } = render(<SectionScroller />);
    expect(container).toBeEmptyDOMElement();
    expect(scrolled).toEqual([]);
  });

  it("scrolls to the section of the URL and focuses its title", () => {
    navigation.pathname = "/es/projects/";
    render(page());
    expect(scrolled).toEqual(["projects"]);
    expect(document.getElementById("projects-title")).toHaveFocus();
  });

  it("scrolls to the fragment when the URL has one, and still focuses the section title", () => {
    navigation.pathname = "/es/projects/";
    window.location.hash = "#projects-habicapital";
    render(page());
    expect(scrolled).toEqual(["projects-habicapital"]);
    expect(document.getElementById("projects-title")).toHaveFocus();
  });

  it("falls back to the section when the fragment names nothing", () => {
    navigation.pathname = "/es/projects/";
    window.location.hash = "#missing";
    render(page());
    expect(scrolled).toEqual(["projects"]);
  });

  it("does nothing while the scene is shown, and scrolls when the page falls back to simple", async () => {
    navigation.pathname = "/es/projects/";
    document.documentElement.setAttribute("data-mode", "scene");
    render(page());
    expect(scrolled).toEqual([]);

    document.documentElement.setAttribute("data-mode", "simple");
    await vi.waitFor(() => {
      expect(scrolled).toEqual(["projects"]);
    });
  });

  it("does not scroll again when the page goes from simple to scene", async () => {
    navigation.pathname = "/es/projects/";
    document.documentElement.setAttribute("data-mode", "simple");
    render(page());
    expect(scrolled).toEqual(["projects"]);

    document.documentElement.setAttribute("data-mode", "scene");
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(scrolled).toEqual(["projects"]);
  });
});
