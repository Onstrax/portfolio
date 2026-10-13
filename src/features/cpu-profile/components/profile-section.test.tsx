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
    expect(screen.getByText("Graduación prevista: 2027")).toBeInTheDocument();
  });

  it("CPU-AC03: renders the four blocks, the portrait and the grade in English", () => {
    render(<ProfileSection locale="en" idScope="" />);
    expect(headings(3)).toEqual(["Summary", "Education", "Languages", "Recognition"]);
    expect(screen.getByRole("img", { name: "Juan Esteban Álvarez García" })).toBeInTheDocument();
    expect(screen.getByText("GPA: 4.2/5.0")).toBeInTheDocument();
  });

  it("CPU-AC04: renders the periods inside time elements, in each language", () => {
    const spanish = render(<ProfileSection locale="es" idScope="" />);
    expect(spanish.container.textContent).toContain(`Ene. 2022${NBSP}– actualidad`);
    expect(spanish.container.textContent).toContain(`Feb.${NBSP}– jul. 2025`);
    expect(
      [...spanish.container.querySelectorAll("time")].map((time) => time.getAttribute("datetime")),
    ).toEqual(["2022-01", "2025-02", "2025-07"]);
    spanish.unmount();

    const english = render(<ProfileSection locale="en" idScope="" />);
    expect(english.container.textContent).toContain(`Jan. 2022${NBSP}– present`);
    expect(english.container.textContent).toContain(`Feb.${NBSP}– Jul. 2025`);
  });

  it("CPU-AC05: keeps the courses inside a closed disclosure that says how many there are", () => {
    const spanish = render(<ProfileSection locale="es" idScope="" />);
    const details = spanish.container.querySelector("details");
    expect(details).not.toHaveAttribute("open");
    expect(details?.querySelector("summary")).toHaveTextContent("Cursos relevantes (10)");
    expect(details?.querySelectorAll("li")).toHaveLength(10);
    spanish.unmount();

    const english = render(<ProfileSection locale="en" idScope="" />);
    expect(english.container.querySelector("summary")).toHaveTextContent(
      "Relevant coursework (10)",
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
    expect(
      screen.getByText("Disponible desde enero de 2027", { exact: false }),
    ).toBeInTheDocument();
  });
});
