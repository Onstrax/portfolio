import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExperienceSection } from "./experience-section";

const NBSP = " ";

describe("ExperienceSection", () => {
  it("PSU-AC03: renders the three blocks and one article per job, with its period", () => {
    const { container } = render(<ExperienceSection locale="es" idScope="" view="simple" />);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Experiencia laboral",
      "Competencias interpersonales",
      "Liderazgo",
    ]);
    const jobs = screen.getAllByRole("article");
    expect(jobs).toHaveLength(3);
    expect(jobs.map((job) => job.querySelector("p")?.textContent)).toEqual([
      `Jul. 2024${NBSP}– actualidad`,
      `Universidad de los Andes · Ene.${NBSP}– dic. 2026`,
      `Ene. 2022${NBSP}– dic. 2026`,
    ]);
    expect(container.textContent).toContain(`2022${NBSP}– 2024`);
  });

  it("PSU-AC03: says that every job was individual work, in each language", () => {
    const spanish = render(<ExperienceSection locale="es" idScope="" view="simple" />);
    for (const job of screen.getAllByRole("article")) {
      expect(within(job).getByText("Trabajo individual")).toBeInTheDocument();
    }
    spanish.unmount();

    render(<ExperienceSection locale="en" idScope="" view="simple" />);
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
    render(<ExperienceSection locale="es" idScope="" view="simple" />);
    const [freelance] = screen.getAllByRole("article");
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
      const view = render(<ExperienceSection locale={locale} idScope="" view="simple" />);
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("href", "https://github.com/PortafolioSor0/All-Inclusive");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(screen.queryByText("Repositorio privado")).not.toBeInTheDocument();
      expect(screen.queryByText("Private repository")).not.toBeInTheDocument();
      view.unmount();
    }
  });

  it("PSU-AC09: emphasizes exactly the four figures of the jobs", () => {
    const spanish = render(<ExperienceSection locale="es" idScope="" view="simple" />);
    expect([...spanish.container.querySelectorAll("strong")].map((s) => s.textContent)).toEqual([
      "un proceso semanal a aproximadamente un día",
      "~2-3 nuevos clientes al mes",
      "~60 estudiantes",
      "~20 estudiantes",
    ]);
    spanish.unmount();
    const english = render(<ExperienceSection locale="en" idScope="" view="simple" />);
    expect([...english.container.querySelectorAll("strong")].map((s) => s.textContent)).toEqual([
      "a weekly process to approximately one day",
      "~2-3 new clients per month",
      "~60 students",
      "~20 students",
    ]);
  });

  it("PSU-AC04: links the dental site to its project, without leaving the view", () => {
    const panel = render(<ExperienceSection locale="es" idScope="panel-" view="interactive" />);
    expect(screen.getByRole("link", { name: "Ver el proyecto" })).toHaveAttribute(
      "href",
      "/es/projects/#projects-dental-site",
    );
    panel.unmount();
    render(<ExperienceSection locale="es" idScope="" view="simple" />);
    expect(screen.getByRole("link", { name: "Ver el proyecto" })).toHaveAttribute(
      "href",
      "#projects-dental-site",
    );
  });

  it("lists the eight interpersonal skills, in the order of the résumé", () => {
    render(<ExperienceSection locale="en" idScope="" view="simple" />);
    const skills = screen.getByRole("heading", { name: "Interpersonal skills" }).parentElement;
    expect([...(skills?.querySelectorAll("li") ?? [])].map((skill) => skill.textContent)).toEqual([
      "Analytical problem-solving",
      "Clear and multicultural communication",
      "Collaboration and leadership",
      "Autonomy and initiative",
      "Attention to detail",
      "Working under pressure",
      "Adaptability and user focus",
      "Mentoring and teaching",
    ]);
  });
});
