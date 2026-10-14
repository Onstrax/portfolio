import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExperienceSection } from "./experience-section";

const NBSP = " ";

describe("ExperienceSection", () => {
  it("PSU-AC03: renders the three blocks and one article per job, with its period", () => {
    const { container } = render(<ExperienceSection locale="es" idScope="" />);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Experiencia laboral",
      "Competencias interpersonales",
      "Liderazgo",
    ]);
    const jobs = screen.getAllByRole("article");
    expect(jobs).toHaveLength(3);
    expect(jobs.map((job) => job.querySelector("p")?.textContent)).toEqual([
      `Universidad de los Andes · Ene. 2026${NBSP}– actualidad`,
      `Jul. 2024${NBSP}– ene. 2025`,
      `Ene. 2022${NBSP}– actualidad`,
    ]);
    expect(container.textContent).toContain(`2022${NBSP}– 2024`);
  });

  it("PSU-AC03: says that every job was individual work, in each language", () => {
    const spanish = render(<ExperienceSection locale="es" idScope="" />);
    for (const job of screen.getAllByRole("article")) {
      expect(within(job).getByText("Trabajo individual")).toBeInTheDocument();
    }
    spanish.unmount();

    render(<ExperienceSection locale="en" idScope="" />);
    for (const job of screen.getAllByRole("article")) {
      expect(within(job).getByText("Individual work")).toBeInTheDocument();
    }
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Work experience",
      "Interpersonal skills",
      "Leadership",
    ]);
  });

  it("PSU-AC03: shows the stack of the freelance job", () => {
    render(<ExperienceSection locale="es" idScope="" />);
    const [, freelance] = screen.getAllByRole("article");
    expect(freelance).toBeDefined();
    if (freelance === undefined) return;
    expect(within(freelance).getByRole("heading", { level: 4 })).toHaveTextContent(
      "Desarrollador freelance",
    );
    for (const chip of ["Python", "Selenium"]) {
      expect(within(freelance).getByText(chip)).toBeInTheDocument();
    }
  });

  it("PSU-AC08: links the hotel automation to its public repository, with no private chip", () => {
    for (const [locale, name] of [
      ["es", /^Ver el repositorio/],
      ["en", /^See the repository/],
    ] as const) {
      const view = render(<ExperienceSection locale={locale} idScope="" />);
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("href", "https://github.com/PortafolioSor0/All-Inclusive");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(screen.queryByText("Repositorio privado")).not.toBeInTheDocument();
      expect(screen.queryByText("Private repository")).not.toBeInTheDocument();
      view.unmount();
    }
  });

  it("PSU-AC09: emphasizes exactly the three figures of the jobs", () => {
    const spanish = render(<ExperienceSection locale="es" idScope="" />);
    expect([...spanish.container.querySelectorAll("strong")].map((s) => s.textContent)).toEqual([
      "~30 estudiantes",
      "un proceso semanal a aproximadamente un día",
      "~20 estudiantes",
    ]);
    spanish.unmount();
    const english = render(<ExperienceSection locale="en" idScope="" />);
    expect([...english.container.querySelectorAll("strong")].map((s) => s.textContent)).toEqual([
      "~30 students",
      "approximately one week of repetitive work to one day",
      "~20 students",
    ]);
  });

  it("PSU-AC04: links the dental site to its project", () => {
    render(<ExperienceSection locale="es" idScope="" />);
    expect(screen.getByRole("link", { name: "Ver el proyecto" })).toHaveAttribute(
      "href",
      "/es/projects/#projects-dental-site",
    );
  });

  it("lists the six interpersonal skills", () => {
    render(<ExperienceSection locale="en" idScope="" />);
    const skills = screen.getByRole("heading", { name: "Interpersonal skills" }).parentElement;
    expect(skills?.querySelectorAll("li")).toHaveLength(6);
  });
});
