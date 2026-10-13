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

  it("PSU-AC03: shows the stack and the private repository of the freelance job", () => {
    render(<ExperienceSection locale="es" idScope="" />);
    const [, freelance] = screen.getAllByRole("article");
    expect(freelance).toBeDefined();
    if (freelance === undefined) return;
    expect(within(freelance).getByRole("heading", { level: 4 })).toHaveTextContent(
      "Desarrollador freelance",
    );
    for (const chip of ["Python", "Selenium", "Repositorio privado"]) {
      expect(within(freelance).getByText(chip)).toBeInTheDocument();
    }
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
