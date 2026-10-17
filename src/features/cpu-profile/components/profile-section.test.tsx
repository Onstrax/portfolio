import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProfileSection } from "./profile-section";

const NBSP = " ";

function headings(level: number): readonly (string | null)[] {
  return screen.getAllByRole("heading", { level }).map((heading) => heading.textContent);
}

describe("ProfileSection", () => {
  it("CPU-AC03: renders the four blocks, the portrait and the grade in Spanish", () => {
    render(<ProfileSection locale="es" idScope="" />);
    expect(headings(3)).toEqual(["Resumen", "Formación", "Idiomas", "Reconocimientos"]);
    const portrait = screen.getByRole("img", { name: "Juan Esteban Álvarez García" });
    expect(portrait).toHaveAttribute("width", "96");
    expect(portrait).toHaveAttribute("height", "96");
    expect(screen.getByText("Promedio: 4,2/5,0")).toBeInTheDocument();
    expect(screen.queryByText(/Graduación/)).not.toBeInTheDocument();
  });

  it("CPU-AC03: renders the four blocks, the portrait and the grade in English", () => {
    render(<ProfileSection locale="en" idScope="" />);
    expect(headings(3)).toEqual(["Summary", "Education", "Languages", "Recognition"]);
    expect(screen.getByRole("img", { name: "Juan Esteban Álvarez García" })).toBeInTheDocument();
    expect(screen.getByText("GPA: 4.2/5.0")).toBeInTheDocument();
  });

  it("CPU-AC04: renders the periods inside time elements, in each language", () => {
    const spanish = render(<ProfileSection locale="es" idScope="" />);
    expect(spanish.container.textContent).toContain(`Ene. 2022${NBSP}– dic. 2026`);
    expect(spanish.container.textContent).toContain(`Feb.${NBSP}– jul. 2025`);
    expect(
      [...spanish.container.querySelectorAll("time")].map((time) => time.getAttribute("datetime")),
    ).toEqual(["2022-01", "2026-12", "2025-02", "2025-07"]);
    spanish.unmount();

    const english = render(<ProfileSection locale="en" idScope="" />);
    expect(english.container.textContent).toContain(`Jan. 2022${NBSP}– Dec. 2026`);
    expect(english.container.textContent).toContain(`Feb.${NBSP}– Jul. 2025`);
  });

  it("CPU-AC05: shows the thirteen courses in a paragraph, with no disclosure and no graduation", () => {
    const spanish = render(<ProfileSection locale="es" idScope="" />);
    expect(spanish.container.querySelector("details")).toBeNull();
    const courses = screen.getByText(/^Cursos relevantes: /);
    expect(courses.tagName).toBe("P");
    expect(courses.textContent).toMatch(
      /^Cursos relevantes: Programación Orientada a Objetos; .+; Análisis con Deep Learning\.$/,
    );
    expect(courses.textContent.split("; ")).toHaveLength(13);
    expect(spanish.container.textContent).not.toContain("2027");
    spanish.unmount();

    render(<ProfileSection locale="en" idScope="" />);
    expect(screen.getByText(/^Relevant coursework: /).textContent).toMatch(
      /^Relevant coursework: Object-Oriented Programming; .+; Deep Learning Analysis\.$/,
    );
  });

  it("offers the résumé of the language of the page and links to the projects", () => {
    render(<ProfileSection locale="es" idScope="" />);
    const download = screen.getByRole("link", { name: "Descargar CV (PDF)" });
    expect(download).toHaveAttribute("href", "/cv/juan-esteban-alvarez-garcia-cv-es.pdf");
    expect(download).toHaveAttribute("download");
    expect(screen.getByRole("link", { name: "Ver los proyectos" })).toHaveAttribute(
      "href",
      "/es/projects/",
    );
    expect(screen.getByText("Remoto a nivel mundial", { exact: false })).toBeInTheDocument();
  });
});
