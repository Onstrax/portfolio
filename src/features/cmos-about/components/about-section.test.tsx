import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AboutSection } from "./about-section";

describe("AboutSection", () => {
  it("CMOS-AC04: renders the four blocks, the seven stack chips and the repository link", () => {
    render(<AboutSection locale="es" idScope="" view="simple" />);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Cómo se construyó",
      "Stack",
      "Lo que no se ve",
      "La imagen",
    ]);
    const stack = screen.getByRole("heading", { level: 3, name: "Stack" }).parentElement;
    expect(stack?.querySelectorAll("li")).toHaveLength(7);

    const repository = screen.getByRole("link", { name: /Código y especificaciones en GitHub/ });
    expect(repository).toHaveAttribute("href", "https://github.com/Onstrax/portfolio");
    expect(repository).toHaveAttribute("target", "_blank");
    expect(repository).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("CMOS-AC04: renders the same structure in English", () => {
    render(<AboutSection locale="en" idScope="" view="simple" />);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "How it was built",
      "Stack",
      "What you do not see",
      "The image",
    ]);
    expect(
      screen.getByRole("link", { name: /Code and specifications on GitHub/ }),
    ).toBeInTheDocument();
  });

  it("declares the use of AI in the development and in the images", () => {
    render(<AboutSection locale="es" idScope="" view="simple" />);
    expect(
      screen.getByText(
        "Desarrollado con asistencia de IA, con las especificaciones como fuente de verdad.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/su versión en boceto se generaron con IA/)).toBeInTheDocument();
  });
});
