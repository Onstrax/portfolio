import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PROJECT_IDS } from "../types";
import { ProjectsSection } from "./projects-section";

function articlesUnder(title: string): readonly HTMLElement[] {
  const block = screen.getByRole("heading", { level: 3, name: title }).parentElement;
  return block === null ? [] : within(block).queryAllByRole("article");
}

function article(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (element === null) throw new Error(`No article with id "${id}"`);
  return element;
}

describe("ProjectsSection", () => {
  it("SSD-AC04: renders four featured and seven compact projects, each with its anchor", () => {
    render(<ProjectsSection locale="es" idScope="" />);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Destacados",
      "Más proyectos",
    ]);
    expect(articlesUnder("Destacados")).toHaveLength(4);
    expect(articlesUnder("Más proyectos")).toHaveLength(7);
    expect(screen.getAllByRole("article").map((item) => item.id)).toEqual(
      PROJECT_IDS.map((id) => `projects-${id}`),
    );
  });

  it("SSD-AC04: prefixes the anchors with the scope it receives", () => {
    render(<ProjectsSection locale="en" idScope="panel-" />);
    expect(screen.getAllByRole("article").map((item) => item.id)).toEqual(
      PROJECT_IDS.map((id) => `panel-projects-${id}`),
    );
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Featured",
      "More projects",
    ]);
  });

  it("SSD-AC05: states the team of each project in the language of the page", () => {
    const spanish = render(<ProjectsSection locale="es" idScope="" />);
    expect(within(article("projects-andespace")).getByText("Equipo de 6")).toBeInTheDocument();
    expect(
      within(article("projects-habicapital")).getByText("Trabajo individual"),
    ).toBeInTheDocument();
    spanish.unmount();

    render(<ProjectsSection locale="en" idScope="" />);
    expect(within(article("projects-andespace")).getByText("Team of 6")).toBeInTheDocument();
    expect(
      within(article("projects-habicapital")).getByText("Individual work"),
    ).toBeInTheDocument();
  });

  it("SSD-AC05: labels the four private repositories and links none of them", () => {
    render(<ProjectsSection locale="es" idScope="" />);
    const privateProjects = screen
      .getAllByRole("article")
      .filter((item) => within(item).queryByText("Repositorio privado") !== null);
    expect(privateProjects.map((item) => item.id)).toEqual([
      "projects-dental-site",
      "projects-monitoring-platform",
      "projects-dogspa",
      "projects-algorithms",
    ]);
    for (const project of privateProjects) {
      const repositories = within(project)
        .queryAllByRole("link")
        .filter((link) => link.getAttribute("href")?.includes("github.com") === true);
      expect(repositories, project.id).toEqual([]);
    }
  });

  it("SSD-AC06: renders twelve external links that open safely in a new tab", () => {
    render(<ProjectsSection locale="en" idScope="" />);
    const links = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.startsWith("https://") === true);
    expect(links).toHaveLength(12);
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("SSD-AC06: tells apart the two links called Backend by the name of their project", () => {
    render(<ProjectsSection locale="en" idScope="" />);
    const names = screen.getAllByRole("link", { name: /^Backend/ }).map((link) => link.textContent);
    expect(names).toHaveLength(2);
    expect(names[0]).toContain("AndeSpace");
    expect(names[1]).toContain("AhorrApp");
    expect(new Set(names).size).toBe(2);
  });

  it("shows the name, the tagline and the award of a project", () => {
    render(<ProjectsSection locale="es" idScope="" />);
    const habicapital = within(article("projects-habicapital"));
    expect(habicapital.getByRole("heading", { level: 4 })).toHaveTextContent("HabiCapital");
    expect(habicapital.getByText("Simulación de banca digital segura")).toBeInTheDocument();
    expect(
      within(article("projects-andespace")).getByText(
        "Mejor proyecto de su sección · Construcción de Aplicaciones Móviles",
      ),
    ).toBeInTheDocument();
    expect(
      within(article("projects-thesis")).getByText("Asesorada en la Universidad de los Andes."),
    ).toBeInTheDocument();
  });

  it("SSD-AC13: emphasizes exactly the three results of the spec", () => {
    const spanish = render(<ProjectsSection locale="es" idScope="" />);
    const emphasized = (container: HTMLElement) =>
      [...container.querySelectorAll("strong")].map((element) => [
        element.closest("article")?.id,
        element.textContent,
      ]);
    expect(emphasized(spanish.container)).toEqual([
      ["projects-thesis", "resistente a ataques cuánticos"],
      ["projects-habicapital", "~94\u00a0% de cobertura reportada"],
      ["projects-dental-site", "~2-3 nuevos clientes al mes"],
    ]);
    spanish.unmount();
    const english = render(<ProjectsSection locale="en" idScope="" />);
    expect(emphasized(english.container)).toEqual([
      ["projects-thesis", "quantum-resistant"],
      ["projects-habicapital", "~94% reported code coverage"],
      ["projects-dental-site", "2-3 new clients per month"],
    ]);
  });

  it("SSD-AC12: links the three case studies from their cards, and no other card", () => {
    for (const [locale, name] of [
      ["es", "Leer el caso completo"],
      ["en", "Read the full case study"],
    ] as const) {
      const view = render(<ProjectsSection locale={locale} idScope="" />);
      const links = screen.getAllByRole("link", { name });
      expect(links.map((link) => [link.closest("article")?.id, link.getAttribute("href")])).toEqual(
        [
          ["projects-thesis", `/${locale}/projects/thesis/`],
          ["projects-andespace", `/${locale}/projects/andespace/`],
          ["projects-dental-site", `/${locale}/projects/dental-site/`],
        ],
      );
      for (const link of links) {
        expect(link).not.toHaveAttribute("target");
      }
      view.unmount();
    }
  });
});
